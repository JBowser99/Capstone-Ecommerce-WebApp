import { db } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const submitOrder = async (userId, orderData) => {
    try {
        await addDoc(collection(db, "orders"), {
            ...orderData,
            userId,
            createdAt: serverTimestamp(),
            status: "Processing"
        });
    } catch (err) {
        console.error("❌ Failed to submit order:", err);
    }
};