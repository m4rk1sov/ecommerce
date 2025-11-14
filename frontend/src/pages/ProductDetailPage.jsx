import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, interactionsAPI } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { ProductCard } from '../components/products/ProductCard';

export const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);

                const productData = await productsAPI.getById(id);
                setProduct(productData);

                // Fetch related products
                try {
                    const related = await productsAPI.getRelated(id, 4);
                    setRelatedProducts(related);
                } catch (err) {
                    console.log('No related products available');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
        // Record view interaction
        if (isAuthenticated) {
            interactionsAPI.recordView(id).catch(err => console.error('Failed to record view:', err));
        }
    }, [id, isAuthenticated]);


    const handleAddToCart = () => {
        addToCart(product, quantity);
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            alert('Please login to like products');
            navigate('/login');
            return;
        }

        try {
            await interactionsAPI.recordLike(id);
            setLiked(true);
            alert('Added to favorites!');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleBuyNow = () => {
        addToCart(product, quantity);
        navigate('/cart');
    };

    if (loading) return <Loading text="Loading product..." />;
    if (error) return <ErrorMessage message={error} />;
    if (!product) return <ErrorMessage message="Product not found" />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm">
                    <button onClick={() => navigate('/')} className="text-blue-600 hover:text-blue-700">
                        Home
                    </button>
                    <span className="mx-2 text-gray-400">/</span>
                    <button onClick={() => navigate('/products')} className="text-blue-600 hover:text-blue-700">
                        Products
                    </button>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-600">{product.name}</span>
                </nav>

                {/* Product Detail */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                        {/* Product Image */}
                        <div>
                            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                {product.imageUrl ? (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-lg">No Image</span>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div>
                            {/* Category Badge */}
                            <span className="inline-block px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full mb-4">
                {product.category}
              </span>

                            <h1 className="text-4xl font-bold text-gray-800 mb-4">
                                {product.name}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center mb-6">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={i < Math.floor(product.rating || 0) ? 'text-yellow-500' : 'text-gray-300'}>
                      ★
                    </span>
                                    ))}
                                </div>
                                <span className="ml-2 text-gray-600">
                  {product.rating?.toFixed(1)} ({product.reviewCount} reviews)
                </span>
                            </div>

                            {/* Price */}
                            <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-6">
                                {product.stock > 0 ? (
                                    <p className="text-green-600 font-medium">
                                        ✓ In Stock ({product.stock} available)
                                    </p>
                                ) : (
                                    <p className="text-red-600 font-medium">
                                        ✗ Out of Stock
                                    </p>
                                )}
                            </div>

                            {/* Quantity Selector */}
                            {product.stock > 0 && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quantity
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            -
                                        </button>
                                        <span className="text-xl font-medium">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex space-x-4 mb-6">
                                <Button
                                    variant="primary"
                                    size="large"
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0}
                                    className="flex-1"
                                >
                                    🛒 Add to Cart
                                </Button>
                                <Button
                                    variant="success"
                                    size="large"
                                    onClick={handleBuyNow}
                                    disabled={product.stock === 0}
                                    className="flex-1"
                                >
                                    Buy Now
                                </Button>
                                <button
                                    onClick={handleLike}
                                    className={`px-6 py-3 rounded-lg border-2 transition-colors ${
                                        liked
                                            ? 'border-red-500 bg-red-50 text-red-600'
                                            : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {liked ? '❤️' : '🤍'}
                                </button>
                            </div>

                            {/* Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Tags:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                            >
                        {tag}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">
                            You May Also Like
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// export default ProductDetailPage;
