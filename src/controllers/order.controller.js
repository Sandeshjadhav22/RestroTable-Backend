// src/controllers/order.controller.js
import { ok, created } from "../utils/sendResponse.js";
import * as svc from "../services/order.service.js";

export async function list(req, res, next) {
  try {
    const { storeId, status } = req.query;
    const rows = await svc.list({ ownerId: req.auth.uid, storeId, status });
    return ok(res, rows);
  } catch (e) { next(e); }
}

export async function create(req, res, next) {
  try {
    const out = await svc.create({ ownerId: req.auth.uid, payload: req.body });
    return created(res, out, "Order created");
  } catch (e) { next(e); }
}

export async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const out = await svc.updateStatus({ ownerId: req.auth.uid, orderId: id, status });
    return ok(res, out, "Order status updated");
  } catch (e) { next(e); }
}
