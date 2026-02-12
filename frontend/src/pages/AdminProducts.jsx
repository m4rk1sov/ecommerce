/**
 * Admin Products Management — Nested route under /admin/products
 *
 * Contains the product CRUD table that was previously in AdminDashboard.
 * Container pattern: handles state + API calls, delegates rendering.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { CATEGORIES } from '../utils/constants';

export const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '', description: '', category: '', price: '', stock: '', imageUrl: '', tags: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const data = await productsAPI.getAll(100, 0);
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const openModal = useCallback((product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name, description: product.description, category: product.category,
                price: product.price.toString(), stock: product.stock.toString(),
                imageUrl: product.imageUrl || '', tags: product.tags?.join(', ') || '',
            });
        } else {
            setEditingProduct(null);
            setFormData({ name: '', description: '', category: 'Electronics', price: '', stock: '', imageUrl: '', tags: '' });
        }
        setFormErrors({});
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => {
        setShowModal(false);
        setEditingProduct(null);
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: '' }));
    }, [formErrors]);

    const validateForm = useCallback(() => {
        const errors = {};
        if (!formData.name) errors.name = 'Name is required';
        if (!formData.description) errors.description = 'Description is required';
        if (!formData.category) errors.category = 'Category is required';
        if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Valid price is required';
        if (!formData.stock || parseInt(formData.stock) < 0) errors.stock = 'Valid stock is required';
        return errors;
    }, [formData]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        const errors = validateForm();
        if (Object.keys(errors).length > 0) { setFormErrors(errors); return; }
        setSaving(true);
        try {
            const productData = {
                name: formData.name, description: formData.description, category: formData.category,
                price: parseFloat(formData.price), stock: parseInt(formData.stock),
                imageUrl: formData.imageUrl || `https://placehold.co/400x400?text=${encodeURIComponent(formData.name)}`,
                tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
                rating: 4.0, reviewCount: 0,
            };
            if (editingProduct) { await productsAPI.update(editingProduct.id, productData); }
            else { await productsAPI.create(productData); }
            await fetchProducts();
            closeModal();
        } catch (err) { alert('Error: ' + err.message); }
        finally { setSaving(false); }
    }, [formData, editingProduct, validateForm, fetchProducts, closeModal]);

    const handleDelete = useCallback(async (productId, productName) => {
        if (!window.confirm(`Delete "${productName}"?`)) return;
        try { await productsAPI.delete(productId); await fetchProducts(); }
        catch (err) { alert('Error: ' + err.message); }
    }, [fetchProducts]);

    if (loading) return <Loading text="Loading products..." />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div>
            <div className="flex justify-end mb-6">
                <Button variant="primary" size="large" onClick={() => openModal()}>+ Add New Product</Button>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">{product.category}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">${product.price?.toFixed(2)}</td>
                            <td className="px-6 py-4">
                                <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {product.stock}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                                <button onClick={() => openModal(product)} className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                                <button onClick={() => handleDelete(product.id, product.name)} className="text-red-600 hover:text-red-900">Delete</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input label="Product Name" name="name" value={formData.name} onChange={handleChange} error={formErrors.name} required />
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {formErrors.description && <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                                <select name="category" value={formData.category} onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Price" name="price" type="number" value={formData.price} onChange={handleChange} error={formErrors.price} required />
                                <Input label="Stock" name="stock" type="number" value={formData.stock} onChange={handleChange} error={formErrors.stock} required />
                            </div>
                            <Input label="Image URL" name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="https://example.com/image.jpg" />
                            <Input label="Tags (comma-separated)" name="tags" value={formData.tags} onChange={handleChange} />
                            <div className="flex justify-end space-x-4 pt-4">
                                <Button type="button" variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
                                <Button type="submit" variant="primary" loading={saving}>{editingProduct ? 'Update' : 'Create'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};