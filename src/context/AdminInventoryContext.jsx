import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../utils/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "./AuthContext";

const AdminInventoryContext = createContext();

export const AdminInventoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);

   // 🔒 Check Firestore to confirm isAdmin: true
   const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const isAdminFlag = userData.isAdmin === true;
        setIsAdmin(isAdminFlag);

        // ✅ Console logging admin status
        if (isAdminFlag) {
          console.log(`✅ [ADMIN ACCESS GRANTED] ${user.email} is a verified admin.`);
        } else {
          console.warn(`⚠️ [ADMIN ACCESS DENIED] ${user.email} is not an admin.`);
        }
      } else {
        console.warn(`❌ [USER NOT FOUND] No user document for UID: ${user.uid}`);
      }
    } catch (err) {
      console.error("❌ Error checking admin status:", err);
    }
  };

  // ✅ Fetch all food items for admin view
  const fetchInventory = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "foodItems"));
    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setInventoryItems(items);
    setLoading(false);
  };

  // ✅ Fetch items with stock below a threshold
  const fetchLowStockItems = async (threshold = 10) => {
    const q = query(collection(db, "foodItems"), where("stock", "<=", threshold));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  // ✅ Restock item by ID
  const restockItem = async (itemId, quantityToAdd) => {
    const itemRef = doc(db, "foodItems", itemId);
    const itemSnap = await getDoc(itemRef);

    if (itemSnap.exists()) {
      const data = itemSnap.data();
      const newStock = (data.stock || 0) + quantityToAdd;

      await updateDoc(itemRef, {
        stock: newStock,
        lastRestocked: new Date().toISOString(),
      });

      console.log(`📦 Restocked item '${data.name}' by +${quantityToAdd}`);
      await fetchInventory(); // Refresh after restock
    }
  };
  
  // 🧠 Check admin status when user loads
   useEffect(() => {
    if (user) {
      checkAdminStatus();
    }
  }, [user]);

  return (
    <AdminInventoryContext.Provider
      value={{
        isAdmin,
        inventoryItems,
        fetchInventory,
        fetchLowStockItems,
        restockItem,
        loading,
      }}
    >
      {children}
    </AdminInventoryContext.Provider>
  );
};

// ✅ Custom hook for use in admin page
export const useAdminInventory = () => useContext(AdminInventoryContext);
