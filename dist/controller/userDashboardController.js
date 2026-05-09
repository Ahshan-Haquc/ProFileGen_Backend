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
exports.viewCv = exports.getUserDashboardAllData = void 0;
const userCVSchema_1 = __importDefault(require("../models/userCVSchema"));
const getUserDashboardAllData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.userInfo) {
            res.status(401).json({ success: false, message: "Unauthorized access" });
            return;
        }
        const userAllCvs = yield userCVSchema_1.default.find({ userId: req.userInfo._id }).exec();
        const userFavoriteCvs = yield userCVSchema_1.default.find({ userId: req.userInfo._id, isFavorite: true }).exec();
        const lastUpdatedCv = yield userCVSchema_1.default.findOne({ userId: req.userInfo._id }).sort({ updatedAt: -1 }).exec();
        res.status(200).json({
            success: true,
            userAllCvs,
            userFavoriteCvs,
            lastUpdatedCv,
        });
    }
    catch (error) {
        console.error("Error fetching user dashboard data:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});
exports.getUserDashboardAllData = getUserDashboardAllData;
const viewCv = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userCV = yield userCVSchema_1.default.findOne({ userId: req.body.userId }).exec();
        if (!userCV) {
            res.status(400).json({ message: "User CV not found" });
            return;
        }
        res.status(200).json({ userCV });
    }
    catch (error) {
        console.log("Error in server : ", error);
        next(error);
    }
});
exports.viewCv = viewCv;
