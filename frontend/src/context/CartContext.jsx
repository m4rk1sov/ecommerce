/**
 * Cart Context — Façade over Redux Cart Slice
 * Same pattern as AuthContext: clean DI via Context, state in Redux.
 */

import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    addToCart as addToCartAction,
    removeFromCart as removeFromCartAction,
    updateQuantity as updateQuantityAction,
    clearCart as clearCartAction,
    setCartOpen,
    checkoutCart,
    selectCartItems,
    selectCartTotal,
    selectCartItemCount,
} from '../store/cartSlice';
import { interactionsAPI } from '../api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const dispatch = useDispatch();
    const items = useSelector(selectCartItems);
    const isOpen = useSelector((state) => state.cart.isOpen);
    const checkoutLoading = useSelector((state) => state.cart.checkoutLoading);

    const addToCart = useCallback(async (product, quantity = 1) => {
        dispatch(addToCartAction({ product, quantity }));
        try {
            await interactionsAPI.recordCart(product.id);
        } catch (error) {
            console.error('Failed to record cart interaction:', error);
        }
    }, [dispatch]);

    const removeFromCart = useCallback((productId) => {
        dispatch(removeFromCartAction(productId));
    }, [dispatch]);

    const updateQuantity = useCallback((productId, quantity) => {
        dispatch(updateQuantityAction({ productId, quantity }));
    }, [dispatch]);

    const clearCart = useCallback(() => {
        dispatch(clearCartAction());
    }, [dispatch]);

    const setIsOpen = useCallback((open) => {
        dispatch(setCartOpen(open));
    }, [dispatch]);

    const getCartTotal = useCallback(() => {
        return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
    }, [items]);

    const getItemCount = useCallback(() => {
        return items.reduce((count, item) => count + item.quantity, 0);
    }, [items]);

    const checkout = useCallback(async () => {
        try {
            await dispatch(checkoutCart()).unwrap();
            return { success: true };
        } catch (err) {
            return { success: false, error: err };
        }
    }, [dispatch]);

    const value = {
        cart: {},
        items,
        isOpen,
        setIsOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        checkout,
        getCartTotal,
        getItemCount,
        checkoutLoading,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};