import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import * as db from "../db";
import {
  checkUserByEmail,
  registerUser,
  loginUser,
} from "./authService";

export function registerAuthRoutes(app: Express) {
  /**
   * POST /api/auth/check-email
   * Check if email exists in database
   * Body: { email: string }
   * Response: { exists: boolean, user?: { id, email, name, role } }
   */
  app.post("/api/auth/check-email", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email || typeof email !== "string") {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      const user = await checkUserByEmail(email);

      if (user) {
        res.json({
          exists: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      } else {
        res.json({ exists: false });
      }
    } catch (error) {
      console.error("[Auth] Check email failed:", error);
      res.status(500).json({ error: "Failed to check email" });
    }
  });

  /**
   * POST /api/auth/register
   * Register a new user (first access)
   * Body: { email: string, password: string, name: string }
   * Response: { success: boolean, message: string, user?: {...} }
   */
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      // Validate inputs
      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          error: "Email, password, and name are required",
        });
        return;
      }

      // Register user
      const authResponse = await registerUser(email, password, name);

      if (!authResponse.success) {
        res.status(400).json(authResponse);
        return;
      }

      // Create session token using the user's actual openId
      if (authResponse.user?.email) {
        const user = await db.getUserByEmail(authResponse.user.email);
        if (user) {
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: authResponse.user.name || email,
            expiresInMs: ONE_YEAR_MS,
          });

          // Set session cookie
          const cookieOptions = getSessionCookieOptions(req);
          res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: ONE_YEAR_MS,
          });
        }
      }

      res.json(authResponse);
    } catch (error) {
      console.error("[Auth] Registration failed:", error);
      res.status(500).json({
        success: false,
        error: "Registration failed",
      });
    }
  });

  /**
   * POST /api/auth/login
   * Login user with email and password
   * Body: { email: string, password?: string }
   * Response: { success: boolean, message: string, user?: {...} }
   */
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate inputs
      if (!email) {
        res.status(400).json({
          success: false,
          error: "Email is required",
        });
        return;
      }

      // Login user
      const authResponse = await loginUser(email, password);

      if (!authResponse.success) {
        res.status(401).json(authResponse);
        return;
      }

      // Create session token using the user's actual openId
      if (authResponse.user?.email) {
        const user = await db.getUserByEmail(authResponse.user.email);
        if (user) {
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: authResponse.user.name || email,
            expiresInMs: ONE_YEAR_MS,
          });

          // Set session cookie
          const cookieOptions = getSessionCookieOptions(req);
          res.cookie(COOKIE_NAME, sessionToken, {
            ...cookieOptions,
            maxAge: ONE_YEAR_MS,
          });
        }
      }

      res.json(authResponse);
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({
        success: false,
        error: "Login failed",
      });
    }
  });

  /**
   * POST /api/auth/logout
   * Logout user and clear session
   */
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    try {
      const cookieOptions = getSessionCookieOptions(req);
      res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      res.json({ success: true, message: "Logout successful" });
    } catch (error) {
      console.error("[Auth] Logout failed:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });
}
