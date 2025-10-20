export const cookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 30 // 30d
  };
};
export const REFRESH_COOKIE_NAME = process.env.COOKIE_NAME || "rt";
