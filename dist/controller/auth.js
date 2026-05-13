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
exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.checkAuth = exports.checkUserAuth = exports.userLogout = exports.userLogin = exports.googleLogin = exports.adminSignup = exports.userSignup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const google_auth_library_1 = require("google-auth-library");
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const userSignup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("working on singup router 1");
    try {
        const { email, password, name } = req.body;
        if (!email || !password) {
            res.status(401).json({ message: "Please enter email or password." });
            return;
        }
        const encryptedPassword = yield bcryptjs_1.default.hash(password, 10);
        yield new userSchema_1.default({ email, password: encryptedPassword, name }).save();
        res.status(200).json({ message: "Signup successful." });
    }
    catch (error) {
        next(error);
    }
});
exports.userSignup = userSignup;
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
const googleLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { credential } = req.body;
        if (!credential) {
            res.status(400).json({
                success: false,
                message: "Google credential missing",
            });
            return;
        }
        // verify google token
        const ticket = yield client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload) {
            res.status(400).json({
                success: false,
                message: "Invalid Google token",
            });
            return;
        }
        const { sub, email, name, picture, } = payload;
        if (!email) {
            res.status(400).json({
                success: false,
                message: "Google email not found",
            });
            return;
        }
        // check existing user
        let user = yield userSchema_1.default.findOne({ email }).exec();
        // create user if not exists
        if (!user) {
            user = yield userSchema_1.default.create({
                name,
                email,
                password: "GOOGLE_AUTH_USER",
                googleId: sub,
                profileImage: picture,
                authProvider: "google",
            });
        }
        // generate jwt
        const token = yield user.generateToken();
        // save cookie
        res.cookie("userCookie", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            expires: new Date(Date.now() + 60 * 60 * 1000),
        });
        res.status(200).json({
            success: true,
            message: "Google login successful",
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        });
    }
    catch (error) {
        console.error("Google Login Error:", error);
        res.status(500).json({
            success: false,
            message: "Google login failed",
        });
    }
});
exports.googleLogin = googleLogin;
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield userSchema_1.default.findOne({ email }).exec();
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password !== null && password !== void 0 ? password : "", user.password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid password" });
            return;
        }
        const token = yield user.generateToken();
        res.cookie("userCookie", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            expires: new Date(Date.now() + 60 * 60 * 1000),
        });
        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.userLogin = userLogin;
const userLogout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    console.log("Request received in logout router");
    try {
        const user = yield userSchema_1.default.findById((_a = req.userInfo) === null || _a === void 0 ? void 0 : _a._id).exec();
        if (user) {
            user.tokens = [];
            yield user.save();
        }
        res.clearCookie("userCookie", {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
        });
        res.status(200).json({ message: "Logout successful" });
    }
    catch (error) {
        console.log("Error in logout router");
        next(error);
    }
});
exports.userLogout = userLogout;
const checkUserAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("working on me router");
    res.status(200).json({ userInfo: req.userInfo });
});
exports.checkUserAuth = checkUserAuth;
const checkAuth = (req, res, next) => {
    try {
        console.log(" to home page.");
        res.status(200).json({ message: "wel to home page." });
    }
    catch (error) {
        next(error);
    }
};
exports.checkAuth = checkAuth;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield userSchema_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        // generate 6 digit otp
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetOtp = otp;
        // 5 mins
        user.resetOtpExpire = new Date(Date.now() + 5 * 60 * 1000);
        yield user.save();
        // send email
        yield (0, sendMail_1.default)({
            to: email,
            subject: "Password Reset OTP - ProFileGen",
            html: `
        <div style="font-family:sans-serif">
          <h2>Password Reset Request</h2>
          <p>Your OTP code is:</p>

          <h1 style="letter-spacing:4px;">
            ${otp}
          </h1>

          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
        });
        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to send OTP",
        });
    }
});
exports.forgotPassword = forgotPassword;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        const user = yield userSchema_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        if (user.resetOtp !== otp) {
            res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
            return;
        }
        if (!user.resetOtpExpire ||
            user.resetOtpExpire < new Date()) {
            res.status(400).json({
                success: false,
                message: "OTP expired",
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: "OTP verified",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "OTP verification failed",
        });
    }
});
exports.verifyOtp = verifyOtp;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp, password } = req.body;
        const user = yield userSchema_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        if (user.resetOtp !== otp) {
            res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
            return;
        }
        if (!user.resetOtpExpire ||
            user.resetOtpExpire < new Date()) {
            res.status(400).json({
                success: false,
                message: "OTP expired",
            });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        user.password = hashedPassword;
        // clear otp
        user.resetOtp = null;
        user.resetOtpExpire = null;
        yield user.save();
        res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Password reset failed",
        });
    }
});
exports.resetPassword = resetPassword;
