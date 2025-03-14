import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY); // ✅ Correct Vite syntax

const Checkout = ({ total }) => {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const response = await fetch("http://localhost:5000/api/checkout", { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total }),
    });

    if (!response.ok) {
      console.error("❌ Error creating checkout session:", await response.json());
      return;
    }

    const session = await response.json();
    await stripe.redirectToCheckout({ sessionId: session.id });
  };

  return (
    <button onClick={handleCheckout} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
      Proceed to Checkout
    </button>
  );
};

export default Checkout;
