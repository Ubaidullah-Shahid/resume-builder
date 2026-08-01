import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: "Template", required: true },
  stripeSessionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
}, { timestamps: true });

purchaseSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    userId: this.userId.toString(),
    templateId: this.templateId.toString(),
    amount: this.amount,
    status: this.status,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("Purchase", purchaseSchema);