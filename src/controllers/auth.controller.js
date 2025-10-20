import { ok, created } from "../utils/sendResponse.js";
import { REFRESH_COOKIE_NAME, cookieOptions } from "../config/cookie.js";
import * as svc from "../services/auth.service.js";
import AppError from "../utils/AppError.js";
import requireAuth from "../middleware/requireAuth.js"; // used in routes

const shape = (u) => ({
  authUserId: u._id,
  username: u.username,
  email: u.email,
  role: u.role
});

export async function signup(req, res, next) {
  try {
    const { user, access, refreshPair } = await svc.register(req.body);
    res.cookie(REFRESH_COOKIE_NAME, `${refreshPair.jti}.${refreshPair.raw}`, cookieOptions());
    return created(res, { authUser: shape(user), jwtToken: access }, "User registered");
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { user, access, refreshPair } = await svc.login(req.body);
    res.cookie(REFRESH_COOKIE_NAME, `${refreshPair.jti}.${refreshPair.raw}`, cookieOptions());
    return ok(res, { authUser: shape(user), jwtToken: access }, "Logged in");
  } catch (e) { next(e); }
}

export async function refresh(req, res, next) {
  try {
    const cookie = req.cookies?.[REFRESH_COOKIE_NAME];
    const { user, access, refreshPair } = await svc.refresh(cookie);
    res.cookie(REFRESH_COOKIE_NAME, `${refreshPair.jti}.${refreshPair.raw}`, cookieOptions());
    return ok(res, { authUser: shape(user), jwtToken: access }, "Token refreshed");
  } catch (e) { next(e); }
}

export async function logout(_req, res, _next) {
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions());
  return ok(res, {}, "Logged out");
}

export async function me(req, res, next) {
  try {
    // requireAuth already attached req.auth.uid
    return ok(res, { authUser: { authUserId: req.auth.uid } });
  } catch (e) { next(e); }
}
