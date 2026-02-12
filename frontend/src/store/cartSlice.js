/**
 * Cart Slice — Redux Toolkit
 *
 * Manages shopping cart state globally via Redux.
 * Cart is persisted to localStorage via a subscriber in the store setup.
 *
 * Why Redux for cart?
 * - Cart state is accessed by Header (badge count), CartSidebar, ProductCards
 * - Needs to survive page navigation (global state)
 * - Async thunk for checkout integrates with interactions API
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { interactionsAPI } from '../api';

// ─── Async Thunks ────────────────────────────────────────────

export const checkoutCart = createAsyncThunk(
    'cart/checkout',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { cart } = getState();
            const products = Object.values(cart.items).map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price,
            }));

            const total = Object.values(cart.items).reduce(
                (sum, item) => sum + item.product.price * item.quantity,
                0
            );

            await interactionsAPI.recordPurchase({
                products,
                total,
                status: 'completed',
            });

            return { success: true };
        } catch (error) {
            return rejectWithValue(error.message || 'Checkout failed');
        }
    }
);

// ─── Load from localStorage ──────────────────────────────────

const loadCart = () => {
    try {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
};

// ─── Slice ───────────────────────────────────────────────────

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: loadCart(),     // { [productId]: { product, quantity } }
        isOpen: false,
        checkoutLoading: false,
        checkoutError: null,
    },
    reducers: {
        addToCart: (state, action) => {
            const { product, quantity = 1 } = action.payload;
            const existing = state.items[product.id];
            state.items[product.id] = {
                product,
                quantity: (existing?.quantity || 0) + quantity,
            };
            state.isOpen = true;
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        removeFromCart: (state, action) => {
            delete state.items[action.payload];
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        updateQuantity: (state, action) => {
            const { productId, quantity } = action.payload;
            if (quantity <= 0) {
                delete state.items[productId];
            } else {
                state.items[productId].quantity = quantity;
            }
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        clearCart: (state) => {
            state.items = {};
            localStorage.setItem('cart', JSON.stringify(state.items));
        },
        setCartOpen: (state, action) => {
            state.isOpen = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkoutCart.pending, (state) => {
                state.checkoutLoading = true;
                state.checkoutError = null;
            })
            .addCase(checkoutCart.fulfilled, (state) => {
                state.checkoutLoading = false;
                state.items = {};
                state.isOpen = false;
                localStorage.setItem('cart', JSON.stringify(state.items));
            })
            .addCase(checkoutCart.rejected, (state, action) => {
                state.checkoutLoading = false;
                state.checkoutError = action.payload;
            });
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartOpen } = cartSlice.actions;

// ─── Selectors (memoized via reselect under the hood) ────────
export const selectCartItems = (state) => Object.values(state.cart.items);
export const selectCartTotal = (state) =>
    Object.values(state.cart.items).reduce(
        (total, item) => total + item.product.price * item.quantity, 0
    );
export const selectCartItemCount = (state) =>
    Object.values(state.cart.items).reduce(
        (count, item) => count + item.quantity, 0
    );

export default cartSlice.reducer;