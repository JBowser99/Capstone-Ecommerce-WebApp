import { useState } from "react";

const Logistics = ({ onChange }) => {
  const [deliveryMethod, setDeliveryMethod] = useState("Standard");
  const [pickupPoint, setPickupPoint] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleChange = () => {
    onChange({ deliveryMethod, pickupPoint, instructions });
  };

  return (
    <div className="space-y-2 mt-4">
      <h3 className="font-semibold text-lg">Delivery Options</h3>

      <select
        className="w-full p-2 border rounded"
        value={deliveryMethod}
        onChange={(e) => {
          setDeliveryMethod(e.target.value);
          handleChange();
        }}
      >
        <option value="Standard">Standard Delivery</option>
        <option value="Express">Express Delivery</option>
        <option value="Pickup">Store Pickup</option>
      </select>

      {deliveryMethod === "Pickup" && (
        <input
          type="text"
          placeholder="Pickup location"
          className="w-full p-2 border rounded"
          value={pickupPoint}
          onChange={(e) => {
            setPickupPoint(e.target.value);
            handleChange();
          }}
        />
      )}

      <textarea
        placeholder="Special delivery instructions..."
        className="w-full p-2 border rounded"
        value={instructions}
        onChange={(e) => {
          setInstructions(e.target.value);
          handleChange();
        }}
      />
    </div>
  );
};

export default Logistics;
