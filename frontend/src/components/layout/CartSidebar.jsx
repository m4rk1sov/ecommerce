// ============================================================
// src/components/layout/CartSidebar.jsx
/**
 * Shopping Cart Sidebar
 * Slides in from right when opened
 *
 * Features:
 * - View cart items
 * - Update quantities
 * - Remove items
 * - Checkout
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Button } from '../common/Button';

export const CartSidebar = () => {
    const navigate = useNavigate();
    const {
        isOpen,
        setIsOpen,
        items,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        checkout,
    } = useCart();

    const [checkoutLoading, setCheckoutLoading] = React.useState(false);

    const handleCheckout = async () => {
        setCheckoutLoading(true);
        const result = await checkout();

        if (result.success) {
            alert('Purchase successful! Thank you for your order.');
            setIsOpen(false);
            navigate('/');
        } else {
            alert(`Checkout failed: ${result.error}`);
        }

        setCheckoutLoading(false);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-xl font-bold">Shopping Cart</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4">
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">Your cart is empty</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map(({ product, quantity }) => (
                                <div key={product.id} className="flex items-start space-x-4 border-b pb-4">
                                    {/* Product Image */}
                                    <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover rounded"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No img
                                            </div>
                                        )}
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-800 truncate">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center space-x-2 mt-2">
                                            <button
                                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                            >
                                                -
                                            </button>
                                            <span className="px-3 py-1 bg-gray-100 rounded">{quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeFromCart(product.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t p-4 space-y-4">
                        {/* Total */}
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Total:</span>
                            <span>${getCartTotal().toFixed(2)}</span>
                        </div>

                        {/* Checkout Button */}
                        <Button
                            variant="success"
                            size="large"
                            className="w-full"
                            loading={checkoutLoading}
                            onClick={handleCheckout}
                        >
                            Checkout
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};

