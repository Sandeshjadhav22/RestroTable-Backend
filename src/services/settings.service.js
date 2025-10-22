import Settings from "../models/Settings.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

export async function getSettings(ownerId, storeId) {
  if (!storeId || !mongoose.isValidObjectId(storeId)) throw new AppError("Valid storeId is required", 400);

  let doc = await Settings.findOne({ ownerId, storeId });
  if (!doc) {
    doc = await Settings.create({ ownerId, storeId }); // default document
  }
  return doc;
}

function deepMerge(target, source) {
  for (const k of Object.keys(source || {})) {
    if (source[k] && typeof source[k] === "object" && !Array.isArray(source[k])) {
      target[k] = deepMerge(target[k] || {}, source[k]);
    } else {
      target[k] = source[k];
    }
  }
  return target;
}

export async function updateSettings(ownerId, storeId, patch) {
  const doc = await getSettings(ownerId, storeId);
  // Allow updating nested sections: { store: {...}, app: {...}, invoice: {...}, tax: {...}, payment: {...} }
  const updated = deepMerge(doc.toObject(), patch);
  await Settings.updateOne({ _id: doc._id }, updated);
  return await Settings.findById(doc._id);
}

// Atomic invoice number generation (used by billing)
export async function nextInvoiceNumber(ownerId, storeId) {
  const doc = await Settings.findOneAndUpdate(
    { ownerId, storeId },
    {
      $inc: { invoiceSeq: 1 },
      $setOnInsert: { ownerId, storeId }
    },
    { new: true, upsert: true }
  );
  const prefix = doc.invoice?.invoicePrefix || "INV";
  const start = doc.invoice?.invoiceStartNumber || 1001;
  const seq = Math.max(doc.invoiceSeq, start);
  return `${prefix}${seq}`;
}
