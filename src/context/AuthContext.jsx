// ✅ src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

// ✅ Create Auth Context
const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app and provides user info and auth utilities.
 */
export const AuthProvider = ({ children }) => {
  const auth = getAuth();
  const [user, setUser] = useState(null);         // Stores Firebase user + isAdmin
  const [isLoading, setIsLoading] = useState(true); // Shows loading while checking auth

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        // ✅ Refresh ID token to get latest custom claims (like admin)
        const idTokenResult = await authUser.getIdTokenResult(true);

        // ✅ Check Firestore for user role fallback
        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};

        // ✅ Determine if user is admin from token OR Firestore flag
        const isAdmin =
          idTokenResult.claims.admin === true || userData.isAdmin === true;

        // ✅ Merge user and admin role into final user object
        setUser({ ...authUser, isAdmin });
      } catch (err) {
        console.error("❌ Error fetching user or role:", err);
        setUser({ ...authUser, isAdmin: false }); // fallback: not admin
      } finally {
        setIsLoading(false); // Done loading regardless of outcome
      }
    });

    return () => unsubscribe(); // 🔁 Clean up listener on unmount
  }, []);

  /**
   * Logs out the current user and resets state.
   */
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (err) {
      console.error("❌ Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth hook gives access to auth context in any component.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
