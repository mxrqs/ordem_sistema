import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { itemsUsed, maintenanceAlerts, orders } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const itemsAndAlertsRouter = router({
  // Items Used Procedures
  items: router({
    // Add item to order
    add: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        itemName: z.string().min(1),
        quantity: z.number().int().positive(),
        unit: z.string().default("un"),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify user is the requester (only requester can add items)
        const order = await db.select().from(orders).where(eq(orders.id, input.orderId));
        if (!order[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        if (order[0].userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only requester can add items" });
        }

        // Add item
        const result = await db.insert(itemsUsed).values({
          orderId: input.orderId,
          itemName: input.itemName,
          quantity: input.quantity,
          unit: input.unit,
        });

        // Update order flag
        await db.update(orders).set({ hasItemsReported: true }).where(eq(orders.id, input.orderId));

        return { success: true, message: "Item added successfully" };
      }),

    // Get items for order
    list: protectedProcedure
      .input(z.object({
        orderId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const items = await db.select().from(itemsUsed).where(eq(itemsUsed.orderId, input.orderId));
        return items;
      }),

    // Delete item
    delete: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        orderId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify user is the requester
        const order = await db.select().from(orders).where(eq(orders.id, input.orderId));
        if (!order[0]) throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
        if (order[0].userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only requester can delete items" });
        }

        await db.delete(itemsUsed).where(eq(itemsUsed.id, input.itemId));

        // Check if there are still items, if not update flag
        const remainingItems = await db.select().from(itemsUsed).where(eq(itemsUsed.orderId, input.orderId));
        if (remainingItems.length === 0) {
          await db.update(orders).set({ hasItemsReported: false }).where(eq(orders.id, input.orderId));
        }

        return { success: true, message: "Item deleted successfully" };
      }),
  }),

  // Maintenance Alerts Procedures
  alerts: router({
    // Create maintenance alert
    create: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        placa: z.string(),
        description: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db.insert(maintenanceAlerts).values({
          orderId: input.orderId,
          placa: input.placa,
          description: input.description,
        });

        return { success: true, message: "Alert created successfully" };
      }),

    // Get pending alerts for vehicle
    getByPlaca: protectedProcedure
      .input(z.object({
        placa: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const alerts = await db.select().from(maintenanceAlerts).where(
          and(
            eq(maintenanceAlerts.placa, input.placa),
            eq(maintenanceAlerts.status, "pending")
          )
        );
        return alerts;
      }),

    // Get all alerts for order
    getByOrder: protectedProcedure
      .input(z.object({
        orderId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const alerts = await db.select().from(maintenanceAlerts).where(
          eq(maintenanceAlerts.orderId, input.orderId)
        );
        return alerts;
      }),

    // Mark alert as resolved
    resolve: protectedProcedure
      .input(z.object({
        alertId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db.update(maintenanceAlerts)
          .set({ status: "resolved", resolvedAt: new Date() })
          .where(eq(maintenanceAlerts.id, input.alertId));

        return { success: true, message: "Alert marked as resolved" };
      }),

    // Delete alert
    delete: protectedProcedure
      .input(z.object({
        alertId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db.delete(maintenanceAlerts).where(eq(maintenanceAlerts.id, input.alertId));

        return { success: true, message: "Alert deleted successfully" };
      }),
  }),
});
