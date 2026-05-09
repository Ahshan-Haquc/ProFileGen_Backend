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
exports.deleteSectionValue = exports.addSectionValue = exports.deleteSection = exports.addNewSection = void 0;
const userCVSchema_1 = __importDefault(require("../models/userCVSchema"));
const addNewSection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userCV = yield userCVSchema_1.default.findOne({ _id: req.body.cvId }).exec();
        if (!userCV) {
            res.status(400).json({ message: "New section not added!" });
            return;
        }
        userCV.otherSection.push({ sectionName: (_a = req.body.sectionName) !== null && _a !== void 0 ? _a : "", sectionValues: [] });
        const updatedCV = yield userCV.save();
        res.status(200).json({ updatedCV, message: "New section added!" });
    }
    catch (error) {
        console.log("catch is catching error : ", error);
        next(error);
    }
});
exports.addNewSection = addNewSection;
const deleteSection = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userCV = yield userCVSchema_1.default.findOne({ _id: req.body.cvId }).exec();
        if (!userCV) {
            res.status(400).json({ error: "User CV not found" });
            return;
        }
        const index = (_a = req.body.sectionIndex) !== null && _a !== void 0 ? _a : -1;
        if (index < 0 || index >= userCV.otherSection.length) {
            res.status(400).json({ error: "Invalid section index" });
            return;
        }
        userCV.otherSection.splice(index, 1);
        const updatedCV = yield userCV.save();
        res.status(200).json({ updatedCV, message: "Section deleted successfully!" });
    }
    catch (err) {
        console.log("Error deleting section:", err);
        next(err);
    }
});
exports.deleteSection = deleteSection;
const addSectionValue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sectionIndex, newValue } = req.body;
        const userCV = yield userCVSchema_1.default.findOne({ _id: req.body.cvId }).exec();
        if (!userCV) {
            res.status(404).json({ error: "User CV not found" });
            return;
        }
        if (sectionIndex === undefined || sectionIndex < 0 || sectionIndex >= userCV.otherSection.length) {
            res.status(400).json({ error: "Invalid section index" });
            return;
        }
        userCV.otherSection[sectionIndex].sectionValues.push(newValue !== null && newValue !== void 0 ? newValue : "");
        const updatedCV = yield userCV.save();
        res.status(200).json({ updatedCV, message: "Content added successfully!" });
    }
    catch (err) {
        console.error("Error adding section value:", err);
        next(err);
    }
});
exports.addSectionValue = addSectionValue;
const deleteSectionValue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sectionIndex, valueIndex } = req.body;
        const userCV = yield userCVSchema_1.default.findOne({ _id: req.body.cvId }).exec();
        if (!userCV) {
            res.status(404).json({ error: "User CV not found" });
            return;
        }
        if (sectionIndex === undefined ||
            valueIndex === undefined ||
            sectionIndex < 0 ||
            sectionIndex >= userCV.otherSection.length ||
            valueIndex < 0 ||
            valueIndex >= userCV.otherSection[sectionIndex].sectionValues.length) {
            res.status(400).json({ error: "Invalid index" });
            return;
        }
        userCV.otherSection[sectionIndex].sectionValues.splice(valueIndex, 1);
        const updatedCV = yield userCV.save();
        res.status(200).json({ updatedCV, message: "Content deleted successfully!" });
    }
    catch (err) {
        console.error("Error deleting section value:", err);
        next(err);
    }
});
exports.deleteSectionValue = deleteSectionValue;
