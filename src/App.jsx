// App.jsx
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { AdminInventoryProvider } from "./context/AdminInventoryContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./auth/Login";
import Signup from "./auth/Signup";
import Home from "./components/Home";
import ProfileModal from "./components/ProfileModal";
import OrderModal from "./components/OrderModal";
import AdminPage from "./components/AdminPage";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingScreen from "./components/LoadingScreen";
import ReviewPage from "./components/ReviewPage"; // ✅ Import new admin panel

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// 🔁 Universal Redirect Component for Post-Login Routing
const RedirectHandler = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate(user.isAdmin ? "/admin" : "/", { replace: true });
    }
  }, [user, isLoading, navigate]);

  return <LoadingScreen />; // Show loader while deciding where to go
};

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth/Login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user || !user.isAdmin) return <Navigate to="/auth/Login" replace />;
  return children;
};

const PublicLayout = ({ children, catalogRef, heroRef, contactRef }) => (
  <>
    <Navbar
      onScrollToCatalog={() => catalogRef.current?.scrollIntoView({ behavior: "smooth" })}
      onScrollToHero={() => heroRef.current?.scrollIntoView({ behavior: "smooth" })}
      onScrollToContact={() => contactRef.current?.scrollIntoView({ behavior: "smooth" })}
    />
    <ErrorBoundary>{children}</ErrorBoundary>
    <Footer />
  </>
);

const AdminLayout = ({ children }) => (
  <div className="min-h-screen bg-gray-100 p-4">
    <ErrorBoundary>{children}</ErrorBoundary>
  </div>
);

const App = () => {
  const catalogRef = useRef(null);
  const heroRef = useRef(null);
  const contactRef = useRef(null);

  return (
    <Router>
      <CartProvider>
        <Routes>
          {/* ✅ Auth Routes */}
          <Route path="/auth/Login" element={<Login />} />
          <Route path="/auth/Signup" element={<Signup />} />

          {/* ✅ Redirect based on role */}
          <Route path="/redirect" element={<RedirectHandler />} />

          {/* ✅ Regular User Routes */}
          <Route
            path="/"
            element={
              <PublicLayout
                catalogRef={catalogRef}
                heroRef={heroRef}
                contactRef={contactRef}
              >
                <ProtectedRoute>
                  <Home
                    catalogRef={catalogRef}
                    heroRef={heroRef}
                    contactRef={contactRef}
                  />
                </ProtectedRoute>
              </PublicLayout>
            }
          />
          <Route
            path="/profilemodal"
            element={
              <PublicLayout>
                <ProtectedRoute><ProfileModal /></ProtectedRoute>
              </PublicLayout>
            }
          />
          <Route
            path="/ordermodal"
            element={
              <PublicLayout>
                <ProtectedRoute><OrderModal /></ProtectedRoute>
              </PublicLayout>
            }
          />

          {/* ✅ Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminLayout>
                <ProtectedRoute>
                  <AdminInventoryProvider>
                    <AdminRoute>
                      <AdminPage />
                    </AdminRoute>
                  </AdminInventoryProvider>
                </ProtectedRoute>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <AdminLayout>
                <ProtectedRoute>
                  <AdminRoute>
                    <ReviewPage />
                  </AdminRoute>
                </ProtectedRoute>
              </AdminLayout>
            }
          />
          {/* ✅ Fallback */}
          <Route path="*" element={<Navigate to="/auth/Login" replace />} />
        </Routes>
      </CartProvider>
    </Router>
  );
};

export default App;