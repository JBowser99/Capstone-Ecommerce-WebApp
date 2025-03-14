import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "../utils/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectToLogin, setRedirectToLogin] = useState(false); // ✅ Redirect state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        setUser(authUser);
        sessionStorage.setItem("userSession", JSON.stringify(authUser));
      } else {
        sessionStorage.clear();
        setUser(null);
        setRedirectToLogin(true); // ✅ Trigger safe redirect instead of direct navigation
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ✅ Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      sessionStorage.clear();
      setUser(null);
      setRedirectToLogin(true); // ✅ Trigger redirect safely
    } catch (error) {
      console.error("❌ Error logging out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading, redirectToLogin }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// ✅ Ensure useAuth works only inside a provider
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
