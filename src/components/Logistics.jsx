import { useState, useEffect } from "react";

const exampleLocations = ["Downtown Market", "Greenwood Plaza", "Eastside Express"];
const exampleTimes = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const Logistics = ({ onChange, cartTotal }) => {
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [pickupLocation, setPickupLocation] = useState(exampleLocations[0]);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    const fee =
      deliveryMethod === "express"
        ? 10
        : deliveryMethod === "standard" && cartTotal < 35
        ? 5
        : 0;

    const logisticsData = {
      deliveryMethod,
      pickupLocation: deliveryMethod === "pickup" ? pickupLocation : null,
      pickupTime: deliveryMethod === "pickup" ? `${pickupDate} at ${pickupTime}` : null,
      instructions,
      fee,
    };

    onChange(logisticsData);
  }, [deliveryMethod, pickupLocation, pickupDate, pickupTime, instructions, cartTotal]);

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold">🚚 Delivery Options</h3>

      {/* Delivery Method Dropdown */}
      <label htmlFor="delivery-method" className="block text-sm font-medium">
        Choose a delivery method
      </label>
      <select
        id="delivery-method"
        name="deliveryMethod"
        className="w-full p-2 border rounded"
        value={deliveryMethod}
        onChange={(e) => setDeliveryMethod(e.target.value)}
      >
        <option value="standard">Standard Delivery (Free $35+)</option>
        <option value="express">Express Delivery ($10 fee)</option>
        <option value="pickup">Store Pickup (Choose Time & Location)</option>
      </select>

      {/* Conditional Pickup Fields */}
      {deliveryMethod === "pickup" && (
        <>
          {/* Pickup Location */}
          <label htmlFor="pickup-location" className="block text-sm font-medium mt-2">
            🏪 Pickup Location
          </label>
          <select
            id="pickup-location"
            name="pickupLocation"
            className="w-full p-2 border rounded"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
          >
            {exampleLocations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {/* Pickup Date */}
          <label htmlFor="pickup-date" className="block text-sm font-medium mt-4">
            📅 Select Pickup Date
          </label>
          <input
            id="pickup-date"
            name="pickupDate"
            type="date"
            className="w-full p-2 border rounded"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            required
            autoComplete="bday" // best practice fallback
          />

          {/* Pickup Time */}
          <label htmlFor="pickup-time" className="block text-sm font-medium mt-4">
            🕒 Select Time
          </label>
          <select
            id="pickup-time"
            name="pickupTime"
            className="w-full p-2 border rounded"
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            required
          >
            <option value="">Choose Time</option>
            {exampleTimes.map((time) => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </>
      )}

      {/* Special Instructions */}
      <label htmlFor="special-instructions" className="block text-sm font-medium mt-4">
        Notes / Instructions
      </label>
      <textarea
        id="special-instructions"
        name="instructions"
        aria-label="Delivery or pickup instructions"
        className="w-full p-2 border rounded mt-1"
        placeholder="Special delivery or pickup instructions..."
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
      />
    </div>
  );
};

export default Logistics;
