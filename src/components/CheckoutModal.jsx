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

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    const maskedBilling = "xxxx xxxx xxxx xxxx";

    const orderData = {
      items: cartItems,
      total,
      name,
      address,
      email,
      billing: maskedBilling,
      logistics,
    };

    try {
      await submitOrder(user.uid, orderData);

      console.log("✅ Order placed successfully!");
      setShowSuccess(true);
      await updateCartInFirestore([]);
      setCartItems([]);

      setTimeout(() => {
        setShowSuccess(false);
        setIsSubmitting(false);
        onClose();
        alert("🎉 Thank you! Your order has been placed successfully.");
      }, 1500);
    } catch (err) {
      console.error("❌ Failed to place order:", err.message);
      alert("❌ Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg relative overflow-y-auto max-h-[90vh]"
      >
        {/* Close Button */}
        <div className="absolute top-5 right-5">
          <p onClick={onClose} className="cursor-pointer font-bold text-xl">✕</p>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">Checkout</h2>

        {/* Success Alert */}
        {showSuccess && (
          <div className="bg-green-500 text-white px-4 py-2 rounded mb-4 text-center shadow">
            ✅ Thank you for shopping with us!
          </div>
        )}

        {/* User Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder="Full Name"
            className="p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Address"
            className="p-2 border rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="p-2 border rounded col-span-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Billing Info */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Card Number (for demo use 'x')"
            className="p-2 border rounded w-full"
            value={billing}
            onChange={(e) => setBilling(e.target.value.replace(/[0-9]/g, "x"))}
          />
        </div>

        {/* Logistics Component */}
        <Logistics onChange={(data) => setLogistics(data)} />

        {/* Order Summary */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
          <ul className="divide-y">
            {cartItems.map((item) => (
              <li key={item.id} className="py-2 flex justify-between">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <p className="text-right font-semibold mt-2">Total: ${total.toFixed(2)}</p>
        </div>

        {/* Submit Button */}
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
