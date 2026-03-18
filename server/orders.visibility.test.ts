import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { orders, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Order Visibility Logic", () => {
  let db: any;
  let testUserId: number;
  let testAdminId: number;
  let orderId1: number;
  let orderId2: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const userResult = await db.insert(users).values({
      openId: `test-user-${Date.now()}`,
      name: "Test User",
      email: "testuser@example.com",
      loginMethod: "test",
      role: "user",
    });
    testUserId = userResult[0]?.insertId || 1;

    // Create test admin
    const adminResult = await db.insert(users).values({
      openId: `test-admin-${Date.now()}`,
      name: "Test Admin",
      email: "testadmin@example.com",
      loginMethod: "test",
      role: "admin",
    });
    testAdminId = adminResult[0]?.insertId || 2;
  });

  afterAll(async () => {
    if (db) {
      // Cleanup test data
      await db.delete(orders).where(eq(orders.userId, testUserId));
      await db.delete(orders).where(eq(orders.userId, testAdminId));
      await db.delete(users).where(eq(users.id, testUserId));
      await db.delete(users).where(eq(users.id, testAdminId));
    }
  });

  it("should hide orders without osNumber from regular users", async () => {
    // Create order without osNumber
    const result = await db.insert(orders).values({
      userId: testUserId,
      type: "OS",
      title: "Test Order Without Number",
      description: "This order has no osNumber",
      status: "not_started",
    });
    orderId1 = result[0]?.insertId || 1;

    // Fetch orders as regular user
    const userOrders = await db.select().from(orders).where(eq(orders.userId, testUserId));
    const filtered = userOrders.filter(order => order.osNumber !== null && order.osNumber !== "");

    // Should be empty because osNumber is not filled
    expect(filtered.length).toBe(0);
  });

  it("should show orders with osNumber to regular users", async () => {
    // Create order with osNumber
    const result = await db.insert(orders).values({
      userId: testUserId,
      type: "OS",
      title: "Test Order With Number",
      description: "This order has osNumber",
      status: "not_started",
      osNumber: "OS-2024-001",
    });
    orderId2 = result[0]?.insertId || 2;

    // Fetch orders as regular user
    const userOrders = await db.select().from(orders).where(eq(orders.userId, testUserId));
    const filtered = userOrders.filter(order => order.osNumber !== null && order.osNumber !== "");

    // Should contain the order with osNumber
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.some(o => o.osNumber === "OS-2024-001")).toBe(true);
  });

  it("should show all orders to admins regardless of osNumber", async () => {
    // Create multiple orders for admin
    await db.insert(orders).values({
      userId: testAdminId,
      type: "OS",
      title: "Admin Order Without Number",
      description: "Admin order without osNumber",
      status: "not_started",
    });

    await db.insert(orders).values({
      userId: testAdminId,
      type: "OS",
      title: "Admin Order With Number",
      description: "Admin order with osNumber",
      status: "not_started",
      osNumber: "OS-2024-002",
    });

    // Fetch all orders for admin (no filtering)
    const adminOrders = await db.select().from(orders).where(eq(orders.userId, testAdminId));

    // Should show both orders (with and without osNumber)
    expect(adminOrders.length).toBeGreaterThanOrEqual(2);
  });

  it("should update visibility when osNumber is added", async () => {
    // Create order without osNumber
    const result = await db.insert(orders).values({
      userId: testUserId,
      type: "OC",
      title: "Test OC Order",
      description: "OC order initially without number",
      status: "not_started",
    });
    const newOrderId = result[0]?.insertId;

    // Initially should be hidden
    let userOrders = await db.select().from(orders).where(eq(orders.userId, testUserId));
    let filtered = userOrders.filter(order => order.osNumber !== null && order.osNumber !== "");
    const initialCount = filtered.length;

    // Update order with osNumber
    await db.update(orders).set({ osNumber: "OC-2024-001" }).where(eq(orders.id, newOrderId));

    // Now should be visible
    userOrders = await db.select().from(orders).where(eq(orders.userId, testUserId));
    filtered = userOrders.filter(order => order.osNumber !== null && order.osNumber !== "");

    // Should have one more visible order
    expect(filtered.length).toBe(initialCount + 1);
    expect(filtered.some(o => o.osNumber === "OC-2024-001")).toBe(true);
  });
});
