import express, { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import UserModel from "../models/userSchema";
import userAccessPermission from "../middleware/authUserPermision";
import { adminSignup } from "../controller/auth";

const authRouter = express.Router();

authRouter.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(" to home page.");
    res.status(200).json({ message: "wel to ho me page." });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/userSignup", async (req: Request, res: Response, next: NextFunction) => {
  console.log("working on singup router 1");
  try {
    const { email, password, name } = req.body as { email?: string; password?: string; name?: string };
    if (!email || !password) {
      res.status(401).json({ message: "Please enter email or password." });
      return;
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    await new UserModel({ email, password: encryptedPassword, name }).save();
    res.status(200).json({ message: "Signup successful." });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/auth/admin/signup", adminSignup);

authRouter.post("/userLogin", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  try {
    const user = await UserModel.findOne({ email }).exec();
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password ?? "", user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const token = await user.generateToken();

    res.cookie("userCookie", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.get("/userLogout", userAccessPermission, async (req: Request, res: Response, next: NextFunction) => {
  console.log("Request received in logout router");
  try {
    const user = await UserModel.findById(req.userInfo?._id).exec();

    if (user) {
      user.tokens = [];
      await user.save();
    }

    res.clearCookie("userCookie", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Error in logout router");
    next(error);
  }
});

authRouter.get("/me", userAccessPermission, async (req: Request, res: Response) => {
  console.log("working on me router");
  res.status(200).json({ userInfo: req.userInfo });
});

export default authRouter;