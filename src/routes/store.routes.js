import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import { ok, fail } from "../utils/sendResponse.js";
import Store from "../models/Store.js";

const router = Router();

/** GET /stores - list stores for current user */
router.get("/", requireAuth, async (req, res) => {
  try {
    const stores = await Store.find({ ownerId: req.auth.uid, isActive: true })
      .select("_id name isActive createdAt");
    return ok(res, stores.map(s => ({
      id: s._id,
      name: s.name,
      isActive: s.isActive,
      createdAt: s.createdAt
    })));
  } catch (e) {
    console.error(e);
    return fail(res, 500, "Could not load stores");
  }
});

export default router;
