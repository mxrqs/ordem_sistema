import crypto from "crypto";

/**
 * Hash a password using PBKDF2
 * @param password - Plain text password
 * @returns Hashed password with salt
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a password against a hash
 * @param password - Plain text password to verify
 * @param hash - Stored hash from database (salt:hash format)
 * @returns true if password matches, false otherwise
 */
export function verifyPassword(password: string, hash: string): boolean {
  const [salt, storedHash] = hash.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const computedHash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");

  return computedHash === storedHash;
}
