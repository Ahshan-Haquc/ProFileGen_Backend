import express, { type Request, type Response, type NextFunction } from "express";
import CVmodel from "../models/userCVSchema";
import userAccessPermission from "../middleware/authUserPermision";
import upload from "../config/upload";
import { addNewSection, deleteSection, addSectionValue, deleteSectionValue } from "../controller/addContent";
import { updateUserCvTitle, fetchUserDashboardData, createNewCv, deleteUserCv, toggleFavorite, fetchFavoriteCVsOnly, fetchCurrentWorkingCV } from "../controller/userController";
import { deleteSectionData, updateDescription, updateUserContact, updateUserSkills, updateUserProjects, updateUserProfile } from "../controller/HomeControll";
import { getUserDashboardAllData, viewCv } from "../controller/userDashboardController";
import checkCVLimit from "../middleware/checkCvLimit";

const cvRouter = express.Router();

cvRouter.get("/getUserDashboardAllData", userAccessPermission, getUserDashboardAllData);
cvRouter.get("/fetchUserDashboardData", userAccessPermission, fetchUserDashboardData);
cvRouter.post("/createUserNewCv", userAccessPermission, checkCVLimit, createNewCv);
cvRouter.get("/fetchFavoriteCVsOnly", userAccessPermission, fetchFavoriteCVsOnly);
cvRouter.delete("/deleteUserCv/:cvId", userAccessPermission, deleteUserCv);
cvRouter.patch("/toggleFavorite/:cvId", userAccessPermission, toggleFavorite);
cvRouter.get("/fetchCurrentWorkingCV/:cvId", userAccessPermission, fetchCurrentWorkingCV);
cvRouter.post("/viewCV", viewCv);
cvRouter.patch("/updateUserCvTitle", userAccessPermission, updateUserCvTitle);
cvRouter.post("/updateUserProfile", upload.single("photo"), updateUserProfile);
cvRouter.post("/updateUserDescription", updateDescription);
cvRouter.post("/updateUserContact", updateUserContact);
cvRouter.post("/updateUserSkills", updateUserSkills);
cvRouter.post("/updateUserProjects", updateUserProjects);

cvRouter.post(
  "/updateUserExperience",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { cvId, organizationName, organizationAddress, joiningDate, endingDate, position, jobDescription } = req.body;
      if (!cvId || !organizationName || !organizationAddress || !joiningDate || !endingDate || !position || !jobDescription) {
        res.status(401).json({ message: "Input field not filled" });
        return;
      }

      const userCV = await CVmodel.findOne({ _id: cvId }).exec();
      if (!userCV) {
        res.status(401).json({ message: "User cv not found" });
        return;
      }

      userCV.experience.push({ organizationName, organizationAddress, joiningDate, endingDate, position, jobDescription });
      await userCV.save();

      res.status(200).json({ success: true, updatedCV: userCV, message: "Your experience added succesfully." });
    } catch (error) {
      next(error);
    }
  }
);

cvRouter.post(
  "/updateUserEducation",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { cvId, educationQualification, educationInstitutionName, startingDate, endingDate } = req.body;
      if (!cvId || !educationQualification || !educationInstitutionName || !startingDate || !endingDate) {
        res.status(401).json({ message: "Input field not filled" });
        return;
      }

      const userCV = await CVmodel.findOne({ _id: cvId }).exec();
      if (!userCV) {
        res.status(401).json({ message: "User cv not found" });
        return;
      }

      userCV.education.push({ educationQualification, educationInstitutionName, startingDate, endingDate });
      await userCV.save();
      res.status(200).json({ success: true, updatedCV: userCV, message: "Your education added succesfully." });
    } catch (error) {
      next(error);
    }
  }
);

cvRouter.post(
  "/updateUserAcheivement",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { cvId, acheivement } = req.body;
      if (!cvId || !acheivement) {
        res.status(401).json({ message: "Input field not filled" });
        return;
      }

      const userCV = await CVmodel.findOne({ _id: cvId }).exec();
      if (!userCV) {
        res.status(401).json({ message: "User cv not found" });
        return;
      }

      userCV.achievement.push(acheivement);
      await userCV.save();
      res.status(200).json({ success: true, updatedCV: userCV, message: "Your acheivement added succesfully." });
    } catch (error) {
      next(error);
    }
  }
);

