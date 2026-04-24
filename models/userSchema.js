const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = mongoose.Schema(
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
    tokens: [
      {
        token: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// generating JWT token
UserSchema.methods.generateToken = async function () {
  try {
    const userToken = jwt.sign(
      {
        _id: this._id.toString(),
        email: this.email,
        role: this.role,
      },
      process.env.JWT_SECRET || "ahsanSecretKey8765",
      { expiresIn: process.env.JWT_EXPIRATION || "1h" }
    );

    this.tokens.push({ token: userToken });
    await this.save();

    return userToken;
  } catch (error) {
    console.error("Error while generating token:", error);
    throw new Error("Token generation failed");
  }
};

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
