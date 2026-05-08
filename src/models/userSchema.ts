import mongoose, { Model, Document } from "mongoose";
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";

export interface ISubscription {
  plan: "starter" | "pro" | "elite";
  cvLimit: number;
  cvUsed: number;
  isTrialUsed: boolean;
  subscribedAt: Date;
  expiresAt?: Date;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  status: "active" | "inactive" | "blocked";
  subscription: ISubscription;
  tokens: { token: string }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDoc extends IUser, Document {
  generateToken(): Promise<string>;
}

const UserSchema = new mongoose.Schema<IUserDoc>(
  {
    name: {
      type: String,
      required: true,
      default: "User",
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    subscription: {
      plan: {
        type: String,
        enum: ["starter", "pro", "elite"],
        default: "starter",
      },
      cvLimit: {
        type: Number,
        default: 3,
      },
      cvUsed: {
        type: Number,
        default: 0,
      },
      isTrialUsed: {
        type: Boolean,
        default: false,
      },
      subscribedAt: {
        type: Date,
        default: Date.now,
      },
      expiresAt: {
        type: Date,
      },
    },
    tokens: [
      {
        token: { type: String },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.methods.generateToken = async function (): Promise<string> {
  try {
    const tokenSecret: Secret = process.env.JWT_SECRET ?? "ahsanSecretKey8765";
    const expiresIn: StringValue = (process.env.JWT_EXPIRATION ?? "1h") as StringValue;
    const tokenOptions: SignOptions = { expiresIn };

    const userToken = jwt.sign(
      {
        _id: this._id.toString(),
        email: this.email,
        role: this.role,
      },
      tokenSecret,
      tokenOptions
    );

    this.tokens.push({ token: userToken });
    await this.save();

    return userToken;
  } catch (error) {
    console.error("Error while generating token:", error);
    throw new Error("Token generation failed");
  }
};

const UserModel = mongoose.model<IUserDoc>("User", UserSchema);
export default UserModel;

