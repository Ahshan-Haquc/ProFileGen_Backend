const mongoose = require("mongoose");

const SettingSchema = mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const SettingModel = mongoose.model("Setting", SettingSchema);
module.exports = SettingModel;
