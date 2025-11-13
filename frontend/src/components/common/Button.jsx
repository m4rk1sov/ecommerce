// src/components/common/Button.jsx
/**
 * Reusable Button Component
 *
 * Why create a custom button?
 * - Consistent styling across app
 * - Easy to change design system-wide
 * - Built-in loading and disabled states
 * - Variants for different use cases
 *
 * Design System Approach: Atomic Design (atoms → molecules → organisms)
 */

import React from 'react';

export const Button = ({
                           children,
                           variant = 'primary',
                           size = 'medium',
                           loading = false,
                           disabled = false,
                           onClick,
                           type = 'button',
                           className = '',
                       }) => {
    // Base styles (always applied)
    const baseStyles = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2';

    // Variant styles (color schemes)
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50',
    };

    // Size styles
    const sizes = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-base',
        large: 'px-6 py-3 text-lg',
    };

    // Disabled styles
    const disabledStyles = 'opacity-50 cursor-not-allowed';

    // Combine all styles
    const buttonClasses = `
    ${baseStyles}
    ${variants[variant]}
    ${sizes[size]}
    ${(disabled || loading) ? disabledStyles : ''}
    ${className}
  `.trim();

    return (
        <button
            type={type}
            className={buttonClasses}
            onClick={onClick}
            disabled={disabled || loading}
        >
            {loading ? (
                <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading...
        </span>
            ) : (
                children
            )}
        </button>
    );
};