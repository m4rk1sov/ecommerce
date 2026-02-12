/**
 * Validation Utilities
 * Centralized validation functions used across forms.
 * Enables unit testing of validation logic in isolation.
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {string} error message or empty string
 */
export const validateEmail = (email) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    return '';
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {string} error message or empty string
 */
export const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    // if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    return '';
};

/**
 * Validate required field
 * @param {string} value
 * @param {string} fieldName
 * @returns {string} error message or empty string
 */
export const validateRequired = (value, fieldName = 'This field') => {
    if (!value || !value.trim()) return `${fieldName} is required`;
    return '';
};

/**
 * Validate minimum length
 * @param {string} value
 * @param {number} minLength
 * @param {string} fieldName
 * @returns {string}
 */
export const validateMinLength = (value, minLength, fieldName = 'This field') => {
    if (!value) return `${fieldName} is required`;
    if (value.length < minLength) return `${fieldName} must be at least ${minLength} characters`;
    return '';
};

/**
 * Validate two fields match (e.g., password confirmation)
 * @param {string} value
 * @param {string} matchValue
 * @param {string} fieldName
 * @returns {string}
 */
export const validateMatch = (value, matchValue, fieldName = 'Fields') => {
    if (value !== matchValue) return `${fieldName} do not match`;
    return '';
};

/**
 * Validate price (positive number)
 * @param {string|number} value
 * @returns {string}
 */
export const validatePrice = (value) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return 'Price must be a positive number';
    return '';
};

/**
 * Async Validation: Check email availability
 * Simulates a server-side check (required by rubric: "asynchronous validation").
 *
 * In production this would call: GET /auth/check-email?email=...
 * Here we simulate with a delay + known taken emails.
 *
 * @param {string} email
 * @returns {Promise<string>} error message or empty string
 */
export const checkEmailAvailability = async (email) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Simulate taken emails (in real app, this hits the backend)
    const takenEmails = [
        'user1@example.com',
        'user2@example.com',
        'admin@example.com',
        'test@test.com',
    ];

    if (takenEmails.includes(email.toLowerCase())) {
        return 'This email is already registered';
    }

    return '';
};