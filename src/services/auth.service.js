import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import Store from "../models/Store.js";
import {
  signAccessToken,
  createRawRefreshToken,
  persistRefreshToken,
  rotateRefreshToken,
  findTokenByJti,
  validateStoredRefreshToken
} from "../utils/jwt.js";
import AppError from "../utils/AppError.js";

export async function register({ username, email, password }) {
  if (!username || !email || !password) throw new AppError("All fields are required", 400);

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new AppError("Email already registered", 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email: email.toLowerCase(), passwordHash });

  // optional: default store
  await Store.create({ name: `${username}'s Store`, ownerId: user._id, isActive: true });

  const access = signAccessToken(user);
  const refreshRaw = createRawRefreshToken();
  const jti = uuidv4();
  await persistRefreshToken(user._id, refreshRaw, jti, process.env.REFRESH_TOKEN_TTL || "30d");

  return { user, access, refreshPair: { jti, raw: refreshRaw } };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new AppError("Invalid credentials", 401);

  const okPass = await bcrypt.compare(password, user.passwordHash);
  if (!okPass) throw new AppError("Invalid credentials", 401);

  const access = signAccessToken(user);
  const refreshRaw = createRawRefreshToken();
  const jti = uuidv4();
  await persistRefreshToken(user._id, refreshRaw, jti, process.env.REFRESH_TOKEN_TTL || "30d");

  return { user, access, refreshPair: { jti, raw: refreshRaw } };
}

export async function refresh(rawCookie) {
  if (!rawCookie) throw new AppError("Missing refresh token", 401);
  const [jti, rawToken] = rawCookie.split(".");
  const stored = await findTokenByJti(jti);
  const valid = await validateStoredRefreshToken(stored, rawToken);
  if (!valid) throw new AppError("Invalid refresh token", 401);

  const user = await User.findById(stored.userId);
  if (!user) throw new AppError("User not found", 401);

  // rotate
  const nextRaw = createRawRefreshToken();
  const nextJti = uuidv4();
  await rotateRefreshToken(jti, nextJti);
  await persistRefreshToken(user._id, nextRaw, nextJti, process.env.REFRESH_TOKEN_TTL || "30d");

  const access = signAccessToken(user);
  return { user, access, refreshPair: { jti: nextJti, raw: nextRaw } };
}
