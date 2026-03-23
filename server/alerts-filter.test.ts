import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users, orders, maintenanceAlerts } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

describe("Pending Alerts Filter", () => {
  let db: any;
  let testUserId: number;
  let testOrderId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Create test user
    const userResult = await db
      .insert(users)
      .values({
        openId: `test-user-${Date.now()}`,
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
        loginMethod: "email",
        role: "user",
        passwordHash: null,
        lastSignedIn: new Date(),
      })
      .$returningId();

    testUserId = userResult[0].id;

    // Create test OS order
    const orderResult = await db
      .insert(orders)
      .values({
        userId: testUserId,
        type: "OS",
        title: "Test Service Order",
        description: "Test description",
        status: "in_process",
        placa: "TEST-PLATE-001",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .$returningId();

    testOrderId = orderResult[0].id;
  });

  afterAll(async () => {
    if (!db) return;

    // Clean up test data
    await db
      .delete(maintenanceAlerts)
      .where(eq(maintenanceAlerts.placa, "TEST-PLATE-001"));

    await db.delete(orders).where(eq(orders.id, testOrderId));

    await db.delete(users).where(eq(users.id, testUserId));
  });

  it("should create a maintenance alert for a vehicle", async () => {
    const alertResult = await db
      .insert(maintenanceAlerts)
      .values({
        orderId: testOrderId,
        placa: "TEST-PLATE-001",
        description: "Check suspension",
        status: "pending",
        createdAt: new Date(),
      })
      .$returningId();

    expect(alertResult[0].id).toBeDefined();

    // Verify alert was created
    const alerts = await db
      .select()
      .from(maintenanceAlerts)
      .where(eq(maintenanceAlerts.placa, "TEST-PLATE-001"));

    expect(alerts).toHaveLength(1);
    expect(alerts[0].description).toBe("Check suspension");
    expect(alerts[0].status).toBe("pending");
  });

  it("should count pending alerts for a vehicle plate", async () => {
    // Create multiple alerts
    await db.insert(maintenanceAlerts).values({
      orderId: testOrderId,
      placa: "TEST-PLATE-001",
      description: "Alert 1",
      status: "pending",
      createdAt: new Date(),
    });

    await db.insert(maintenanceAlerts).values({
      orderId: testOrderId,
      placa: "TEST-PLATE-001",
      description: "Alert 2",
      status: "pending",
      createdAt: new Date(),
    });

    // Count pending alerts
    const alerts = await db
      .select()
      .from(maintenanceAlerts)
      .where(
        and(
          eq(maintenanceAlerts.placa, "TEST-PLATE-001"),
          eq(maintenanceAlerts.status, "pending")
        )
      );

    expect(alerts.length).toBeGreaterThanOrEqual(2);
  });

  it("should not count resolved alerts as pending", async () => {
    // Create a resolved alert
    await db.insert(maintenanceAlerts).values({
      orderId: testOrderId,
      placa: "TEST-PLATE-002",
      description: "Resolved alert",
      status: "resolved",
      createdAt: new Date(),
    });

    // Count pending alerts (should be 0 for this plate)
    const pendingAlerts = await db
      .select()
      .from(maintenanceAlerts)
      .where(
        and(
          eq(maintenanceAlerts.placa, "TEST-PLATE-002"),
          eq(maintenanceAlerts.status, "pending")
        )
      );

    expect(pendingAlerts).toHaveLength(0);

    // Clean up
    await db
      .delete(maintenanceAlerts)
      .where(eq(maintenanceAlerts.placa, "TEST-PLATE-002"));
  });

  it("should filter orders with pending alerts", async () => {
    // Get all orders for the test user
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, testUserId));

    // For each OS order, check if it has pending alerts
    const ordersWithAlerts = await Promise.all(
      userOrders.map(async (order) => {
        if (order.type === "OS" && order.placa) {
          const alerts = await db
            .select()
            .from(maintenanceAlerts)
            .where(
              and(
                eq(maintenanceAlerts.placa, order.placa),
                eq(maintenanceAlerts.status, "pending")
              )
            );
          return {
            ...order,
            pendingAlertsCount: alerts.length,
          };
        }
        return {
          ...order,
          pendingAlertsCount: 0,
        };
      })
    );

    // Filter only orders with pending alerts
    const filteredOrders = ordersWithAlerts.filter(
      (order) => order.pendingAlertsCount > 0
    );

    // Should have at least one order with pending alerts
    expect(filteredOrders.length).toBeGreaterThan(0);
    expect(filteredOrders[0].pendingAlertsCount).toBeGreaterThan(0);
  });
});
