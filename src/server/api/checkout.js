import express from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ✅ Initialize Stripe with Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Create a Checkout Session
router.post("/", async (req, res) => {
  try {
    const { total } = req.body; // Get total price from frontend

    if (!total) {
      return res.status(400).json({ error: "Missing total amount" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Grocery Order" },
            unit_amount: total * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("❌ Stripe Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;
