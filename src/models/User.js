import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, minlength: 2, trim: true },
    email: { type: String, required: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: ["admin", "staff"], default: "admin" },
    stores: [
      {
        storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
        role: { type: String, enum: ["owner", "manager", "cashier"], default: "owner" }
      }
    ],

   
    tokenCompromisedAt: { type: Date }
  },
  { timestamps: true, collection: "users" }
);

export default mongoose.model("User", UserSchema);
