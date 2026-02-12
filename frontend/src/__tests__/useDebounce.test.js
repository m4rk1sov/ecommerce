import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

describe('useDebounce', () => {
    beforeEach(() => { vi.useFakeTimers(); });
    afterEach(() => { vi.useRealTimers(); });

    it('should return initial value immediately', () => {
        const { result } = renderHook(() => useDebounce('hello', 500));
        expect(result.current).toBe('hello');
    });

    it('should debounce value updates', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'hello', delay: 500 } }
        );

        // Change value
        rerender({ value: 'world', delay: 500 });

        // Should still be old value
        expect(result.current).toBe('hello');

        // Advance time
        act(() => { vi.advanceTimersByTime(500); });

        // Should now be updated
        expect(result.current).toBe('world');
    });

    it('should reset timer on rapid changes', () => {
        const { result, rerender } = renderHook(
            ({ value, delay }) => useDebounce(value, delay),
            { initialProps: { value: 'a', delay: 500 } }
        );

        rerender({ value: 'ab', delay: 500 });
        act(() => { vi.advanceTimersByTime(300); });

        rerender({ value: 'abc', delay: 500 });
        act(() => { vi.advanceTimersByTime(300); });

        // Not enough time since last change
        expect(result.current).toBe('a');

        act(() => { vi.advanceTimersByTime(200); });
        expect(result.current).toBe('abc');
    });
});