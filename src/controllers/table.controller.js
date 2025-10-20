import { ok, created } from "../utils/sendResponse.js";
import * as svc from "../services/table.service.js";

export async function add(req, res, next) {
  try {
    const t = await svc.createTable(req.auth.uid, req.body);
    return created(res, {
      tableId: t._id,
      tableNumber: t.tableNumber,
      capacity: t.capacity,
      position: t.position,
      status: t.status
    }, "Table created");
  } catch (e) { next(e); }
}

export async function remove(req, res, next) {
  try {
    await svc.deleteTable(req.auth.uid, req.params.id);
    return ok(res, { deleted: true }, "Table deleted");
  } catch (e) { next(e); }
}
