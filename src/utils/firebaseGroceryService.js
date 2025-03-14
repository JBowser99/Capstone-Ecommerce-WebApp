import { db } from "./firebaseConfig";
import { collection, doc, getDocs, addDoc, updateDoc, query, where } from "firebase/firestore";

// ✅ Firestore Reference
const foodCollectionRef = collection(db, "foodItems");

// ✅ Sample Food Items (15-20 items per category)
const sampleFoodData = [
  { name: "Whole Milk", category: "Milk", price: 3.99, stock: 50, image: "/whole_milk.webp", description: "Fresh whole milk, 1 gallon" },
  { name: "Almond Milk", category: "Milk", price: 4.49, stock: 30, image: "/almond_milk.webp", description: "Organic almond milk, unsweetened" },
  { name: "Brown Eggs", category: "Eggs", price: 2.99, stock: 40, image: "/brown_eggs.webp", description: "12-pack brown eggs, free-range" },
  { name: "Sourdough Bread", category: "Bread", price: 4.99, stock: 25, image: "/sourdough_bread.webp", description: "Fresh baked sourdough loaf" },
  { name: "Ground Beef", category: "Meat", price: 7.99, stock: 20, image: "/ground_beef.webp", description: "80/20 ground beef, 1 lb" },
  { name: "Chicken Breast", category: "Meat", price: 5.99, stock: 30, image: "/chicken_breast.webp", description: "Skinless, boneless chicken breast" },
  { name: "Carrots", category: "Vegetables", price: 1.99, stock: 50, image: "/carrots.webp", description: "Fresh organic carrots, 1 lb" },
  { name: "Broccoli", category: "Vegetables", price: 2.49, stock: 40, image: "/broccoli.webp", description: "Organic green broccoli, 1 bunch" },
  { name: "Bananas", category: "Fruits", price: 0.69, stock: 60, image: "/banana.webp", description: "Fresh ripe bananas, per lb" },
  { name: "Apples", category: "Fruits", price: 1.29, stock: 50, image: "/apples.webp", description: "Red apples, per lb" },
  { name: "Salmon Fillet", category: "Seafood", price: 12.99, stock: 15, image: "/salmon_fillet.webp", description: "Frozen peeled shrimp, 1 lb" },
  { name: "Potato Chips", category: "Snacks", price: 3.49, stock: 40, image: "/potato_chips.webp", description: "Classic salted potato chips" },
  { name: "Dark Chocolate Bar", category: "Snacks", price: 2.49, stock: 35, image: "/dark_chocolate_bar.webp", description: "Dark chocolate bar, 70% cocoa" },
  { name: "Orange Juice", category: "Drinks", price: 4.99, stock: 30, image: "/orange_juice.webp", description: "100% fresh orange juice, 1L" },
  { name: "Soda", category: "Drinks", price: 1.49, stock: 50, image: "/coca_cola.webp", description: "Carbonated soda, 12 oz can" },
  { name: "Frozen Cheese Pizza", category: "Frozen", price: 6.99, stock: 20, image: "/frozen_cheese_pizza.webp", description: "Pepperoni frozen pizza, 12-inch" },
  { name: "Frozen Vegetables Mix", category: "Frozen", price: 3.99, stock: 30, image: "/veggies_mix.webp", description: "Mixed frozen vegetables, 16 oz" },
  { name: "Instant Oatmeal Variety", category: "Cereal", price: 4.29, stock: 40, image: "/oatmeal_varietypack.webp", description: "Healthy oatmeal cereal, 14 oz" },
  { name: "Corn Flakes", category: "Cereal", price: 3.99, stock: 35, image: "/corn_flake.webp", description: "Classic corn flakes cereal, 18 oz" }
];

// ✅ Check if database is empty before seeding
export const seedFoodItems = async () => {
  try {
    const querySnapshot = await getDocs(foodCollectionRef);
    
    // ✅ If data already exists, do not add again
    if (!querySnapshot.empty) {
      console.log("⚠ Food items already exist. Skipping seed.");
      return;
    }

    console.log("🌱 Seeding food items into Firestore...");
    
    // ✅ Insert sample data
    for (let item of sampleFoodData) {
      await addDoc(foodCollectionRef, item);
    }
    
    console.log("✅ Food items seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding food items:", error);
  }
};

// ✅ Fetch food items by category from Firestore
export const getGroceryItems = async (selectedCategory) => {
  try {
    console.log(`🔍 Fetching Firestore items for category: "${selectedCategory}"`);

    let q = selectedCategory === "All"
      ? foodCollectionRef
      : query(foodCollectionRef, where("category", "==", selectedCategory));

    const querySnapshot = await getDocs(q);
    const items = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log("✅ Fetched items from Firestore:", items);
    return items;
  } catch (error) {
    console.error("❌ Error fetching items:", error);
    return [];
  }
};

// ✅ Function to Reduce Stock When Item is Added to Cart
export const updateStockAfterPurchase = async (itemId, quantityPurchased) => {
  try {
    const itemRef = doc(db, "foodItems", itemId);
    const itemSnap = await getDoc(itemRef);

    if (itemSnap.exists()) {
      const currentStock = itemSnap.data().stock || 0;
      const newStock = Math.max(currentStock - quantityPurchased, 0);

      await updateDoc(itemRef, { stock: newStock });
      console.log(`✅ Stock updated: ${newStock} left for ${itemId}`);
    }
  } catch (error) {
    console.error("❌ Error updating stock after purchase:", error);
  }
};

// ✅ Function to Restore Stock When Item is Removed from Cart
export const updateStockAfterRemoval = async (itemId, quantityRestored) => {
  try {
    const itemRef = doc(db, "foodItems", itemId);
    const itemSnap = await getDoc(itemRef);

    if (itemSnap.exists()) {
      const currentStock = itemSnap.data().stock || 0;
      const newStock = currentStock + quantityRestored;

      await updateDoc(itemRef, { stock: newStock });
      console.log(`✅ Stock restored: ${newStock} available for ${itemId}`);
    }
  } catch (error) {
    console.error("❌ Error updating stock after removal:", error);
  }
};

