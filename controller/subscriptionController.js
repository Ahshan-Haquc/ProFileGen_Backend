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
    try {
        const { plan } = req.body;

        // fake stripe session
        res.json({
            url: `http://localhost:3000/payment-success?plan=${plan}`,
        });
    } catch (error) {
        console.error("Error while creating checkout session:", error);
        throw new Error("Failed to create checkout session");
    }
};

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