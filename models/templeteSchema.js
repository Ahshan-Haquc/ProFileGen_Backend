//Useful if i want to dynamically add/remove/update templates instead of hardcoding.

const mongoose = require("mongoose");

const TemplateSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // e.g., "Modern", "Formal"
    },
    description: { type: String },
    previewImage: { type: String }, // thumbnail for UI
    config: { type: Object }, // JSON for sections, layout rules
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const TemplateModel = mongoose.model("Template", TemplateSchema);
module.exports = TemplateModel;
