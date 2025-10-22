import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import * as ctrl from "../controllers/settings.controller.js";

const router = Router();
router.get("/:storeId", requireAuth, ctrl.get);
router.put("/:storeId", requireAuth, ctrl.put);
router.post("/:storeId/invoice/next", requireAuth, ctrl.nextInvoice); // optional helper

export default router;
