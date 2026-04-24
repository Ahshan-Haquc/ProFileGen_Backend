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


const {addNewSection, deleteSection, addSectionValue, deleteSectionValue} = require('../controller/addContent');
const {updateUserCvTitle, fetchUserDashboardData, createNewCv, deleteUserCv, toggleFavorite, fetchFavoriteCVsOnly, fetchCurrentWorkingCV} = require('../controller/userController');
const { deleteSectionData } = require('../controller/HomeControll');
const { adminSignup } = require('../controller/auth');


cvRouter.get("/",(req,res,next)=>{
    try {
        console.log(" to home page.");
        res.status(200).json({message:"wel to ho me page."});
    } catch (error) {
        next(error);
    }
})

cvRouter.post("/userSignup",async(req,res,next)=>{
    console.log("working on singup router 1")
    try {
        const {email, password, name} = req.body;
        if(!email || !password){
           return res.status(401).json({message:"Please enter email or password."})
        }

        const encryptedPassword = await bcrypt.hash(password,10);

        const NewUser = new UserModel({
            email:email, password:encryptedPassword, name:name
        })
        const userInfo = await NewUser.save();

        
        res.status(200).json({message:"Signup succesfull."});
    } catch (error) {
        next(error);
    }
})

cvRouter.post("/auth/admin/signup",adminSignup)

cvRouter.post("/userLogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    // Generate JWT token (assumes generateToken includes role info)
    const token = await user.generateToken();

    // Set token in HTTP-only cookie - eita kaj kore localhost a run krle
    // res.cookie("userCookie", token, {
    //   httpOnly: true,
    //   secure: false, 
    //   expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    // });

    //eita kaj korbe deploye korle
    res.cookie("userCookie", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // only true in production
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
});


    // Final response with role
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


