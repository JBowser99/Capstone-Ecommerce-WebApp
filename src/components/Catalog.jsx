import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const groceryCategories = [
  "All", "Dairy", "Bread", "Deli Meat", "Meat", "Vegetables", "Fruits",
  "Seafood", "Snacks", "Baking", "Drinks", "Frozen", "Cereal"
];
const dairySubcategories = ["All Dairy", "Milk", "Eggs", "Butter", "Cheese", "Yogurt"];
const ITEMS_PER_PAGE = 20;
const ITEMS_PER_PAGE_ALL = 12;

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const { addToCart, cartUpdated } = useCart(); // ✅ Syncs with CartContext
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All Dairy");
  const [currentPage, setCurrentPage] = useState(1);
  const [quantity, setQuantity] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // ✅ Firestore real-time stock listener
  useEffect(() => {
    let q;
    if (selectedCategory === "All") {
      q = query(collection(db, "foodItems"));
    } else {
      q = query(
        collection(db, "foodItems"),
        where("category", "==", selectedCategory)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(items);
    });

    return () => unsubscribe();
  }, [selectedCategory, cartUpdated]);

  // ✅ Filter for Dairy subcategories
  const filteredProducts = selectedCategory === "Dairy"
    ? selectedSubcategory === "All Dairy"
      ? products
      : products.filter((item) => item.subcategory === selectedSubcategory)
    : products;

  const itemsPerPage = (selectedCategory === "All" ||
    (selectedCategory === "Dairy" && selectedSubcategory === "All Dairy"))
    ? ITEMS_PER_PAGE_ALL
    : ITEMS_PER_PAGE;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleQuantityChange = (id, newQty, maxStock) => {
    const safeQty = Math.max(1, Math.min(newQty, maxStock));
    setQuantity((prev) => ({ ...prev, [id]: safeQty }));
  };

  const handleAddToCart = async (item) => {
    const itemQuantity = quantity[item.id] || 1;
    await addToCart({ ...item, quantity: itemQuantity });

    setNotificationMessage(`✅ Added ${itemQuantity}x ${item.name} to Cart!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-6 relative">
      {/* ✅ Notification */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md z-50"
          >
            {notificationMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Category Buttons */}
      <div className="my-6 flex justify-center flex-wrap gap-2">
        {groceryCategories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => {
              setSelectedCategory(cat);
              setSelectedSubcategory("All Dairy");
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-full transition ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ✅ Dairy Subcategories */}
      {selectedCategory === "Dairy" && (
        <div className="border-t-2 py-6 mb-6 flex justify-center flex-wrap gap-2">
          {dairySubcategories.map((sub, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedSubcategory(sub);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-full transition ${
                selectedSubcategory === sub
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* ✅ Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedProducts.length === 0 ? (
          <p className="text-center text-gray-600">No items found in this category.</p>
        ) : (
          paginatedProducts.map((item) => (
            <div
              key={item.id}
              className="border p-4 shadow-lg rounded-lg bg-white hover:shadow-2xl transition"
            >
              <img
                src={item.image || "/placeholder.jpg"}
                alt={item.name}
                className="w-40 h-40 object-contain rounded-lg mx-auto"
              />
              <h2 className="text-lg font-semibold text-center mt-2">{item.name}</h2>
              <p className="text-gray-600 text-center font-semibold">${item.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500 text-center">Stock: {item.stock} left</p>
              <p className="text-sm text-gray-500 text-center">
                Category: {item.category} - {item.subcategory}
              </p>

              {/* ✅ Quantity Selector */}
              <div className="flex justify-center items-center space-x-2 mt-2">
                <button
                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                  onClick={() =>
                    handleQuantityChange(item.id, (quantity[item.id] || 1) - 1, item.stock)
                  }
                  disabled={(quantity[item.id] || 1) <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity[item.id] || 1}
                  onChange={(e) =>
                    handleQuantityChange(item.id, parseInt(e.target.value) || 1, item.stock)
                  }
                  className="w-12 text-center border rounded"
                  min="1"
                  max={item.stock}
                />
                <button
                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                  onClick={() =>
                    handleQuantityChange(item.id, (quantity[item.id] || 1) + 1, item.stock)
                  }
                  disabled={(quantity[item.id] || 1) >= item.stock}
                >
                  +
                </button>
              </div>

              {/* ✅ Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(item)}
                className={`mt-3 text-white py-2 px-4 rounded w-full transition ${
                  item.stock > 0
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={item.stock <= 0}
              >
                {item.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* ✅ Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            ⬅ Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;
