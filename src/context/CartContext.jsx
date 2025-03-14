import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../utils/firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { updateStockAfterPurchase, updateStockAfterRemoval } from "../utils/firebaseGroceryService"; 

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const cartKey = user ? `carts/${user.uid}` : null;

  // ✅ Live Firestore Cart Sync
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

  // ✅ Update Firestore with new cart state
  const updateCartInFirestore = async (updatedCart) => {
    if (!cartKey) return;
    const cartRef = doc(db, cartKey);
    await setDoc(cartRef, { items: updatedCart }, { merge: true });
  };

  // ✅ Add item to cart & update stock in Firestore
  const addToCart = async (item) => {
    if (!cartKey) return;

    // Reduce stock in the backend
    await updateStockAfterPurchase(item.id, item.quantity);

    const existingItem = cartItems.find((i) => i.id === item.id);
    let updatedCart;

    if (existingItem) {
      updatedCart = cartItems.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
      );
    } else {
      updatedCart = [...cartItems, { ...item }];
    }

    setCartItems(updatedCart);
    await updateCartInFirestore(updatedCart);
  };

  // ✅ Remove item from cart & update stock back
  const removeFromCart = async (id) => {
    if (!cartKey) return;

    const itemToRemove = cartItems.find((item) => item.id === id);
    if (itemToRemove) {
      await updateStockAfterRemoval(id, itemToRemove.quantity); // Restore stock
    }

    const updatedCart = cartItems.filter((item) => item.id !== id);
    setCartItems(updatedCart);
    await updateCartInFirestore(updatedCart);
  };

  // ✅ Decrease quantity & update stock
  const decreaseQuantity = async (id) => {
    if (!cartKey) return;

    const updatedCart = cartItems.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity - 1 } : item
    ).filter((item) => item.quantity > 0);

    await updateStockAfterRemoval(id, 1); // Increase stock by 1
    setCartItems(updatedCart);
    await updateCartInFirestore(updatedCart);
  };

  // ✅ Clear entire cart & restore stock
  const clearCart = async () => {
    if (!cartKey) return;

    for (let item of cartItems) {
      await updateStockAfterRemoval(item.id, item.quantity);
    }

    setCartItems([]);
    await updateCartInFirestore([]);
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, decreaseQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
