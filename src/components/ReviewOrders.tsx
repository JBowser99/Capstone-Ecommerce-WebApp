// ✅ ReviewOrders.tsx — Admin-Only Live Pickup Queue
import React, { useEffect, useState } from "react";
import { collection, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

// Explicit Type for Order
interface Order {
  id: string;
  name: string;
  createdAt: any;
  logistics?: {
    pickupTime?: string;
    deliveryMethod?: string;
    instructions?: string;
  };
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

const ReviewOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  // 🔁 Real-time Listener: show all pickup orders not marked as complete
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snap) => {
      const filtered = snap.docs
        .filter((doc) => {
          const data = doc.data();
          return (
            data.logistics?.deliveryMethod === "pickup" &&
            data.status !== "Picked Up" &&
            data.status !== "Cancelled"
          );
        })
        .map((doc) => ({ id: doc.id, ...doc.data() })) as Order[];

      setOrders(filtered);
    });

    return () => unsub();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
      });
      alert(`✅ Order marked as "${newStatus}"`);
    } catch (err) {
      console.error("❌ Failed to update order status:", err);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-lg">
      {orders.length === 0 ? (
        <p className="text-center text-gray-500">No pickup orders pending.</p>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4 text-blue-600">
            🛍️ Pickup Orders In Progress
          </h2>
          {orders.map((order, idx) => (
            <div
              key={order.id}
              className="bg-gray-100 p-4 mb-4 rounded shadow-sm"
            >
              <p className="font-semibold text-sm mb-1">
                Order #{idx + 1} - {order.name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Placed: {order.createdAt?.toDate?.().toLocaleString()}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                Pickup Time: {order.logistics?.pickupTime || "Unscheduled"}
              </p>

              <ul className="text-sm list-disc pl-4 mb-2">
                {order.items?.map((item, i) => (
                  <li key={i}>
                    {item.name} x{item.quantity} – ${item.price.toFixed(2)}
                  </li>
                ))}
              </ul>

              <div className="flex gap-3 mt-2">
                <button
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  onClick={() => updateOrderStatus(order.id, "Picked Up")}
                >
                  ✅ Mark Picked Up
                </button>
                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  onClick={() => updateOrderStatus(order.id, "Cancelled")}
                >
                  ❌ Cancel Order
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ReviewOrders;
