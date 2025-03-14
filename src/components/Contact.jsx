import { useState } from "react";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState("");

  // ✅ Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      await emailjs.send(
        "YOUR_SERVICE_ID",   // Replace with EmailJS Service ID
        "YOUR_TEMPLATE_ID",  // Replace with EmailJS Template ID
        formData,
        "YOUR_PUBLIC_KEY"    // Replace with your EmailJS Public Key
      );
      setStatus("Message Sent Successfully!");
      setFormData({ name: "", email: "", message: "" }); // Clear form after success
    } catch (error) {
      console.error("EmailJS Error:", error);
      setStatus("Failed to send message. Try again.");
    }
  };

  return (
    <div className="container mx-auto">
      <p className="text-center py-2">We’d love to hear from you! Send us a message below.</p>
      <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ Name Input */}
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />

          {/* ✅ Email Input */}
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />

          {/* ✅ Message Input */}
          <textarea
            name="message"
            rows="5"
            placeholder="Your Message"
            value={formData.message}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />

          {/* ✅ Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Send Message
          </button>
        </form>

        {/* ✅ Status Message */}
        {status && <p className="mt-4 text-center text-green-600">{status}</p>}
      </div>
    </div>
  );
};

export default Contact;
