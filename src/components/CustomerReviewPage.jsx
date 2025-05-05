import React, { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    deleteDoc,
    doc,
    getDoc,
    updateDoc, // also needed for unflagging the review
} from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CustomerAnalytics from "./CustomerAnalytics";

const CustomerReviewPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);

  // 🔒 Redirect non-admins away from this page
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      navigate("/auth/Login", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // 🔁 Live listener for flagged reviews collection
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "flaggedReviews"), (snap) => {
      setFlaggedReviews(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    });
    return () => unsub();
  }, []);

  // 🗑️ Delete review from both the food item's subcollection and flaggedReviews
  const handleDeleteReview = async (itemId, reviewId) => {
    try {
      await deleteDoc(doc(db, "foodItems", itemId, "reviews", reviewId));
      await deleteDoc(doc(db, "flaggedReviews", reviewId));
      setToastMessage("✅ Review deleted.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error("❌ Failed to delete review:", err);
    }
  };
  

  // ✅ Remove review from moderation list without deleting it
  const handleDismiss = async (reviewId) => {
    try {
      const flaggedRef = doc(db, "flaggedReviews", reviewId);
      const flaggedDoc = await getDoc(flaggedRef);
  
      if (flaggedDoc.exists()) {
        const { itemId } = flaggedDoc.data();
  
        const reviewRef = doc(db, "foodItems", itemId, "reviews", reviewId);
        await updateDoc(reviewRef, { flagged: false });
      }
  
      await deleteDoc(flaggedRef);
  
      setToastMessage("✅ Review dismissed.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      console.error("❌ Failed to dismiss flagged review:", err);
    }
  };  

  {showToast && (
    <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-md z-50 transition">
      {toastMessage}
    </div>
  )}
  
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">

      {/* 🔙 Back Button */}
      <button
        onClick={() => navigate("/admin")}
        className="mb-6 bg-gray-300 hover:bg-gray-400 text-sm text-black px-4 py-2 rounded"
      >
        ← Back to Admin Dashboard
      </button>

      <h1 className="text-3xl font-bold text-center mb-6">
        🛡️ Admin Review Moderation Panel
      </h1>

      {/* 📊 Show rating chart */}
      <div className="mb-10">
        <CustomerAnalytics />
      </div>

      {/* 🚩 Moderation area */}
      {flaggedReviews.length > 0 ? (
        <div className="bg-white p-6 rounded shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            🚨 Flagged Reviews for Moderation
          </h2>

          {flaggedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-gray-100 p-4 rounded mb-4 shadow-sm"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-sm">{rev.name}</p>
                  <p className="text-xs text-gray-500">
                    {rev.timestamp?.toDate?.().toLocaleString()}
                  </p>
                </div>
                <span className="text-sm bg-yellow-200 px-2 rounded font-mono">
                  ⭐ {rev.rating}
                </span>
              </div>

              <p className="italic mt-2 text-sm">"{rev.comment}"</p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleDeleteReview(rev.itemId, rev.id)}
                  className="bg-red-500 text-white px-3 py-1 text-sm rounded hover:bg-red-600"
                >
                  Delete Review
                </button>
                <button
                  onClick={() => handleDismiss(rev.id)}
                  className="bg-gray-300 px-3 py-1 text-sm rounded hover:bg-gray-400"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No flagged reviews found.</p>
      )}
    </div>
  );
};

export default CustomerReviewPage;
