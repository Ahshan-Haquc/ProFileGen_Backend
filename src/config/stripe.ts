import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY ?? "";

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2026-04-22.dahlia",
    })
  : null;

if (!stripeSecretKey) {
  console.warn("STRIPE_SECRET_KEY is not set. Stripe features are disabled.");
}

export default stripe;
