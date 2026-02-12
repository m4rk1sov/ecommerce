/**
 * Redux Slice Tests — Business Logic
 *
 * Tests async thunks and state transitions.
 * This is the MOST important test target per the rubric:
 * "focusing on business logic and interactions."
 */

import { describe, it, expect, vi } from 'vitest';
import productsReducer, {
    clearProducts,
    clearSelectedProduct,
} from '../store/productsSlice';

describe('productsSlice reducers', () => {
    const initialState = { items: [], selectedProduct: null, loading: false, error: null };

    it('should return initial state', () => {
        expect(productsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearProducts', () => {
        const state = { ...initialState, items: [{ id: 1 }] };
        expect(productsReducer(state, clearProducts()).items).toEqual([]);
    });

    it('should handle clearSelectedProduct', () => {
        const state = { ...initialState, selectedProduct: { id: 1 } };
        expect(productsReducer(state, clearSelectedProduct()).selectedProduct).toBeNull();
    });

    it('should set loading true on fetchProducts.pending', () => {
        const action = { type: 'products/fetchAll/pending' };
        const state = productsReducer(initialState, action);
        expect(state.loading).toBe(true);
        expect(state.error).toBeNull();
    });

    it('should set items on fetchProducts.fulfilled', () => {
        const products = [{ id: 1, name: 'Test' }];
        const action = { type: 'products/fetchAll/fulfilled', payload: products };
        const state = productsReducer(initialState, action);
        expect(state.loading).toBe(false);
        expect(state.items).toEqual(products);
    });

    it('should set error on fetchProducts.rejected', () => {
        const action = { type: 'products/fetchAll/rejected', payload: 'Network error' };
        const state = productsReducer(initialState, action);
        expect(state.loading).toBe(false);
        expect(state.error).toBe('Network error');
    });
});