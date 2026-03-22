import { describe, it, expect, beforeAll } from "vitest";
import {
  checkUserByEmail,
  registerUser,
  loginUser,
  updateUserPassword,
} from "./_core/authService";
import { hashPassword, verifyPassword } from "./_core/passwordUtils";

describe("Authentication System", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123";
  const testName = "Test User";

  describe("Password Utilities", () => {
    it("should hash password with salt", () => {
      const hash = hashPassword(testPassword);
      expect(hash).toContain(":");
      const [salt, hashedPart] = hash.split(":");
      expect(salt).toBeTruthy();
      expect(hashedPart).toBeTruthy();
    });

    it("should verify correct password", () => {
      const hash = hashPassword(testPassword);
      const isValid = verifyPassword(testPassword, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", () => {
      const hash = hashPassword(testPassword);
      const isValid = verifyPassword("WrongPassword", hash);
      expect(isValid).toBe(false);
    });

    it("should generate different hashes for same password", () => {
      const hash1 = hashPassword(testPassword);
      const hash2 = hashPassword(testPassword);
      expect(hash1).not.toBe(hash2);
      // But both should verify
      expect(verifyPassword(testPassword, hash1)).toBe(true);
      expect(verifyPassword(testPassword, hash2)).toBe(true);
    });
  });

  describe("Email Verification", () => {
    it("should return null for non-existent email", async () => {
      const user = await checkUserByEmail(`nonexistent-${Date.now()}@example.com`);
      expect(user).toBeNull();
    });
  });

  describe("User Registration", () => {
    it("should register new user successfully", async () => {
      const result = await registerUser(testEmail, testPassword, testName);
      expect(result.success).toBe(true);
      expect(result.message).toContain("sucesso");
      expect(result.user).toBeDefined();
      expect(result.user?.email).toBe(testEmail);
      expect(result.user?.name).toBe(testName);
      expect(result.user?.role).toBe("user");
    });

    it("should reject duplicate email registration", async () => {
      // First registration
      await registerUser(testEmail, testPassword, testName);

      // Second registration with same email
      const result = await registerUser(testEmail, "DifferentPassword", "Different Name");
      expect(result.success).toBe(false);
      expect(result.error).toBe("USER_EXISTS");
    });

    it("should reject registration with missing fields", async () => {
      const result = await registerUser("", testPassword, testName);
      expect(result.success).toBe(false);
      expect(result.error).toBe("MISSING_FIELDS");
    });

    it("should reject registration with short password", async () => {
      const result = await registerUser(
        `short-pwd-${Date.now()}@example.com`,
        "123",
        testName
      );
      expect(result.success).toBe(false);
      expect(result.error).toBe("PASSWORD_TOO_SHORT");
    });
  });

  describe("User Login", () => {
    it("should login user with correct credentials", async () => {
      // Register first
      const uniqueEmail = `login-test-${Date.now()}@example.com`;
      await registerUser(uniqueEmail, testPassword, testName);

      // Then login
      const result = await loginUser(uniqueEmail, testPassword);
      expect(result.success).toBe(true);
      expect(result.message).toContain("sucesso");
      expect(result.user?.email).toBe(uniqueEmail);
    });

    it("should reject login with incorrect password", async () => {
      // Register first
      const uniqueEmail = `wrong-pwd-${Date.now()}@example.com`;
      await registerUser(uniqueEmail, testPassword, testName);

      // Try login with wrong password
      const result = await loginUser(uniqueEmail, "WrongPassword");
      expect(result.success).toBe(false);
      expect(result.error).toBe("INVALID_CREDENTIALS");
    });

    it("should reject login for non-existent user", async () => {
      const result = await loginUser(`nonexistent-${Date.now()}@example.com`, testPassword);
      expect(result.success).toBe(false);
      expect(result.error).toBe("INVALID_CREDENTIALS");
    });

    it("should reject login with missing credentials", async () => {
      const result = await loginUser("", testPassword);
      expect(result.success).toBe(false);
      expect(result.error).toBe("MISSING_FIELDS");
    });
  });

  describe("Password Update", () => {
    it("should update user password successfully", async () => {
      // Register first
      const uniqueEmail = `pwd-update-${Date.now()}@example.com`;
      const registerResult = await registerUser(uniqueEmail, testPassword, testName);
      const userId = registerResult.user?.id;
      expect(userId).toBeDefined();

      if (userId) {
        // Update password
        const newPassword = "NewPassword456";
        const updateResult = await updateUserPassword(userId, newPassword);
        expect(updateResult.success).toBe(true);

        // Verify old password doesn't work
        const oldLoginResult = await loginUser(uniqueEmail, testPassword);
        expect(oldLoginResult.success).toBe(false);

        // Verify new password works
        const newLoginResult = await loginUser(uniqueEmail, newPassword);
        expect(newLoginResult.success).toBe(true);
      }
    });

    it("should reject password update with short password", async () => {
      // Register first
      const uniqueEmail = `short-update-${Date.now()}@example.com`;
      const registerResult = await registerUser(uniqueEmail, testPassword, testName);
      const userId = registerResult.user?.id;

      if (userId) {
        const result = await updateUserPassword(userId, "123");
        expect(result.success).toBe(false);
        expect(result.error).toBe("PASSWORD_TOO_SHORT");
      }
    });
  });

  describe("Authentication Flow", () => {
    it("should complete full registration and login flow", async () => {
      const uniqueEmail = `full-flow-${Date.now()}@example.com`;
      const uniquePassword = "FullFlowPassword123";
      const uniqueName = "Full Flow User";

      // Step 1: Check email doesn't exist
      const checkResult = await checkUserByEmail(uniqueEmail);
      expect(checkResult).toBeNull();

      // Step 2: Register user
      const registerResult = await registerUser(uniqueEmail, uniquePassword, uniqueName);
      expect(registerResult.success).toBe(true);
      expect(registerResult.user?.id).toBeDefined();

      // Step 3: Verify user exists
      const checkAfterRegister = await checkUserByEmail(uniqueEmail);
      expect(checkAfterRegister).toBeDefined();
      expect(checkAfterRegister?.email).toBe(uniqueEmail);

      // Step 4: Login with correct password
      const loginResult = await loginUser(uniqueEmail, uniquePassword);
      expect(loginResult.success).toBe(true);
      expect(loginResult.user?.email).toBe(uniqueEmail);

      // Step 5: Update password
      const newPassword = "UpdatedPassword456";
      const updateResult = await updateUserPassword(
        registerResult.user!.id,
        newPassword
      );
      expect(updateResult.success).toBe(true);

      // Step 6: Login with new password
      const newLoginResult = await loginUser(uniqueEmail, newPassword);
      expect(newLoginResult.success).toBe(true);
    });
  });
});
