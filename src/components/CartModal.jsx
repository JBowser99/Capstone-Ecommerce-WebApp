import React from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Navigate } from "react-router-dom";
import Checkout from "./Checkout";

const CartModal = ({ open, onClose }) => {
  const { user } = useAuth();
  const { cartItems, removeFromCart, decreaseQuantity, clearCart } = useCart();

  if (!open) return null;

  if (!user) return <Navigate to="/auth/Login" replace />;

  const totalPrice = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div onClick={onClose} className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg w-full max-w-lg flex flex-col p-6 relative shadow-lg"
      >
        {/* Close Button */}
        <div className="absolute top-5 right-5">
          <p onClick={onClose} className="cursor-pointer font-bold text-xl">✕</p>
        </div>

        {/* Cart Header */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-semibold">Your Cart</h1>
        </div>

        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <p className="text-center text-gray-600 mt-4">Your cart is empty.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <ul className="space-y-3">
              {cartItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm"
                >
                  {/* Image & Product Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="w-full">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-gray-600 text-sm">${item.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">Stock: {item.stock} left</p>
                    </div>
                  </div>

                  {/* Quantity & Remove Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="bg-yellow-500 px-3 py-1 rounded text-white hover:bg-yellow-600"
                      disabled={item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-500 px-3 py-1 rounded text-white hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Total Price */}
        {cartItems.length > 0 && (
          <div className="text-center mt-6">
            <p className="text-lg font-semibold">Total: ${totalPrice.toFixed(2)}</p>
          </div>
        )}

        {/* Checkout & Clear Cart Buttons */}
        {cartItems.length > 0 && (
          <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={clearCart}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Clear Cart
            </button>
            <Checkout total={totalPrice} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
