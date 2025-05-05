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
import CustomerReviewPage from "./components/CustomerReviewPage"; // ✅ Import new admin panel
import ReviewOrdersPage from "./components/ReviewOrdersPage"; // ✅ Import the page
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FinancialTracker from "./components/FinancialTracker";

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
           {/*Home.jsx*/}
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
          {/*ProfileModal.jsx*/}
          <Route
            path="/profilemodal"
            element={
              <PublicLayout>
                <ProtectedRoute><ProfileModal /></ProtectedRoute>
              </PublicLayout>
            }
          />
          {/*OrderModal.jsx*/}
          <Route
            path="/ordermodal"
            element={
              <PublicLayout>
                <ProtectedRoute><OrderModal /></ProtectedRoute>
              </PublicLayout>
            }
          />
          {/*Admin Users Routes */}
          {/*AdminPage.jsx*/}
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
          {/*ReviewPage.jsx*/}
          <Route
            path="/admin/reviews"
            element={
              <AdminLayout>
                <ProtectedRoute>
                  <AdminRoute>
                    <CustomerReviewPage />
                  </AdminRoute>
                </ProtectedRoute>
              </AdminLayout>
            }
          />
          {/*ReviewOrdersPage.tsx (admin panel for pickups)*/}
          <Route
            path="/admin/review-orders"
            element={
              <AdminLayout>
                <ProtectedRoute>
                  <AdminRoute>
                    <ReviewOrdersPage />
                  </AdminRoute>
                </ProtectedRoute>
              </AdminLayout>
            }
          />
          {/* FinancialTracker */}
           <Route
            path="/admin/financials"
            element={
              <AdminLayout>
                <ProtectedRoute>
                  <AdminRoute>
                    <FinancialTracker />
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