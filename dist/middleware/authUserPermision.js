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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const userAccessPermission = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const cookieToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.userCookie;
        if (!cookieToken) {
            res.status(401).json({ error: "Unauthorized access" });
            return;
        }
        const validUser = jsonwebtoken_1.default.verify(cookieToken, (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : "ahsanSecretKey8765");
        const user = yield userSchema_1.default.findById(validUser._id).exec();
        if (!user) {
            res.status(401).json({ error: "Unauthorized access" });
            return;
        }
        req.token = cookieToken;
        req.userInfo = user;
        next();
    }
    catch (error) {
        console.log("JWT error:", error.message);
        req.unAuthenticateUser = true;
        res.status(401).json({ error: "Unauthorized access" });
    }
});
exports.default = userAccessPermission;
