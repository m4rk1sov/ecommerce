/**
 * Recommendations Page
 * Shows different recommendation algorithms
 */

import React, { useState } from 'react';
import { useRecommendations } from '../hooks/useRecommendations';
import { ProductGrid } from '../components/products/ProductGrid';
import { Button } from '../components/common/Button';

export const RecommendationsPage = () => {
    const [algorithm, setAlgorithm] = useState('personalized');
    const { recommendations, loading } = useRecommendations(algorithm, 12);

    const algorithms = [
        { id: 'personalized', name: 'Personalized', desc: 'Best of both worlds' },
        { id: 'collaborative', name: 'Similar Users', desc: 'Based on users like you' },
        { id: 'content-based', name: 'Your Interests', desc: 'Based on your history' },
    ];

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Recommendations for You
            </h1>
            <p className="text-gray-600 mb-8">
                Powered by MongoDB, Redis, and Neo4j
            </p>

            {/* Algorithm Selector */}
            <div className="flex space-x-4 mb-8">
                {algorithms.map(algo => (
                    <Button
                        key={algo.id}
                        variant={algorithm === algo.id ? 'primary' : 'secondary'}
                        onClick={() => setAlgorithm(algo.id)}
                    >
                        <div className="text-left">
                            <p className="font-semibold">{algo.name}</p>
                            <p className="text-xs opacity-75">{algo.desc}</p>
                        </div>
                    </Button>
                ))}
            </div>

            {/* Algorithm Info */}
            {recommendations && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                        Algorithm: <strong>{recommendations.algorithm}</strong> |
                        Score: <strong>{(recommendations.score * 100).toFixed(0)}%</strong> |
                        Database: <strong>
                        {algorithm === 'collaborative' ? 'Neo4j Graph' :
                            algorithm === 'content-based' ? 'MongoDB Aggregation' :
                                'Hybrid (Neo4j + MongoDB + Redis Cache)'}
                    </strong>
                    </p>
                </div>
            )}

            {/* Products */}
            <ProductGrid
                products={recommendations?.products || []}
                loading={loading}
                showReasons={true}
            />
        </div>
    );
};