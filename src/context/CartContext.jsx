import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../utils/firebaseConfig";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import {
  updateStockAfterPurchase,
  updateStockAfterRemoval,
} from "../utils/firebaseGroceryService";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartUpdated, setCartUpdated] = useState(false); // Used to notify Catalog of stock change
  const cartKey = user ? `carts/${user.uid}` : null;

  // 🔁 Toggle to trigger Catalog refresh
  const triggerCatalogRefresh = () => {
    setCartUpdated((prev) => !prev);
  };

  // 🔁 Real-time Firestore cart sync
  useEffect(() => {
    if (!cartKey || isLoading) return;
    const cartRef = doc(db, cartKey);

    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      if (snapshot.exists()) {
        setCartItems(snapshot.data().items || []);
      } else {
        setCartItems([]);
      }
    });

    return () => unsubscribe();
  }, [cartKey, isLoading]);

  // 📦 Sync updated cart to Firestore
  const updateCartInFirestore = async (updatedCart) => {
    if (!cartKey) return;
    const cartRef = doc(db, cartKey);

    const enhancedCart = updatedCart.map((item) => ({
      ...item,
      status: "in_cart",
      addedAt: item.addedAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    }));

    await setDoc(
      cartRef,
      {
        items: enhancedCart,
        userId: user.uid,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );
  };

  // 🔒 Only allow admin to modify stock count in Firestore
  const maybeUpdateStock = async (fn, ...args) => {
    try {
      if (args[0]) {
        await fn(...args);
      } else {
        console.warn("⚠️ Stock update skipped: missing itemId or quantity.");
      }
    } catch (err) {
      console.error("❌ Stock update failed:", err.message);
    }
  };  

  const addToCart = async (item) => {
    if (!cartKey) return;
    await maybeUpdateStock(updateStockAfterPurchase, item.id, item.quantity);

    const existingItem = cartItems.find((i) => i.id === item.id);
    const updatedCart = existingItem
      ? cartItems.map((i) =>
          i.id === item.id
            ? {
                ...i,
                quantity: i.quantity + item.quantity,
                lastUpdated: new Date().toISOString(),
              }
            : i
        )
      : [
          ...cartItems,
          {
            ...item,
            addedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            status: "in_cart",
          },
        ];

    setCartItems(updatedCart);
    await updateCartInFirestore(updatedCart);
    triggerCatalogRefresh();
  };

  const removeFromCart = async (id) => {
    if (!cartKey) return;
    const itemToRemove = cartItems.find((item) => item.id === id);
    await maybeUpdateStock(updateStockAfterRemoval, id, itemToRemove?.quantity || 0);

    const updatedCart = cartItems
      .filter((item) => item.id !== id)
      .map((item) => ({ ...item, lastUpdated: new Date().toISOString() }));

    setCartItems(updatedCart);
    await updateCartInFirestore(updatedCart);
    triggerCatalogRefresh();
  };

  const decreaseQuantity = async (id) => {
    if (!cartKey) return;
    const updatedCart = cartItems
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
              lastUpdated: new Date().toISOString(),
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    await maybeUpdateStock(updateStockAfterRemoval, id, 1);
    setCartItems(updatedCart);
    await updateCartInFirestore(updatedCart);
    triggerCatalogRefresh();
  };

  const clearCart = async () => {
    if (!cartKey) return;

    for (let item of cartItems) {
      await maybeUpdateStock(updateStockAfterRemoval, item.id, item.quantity);
    }

    setCartItems([]);
    await updateCartInFirestore([]);
    triggerCatalogRefresh();
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        clearCart,
        cartUpdated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
