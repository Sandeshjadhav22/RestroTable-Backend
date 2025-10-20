import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", index: true, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true }
  },
  { timestamps: true, collection: "sections" }
);

export default mongoose.model("Section", SectionSchema);
