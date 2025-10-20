import { fail } from "../utils/sendResponse.js";
import { verifyAccess } from "../utils/jwt.js";
import User from "../models/User.js";

export default async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return fail(res, 401, "Missing token");

  try {
    const payload = verifyAccess(token); // { uid, email, role, iat, exp }
    const user = await User.findById(payload.uid).select("_id email role tokenCompromisedAt");
    if (!user) return fail(res, 401, "Invalid token");
    if (user.tokenCompromisedAt && payload.iat * 1000 < user.tokenCompromisedAt.getTime()) {
      return fail(res, 401, "Token revoked");
    }
    req.auth = payload;
    next();
  } catch (e) {
    return fail(res, 401, "Invalid or expired token");
  }
}
