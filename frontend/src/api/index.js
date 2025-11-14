/**
 * API Module Exports
 * Central export point for all API functions
 *
 * Usage:
 * import { authAPI, productsAPI } from './api';
 * const products = await productsAPI.getAll();
 */

export { default as apiClient } from './client';
export { authAPI } from './auth';
export { productsAPI } from './products';
export { interactionsAPI } from './interactions';
export { recommendationsAPI } from './recommendations';

/**
 * API Layer Summary:
 *
 * ✅ Centralized HTTP client (like backend repository)
 * ✅ Automatic authentication (request interceptor)
 * ✅ Global error handling (response interceptor)
 * ✅ Organized by domain (auth, products, etc.)
 * ✅ Type-safe-ish (JSDoc comments for IntelliSense)
 * ✅ Easy to test (mock axios in tests)
 *
 * Next: Context for global state management
 */
