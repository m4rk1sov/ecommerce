import { describe, it, expect } from 'vitest';
import cartReducer, {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCartOpen,
} from '../store/cartSlice';

describe('cartSlice reducers', () => {
    const initialState = { items: {}, isOpen: false, checkoutLoading: false, checkoutError: null };
    const mockProduct = { id: 'p1', name: 'Widget', price: 10.00 };

    it('should return initial state', () => {
        const state = cartReducer(undefined, { type: 'unknown' });
        expect(state.isOpen).toBe(false);
    });

    it('should add item to cart', () => {
        const state = cartReducer(initialState, addToCart({ product: mockProduct, quantity: 2 }));
        expect(state.items['p1'].quantity).toBe(2);
        expect(state.items['p1'].product.name).toBe('Widget');
        expect(state.isOpen).toBe(true);
    });

    it('should increment quantity for existing item', () => {
        let state = cartReducer(initialState, addToCart({ product: mockProduct, quantity: 1 }));
        state = cartReducer(state, addToCart({ product: mockProduct, quantity: 3 }));
        expect(state.items['p1'].quantity).toBe(4);
    });

    it('should remove item from cart', () => {
        let state = cartReducer(initialState, addToCart({ product: mockProduct }));
        state = cartReducer(state, removeFromCart('p1'));
        expect(state.items['p1']).toBeUndefined();
    });

    it('should update quantity', () => {
        let state = cartReducer(initialState, addToCart({ product: mockProduct, quantity: 3 }));
        state = cartReducer(state, updateQuantity({ productId: 'p1', quantity: 5 }));
        expect(state.items['p1'].quantity).toBe(5);
    });

    it('should remove item when quantity <= 0', () => {
        let state = cartReducer(initialState, addToCart({ product: mockProduct }));
        state = cartReducer(state, updateQuantity({ productId: 'p1', quantity: 0 }));
        expect(state.items['p1']).toBeUndefined();
    });

    it('should clear cart', () => {
        let state = cartReducer(initialState, addToCart({ product: mockProduct }));
        state = cartReducer(state, clearCart());
        expect(Object.keys(state.items).length).toBe(0);
    });

    it('should toggle cart open state', () => {
        const state = cartReducer(initialState, setCartOpen(true));
        expect(state.isOpen).toBe(true);
    });
});