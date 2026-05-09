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
const userSchema_1 = __importDefault(require("../models/userSchema"));
const checkCVLimit = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.userInfo;
        if (!user) {
            res.status(401).json({ message: "Unauthorized access" });
            return;
        }
        if (user.subscription.plan === "starter") {
            if (user.subscription.cvUsed >= 3 || user.subscription.isTrialUsed) {
                const userInfo = yield userSchema_1.default.findById(user._id).exec();
                if (userInfo) {
                    userInfo.subscription.isTrialUsed = true;
                    yield userInfo.save();
                }
                res.status(200).json({
                    success: false,
                    message: "Free limit reached. Upgrade your plan.",
                });
                return;
            }
        }
        if (user.subscription.cvUsed >= user.subscription.cvLimit) {
            res.status(200).json({
                success: false,
                message: "Monthly limit reached. Upgrade your plan",
            });
            return;
        }
        const now = new Date();
        if (user.subscription.expiresAt && user.subscription.expiresAt < now) {
            res.status(200).json({
                success: false,
                message: "Subscription expired. Upgrade your plan.",
            });
            return;
        }
        next();
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});
exports.default = checkCVLimit;
