import { ok, created } from "../utils/sendResponse.js";
import * as svc from "../services/menu.service.js";

// CATEGORY
export async function getCategoriesByStore(req, res, next) {
  try {
    const { storeId } = req.params;
    const rows = await svc.listCategoriesWithItems(req.auth.uid, storeId);
    return ok(res, rows);
  } catch (e) { next(e); }
}

export async function addCategory(req, res, next) {
  try {
    const doc = await svc.addCategory(req.auth.uid, req.body);
    return created(res, doc, "Category added");
  } catch (e) { next(e); }
}

export async function deleteCategory(req, res, next) {
  try {
    await svc.deleteCategory(req.auth.uid, req.params.id);
    return ok(res, { deleted: true }, "Category deleted");
  } catch (e) { next(e); }
}

// ITEM
export async function addItem(req, res, next) {
  try {
    const doc = await svc.addItem(req.auth.uid, req.body);
    return created(res, doc, "Item added");
  } catch (e) { next(e); }
}

export async function updateItem(req, res, next) {
  try {
    const doc = await svc.updateItem(req.auth.uid, req.params.id, req.body);
    return ok(res, doc, "Item updated");
  } catch (e) { next(e); }
}

export async function deleteItem(req, res, next) {
  try {
    await svc.deleteItem(req.auth.uid, req.params.id);
    return ok(res, { deleted: true }, "Item deleted");
  } catch (e) { next(e); }
}
