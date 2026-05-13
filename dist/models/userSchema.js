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
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        default: "User",
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    status: {
        type: String,
        enum: ["active", "inactive", "blocked"],
        default: "active",
    },
    subscription: {
        plan: {
            type: String,
            enum: ["starter", "pro", "elite"],
            default: "starter",
        },
        cvLimit: {
            type: Number,
            default: 3,
        },
        cvUsed: {
            type: Number,
            default: 0,
        },
        isTrialUsed: {
            type: Boolean,
            default: false,
        },
        subscribedAt: {
            type: Date,
            default: Date.now,
        },
        expiresAt: {
            type: Date,
        },
    },
    googleId: {
        type: String,
    },
    profileImage: {
        type: String,
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local",
    },
    resetOtp: {
        type: String,
    },
    resetOtpExpire: {
        type: Date,
    },
    tokens: [
        {
            token: { type: String },
        },
    ],
}, { timestamps: true });
UserSchema.methods.generateToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const tokenSecret = (_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "ahsanSecretKey8765";
            const expiresIn = ((_b = process.env.JWT_EXPIRATION) !== null && _b !== void 0 ? _b : "1h");
            const tokenOptions = { expiresIn };
            const userToken = jsonwebtoken_1.default.sign({
                _id: this._id.toString(),
                email: this.email,
                role: this.role,
            }, tokenSecret, tokenOptions);
            this.tokens.push({ token: userToken });
            yield this.save();
            return userToken;
        }
        catch (error) {
            console.error("Error while generating token:", error);
            throw new Error("Token generation failed");
        }
    });
};
const UserModel = mongoose_1.default.model("User", UserSchema);
exports.default = UserModel;
