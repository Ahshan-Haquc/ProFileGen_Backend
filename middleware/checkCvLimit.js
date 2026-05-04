const checkCVLimit = async (req, res, next) => {
  try {
    const user = req.userInfo; // from auth middleware

    // Starter Plan (free)
    if (user.subscription.plan === "starter") {
      if (user.subscription.cvUsed >= 3) {
        return res.status(403).json({
          success:false,
          message: "Free limit reached. Upgrade your plan.",
        });
      }
    }

    // Paid Plans
    if (user.subscription.cvUsed >= user.subscription.cvLimit) {
      return res.status(403).json({
        success:false,
        message: "Monthly limit reached. Upgrade your plan",
      });
    }

    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = checkCVLimit;
