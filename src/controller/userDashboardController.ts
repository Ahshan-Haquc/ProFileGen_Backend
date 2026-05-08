import type { Request, Response, NextFunction } from "express";
import UserCVModel from "../models/userCVSchema";

const getUserDashboardAllData = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userInfo) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const userAllCvs = await UserCVModel.find({ userId: req.userInfo._id }).exec();
    const userFavoriteCvs = await UserCVModel.find({ userId: req.userInfo._id, isFavorite: true }).exec();
    const lastUpdatedCv = await UserCVModel.findOne({ userId: req.userInfo._id }).sort({ updatedAt: -1 }).exec();

    res.status(200).json({
      success: true,
      userAllCvs,
      userFavoriteCvs,
      lastUpdatedCv,
    });
  } catch (error) {
    console.error("Error fetching user dashboard data:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const viewCv = async (req: Request<unknown, unknown, { userId: string }>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userCV = await UserCVModel.findOne({ userId: req.body.userId }).exec();
    if (!userCV) {
      res.status(400).json({ message: "User CV not found" });
      return;
    }
    res.status(200).json({ userCV });
  } catch (error) {
    console.log("Error in server : ", error);
    next(error);
  }
};

export { getUserDashboardAllData, viewCv };

