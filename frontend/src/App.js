import React, { useState, useEffect } from 'react';

function App() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Test API connection
        fetch('http://localhost:8080/api/v1/products?limit=5')
            .then(res => {
                if (!res.ok) throw new Error('API request failed');
                return res.json();
            })
            .then(data => {
                setProducts(data.products || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('API Error:', err);
                setError(err.message);
                setLoading(false);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-md">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-2xl font-bold text-gray-800">
                        🛍️ SmartShop
                    </h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                    Featured Products
                </h2>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading products...</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-800">
                            <strong>Error:</strong> {error}
                        </p>
                        <p className="text-sm text-red-600 mt-2">
                            Make sure backend is running on http://localhost:8080
                        </p>
                    </div>
                )}

                {/* Products Grid */}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.length === 0 ? (
                            <p className="text-gray-600 col-span-full text-center py-12">
                                No products found. Run: make seed
                            </p>
                        ) : (
                            products.map(product => (
                                <div
                                    key={product.id}
                                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                                >
                                    <div className="bg-gray-200 h-48 rounded-md mb-4 flex items-center justify-center">
                                        <span className="text-gray-400">No Image</span>
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-800 mb-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {product.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price?.toFixed(2)}
                    </span>
                                        <span className="text-sm text-blue-600">
                      {product.category}
                    </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Status Info */}
                {!loading && !error && products.length > 0 && (
                    <div className="mt-8 p-4 bg-green-50 rounded-lg">
                        <p className="text-green-800">
                            ✅ <strong>Frontend is working!</strong> Loaded {products.length} products from backend.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;