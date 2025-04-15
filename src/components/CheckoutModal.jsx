import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Navigate } from "react-router-dom";
import Logistics from "./Logistics";
import { submitOrder } from "../utils/firebaseOrderService";

const CheckoutModal = ({ open, onClose, total }) => {
  const { user } = useAuth();
  const { cartItems, updateCartInFirestore, setCartItems } = useCart();

  const [logistics, setLogistics] = useState({});
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [billing, setBilling] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;
  if (!user) return <Navigate to="/auth/Login" replace />;

  const finalTotal = total + (logistics?.fee || 0);

  const handleSubmitOrder = async () => {
    if (!name.trim() || !address.trim() || !email.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    if (
      logistics.deliveryMethod === "pickup" &&
      (!logistics.pickupTime || logistics.pickupTime === "Choose Time")
    ) {
      alert("Please select a valid pickup date and time.");
      return;
    }

    setIsSubmitting(true);

    const maskedBilling = "xxxx xxxx xxxx xxxx";
    const orderData = {
      items: cartItems,
      total: finalTotal,
      name,
      address,
      email,
      billing: maskedBilling,
      logistics,
    };

    try {
      await submitOrder(user.uid, orderData);
      await updateCartInFirestore([]);
      setCartItems([]);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setIsSubmitting(false);
        onClose();
        alert("🎉 Order placed! You can view it in your Order History.");
      }, 1500);
    } catch (err) {
      console.error("❌ Error placing order:", err.message);
      alert("❌ Something went wrong.");
      setIsSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg relative overflow-y-auto max-h-[90vh]"
      >
        {/* ❌ Close Button */}
        <div className="absolute top-5 right-5">
          <p onClick={onClose} className="cursor-pointer font-bold text-xl">✕</p>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">Checkout</h2>

        {/* ✅ Confirmation */}
        {showSuccess && (
          <div className="bg-green-500 text-white px-4 py-2 rounded mb-4 text-center shadow">
            ✅ Thank you for shopping with us!
          </div>
        )}

        {/* ✅ User Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="checkout-name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="checkout-name"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              className="p-2 border rounded w-full mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="checkout-address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              id="checkout-address"
              name="address"
              type="text"
              autoComplete="street-address"
              required
              className="p-2 border rounded w-full mt-1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="checkout-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="p-2 border rounded w-full mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* 💳 Billing Input (masked) */}
        <div className="mb-4">
          <label htmlFor="checkout-billing" className="block text-sm font-medium text-gray-700">
            Card Number (for demo use 'x')
          </label>
          <input
            id="checkout-billing"
            name="cardNumber"
            type="text"
            autoComplete="cc-number"
            className="p-2 border rounded w-full mt-1"
            value={billing}
            onChange={(e) => setBilling(e.target.value.replace(/[0-9]/g, "x"))}
          />
        </div>

        {/* 🚚 Logistics */}
        <Logistics cartTotal={total} onChange={(data) => setLogistics(data)} />

        {/* 📦 Order Summary */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
          <ul className="divide-y">
            {cartItems.map((item) => (
              <li key={item.id} className="py-2 flex justify-between">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
            {logistics?.fee > 0 && (
              <li className="py-2 flex justify-between text-red-600 font-semibold">
                <span>Delivery Fee</span>
                <span>${logistics.fee.toFixed(2)}</span>
              </li>
            )}
          </ul>
          <p className="text-right font-semibold mt-2">Total: ${finalTotal.toFixed(2)}</p>
        </div>

        {/* ✅ Submit Order */}
        <div className="text-center mt-6">
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
            className={`py-2 px-6 rounded text-white ${
              isSubmitting ? "bg-gray-400 cursor-wait" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Processing..." : "Submit Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
