import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orders, checklists } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    // Handle passwordHash separately since it's a text field
    if (user.passwordHash !== undefined) {
      values.passwordHash = user.passwordHash;
      updateSet.passwordHash = user.passwordHash;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserPassword(
  userId: number,
  passwordHash: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    await db.update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user password:", error);
    throw error;
  }
}

export async function updateUserLastSignedIn(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user: database not available");
    return;
  }

  try {
    await db.update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update user last signed in:", error);
    throw error;
  }
}

export async function getOrdersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders).where(eq(orders.userId, userId));
}

export async function getOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orders);
}

export async function getChecklistsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checklists).where(eq(checklists.userId, userId));
}

export async function getOrderStats() {
  const db = await getDb();
  if (!db) return { totalOrders: 0, byMonth: [], topUser: null };
  
  const allOrders = await db.select().from(orders);
  const totalOrders = allOrders.length;
  
  // Group by month
  const byMonth: Record<string, number> = {};
  allOrders.forEach(order => {
    const month = new Date(order.createdAt).toISOString().slice(0, 7);
    byMonth[month] = (byMonth[month] || 0) + 1;
  });
  
  // Find top user
  const userOrderCounts: Record<number, number> = {};
  allOrders.forEach(order => {
    userOrderCounts[order.userId] = (userOrderCounts[order.userId] || 0) + 1;
  });
  
  let topUserId = null;
  let maxOrders = 0;
  for (const [userId, count] of Object.entries(userOrderCounts)) {
    if (count > maxOrders) {
      maxOrders = count;
      topUserId = parseInt(userId);
    }
  }
  
  let topUser = null;
  if (topUserId) {
    const result = await db.select().from(users).where(eq(users.id, topUserId)).limit(1);
    topUser = result.length > 0 ? result[0] : null;
  }
  
  return { totalOrders, byMonth, topUser };
}

// TODO: add feature queries here as your schema grows.
