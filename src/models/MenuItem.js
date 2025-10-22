import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, default: "" },
    available: { type: Boolean, default: true },
    taxable: { type: Boolean, default: true },
    hsnCode: { type: String, default: "" },

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuCategory", index: true, required: true },
    storeId:    { type: mongoose.Schema.Types.ObjectId, ref: "Store", index: true, required: true },
    ownerId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "menu_items" }
);

export default mongoose.model("MenuItem", MenuItemSchema);
