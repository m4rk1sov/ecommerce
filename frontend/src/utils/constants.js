/**
 * Application Constants
 * Centralized magic strings/numbers — avoids typos, single source of truth.
 */

export const CATEGORIES = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Toys',
    'Health and Beauty',
    'Accessories',
];

export const RECOMMENDATION_ALGORITHMS = [
    { id: 'personalized', name: 'Personalized', desc: 'Best of both worlds' },
    { id: 'collaborative', name: 'Similar Users', desc: 'Based on users like you' },
    { id: 'content-based', name: 'Your Interests', desc: 'Based on your history' },
];

export const ADMIN_EMAIL = 'user1@example.com';

export const ITEMS_PER_PAGE = 20;

export const API_TIMEOUT = 10000;