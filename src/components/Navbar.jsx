import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useLocation, useNavigate } from "react-router-dom";
import CartModal from "./CartModal";
import ProfileModal from "./ProfileModal";
import OrderModal from "./OrderModal";

const Navbar = ({ onScrollToCatalog, onScrollToHero, onScrollToContact }) => {
  const { user, logout } = useAuth();
  const cart = useCart(); // ✅ Defensive access to cart context
  const cartItems = cart?.cartItems || []; // Fallback to empty array if undefined

  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const mobileMenuRef = useRef(null);

  // ✅ Auto-close mobile menu on mount
  useEffect(() => {
    setIsOpen(false);
  }, []);

  // ✅ Close mobile menu when clicking outside
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHomeClick = () => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scrollToTop, 100);
    } else {
      scrollToTop();
    }
  };

  // ✅ Hide navbar on auth routes
  if (location.pathname === "/auth/Login" || location.pathname === "/auth/Signup") return null;

  const handleLogout = async () => {
    try {
      await logout();
      console.log("👋 User successfully logged out from Navbar");
      navigate("/auth/Login");
    } catch (error) {
      console.error("❌ Navbar logout failed:", error);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#58bf5b] shadow-md z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* ✅ Logo */}
        <div className="flex items-center cursor-pointer" onClick={handleHomeClick}>
          <img src="/TreeLogo.webp" alt="E-Shop Logo" className="w-14 h-14 mr-2" /> 
          <span className="text-2xl font-bold uppercase">E-Shop</span>
        </div>

        {/* ✅ Desktop Navigation */}
        <div className="hidden md:flex space-x-6 text-lg font-medium">
          <button onClick={handleHomeClick} className="hover:text-blue-500">Home</button>
          <button onClick={onScrollToCatalog} className="hover:text-blue-500">Catalog</button>

          {user && (
            <>
              <button onClick={() => setIsProfileOpen(true)} className="hover:text-blue-500">Profile</button>
              <button onClick={() => setIsOrdersOpen(true)} className="hover:text-blue-500">Orders</button>
              <button onClick={onScrollToContact} className="hover:text-blue-500">Contact</button>
              <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded">Logout</button>
            </>
          )}

          {/* ✅ Cart */}
          <div className="relative">
            <button onClick={() => setIsCartOpen(true)} className="bg-blue-500 text-white py-2 px-4 rounded relative">
              🛒
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ✅ Mobile Nav */}
        <div className="flex items-center md:hidden">
          {/* Cart Button */}
          <div className="relative mr-4">
            <button onClick={() => setIsCartOpen(true)} className="bg-blue-500 text-white py-2 px-4 rounded">
              🛒
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>

          {/* Hamburger Menu */}
          <button className="mobile-menu-button md:hidden" onClick={() => setIsOpen(!isOpen)}>
            <motion.svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </motion.svg>
          </button>
        </div>
      </div>

      {/* ✅ Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden absolute top-full pt-[10vh] w-full h-screen bg-slate-950/70 backdrop-blur-md shadow-md border-t flex justify-center items-start"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Clickaway zone */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

            {/* Mobile Menu Box */}
            <motion.div
              ref={mobileMenuRef}
              className="flex flex-col items-center py-4 space-y-4 relative bg-slate-950/20 rounded-lg max-w-sm shadow-lg p-4 border"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={handleHomeClick} className="hover:text-blue-500">Home</button>
              <button onClick={() => { onScrollToCatalog(); setIsOpen(false); }} className="hover:text-blue-500">Catalog</button>

              {user && (
                <>
                  <button onClick={() => { setIsProfileOpen(true); setIsOpen(false); }} className="hover:text-blue-500">Profile</button>
                  <button onClick={() => { setIsOrdersOpen(true); setIsOpen(false); }} className="hover:text-blue-500">Orders</button>
                  <button onClick={() => { onScrollToContact(); setIsOpen(false); }} className="hover:text-blue-500">Contact</button>
                  <button onClick={handleLogout} className="bg-red-500 text-white py-2 px-4 rounded">Logout</button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Modals */}
      <ProfileModal open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <OrderModal open={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} />
      <CartModal open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
};

export default Navbar;
