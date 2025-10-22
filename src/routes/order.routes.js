import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import * as ctrl from "../controllers/order.controller.js";

const router = Router();

// CREATE
router.post("/orders", requireAuth, ctrl.create);

// LIST
router.get("/orders", requireAuth, ctrl.list);

// PATCH STATUS
router.patch("/orders/:id/status", requireAuth, ctrl.updateStatus);

export default router;
