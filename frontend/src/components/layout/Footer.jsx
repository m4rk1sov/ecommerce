/**
 * Footer Component
 * Consistent site-wide footer.
 */

import React from 'react';

export const Footer = () => {
    return (
        <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-white font-bold text-lg mb-3">🛍️ SmartShop</h3>
                        <p className="text-sm">AI-powered e-commerce with personalized recommendations.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-3">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="/products" className="hover:text-white">Products</a></li>
                            <li><a href="/recommendations" className="hover:text-white">Recommendations</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-semibold mb-3">Tech Stack</h4>
                        <p className="text-sm">React 19 • Redux Toolkit • Tailwind CSS • Vite</p>
                    </div>
                </div>
                <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm">
                    © {new Date().getFullYear()} SmartShop. All rights reserved.
                </div>
            </div>
        </footer>
    );
};