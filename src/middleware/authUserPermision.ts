import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import UserModel from "../models/userSchema";

const userAccessPermission = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cookieToken = req.cookies?.userCookie;

    if (!cookieToken) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }

    const validUser = jwt.verify(cookieToken, process.env.JWT_SECRET ?? "ahsanSecretKey8765") as {
      _id: string;
      email: string;
      role: string;
    };

    const user = await UserModel.findById(validUser._id).exec();

    if (!user) {
      res.status(401).json({ error: "Unauthorized access" });
      return;
    }

    req.token = cookieToken;
    req.userInfo = user;
    next();
  } catch (error) {
    console.log("JWT error:", (error as Error).message);
    req.unAuthenticateUser = true;
    res.status(401).json({ error: "Unauthorized access" });
  }
};

export default userAccessPermission;

