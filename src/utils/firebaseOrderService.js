// src/utils/firebaseOrderService.js
import { db } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Submits an order to Firestore.
 * Automatically sets the order's initial status based on delivery method.
 */
export const submitOrder = async (userId, orderData) => {
  try {
    const deliveryType = orderData.logistics?.deliveryMethod;

    const status =
      deliveryType === "pickup"
        ? "Preparing for Pickup"
        : deliveryType === "express"
        ? "Out for Express Delivery"
        : "In Process";

    await addDoc(collection(db, "orders"), {
      ...orderData,
      userId,
      createdAt: serverTimestamp(),
      status,
    });
  } catch (err) {
    console.error("❌ Failed to submit order:", err);
  }
};
