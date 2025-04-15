import { useEffect, useState } from "react";
import { db } from "../utils/firebaseConfig";
import { getAuth, deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { AnimatePresence, motion } from "framer-motion"; // 🔄 For safe animation and mount/unmount
import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";

const ProfileModal = ({ open, onClose }) => {
  const { user } = useAuth(); // 👤 Get current user from AuthContext
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  const [message, setMessage] = useState("");

  // 🔁 Load user profile from Firestore when modal opens
  useEffect(() => {
    const fetchProfile = async () => {
      if (user && open) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setProfile(userSnap.data());
          } else {
            // Fallback to user's email if profile doesn't exist yet
            setProfile((prev) => ({ ...prev, email: user.email }));
          }
        } catch (error) {
          console.error("❌ Error loading profile:", error);
          setMessage("Failed to load profile.");
        }
      }
    };

    fetchProfile();
  }, [user, open]); // ✅ Only run when user changes OR modal opens

  // 📥 Handle input changes for form fields
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // 💾 Save updated profile to Firestore
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, profile, { merge: true });
      setMessage("✅ Profile updated successfully!");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      setMessage("Failed to update profile. Try again.");
    }
  };

    // 🗑️ Delete user profile from Firestore
    const handleDeleteAccount = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
    
      if (!currentUser) return;
    
      const confirmDelete = window.confirm("Are you sure you want to permanently delete your account?");
      if (!confirmDelete) return;
    
      try {
        // 🔁 Prompt user for password to reauthenticate
        const password = prompt("Please enter your password to confirm:");
    
        if (!password) {
          alert("❌ Password is required to delete your account.");
          return;
        }
    
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
    
        // ✅ Delete user's data from Firestore
        await deleteDoc(doc(db, "users", currentUser.uid));
        await deleteDoc(doc(db, "carts", currentUser.uid));
    
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", currentUser.uid));
        const snapshot = await getDocs(q);
        await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)));
    
        // ✅ Delete Auth account
        await deleteUser(currentUser);
    
        // ✅ Logout & redirect
        window.location.href = "/auth/Login";
      } catch (error) {
        console.error("❌ Error deleting account:", error);
        alert(error.message || "Failed to delete account.");
      }
    };

  // ✅ Framer Motion + AnimatePresence handles safe rendering + transitions
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          onClick={onClose} // 💥 Close when clicking backdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()} // ✋ Prevent closing when clicking inside modal
            className="bg-white rounded-lg w-full max-w-xl p-6 relative shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* ❌ Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-xl font-bold text-gray-600 hover:text-black"
            >
              ✕
            </button>

            {/* 👤 Title */}
            <h2 className="text-2xl font-semibold text-center">👤 User Profile</h2>

            {/* ✅ Confirmation or error message */}
            {message && <p className="text-center text-green-600 mt-2">{message}</p>}

            {/* 📋 Profile Form */}
            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700">Email (Read-only)</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full p-2 border rounded bg-gray-200"
                />
              </div>

              <div>
                <label className="block text-gray-700">Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700">Address</label>
                <input
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Save Profile
              </button>
            </form>

            {/* 🧨 Delete Account */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleDeleteAccount}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
