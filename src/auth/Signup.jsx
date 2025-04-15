import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../utils/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/"); // ✅ Redirect after successful signup
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Sign Up</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        
        <form onSubmit={handleSignup} className="space-y-4">

          {/* ✅ Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          {/* ✅ Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded mt-1"
            />
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
            Sign Up
          </button>
        </form>

        {/* ✅ Link to Login */}
        <div className="mt-4 text-center">
          <p>
            Already have an account?{" "}
            <Link to="/auth/Login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
