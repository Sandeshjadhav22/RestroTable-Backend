import Table from "../models/Table.js";
import Section from "../models/Section.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

export async function createTable(userId, { tableNumber, capacity = 4, sectionId, position }) {
  if (!tableNumber || !sectionId) throw new AppError("tableNumber and sectionId are required", 400);

  const section = await Section.findOne({ _id: sectionId, ownerId: userId });
  if (!section) throw new AppError("Section not found", 404);

  const table = await Table.create({
    tableNumber,
    capacity,
    status: "available",
    position: position || { x: 0, y: 0 },
    sectionId,
    storeId: section.storeId,
    ownerId: userId
  });

  return table;
}

export async function deleteTable(userId, tableId) {
  if (!mongoose.isValidObjectId(tableId)) throw new AppError("Invalid tableId", 400);
  const t = await Table.findOneAndDelete({ _id: tableId, ownerId: userId });
  if (!t) throw new AppError("Table not found", 404);
  return true;
}
