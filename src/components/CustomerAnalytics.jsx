// src/components/CustomerAnalytics.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

const CustomerAnalytics = () => {
  const [ratingsData, setRatingsData] = useState({
    avg: 0,
    total: 0,
    counts: [0, 0, 0, 0, 0],
  });

  useEffect(() => {
    let unsubscribeFns = [];

    const setupListeners = async () => {
      const foodItemsSnap = await getDocs(collection(db, "foodItems"));

      // Clean state between updates
      const allListeners = [];

      const allReviewData = {};

      foodItemsSnap.docs.forEach((docSnap) => {
        const itemId = docSnap.id;
        const reviewsRef = collection(db, "foodItems", itemId, "reviews");
        //Any newly submitted or deleted review will reflect instantly thanks to onSnapshot.
        const unsubscribe = onSnapshot(reviewsRef, (reviewSnap) => {
          const reviews = [];
          reviewSnap.forEach((r) => reviews.push(r.data()));
          allReviewData[itemId] = reviews;

          // Flatten all reviews from all food items
          const allReviews = Object.values(allReviewData).flat();

          const counts = [0, 0, 0, 0, 0];
          let sum = 0;

          allReviews.forEach((r) => {
            if (r.rating >= 1 && r.rating <= 5) {
              counts[r.rating - 1]++;
              sum += r.rating;
            }
          });

          const total = allReviews.length;
          //Your analytics now accurately show the true number of reviews.
          setRatingsData({
            avg: total ? sum / total : 0,
            total,
            counts,
          });
        });

        allListeners.push(unsubscribe);
      });

      unsubscribeFns = allListeners;
    };

    setupListeners();

    return () => unsubscribeFns.forEach((unsub) => unsub && unsub());
  }, []);

  const chartData = {
    labels: ["⭐1", "⭐2", "⭐3", "⭐4", "⭐5"],
    datasets: [
      {
        label: "Number of Ratings",
        data: ratingsData.counts,
        backgroundColor: ["#ef4444", "#f97316", "#facc15", "#10b981", "#3b82f6"],
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4 text-center">📊 Customer Happiness</h2>
      <p className="text-center text-gray-600 mb-2">
        Avg Rating: <span className="font-semibold">{ratingsData.avg.toFixed(2)}</span> (
        {ratingsData.total} reviews)
      </p>
      <Bar data={chartData} />
    </div>
  );
};

export default CustomerAnalytics;
