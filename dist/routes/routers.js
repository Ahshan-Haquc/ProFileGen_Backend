"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userCVSchema_1 = __importDefault(require("../models/userCVSchema"));
const authUserPermision_1 = __importDefault(require("../middleware/authUserPermision"));
const upload_1 = __importDefault(require("../config/upload"));
const addContent_1 = require("../controller/addContent");
const userController_1 = require("../controller/userController");
const HomeControll_1 = require("../controller/HomeControll");
const userDashboardController_1 = require("../controller/userDashboardController");
const checkCvLimit_1 = __importDefault(require("../middleware/checkCvLimit"));
const cvRouter = express_1.default.Router();
cvRouter.get("/getUserDashboardAllData", authUserPermision_1.default, userDashboardController_1.getUserDashboardAllData);
cvRouter.get("/fetchUserDashboardData", authUserPermision_1.default, userController_1.fetchUserDashboardData);
cvRouter.post("/createUserNewCv", authUserPermision_1.default, checkCvLimit_1.default, userController_1.createNewCv);
cvRouter.get("/fetchFavoriteCVsOnly", authUserPermision_1.default, userController_1.fetchFavoriteCVsOnly);
cvRouter.delete("/deleteUserCv/:cvId", authUserPermision_1.default, userController_1.deleteUserCv);
cvRouter.patch("/toggleFavorite/:cvId", authUserPermision_1.default, userController_1.toggleFavorite);
cvRouter.get("/fetchCurrentWorkingCV/:cvId", authUserPermision_1.default, userController_1.fetchCurrentWorkingCV);
cvRouter.post("/viewCV", userDashboardController_1.viewCv);
cvRouter.patch("/updateUserCvTitle", authUserPermision_1.default, userController_1.updateUserCvTitle);
cvRouter.post("/updateUserProfile", upload_1.default.single("photo"), HomeControll_1.updateUserProfile);
cvRouter.post("/updateUserDescription", HomeControll_1.updateDescription);
cvRouter.post("/updateUserContact", HomeControll_1.updateUserContact);
cvRouter.post("/updateUserSkills", HomeControll_1.updateUserSkills);
cvRouter.post("/updateUserProjects", HomeControll_1.updateUserProjects);
cvRouter.post("/updateUserExperience", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cvId, organizationName, organizationAddress, joiningDate, endingDate, position, jobDescription } = req.body;
        if (!cvId || !organizationName || !organizationAddress || !joiningDate || !endingDate || !position || !jobDescription) {
            res.status(401).json({ message: "Input field not filled" });
            return;
        }
        const userCV = yield userCVSchema_1.default.findOne({ _id: cvId }).exec();
        if (!userCV) {
            res.status(401).json({ message: "User cv not found" });
            return;
        }
        userCV.experience.push({ organizationName, organizationAddress, joiningDate, endingDate, position, jobDescription });
        yield userCV.save();
        res.status(200).json({ success: true, updatedCV: userCV, message: "Your experience added succesfully." });
    }
    catch (error) {
        next(error);
    }
}));
cvRouter.post("/updateUserEducation", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cvId, educationQualification, educationInstitutionName, startingDate, endingDate } = req.body;
        if (!cvId || !educationQualification || !educationInstitutionName || !startingDate || !endingDate) {
            res.status(401).json({ message: "Input field not filled" });
            return;
        }
        const userCV = yield userCVSchema_1.default.findOne({ _id: cvId }).exec();
        if (!userCV) {
            res.status(401).json({ message: "User cv not found" });
            return;
        }
        userCV.education.push({ educationQualification, educationInstitutionName, startingDate, endingDate });
        yield userCV.save();
        res.status(200).json({ success: true, updatedCV: userCV, message: "Your education added succesfully." });
    }
    catch (error) {
        next(error);
    }
}));
cvRouter.post("/updateUserAcheivement", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cvId, acheivement } = req.body;
        if (!cvId || !acheivement) {
            res.status(401).json({ message: "Input field not filled" });
            return;
        }
        const userCV = yield userCVSchema_1.default.findOne({ _id: cvId }).exec();
        if (!userCV) {
            res.status(401).json({ message: "User cv not found" });
            return;
        }
        userCV.achievement.push(acheivement);
        yield userCV.save();
        res.status(200).json({ success: true, updatedCV: userCV, message: "Your acheivement added succesfully." });
    }
    catch (error) {
        next(error);
    }
}));
cvRouter.post("/updateUserActivities", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cvId, activities } = req.body;
        if (!cvId || !activities) {
            res.status(401).json({ message: "Input field not filled" });
            return;
        }
        const userCV = yield userCVSchema_1.default.findOne({ _id: cvId }).exec();
        if (!userCV) {
            res.status(401).json({ message: "User cv not found" });
            return;
        }
        userCV.activities.push(activities);
        yield userCV.save();
        res.status(200).json({ success: true, updatedCV: userCV, message: "Your activities added succesfully." });
    }
    catch (error) {
        next(error);
    }
}));
cvRouter.post("/updateUserReference", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cvId, referenceName, referenceCompany, referenceEmail, referencePhone } = req.body;
    try {
        const userCV = yield userCVSchema_1.default.findOne({ _id: cvId }).exec();
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
        const updatedCV = yield userCV.save();
        res.status(200).json({
            success: true,
            message: "Reference added successfully!",
            updatedCV,
        });
    }
    catch (error) {
        console.error("Error updating reference:", error);
        res.status(500).json({ message: "Server error while adding reference" });
    }
}));
cvRouter.post("/addNewSectionAgain", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cvId, sectionName } = req.body;
    try {
        const userCV = yield userCVSchema_1.default.findOne({ _id: cvId }).exec();
        if (!userCV) {
            res.status(404).json({ message: "User CV not found" });
            return;
        }
        userCV.otherSection.push({ sectionName, sectionValues: [] });
        const updatedCV = yield userCV.save();
        res.status(200).json({ success: true, message: "New section added successfully!", updatedCV });
    }
    catch (error) {
        console.error("Error adding new section:", error);
        res.status(500).json({ message: "Server error while adding new section" });
    }
}));
cvRouter.post("/deleteItems", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cvId, pageName, indexToDelete } = req.body;
        const CV = yield userCVSchema_1.default.findOne({ _id: cvId }).exec();
        if (!CV) {
            res.status(400).json({ message: "Not deleted" });
            return;
        }
        if (pageName === "projects") {
            CV.projects.splice(indexToDelete, 1);
        }
        else if (pageName === "experience") {
            CV.experience.splice(indexToDelete, 1);
        }
        else if (pageName === "education") {
            CV.education.splice(indexToDelete, 1);
        }
        else if (pageName === "acheivement") {
            CV.achievement.splice(indexToDelete, 1);
        }
        else if (pageName === "activities") {
            CV.activities.splice(indexToDelete, 1);
        }
        else if (pageName === "reference") {
            CV.reference.splice(indexToDelete, 1);
        }
        yield CV.save();
        res.status(200).json({ success: true, updatedCV: CV, message: "Deleted succesfully" });
    }
    catch (error) {
        console.log("server error during delete : ", error);
        next(error);
    }
}));
cvRouter.post("/addNewSection", authUserPermision_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userCV = yield userCVSchema_1.default.findOne({ _id: req.body.cvId }).exec();
        if (!userCV) {
            res.status(400).json({ message: "New section not added!" });
            return;
        }
        userCV.otherSection.push({ sectionName: req.body.sectionName, sectionValues: [] });
        const updatedCV = yield userCV.save();
        res.status(200).json({ updatedCV, message: "New section added!" });
    }
    catch (error) {
        console.log("catch is catching error : ", error);
        next(error);
    }
}));
cvRouter.post("/deleteSection", authUserPermision_1.default, addContent_1.deleteSection);
cvRouter.post("/addSectionValue", authUserPermision_1.default, addContent_1.addSectionValue);
cvRouter.post("/deleteSectionValue", authUserPermision_1.default, addContent_1.deleteSectionValue);
cvRouter.post("/deleteMainSectionContentInside", authUserPermision_1.default, HomeControll_1.deleteSectionData);
exports.default = cvRouter;
