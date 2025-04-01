import { db } from "./firebaseConfig";
import { getAuth } from "firebase/auth";
import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

// Reference to the foodItems collection
const foodCollectionRef = collection(db, "foodItems");
const auth = getAuth();

// Sample names and comments for generating reviews
const sampleNames = [
  "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "James",
  "Isabella", "Benjamin", "Mia", "Lucas", "Charlotte", "Henry", "Amelia",
  "Sebastian", "Harper", "Jack", "Evelyn", "Elijah"
];
const sampleComments = [
  "Absolutely loved it!", "Tasted great, will buy again.", "Fresh and delicious.",
  "Decent quality for the price.", "Better than expected!", "My go-to choice!",
  "Would recommend to others.", "Not bad at all.", "Fantastic flavor.",
  "A bit pricey but worth it.", "Exceeded my expectations!", "Fast delivery and tasty.",
  "Yummy and satisfying.", "Perfect for my recipes!", "Good value overall."
];

// 🔁 Generate N random reviews
const generateSampleReviews = (n = 4) => {
  const currentUid = auth.currentUser?.uid || "guest-seed";

  return Array.from({ length: n }).map(() => ({
    name: sampleNames[Math.floor(Math.random() * sampleNames.length)],
    rating: Math.floor(Math.random() * 3) + 3,
    comment: sampleComments[Math.floor(Math.random() * sampleComments.length)],
    uid: currentUid, // 👈 use current user UID
    timestamp: Timestamp.now(),
    flagged: false,
  }));
};

