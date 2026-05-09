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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const authUserPermision_1 = __importDefault(require("../middleware/authUserPermision"));
const auth_1 = require("../controller/auth");
const authRouter = express_1.default.Router();
authRouter.get("/", (req, res, next) => {
    try {
        console.log(" to home page.");
        res.status(200).json({ message: "wel to ho me page." });
    }
    catch (error) {
        next(error);
    }
});
authRouter.post("/userSignup", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
authRouter.post("/auth/admin/signup", auth_1.adminSignup);
authRouter.post("/userLogin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
authRouter.get("/userLogout", authUserPermision_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
}));
authRouter.get("/me", authUserPermision_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("working on me router");
    res.status(200).json({ userInfo: req.userInfo });
}));
exports.default = authRouter;
