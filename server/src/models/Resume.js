import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  title: { type: String, required: true, default: "Untitled resume" },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

resumeSchema.methods.toPublicJSON = function () {
  return { id: this._id.toString(), title: this.title, data: this.data, createdAt: this.createdAt, updatedAt: this.updatedAt };
};

export default mongoose.model("Resume", resumeSchema);