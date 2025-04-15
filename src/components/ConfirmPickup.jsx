// src/components/ConfirmPickup.jsx
import { useState } from "react";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

/**
 * ConfirmPickup.jsx
 * This modal lets the user check in for their pickup.
 * Validates stop number entry and prevents duplicate confirmations.
 */
const ConfirmPickup = ({ orderId, onClose }) => {
  const [stopNumber, setStopNumber] = useState("");
  const [carInfo, setCarInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle user submitting pickup info
  const handleConfirm = async () => {
    if (!stopNumber.trim()) {
      alert("Please enter your stop number.");
      return;
    }

    setLoading(true);

    try {
      const orderRef = doc(db, "orders", orderId);
      const snap = await getDoc(orderRef);

      // 🔐 Extra safety: prevent re-confirming a pickup
      if (snap.exists()) {
        const order = snap.data();
        if (order.status === "Picked Up") {
          alert("✅ This order was already picked up.");
          setLoading(false);
          onClose();
          return;
        }
      }

      // ✅ Update Firestore with pickup confirmation
      await updateDoc(orderRef, {
        status: "Picked Up",
        pickupDetails: {
          stopNumber,
          carInfo,
          confirmedAt: new Date().toISOString(),
        },
      });

      alert("✅ Pickup confirmed!");
      onClose();
    } catch (err) {
      console.error("❌ Failed to confirm pickup:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold text-center mb-4">Confirm Pickup</h2>

        {/* 🧍 Stop Number Input */}
        <input
          type="text"
          placeholder="Stop Number"
          value={stopNumber}
          onChange={(e) => setStopNumber(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {/* 🚗 Car Description */}
        <input
          type="text"
          placeholder="Car Description (optional)"
          value={carInfo}
          onChange={(e) => setCarInfo(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        {/* 🔘 Buttons */}
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 text-white rounded ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Confirming..." : "Confirm Pickup"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPickup;
