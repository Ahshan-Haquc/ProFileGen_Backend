import type { Request, Response, NextFunction } from "express";
import UserCVModel from "../models/userCVSchema";

interface SectionRequestBody {
  cvId: string;
  sectionName?: string;
  sectionIndex?: number;
  newValue?: string;
  valueIndex?: number;
}

const addNewSection = async (req: Request<unknown, unknown, SectionRequestBody>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userCV = await UserCVModel.findOne({ _id: req.body.cvId }).exec();
    if (!userCV) {
      res.status(400).json({ message: "New section not added!" });
      return;
    }

    userCV.otherSection.push({ sectionName: req.body.sectionName ?? "", sectionValues: [] });
    const updatedCV = await userCV.save();

    res.status(200).json({ updatedCV, message: "New section added!" });
  } catch (error) {
    console.log("catch is catching error : ", error);
    next(error);
  }
};

const deleteSection = async (req: Request<unknown, unknown, SectionRequestBody>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userCV = await UserCVModel.findOne({ _id: req.body.cvId }).exec();
    if (!userCV) {
      res.status(400).json({ error: "User CV not found" });
      return;
    }

    const index = req.body.sectionIndex ?? -1;
    if (index < 0 || index >= userCV.otherSection.length) {
      res.status(400).json({ error: "Invalid section index" });
      return;
    }

    userCV.otherSection.splice(index, 1);
    const updatedCV = await userCV.save();

    res.status(200).json({ updatedCV, message: "Section deleted successfully!" });
  } catch (err) {
    console.log("Error deleting section:", err);
    next(err);
  }
};

const addSectionValue = async (req: Request<unknown, unknown, SectionRequestBody>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sectionIndex, newValue } = req.body;
    const userCV = await UserCVModel.findOne({ _id: req.body.cvId }).exec();

    if (!userCV) {
      res.status(404).json({ error: "User CV not found" });
      return;
    }

    if (sectionIndex === undefined || sectionIndex < 0 || sectionIndex >= userCV.otherSection.length) {
      res.status(400).json({ error: "Invalid section index" });
      return;
    }

    userCV.otherSection[sectionIndex].sectionValues.push(newValue ?? "");
    const updatedCV = await userCV.save();

    res.status(200).json({ updatedCV, message: "Content added successfully!" });
  } catch (err) {
    console.error("Error adding section value:", err);
    next(err);
  }
};

const deleteSectionValue = async (req: Request<unknown, unknown, SectionRequestBody>, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sectionIndex, valueIndex } = req.body;
    const userCV = await UserCVModel.findOne({ _id: req.body.cvId }).exec();

    if (!userCV) {
      res.status(404).json({ error: "User CV not found" });
      return;
    }

    if (
      sectionIndex === undefined ||
      valueIndex === undefined ||
      sectionIndex < 0 ||
      sectionIndex >= userCV.otherSection.length ||
      valueIndex < 0 ||
      valueIndex >= userCV.otherSection[sectionIndex].sectionValues.length
    ) {
      res.status(400).json({ error: "Invalid index" });
      return;
    }

    userCV.otherSection[sectionIndex].sectionValues.splice(valueIndex, 1);
    const updatedCV = await userCV.save();

    res.status(200).json({ updatedCV, message: "Content deleted successfully!" });
  } catch (err) {
    console.error("Error deleting section value:", err);
    next(err);
  }
};

export { addNewSection, deleteSection, addSectionValue, deleteSectionValue };
