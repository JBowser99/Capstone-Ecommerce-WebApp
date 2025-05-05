// src/components/AdminPage.jsx

import { useAdminInventory } from "../context/AdminInventoryContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CustomerAnalytics from "./CustomerAnalytics";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

// 📦 List of categories to filter inventory
const categories = [
  "All", "Dairy", "Bread", "Deli Meat", "Meat", "Vegetables", "Fruits",
  "Seafood", "Snacks", "Baking", "Drinks", "Frozen", "Cereal"
];

const AdminPage = () => {
  const {
    isAdmin,
    inventoryItems,
    fetchInventory,
    restockItem,
    loading,
  } = useAdminInventory();

  const [selectedCategory, setSelectedCategory] = useState("All");
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [flaggedReviews, setFlaggedReviews] = useState([]);

  // 🔥 Real-time flagged review listener (optional summary)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "flaggedReviews"), (snap) => {
      setFlaggedReviews(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  // 🔁 Fetch inventory when admin is verified
  useEffect(() => {
    if (isAdmin) {
      fetchInventory();
    }
  }, [isAdmin]);

  // 🚪 Logout with redirect to login
  const handleLogout = async () => {
    try {
      await logout();
      console.log("👋 Admin successfully logged out");
      navigate("/auth/Login", { replace: true });
    } catch (error) {
      console.error("❌ Admin logout failed:", error);
    }
  };

  // 🔎 Category filter
  const filteredItems = selectedCategory === "All"
    ? inventoryItems
    : inventoryItems.filter((item) => item.category === selectedCategory);

  // 🟢 Stock-level styling
  const getStockColor = (stock) => {
    if (stock <= 5) return "bg-red-100 text-red-700 border-red-300";
    if (stock <= 9) return "bg-orange-100 text-orange-700 border-orange-300";
    return "bg-green-100 text-green-700 border-green-300";
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 bg-gray-100 relative pt-20">
      <h1 className="text-3xl font-bold text-center pt-10 pb-8 bg-black/10 rounded-xl mt-8 mb-5 uppercase">📦 Admin Inventory Dashboard</h1>
      {/* 🔘 Top Admin Buttons */}
      <div className="absolute top-0 flex gap-2 sm:mx-[0%] md:mx-[25%]">
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          Go to Website
        </button>

        <button
          onClick={() => navigate("/admin/reviews")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow"
        >
          ⚠️ Customer Review Moderation
        </button>

        <button
          onClick={() => navigate("/admin/review-orders")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded shadow"
        >
          📦 Review Pickup Orders
        </button>

        {/* 🧮 NEW: Navigate to Financial Tracker */}
        <button
          onClick={() => navigate("/admin/financials")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
        >
          💰 View Financial Tracker
        </button>

        <button
          onClick={handleLogout}
          className="top-0 right-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
        >
          Logout
        </button>
      </div>

      {/* 📂 Category Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow transition ${
              selectedCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 📋 Inventory Items */}
      {loading ? (
        <p className="text-center text-gray-500">Loading inventory...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              No items found in this category.
            </p>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className="border p-4 rounded shadow hover:shadow-lg transition">
                <div className="flex flex-col gap-2">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-500">Category: {item.category}</p>
                  <div className={`px-2 py-1 rounded border w-fit text-sm font-medium ${getStockColor(item.stock)}`}>
                    Stock: {item.stock}
                  </div>
                  <button
                    onClick={() => restockItem(item.id, 10)}
                    className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Restock +10
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
