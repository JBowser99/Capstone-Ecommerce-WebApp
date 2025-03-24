import { useAuth } from "../context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";

const GrantAccess = () => {
  const { user } = useAuth();

  const handleGrantAdmin = async () => {
    if (!user || user.uid !== "eC1hha1Dgjfrn5BK1dzrLTadSsr2") {
      return alert("❌ You are not authorized to grant admin access.");
    }

    try {
      // ✅ 1. Write isAdmin to Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { isAdmin: true }, { merge: true });

      alert("✅ Firestore updated with isAdmin: true! Now logout, relogin, and you’ll have admin access.");
    } catch (error) {
      console.error("❌ Error granting admin access:", error);
      alert("❌ Something went wrong granting admin access.");
    }
  };

  // 🔐 Only render button for your admin UID
  if (!user || user.uid !== "eC1hha1Dgjfrn5BK1dzrLTadSsr2") return null;

  return (
    <div className="p-4 text-center">
      <button
        onClick={handleGrantAdmin}
        className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900"
      >
        🚀 Grant Admin Access
      </button>
    </div>
  );
};

export default GrantAccess;