// ✅ Sample Food Items (15-20 items per category)
const sampleFoodData = [
//Dairy Catagory-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //Milk
  { name: "Whole Milk", category: "Dairy", subcategory: "Milk", price: 3.99, stock: 50, image: "/whole_milk.webp", description: "Fresh whole milk, 1 gallon" },
  { name: "Almond Milk", category: "Dairy", subcategory: "Milk", price: 4.49, stock: 30, image: "/almond_milk.webp", description: "Organic almond milk, unsweetened" },
  { name: "Skim Milk", category: "Dairy", subcategory: "Milk", price: 3.99, stock: 40, image: "/skim_milk.webp", description: "Low-fat skim milk, 1 gallon" },
  { name: "Oat Milk", category: "Dairy", subcategory: "Milk", price: 4.29, stock: 30, image: "/oat_milk.webp", description: "Creamy oat milk, unsweetened" },
  { name: "Soy Milk", category: "Dairy", subcategory: "Milk", price: 4.49, stock: 35, image: "/soy_milk.webp", description: "Organic soy milk, vanilla" },
  { name: "Coconut Milk", category: "Dairy", subcategory: "Milk", price: 3.89, stock: 25, image: "/coconut_milk.webp", description: "Rich coconut milk, 32 oz" },
  { name: "Lactose-Free Milk", category: "Dairy", subcategory: "Milk", price: 4.59, stock: 30, image: "/lactose_free_milk.webp", description: "Dairy milk without lactose, 1 gallon" },
  { name: "Chocolate Milk", category: "Dairy", subcategory: "Milk", price: 4.99, stock: 40, image: "/chocolate_milk.webp", description: "Sweetened chocolate-flavored milk, 1L" },
  //Eggs
  { name: "White Eggs", category: "Dairy", subcategory: "Eggs", price: 2.79, stock: 45, image: "/white_eggs.webp", description: "12-pack large white eggs" },
  { name: "Brown Eggs", category: "Dairy", subcategory: "Eggs", price: 2.99, stock: 40, image: "/brown_eggs.webp", description: "12-pack brown eggs, free-range" },
  { name: "Duck Eggs", category: "Dairy", subcategory: "Eggs", price: 5.99, stock: 20, image: "/duck_eggs.webp", description: "6-pack fresh duck eggs" },
  { name: "Quail Eggs", category: "Dairy", subcategory: "Eggs", price: 4.99, stock: 25, image: "/quail_eggs.webp", description: "Small quail eggs, 18-pack" },
  { name: "Pasteurized Liquid Eggs", category: "Dairy", subcategory: "Eggs", price: 3.99, stock: 30, image: "/liquid_eggs.webp", description: "Carton of liquid egg whites" },
  { name: "Omega-3 Enriched Eggs", category: "Dairy", subcategory: "Eggs", price: 3.89, stock: 30, image: "/omega3_eggs.webp", description: "12-pack Omega-3 enriched eggs" },
  { name: "Cage-Free Eggs", category: "Dairy", subcategory: "Eggs", price: 3.49, stock: 40, image: "/cage_free_eggs.webp", description: "12-pack cage-free large eggs" },
  { name: "Egg Substitute", category: "Dairy", subcategory: "Eggs", price: 3.99, stock: 35, image: "/egg_substitute.webp", description: "Plant-based egg replacement" },
  //Butter
  { name: "Salted Butter", category: "Dairy", subcategory: "Butter", price: 4.99, stock: 40, image: "/salted_butter.webp", description: "Rich, creamy salted butter, 1 lb" },
  { name: "Unsalted Butter", category: "Dairy", subcategory: "Butter", price: 4.99, stock: 35, image: "/unsalted_butter.webp", description: "Pure unsalted butter, ideal for baking, 1 lb" },
  { name: "Whipped Butter", category: "Dairy", subcategory: "Butter", price: 5.29, stock: 30, image: "/whipped_butter.webp", description: "Light and airy whipped butter, 8 oz tub" },
  { name: "European Style Butter", category: "Dairy", subcategory: "Butter", price: 6.49, stock: 25, image: "/european_butter.webp", description: "High-fat European-style cultured butter, 1 lb" },
  { name: "Organic Butter", category: "Dairy", subcategory: "Butter", price: 5.99, stock: 30, image: "/organic_butter.webp", description: "Grass-fed organic butter, 1 lb" },
  { name: "Plant-Based Butter", category: "Dairy", subcategory: "Butter", price: 6.29, stock: 20, image: "/plant_based_butter.webp", description: "Dairy-free plant-based butter alternative, 8 oz" },
  { name: "Ghee (Clarified Butter)", category: "Dairy", subcategory: "Butter", price: 7.99, stock: 20, image: "/ghee_butter.webp", description: "Traditional clarified butter (ghee), 16 oz" },
  { name: "Garlic Herb Butter", category: "Dairy", subcategory: "Butter", price: 5.79, stock: 25, image: "/garlic_herb_butter.webp", description: "Flavored butter with garlic and herbs, 8 oz" },
  //Cheese
  { name: "Cheddar Cheese (Sliced)", category: "Dairy", subcategory: "Cheese", price: 4.99, stock: 40, image: "/cheddar_cheese_sliced.webp", description: "Mild cheddar cheese, pre-sliced, 8 oz pack" },
  { name: "Mozzarella Cheese (Shredded)", category: "Dairy", subcategory: "Cheese", price: 5.49, stock: 35, image: "/mozzarella_cheese_shredded.webp", description: "Fresh shredded mozzarella cheese, 16 oz" },
  { name: "Swiss Cheese (Sliced)", category: "Dairy", subcategory: "Cheese", price: 5.79, stock: 30, image: "/swiss_cheese_sliced.webp", description: "Nutty Swiss cheese, pre-sliced, 8 oz pack" },
  { name: "Parmesan Cheese (Grated)", category: "Dairy", subcategory: "Cheese", price: 6.99, stock: 25, image: "/parmesan_cheese_grated.webp", description: "Aged grated Parmesan cheese, 8 oz" },
  { name: "Pepper Jack Cheese (Sliced)", category: "Dairy", subcategory: "Cheese", price: 5.29, stock: 30, image: "/pepper_jack_cheese_sliced.webp", description: "Spicy pepper jack cheese, pre-sliced, 8 oz pack" },
  { name: "Colby Jack Cheese (Shredded)", category: "Dairy", subcategory: "Cheese", price: 4.79, stock: 30, image: "/colby_jack_cheese_shredded.webp", description: "Blended Colby and Monterey Jack cheese, shredded, 16 oz" },
  { name: "Provolone Cheese (Sliced)", category: "Dairy", subcategory: "Cheese", price: 5.59, stock: 25, image: "/provolone_cheese_sliced.webp", description: "Smooth provolone cheese, pre-sliced, 8 oz pack" },
  { name: "Feta Cheese Block", category: "Dairy", subcategory: "Cheese", price: 6.29, stock: 20, image: "/feta_block.webp", description: "Rich and tangy feta cheese block, perfect for slicing or crumbling. 8 oz" },
  //Yogurt
  { name: "Plain Greek Yogurt", category: "Dairy", subcategory: "Yogurt",  price: 4.29, stock: 40, image: "/plain_greek_yogurt.webp", description: "Thick and creamy plain Greek yogurt, 32 oz" },
  { name: "Strawberry Yogurt", category: "Dairy", subcategory: "Yogurt",  price: 1.99, stock: 50, image: "/strawberry_yogurt.webp", description: "Creamy strawberry yogurt, 6 oz cup" },
  { name: "Vanilla Yogurt", category: "Dairy", subcategory: "Yogurt",  price: 2.49, stock: 45, image: "/vanilla_yogurt.webp", description: "Smooth vanilla-flavored yogurt, 6 oz cup" },
  { name: "Blueberry Yogurt", category: "Dairy", subcategory: "Yogurt",  price: 2.29, stock: 40, image: "/blueberry_yogurt.webp", description: "Rich blueberry yogurt, 6 oz cup" },
  { name: "Almond Milk Yogurt", category: "Dairy", subcategory: "Yogurt",  price: 3.99, stock: 35, image: "/almond_milk_yogurt.webp", description: "Dairy-free almond milk yogurt, 6 oz cup" },
  { name: "Coconut Yogurt", category: "Dairy", subcategory: "Yogurt",  price: 4.29, stock: 30, image: "/coconut_yogurt.webp", description: "Dairy-free coconut yogurt, 6 oz cup" },
  { name: "Mango Yogurt", category: "Dairy", subcategory: "Yogurt",  price: 2.79, stock: 40, image: "/mango_yogurt.webp", description: "Tropical mango-flavored yogurt, 6 oz cup" },
  { name: "Honey Yogurt", category: "Dairy", subcategory: "Yogurt",   price: 3.49, stock: 30, image: "/honey_yogurt.webp", description: "Greek yogurt with honey, 6 oz cup" },
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Bread Catagory-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  { name: "Sourdough Bread", category: "Bread", price: 4.99, stock: 25, image: "/sourdough_bread.webp", description: "Fresh baked sourdough loaf" },
  { name: "Whole Wheat Bread", category: "Bread", price: 3.99, stock: 30, image: "/whole_wheat_bread.webp", description: "Healthy whole wheat loaf" },
  { name: "Baguette", category: "Bread", price: 2.99, stock: 25, image: "/baguette.webp", description: "Freshly baked French baguette" },
  { name: "Multigrain Bread", category: "Bread", price: 4.49, stock: 20, image: "/multigrain_bread.webp", description: "Loaf with mixed grains and seeds" },
  { name: "Rye Bread", category: "Bread", price: 4.79, stock: 20, image: "/rye_bread.webp", description: "Classic dark rye loaf" },
  { name: "Ciabatta", category: "Bread", price: 3.49, stock: 25, image: "/ciabatta.webp", description: "Italian-style ciabatta bread" },
  { name: "Gluten-Free Bread", category: "Bread", price: 5.99, stock: 15, image: "/gluten_free_bread.webp", description: "Soft and fluffy gluten-free loaf" },
  { name: "Brioche Buns", category: "Bread", price: 4.99, stock: 20, image: "/brioche_buns.webp", description: "Soft and fluffy brioche buns, 6-pack" },
  { name: "Potato Bread", category: "Bread", price: 4.29, stock: 25, image: "/potato_bread.webp", description: "Rich and moist potato-based bread loaf" },
  { name: "Sub Rolls", category: "Bread", price: 3.99, stock: 30, image: "/sub_rolls.webp", description: "Soft and chewy hoagie rolls, great for sandwiches" },
  { name: "Texas Toast", category: "Bread", price: 3.49, stock: 35, image: "/texas_toast.webp", description: "Thick-sliced Texas toast, perfect for garlic bread" },
  { name: "Marbled Rye Bread", category: "Bread", price: 5.49, stock: 20, image: "/marbled_rye_bread.webp", description: "A mix of light and dark rye, perfect for deli sandwiches" },
  { name: "Hawaiian Sweet Rolls", category: "Bread", price: 4.99, stock: 25, image: "/hawaiian_sweet_rolls.webp", description: "Soft and sweet Hawaiian rolls, 12-pack" },
  { name: "Focaccia Bread", category: "Bread", price: 4.79, stock: 15, image: "/focaccia_bread.webp", description: "Italian-style herbed focaccia bread" },
  { name: "Cheesy Garlic Bread", category: "Bread", price: 4.29, stock: 20, image: "/cheesy_garlic_bread.webp", description: "Garlic bread topped with melted cheese" },
  { name: "Garlic Bread", category: "Bread", price: 3.29, stock: 30, image: "/garlic_bread.webp", description: "Pre-sliced garlic butter bread" },
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Deli Meat Catagory-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  { name: "Roast Beef", category: "Deli Meat", price: 8.99, stock: 20, image: "/roast_beef.webp", description: "Thinly sliced roast beef, 1 lb" },
  { name: "Honey Ham", category: "Deli Meat", price: 7.49, stock: 30, image: "/honey_ham.webp", description: "Sliced honey-glazed ham, 1 lb" },
  {  name: "Smoked Turkey", category: "Deli Meat", price: 6.99, stock: 25, image: "/smoked_turkey.webp", description: "Sliced smoked turkey breast, 1 lb" },
  { name: "Salami", category: "Deli Meat", price: 5.99, stock: 30, image: "/salami.webp", description: "Italian-style hard salami, 1 lb" },
  { name: "Pastrami", category: "Deli Meat", price: 9.49, stock: 25, image: "/pastrami.webp", description: "Peppered pastrami beef, 1 lb" },
  { name: "Corned Beef", category: "Deli Meat", price: 8.99, stock: 15, image: "/deli_corned_beef.webp", description: "Thin-sliced corned beef, 1 lb" },
  { name: "Bologna", category: "Deli Meat", price: 4.99, stock: 35, image: "/bologna.webp", description: "Classic beef bologna slices, 1 lb" },
  { name: "Prosciutto", category: "Deli Meat", price: 10.99, stock: 20, image: "/prosciutto.webp", description: "Dry-cured Italian prosciutto, 8 oz" },
  { name: "Mortadella", category: "Deli Meat", price: 7.99, stock: 15, image: "/mortadella.webp", description: "Italian-style mortadella with pistachios, 1 lb" },
  { name: "Pepperoni", category: "Deli Meat", price: 6.49, stock: 10, image: "/pepperoni.webp", description: "Sliced spicy pepperoni, 1 lb" },
  { name: "Capicola", category: "Deli Meat", price: 7.49, stock: 30, image: "/capicola.webp", description: "Hot capicola ham, 1 lb" },
  { name: "Turkey Breast", category: "Deli Meat", price: 8.99, stock: 20, image: "/deli_turkey.webp", description: "Oven-roasted turkey breast, 1 lb" },
  { name: "Black Forest Ham", category: "Deli Meat", price: 7.99, stock: 12, image: "/black_forest_ham.webp", description: "Smoky Black Forest ham, 1 lb" },
  { name: "Chicken Breast", category: "Deli Meat", price: 6.99, stock: 15, image: "/deli_chicken_breast.webp", description: "Sliced deli-style chicken breast, 1 lb" },
  { name: "Liverwurst", category: "Deli Meat", price: 4.99, stock: 18, image: "/liverwurst.webp", description: "Traditional liverwurst spread, 1 lb" },
  { name: "Turkey Pastrami", category: "Deli Meat", price: 7.49, stock: 22, image: "/turkey_pastrami.webp", description: "Smoked turkey pastrami, 1 lb" },
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Meat Catagory-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  { name: "Ground Beef", category: "Meat", price: 7.99, stock: 20, image: "/ground_beef.webp", description: "80/20 ground beef, 1 lb" },
  { name: "Chicken Breast", category: "Meat", price: 5.99, stock: 30, image: "/chicken_breast.webp", description: "Skinless, boneless chicken breast" },
  { name: "Pork Chops", category: "Meat", price: 6.99, stock: 25, image: "/pork_chops.webp", description: "Fresh pork loin chops, 1 lb" },
  { name: "Bacon", category: "Meat", price: 5.99, stock: 30, image: "/bacon.webp", description: "Smoked, thick-cut bacon, 1 lb" },
  { name: "Turkey Breast", category: "Meat", price: 6.49, stock: 25, image: "/turkey_breast.webp", description: "Skinless turkey breast fillet" },
  { name: "Lamb Chops", category: "Meat", price: 9.99, stock: 15, image: "/lamb_chops.webp", description: "Tender lamb chops, 1 lb" },
  { name: "Sausages", category: "Meat", price: 4.99, stock: 35, image: "/sausages.webp", description: "Italian-style pork sausages, 1 lb" },
  { name: "Steak (Ribeye)", category: "Meat", price: 12.99, stock: 20, image: "/ribeye_steak.webp", description: "Juicy ribeye steak, 12 oz" },
  { name: "Filet Mignon", category: "Meat", price: 19.99, stock: 15, image: "/filet_mignon.webp", description: "Premium tenderloin steak, 8 oz" },
  { name: "Beef Brisket", category: "Meat", price: 14.99, stock: 10, image: "/beef_brisket.webp", description: "Slow-cook beef brisket, 2 lbs" },
  { name: "Chicken Thighs", category: "Meat", price: 4.99, stock: 30, image: "/chicken_thighs.webp", description: "Boneless, skinless chicken thighs, 1 lb" },
  { name: "Ham", category: "Meat", price: 8.99, stock: 20, image: "/ham.webp", description: "Sliced honey-glazed ham, 1 lb" },
  { name: "Duck Breast", category: "Meat", price: 15.99, stock: 12, image: "/duck_breast.webp", description: "Rich, flavorful duck breast, 1 lb" },
  { name: "Veal Cutlets", category: "Meat", price: 13.49, stock: 15, image: "/veal_cutlets.webp", description: "Tender veal cutlets, 1 lb" },
  { name: "Hot Dogs", category: "Meat", price: 10.99, stock: 18, image: "/hotdogs.webp", description: "Hot Dogs 12pk, 2 lbs" },
  { name: "Chorizo", category: "Meat", price: 6.49, stock: 22, image: "/chorizo.webp", description: "Spicy Spanish-style chorizo sausage, 1 lb" },
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Veggies Catagory-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  { name: "Broccoli", category: "Vegetables", price: 2.49, stock: 40, image: "/broccoli.webp", description: "Organic green broccoli, 1 bunch" },
  { name: "Carrots", category: "Vegetables", price: 1.99, stock: 50, image: "/carrots.webp", description: "Fresh organic carrots, 1 lb" },
  { name: "Lettuce", category: "Vegetables", price: 1.79, stock: 50, image: "/lettuce.webp", description: "Crisp romaine lettuce, 1 head" },
  { name: "Spinach", category: "Vegetables", price: 2.99, stock: 40, image: "/spinach.webp", description: "Organic baby spinach, 8 oz" },
  { name: "Bell Peppers", category: "Vegetables", price: 2.99, stock: 40, image: "/bell_peppers.webp", description: "Mixed red, yellow, and green bell peppers" },
  { name: "Tomatoes", category: "Vegetables", price: 2.49, stock: 50, image: "/tomatoes.webp", description: "Fresh vine-ripened tomatoes, per lb" },
  { name: "Onions", category: "Vegetables", price: 1.49, stock: 60, image: "/onions.webp", description: "Yellow onions, per lb" },
  { name: "Cucumbers", category: "Vegetables", price: 1.99, stock: 50, image: "/cucumbers.webp", description: "Fresh crunchy cucumbers, per lb" },
  { name: "Zucchini", category: "Vegetables", price: 1.99, stock: 45, image: "/zucchini.webp", description: "Fresh green zucchini, per lb" },
  { name: "Mushrooms", category: "Vegetables", price: 3.49, stock: 40, image: "/mushrooms.webp", description: "White button mushrooms, 8 oz" },
  { name: "Sweet Corn", category: "Vegetables", price: 0.99, stock: 50, image: "/sweet_corn.webp", description: "Fresh sweet corn on the cob" },
  { name: "Green Beans", category: "Vegetables", price: 2.49, stock: 40, image: "/green_beans.webp", description: "Fresh green beans, per lb" },
  { name: "Avocados", category: "Vegetables", price: 1.99, stock: 35, image: "/avocados.webp", description: "Creamy Hass avocados, each" },
  { name: "Cabbage", category: "Vegetables", price: 1.79, stock: 30, image: "/cabbage.webp", description: "Fresh green cabbage, per head" },
  { name: "Eggplant", category: "Vegetables", price: 2.49, stock: 25, image: "/eggplant.webp", description: "Deep purple eggplant, per lb" },
  { name: "Asparagus", category: "Vegetables", price: 3.99, stock: 20, image: "/asparagus.webp", description: "Fresh asparagus spears, 1 bunch" },
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Fruits Catagory-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  { name: "Bananas", category: "Fruits", price: 0.69, stock: 60, image: "/banana.webp", description: "Fresh ripe bananas, per lb" },
  { name: "Apples", category: "Fruits", price: 1.29, stock: 50, image: "/apples.webp", description: "Red apples, per lb" },
  { name: "Strawberries", category: "Fruits", price: 2.99, stock: 50, image: "/strawberries.webp", description: "Sweet fresh strawberries, per lb" },
  { name: "Blueberries", category: "Fruits", price: 3.49, stock: 40, image: "/blueberries.webp", description: "Organic blueberries, 6 oz" },
  { name: "Grapes", category: "Fruits", price: 2.79, stock: 50, image: "/grapes.webp", description: "Juicy seedless grapes, per lb" },
  { name: "Oranges", category: "Fruits", price: 1.99, stock: 50, image: "/oranges.webp", description: "Fresh navel oranges, per lb" },
  { name: "Watermelon", category: "Fruits", price: 5.99, stock: 20, image: "/watermelon.webp", description: "Large seedless watermelon" },
  { name: "Pineapple", category: "Fruits", price: 3.99, stock: 30, image: "/pineapple.webp", description: "Sweet tropical pineapple" },
  { name: "Peaches", category: "Fruits", price: 2.49, stock: 35, image: "/peaches.webp", description: "Juicy fresh peaches, per lb" },
  { name: "Plums", category: "Fruits", price: 2.29, stock: 40, image: "/plums.webp", description: "Sweet ripe plums, per lb" },
  { name: "Cherries", category: "Fruits", price: 4.99, stock: 30, image: "/cherries.webp", description: "Fresh dark red cherries, per lb" },
  { name: "Mangoes", category: "Fruits", price: 1.99, stock: 40, image: "/mangoes.webp", description: "Ripe mangoes, each" },
  { name: "Lemons", category: "Fruits", price: 0.89, stock: 50, image: "/lemons.webp", description: "Fresh lemons, each" },
  { name: "Limes", category: "Fruits", price: 0.79, stock: 50, image: "/limes.webp", description: "Tart green limes, each" },
  { name: "Pears", category: "Fruits", price: 1.99, stock: 40, image: "/pears.webp", description: "Crisp and sweet pears, per lb" },
  { name: "Cantaloupe", category: "Fruits", price: 3.99, stock: 25, image: "/cantaloupe.webp", description: "Fresh whole cantaloupe" },
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Seafood Catagory-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  { name: "Salmon Fillet", category: "Seafood", price: 12.99, stock: 15, image: "/salmon_fillet.webp", description: "Frozen peeled shrimp, 1 lb" },
  { name: "Shrimp", category: "Seafood", price: 10.99, stock: 20, image: "/shrimp.webp", description: "Raw peeled shrimp, 1 lb" },
  { name: "Tilapia Fillet", category: "Seafood", price: 8.49, stock: 25, image: "/tilapia_fillet.webp", description: "Fresh tilapia fillet, 1 lb" },
  { name: "Tuna Steaks", category: "Seafood", price: 14.99, stock: 18, image: "/tuna_steaks.webp", description: "Wild-caught tuna steaks, 2 pieces" },
  { name: "Crab Legs", category: "Seafood", price: 22.99, stock: 12, image: "/crab_legs.webp", description: "Fresh snow crab legs, 1 lb" },
  { name: "Lobster", category: "Seafood", price: 29.99, stock: 10, image: "/lobster.webp", description: "Frozen lobster tails, per lb" },
  { name: "Cod Fillet", category: "Seafood", price: 9.99, stock: 20, image: "/cod_fillets.webp", description: "Mild white cod fillets, 1 lb" },
  { name: "Scallops", category: "Seafood", price: 19.99, stock: 15, image: "/scallops.webp", description: "Fresh jumbo scallops, per lb" },
  { name: "Catfish Fillet", category: "Seafood", price: 7.99, stock: 25, image: "/catfish_fillet.webp", description: "Farm-raised catfish fillets, 1 lb" },
  { name: "Mahi-Mahi", category: "Seafood", price: 11.99, stock: 18, image: "/mahi_mahi.webp", description: "Mild and flaky mahi-mahi fillets, 1 lb" },
  { name: "Clams", category: "Seafood", price: 9.49, stock: 20, image: "/clams.webp", description: "Fresh clams in shell, 1 lb" },
  { name: "Oysters", category: "Seafood", price: 15.99, stock: 12, image: "/oysters.webp", description: "Fresh raw oysters, dozen" },
  { name: "King Crab Legs", category: "Seafood", price: 34.99, stock: 10, image: "/king_crab_legs.webp", description: "Premium Alaskan king crab legs, 1 lb" },
  { name: "Sardines", category: "Seafood", price: 5.99, stock: 30, image: "/sardines.webp", description: "Canned sardines in olive oil, 4.4 oz" },
  { name: "Anchovies", category: "Seafood", price: 4.99, stock: 25, image: "/anchovies.webp", description: "Salted anchovies in oil, 3.5 oz" },
  { name: "Octopus", category: "Seafood", price: 16.99, stock: 15, image: "/octopus.webp", description: "Fresh whole octopus, 2 lbs" },
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Snacks Catagory-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  { name: "Potato Chips", category: "Snacks", price: 3.49, stock: 40, image: "/potato_chips.webp", description: "Classic salted potato chips" },
  { name: "Pretzels", category: "Snacks", price: 2.99, stock: 35, image: "/pretzels.webp", description: "Classic salted pretzels, 8 oz" },
  { name: "Granola Bars", category: "Snacks", price: 4.49, stock: 30, image: "/granola_bars.webp", description: "Nut and fruit granola bars, 6-pack" },
  { name: "Popcorn", category: "Snacks", price: 3.29, stock: 40, image: "/popcorn.webp", description: "Butter-flavored microwave popcorn, 3-pack" },
  { name: "Trail Mix", category: "Snacks", price: 5.49, stock: 25, image: "/trail_mix.webp", description: "Nuts and dried fruit mix, 12 oz" },
  { name: "Cheese Crackers", category: "Snacks", price: 3.99, stock: 35, image: "/cheese_crackers.webp", description: "Baked cheese crackers, 7 oz box" },
  { name: "Cheese Puffs", category: "Snacks", price: 3.79, stock: 40, image: "/cheese_puffs.webp", description: "Crunchy cheese-flavored puffs, 8 oz" },
  { name: "Rice Cakes", category: "Snacks", price: 2.99, stock: 30, image: "/rice_cakes.webp", description: "Lightly salted rice cakes, 6-pack" },
  { name: "Beef Jerky", category: "Snacks", price: 6.99, stock: 25, image: "/beef_jerky.webp", description: "Smoky beef jerky, 3.5 oz bag" },
  { name: "Fruit Snacks", category: "Snacks", price: 3.49, stock: 35, image: "/fruit_snacks.webp", description: "Gummy fruit-flavored snacks, 10-pack" },
  { name: "Nut Mix", category: "Snacks", price: 4.99, stock: 30, image: "/nut_mix.webp", description: "Salted mixed nuts, 12 oz" },
  { name: "Yogurt-Covered Pretzels", category: "Snacks", price: 3.99, stock: 25, image: "/yogurt_pretzels.webp", description: "Sweet yogurt-covered pretzels, 8 oz" },
  { name: "Pita Chips", category: "Snacks", price: 3.29, stock: 30, image: "/pita_chips.webp", description: "Crunchy pita chips, 7 oz bag" },
  { name: "Cheddar Popcorn", category: "Snacks", price: 3.99, stock: 35, image: "/chedder_popcorn.webp", description: "Cheddar cheese-flavored popcorn, 6 oz" },
  { name: "Honey Roasted Peanuts", category: "Snacks", price: 3.49, stock: 40, image: "/honey_roasted_peanuts.webp", description: "Honey-roasted peanuts, 10 oz" },
  { name: "Peanut Butter Crackers", category: "Snacks", price: 2.79, stock: 30, image: "/peanut_butter_crackers.webp", description: "Cheese peanut butter sandwich crackers, 8-pack" },
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Baking Catagory-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  { name: "Dark Chocolate Bar", category: "Baking", price: 2.49, stock: 35, image: "/dark_chocolate_bar.webp", description: "Dark chocolate bar, 70% cocoa" },
  { name: "All-Purpose Flour", category: "Baking", price: 3.99, stock: 40, image: "/all_purpose_flour.webp", description: "Unbleached all-purpose flour, 5 lbs" },
  { name: "Granulated Sugar", category: "Baking", price: 2.79, stock: 50, image: "/granulated_sugar.webp", description: "Pure granulated white sugar, 4 lbs" },
  { name: "Baking Powder", category: "Baking", price: 1.99, stock: 30, image: "/baking_powder.webp", description: "Double-acting baking powder, 8 oz" },
  { name: "Baking Soda", category: "Baking", price: 1.49, stock: 40, image: "/baking_soda.webp", description: "Pure baking soda for baking and cleaning, 16 oz" },
  { name: "Vanilla Extract", category: "Baking", price: 5.99, stock: 25, image: "/vanilla_extract.webp", description: "Pure vanilla extract, 4 oz bottle" },
  { name: "Semi-Sweet Chocolate Chips", category: "Baking", price: 3.49, stock: 35, image: "/chocolate_chips.webp", description: "Semi-sweet chocolate chips, 12 oz bag" },
  { name: "Cocoa Powder", category: "Baking", price: 4.29, stock: 30, image: "/cocoa_powder.webp", description: "Unsweetened cocoa powder, 8 oz" },
  { name: "Brown Sugar", category: "Baking", price: 2.99, stock: 40, image: "/brown_sugar.webp", description: "Soft packed brown sugar, 2 lbs" },
  { name: "Powdered Sugar", category: "Baking", price: 2.79, stock: 45, image: "/powdered_sugar.webp", description: "Confectioners' powdered sugar, 2 lbs" },
  { name: "Almond Flour", category: "Baking", price: 6.99, stock: 25, image: "/almond_flour.webp", description: "Gluten-free almond flour, 1 lb" },
  { name: "Cornstarch", category: "Baking", price: 2.49, stock: 35, image: "/cornstarch.webp", description: "Pure cornstarch for thickening, 16 oz" },
  { name: "Honey", category: "Baking", price: 5.49, stock: 30, image: "/honey.webp", description: "Raw natural honey, 16 oz" },
  { name: "Molasses", category: "Baking", price: 4.99, stock: 20, image: "/molasses.webp", description: "Thick blackstrap molasses, 12 oz" },
  { name: "Yeast", category: "Baking", price: 3.99, stock: 30, image: "/yeast.webp", description: "Active dry yeast for baking, 4 oz" },
  { name: "Sweetened Condensed Milk", category: "Baking", price: 3.49, stock: 35, image: "/condensed_milk.webp", description: "Sweetened condensed milk, 14 oz can" },
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Drinks Catagory-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  { name: "Orange Juice", category: "Drinks", price: 4.99, stock: 30, image: "/orange_juice.webp", description: "100% fresh orange juice, 1L" },
  { name: "Coca Cola", category: "Drinks", price: 1.49, stock: 50, image: "/coca_cola.webp", description: "Carbonated soda, 12 oz can" },
  { name: "Apple Juice", category: "Drinks", price: 4.59, stock: 30, image: "/apple_juice.webp", description: "100% fresh apple juice, 1L" },
  { name: "Iced Tea", category: "Drinks", price: 2.99, stock: 40, image: "/iced_tea_unsweet.webp", description: "Unsweet iced tea, 20 oz" },
  { name: "Sports Drink", category: "Drinks", price: 2.49, stock: 35, image: "/gatorade_variety.webp", description: "Gatorade variety pack, 20 oz" },
  { name: "Bottled Water", category: "Drinks", price: 1.29, stock: 50, image: "/bottled_water.webp", description: "Pack of purified bottled water, 16 oz" },
  { name: "Energy Drink", category: "Drinks", price: 3.99, stock: 25, image: "/redbull_energy.webp", description: "Red Bull original energy drink, 12 oz" },
  { name: "Lemonade", category: "Drinks", price: 3.49, stock: 30, image: "/lemonade.webp", description: "Fresh-squeezed lemonade, 1L" },
  { name: "Cold Brew Coffee", category: "Drinks", price: 4.99, stock: 25, image: "/cold_brew_coffee.webp", description: "Smooth cold brew coffee, 16 oz" },
  { name: "Green Tea", category: "Drinks", price: 3.29, stock: 40, image: "/green_tea.webp", description: "Refreshing unsweetened green tea, 20 oz" },
  { name: "Coconut Water", category: "Drinks", price: 3.99, stock: 35, image: "/coconut_water.webp", description: "Pure coconut water, 16 oz" },
  { name: "Grape Juice", category: "Drinks", price: 4.59, stock: 30, image: "/grape_juice.webp", description: "100% grape juice, 1L" },
  { name: "Sparkling Water", category: "Drinks", price: 2.29, stock: 40, image: "/sparkling_water.webp", description: "Flavored sparkling water, 12 oz can" },
  { name: "Protein Shake", category: "Drinks", price: 5.49, stock: 25, image: "/protein_shake.webp", description: "High-protein chocolate shake, 12 oz" },
  { name: "Root Beer", category: "Drinks", price: 1.99, stock: 35, image: "/root_beer.webp", description: "Classic root beer soda, 12 oz can" },
  { name: "Olipop Lemon Lime", category: "Drinks", price: 3.99, stock: 30, image: "/olipop_lemon_lime.webp", description: "Refreshing  healthier soda 16 oz" },
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Frozen Catagory-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  { name: "Frozen Cheese Pizza", category: "Frozen", price: 6.99, stock: 20, image: "/frozen_cheese_pizza.webp", description: "Pepperoni frozen pizza, 12-inch" },
  { name: "Frozen Vegetables Mix", category: "Frozen", price: 3.99, stock: 30, image: "/veggies_mix.webp", description: "Mixed frozen vegetables, 16 oz" },
  { name: "Frozen French Fries", category: "Frozen", price: 3.49, stock: 40, image: "/frozen_french_fries.webp", description: "Crispy frozen potato fries, 1 lb" },
  { name: "Frozen Chicken Nuggets", category: "Frozen", price: 5.99, stock: 25, image: "/frozen_chicken_nuggets.webp", description: "Breaded chicken nuggets, 1 lb" },
  { name: "Frozen Berry Mix", category: "Frozen", price: 4.99, stock: 30, image: "/frozen_berry_mix.webp", description: "Strawberries, blueberries, blackberries, 16 oz" },
  { name: "Frozen Waffles", category: "Frozen", price: 4.49, stock: 30, image: "/frozen_waffles.webp", description: "Buttermilk frozen waffles, 10-pack" },
  { name: "Ice Cream (Vanilla)", category: "Frozen", price: 6.99, stock: 30, image: "/vanilla_ice_cream.webp", description: "Creamy vanilla ice cream, 1 pint" },
  { name: "Frozen Burritos", category: "Frozen", price: 7.49, stock: 25, image: "/frozen_burritos.webp", description: "Beef and bean frozen burritos, 6-pack" },
  { name: "Frozen Meatballs", category: "Frozen", price: 6.49, stock: 30, image: "/frozen_meatballs.webp", description: "Italian-style frozen meatballs, 1 lb" },
  { name: "Frozen Fish Fillets", category: "Frozen", price: 7.99, stock: 25, image: "/frozen_fish_fillets.webp", description: "Breaded frozen fish fillets, 1 lb" },
  { name: "Frozen Mozzarella Sticks", category: "Frozen", price: 5.99, stock: 30, image: "/frozen_mozzarella_sticks.webp", description: "Breaded frozen mozzarella sticks, 12 oz" },
  { name: "Frozen Tater Tots", category: "Frozen", price: 3.99, stock: 40, image: "/frozen_tater_tots.webp", description: "Crispy frozen tater tots, 1 lb" },
  { name: "Ice Cream (Chocolate)", category: "Frozen", price: 6.99, stock: 30, image: "/chocolate_ice_cream.webp", description: "Rich chocolate ice cream, 1 pint" },
  { name: "Frozen Pancakes", category: "Frozen", price: 4.29, stock: 30, image: "/frozen_pancakes.webp", description: "Frozen buttermilk pancakes, 12-pack" },
  { name: "Frozen Egg Rolls", category: "Frozen", price: 5.99, stock: 25, image: "/frozen_egg_rolls.webp", description: "Vegetable and pork frozen egg rolls, 8-pack" },
  { name: "Frozen Garlic Bread", category: "Frozen", price: 3.99, stock: 30, image: "/frozen_garlic_bread.webp", description: "Pre-sliced frozen garlic bread, 16 oz" },
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

//Cereal Catagory-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  { name: "Frosted Flakes", category: "Cereal", price: 4.49, stock: 30, image: "/frosted_flakes.webp", description: "Classic frosted corn cereal, 18 oz" },
  { name: "Granola Cereal", category: "Cereal", price: 5.29, stock: 25, image: "/granola_cereal.webp", description: "Honey oat granola cereal, 14 oz" },
  { name: "Rice Krispies", category: "Cereal", price: 3.79, stock: 40, image: "/rice_krispies.webp", description: "Crispy rice cereal, 18 oz" },
  { name: "Chocolate Cereal", category: "Cereal", price: 4.99, stock: 35, image: "/chocolate_cereal.webp", description: "Cocoa-flavored puffs cereal, 16 oz" },
  { name: "Muesli", category: "Cereal", price: 6.49, stock: 20, image: "/muesli.webp", description: "Whole grain muesli mix, 14 oz" },
  { name: "Honey Nut Cheerios", category: "Cereal", price: 4.79, stock: 30, image: "/honey_nut_cheerios.webp", description: "Honey-flavored oat cereal, 18 oz" },
  { name: "Instant Oatmeal Variety", category: "Cereal", price: 4.29, stock: 40, image: "/oatmeal_varietypack.webp", description: "Healthy oatmeal cereal, 14 oz" },
  { name: "Cinnamon Toast Crunch", category: "Cereal", price: 4.99, stock: 30, image: "/cinnamon_toast_crunch.webp", description: "Cinnamon sugar square cereal, 18 oz" },
  { name: "Fruit Loops", category: "Cereal", price: 4.79, stock: 35, image: "/fruit_loops.webp", description: "Fruity flavored ring cereal, 18 oz" },
  { name: "Mini Wheats", category: "Cereal", price: 5.29, stock: 25, image: "/mini_wheats.webp", description: "Frosted wheat cereal, 18 oz" },
  { name: "Raisin Bran", category: "Cereal", price: 4.99, stock: 30, image: "/raisin_bran.webp", description: "Bran flakes with raisins, 16 oz" },
  { name: "Corn Flakes", category: "Cereal", price: 3.99, stock: 35, image: "/corn_flake.webp", description: "Classic corn flakes cereal, 18 oz" },
  { name: "Lucky Charms", category: "Cereal", price: 4.79, stock: 30, image: "/lucky_charms.webp", description: "Magically delicious marshmallow cereal, 18 oz" },
  { name: "Cheerios", category: "Cereal", price: 4.59, stock: 40, image: "/cheerios.webp", description: "Classic oat cereal, 18 oz" },
  { name: "Cocoa Pebbles", category: "Cereal", price: 4.99, stock: 25, image: "/coco_pebbles.webp", description: "Chocolatey crispy rice cereal, 18 oz" },
  { name: "Special K", category: "Cereal", price: 5.49, stock: 20, image: "/special_k.webp", description: "Healthy whole grain cereal, 18 oz" },
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
];

