import type { NextFunction, Request, Response } from "express";
import bcrypt from "bcryptjs";
import UserModel from "../models/userSchema";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const userSignup = async (req: Request, res: Response, next: NextFunction) => {
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
}

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

const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body as { credential?: string };

    if (!credential) {
      res.status(400).json({
        success: false,
        message: "Google credential missing",
      });
      return;
    }

    // verify google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      res.status(400).json({
        success: false,
        message: "Invalid Google token",
      });
      return;
    }

    const {
      sub,
      email,
      name,
      picture,
    } = payload;

    if (!email) {
      res.status(400).json({
        success: false,
        message: "Google email not found",
      });
      return;
    }

    // check existing user
    let user = await UserModel.findOne({ email }).exec();

    // create user if not exists
    if (!user) {
      user = await UserModel.create({
        name,
        email,
        password: "GOOGLE_AUTH_USER",
        googleId: sub,
        profileImage: picture,
        authProvider: "google",
      });
    }

    // generate jwt
    const token = await user.generateToken();

    // save cookie
    res.cookie("userCookie", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });

    res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
    });

  } catch (error) {
    console.error("Google Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Google login failed",
    });
  }
};

const userLogin = async (req: Request, res: Response) => {
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
}

const userLogout = async (req: Request, res: Response, next: NextFunction) => {
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
}

const checkUserAuth = async (req: Request, res: Response) => {
  console.log("working on me router");
  res.status(200).json({ userInfo: req.userInfo });
}

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(" to home page.");
    res.status(200).json({ message: "wel to home page." });
  } catch (error) {
    next(error);
  }
}


export { userSignup, adminSignup, googleLogin, userLogin, userLogout, checkUserAuth, checkAuth };
