import express from "express";
import userAccessPermission from "../middleware/authUserPermision";
import { createCheckoutSession, paymentSuccess, getCurrentSubscription } from "../controller/subscriptionController";

const subscriptionRouter = express.Router();

subscriptionRouter.get("/get-current-subscription", userAccessPermission, getCurrentSubscription);
subscriptionRouter.post("/create-checkout-session", userAccessPermission, createCheckoutSession);
subscriptionRouter.get("/payment-success", userAccessPermission, paymentSuccess);

export default subscriptionRouter;

