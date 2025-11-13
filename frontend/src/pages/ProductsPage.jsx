// ============================================================
// src/pages/ProductsPage.jsx
/**
 * Products Listing Page
 *
 * Features:
 * - Product search
 * - Category filter
 * - Pagination
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsAPI } from '../api';
import { ProductGrid } from '../components/products/ProductGrid';
import { SearchBar } from '../components/products/SearchBar';

export const ProductsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const category = searchParams.get('category') || '';
    const searchQuery = searchParams.get('q') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                let data;
                if (searchQuery || category) {
                    data = await productsAPI.search(searchQuery, category);
                } else {
                    data = await productsAPI.getAll(20, 0);
                }

                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchQuery, category]);

    const handleSearch = (query) => {
        setSearchParams({ q: query, category });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">
                {category ? `${category} Products` : 'All Products'}
            </h1>

            <div className="mb-8">
                <SearchBar onSearch={handleSearch} />
            </div>

            <ProductGrid products={products} loading={loading} error={error} />
        </div>
    );
};

