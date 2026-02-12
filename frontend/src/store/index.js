/**
 * Redux Store Configuration
 *
 * Why Redux Toolkit over plain Context API?
 * - Built-in Immer for immutable updates
 * - DevTools integration for time-travel debugging
 * - createAsyncThunk for standardized async operations
 * - Middleware pipeline (thunk by default)
 * - Better performance with selector memoization (reselect)
 *
 * Architecture: Each slice owns its domain (auth, products, cart)
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productsReducer from './productsSlice';
import cartReducer from './cartSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productsReducer,
        cart: cartReducer,
    },
    // Redux Toolkit includes thunk middleware by default
    devTools: import.meta.env.DEV,
});

export default store;