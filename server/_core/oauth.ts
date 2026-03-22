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
  // OAuth provider redirects - these initiate the OAuth flow
  const providers = ["microsoft", "email", "phone", "google"];
  
  for (const provider of providers) {
    app.get(`/api/oauth/${provider}`, (req: Request, res: Response) => {
      try {
        const origin = req.get("origin") || req.get("x-forwarded-proto") ? `${req.get("x-forwarded-proto")}://${req.get("host")}` : `http://localhost:3000`;
        const redirectUri = `${origin}/api/oauth/callback`;
        const state = Buffer.from(redirectUri).toString("base64");
        const oauthUrl = `${ENV.oauthPortalUrl}/authorize?client_id=${ENV.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&provider=${provider}`;
        res.redirect(302, oauthUrl);
      } catch (error) {
        console.error(`[OAuth] ${provider} redirect failed`, error);
        res.status(500).json({ error: `OAuth ${provider} redirect failed` });
      }
    });
  }

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
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
