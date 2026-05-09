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
exports.updateUserProjects = exports.updateUserSkills = exports.updateUserContact = exports.updateDescription = exports.deleteSectionData = exports.updateUserProfile = void 0;
const userCVSchema_1 = __importDefault(require("../models/userCVSchema"));
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { userId, name, profession } = req.body;
        if (!userId || !name || !profession) {
            res.status(400).json({ message: "All fields required" });
            return;
        }
        const updateData = { name, profession };
        if (req.file) {
            const filePath = (_c = (_b = (_a = req.file.path) !== null && _a !== void 0 ? _a : req.file.location) !== null && _b !== void 0 ? _b : req.file.secure_url) !== null && _c !== void 0 ? _c : req.file.url;
            if (typeof filePath === "string") {
                updateData.images = filePath;
            }
        }
        const updatedCV = yield userCVSchema_1.default.findOneAndUpdate({ userId }, { $set: updateData }, { new: true, upsert: true }).exec();
        if (!updatedCV) {
            res.status(500).json({ success: false, message: "Unable to update profile" });
            return;
        }
        res.status(200).json({ success: true, message: "Profile updated successfully", updatedCV });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});
exports.updateUserProfile = updateUserProfile;
const deleteSectionData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userInfo) {
            res.status(401).json({ message: "Unauthorized access" });
            return;
        }
        const sectionName = req.body.sectionName;
        yield userCVSchema_1.default.updateOne({ userId: req.userInfo._id }, { $set: { [sectionName !== null && sectionName !== void 0 ? sectionName : ""]: [] } }).exec();
        const updatedCV = yield userCVSchema_1.default.findOne({ userId: req.userInfo._id }).exec();
        res.status(200).json({ updatedCV, message: "Deleted successfully" });
    }
    catch (error) {
        console.log("Error in deleting section data : ", error);
        next(error);
    }
});
exports.deleteSectionData = deleteSectionData;
const updateDescription = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cvId, userDescription } = req.body;
        if (!cvId || !userDescription) {
            res.status(400).json({ message: "Input field not filled" });
            return;
        }
        yield userCVSchema_1.default.updateOne({ _id: cvId }, { $set: { description: userDescription } }).exec();
        res.status(200).json({ success: true, message: "Your description updated succesfully." });
    }
    catch (error) {
        next(error);
    }
});
exports.updateDescription = updateDescription;
const updateUserContact = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cvId, phoneNumber, emailId, linkedInId, githubId, portfolioLink, address } = req.body;
        if (!cvId || !phoneNumber || !emailId || !linkedInId || !githubId || !portfolioLink || !address) {
            res.status(401).json({ message: "Input field not filled" });
            return;
        }
        yield userCVSchema_1.default.updateOne({ _id: cvId }, {
            $set: {
                phoneNumber,
                emailId,
                linkedInId,
                githubId,
                portfolioLink,
                address,
            },
        }).exec();
        res.status(200).json({ success: true, message: "Your contact updated succesfully." });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUserContact = updateUserContact;
const updateUserSkills = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { cvId, skills } = req.body;
    try {
        const userCV = yield userCVSchema_1.default.findOne({ _id: cvId }).exec();
        if (!userCV) {
            res.status(404).json({ message: "User CV not found" });
            return;
        }
        userCV.skills = skills;
        yield userCV.save();
        res.status(200).json({ message: "Skills updated", updatedCV: userCV });
    }
    catch (error) {
        console.error("Error updating skills:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateUserSkills = updateUserSkills;
const updateUserProjects = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cvId, projectName, projectDescription, projectToolsAndTechnologies } = req.body;
        if (!cvId || !projectName || !projectDescription || !projectToolsAndTechnologies) {
            res.status(401).json({ message: "Input field not filled" });
            return;
        }
        const userCV = yield userCVSchema_1.default.findOne({ _id: cvId }).exec();
        if (!userCV) {
            res.status(400).json({ message: "User cv not found" });
            return;
        }
        const newProject = {
            projectName,
            projectDescription,
            projectToolsAndTechnologies,
        };
        userCV.projects.push(newProject);
        yield userCV.save();
        res.status(200).json({ updatedCV: userCV, message: "Your project updated succesfully." });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUserProjects = updateUserProjects;
