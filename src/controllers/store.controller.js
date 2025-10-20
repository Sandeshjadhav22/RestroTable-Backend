import { ok, created } from "../utils/sendResponse.js";
import * as svc from "../services/store.service.js";

export async function getStores(req, res, next) {
  try {
    const stores = await svc.listStores(req.auth.uid);
    return ok(res, stores.map(s => ({ id: s._id, name: s.name, isActive: s.isActive, createdAt: s.createdAt })));
  } catch (e) { next(e); }
}

export async function addStore(req, res, next) {
  try {
    const store = await svc.createStore(req.auth.uid, req.body);
    return created(res, { id: store._id, name: store.name, location: store.address });
  } catch (e) { next(e); }
}
