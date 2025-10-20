import { Router } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import { ok, created, fail } from "../utils/sendResponse.js";
import {
  signAccessToken,
  createRawRefreshToken,
  persistRefreshToken,
  rotateRefreshToken,
  findTokenByJti,
  validateStoredRefreshToken
} from "../utils/jwt.js";
import requireAuth from "../middleware/requireAuth.js";
import Store from "../models/Store.js";

const router = Router();

function cookieOptions() {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,             // HTTPS only in prod
    sameSite: isProd ? "none" : "lax",
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 30 // 30d
  };
}

function authUserShape(user) {
  return {
    authUserId: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  };
}

/** POST /auth/signup */
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) return fail(res, 400, "All fields are required");

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return fail(res, 409, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email: email.toLowerCase(), passwordHash });
    await Store.create({ name: `${username}'s Store`, ownerId: user._id, isActive: true });

    const access = signAccessToken(user);
    const refreshRaw = createRawRefreshToken();
    const jti = uuidv4();
    await persistRefreshToken(user._id, refreshRaw, jti, process.env.REFRESH_TOKEN_TTL || "30d");

    res.cookie(process.env.COOKIE_NAME || "rt", `${jti}.${refreshRaw}`, cookieOptions());
    return created(res, { authUser: authUserShape(user), jwtToken: access }, "User registered");
  } catch (err) {
    console.error(err);
    return fail(res, 500, "Internal Server Error");
  }
});

/** POST /auth/login */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return fail(res, 400, "Email and password are required");

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return fail(res, 401, "Invalid credentials");

    const okPass = await bcrypt.compare(password, user.passwordHash);
    if (!okPass) return fail(res, 401, "Invalid credentials");

    const access = signAccessToken(user);
    const refreshRaw = createRawRefreshToken();
    const jti = uuidv4();
    await persistRefreshToken(user._id, refreshRaw, jti, process.env.REFRESH_TOKEN_TTL || "30d");

    res.cookie(process.env.COOKIE_NAME || "rt", `${jti}.${refreshRaw}`, cookieOptions());
    return ok(res, { authUser: authUserShape(user), jwtToken: access }, "Logged in");
  } catch (err) {
    console.error(err);
    return fail(res, 500, "Internal Server Error");
  }
});

/** POST /auth/refresh  (uses HTTP-only cookie) */
router.post("/refresh", async (req, res) => {
  try {
    const cookieName = process.env.COOKIE_NAME || "rt";
    const rawCookie = req.cookies?.[cookieName];
    if (!rawCookie) return fail(res, 401, "Missing refresh token");

    const [jti, rawToken] = rawCookie.split(".");
    const stored = await findTokenByJti(jti);
    const valid = await validateStoredRefreshToken(stored, rawToken);

    if (!valid) {
      // token reuse or invalid -> hard revoke all existing tokens by marking user
      if (stored?.userId) {
        await User.updateOne({ _id: stored.userId }, { $set: { tokenCompromisedAt: new Date() } });
      }
      res.clearCookie(cookieName, cookieOptions());
      return fail(res, 401, "Invalid refresh token");
    }

    const user = await User.findById(stored.userId);
    if (!user) {
      res.clearCookie(cookieName, cookieOptions());
      return fail(res, 401, "User not found");
    }

    // rotate
    const nextRaw = createRawRefreshToken();
    const nextJti = uuidv4();
    await rotateRefreshToken(jti, nextJti);
    await persistRefreshToken(user._id, nextRaw, nextJti, process.env.REFRESH_TOKEN_TTL || "30d");
    res.cookie(cookieName, `${nextJti}.${nextRaw}`, cookieOptions());

    const access = signAccessToken(user);
    return ok(res, { authUser: authUserShape(user), jwtToken: access }, "Token refreshed");
  } catch (err) {
    console.error(err);
    return fail(res, 500, "Internal Server Error");
  }
});

/** POST /auth/logout  (clears cookie & revokes current token) */
router.post("/logout", async (req, res) => {
  try {
    const cookieName = process.env.COOKIE_NAME || "rt";
    const rawCookie = req.cookies?.[cookieName];
    if (rawCookie) {
      const [jti] = rawCookie.split(".");
      // best-effort revoke
      await rotateRefreshToken(jti, `revoked:${Date.now()}`);
    }
    res.clearCookie(cookieName, cookieOptions());
    return ok(res, {}, "Logged out");
  } catch (err) {
    console.error(err);
    return fail(res, 500, "Internal Server Error");
  }
});

/** GET /auth/me  (protected) */
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.auth.uid);
  if (!user) return fail(res, 404, "Not found");
  return ok(res, { authUser: authUserShape(user) });
});

export default router;
