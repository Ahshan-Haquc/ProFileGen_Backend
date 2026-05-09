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
exports.paymentSuccess = exports.createCheckoutSession = exports.getCurrentSubscription = void 0;
const stripe_1 = __importDefault(require("../config/stripe"));
const userSchema_1 = __importDefault(require("../models/userSchema"));
const getCurrentSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        res.status(200).json({
            success: true,
            message: "Current subscription fetched successfully",
            subscription: (_a = req.userInfo) === null || _a === void 0 ? void 0 : _a.subscription,
        });
    }
    catch (error) {
        console.error("Error while getting current subscription:", error);
        res.status(500).json({ success: false, message: "Failed to get current subscription" });
    }
});
exports.getCurrentSubscription = getCurrentSubscription;
const createCheckoutSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const plan = req.body.plan;
    if (!plan) {
        res.status(400).json({ success: false, message: "Plan is required" });
        return;
    }
    let price = 0;
    let planName = "";
    if (plan === "pro") {
        price = 100;
        planName = "Pro Plan";
    }
    else if (plan === "elite") {
        price = 500;
        planName = "Elite Plan";
    }
    else {
        res.status(400).json({ success: false, message: "Invalid plan selected" });
        return;
    }
    try {
        const session = yield stripe_1.default.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: { name: planName },
                        unit_amount: price,
                    },
                    quantity: 1,
                },
            ],
            success_url: `http://localhost:5173/success-subscription?plan=${plan}`,
            cancel_url: `http://localhost:5173/my-pricing`,
        });
        res.json({ url: session.url });
    }
    catch (err) {
        console.error("Stripe checkout error:", err);
        res.status(500).json({ error: "Stripe error", errorMessage: err.message });
    }
});
exports.createCheckoutSession = createCheckoutSession;
const paymentSuccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const plan = String((_a = req.query.plan) !== null && _a !== void 0 ? _a : "");
    if (!plan) {
        res.status(400).json({ success: false, message: "Plan is required" });
        return;
    }
    const userId = (_b = req.userInfo) === null || _b === void 0 ? void 0 : _b._id;
    if (!userId) {
        res.status(401).json({ success: false, message: "Unauthorized access" });
        return;
    }
    let cvLimit = 3;
    if (plan === "pro")
        cvLimit = 10;
    if (plan === "elite")
        cvLimit = 50;
    try {
        yield userSchema_1.default.findByIdAndUpdate(userId, {
            "subscription.plan": plan,
            "subscription.cvLimit": cvLimit,
            "subscription.cvUsed": 0,
            "subscription.expiresAt": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }).exec();
        res.status(200).json({ success: true, message: "Subscription updated successfully" });
    }
    catch (error) {
        console.error("Payment success error:", error);
        res.status(500).json({ success: false, message: "Failed to update subscription" });
    }
});
exports.paymentSuccess = paymentSuccess;
