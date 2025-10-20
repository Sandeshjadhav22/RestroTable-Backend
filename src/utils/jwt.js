import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import RefreshToken from "../models/RefreshToken.js";

export function signAccessToken(user) {
  const payload = { uid: user._id.toString(), email: user.email, role: user.role };
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_TTL || "15m"
  });
}

export function verifyAccess(token) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}

export function createRawRefreshToken() {
  // cryptographically strong
  return crypto.randomBytes(64).toString("hex");
}

export async function persistRefreshToken(userId, rawToken, jti, ttl = "30d") {
  const hashed = await bcrypt.hash(rawToken, 12);

  // compute expiry date from ttl
  const ms =
    typeof ttl === "string" && ttl.endsWith("d")
      ? parseInt(ttl) * 24 * 60 * 60 * 1000
      : 30 * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + ms);

  await RefreshToken.create({ userId, jti, hashedToken: hashed, expiresAt });
}

export async function rotateRefreshToken(prevJti, nextJti) {
  // mark previous as revoked and link to next
  await RefreshToken.updateOne({ jti: prevJti }, { $set: { revokedAt: new Date(), replacedBy: nextJti } });
}

export async function findTokenByJti(jti) {
  return RefreshToken.findOne({ jti });
}

export async function validateStoredRefreshToken(doc, raw) {
  if (!doc || doc.revokedAt) return false;
  return bcrypt.compare(raw, doc.hashedToken);
}
