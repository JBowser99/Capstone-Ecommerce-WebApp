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
  const { cartItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const mobileMenuRef = useRef(null);

  // ✅ Ensure Navbar menu is closed on page load
  useEffect(() => {
    setIsOpen(false);
  }, []); // Runs only once on mount

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

  // ✅ Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Home button handler (ensures scroll to top)
  const handleHomeClick = () => {
    setIsOpen(false); // Close mobile menu
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(scrollToTop, 100); // Small delay to ensure navigation completes before scrolling
    } else {
      scrollToTop(); // If already on "/", just scroll up
    }
  };

  if (location.pathname === "/auth/Login" || location.pathname === "/auth/Signup") return null;

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#58bf5b] shadow-md z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* ✅ Left Section: Logo */}
        <div className="flex items-center cursor-pointer" onClick={handleHomeClick}>
          <img src="/TreeLogo.webp" alt="E-Shop Logo" className="w-14 h-14 mr-2"/> 
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
              <button onClick={logout} className="bg-red-500 text-white py-2 px-4 rounded">Logout</button>
            </>
          )}

          {/* ✅ Cart Button with Notification Badge */}
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

        {/* ✅ Mobile Navigation */}
        <div className="flex items-center md:hidden">
          {/* ✅ Mobile Cart Button with Notification */}
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

          {/* ✅ Mobile Menu Toggle */}
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
            {/* ✅ Transparent Clickable Background */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)}></div>

            {/* ✅ Mobile Menu */}
            <motion.div
              ref={mobileMenuRef}
              className="flex flex-col items-center py-4 space-y-4 relative bg-slate-950/20 rounded-lg max-w-sm shadow-lg p-4 border"
              onClick={(e) => e.stopPropagation()} // Prevents menu from closing when clicking inside
            >
              {/* ✅ Mobile Nav Items */}
              <button onClick={handleHomeClick} className="hover:text-blue-500">
                Home
              </button>
              <button onClick={() => { onScrollToCatalog(); setIsOpen(false); }} className="hover:text-blue-500">
                Catalog
              </button>

              {user && (
                <>
                  <button onClick={() => { setIsProfileOpen(true); setIsOpen(false); }} className="hover:text-blue-500">
                    Profile
                  </button>
                  <button onClick={() => { setIsOrdersOpen(true); setIsOpen(false); }} className="hover:text-blue-500">
                    Orders
                  </button>
                  <button onClick={() => { onScrollToContact(); setIsOpen(false); }} className="hover:text-blue-500">
                    Contact
                  </button>
                  <button onClick={logout} className="bg-red-500 text-white py-2 px-4 rounded">
                    Logout
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Profile Modal */}
      <ProfileModal open={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* ✅ Order Modal */}
      <OrderModal open={isOrdersOpen} onClose={() => setIsOrdersOpen(false)} />

      {/* ✅ Cart Modal */}
      <CartModal open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
};

export default Navbar;
