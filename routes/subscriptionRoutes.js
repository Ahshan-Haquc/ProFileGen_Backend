const express = require("express");
const subscriptionRouter = express.Router();
const userAccessPermission = require("../middleware/authUserPermision");
const checkCVLimit = require("../middleware/checkCvLimit");
const { createCheckoutSession, paymentSuccess, getCurrentSubscription } = require("../controller/subscriptionController");


subscriptionRouter.get("/get-current-subscription", userAccessPermission, getCurrentSubscription);
subscriptionRouter.post("/create-checkout-session", userAccessPermission, createCheckoutSession);
subscriptionRouter.get("/payment-success", userAccessPermission, paymentSuccess);

module.exports = subscriptionRouter;
