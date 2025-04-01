import React, { useState, useEffect } from "react";
import { Star, Trash2, Pencil, Flag } from "lucide-react";
import { db } from "../utils/firebaseConfig";
import {
  doc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
  query,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const ReviewSection = ({ itemId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);

  const reviewsRef = collection(db, "foodItems", itemId, "reviews");

  useEffect(() => {
    const q = query(reviewsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sorted = data
        .filter((r) => r.comment && r.rating && r.timestamp)
        .sort(
          (a, b) =>
            new Date(b.timestamp?.toDate?.() || b.timestamp) -
            new Date(a.timestamp?.toDate?.() || a.timestamp)
        );

      setReviews(sorted);
    });

    return () => unsubscribe();
  }, [itemId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !comment) return alert("You must be logged in to submit a review.");

    try {
      await addDoc(reviewsRef, {
        name: user.displayName || "Anonymous",
        rating,
        comment,
        uid: user.uid,
        timestamp: serverTimestamp(),
        flagged: false,
      });
      setComment("");
      setRating(5);
    } catch (err) {
      console.error("❌ Failed to submit review", err);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!user?.isAdmin) return;
    const confirm = window.confirm("Are you sure you want to delete this review?");
    if (!confirm) return;

    try {
      await deleteDoc(doc(reviewsRef, reviewId));
      await deleteDoc(doc(db, "flaggedReviews", reviewId));
    } catch (err) {
      console.error("❌ Failed to delete review", err);
    }
  };

  const handleFlag = async (review) => {
    const confirm = window.confirm("Flag this review for moderation?");
    if (!confirm) return;

    const flaggedReview = {
      ...review,
      flagged: true,
      itemId,
    };

    try {
      await updateDoc(doc(reviewsRef, review.id), { flagged: true });
      await setDoc(doc(db, "flaggedReviews", review.id), flaggedReview);
    } catch (err) {
      console.error("❌ Failed to flag review", err);
    }
  };

  const handleEdit = (rev) => {
    setEditingId(rev.id);
    setComment(rev.comment);
    setRating(rev.rating);
  };

  const handleUpdate = async () => {
    try {
      await updateDoc(doc(reviewsRef, editingId), {
        comment,
        rating,
        timestamp: serverTimestamp(),
      });
      setEditingId(null);
      setComment("");
      setRating(5);
    } catch (err) {
      console.error("❌ Failed to update review", err);
    }
  };

  const avgRating =
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

  return (
    <div className="mt-4">
      {/* ⭐ Average Rating Display */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={18}
              className={i < Math.round(avgRating) ? "text-yellow-400" : "text-gray-300"}
              fill={i < Math.round(avgRating) ? "currentColor" : "none"}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600">
          {avgRating.toFixed(1)} ({reviews.length} reviews)
        </p>
      </div>

      {/* 📝 Review List */}
      <div className="mt-2 max-h-40 overflow-y-auto space-y-3">
        {reviews.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center">No reviews yet.</p>
        )}
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-gray-100 border border-b-2  rounded-sm pt-[28px] p-2 relative ">
            <p className="text-sm font-medium border-t border-green-600/30">
              {rev.name}{" "}
              <span className="text-xs text-gray-400 ml-2">
                {rev.timestamp &&
                  (typeof rev.timestamp === "string"
                    ? new Date(rev.timestamp).toLocaleString()
                    : rev.timestamp?.toDate?.().toLocaleString())}
              </span>
            </p>
            <p className="text-sm text-gray-700 italic">"{rev.comment}"</p>
            {rev.flagged && (
              <p className="text-xs text-red-500 italic mt-1">🚩 Flagged for moderation</p>
            )}

            <div className="absolute top-2 right-2 flex gap-2">
              {user?.uid === rev.uid && (
                <Pencil
                  size={16}
                  className="text-blue-500 cursor-pointer"
                  onClick={() => handleEdit(rev)}
                  title="Edit"
                />
              )}
              <Flag
                size={16}
                className="text-orange-500 cursor-pointer"
                onClick={() => handleFlag(rev)}
                title="Flag"
              />
              {user?.isAdmin && (
                <Trash2
                  size={16}
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleDelete(rev.id)}
                  title="Delete"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ✏️ Review Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          editingId ? handleUpdate() : handleSubmit(e);
        }}
        className="mt-4 space-y-2"
      >
        <textarea
          placeholder="Your Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <div className="flex items-center gap-2">
          <label>Rating:</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border rounded px-2 py-1"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} Star
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className={`${
              editingId ? "bg-green-600" : "bg-blue-600"
            } text-white px-4 py-2 rounded hover:opacity-90`}
          >
            {editingId ? "Update Review" : "Submit Review"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setComment("");
                setRating(5);
              }}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewSection;
