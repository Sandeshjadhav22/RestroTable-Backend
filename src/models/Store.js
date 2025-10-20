import mongoose from "mongoose";

const StoreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    isActive: { type: Boolean, default: true },
    address: String
  },
  { timestamps: true, collection: "stores" }
);

export default mongoose.model("Store", StoreSchema);
