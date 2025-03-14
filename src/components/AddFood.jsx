import { useState, useEffect } from "react";
import { addFoodItem, getFoodItems } from "../utils/firestoreService"; // Fetch existing categories
import { useAuth } from "../context/AuthContext";

// ✅ Walmart-style categories
const walmartCategories = [
  "Dairy",
  "Meat & Seafood",
  "Bakery",
  "Fruits & Vegetables",
  "Frozen Foods",
  "Snacks & Candy",
  "Beverages",
  "Pantry Staples",
  "Deli",
  "Health & Wellness"
];

const AddFood = () => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState(walmartCategories);
  const [message, setMessage] = useState("");

  // ✅ Fetch categories from Firestore & merge with Walmart categories
  useEffect(() => {
    const unsubscribe = getFoodItems((items) => {
      const uniqueCategories = Array.from(new Set([...walmartCategories, ...items.map((item) => item.category)]));
      setCategories(uniqueCategories);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.uid !== "PWJY2yNJU3Qz8uiRF2R8Y5kZqg62") {
      setMessage("❌ You are not authorized to add food items.");
      return;
    }

    if (!category) {
      setMessage("❌ Please select a category.");
      return;
    }

    const response = await addFoodItem(
      { name, price: parseFloat(price), image, description, category },
      user
    );

    setMessage(response.message);

    if (response.success) {
      setName("");
      setPrice("");
      setImage("");
      setDescription("");
      setCategory("");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow-lg rounded-lg">
      {message && <p className="text-center text-red-500">{message}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Food Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="w-full p-2 border rounded"
        ></textarea>

        {/* ✅ Category Dropdown */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat, index) => (
            <option key={`cat-${index}`} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* ✅ Admin-Only Add Button */}
        {user && user.uid === "PWJY2yNJU3Qz8uiRF2R8Y5kZqg62" ? (
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            ✅ Add Food Item
          </button>
        ) : (
          <p className="text-center text-red-500">❌ Only the admin can add food items.</p>
        )}
      </form>
    </div>
  );
};

export default AddFood;