cvRouter.get("/userLogout", userAccessPermission, async (req, res, next) => {
    console.log("Request recieved in logout router");
  try {
    const user = await UserModel.findOne({ _id: req.userInfo._id });

    if (user) {
      user.tokens = [];
      await user.save();
    }

    res.clearCookie("userCookie", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Error in logout router");
    next(error);
  }
});


cvRouter.get("/me",userAccessPermission,  async (req, res) => {
    console.log("working on me router")
  res.status(200).json({ userInfo: req.userInfo });
});

//for fetch user cv
cvRouter.post("/viewCV",async(req,res,next)=>{
    try {
        const userCV = await CVmodel.findOne({userId:req.body.userId});
        if(!userCV){
            res.status(400).json({message:"User CV not found"});
        }
       res.status(200).json({userCV});
    } catch (error) {
        console.log("Error in server : ",error);
        next(error);
    }
})


// -------------user dashboard activities---------------
cvRouter.patch("/updateUserCvTitle",userAccessPermission,updateUserCvTitle);
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
cvRouter.post("/updateUserProfile", upload.single("photo"), async (req, res) => {
  try {
    const { userId, name, profession } = req.body;

    if (!userId || !name || !profession) {
      return res.status(400).json({ message: "All fields required" });
    }

    let updateData = { name, profession };

    if (req.file && req.file.path) {
      // Cloudinary auto provides a secure URL in req.file.path
      updateData.images = req.file.path;
    }

    await CVmodel.updateOne(
      { userId },
      { $set: updateData },
      { upsert: true }
    );

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

//update user description
cvRouter.post("/updateUserDescription",async(req,res,next)=>{
    
    try {
        const {cvId, userDescription}= req.body;
        if(!cvId || !userDescription){
            return res.status(400).json({message:"Input field not filled"});
        }
        await CVmodel.updateOne(
            {_id:cvId},
            {
                $set:{
                    description:userDescription
                }
            }
        )
        res.status(200).json({success: true, message:"Your description updated succesfully."});
    } catch (error) {
        next(error);
    }
})
//update user contact
cvRouter.post("/updateUserContact", async (req, res, next) => {
    try {
        const {
            cvId,
            phoneNumber,
            emailId,
            linkedInId,
            githubId,
            portfolioLink,
            address
        } = req.body;

        if (
            !cvId ||
            !phoneNumber ||
            !emailId ||
            !linkedInId ||
            !githubId ||
            !portfolioLink ||
            !address
        ) {
            return res.status(401).json({ message: "Input field not filled" });
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
                    address
                }
            }
        );
        res.status(200).json({ success:true, message: "Your contact updated succesfully." });
    } catch (error) {
        next(error);
    }
});
//update user skills
cvRouter.post("/updateUserSkills", async (req, res) => {
  const { cvId, skills } = req.body;

  try {
    const userCV = await CVmodel.findOne({ _id: cvId });

    if (!userCV) {
      return res.status(404).json({ message: "User CV not found" });
    }

    userCV.skills = skills;

    await userCV.save();

    return res.status(200).json({ message: "Skills updated", updatedCV: userCV });
  } catch (error) {
    console.error("Error updating skills:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


//update or delete user projects
cvRouter.post("/updateUserProjects",async(req,res,next)=>{
    try {
        const {cvId, projectName, projectDescription, projectToolsAndTechnologies}= req.body;
        if(!cvId || !projectName || !projectDescription || !projectToolsAndTechnologies){
            return res.status(401).json({message:"Input field not filled"});
        }
        const userCV = await CVmodel.findOne({_id: cvId});
        if(!userCV){
            return res.status(400).json({message:"User cv not found"});
        }
        userCV.projects.push({projectName,projectDescription,projectToolsAndTechnologies});
        await userCV.save();
        res.status(200).json({updatedCV:userCV,message:"Your project updated succesfully."});
    } catch (error) {
        next(error);
    }
})

//update user experience
cvRouter.post("/updateUserExperience",async(req,res,next)=>{
    try {
        const {cvId, organizationName,organizationAddress, joiningDate,endingDate,position,jobDescription }= req.body;
        if(!cvId || !organizationName || !organizationAddress || !joiningDate || !endingDate || !position || !jobDescription){

            return res.status(401).json({message:"Input field not filled"});
        }

        //finding this user cv
        const userCV = await CVmodel.findOne({_id: cvId}); 
        if(!userCV){
            return res.status(401).json({message:"User cv not found"});
        }

        userCV.experience.push({organizationName,organizationAddress, joiningDate,endingDate,position,jobDescription});
        await userCV.save();

        res.status(200).json({success: true,updatedCV:userCV,message:"Your experience added succesfully."});
    } catch (error) {
        next(error);
    }
})
//update user education
cvRouter.post("/updateUserEducation",async(req,res,next)=>{
    try {
        const {cvId, educationQualification, educationInstitutionName, startingDate, endingDate}= req.body;
        if(!cvId || !educationQualification || !educationInstitutionName || !startingDate || !endingDate){
            return res.status(401).json({message:"Input field not filled"});
        }
        const userCV = await CVmodel.findOne({_id: cvId});
        if(!userCV){
            return res.status(401).json({message:"User cv not found"});
        }
        userCV.education.push({educationQualification, educationInstitutionName, startingDate, endingDate});
        await userCV.save();
        res.status(200).json({success: true, updatedCV:userCV,message:"Your education added succesfully."});
    } catch (error) {
        next(error);
    }
})
//update user acheivement
cvRouter.post("/updateUserAcheivement",async(req,res,next)=>{
    try {
        const {cvId, acheivement}= req.body;
        if(!cvId || !acheivement){
            return res.status(401).json({message:"Input field not filled"});
        }
        const userCV = await CVmodel.findOne({_id: cvId});
        if(!userCV){
            return res.status(401).json({message:"User cv not found"});
        }
        userCV.achievement.push(acheivement);
        await userCV.save();
        res.status(200).json({success: true, updatedCV:userCV,message:"Your acheivement added succesfully."});
    } catch (error) {
        next(error);
    }
})
//update user activities
cvRouter.post("/updateUserActivities",async(req,res,next)=>{
    try {
        const {cvId, activities}= req.body;
        if(!cvId || !activities){
            return res.status(401).json({message:"Input field not filled"});
        }
        const userCV = await CVmodel.findOne({_id: cvId});
        if(!userCV){
            return res.status(401).json({message:"User cv not found"});
        }
        userCV.activities.push(activities);
        await userCV.save();
        res.status(200).json({success: true, updatedCV:userCV,message:"Your activities added succesfully."});
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
cvRouter.post("/deleteItems", async(req,res,next)=>{
    try {
        const {cvId, pageName, indexToDelete} = req.body;
        const CV = await CVmodel.findOne({_id: cvId}); 
        if(!CV){
            return res.status(400).json({message:"Not deleted"});
        }

        if(pageName==="projects"){
            CV.projects.splice(indexToDelete, 1); // 1 item will be deleted from that index     
        }else if(pageName==="experience"){
            CV.experience.splice(indexToDelete, 1); // 1 item will be deleted from that index       
        }else if(pageName==="education"){
            CV.education.splice(indexToDelete, 1); // 1 item will be deleted from that index       
        }else if(pageName==="acheivement"){
            CV.acheivement.splice(indexToDelete, 1); // 1 item will be deleted from that index       
        }else if(pageName==="activities"){
            CV.activities.splice(indexToDelete, 1); // 1 item will be deleted from that index       
        }else if(pageName==="reference"){
            CV.reference.splice(indexToDelete, 1); // 1 item will be deleted from that index       
        }

        await CV.save();

        res.status(200).json({success: true, updatedCV:CV,message:"Deleted succesfully"});
    } catch (error) {
        console.log("server error during delete : ",error);
        next(error);
    }
})

//add new section
cvRouter.post("/addNewSection",userAccessPermission,async (req,res,next)=>{
    try {
        const userCV = await CVmodel.findOne({_id : req.body.cvId})
        if(!userCV) return res.status(400).json({message:"New section not added!"})
        
        userCV.otherSection.push({sectionName: req.body.sectionName});
        const updatedCV = await userCV.save();

        res.status(200).json({updatedCV, message:"New section added!"})
    } catch (error) {
        console.log("catch is catching error : ",error);
        next(error);
    }
});

cvRouter.post("/deleteSection", userAccessPermission, deleteSection);

cvRouter.post("/addSectionValue", userAccessPermission, addSectionValue);
cvRouter.post("/deleteSectionValue", userAccessPermission, deleteSectionValue);

cvRouter.post("/deleteMainSectionContentInside", userAccessPermission, deleteSectionData)

cvRouter.get("/fetchUserDashboardData",userAccessPermission, fetchUserDashboardData)
cvRouter.get("/createUserNewCv", userAccessPermission, createNewCv)
cvRouter.get("/fetchFavoriteCVsOnly", userAccessPermission, fetchFavoriteCVsOnly)
cvRouter.delete("/deleteUserCv/:cvId", userAccessPermission, deleteUserCv)
cvRouter.patch("/toggleFavorite/:cvId",userAccessPermission, toggleFavorite)
cvRouter.get("/fetchCurrentWorkingCV/:cvId",userAccessPermission, fetchCurrentWorkingCV)

module.exports = cvRouter;