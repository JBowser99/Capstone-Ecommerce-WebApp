// ✅ AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const idTokenResult = await authUser.getIdTokenResult(true); // force refresh to get latest claims
        const userDoc = await getDoc(doc(db, "users", authUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        const isAdmin = idTokenResult.claims.admin === true || userData.isAdmin === true;

        setUser({ ...authUser, isAdmin });
      } catch (error) {
        console.error("❌ AuthContext error:", error);
        setUser({ ...authUser, isAdmin: false });
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("❌ Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
