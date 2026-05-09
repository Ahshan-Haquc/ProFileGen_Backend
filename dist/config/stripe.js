"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
const stripeSecretKey = (_a = process.env.STRIPE_SECRET_KEY) !== null && _a !== void 0 ? _a : "";
const stripe = stripeSecretKey
    ? new stripe_1.default(stripeSecretKey, {
        apiVersion: "2026-04-22.dahlia",
    })
    : null;
if (!stripeSecretKey) {
    console.warn("STRIPE_SECRET_KEY is not set. Stripe features are disabled.");
}
exports.default = stripe;