// ✅ Update seed logic to store reviews as subcollection
// 🌱 Seed food items and subcollection reviews
export const seedFoodItems = async () => {
  const snapshot = await getDocs(foodCollectionRef);
  if (!snapshot.empty) {
    console.log("⚠️ Food items already exist. Skipping seeding.");
    return;
  }

  console.log("🌱 Seeding food items and their reviews...");
  for (const item of sampleFoodData) {
    try {
      // Insert the food item
      const { reviews, ...itemData } = item;
      const docRef = await addDoc(foodCollectionRef, itemData);

      // Inject realistic random reviews
      const autoReviews = generateSampleReviews();
      const reviewPromises = autoReviews.map((review) =>
        addDoc(collection(db, "foodItems", docRef.id, "reviews"), review)
      );

      await Promise.all(reviewPromises);
      console.log(`✅ Seeded: ${item.name}`);
    } catch (error) {
      console.error(`❌ Error seeding ${item.name}:`, error);
    }
  }

  console.log("🎉 Finished seeding foodItems and review subcollections.");
};

// ✅ Fetch food items by category from Firestore
// 🔍 Get grocery items by category
export const getGroceryItems = async (selectedCategory) => {
  try {
    console.log(`🔍 Fetching items for category: "${selectedCategory}"`);

    const q = selectedCategory === "All"
      ? foodCollectionRef
      : query(foodCollectionRef, where("category", "==", selectedCategory));

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Failed to fetch grocery items:", error);
    return [];
  }
};

