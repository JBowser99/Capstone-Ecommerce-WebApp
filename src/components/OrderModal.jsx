// src/components/OrderModal.jsx
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import ConfirmPickup from "./ConfirmPickup";

/**
 * OrderModal displays real-time order history with status timeline,
 * pickup confirmation, and 5-minute cancellation option.
 */
const OrderModal = ({ open, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pickupModalId, setPickupModalId] = useState(null); // Tracks which order is being picked up

  useEffect(() => {
    if (!open || !user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const now = new Date();

      const updated = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate?.() || new Date();
        const minsElapsed = (now - createdAt) / 60000;

        let status = data.status;

        // 🔄 Simulate timeline progression based on time elapsed
        if (data.logistics?.deliveryMethod === "pickup") {
          if (status === "Picked Up" || status === "Cancelled") {
            // Don't change final statuses
          } else if (minsElapsed >= 60) {
            status = "Ready for Pickup";
          } else if (minsElapsed >= 30) {
            status = "Shopping for Your Order";
          } else {
            status = "Preparing for Pickup";
          }
        } else if (data.logistics?.deliveryMethod === "express") {
          if (minsElapsed >= 90) status = "Delivered";
          else if (minsElapsed >= 30) status = "En Route";
          else status = "Out for Express Delivery";
        } else if (data.logistics?.deliveryMethod === "standard") {
          if (minsElapsed >= 480) status = "Delivered";
          else if (minsElapsed >= 240) status = "Out for Delivery";
          else status = "Processing Order";
        }

        const canCancel = minsElapsed <= 5 && data.status === "In Process";

        return {
          id: docSnap.id,
          ...data,
          createdAt,
          simulatedStatus: status,
          canCancel,
        };
      });

      setOrders(updated);
    });

    return () => unsubscribe();
  }, [open, user]);

  const cancelOrder = async (orderId) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: "Cancelled",
      });
      alert("❌ Order cancelled.");
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };

  if (!open) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/80 flex justify-center items-center z-40">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-lg relative"
      >
        {/* ❌ Close button */}
        <div className="absolute top-4 right-4">
          <button onClick={onClose} className="text-xl font-bold text-gray-600 hover:text-black">✕</button>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6">🧾 Order History</h2>

        {orders.length === 0 ? (
          <p className="text-center text-gray-500">No past orders found.</p>
        ) : (
          <div className="space-y-6">
            {orders.map((order, idx) => (
              <div key={order.id} className="border p-4 rounded-lg shadow-md bg-gray-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Order #{idx + 1}</h3>
                  <span className="text-sm text-blue-600 font-medium">{order.simulatedStatus}</span>
                </div>

                <p className="text-sm text-gray-500">
                  Placed on: {order.createdAt?.toLocaleString() || "Unknown"}
                </p>

                {/* 🛒 Item List */}
                <ul className="mt-2 text-sm list-disc pl-6">
                  {order.items?.map((item, i) => (
                    <li key={i}>
                      {item.name} (x{item.quantity}) - ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>

                {/* 📦 Order Meta Info */}
                <div className="mt-3 text-sm text-gray-700">
                  <p><strong>Delivery:</strong> {order.logistics?.deliveryMethod}</p>
                  {order.logistics?.pickupLocation && (
                    <p><strong>Pickup Location:</strong> {order.logistics.pickupLocation}</p>
                  )}
                  {order.logistics?.pickupTime && (
                    <p><strong>Pickup Time:</strong> {order.logistics.pickupTime}</p>
                  )}
                  {order.logistics?.instructions && (
                    <p><strong>Instructions:</strong> {order.logistics.instructions}</p>
                  )}
                  {order.pickupDetails?.stopNumber && (
                    <p><strong>Stop #:</strong> {order.pickupDetails.stopNumber}</p>
                  )}
                  {order.pickupDetails?.carInfo && (
                    <p><strong>Car:</strong> {order.pickupDetails.carInfo}</p>
                  )}
                </div>

                {/* 💲 Total */}
                <p className="mt-3 font-semibold text-right">
                  Total: ${order.total.toFixed(2)}
                </p>

                {/* ✅ Ready for pickup check-in */}
                {order.simulatedStatus === "Ready for Pickup" &&
                  order.status !== "Picked Up" &&
                  order.logistics?.deliveryMethod === "pickup" && (
                    <div className="mt-4 bg-blue-100 border-l-4 border-blue-500 p-4 rounded">
                      <p className="text-blue-800 font-medium mb-2">
                        🛎️ Your order is ready for pickup!
                      </p>
                      <button
                        onClick={() => setPickupModalId(order.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                      >
                        Check In for Pickup
                      </button>
                    </div>
                )}

                {/* ❌ Cancel order (within 5 minutes) */}
                {order.canCancel && (
                  <div className="mt-3 text-center">
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm"
                    >
                      ❌ Cancel Order
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 🟢 Pickup Check-In Modal */}
        {pickupModalId && (
          <ConfirmPickup
            orderId={pickupModalId}
            onClose={() => setPickupModalId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default OrderModal;
