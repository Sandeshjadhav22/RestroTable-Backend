import { fail } from "../utils/sendResponse.js";

export default function errorHandler(err, _req, res, _next) {
  console.error(err);
  const code = err.statusCode || 500;
  const msg = err.message || "Internal Server Error";
  return fail(res, code, msg);
}
