import mongoose from "mongoose";
import AppError from "../utils/AppError.js";
import Order from "../models/Order.js";

export function mapOrderToFrontend(o) {
  return {
    id: o._id,
    storeId: o.storeId,
    tableId: o.tableId || null,
    tableName: o.tableName || null,
    items: o.items.map((i, idx) => ({
      id: `${o._id}-${idx}`,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      total: i.total,
    })),
    subtotal: o.subtotal,
    gstAmount: o.gstAmount,
    total: o.total,
    status: o.status,
    paymentStatus: o.paymentStatus,
    paymentMethod: o.paymentMethod || undefined,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
}

export async function list({ ownerId, storeId, status }) {
  if (!mongoose.isValidObjectId(storeId)) throw new AppError("Invalid storeId", 400);

  const q = { ownerId, storeId, isActive: true };
  if (status && ["new", "in-progress", "completed"].includes(status)) q.status = status;

  const rows = await Order.find(q)
    .select("_id storeId tableId tableName items subtotal gstAmount total status paymentStatus createdAt updatedAt")
    .sort({ createdAt: -1 });

  return rows.map(mapOrderToFrontend);
}

export async function create({ ownerId, payload }) {
  const {
    frontendId, storeId, tableId, tableName,
    customerName, customerPhone, items = [],
    paymentStatus = "completed", paymentMethod = "cash",
    status = "new", subtotal, gstAmount, total,
  } = payload || {};

  if (!storeId) throw new AppError("storeId is required", 400);
  if (!frontendId) throw new AppError("frontendId is required", 400);
  if (!Array.isArray(items) || items.length === 0) throw new AppError("items required", 400);

  
  const normalizedItems = items.map((it) => {
    const qty = Number(it.quantity || 1);
    const price = Number(it.pricePerItem || 0);
    return {
      menuItemId: it.menuItemId,
      name: it.name || "",           
      price,
      quantity: qty,
      total: price * qty,
    };
  });

  const _subtotal = typeof subtotal === "number"
    ? subtotal
    : normalizedItems.reduce((s, i) => s + i.total, 0);

  const _gstAmount = typeof gstAmount === "number" ? gstAmount : Math.round(_subtotal * 0.18 * 100) / 100;
  const _total     = typeof total === "number" ? total : Math.round((_subtotal + _gstAmount) * 100) / 100;

  // Idempotency: if already created with same frontendId
  const existing = await Order.findOne({ ownerId, frontendId, isActive: true });
  if (existing) return mapOrderToFrontend(existing);

  const doc = await Order.create({
    frontendId,
    ownerId,
    storeId,
    tableId: tableId || null,
    tableName: tableName || null,
    items: normalizedItems,
    subtotal: _subtotal,
    gstAmount: _gstAmount,
    total: _total,
    status,
    paymentStatus,
    paymentMethod,
  });

  return mapOrderToFrontend(doc);
}

export async function updateStatus({ ownerId, orderId, status }) {
  if (!mongoose.isValidObjectId(orderId)) throw new AppError("Invalid order id", 400);
  if (!["new", "in-progress", "completed"].includes(status)) throw new AppError("Bad status", 400);

  const doc = await Order.findOne({ _id: orderId, ownerId, isActive: true });
  if (!doc) throw new AppError("Order not found", 404);

  doc.status = status;
  await doc.save();

  return { id: doc._id, status: doc.status, updatedAt: doc.updatedAt, storeId: doc.storeId };
}
