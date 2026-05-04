const express = require('express');
const cvRouter = express.Router();
const UserModel = require('../models/userSchema');
const CVmodel = require('../models/userCVSchema');
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const userAccessPermission = require("../middleware/authUserPermision");
const multer = require("multer");
const path = require("path");
const upload = require("../config/upload")


const { addNewSection, deleteSection, addSectionValue, deleteSectionValue } = require('../controller/addContent');
const { updateUserCvTitle, fetchUserDashboardData, createNewCv, deleteUserCv, toggleFavorite, fetchFavoriteCVsOnly, fetchCurrentWorkingCV } = require('../controller/userController');
const { deleteSectionData, updateDescription, updateUserContact, updateUserSkills, updateUserProjects, updateUserProfile } = require('../controller/HomeControll');
const { getUserDashboardAllData, viewCv } = require('../controller/userDashboardController');



cvRouter.get("/getUserDashboardAllData", userAccessPermission, getUserDashboardAllData);

cvRouter.get("/fetchUserDashboardData", userAccessPermission, fetchUserDashboardData)
cvRouter.get("/createUserNewCv", userAccessPermission, createNewCv)
cvRouter.get("/fetchFavoriteCVsOnly", userAccessPermission, fetchFavoriteCVsOnly)
cvRouter.delete("/deleteUserCv/:cvId", userAccessPermission, deleteUserCv)
cvRouter.patch("/toggleFavorite/:cvId", userAccessPermission, toggleFavorite)
cvRouter.get("/fetchCurrentWorkingCV/:cvId", userAccessPermission, fetchCurrentWorkingCV)


//for fetch user cv
cvRouter.post("/viewCV", viewCv)


// user dashboard activities
cvRouter.patch("/updateUserCvTitle", userAccessPermission, updateUserCvTitle);
//update user profile info including image

// configure multer
// route to update profile with image
// ---jodi local storage use kori image store korar jonno---------
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // upload directory (create if not exists)
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     const ext = path.extname(file.originalname);
//     cb(null, file.fieldname + "-" + uniqueSuffix + ext);
//   },
// });
// const upload = multer({ storage });

// cvRouter.post("/updateUserProfile", upload.single("photo"), async (req, res) => {
//   try {
//     const { userId, name, profession } = req.body;
//     console.log(userId,name,profession);

//     if (!userId || !name || !profession || !req.file) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const imagePath = req.file.filename; // only store file name
//     console.log(imagePath)

//     await CVmodel.updateOne(
//       { userId: userId },
//       {
//         $set: {
//           name,
//           profession,
//           images: imagePath,
//         }
//       },
//       { upsert: true }
//     );
//     res.status(200).json({ message: "Profile updated with image succesfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// });

// ---jodi cloud storage use kori image store korar jonno---------
cvRouter.post("/updateUserProfile", upload.single("photo"), updateUserProfile);

//update user description
cvRouter.post("/updateUserDescription", updateDescription)
//update user contact
cvRouter.post("/updateUserContact", updateUserContact);
//update user skills
cvRouter.post("/updateUserSkills", updateUserSkills);


//update or delete user projects
cvRouter.post("/updateUserProjects", updateUserProjects)

//update user experience
cvRouter.post("/updateUserExperience", async (req, res, next) => {
  try {
    const { cvId, organizationName, organizationAddress, joiningDate, endingDate, position, jobDescription } = req.body;
    if (!cvId || !organizationName || !organizationAddress || !joiningDate || !endingDate || !position || !jobDescription) {

      return res.status(401).json({ message: "Input field not filled" });
    }

    //finding this user cv
    const userCV = await CVmodel.findOne({ _id: cvId });
    if (!userCV) {
      return res.status(401).json({ message: "User cv not found" });
    }

    userCV.experience.push({ organizationName, organizationAddress, joiningDate, endingDate, position, jobDescription });
    await userCV.save();

    res.status(200).json({ success: true, updatedCV: userCV, message: "Your experience added succesfully." });
  } catch (error) {
    next(error);
  }
})
//update user education
cvRouter.post("/updateUserEducation", async (req, res, next) => {
  try {
    const { cvId, educationQualification, educationInstitutionName, startingDate, endingDate } = req.body;
    if (!cvId || !educationQualification || !educationInstitutionName || !startingDate || !endingDate) {
      return res.status(401).json({ message: "Input field not filled" });
    }
    const userCV = await CVmodel.findOne({ _id: cvId });
    if (!userCV) {
      return res.status(401).json({ message: "User cv not found" });
    }
    userCV.education.push({ educationQualification, educationInstitutionName, startingDate, endingDate });
    await userCV.save();
    res.status(200).json({ success: true, updatedCV: userCV, message: "Your education added succesfully." });
  } catch (error) {
    next(error);
  }
})
//update user acheivement
cvRouter.post("/updateUserAcheivement", async (req, res, next) => {
  try {
    const { cvId, acheivement } = req.body;
    if (!cvId || !acheivement) {
      return res.status(401).json({ message: "Input field not filled" });
    }
    const userCV = await CVmodel.findOne({ _id: cvId });
    if (!userCV) {
      return res.status(401).json({ message: "User cv not found" });
    }
    userCV.achievement.push(acheivement);
    await userCV.save();
    res.status(200).json({ success: true, updatedCV: userCV, message: "Your acheivement added succesfully." });
  } catch (error) {
    next(error);
  }
})
//update user activities
cvRouter.post("/updateUserActivities", async (req, res, next) => {
  try {
    const { cvId, activities } = req.body;
    if (!cvId || !activities) {
      return res.status(401).json({ message: "Input field not filled" });
    }
    const userCV = await CVmodel.findOne({ _id: cvId });
    if (!userCV) {
      return res.status(401).json({ message: "User cv not found" });
    }
    userCV.activities.push(activities);
    await userCV.save();
    res.status(200).json({ success: true, updatedCV: userCV, message: "Your activities added succesfully." });
  } catch (error) {
    next(error);
  }
})

