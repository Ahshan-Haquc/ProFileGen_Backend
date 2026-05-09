"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const otherSectionSchema = new mongoose_1.default.Schema({
    sectionName: { type: String, required: true },
    sectionValues: { type: [String], default: [] },
}, { _id: false });
const UserCVSchema = new mongoose_1.default.Schema({
    title: { type: String, default: `My CV - ${new Date().toLocaleDateString()}` },
    name: { type: String, default: "Enter Your Name" },
    profession: { type: String, default: "Enter Your Profession" },
    images: {
        type: String,
        default: "https://images.pexels.com/photos/8378733/pexels-photo-8378733.jpeg",
    },
    description: { type: String, default: "Enter Your Description" },
    phoneNumber: { type: String, default: "Enter Your Phone Number" },
    emailId: { type: String, default: "Enter Your Email" },
    linkedInId: { type: String, default: "Enter Your LinkedIn" },
    githubId: { type: String, default: "Enter Your GitHub" },
    portfolioLink: { type: String, default: "Enter Your Portfolio Link" },
    address: { type: String, default: "Enter Your Address" },
    skills: { type: Object, default: {} },
    projects: { type: [Object], default: [] },
    experience: { type: [Object], default: [] },
    education: { type: [Object], default: [] },
    achievement: { type: [String], default: [] },
    activities: { type: [String], default: [] },
    reference: { type: [Object], default: [] },
    otherSection: { type: [otherSectionSchema], default: [] },
    template: {
        type: String,
        enum: ["Formal", "OneColumn", "Modern"],
        default: "Formal",
    },
    isFavorite: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });
const UserCVModel = mongoose_1.default.model("CV", UserCVSchema);
exports.default = UserCVModel;
