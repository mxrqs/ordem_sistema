import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { orders, orderItems, checklists, notifications, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendEmailNotification, getStatusChangeMessage, getPdfAttachedMessage } from "./_core/email";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  orders: router({
    // Create a new order (OS or OC)
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["OS", "OC"]),
        title: z.string().min(1),
        description: z.string().optional(),
        items: z.array(z.object({
          description: z.string(),
          quantity: z.number().int().positive(),
          unitValue: z.string().optional(),
        })).optional(),
        totalValue: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        try {
          const result = await db.insert(orders).values({
            userId: ctx.user.id,
            type: input.type,
            title: input.title,
            description: input.description,
            totalValue: input.totalValue || null,
          });

          const orderId = (result as any).insertId;

          // Insert order items if provided
          if (input.items && input.items.length > 0) {
            for (const item of input.items) {
              await db.insert(orderItems).values({
                orderId,
                description: item.description,
                quantity: item.quantity,
                unitValue: item.unitValue || null,
              });
            }
          }

          return { id: orderId, message: "Order created successfully" };
        } catch (error) {
          console.error("Error creating order:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create order" });
        }
      }),

    // Get user's orders
    myOrders: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(orders).where(eq(orders.userId, ctx.user.id));
    }),

    // Get all orders with user info (admin only)
    all: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const db = await getDb();
      if (!db) return [];
      const allOrders = await db.select().from(orders);
      // Fetch user info for each order
      const ordersWithUser = await Promise.all(
        allOrders.map(async (order) => {
          const userResult = await db.select().from(users).where(eq(users.id, order.userId)).limit(1);
          return {
            ...order,
            userName: userResult.length > 0 ? userResult[0].name : "Desconhecido",
            userEmail: userResult.length > 0 ? userResult[0].email : null,
          };
        })
      );
      return ordersWithUser;
    }),

    // Update order status (admin only)
    updateStatus: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["not_started", "in_process", "completed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          const orderResult = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
          if (orderResult.length === 0) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
          }

          const orderData = orderResult[0];
          
          await db.update(orders).set({ status: input.status }).where(eq(orders.id, input.orderId));

          // Send email notification
          const userResult = await db.select().from(users).where(eq(users.id, orderData.userId)).limit(1);
          if (userResult.length > 0) {
            const user = userResult[0];
            if (user.email) {
              const message = getStatusChangeMessage(user.name || "User", orderData.type, orderData.title, input.status);
              await sendEmailNotification(user.email, `Atualização de Ordem: ${orderData.title}`, message);
            }
          }

          return { success: true };
        } catch (error) {
          console.error("Error updating order status:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    // Upload PDF for order (admin only)
    uploadPdf: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        pdfBase64: z.string(),
        fileName: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          // Convert base64 to buffer
          const buffer = Buffer.from(input.pdfBase64, "base64");
          const fileKey = `orders/${input.orderId}/${input.fileName}`;

          // Upload to S3
          const { url } = await storagePut(fileKey, buffer, "application/pdf");

          // Update order with PDF URL
          const orderResult = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
          if (orderResult.length === 0) {
            throw new TRPCError({ code: "NOT_FOUND" });
          }

          const orderData = orderResult[0];
          await db.update(orders).set({
            pdfUrl: url,
            pdfKey: fileKey,
          }).where(eq(orders.id, input.orderId));

          // Send email notification about PDF
          const userResult = await db.select().from(users).where(eq(users.id, orderData.userId)).limit(1);
          if (userResult.length > 0) {
            const user = userResult[0];
            if (user.email) {
              const message = getPdfAttachedMessage(user.name || "User", orderData.type, orderData.title);
              await sendEmailNotification(user.email, `PDF Disponível: ${orderData.title}`, message);
            }
          }

          return { url, success: true };
        } catch (error) {
          console.error("Error uploading PDF:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to upload PDF" });
        }
      }),
  }),

  checklists: router({
    // Get user's checklists
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(checklists).where(eq(checklists.userId, ctx.user.id));
    }),

    // Create checklist item
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          const result = await db.insert(checklists).values({
            userId: ctx.user.id,
            title: input.title,
            description: input.description,
            dueDate: input.dueDate,
          });

          return { id: (result as any).insertId, success: true };
        } catch (error) {
          console.error("Error creating checklist:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    // Toggle checklist item completion
    toggle: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          const item = await db.select().from(checklists).where(eq(checklists.id, input.id)).limit(1);
          if (item.length === 0) throw new TRPCError({ code: "NOT_FOUND" });

          await db.update(checklists).set({
            completed: !item[0].completed,
          }).where(eq(checklists.id, input.id));

          return { success: true };
        } catch (error) {
          console.error("Error toggling checklist:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    // Delete checklist item
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          await db.delete(checklists).where(eq(checklists.id, input.id));
          return { success: true };
        } catch (error) {
          console.error("Error deleting checklist:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
  }),

  admin: router({
    // Get dashboard stats
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) return { totalOrders: 0, byMonth: {}, topUser: null };

      try {
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

        let topUser = null;
        let maxOrders = 0;
        for (const [userId, count] of Object.entries(userOrderCounts)) {
          if (count > maxOrders) {
            maxOrders = count;
            const userResult = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
            if (userResult.length > 0) {
              topUser = { user: userResult[0], orderCount: count };
            }
          }
        }

        return { totalOrders, byMonth, topUser };
      } catch (error) {
        console.error("Error fetching admin stats:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
