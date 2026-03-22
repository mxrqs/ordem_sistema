import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { authenticateUser, updatePassword, resetPassword } from "./authService";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Authentication Service", () => {
  let testEmail = "test@example.com";
  let testPassword = "password123";
  let userId: number | undefined;

  beforeAll(async () => {
    // Clean up any existing test user
    const db = await getDb();
    if (db) {
      await db.delete(users).where(eq(users.email, testEmail));
    }
  });

  afterAll(async () => {
    // Clean up test user
    const db = await getDb();
    if (db) {
      await db.delete(users).where(eq(users.email, testEmail));
    }
  });

  describe("authenticateUser", () => {
    it("should create new user on first login with password", async () => {
      const result = await authenticateUser({
        email: testEmail,
        password: testPassword,
        name: "Test User",
      });

      expect(result.success).toBe(true);
      expect(result.isFirstLogin).toBe(true);
      expect(result.userId).toBeDefined();
      expect(result.message).toContain("criado");

      userId = result.userId;
    });

    it("should validate password on subsequent login", async () => {
      const result = await authenticateUser({
        email: testEmail,
        password: testPassword,
      });

      expect(result.success).toBe(true);
      expect(result.isFirstLogin).toBe(false);
      expect(result.userId).toBe(userId);
      expect(result.message).toContain("sucesso");
    });

    it("should reject incorrect password", async () => {
      const result = await authenticateUser({
        email: testEmail,
        password: "wrongpassword",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("incorretos");
    });

    it("should reject missing email", async () => {
      const result = await authenticateUser({
        email: "",
        password: testPassword,
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("obrigatórios");
    });

    it("should reject missing password", async () => {
      const result = await authenticateUser({
        email: testEmail,
        password: "",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("obrigatórios");
    });

    it("should reject password shorter than 6 characters", async () => {
      const result = await authenticateUser({
        email: "short@example.com",
        password: "short",
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain("6 caracteres");
    });
  });

  describe("updatePassword", () => {
    it("should update user password", async () => {
      if (!userId) {
        throw new Error("userId not set");
      }

      const newPassword = "newpassword123";
      const result = await updatePassword(userId, newPassword);

      expect(result.success).toBe(true);
      expect(result.message).toContain("atualizada");

      // Verify new password works
      const loginResult = await authenticateUser({
        email: testEmail,
        password: newPassword,
      });

      expect(loginResult.success).toBe(true);
    });

    it("should reject password shorter than 6 characters", async () => {
      if (!userId) {
        throw new Error("userId not set");
      }

      const result = await updatePassword(userId, "short");

      expect(result.success).toBe(false);
      expect(result.message).toContain("6 caracteres");
    });
  });

  describe("resetPassword", () => {
    it("should reset password for existing user", async () => {
      const resetPassword_ = "resetpassword123";
      const result = await resetPassword(testEmail, resetPassword_);

      expect(result.success).toBe(true);
      expect(result.message).toContain("atualizada");
      expect(result.userId).toBe(userId);

      // Verify reset password works
      const loginResult = await authenticateUser({
        email: testEmail,
        password: resetPassword_,
      });

      expect(loginResult.success).toBe(true);
    });

    it("should return error for non-existent user", async () => {
      const result = await resetPassword(
        "nonexistent@example.com",
        "password123"
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain("não encontrado");
    });
  });
});
