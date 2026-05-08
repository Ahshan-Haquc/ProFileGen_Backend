import mongoose, { Document } from "mongoose";

export interface ISetting {
  key: string;
  value: unknown;
}

export interface ISettingDoc extends ISetting, Document {}

const SettingSchema = new mongoose.Schema<ISettingDoc>(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const SettingModel = mongoose.model<ISettingDoc>("Setting", SettingSchema);
export default SettingModel;

