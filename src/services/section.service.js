import Section from "../models/Section.js";
import Table from "../models/Table.js";
import AppError from "../utils/AppError.js";
import mongoose from "mongoose";

export async function listSections(userId, storeId) {
  if (!storeId) throw new AppError("storeId is required", 400);
  // get sections for this user+store
  const sections = await Section.find({ ownerId: userId, storeId }).select("_id name storeId");
  if (sections.length === 0) return [];

  const sectionIds = sections.map(s => s._id);
  const tables = await Table.find({ sectionId: { $in: sectionIds } })
    .select("_id tableNumber capacity status position sectionId");

  const tablesBySection = tables.reduce((acc, t) => {
    const key = t.sectionId.toString();
    (acc[key] ||= []).push(t);
    return acc;
  }, {});

  return sections.map(s => ({
    sectionId: s._id,
    name: s.name,
    storeId: s.storeId,
    tableList: (tablesBySection[s._id.toString()] || []).map(t => ({
      tableId: t._id,
      tableNumber: t.tableNumber,
      capacity: t.capacity,
      tableStatus: t.status,
      position: t.position
    }))
  }));
}

export async function createSection(userId, { name, storeId }) {
  if (!name || !storeId) throw new AppError("name and storeId are required", 400);
  const section = await Section.create({ name, storeId, ownerId: userId });
  return section;
}

export async function deleteSection(userId, sectionId) {
  if (!mongoose.isValidObjectId(sectionId)) throw new AppError("Invalid sectionId", 400);
  const sec = await Section.findOneAndDelete({ _id: sectionId, ownerId: userId });
  if (!sec) throw new AppError("Section not found", 404);
  // cascade delete tables
  await Table.deleteMany({ sectionId });
  return true;
}