cvRouter.post(
  "/updateUserActivities",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { cvId, activities } = req.body;
      if (!cvId || !activities) {
        res.status(401).json({ message: "Input field not filled" });
        return;
      }

      const userCV = await CVmodel.findOne({ _id: cvId }).exec();
      if (!userCV) {
        res.status(401).json({ message: "User cv not found" });
        return;
      }

      userCV.activities.push(activities as string);
      await userCV.save();
      res.status(200).json({ success: true, updatedCV: userCV, message: "Your activities added succesfully." });
    } catch (error) {
      next(error);
    }
  }
);

cvRouter.post(
  "/updateUserReference",
  async (req: Request, res: Response): Promise<void> => {
    const { cvId, referenceName, referenceCompany, referenceEmail, referencePhone } = req.body;

    try {
      const userCV = await CVmodel.findOne({ _id: cvId }).exec();

      if (!userCV) {
        res.status(404).json({ message: "User CV not found" });
        return;
      }

      const newReference = {
        referenceName,
        referenceCompany,
        referenceEmail,
        referencePhone,
      };

      if (!userCV.reference) {
        userCV.reference = [];
      }

      userCV.reference.push(newReference);
      const updatedCV = await userCV.save();

      res.status(200).json({
        success: true,
        message: "Reference added successfully!",
        updatedCV,
      });
    } catch (error) {
      console.error("Error updating reference:", error);
      res.status(500).json({ message: "Server error while adding reference" });
    }
  }
);

cvRouter.post(
  "/addNewSectionAgain",
  async (req: Request, res: Response): Promise<void> => {
    const { cvId, sectionName } = req.body;
    try {
      const userCV = await CVmodel.findOne({ _id: cvId }).exec();

      if (!userCV) {
        res.status(404).json({ message: "User CV not found" });
        return;
      }

      userCV.otherSection.push({ sectionName, sectionValues: [] });
      const updatedCV = await userCV.save();

      res.status(200).json({ success: true, message: "New section added successfully!", updatedCV });
    } catch (error) {
      console.error("Error adding new section:", error);
      res.status(500).json({ message: "Server error while adding new section" });
    }
  }
);

cvRouter.post(
  "/deleteItems",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { cvId, pageName, indexToDelete } = req.body;
      const CV = await CVmodel.findOne({ _id: cvId }).exec();
      if (!CV) {
        res.status(400).json({ message: "Not deleted" });
        return;
      }

      if (pageName === "projects") {
        CV.projects.splice(indexToDelete, 1);
      } else if (pageName === "experience") {
        CV.experience.splice(indexToDelete, 1);
      } else if (pageName === "education") {
        CV.education.splice(indexToDelete, 1);
      } else if (pageName === "acheivement") {
        CV.achievement.splice(indexToDelete, 1);
      } else if (pageName === "activities") {
        CV.activities.splice(indexToDelete, 1);
      } else if (pageName === "reference") {
        CV.reference.splice(indexToDelete, 1);
      }

      await CV.save();

      res.status(200).json({ success: true, updatedCV: CV, message: "Deleted succesfully" });
    } catch (error) {
      console.log("server error during delete : ", error);
      next(error);
    }
  }
);

cvRouter.post("/addNewSection", userAccessPermission, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userCV = await CVmodel.findOne({ _id: req.body.cvId }).exec();
    if (!userCV) {
      res.status(400).json({ message: "New section not added!" });
      return;
    }

    userCV.otherSection.push({ sectionName: req.body.sectionName, sectionValues: [] });
    const updatedCV = await userCV.save();

    res.status(200).json({ updatedCV, message: "New section added!" });
  } catch (error) {
    console.log("catch is catching error : ", error);
    next(error);
  }
});

cvRouter.post("/deleteSection", userAccessPermission, deleteSection);
cvRouter.post("/addSectionValue", userAccessPermission, addSectionValue);
cvRouter.post("/deleteSectionValue", userAccessPermission, deleteSectionValue);
cvRouter.post("/deleteMainSectionContentInside", userAccessPermission, deleteSectionData);

export default cvRouter;
