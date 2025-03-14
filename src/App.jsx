import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Home from "./components/Home";
import ProfileModal from "./components/ProfileModal";
import Contact from "./components/Contact";
import ErrorBoundary from "./components/ErrorBoundary";
import { useRef } from "react";
import OrderModal from "./components/OrderModal";

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center text-xl">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/Login" replace />;
  }

  return children;
};

const App = () => {
  const catalogRef = useRef(null);
  const heroRef = useRef(null);
  const contactRef = useRef(null); // ✅ Reference for Contact section

  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Navbar
            onScrollToCatalog={() => {
              if (catalogRef.current) {
                catalogRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            onScrollToHero={() => {
              if (heroRef.current) {
                heroRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            onScrollToContact={() => {
              if (contactRef.current) {
                contactRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          />
          <ErrorBoundary>
            <Routes>
              <Route path="/auth/Login" element={<Login />} />
              <Route path="/auth/Signup" element={<Signup />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home catalogRef={catalogRef} heroRef={heroRef} contactRef={contactRef} />
                  </ProtectedRoute>
                }
              />
              <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
              <Route path="/profilemodal" element={<ProtectedRoute><ProfileModal /></ProtectedRoute>} />
              <Route path="/ordermodal" element={<ProtectedRoute><OrderModal /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/auth/Login" replace />} />
            </Routes>
          </ErrorBoundary>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
