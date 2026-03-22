import * as db from "../db";
import { hashPassword, verifyPassword } from "./passwordUtils";

/**
 * Response type for authentication operations
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
  error?: string;
}

/**
 * Check if a user exists by email
 * @param email - User email to check
 * @returns User if exists, null otherwise
 */
export async function checkUserByEmail(email: string) {
  const user = await db.getUserByEmail(email);
  return user || null;
}

/**
 * Register a new user (first access)
 * @param email - User email
 * @param password - Plain text password
 * @param name - User name
 * @returns AuthResponse with success status
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  try {
    // Check if user already exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return {
        success: false,
        message: "Usuário já existe com este email",
        error: "USER_EXISTS",
      };
    }

    // Validate inputs
    if (!email || !password || !name) {
      return {
        success: false,
        message: "Email, senha e nome são obrigatórios",
        error: "MISSING_FIELDS",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "Senha deve ter no mínimo 6 caracteres",
        error: "PASSWORD_TOO_SHORT",
      };
    }

    // Hash the password
    const passwordHash = hashPassword(password);

    // Create openId from email
    const openId = `email_${email.replace(/[^a-z0-9]/gi, "_")}`;

    // Create user in database
    await db.upsertUser({
      openId,
      name,
      email,
      passwordHash,
      loginMethod: "email",
      lastSignedIn: new Date(),
    });

    // Get the created user
    const newUser = await db.getUserByEmail(email);

    if (!newUser) {
      return {
        success: false,
        message: "Erro ao criar usuário",
        error: "USER_CREATION_FAILED",
      };
    }

    return {
      success: true,
      message: "Usuário registrado com sucesso",
      user: {
        id: newUser.id,
        email: newUser.email || "",
        name: newUser.name || "",
        role: newUser.role,
      },
    };
  } catch (error) {
    console.error("[AuthService] Registration error:", error);
    return {
      success: false,
      message: "Erro ao registrar usuário",
      error: "REGISTRATION_ERROR",
    };
  }
}

/**
 * Login user with email and password
 * @param email - User email
 * @param password - Plain text password (optional for users without passwordHash)
 * @returns AuthResponse with success status
 */
export async function loginUser(
  email: string,
  password?: string
): Promise<AuthResponse> {
  try {
    // Validate email
    if (!email) {
      return {
        success: false,
        message: "Email é obrigatório",
        error: "MISSING_FIELDS",
      };
    }

    // Find user by email
    const user = await db.getUserByEmail(email);

    if (!user) {
      return {
        success: false,
        message: "Email ou senha incorretos",
        error: "INVALID_CREDENTIALS",
      };
    }

    // If user has a password, require and verify it
    if (user.passwordHash) {
      if (!password) {
        return {
          success: false,
          message: "Senha é obrigatória",
          error: "MISSING_PASSWORD",
        };
      }

      // Verify password
      if (!verifyPassword(password, user.passwordHash)) {
        return {
          success: false,
          message: "Email ou senha incorretos",
          error: "INVALID_CREDENTIALS",
        };
      }
    } else {
      // User doesn't have password set yet (e.g., admin created manually)
      // Allow login without password - they can set it later
      // This supports the flow where admin is created without password
    }

    // Update last signed in
    await db.updateUserLastSignedIn(user.id);

    return {
      success: true,
      message: "Login realizado com sucesso",
      user: {
        id: user.id,
        email: user.email || "",
        name: user.name || "",
        role: user.role,
      },
    };
  } catch (error) {
    console.error("[AuthService] Login error:", error);
    return {
      success: false,
      message: "Erro ao fazer login",
      error: "LOGIN_ERROR",
    };
  }
}

/**
 * Update user password
 * @param userId - User ID
 * @param newPassword - New plain text password
 * @returns AuthResponse with success status
 */
export async function updateUserPassword(
  userId: number,
  newPassword: string
): Promise<AuthResponse> {
  try {
    // Validate password
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: "Senha deve ter no mínimo 6 caracteres",
        error: "PASSWORD_TOO_SHORT",
      };
    }

    // Hash the new password
    const passwordHash = hashPassword(newPassword);

    // Update user password
    await db.updateUserPassword(userId, passwordHash);

    return {
      success: true,
      message: "Senha atualizada com sucesso",
    };
  } catch (error) {
    console.error("[AuthService] Password update error:", error);
    return {
      success: false,
      message: "Erro ao atualizar senha",
      error: "PASSWORD_UPDATE_ERROR",
    };
  }
}
