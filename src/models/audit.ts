import mongoose, { Document } from "mongoose";

export interface IActivity {
  userId?: mongoose.Types.ObjectId;
  action: string;
  meta?: Record<string, unknown>;
  ip?: string;
}

export interface IActivityDoc extends IActivity, Document {}

const ActivitySchema = new mongoose.Schema<IActivityDoc>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    meta: { type: Object },
    ip: { type: String },
  },
  { timestamps: true }
);

const ActivityModel = mongoose.model<IActivityDoc>("Activity", ActivitySchema);
export default ActivityModel;

