import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Stripe from "stripe";

// ✅ Load environment variables
dotenv.config();

// ✅ Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// ✅ Add a default route for testing the server
app.get("/", (req, res) => {
  res.send("🚀 Grocery Checkout API is running!");
});

// ✅ Create Checkout Session
app.post("/api/checkout", async (req, res) => {
  try {
    const { total } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Total Order" },
            unit_amount: total * 100, // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error("❌ Stripe Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`🔥 Welcome to the Grocery Checkout API! Server is running on port ${PORT}...`);
});
