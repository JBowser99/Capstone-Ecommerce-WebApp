import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const OrderModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg w-1/2 flex flex-col p-6 relative shadow-lg">
        
        {/* Close Button */}
        <div className="absolute top-5 right-5">
          <p onClick={onClose} className="cursor-pointer font-bold text-xl">✕</p>
        </div>

        <div className="my-auto mx-auto p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-center">Order History</h2>
          OrderModal
        </div>
      </div>
    </div>
  );
};

export default OrderModal;
