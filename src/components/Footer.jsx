import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById(id);
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } else {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleContactClick = () => {
    if (user?.isAdmin) {
      navigate("/admin");
    } else {
      navigate("/contact");
    }
  };

  return (
    <footer>
      <div className="h-14 container mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sm">
        <div className="text-center md:text-left">
          <h2 className="text-xl font-semibold">E-Shop</h2>
          <p className="text-gray-200">Your go-to store for fresh food delivery!</p>
        </div>

        <div className="flex space-x-4 mt-4 md:mt-0">
          <button onClick={() => scrollToSection("hero-section")} className="hover:text-gray-300 transition">
            Home
          </button>
          <button onClick={() => scrollToSection("catalog-section")} className="hover:text-gray-300 transition">
            Catalog
          </button>
          <button onClick={() => scrollToSection("catalog-section")} className="hover:text-gray-300 transition">
            Contact
          </button>
        </div>

        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="#" className="hover:text-gray-300 transition">Facebook</a>
          <a href="#" className="hover:text-gray-300 transition">Twitter</a>
          <a href="#" className="hover:text-gray-300 transition">Instagram</a>
        </div>
      </div>

      <p className="text-center text-gray-300 text-xs mt-3">
        &copy; {new Date().getFullYear()} E-Shop. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
