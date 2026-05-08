import type { Request, Response, NextFunction } from "express";
import UserModel from "../models/userSchema";

const checkCVLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = req.userInfo;

    if (!user) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    if (user.subscription.plan === "starter") {
      if (user.subscription.cvUsed >= 3 || user.subscription.isTrialUsed) {
        const userInfo = await UserModel.findById(user._id).exec();
        if (userInfo) {
          userInfo.subscription.isTrialUsed = true;
          await userInfo.save();
        }
        res.status(200).json({
          success: false,
          message: "Free limit reached. Upgrade your plan.",
        });
        return;
      }
    }

    if (user.subscription.cvUsed >= user.subscription.cvLimit) {
      res.status(200).json({
        success: false,
        message: "Monthly limit reached. Upgrade your plan",
      });
      return;
    }

    const now = new Date();

    if (user.subscription.expiresAt && user.subscription.expiresAt < now) {
      res.status(200).json({
        success: false,
        message: "Subscription expired. Upgrade your plan.",
      });
      return;
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export default checkCVLimit;

