import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

type AuthenticatedUser = User;

function createUserContext(role: "user" | "admin" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("orders router", () => {
  describe("create", () => {
    it("should create an order for authenticated user", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.orders.create({
        type: "OS",
        title: "Test Service Order",
        description: "Test description",
        totalValue: "100.00",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("message");
      expect(result.message).toBe("Order created successfully");
    });
  });

  describe("myOrders", () => {
    it("should return user's orders", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.orders.myOrders();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("all", () => {
    it("should return all orders for admin", async () => {
      const { ctx } = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.orders.all();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should throw error for non-admin user", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.orders.all();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });

  describe("updateStatus", () => {
    it("should throw error for non-admin user", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.orders.updateStatus({
          orderId: 999,
          status: "completed",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});

describe("checklists router", () => {
  describe("create", () => {
    it("should create a checklist item", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.checklists.create({
        title: "Test Task",
        description: "Test description",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });
  });

  describe("list", () => {
    it("should return user's checklists", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.checklists.list();

      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe("admin router", () => {
  describe("stats", () => {
    it("should return stats for admin", async () => {
      const { ctx } = createUserContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.admin.stats();

      expect(result).toHaveProperty("totalOrders");
      expect(result).toHaveProperty("byMonth");
      expect(result).toHaveProperty("topUser");
      expect(typeof result.totalOrders).toBe("number");
    });

    it("should throw error for non-admin user", async () => {
      const { ctx } = createUserContext("user");
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.admin.stats();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("FORBIDDEN");
      }
    });
  });
});
