import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import UserModel from "../models/userSchema";

const adminSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    const role = "admin";

    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await UserModel.findOne({ email }).exec();

    if (existingUser) {
      res.status(400).json({ success: false, message: "Try with another email account." });
      return;
    }

    await new UserModel({ email, password: hashedPassword, role }).save();
    res.status(201).json({ success: true, message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ message: "server error", error });
  }
};

export { adminSignup };
