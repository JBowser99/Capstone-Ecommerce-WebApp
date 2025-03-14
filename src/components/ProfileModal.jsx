import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../utils/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const ProfileModal = ({ open, onClose }) => {
  if (!open) return null;

  const { user } = useAuth();
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
  });

  const [message, setMessage] = useState("");

  // ✅ Load user profile from Firestore securely
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setProfile(userSnap.data());
          } else {
            setProfile((prev) => ({ ...prev, email: user.email }));
          }
        } catch (error) {
          console.error("❌ Error loading profile:", error);
          setMessage("Failed to load profile.");
        }
      }
    };

    fetchProfile();
  }, [user]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // ✅ Save or update user profile in Firestore
  const handleSave = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, profile, { merge: true });
      setMessage("Profile updated successfully!");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      setMessage("Failed to update profile. Try again.");
    }
  };

  // ✅ Delete account and user data securely
  const handleDeleteAccount = async () => {
    if (!user) return;

    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await deleteDoc(userRef); // ✅ Delete user profile from Firestore

      setMessage("Your account has been deleted.");
    } catch (error) {
      console.error("❌ Error deleting account:", error);
      setMessage("Failed to delete account. Try again.");
    }
  };

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-lg w-1/2 flex flex-col p-6 relative shadow-lg">
        
        {/* Close Button */}
        <div className="absolute top-5 right-5">
          <p onClick={onClose} className="cursor-pointer font-bold text-xl">✕</p>
        </div>

        <div className="my-auto mx-auto p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-semibold text-center">User Profile</h2>
          {message && <p className="text-center text-green-600 mt-2">{message}</p>}

          <form onSubmit={handleSave} className="space-y-4">
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
                name="email"
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

            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
              Save Profile
            </button>
          </form>

          {/* Delete Account Button */}
          <div className="mt-6 flex justify-center">
            <button onClick={handleDeleteAccount} className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
