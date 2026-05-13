import type { Request, Response, NextFunction } from "express";
import type { IProject } from "../models/userCVSchema";
import CVmodel from "../models/userCVSchema";

interface UpdateUserProfileBody {
  userId: string;
  name: string;
  profession: string;
}

interface DeleteSectionDataBody {
  sectionName: string;
}

interface UpdateDescriptionBody {
  cvId: string;
  userDescription: string;
}

interface UpdateUserContactBody {
  cvId: string;
  phoneNumber: string;
  emailId: string;
  linkedInId: string;
  githubId: string;
  portfolioLink: string;
  address: string;
}

interface UpdateUserSkillsBody {
  cvId: string;
  skills: Record<string, unknown>;
}

interface UpdateUserProjectsBody {
  cvId: string;
  projectName: string;
  projectDescription: string;
  projectToolsAndTechnologies: string;
}

const updateUserProfile = async (
  req: Request<unknown, unknown, UpdateUserProfileBody>,
  res: Response
): Promise<void> => {
  try {
    const { userId, name, profession } = req.body;

    if (!userId || !name || !profession) {
      res.status(400).json({ message: "All fields required" });
      return;
    }

    const updateData: Record<string, unknown> = { name, profession };

    if (req.file) {
      const filePath =
        (req.file as any).path ??
        (req.file as any).location ??
        (req.file as any).secure_url ??
        (req.file as any).url;

      if (typeof filePath === "string") {
        updateData.images = filePath;
      }
    }

    const updatedCV = await CVmodel.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    ).exec();

    if (!updatedCV) {
      res.status(500).json({ success: false, message: "Unable to update profile" });
      return;
    }

    res.status(200).json({ success: true, message: "Profile updated successfully", updatedCV });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteSectionData = async (
  req: Request<unknown, unknown, DeleteSectionDataBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userInfo) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    const sectionName = req.body.sectionName;
    await CVmodel.updateOne({ userId: req.userInfo._id }, { $set: { [sectionName ?? ""]: [] } }).exec();

    const updatedCV = await CVmodel.findOne({ userId: req.userInfo._id }).exec();
    res.status(200).json({ updatedCV, message: "Deleted successfully" });
  } catch (error) {
    console.log("Error in deleting section data : ", error);
    next(error);
  }
};

const updateDescription = async (
  req: Request<unknown, unknown, UpdateDescriptionBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cvId, userDescription } = req.body;
    if (!cvId || !userDescription) {
      res.status(400).json({ message: "Input field not filled" });
      return;
    }

    await CVmodel.updateOne({ _id: cvId }, { $set: { description: userDescription } }).exec();
    res.status(200).json({ success: true, message: "Your description updated succesfully." });
  } catch (error) {
    next(error);
  }
};

const updateUserContact = async (
  req: Request<unknown, unknown, UpdateUserContactBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cvId, phoneNumber, emailId, linkedInId, githubId, portfolioLink, address } = req.body;

    if (!cvId || !phoneNumber || !emailId || !linkedInId || !githubId || !portfolioLink || !address) {
      res.status(401).json({ message: "Input field not filled" });
      return;
    }

    await CVmodel.updateOne(
      { _id: cvId },
      {
        $set: {
          phoneNumber,
          emailId,
          linkedInId,
          githubId,
          portfolioLink,
          address,
        },
      }
    ).exec();
    res.status(200).json({ success: true, message: "Your contact updated succesfully." });
  } catch (error) {
    next(error);
  }
};

const updateUserSkills = async (
  req: Request<unknown, unknown, UpdateUserSkillsBody>,
  res: Response
): Promise<void> => {
  let { cvId, skills } = req.body;

  if (!skills || typeof skills !== "object") {
    res.status(400).json({ message: "Skills object is required" });
    return;
  }

  if (!cvId && req.userInfo) {
    const latestUserCV = await CVmodel.findOne({ userId: req.userInfo._id }).sort({ updatedAt: -1 }).exec();
    cvId = latestUserCV?._id?.toString() || "";
  }

  if (!cvId) {
    res.status(400).json({ message: "CV id is required" });
    return;
  }

  try {
    const userCV = await CVmodel.findOne({ _id: cvId }).exec();

    if (!userCV) {
      res.status(404).json({ message: "User CV not found" });
      return;
    }

    userCV.skills = skills;
    userCV.markModified("skills");
    await userCV.save();

    res.status(200).json({ message: "Skills updated", updatedCV: userCV });
  } catch (error) {
    console.error("Error updating skills:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserProjects = async (
  req: Request<unknown, unknown, UpdateUserProjectsBody>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { cvId, projectName, projectDescription, projectToolsAndTechnologies } = req.body;
    if (!cvId || !projectName || !projectDescription || !projectToolsAndTechnologies) {
      res.status(401).json({ message: "Input field not filled" });
      return;
    }

    const userCV = await CVmodel.findOne({ _id: cvId }).exec();
    if (!userCV) {
      res.status(400).json({ message: "User cv not found" });
      return;
    }

    const newProject: IProject = {
      projectName,
      projectDescription,
      projectToolsAndTechnologies,
    };

    userCV.projects.push(newProject);
    await userCV.save();
    res.status(200).json({ updatedCV: userCV, message: "Your project updated succesfully." });
  } catch (error) {
    next(error);
  }
};

export { updateUserProfile, deleteSectionData, updateDescription, updateUserContact, updateUserSkills, updateUserProjects };
