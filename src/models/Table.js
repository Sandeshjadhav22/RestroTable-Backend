import mongoose from "mongoose";

const TableSchema = new mongoose.Schema(
  {
    tableNumber: { type: String, required: true, trim: true },
    capacity: { type: Number, default: 4 },
    status: { type: String, enum: ["available", "occupied", "reserved"], default: "available" },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 }
    },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", index: true, required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", index: true, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true }
  },
  { timestamps: true, collection: "tables" }
);

export default mongoose.model("Table", TableSchema);
