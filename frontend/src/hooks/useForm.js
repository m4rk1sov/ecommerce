/**
 * useForm — Custom Form Hook with Async Validation
 *
 * Features:
 * - Field-level sync validation (runs on every change)
 * - Field-level async validation (debounced, e.g., email uniqueness)
 * - Touched tracking (errors shown only after interaction)
 * - Form-level submission with loading state
 *
 * Rubric: "Development of at least one complex form featuring
 *          asynchronous validation (Custom Hooks in React)."
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * @param {Object} initialValues - { email: '', password: '', ... }
 * @param {Function} syncValidate - (values) => { email: 'error', ... }
 * @param {Object} asyncValidators - { email: async (value) => 'error' | '' }
 * @param {Function} onSubmit - async (values) => void
 */
export const useForm = ({ initialValues, syncValidate, asyncValidators = {}, onSubmit }) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [asyncErrors, setAsyncErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [asyncValidating, setAsyncValidating] = useState({});

    // Track debounce timers per field
    const timersRef = useRef({});

    // Cleanup timers on unmount
    useEffect(() => {
        return () => {
            Object.values(timersRef.current).forEach(clearTimeout);
        };
    }, []);

    /**
     * Handle input change
     * - Updates value
     * - Runs sync validation immediately
     * - Schedules async validation (debounced 600ms)
     */
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;

        setValues((prev) => {
            const next = { ...prev, [name]: value };

            // Run sync validation
            if (syncValidate) {
                const syncErrs = syncValidate(next);
                setErrors(syncErrs);
            }

            return next;
        });

        // Schedule async validation if one exists for this field
        if (asyncValidators[name]) {
            // Clear previous timer
            if (timersRef.current[name]) {
                clearTimeout(timersRef.current[name]);
            }

            setAsyncValidating((prev) => ({ ...prev, [name]: true }));

            timersRef.current[name] = setTimeout(async () => {
                try {
                    const asyncError = await asyncValidators[name](e.target.value);
                    setAsyncErrors((prev) => ({ ...prev, [name]: asyncError }));
                } catch {
                    setAsyncErrors((prev) => ({ ...prev, [name]: '' }));
                } finally {
                    setAsyncValidating((prev) => ({ ...prev, [name]: false }));
                }
            }, 600);
        }
    }, [syncValidate, asyncValidators]);

    /**
     * Handle field blur — marks field as touched
     */
    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    }, []);

    /**
     * Combine sync + async errors
     * Only show errors for touched fields
     */
    const getFieldError = useCallback((name) => {
        if (!touched[name]) return '';
        return errors[name] || asyncErrors[name] || '';
    }, [errors, asyncErrors, touched]);

    /**
     * Check if a field is currently async validating
     */
    const isFieldValidating = useCallback((name) => {
        return !!asyncValidating[name];
    }, [asyncValidating]);

    /**
     * Handle form submission
     */
    const handleSubmit = useCallback(async (e) => {
        if (e) e.preventDefault();

        // Mark all fields as touched
        const allTouched = {};
        Object.keys(values).forEach((key) => { allTouched[key] = true; });
        setTouched(allTouched);

        // Final sync validation
        const syncErrs = syncValidate ? syncValidate(values) : {};
        setErrors(syncErrs);

        // Check for any errors
        const hasSync = Object.values(syncErrs).some(Boolean);
        const hasAsync = Object.values(asyncErrors).some(Boolean);
        const stillValidating = Object.values(asyncValidating).some(Boolean);

        if (hasSync || hasAsync || stillValidating) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(values);
        } finally {
            setIsSubmitting(false);
        }
    }, [values, errors, asyncErrors, asyncValidating, syncValidate, onSubmit]);

    /**
     * Reset form to initial state
     */
    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setAsyncErrors({});
        setTouched({});
        setIsSubmitting(false);
    }, [initialValues]);

    return {
        values,
        errors: { ...errors, ...asyncErrors },
        touched,
        isSubmitting,
        asyncValidating,
        handleChange,
        handleBlur,
        handleSubmit,
        getFieldError,
        isFieldValidating,
        resetForm,
        setValues,
    };
};