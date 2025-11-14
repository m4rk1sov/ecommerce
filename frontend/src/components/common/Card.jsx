/**
 * Card Component
 * Container for content with consistent styling
 */

import React from 'react';

export const Card = ({ children, className = '', hoverable = false, onClick }) => {
    const baseStyles = 'bg-white rounded-lg shadow-md p-4';
    const hoverStyles = hoverable ? 'transition-transform hover:scale-105 hover:shadow-lg cursor-pointer' : '';

    return (
        <div
            className={`${baseStyles} ${hoverStyles} ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

