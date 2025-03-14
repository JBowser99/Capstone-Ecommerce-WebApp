import { seedFoodItems } from "../utils/firebaseGroceryService";

const SeedData = () => {
  const handleSeedData = async () => {
    await seedFoodItems();
    alert("✅ Sample food items added to Firestore!");
  };

  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={handleSeedData}
        className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600"
      >
        Seed Sample Food Items
      </button>
    </div>
  );
};

export default SeedData;
