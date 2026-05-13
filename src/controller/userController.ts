import type { Request, Response } from "express";
import UserModel from "../models/userSchema";
import CVmodel from "../models/userCVSchema";

interface UpdateUserCvTitleBody {
  cvId: string;
  newTitle: string;
}

const updateUserCvTitle = async (req: Request<unknown, unknown, UpdateUserCvTitleBody>, res: Response): Promise<void> => {
  try {
    const { cvId, newTitle } = req.body;
    if (!cvId || !newTitle) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    await CVmodel.findByIdAndUpdate(cvId, { title: newTitle }).exec();
    res.status(200).json({ success: true, message: "CV title updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const fetchUserDashboardData = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userInfo) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const userCVs = await CVmodel.find({ userId: req.userInfo._id }).exec();

    res.status(200).json({ success: true, userCVs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const createNewCv = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userInfo) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const user = await UserModel.findById(req.userInfo._id).exec();
    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    user.subscription.cvUsed += 1;
    await user.save();

    // generate 6 digit random integer 
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const newTitle = `Untitled CV - ${randomId}`;

    const userNewCV = new CVmodel({ userId: req.userInfo._id, title: newTitle });
    const userCV = await userNewCV.save();
    res.status(201).json({ success: true, userCV, message: "Your CV file created. Now you can add info." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const deleteUserCv = async (req: Request<{ cvId: string }>, res: Response): Promise<void> => {
  try {
    const { cvId } = req.params;
    await CVmodel.findByIdAndDelete(cvId).exec();

    if (!req.userInfo) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const userCVs = await CVmodel.find({ userId: req.userInfo._id }).exec();

    res.status(200).json({ success: true, userCVs, message: "CV deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const toggleFavorite = async (req: Request<{ cvId: string }>, res: Response): Promise<void> => {
  try {
    if (!req.userInfo) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const { cvId } = req.params;
    const cv = await CVmodel.findById(cvId).exec();
    if (!cv) {
      res.status(404).json({ success: false, message: "CV not found" });
      return;
    }

    const newFavoriteState = !cv.isFavorite;
    await CVmodel.findByIdAndUpdate(cvId, { isFavorite: newFavoriteState }).exec();
    const userCVs = await CVmodel.find({ userId: req.userInfo._id }).exec();

    res.status(200).json({
      success: true,
      userCVs,
      message: newFavoriteState ? "CV added to favorites" : "CV removed from favorites",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const fetchFavoriteCVsOnly = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userInfo) {
      res.status(401).json({ success: false, message: "Unauthorized access" });
      return;
    }

    const userCVs = await CVmodel.find({ userId: req.userInfo._id, isFavorite: true }).exec();

    res.status(200).json({ success: true, userCVs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const fetchCurrentWorkingCV = async (req: Request<{ cvId: string }>, res: Response): Promise<void> => {
  try {
    const { cvId } = req.params;
    const userCurrentCV = await CVmodel.findOne({ _id: cvId }).exec();
    res.status(200).json({ success: true, userCurrentCV });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export { updateUserCvTitle, fetchUserDashboardData, createNewCv, deleteUserCv, toggleFavorite, fetchFavoriteCVsOnly, fetchCurrentWorkingCV };
