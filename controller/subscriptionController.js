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
        throw new Error("Failed to get current subscription");
    }
}

const createCheckoutSession = async (req, res) => {
    const { plan } = req.body;

    let price = 0;
    let planName = "";

    if (plan === "pro") {
        price = 100; // $1 → cents
        planName = "Pro Plan";
    }

    if (plan === "elite") {
        price = 500; // $5
        planName = "Elite Plan";
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",

            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: planName,
                        },
                        unit_amount: price,
                    },
                    quantity: 1,
                },
            ],

            success_url: `http://localhost:5173/success-subscription?plan=${plan}`,
            cancel_url: `http://localhost:5173/my-pricing`,

        });

        res.json({ url: session.url });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Stripe error" });
    }
}

const paymentSuccess = async (req, res) => {
    const { plan } = req.query;
    const userId = req.userInfo._id;

    let cvLimit = 3;

    if (plan === "pro") cvLimit = 10;
    if (plan === "elite") cvLimit = 50;

    await UserModel.findByIdAndUpdate(userId, {
        "subscription.plan": plan,
        "subscription.cvLimit": cvLimit,
        "subscription.cvUsed": 0,
        "subscription.expiresAt": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    res.redirect("/dashboard");
}


module.exports = {
    getCurrentSubscription,
    createCheckoutSession,
    paymentSuccess,
};