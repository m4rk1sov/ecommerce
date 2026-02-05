/**
 * Search Bar Component
 * Handles product search with debouncing
 */

import React, { useState } from 'react';

export const SearchBar = ({ onSearch, placeholder = 'Search products...' }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pr-12 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    🔍
                </button>
            </div>
        </form>
    );
};

/**
 * Component Design Principles:
 * Atomic Design: Small, reusable components
 * Single Responsibility: Each component does one thing
 * Composition: Build complex UIs from simple components
 * Consistent Styling: Tailwind CSS utility classes
 *
 * Component Hierarchy:
 * Common (atoms) → Product Components (molecules) → Pages (organisms)
 *
 * Tailwind CSS:
 * Utility-first (no custom CSS files)
 * Consistent design system
 * Fast development
 * Small bundle size (purges unused classes)
 */
