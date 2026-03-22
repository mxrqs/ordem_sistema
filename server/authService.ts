import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./passwordUtils";

export interface LoginCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface LoginResult {
  success: boolean;
  userId?: number;
  message: string;
  isFirstLogin?: boolean;
}

/**
 * Authenticate user with email and password
 * Rule: First password becomes the official password
 * - If user doesn't exist: create new user with hashed password
 * - If user exists without password: set password (first login)
 * - If user exists with password: validate password
 *
 * @param credentials - Email, password, and optional name
 * @returns Login result with success status and user ID
 */
export async function authenticateUser(
  credentials: LoginCredentials
): Promise<LoginResult> {
  try {
    const { email, password, name } = credentials;

    // Validate inputs
    if (!email || !password) {
      return {
        success: false,
        message: "Email e senha são obrigatórios",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        message: "Senha deve ter pelo menos 6 caracteres",
      };
    }

    const db = await getDb();
    if (!db) {
      return {
        success: false,
        message: "Banco de dados indisponível",
      };
    }

    // Check if user exists
    const existingUsers = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const existingUser = existingUsers.length > 0 ? existingUsers[0] : null;

    if (!existingUser) {
      // User doesn't exist - create new user with password (first login)
      const hashedPassword = hashPassword(password);
      await db.insert(users).values({
        email,
        name: name || email.split("@")[0],
        passwordHash: hashedPassword,
        openId: `email_${email}_${Date.now()}`, // Generate unique openId
        loginMethod: "email",
        role: "user",
      });

      // Retrieve the created user to get the ID
      const newUsers = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      const newUser = newUsers[0];

      return {
        success: true,
        userId: newUser?.id,
        message: "Usuário criado com sucesso",
        isFirstLogin: true,
      };
    }

    // User exists
    if (!existingUser.passwordHash) {
      // User exists but has no password - set password (first login)
      const hashedPassword = hashPassword(password);
      await db
        .update(users)
        .set({
          passwordHash: hashedPassword,
          lastSignedIn: new Date(),
        })
        .where(eq(users.id, existingUser.id));

      return {
        success: true,
        userId: existingUser.id,
        message: "Senha definida com sucesso",
        isFirstLogin: true,
      };
    }

    // User exists with password - validate password
    const isPasswordValid = verifyPassword(password, existingUser.passwordHash);

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Email ou senha incorretos",
      };
    }

    // Update last signed in
    await db
      .update(users)
      .set({ lastSignedIn: new Date() })
      .where(eq(users.id, existingUser.id));

    return {
      success: true,
      userId: existingUser.id,
      message: "Login realizado com sucesso",
      isFirstLogin: false,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      success: false,
      message: "Erro ao autenticar usuário",
    };
  }
}

/**
 * Update user password
 * @param userId - User ID
 * @param newPassword - New password
 * @returns Success status
 */
export async function updatePassword(
  userId: number,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: "Senha deve ter pelo menos 6 caracteres",
      };
    }

    const db = await getDb();
    if (!db) {
      return {
        success: false,
        message: "Banco de dados indisponível",
      };
    }

    const hashedPassword = hashPassword(newPassword);

    await db
      .update(users)
      .set({
        passwordHash: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: "Senha atualizada com sucesso",
    };
  } catch (error) {
    console.error("Password update error:", error);
    return {
      success: false,
      message: "Erro ao atualizar senha",
    };
  }
}

/**
 * Validate password reset token and update password
 * @param email - User email
 * @param newPassword - New password
 * @returns Success status
 */
export async function resetPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; message: string; userId?: number }> {
  try {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        message: "Banco de dados indisponível",
      };
    }

    const userList = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    const user = userList.length > 0 ? userList[0] : null;

    if (!user) {
      return {
        success: false,
        message: "Usuário não encontrado",
      };
    }

    const result = await updatePassword(user.id, newPassword);
    return {
      ...result,
      userId: user.id,
    };
  } catch (error) {
    console.error("Password reset error:", error);
    return {
      success: false,
      message: "Erro ao resetar senha",
    };
  }
}
