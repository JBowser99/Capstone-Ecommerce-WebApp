import { useEffect, useState } from "react";
import { getGroceryItems } from "../utils/firebaseGroceryService";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion"; // ✅ Import properly

// ✅ Grocery Categories
const groceryCategories = [
  "All", "Milk", "Eggs", "Bread", "Meat", "Vegetables", "Fruits",
  "Seafood", "Snacks", "Drinks", "Frozen", "Cereal"
];

// ✅ Number of items per page
const ITEMS_PER_PAGE = 20;

const Catalog = () => {
  const [products, setProducts] = useState([]); // Stores fetched Firestore items
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All"); // ✅ Default to "All"
  const [currentPage, setCurrentPage] = useState(1); // ✅ Pagination state
  const [quantity, setQuantity] = useState({}); // Stores quantity per item
  const [showNotification, setShowNotification] = useState(false); // ✅ Show "Item Added" alert
  const [notificationMessage, setNotificationMessage] = useState(""); // ✅ Dynamic Message

  // ✅ Fetch items when category changes
  useEffect(() => {
    const fetchProducts = async () => {
      setCurrentPage(1); // ✅ Reset to first page when category changes
      console.log(`🔍 Fetching items for category: "${selectedCategory}"`);
      const items = await getGroceryItems(selectedCategory);
      console.log("✅ Fetched Items:", items);
      setProducts(items);
    };

    fetchProducts();
  }, [selectedCategory]);

  // ✅ Handle Quantity Change
  const handleQuantityChange = (id, newQuantity, maxStock) => {
    const validQuantity = Math.max(1, Math.min(newQuantity, maxStock)); // Prevents negative numbers & overstock
    setQuantity((prev) => ({ ...prev, [id]: validQuantity }));
  };

  // ✅ Handle "Add to Cart" with Notification
  const handleAddToCart = (item) => {
    const itemQuantity = quantity[item.id] || 1; // Default to 1 if not set
    addToCart({ ...item, quantity: itemQuantity }); // ✅ Now correctly updates existing quantity in cart

    // ✅ Show Notification for 2 Seconds
    setNotificationMessage(`✅ Added ${itemQuantity}x ${item.name} to Cart!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  // ✅ Handle Pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-6 relative">

      {/* ✅ "Item Added" Notification with Smooth Animation */}
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

      {/* ✅ Category Filter UI (Mobile & Desktop Friendly) */}
      <div className="my-6 flex justify-center flex-wrap gap-2">
        {groceryCategories.map((category, index) => (
          <button
            key={index}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full transition ${
              selectedCategory === category ? "bg-blue-600 text-white shadow-lg" : "bg-gray-300 hover:bg-gray-400"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* ✅ Grocery Items Grid (Responsive) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedProducts.length === 0 ? (
          <p className="text-center text-gray-600">No items found in this category.</p>
        ) : (
          paginatedProducts.map((item) => (
            <div key={item.id} className="border p-4 shadow-lg rounded-lg bg-white hover:shadow-2xl transition">
              <img 
                src={item.image || "/placeholder.jpg"} 
                alt={item.name} 
                className="w-40 h-40 object-fit rounded-lg items-center justify-center mx-auto"
              />
              <h2 className="text-lg font-semibold text-center mt-2">{item.name}</h2>
              <p className="text-gray-600 text-center font-semibold">${item.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500 text-center">Stock: {item.stock} left</p>
              <p className="text-sm text-gray-500 text-center">Category: {item.category}</p>

              {/* ✅ Quantity Selector */}
              <div className="flex justify-center items-center space-x-2 mt-2">
                <button 
                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                  onClick={() => handleQuantityChange(item.id, (quantity[item.id] || 1) - 1, item.stock)}
                  disabled={quantity[item.id] <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity[item.id] || 1}
                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1, item.stock)}
                  className="w-12 text-center border rounded"
                  min="1"
                  max={item.stock}
                />
                <button 
                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                  onClick={() => handleQuantityChange(item.id, (quantity[item.id] || 1) + 1, item.stock)}
                >
                  +
                </button>
              </div>

              {/* ✅ Add to Cart Button (Only if in Stock) */}
              <button
                onClick={() => handleAddToCart(item)}
                className={`mt-3 text-white py-2 px-4 rounded w-full transition ${
                  item.stock > 0 ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={item.stock <= 0}
              >
                {item.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          ))
        )}
      </div>

      {/* ✅ Pagination Controls (If More than 1 Page) */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button 
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className={`px-4 py-2 rounded ${currentPage === 1 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
            disabled={currentPage === 1}
          >
            ⬅ Previous
          </button>

          <span className="px-4 py-2 rounded bg-gray-200">
            Page {currentPage} of {totalPages}
          </span>

          <button 
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            className={`px-4 py-2 rounded ${currentPage === totalPages ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"}`}
            disabled={currentPage === totalPages}
          >
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;
