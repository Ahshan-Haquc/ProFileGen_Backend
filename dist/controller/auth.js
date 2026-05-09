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
exports.adminSignup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const adminSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const role = "admin";
        if (!email || !password) {
            res.status(400).json({ success: false, message: "Email and password are required." });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const existingUser = yield userSchema_1.default.findOne({ email }).exec();
        if (existingUser) {
            res.status(400).json({ success: false, message: "Try with another email account." });
            return;
        }
        yield new userSchema_1.default({ email, password: hashedPassword, role }).save();
        res.status(201).json({ success: true, message: "Admin created successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "server error", error });
    }
});
exports.adminSignup = adminSignup;
