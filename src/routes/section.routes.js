import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import * as ctrl from "../controllers/section.controller.js";

const router = Router();
router.get("/", requireAuth, ctrl.getByStore);       // GET /sections?storeId=...
router.post("/", requireAuth, ctrl.add);             // POST /sections
router.delete("/:id", requireAuth, ctrl.remove);     // DELETE /sections/:id
export default router;
