import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    name: { type: String, required: true },      // snapshot of item name
    hsnCode: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 }, // snapshot of unit price
    quantity: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 }, // price * quantity
    notes: { type: String, default: "" },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store", index: true, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },

  
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table", default: null },
    tableName: { type: String, default: null },

    items: { type: [OrderItemSchema], default: [] },

    subtotal: { type: Number, required: true, default: 0 },
    gstAmount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },

    status: {
      type: String,
      enum: ["new", "in-progress", "completed"],
      default: "new",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online", null],
      default: null,
    },

    customerName: { type: String, default: null },
    customerPhone: { type: String, default: null },


    frontendId: { type: String, index: true }, 
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, collection: "orders" }
);

export default mongoose.model("Order", OrderSchema);
