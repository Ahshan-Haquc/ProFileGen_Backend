// it Keeps track of what users do (login, CV created, deleted, etc.).
const mongoose = require("mongoose");

const ActivitySchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true }, // e.g. "LOGIN", "CREATE_CV", "DELETE_CV"
    meta: { type: Object }, // extra info, like CV id
    ip: { type: String },
  },
  { timestamps: true }
);

const ActivityModel = mongoose.model("Activity", ActivitySchema);
module.exports = ActivityModel;
