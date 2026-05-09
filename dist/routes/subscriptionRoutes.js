"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authUserPermision_1 = __importDefault(require("../middleware/authUserPermision"));
const subscriptionController_1 = require("../controller/subscriptionController");
const subscriptionRouter = express_1.default.Router();
subscriptionRouter.get("/get-current-subscription", authUserPermision_1.default, subscriptionController_1.getCurrentSubscription);
subscriptionRouter.post("/create-checkout-session", authUserPermision_1.default, subscriptionController_1.createCheckoutSession);
subscriptionRouter.get("/payment-success", authUserPermision_1.default, subscriptionController_1.paymentSuccess);
exports.default = subscriptionRouter;
