import { getDb } from "./db";
import { passwordResetTokens, users } from "../drizzle/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";

/**
 * Generate a secure reset token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create a password reset token for a user
 */
export async function createPasswordResetToken(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Find user by email
  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (!user || user.length === 0) {
    // For security, don't reveal if email exists
    return null;
  }

  // Generate token
  const token = generateResetToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Store token in database
  await db.insert(passwordResetTokens).values({
    userId: user[0].id,
    token,
    expiresAt,
  });

  return { token, userId: user[0].id, email: user[0].email };
}

/**
 * Verify a password reset token
 */
export async function verifyResetToken(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const resetTokens = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.token, token),
        eq(passwordResetTokens.used, false),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!resetTokens || resetTokens.length === 0) {
    return null;
  }

  const resetToken = resetTokens[0];
  const user = await db.select().from(users).where(eq(users.id, resetToken.userId)).limit(1);

  return { ...resetToken, user: user[0] };
}

/**
 * Reset password using token
 */
export async function resetPassword(token: string, newPassword: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const resetToken = await verifyResetToken(token);

  if (!resetToken) {
    throw new Error("Invalid or expired reset token");
  }

  // Mark token as used
  await db
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.id, resetToken.id));

  // In a real implementation, you would hash the password
  // For now, we'll just update a password field if it exists
  // You may need to add a password field to the users table

  return resetToken.user;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  resetUrl: string
) {
  // In a real implementation, you would use a mail service like SendGrid, Mailgun, etc.
  // For now, we'll just log it
  console.log(`[PASSWORD RESET EMAIL] To: ${email}`);
  console.log(`Reset Link: ${resetUrl}?token=${resetToken}`);
  console.log(`This link expires in 24 hours`);

  return true;
}