// ✅ Function to Reduce Stock When Item is Added to Cart
// 📉 Decrease stock after purchase
export const updateStockAfterPurchase = async (itemId, quantity) => {
  try {
    const itemRef = doc(db, "foodItems", itemId);
    const itemSnap = await getDoc(itemRef);

    if (itemSnap.exists()) {
      const current = itemSnap.data();
      const newStock = Math.max(0, (current.stock || 0) - quantity);
      await updateDoc(itemRef, {
        stock: newStock,
        lastUpdated: Timestamp.now(),
      });
      console.log(`📉 Updated stock for '${current.name}' to ${newStock}`);
    }
  } catch (error) {
    console.error("❌ Error updating stock:", error);
  }
};

// ✅ Function to Restore Stock When Item is Removed from Cart
export const updateStockAfterRemoval = async (itemId, quantityRestored) => {
  try {
    const itemRef = doc(db, "foodItems", itemId);
    const itemSnap = await getDoc(itemRef);

    if (itemSnap.exists()) {
      const currentStock = itemSnap.data().stock || 0;
      await updateDoc(itemRef, { stock: currentStock + quantityRestored });
      console.log(`✅ Restored stock for ${itemId}: ${currentStock + quantityRestored}`);
    }
  } catch (error) {
    console.error("❌ Error restoring stock:", error);
  }
};

// Get all cart quantities for each Food item
export const getCartQuantitiesByItemId = async () => {
  try {
    const cartsSnapshot = await getDocs(collection(db, "carts"));
    const itemQuantities = {};

    cartsSnapshot.forEach((doc) => {
      const items = doc.data().items || [];
      items.forEach(({ id, quantity }) => {
        itemQuantities[id] = (itemQuantities[id] || 0) + quantity;
      });
    });

    return itemQuantities;
  } catch (error) {
    console.error("❌ Error getting cart quantities:", error);
    return {};
  }
};