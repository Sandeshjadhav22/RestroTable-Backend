import { ok, created } from "../utils/sendResponse.js";
import * as svc from "../services/section.service.js";

export async function getByStore(req, res, next) {
  try {
    const storeId = req.query.storeId;
    const rows = await svc.listSections(req.auth.uid, storeId);
    return ok(res, rows);
  } catch (e) { next(e); }
}

export async function add(req, res, next) {
  try {
    const doc = await svc.createSection(req.auth.uid, req.body);
    return created(res, { sectionId: doc._id, name: doc.name, storeId: doc.storeId }, "Section created");
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    await svc.deleteSection(req.auth.uid, req.params.id);
    return ok(res, { deleted: true }, "Section deleted");
  } catch (e) { next(e); }
}
