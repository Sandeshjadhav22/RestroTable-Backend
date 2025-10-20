import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import * as ctrl from "../controllers/auth.controller.js";

const router = Router();

router.post("/signup", ctrl.signup);
router.post("/login", ctrl.login);
router.post("/refresh", ctrl.refresh);
router.post("/logout", ctrl.logout);
router.get("/me", requireAuth, ctrl.me);

export default router;
