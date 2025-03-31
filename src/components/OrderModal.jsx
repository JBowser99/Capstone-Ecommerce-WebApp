import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const OrderModal = ({ open, onClose }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, "orders"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(fetchedOrders);
      } catch (err) {
        console.error("❌ Error fetching order history:", err);
      }
    };

    if (open) fetchOrders();
  }, [open, user]);

  if (!open) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex justify-center items-center z-40">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 shadow-lg relative"
      >
        {/* ❌ Close Button */}
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
                  <span className="text-sm text-gray-600">{order.status}</span>
                </div>

                <p className="text-sm text-gray-500">
                  Placed on: {order.createdAt?.toDate().toLocaleString() || "Unknown"}
                </p>

                {/* 🛒 Items */}
                <ul className="mt-2 text-sm list-disc pl-6">
                  {order.items?.map((item, i) => (
                    <li key={i}>
                      {item.name} (x{item.quantity}) - ${item.price.toFixed(2)}
                    </li>
                  ))}
                </ul>

                {/* 🚚 Logistics Info */}
                <div className="mt-3 text-sm text-gray-700">
                  <p><strong>Delivery:</strong> {order.logistics?.deliveryMethod}</p>
                  {order.logistics?.pickupPoint && (
                    <p><strong>Pickup Point:</strong> {order.logistics.pickupPoint}</p>
                  )}
                  {order.logistics?.instructions && (
                    <p><strong>Instructions:</strong> {order.logistics.instructions}</p>
                  )}
                </div>

                {/* 💵 Total */}
                <p className="mt-3 font-semibold text-right">
                  Total: ${order.total.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderModal;
