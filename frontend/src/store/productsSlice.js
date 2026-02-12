/**
 * Products Slice — Redux Toolkit
 *
 * Replaces the old disconnected productSlice.js.
 * Uses apiClient (not raw axios) so auth interceptors work.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../api';

// ─── Async Thunks ────────────────────────────────────────────

export const fetchProducts = createAsyncThunk(
    'products/fetchAll',
    async ({ limit = 20, offset = 0 } = {}, { rejectWithValue }) => {
        try {
            const data = await productsAPI.getAll(limit, offset);
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Failed to fetch products');
        }
    }
);

export const searchProducts = createAsyncThunk(
    'products/search',
    async ({ query, category = '', limit = 20 }, { rejectWithValue }) => {
        try {
            const data = await productsAPI.search(query, category, limit);
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Search failed');
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const data = await productsAPI.getById(id);
            return data;
        } catch (error) {
            return rejectWithValue(error.message || 'Product not found');
        }
    }
);

// ─── Slice ───────────────────────────────────────────────────

const productsSlice = createSlice({
    name: 'products',
    initialState: {
        items: [],
        selectedProduct: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearProducts: (state) => {
            state.items = [];
        },
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Search
            .addCase(searchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(searchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(searchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch By ID
            .addCase(fetchProductById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearProducts, clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;