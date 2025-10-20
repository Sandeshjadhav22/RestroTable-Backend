import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    jti: { type: String, required: true, unique: true }, // token id
    hashedToken: { type: String, required: true },       // hash of the raw refresh token
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
    replacedBy: String 
  },
  { timestamps: true, collection: "refresh_tokens" }
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-purge

export default mongoose.model("RefreshToken", RefreshTokenSchema);
