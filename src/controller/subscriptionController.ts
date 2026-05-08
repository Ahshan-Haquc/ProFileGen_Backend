import type { Request, Response } from "express";
import stripe from "../config/stripe";
import UserModel from "../models/userSchema";

interface CreateCheckoutSessionBody {
  plan?: string;
}

const getCurrentSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json({
      success: true,
      message: "Current subscription fetched successfully",
      subscription: req.userInfo?.subscription,
    });
  } catch (error) {
    console.error("Error while getting current subscription:", error);
    res.status(500).json({ success: false, message: "Failed to get current subscription" });
  }
};

const createCheckoutSession = async (req: Request<unknown, unknown, CreateCheckoutSessionBody>, res: Response): Promise<void> => {
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
  } else if (plan === "elite") {
    price = 500;
    planName = "Elite Plan";
  } else {
    res.status(400).json({ success: false, message: "Invalid plan selected" });
    return;
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
      cancel_url: `http://localhost:5173/my-pricing`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: "Stripe error", errorMessage: (err as Error).message });
  }
};

const paymentSuccess = async (req: Request, res: Response): Promise<void> => {
  const plan = String(req.query.plan ?? "");

  if (!plan) {
    res.status(400).json({ success: false, message: "Plan is required" });
    return;
  }

  const userId = req.userInfo?._id;
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized access" });
    return;
  }

  let cvLimit = 3;
  if (plan === "pro") cvLimit = 10;
  if (plan === "elite") cvLimit = 50;

  try {
    await UserModel.findByIdAndUpdate(userId, {
      "subscription.plan": plan,
      "subscription.cvLimit": cvLimit,
      "subscription.cvUsed": 0,
      "subscription.expiresAt": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }).exec();

    res.status(200).json({ success: true, message: "Subscription updated successfully" });
  } catch (error) {
    console.error("Payment success error:", error);
    res.status(500).json({ success: false, message: "Failed to update subscription" });
  }
};

export { getCurrentSubscription, createCheckoutSession, paymentSuccess };
