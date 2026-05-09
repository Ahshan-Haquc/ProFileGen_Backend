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
exports.fetchCurrentWorkingCV = exports.fetchFavoriteCVsOnly = exports.toggleFavorite = exports.deleteUserCv = exports.createNewCv = exports.fetchUserDashboardData = exports.updateUserCvTitle = void 0;
const userSchema_1 = __importDefault(require("../models/userSchema"));
const userCVSchema_1 = __importDefault(require("../models/userCVSchema"));
const updateUserCvTitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cvId, newTitle } = req.body;
        if (!cvId || !newTitle) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        yield userCVSchema_1.default.findByIdAndUpdate(cvId, { title: newTitle }).exec();
        res.status(200).json({ success: true, message: "CV title updated successfully" });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.updateUserCvTitle = updateUserCvTitle;
const fetchUserDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userInfo) {
            res.status(401).json({ success: false, message: "Unauthorized access" });
            return;
        }
        const userCVs = yield userCVSchema_1.default.find({ userId: req.userInfo._id }).exec();
        res.status(200).json({ success: true, userCVs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.fetchUserDashboardData = fetchUserDashboardData;
const createNewCv = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userInfo) {
            res.status(401).json({ success: false, message: "Unauthorized access" });
            return;
        }
        const user = yield userSchema_1.default.findById(req.userInfo._id).exec();
        if (!user) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        user.subscription.cvUsed += 1;
        yield user.save();
        const userNewCV = new userCVSchema_1.default({ userId: req.userInfo._id });
        const userCV = yield userNewCV.save();
        res.status(201).json({ success: true, userCV, message: "Your CV file created. Now you can add info." });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.createNewCv = createNewCv;
const deleteUserCv = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cvId } = req.params;
        yield userCVSchema_1.default.findByIdAndDelete(cvId).exec();
        if (!req.userInfo) {
            res.status(401).json({ success: false, message: "Unauthorized access" });
            return;
        }
        const userCVs = yield userCVSchema_1.default.find({ userId: req.userInfo._id }).exec();
        res.status(200).json({ success: true, userCVs, message: "CV deleted successfully." });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.deleteUserCv = deleteUserCv;
const toggleFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userInfo) {
            res.status(401).json({ success: false, message: "Unauthorized access" });
            return;
        }
        const { cvId } = req.params;
        const cv = yield userCVSchema_1.default.findById(cvId).exec();
        if (!cv) {
            res.status(404).json({ success: false, message: "CV not found" });
            return;
        }
        const newFavoriteState = !cv.isFavorite;
        yield userCVSchema_1.default.findByIdAndUpdate(cvId, { isFavorite: newFavoriteState }).exec();
        const userCVs = yield userCVSchema_1.default.find({ userId: req.userInfo._id }).exec();
        res.status(200).json({
            success: true,
            userCVs,
            message: newFavoriteState ? "CV added to favorites" : "CV removed from favorites",
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.toggleFavorite = toggleFavorite;
const fetchFavoriteCVsOnly = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userInfo) {
            res.status(401).json({ success: false, message: "Unauthorized access" });
            return;
        }
        const userCVs = yield userCVSchema_1.default.find({ userId: req.userInfo._id, isFavorite: true }).exec();
        res.status(200).json({ success: true, userCVs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.fetchFavoriteCVsOnly = fetchFavoriteCVsOnly;
const fetchCurrentWorkingCV = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { cvId } = req.params;
        const userCurrentCV = yield userCVSchema_1.default.findOne({ _id: cvId }).exec();
        res.status(200).json({ success: true, userCurrentCV });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.fetchCurrentWorkingCV = fetchCurrentWorkingCV;
