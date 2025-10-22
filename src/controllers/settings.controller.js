import { ok } from "../utils/sendResponse.js";
import * as svc from "../services/settings.service.js";

export async function get(req, res, next) {
  try {
    const storeId = req.params.storeId;
    const doc = await svc.getSettings(req.auth.uid, storeId);
    return ok(res, doc);
  } catch (e) { next(e); }
}

export async function put(req, res, next) {
  try {
    const storeId = req.params.storeId;
    const doc = await svc.updateSettings(req.auth.uid, storeId, req.body);
    return ok(res, doc, "Settings saved");
  } catch (e) { next(e); }
}

// Expose invoice number endpoint for billing workflows (optional now, useful later)
export async function nextInvoice(req, res, next) {
  try {
    const storeId = req.params.storeId;
    const number = await svc.nextInvoiceNumber(req.auth.uid, storeId);
    return ok(res, { invoiceNumber: number });
  } catch (e) { next(e); }
}
