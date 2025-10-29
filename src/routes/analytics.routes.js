import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = Router();
router.get("/analytics", requireAuth, getAnalytics);
export default router;
