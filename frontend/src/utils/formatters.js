/**
 * Formatting Utilities
 * Pure functions for display formatting — easy to test, reusable everywhere.
 */

/**
 * Format price with currency symbol
 * @param {number} price
 * @param {string} currency
 * @returns {string}
 */
export const formatPrice = (price, currency = 'USD') => {
    if (typeof price !== 'number' || isNaN(price)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
    }).format(price);
};

/**
 * Format date to locale string
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format a number with thousands separators
 * @param {number} num
 * @returns {string}
 */
export const formatNumber = (num) => {
    if (typeof num !== 'number' || isNaN(num)) return '0';
    return num.toLocaleString('en-US');
};