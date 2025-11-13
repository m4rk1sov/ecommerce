//============================================================
// src/context/CartContext.jsx
/**
 * Shopping Cart Context
 *
 * Why separate from AuthContext?
 * - Single Responsibility Principle
 * - Cart can work without auth (guest checkout)
 * - Different lifecycle (cart persists, auth expires)
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { interactionsAPI } from '../api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    // Cart structure: { productId: { product, quantity } }
    const [cart, setCart] = useState({});
    const [isOpen, setIsOpen] = useState(false); // Sidebar cart visibility

    /**
     * Load cart from localStorage on mount
     * Persists cart across sessions
     */
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (error) {
                console.error('Failed to parse cart:', error);
            }
        }
    }, []);

    /**
     * Save cart to localStorage whenever it changes
     * useEffect with dependency [cart]
     */
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    /**
     * Add product to cart
     *
     * @param {Object} product - Product object from API
     * @param {number} quantity - Quantity to add (default: 1)
     */
    const addToCart = async (product, quantity = 1) => {
        setCart((prevCart) => {
            const existing = prevCart[product.id] || { product, quantity: 0 };

            return {
                ...prevCart,
                [product.id]: {
                    product,
                    quantity: existing.quantity + quantity,
                },
            };
        });

        // Record interaction with backend (async, don't wait)
        try {
            await interactionsAPI.recordCart(product.id);
        } catch (error) {
            console.error('Failed to record cart interaction:', error);
        }

        // Show cart sidebar
        setIsOpen(true);
    };

    /**
     * Remove product from cart
     */
    const removeFromCart = (productId) => {
        setCart((prevCart) => {
            const newCart = { ...prevCart };
            delete newCart[productId];
            return newCart;
        });
    };

    /**
     * Update quantity
     */
    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart((prevCart) => ({
            ...prevCart,
            [productId]: {
                ...prevCart[productId],
                quantity,
            },
        }));
    };

    /**
     * Clear entire cart
     */
    const clearCart = () => {
        setCart({});
    };

    /**
     * Calculate cart totals
     * useMemo would optimize this, but keeping it simple
     */
    const getCartTotal = () => {
        return Object.values(cart).reduce(
            (total, item) => total + item.product.price * item.quantity,
            0
        );
    };

    const getItemCount = () => {
        return Object.values(cart).reduce(
            (count, item) => count + item.quantity,
            0
        );
    };

    /**
     * Checkout function
     * Records purchase and clears cart
     */
    const checkout = async () => {
        try {
            const products = Object.values(cart).map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
            }));

            await interactionsAPI.recordPurchase({
                products,
                total: getCartTotal(),
                status: 'completed',
            });

            clearCart();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const value = {
        cart,
        items: Object.values(cart), // Array of cart items
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        getCartTotal,
        getItemCount,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

/**
 * Custom Hook: useCart
 */
export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }

    return context;
};
