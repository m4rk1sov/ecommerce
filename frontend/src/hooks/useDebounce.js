/**
 * Debounce Hook
 * Delays updating value until user stops typing
 *
 * Use Case: Search input
 * - User types "laptop"
 * - Without debounce: 6 API calls (l, la, lap, lapt, lapto, laptop)
 * - With debounce: 1 API call (after 500ms of inactivity)
 *
 * Separate hook:
 * Reusable across components
 * Clean separation of concerns
 * Testable in isolation
 */

import { useState, useEffect } from 'react';

export const useDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        // Set timeout to update debounced value
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup: cancel timeout if value changes (user still typing)
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};
