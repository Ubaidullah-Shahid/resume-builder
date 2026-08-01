import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  thumbnailUrl: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({
      fullName: "",
      title: "",
      summary: "",
      experience: [],
      education: [],
      skills: [],
    }),
  },
}, { timestamps: true });

templateSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    price: this.price,
    thumbnailUrl: this.thumbnailUrl,
    isActive: this.isActive,
    content: this.content,
  };
};

export default mongoose.model("Template", templateSchema);