import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import * as ctrl from "../controllers/store.controller.js";

const router = Router();
router.get("/", requireAuth, ctrl.getStores);
router.post("/", requireAuth, ctrl.addStore);
export default router;
