import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { orders, users, requestHistory } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Request History Feature", () => {
  let db: any;
  let testUserId: number = 0;
  let testOrderId: number = 0;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database connection failed");

    try {
      // Create test user
      const userResult = await db.insert(users).values({
        openId: `test-user-${Date.now()}`,
        name: "Test User",
        email: `test-${Date.now()}@example.com`,
        role: "user",
        loginMethod: "oauth",
      });
      testUserId = (userResult as any)[0]?.insertId;
      if (!testUserId) {
        throw new Error("Failed to create test user");
      }

      // Create test order
      const orderResult = await db.insert(orders).values({
        userId: testUserId,
        type: "OS",
        title: "Test Order for History",
        description: "Testing history feature",
        status: "not_started",
      });
      testOrderId = (orderResult as any)[0]?.insertId;
      if (!testOrderId) throw new Error("Failed to create test order");
    } catch (error) {
      console.error("Setup error:", error);
      throw error;
    }
  });

  afterAll(async () => {
    if (!db || !testOrderId || !testUserId) return;
    try {
      await db.delete(requestHistory).where(eq(requestHistory.orderId, testOrderId));
      await db.delete(orders).where(eq(orders.id, testOrderId));
      await db.delete(users).where(eq(users.id, testUserId));
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  });

  it("should create a message entry in request history", async () => {
    if (!testOrderId || !testUserId) {
      throw new Error("Test setup failed: missing testOrderId or testUserId");
    }

    const result = await db.insert(requestHistory).values({
      orderId: testOrderId,
      userId: testUserId,
      type: "message",
      content: "Test message",
    });

    const historyId = (result as any)[0]?.insertId;
    expect(historyId).toBeGreaterThan(0);

    const entries = await db.select().from(requestHistory).where(eq(requestHistory.id, historyId));
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("message");
    expect(entries[0].content).toBe("Test message");
  });

  it("should create a system event entry in request history", async () => {
    if (!testOrderId || !testUserId) {
      throw new Error("Test setup failed: missing testOrderId or testUserId");
    }

    const result = await db.insert(requestHistory).values({
      orderId: testOrderId,
      userId: testUserId,
      type: "system_event",
      eventType: "status_changed",
      content: "Status changed from not_started to in_process",
    });

    const historyId = (result as any)[0]?.insertId;
    expect(historyId).toBeGreaterThan(0);

    const entries = await db.select().from(requestHistory).where(eq(requestHistory.id, historyId));
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("system_event");
    expect(entries[0].eventType).toBe("status_changed");
  });

  it("should create an attachment entry in request history", async () => {
    if (!testOrderId || !testUserId) {
      throw new Error("Test setup failed: missing testOrderId or testUserId");
    }

    const result = await db.insert(requestHistory).values({
      orderId: testOrderId,
      userId: testUserId,
      type: "attachment",
      fileName: "test-document.pdf",
      fileUrl: "https://example.com/test.pdf",
      fileKey: "orders/1/history/test.pdf",
      fileType: "application/pdf",
      fileSize: 1024,
    });

    const historyId = (result as any)[0]?.insertId;
    expect(historyId).toBeGreaterThan(0);

    const entries = await db.select().from(requestHistory).where(eq(requestHistory.id, historyId));
    expect(entries).toHaveLength(1);
    expect(entries[0].type).toBe("attachment");
    expect(entries[0].fileName).toBe("test-document.pdf");
    expect(entries[0].fileType).toBe("application/pdf");
  });

  it("should retrieve all history entries for an order", async () => {
    if (!testOrderId || !testUserId) {
      throw new Error("Test setup failed: missing testOrderId or testUserId");
    }

    await db.insert(requestHistory).values({
      orderId: testOrderId,
      userId: testUserId,
      type: "message",
      content: "Message 1",
    });

    await db.insert(requestHistory).values({
      orderId: testOrderId,
      userId: testUserId,
      type: "message",
      content: "Message 2",
    });

    const entries = await db.select().from(requestHistory).where(eq(requestHistory.orderId, testOrderId));
    expect(entries.length).toBeGreaterThanOrEqual(2);
    expect(entries.some((e) => e.content === "Message 1")).toBe(true);
    expect(entries.some((e) => e.content === "Message 2")).toBe(true);
  });

  it("should store attachment metadata correctly", async () => {
    if (!testOrderId || !testUserId) {
      throw new Error("Test setup failed: missing testOrderId or testUserId");
    }

    const attachmentData = {
      orderId: testOrderId,
      userId: testUserId,
      type: "attachment" as const,
      fileName: "invoice.pdf",
      fileUrl: "https://cdn.example.com/invoice.pdf",
      fileKey: "orders/1/history/invoice.pdf",
      fileType: "application/pdf",
      fileSize: 2048,
    };

    const result = await db.insert(requestHistory).values(attachmentData);
    const historyId = (result as any)[0]?.insertId;

    const entries = await db.select().from(requestHistory).where(eq(requestHistory.id, historyId));
    expect(entries[0]).toMatchObject({
      fileName: "invoice.pdf",
      fileType: "application/pdf",
      fileSize: 2048,
    });
  });

  it("should track timestamps for all history entries", async () => {
    if (!testOrderId || !testUserId) {
      throw new Error("Test setup failed: missing testOrderId or testUserId");
    }

    const result = await db.insert(requestHistory).values({
      orderId: testOrderId,
      userId: testUserId,
      type: "message",
      content: "Timestamped message",
    });

    const historyId = (result as any)[0]?.insertId;
    const entries = await db.select().from(requestHistory).where(eq(requestHistory.id, historyId));

    expect(entries[0].createdAt).toBeDefined();
    expect(entries[0].createdAt instanceof Date).toBe(true);
  });
});
