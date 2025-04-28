"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        formData,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );      
      setStatus("✅ Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("EmailJS Error:", error);
      setStatus("❌ Failed to send message. Try again.");
    }
  };

  return (
    <div className="container mx-auto">
      <div className="sectionSpacing">
        <h2 className="text-3xl font-semibold text-center mt-6 mx-2">Contact Us</h2>
      </div>
      <p className="text-center py-2">We’d love to hear from you! Send us a message below.</p>
      <div className="max-w-lg mx-auto bg-green-950/60 border-green-600/60 border shadow-lg rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2  border-green-600/60 border rounded"
          />

          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2  border-green-600/60 borderrounded"
          />

          <textarea
            name="message"
            rows="5"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full p-2  border-green-600/60 border rounded"
          />

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Send Message
          </button>
        </form>

        {status && (
          <p className={`mt-4 text-center ${status.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default Contact;
