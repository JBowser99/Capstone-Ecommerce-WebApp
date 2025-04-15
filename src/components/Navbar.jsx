// ✅ Navbar.jsx with Real-Time Notifications
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

import CartModal from "./CartModal";
import ProfileModal from "./ProfileModal";
import OrderModal from "./OrderModal";

// 🔔 Simple Alert Modal
const NotificationModal = ({ alerts, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-md rounded-lg p-4 shadow-lg"
      >
        <h3 className="text-xl font-bold mb-4">🔔 Notifications</h3>
        {alerts.length === 0 ? (
          <p className="text-gray-500 text-center">No new notifications.</p>
        ) : (
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {alerts.map((alert, index) => (
              <li key={index} className="text-sm border-b pb-2">
                <span className="text-blue-600 font-semibold">{alert.title}</span>
                <p className="text-gray-600">{alert.message}</p>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Navbar = ({ onScrollToCatalog, onScrollToHero, onScrollToContact }) => {
  const { user, logout } = useAuth();
  const cart = useCart();
  const cartItems = cart?.cartItems || [];
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [hasUnreadAlerts, setHasUnreadAlerts] = useState(false);

  const mobileMenuRef = useRef(null);

  // 🚀 Fetch notifications from Firestore
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newAlerts = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const minsElapsed = (Date.now() - data.createdAt?.toDate()?.getTime()) / 60000;

        if (
          data.status === "Ready for Pickup" ||
          data.status === "Delivered"
        ) {
          newAlerts.push({
            title: "Order Update",
            message:
              data.status === "Ready for Pickup"
                ? "Your order is ready for pickup!"
                : "Your order was delivered successfully.",
          });
        }

        // You could also extend this to show "Cancelled" or "Failed" statuses.
      });

      setAlerts(newAlerts);
      setHasUnreadAlerts(newAlerts.length > 0);
    });

    return () => unsubscribe();
  }, [user]);

  // 👀 Auto-close mobile menu on mount
  useEffect(() => {
    setIsOpen(false);
  }, []);

  // 🧼 Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest(".mobile-menu-button")
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleHomeClick = () => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scrollToTop, 100);
    } else {
      scrollToTop();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/auth/Login");
    } catch (error) {
      console.error("❌ Navbar logout failed:", error);
    }
  };

  if (location.pathname === "/auth/Login" || location.pathname === "/auth/Signup") return null;

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#58bf5b] shadow-md z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* 🔷 Logo */}
        <div className="flex items-center cursor-pointer" onClick={handleHomeClick}>
          <img src="/TreeLogo.png" alt="E-Shop Logo" className="w-14 h-14 mr-2" />
          <span className="text-2xl font-bold uppercase">EverShop</span>
        </div>

        {/* 💻 Desktop Navigation */}
        <div className="hidden md:flex space-x-6 text-lg font-medium">
          <button onClick={handleHomeClick}>Home</button>
          <button onClick={onScrollToCatalog}>Catalog</button>

          {user && (
            <>
              <button onClick={() => setIsProfileOpen(true)}>Profile</button>
              <button onClick={() => setIsOrdersOpen(true)}>Orders</button>
              <button onClick={onScrollToContact}>Contact</button>
              <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">
                Logout
              </button>
            </>
          )}

          {/* 🛒 Cart Button */}
          <button onClick={() => setIsCartOpen(true)} className="relative bg-blue-600 text-white px-4 py-2 rounded">
            🛒
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-xs font-bold rounded-full w-5 h-5 flex justify-center items-center">
                {cartItems.length}
              </span>
            )}
          </button>

          {/* 🔔 Notifications */}
          <button onClick={() => { setIsAlertOpen(true); setHasUnreadAlerts(false); }} className="relative text-white text-2xl">
            🔔
            {hasUnreadAlerts && (
              <span className="absolute -top-1 -right-2 bg-yellow-400 w-3 h-3 rounded-full animate-ping" />
            )}
          </button>
        </div>

        {/* 📱 Mobile Nav */}
        <div className="flex items-center md:hidden">
          <button onClick={() => setIsCartOpen(true)} className="relative bg-blue-500 text-white py-2 px-4 rounded">
            🛒
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartItems.length}
              </span>
            )}
          </button>

          <button className="mobile-menu-button md:hidden ml-3" onClick={() => setIsOpen(!isOpen)}>
            <motion.svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </motion.svg>
          </button>
        </div>
      </div>

      {/* 📱 Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden absolute top-full w-full h-screen bg-slate-900/80 backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="flex flex-col items-center pt-20 space-y-4 bg-white bg-opacity-95 rounded-lg shadow-xl mx-6 mt-4 p-4 border">
              <button onClick={handleHomeClick}>Home</button>
              <button onClick={() => { onScrollToCatalog(); setIsOpen(false); }}>Catalog</button>
              {user && (
                <>
                  <button onClick={() => { setIsProfileOpen(true); setIsOpen(false); }}>Profile</button>
                  <button onClick={() => { setIsOrdersOpen(true); setIsOpen(false); }}>Orders</button>
                  <button onClick={() => { onScrollToContact(); setIsOpen(false); }}>Contact</button>
                  <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔲 Modals */}
      <ProfileModal open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <OrderModal open={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} />
      <CartModal open={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {isAlertOpen && <NotificationModal alerts={alerts} onClose={() => setIsAlertOpen(false)} />}
    </nav>
  );
};

export default Navbar;
