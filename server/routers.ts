import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { orders, orderItems, checklists, notifications, users, orderPhotos } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
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
        placa: z.string().optional(),
        km: z.string().optional(),
        contrato: z.string().optional(),
        categoria: z.string().optional(),
      }))
      .output(z.object({
        id: z.number(),
        message: z.string(),
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
            placa: input.placa || null,
            km: input.km || null,
            contrato: input.contrato || null,
            categoria: input.categoria || null,
          });

          const insertedOrders = await db.select().from(orders).where(eq(orders.userId, ctx.user.id)).orderBy(desc(orders.createdAt)).limit(1);
          const orderId = insertedOrders[0]?.id;
          
          if (!orderId) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to retrieve order ID" });
          }

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
      // For admin: show all their orders
      // For regular users: only show orders where osNumber is filled
      if (ctx.user.role === "admin") {
        return db.select().from(orders).where(eq(orders.userId, ctx.user.id));
      }
      // Regular users: only see orders with osNumber filled (not null)
      const result = await db.select().from(orders).where(
        eq(orders.userId, ctx.user.id)
      );
      // Filter client-side to only show orders with osNumber
      return result.filter(order => order.osNumber !== null && order.osNumber !== "");
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

    // Update order number (OS or OC number)
    updateOrderNumber: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        osNumber: z.string().min(1),
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

          await db.update(orders).set({ osNumber: input.osNumber }).where(eq(orders.id, input.orderId));

          return { success: true };
        } catch (error) {
          console.error("Error updating order number:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),

    // Upload photos for order
    uploadPhoto: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        photoBase64: z.string(),
        fileName: z.string(),
        label: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          const buffer = Buffer.from(input.photoBase64, "base64");
          const ext = input.fileName.split(".").pop() || "jpg";
          const randomSuffix = Math.random().toString(36).substring(2, 8);
          const fileKey = `orders/${input.orderId}/photos/${Date.now()}-${randomSuffix}.${ext}`;
          const contentType = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";

          const { url } = await storagePut(fileKey, buffer, contentType);

          await db.insert(orderPhotos).values({
            orderId: input.orderId,
            url,
            fileKey,
            label: input.label || null,
          });

          return { url, success: true };
        } catch (error) {
          console.error("Error uploading photo:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to upload photo" });
        }
      }),

    // Get photos for an order
    getPhotos: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(orderPhotos).where(eq(orderPhotos.orderId, input.orderId));
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

    // Delete order (admin only)
    delete: protectedProcedure
      .input(z.object({
        orderId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          // Check if order exists
          const orderResult = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
          if (orderResult.length === 0) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
          }

          const orderData = orderResult[0];

          // Delete associated photos (cascade)
          await db.delete(orderPhotos).where(eq(orderPhotos.orderId, input.orderId));

          // Delete associated order items (cascade)
          await db.delete(orderItems).where(eq(orderItems.orderId, input.orderId));

          // Delete the order
          await db.delete(orders).where(eq(orders.id, input.orderId));

          // Send email notification about deletion
          const userResult = await db.select().from(users).where(eq(users.id, orderData.userId)).limit(1);
          if (userResult.length > 0) {
            const user = userResult[0];
            if (user.email) {
              const message = `Sua solicitacao "${orderData.title}" foi deletada pelo administrador.`;
              await sendEmailNotification(user.email, `Solicitacao Deletada: ${orderData.title}`, message);
            }
          }

          return { success: true };
        } catch (error) {
          console.error("Error deleting order:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to delete order" });
        }
      }),

    // Complete an OS with items
    completeOS: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        items: z.array(z.object({
          description: z.string().min(1),
          quantity: z.number().int().positive(),
          unitValue: z.string(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          // Check if order exists and belongs to user
          const orderResult = await db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
          if (orderResult.length === 0) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Order not found" });
          }

          const orderData = orderResult[0];
          if (orderData.userId !== ctx.user.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to complete this order" });
          }

          // Delete existing items for this order
          await db.delete(orderItems).where(eq(orderItems.orderId, input.orderId));

          // Insert new items
          for (const item of input.items) {
            await db.insert(orderItems).values({
              orderId: input.orderId,
              description: item.description,
              quantity: item.quantity,
              unitValue: item.unitValue,
            });
          }

          // Update order status to completed
          await db.update(orders).set({
            status: "completed",
          }).where(eq(orders.id, input.orderId));

          return { success: true, message: "OS finalizada com sucesso" };
        } catch (error) {
          console.error("Error completing OS:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to complete OS" });
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

    // Create vehicle checklist
    createVehicleChecklist: protectedProcedure
      .input(z.object({
        data: z.object({
          contrato: z.string(),
          veiculo: z.string(),
          placa: z.string(),
          motorista: z.string(),
          data: z.string(),
          kmInicial: z.string(),
          luzes: z.string(),
          freios: z.string(),
          pneus: z.string(),
          oleo: z.string(),
          aguaRadiador: z.string(),
          observacoes: z.string(),
          fotos: z.record(z.string(), z.string().optional()),
          assinatura: z.string().optional(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          const result = await db.insert(checklists).values({
            userId: ctx.user.id,
            title: `Checklist - ${input.data.veiculo} (${input.data.placa})`,
            description: JSON.stringify(input.data),
            completed: true,
          });

          return { id: (result as any).insertId, success: true };
        } catch (error) {
          console.error("Error creating vehicle checklist:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
  }),

  users: router({
    // List all users (admin only)
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      const db = await getDb();
      if (!db) return [];
      return db.select().from(users);
    }),

    // Update user role (admin only)
    updateRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin"]),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.update(users).set({ role: input.role }).where(eq(users.id, input.userId));
        return { success: true };
      }),

    // Delete user (admin only)
    delete: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
        }
        if (input.userId === ctx.user.id) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot delete yourself" });
        }
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        // Delete user's orders and checklists first
        await db.delete(orders).where(eq(orders.userId, input.userId));
        await db.delete(checklists).where(eq(checklists.userId, input.userId));
        await db.delete(users).where(eq(users.id, input.userId));
        return { success: true };
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
