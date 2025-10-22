import mongoose from "mongoose";

const MenuCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", index: true, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "menu_categories" }
);

export default mongoose.model("MenuCategory", MenuCategorySchema);
