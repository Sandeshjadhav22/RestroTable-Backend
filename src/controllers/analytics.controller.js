import mongoose from "mongoose";
import Order from "../models/Order.js";
import { ok } from "../utils/sendResponse.js";

function toObjectId(id) {
  try { return new mongoose.Types.ObjectId(id); } catch { return null; }
}
function parseDate(d, fallback) {
  const t = new Date(d);
  return isNaN(t.getTime()) ? fallback : t;
}

export async function getAnalytics(req, res, next) {
  try {
    const { scope = "all", storeId, from, to } = req.query;

    // time window (optional)
    const start = from ? parseDate(from, null) : null;
    const end   = to   ? parseDate(to,   null) : null;

    const match = {};
    if (scope !== "all" && storeId) {
      const oid = toObjectId(storeId);
      if (oid) match.storeId = oid;
    }
    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = start;
      if (end)   match.createdAt.$lt  = end;
    }

    // fetch orders once (used for simple counts)
    const orders = await Order.find(match).lean();
    const completed = orders.filter(o => o.paymentStatus === "completed");
    const totalRevenue = completed.reduce((s, o) => s + (o.total || 0), 0);
    const avgOrderValue = completed.length ? totalRevenue / completed.length : 0;

    // pipelines share same match + paymentStatus
    const paidMatch = { ...match, paymentStatus: "completed" };

    // Top 10 by revenue
    const bestByRevenue = await Order.aggregate([
      { $match: paidMatch },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", revenue: { $sum: "$items.total" } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Top 10 by quantity
    const bestByQuantity = await Order.aggregate([
      { $match: paidMatch },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]);

    // Worst 10 by quantity (items that barely sell)
    const worstSellers = await Order.aggregate([
      { $match: paidMatch },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
      { $sort: { quantity: 1 } },
      { $limit: 10 },
    ]);

    // Category performance (pie)
    const categoryPerf = await Order.aggregate([
      { $match: paidMatch },
      { $unwind: "$items" },
      // if you store items.menuItemId, this enriches category
      {
        $lookup: {
          from: "menu_items",
          localField: "items.menuItemId",
          foreignField: "_id",
          as: "mi"
        }
      },
      { $unwind: { path: "$mi", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "menu_categories",
          localField: "mi.categoryId",
          foreignField: "_id",
          as: "cat"
        }
      },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ["$cat.name", "Uncategorized"] },
          revenue: { $sum: "$items.total" }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Order type breakdown (heuristics)
    const orderTypeBreakdown = {
      dineIn:   orders.filter(o => !!o.tableId).length,
      takeaway: orders.filter(o => !o.tableId && !o.customerPhone).length,
      delivery: orders.filter(o => o.customerPhone).length,
    };

    // Payment method breakdown
    const paymentBreakdown = completed.reduce(
      (acc, o) => {
        if (o.paymentMethod === "cash") acc.cash++;
        else if (o.paymentMethod === "online") acc.online++;
        return acc;
      },
      { cash: 0, online: 0 }
    );

    return ok(res, {
      totalRevenue,
      avgOrderValue,
      orderCount: orders.length,
      bestByRevenue,
      bestByQuantity,
      worstSellers,
      categoryPerf,
      orderTypeBreakdown,
      paymentBreakdown,
    });
  } catch (err) { next(err); }
}
