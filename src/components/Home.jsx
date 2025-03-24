import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Catalog from "./Catalog";
import Contact from "./Contact";
import SeedData from "./SeedData"; // 🔥 Add SeedData button
import GrantAccess from "./GrantAccess";

const Home = ({ catalogRef, heroRef, contactRef }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      {/* ✅ Hero Section */}
      <div
        ref={heroRef}
        id="hero-section"
        className="h-screen w-auto bg-cover bg-center flex flex-col justify-center items-center text-green-800 bg-[url('/HeroLogo.webp')]"
      >
        <h1 className="text-4xl font-bold">Fresh Food Delivered To Your Door!</h1>
        <button
          onClick={() => catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="mt-6 py-3 px-6 rounded-full"
        >
          Shop Now
        </button>

        {/* ✅ Admin-only Dashboard Button */}
        {user?.isAdmin && (
          <button
            onClick={() => navigate("/admin")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Admin Dashboard
          </button>
        )}

        <GrantAccess />
      </div>

      {/* ✅ Catalog Section */}
      <div ref={catalogRef} id="catalog-section" className="h-full w-auto border-t-2">
        <div className="sectionSpacing">
          <h2 className="text-3xl font-semibold text-center mt-6 mx-2">Food Catalog</h2>
        </div>
        <Catalog />
        <SeedData /> {/* 🔥 Add SeedData button */}
      </div>

      {/* ✅ Contact Section */}
      <div ref={contactRef} id="contact-section" className="h-full w-auto">
        <Contact />
      </div>
    </div>
  );
};

export default Home;
