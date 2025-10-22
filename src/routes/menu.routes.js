import { Router } from "express";
import requireAuth from "../middleware/requireAuth.js";
import * as ctrl from "../controllers/menu.controller.js";

const router = Router();

// === CATEGORIES ===
router.get("/menu-category/get-menuCategory-by-storeId/:storeId", requireAuth, ctrl.getCategoriesByStore);
router.post("/menu-category/add-menu-category", requireAuth, ctrl.addCategory);
router.delete("/menu-category/delete-menu-category/:id", requireAuth, ctrl.deleteCategory);

// === ITEMS ===
router.post("/menu-items/add-menu-item", requireAuth, ctrl.addItem);
router.put("/menu-items/update-menu-item/:id", requireAuth, ctrl.updateItem);
router.delete("/menu-items/delete-menu-item/:id", requireAuth, ctrl.deleteItem);

export default router;