// Update user references (Add a new reference)
cvRouter.post("/updateUserReference", async (req, res) => {
  const { cvId, referenceName, referenceCompany, referenceEmail, referencePhone } = req.body;

  try {
    const userCV = await CVmodel.findOne({ _id: cvId });

    if (!userCV) {
      return res.status(404).json({ message: "User CV not found" });
    }

    const newReference = {
      referenceName,
      referenceCompany,
      referenceEmail,
      referencePhone,
    };

    // Initialize reference array if undefined
    if (!userCV.reference) {
      userCV.reference = [];
    }

    // Push new reference
    userCV.reference.push(newReference);

    // Save the updated CV
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
});

cvRouter.post("/addNewSectionAgain", async (req, res) => {
  const { cvId, sectionName } = req.body;
  try {
    const userCV = await CVmodel.findOne({ _id: cvId });

    if (!userCV) {
      return res.status(404).json({ message: "User CV not found" });
    }

    // Add new section to otherSection array
    userCV.otherSection.push({ sectionName });

    // Save the updated CV
    const updatedCV = await userCV.save();

    res.status(200).json({
      success: true,
      message: "New section added successfully!",
      updatedCV,
    });
  } catch (error) {
    console.error("Error adding new section:", error);
    res.status(500).json({ message: "Server error while adding new section" });
  }
});

//delete items from cv while customize section
cvRouter.post("/deleteItems", async (req, res, next) => {
  try {
    const { cvId, pageName, indexToDelete } = req.body;
    const CV = await CVmodel.findOne({ _id: cvId });
    if (!CV) {
      return res.status(400).json({ message: "Not deleted" });
    }

    if (pageName === "projects") {
      CV.projects.splice(indexToDelete, 1); // 1 item will be deleted from that index     
    } else if (pageName === "experience") {
      CV.experience.splice(indexToDelete, 1); // 1 item will be deleted from that index       
    } else if (pageName === "education") {
      CV.education.splice(indexToDelete, 1); // 1 item will be deleted from that index       
    } else if (pageName === "acheivement") {
      CV.acheivement.splice(indexToDelete, 1); // 1 item will be deleted from that index       
    } else if (pageName === "activities") {
      CV.activities.splice(indexToDelete, 1); // 1 item will be deleted from that index       
    } else if (pageName === "reference") {
      CV.reference.splice(indexToDelete, 1); // 1 item will be deleted from that index       
    }

    await CV.save();

    res.status(200).json({ success: true, updatedCV: CV, message: "Deleted succesfully" });
  } catch (error) {
    console.log("server error during delete : ", error);
    next(error);
  }
})

//add new section
cvRouter.post("/addNewSection", userAccessPermission, async (req, res, next) => {
  try {
    const userCV = await CVmodel.findOne({ _id: req.body.cvId })
    if (!userCV) return res.status(400).json({ message: "New section not added!" })

    userCV.otherSection.push({ sectionName: req.body.sectionName });
    const updatedCV = await userCV.save();

    res.status(200).json({ updatedCV, message: "New section added!" })
  } catch (error) {
    console.log("catch is catching error : ", error);
    next(error);
  }
});

cvRouter.post("/deleteSection", userAccessPermission, deleteSection);

cvRouter.post("/addSectionValue", userAccessPermission, addSectionValue);
cvRouter.post("/deleteSectionValue", userAccessPermission, deleteSectionValue);

cvRouter.post("/deleteMainSectionContentInside", userAccessPermission, deleteSectionData)


module.exports = cvRouter;