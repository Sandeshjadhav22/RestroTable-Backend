import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import * as ctrl from "../controllers/table.controller.js";

const router = Router();
router.post("/", requireAuth, ctrl.add);             // POST /tables
router.delete("/:id", requireAuth, ctrl.remove);     // DELETE /tables/:id
export default router;
