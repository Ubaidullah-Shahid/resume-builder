import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true, trim: true },
  passwordHash: { type: String, default: null },
  role: { type: String, enum: ["customer", "admin"], default: "customer" },
  lastLoginAt: { type: Date, default: null },
  aiCredits: { type: Number, default: 50 },
  googleId: { type: String, default: null },
}, { timestamps: true });

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    role: this.role,
    aiCredits: this.aiCredits,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);