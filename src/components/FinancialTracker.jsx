import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import { useNavigate } from "react-router-dom";

const ranges = {
  "1 Day": 1,
  "7 Days": 7,
  "30 Days": 30,
  "1 Year": 365,
};

export default function FinancialTracker() {
  const [orders, setOrders] = useState([]);
  const [range, setRange] = useState("30 Days");
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const now = new Date();
      const cutoff = new Date(now.setDate(now.getDate() - ranges[range]));

      const filtered = snap.docs
        .map((doc) => {
          const data = doc.data();
          return {
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
          };
        })
        .filter(
          (order) => order.status !== "Cancelled" && order.createdAt >= cutoff
        );

      setOrders(filtered);
    });

    return () => unsub();
  }, [range]);

  const dailyData = orders.reduce((acc, order) => {
    const dateKey = order.createdAt.toLocaleDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = { revenue: 0, count: 0 };
    }
    acc[dateKey].revenue += order.total || 0;
    acc[dateKey].count += 1;
    return acc;
  }, {});

  const sortedDates = Object.keys(dailyData).sort(
    (a, b) => new Date(a) - new Date(b)
  );

  const revenues = sortedDates.map((date) => dailyData[date].revenue);
  const counts = sortedDates.map((date) => dailyData[date].count);
  const maxRevenue = Math.max(...revenues, 500); // minimum scale of 500 for better visuals

  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Revenue ($)",
        data: revenues.map((r) => r.toFixed(2)),
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "y",
      },
      {
        label: "Orders",
        data: counts,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: Math.ceil(maxRevenue / 100) * 100 + 100, // round up for clean scale
        title: { display: true, text: "Revenue ($)", font: { size: 14 } },
        grid: { drawBorder: false, color: "rgba(200,200,200,0.2)" },
        ticks: { stepSize: 100 },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        title: { display: true, text: "Order Count", font: { size: 14 } },
        grid: { drawOnChartArea: false },
        ticks: { stepSize: 1 },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 12,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderWidth: 1,
        borderColor: "#4b5563",
      },
    },
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded shadow">
      {/* 🔙 Back to Admin */}
      <button
        onClick={() => navigate("/admin")}
        className="mb-6 bg-gray-300 hover:bg-gray-400 text-sm text-black px-4 py-2 rounded"
      >
        ← Back to Admin Dashboard
      </button>

      <h2 className="text-2xl font-bold mb-4 text-center">
        📊 Financial Tracker
      </h2>

      {/* 🕒 Time Range Filter */}
      <div className="mb-6 flex justify-center gap-4 flex-wrap">
        {Object.keys(ranges).map((label) => (
          <button
            key={label}
            onClick={() => setRange(label)}
            className={`px-4 py-2 rounded-full text-sm font-medium shadow transition ${
              range === label
                ? "bg-blue-600 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 📈 Chart Area */}
      <div className="h-[400px]">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
