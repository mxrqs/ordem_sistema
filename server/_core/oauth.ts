import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // OAuth callback - handles the OAuth response from Manus
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/my-orders");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.redirect(302, "/?error=oauth_failed");
    }
  });

  // OAuth login endpoints - redirect to Manus OAuth portal
  const providers = ["email", "phone"];
  
  for (const provider of providers) {
    app.get(`/api/oauth/${provider}`, (req: Request, res: Response) => {
      try {
        // Get the origin from request headers
        const protocol = req.get("x-forwarded-proto") || "http";
        const host = req.get("x-forwarded-host") || req.get("host") || "localhost:3000";
        const origin = `${protocol}://${host}`;
        
        const redirectUri = `${origin}/api/oauth/callback`;
        const state = Buffer.from(redirectUri).toString("base64");
        
        // Build OAuth URL
        const oauthUrl = new URL(`${ENV.oauthPortalUrl}/oauth/authorize`);
        oauthUrl.searchParams.set("client_id", ENV.appId);
        oauthUrl.searchParams.set("redirect_uri", redirectUri);
        oauthUrl.searchParams.set("state", state);
        oauthUrl.searchParams.set("provider", provider);
        oauthUrl.searchParams.set("response_type", "code");
        
        console.log(`[OAuth] Redirecting to ${provider} with URL:`, oauthUrl.toString());
        res.redirect(302, oauthUrl.toString());
      } catch (error) {
        console.error(`[OAuth] ${provider} redirect failed:`, error);
        res.redirect(302, "/?error=oauth_redirect_failed");
      }
    });
  }

  // Google OAuth endpoint - redirect to email login as fallback
  app.get("/api/oauth/google", (req: Request, res: Response) => {
    try {
      const protocol = req.get("x-forwarded-proto") || "http";
      const host = req.get("x-forwarded-host") || req.get("host") || "localhost:3000";
      const origin = `${protocol}://${host}`;
      
      // Redirect to email login
      res.redirect(302, `${origin}/api/oauth/email`);
    } catch (error) {
      console.error("[OAuth] Google redirect failed:", error);
      res.redirect(302, "/?error=oauth_redirect_failed");
    }
  });
}
