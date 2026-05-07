const stripe = require("../config/stripe");
const UserModel = require("../models/userSchema");

const getCurrentSubscription = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: "Current subscription fetched successfully",
            subscription: req.userInfo.subscription
        });
    } catch (error) {
        console.error("Error while getting current subscription:", error);
        res.status(500).json({ success: false, message: "Failed to get current subscription" });
    }
};

const createCheckoutSession = async (req, res) => {
    const { plan } = req.body;

    if (!plan) {
        return res.status(400).json({
            success: false,
            message: "Plan is required",
        });
    }

    console.log("plan is : ", plan);

    let price = 0;
    let planName = "";

    if (plan === "pro") {
        price = 100;       // $1.00 in cents
        planName = "Pro Plan";
    } else if (plan === "elite") {
        price = 500;       // $5.00 in cents
        planName = "Elite Plan";
    } else {
        return res.status(400).json({ success: false, message: "Invalid plan selected" });
    }

    try {
        const session = await stripe.checkout.sessions.create({
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
            cancel_url:  `http://localhost:5173/my-pricing`,
        });

        res.json({ url: session.url });

    } catch (err) {
        console.error("Stripe checkout error:", err);
        res.status(500).json({ error: "Stripe error", errorMessage: err.message });
    }
};

const paymentSuccess = async (req, res) => {
    const { plan } = req.query;
    const userId = req.userInfo._id;

    if (!plan) {
        return res.status(400).json({ success: false, message: "Plan is required" });
    }

    let cvLimit = 3;
    if (plan === "pro")   cvLimit = 10;
    if (plan === "elite") cvLimit = 50;

    try {
        await UserModel.findByIdAndUpdate(userId, {
            "subscription.plan":      plan,
            "subscription.cvLimit":   cvLimit,
            "subscription.cvUsed":    0,
            "subscription.expiresAt": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        res.status(200).json({ success: true, message: "Subscription updated successfully" });

    } catch (error) {
        console.error("Payment success error:", error);
        res.status(500).json({ success: false, message: "Failed to update subscription" });
    }
};

module.exports = {
    getCurrentSubscription,
    createCheckoutSession,
    paymentSuccess,
};