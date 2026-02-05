import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { interactionsAPI, productsAPI } from '../api';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Loading } from '../components/common/Loading';
import { ErrorMessage } from '../components/common/ErrorMessage';

export const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, updateUser, logout } = useAuth();

    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchPurchaseHistory = async () => {
            try {
                setLoading(true);
                const data = await interactionsAPI.getHistory();

                // Fetch product details for each purchase
                const purchasesWithDetails = await Promise.all(
                    data.purchases?.map(async (purchase) => {
                        const productsWithDetails = await Promise.all(
                            purchase.products.map(async (item) => {
                                try {
                                    const product = await productsAPI.getById(item.productId);
                                    return { ...item, product };
                                } catch (err) {
                                    return item;
                                }
                            })
                        );
                        return { ...purchase, products: productsWithDetails };
                    }) || []
                );

                setPurchases(purchasesWithDetails);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPurchaseHistory();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            // In a real app, you'd call an update profile API
            updateUser({ ...user, ...formData });
            setEditMode(false);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Error updating profile: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <Loading text="Loading profile..." />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Header */}
                    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
                            <Button variant="secondary" onClick={handleLogout}>
                                Logout
                            </Button>
                        </div>

                        {/* Profile Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="First Name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                            <Input
                                label="Last Name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                disabled={true}
                            />
                            <Input
                                label="Username"
                                name="username"
                                value={user?.username}
                                disabled={true}
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 flex space-x-4">
                            {editMode ? (
                                <>
                                    <Button
                                        variant="primary"
                                        onClick={handleSaveProfile}
                                        loading={saving}
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => {
                                            setEditMode(false);
                                            setFormData({
                                                firstName: user?.firstName || '',
                                                lastName: user?.lastName || '',
                                                email: user?.email || '',
                                            });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            ) : (
                                <Button variant="primary" onClick={() => setEditMode(true)}>
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Purchase History */}
                    <div className="bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            Purchase History
                        </h2>

                        {error && <ErrorMessage message={error} />}

                        {purchases.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-600 mb-4">No purchases yet</p>
                                <Button variant="primary" onClick={() => navigate('/products')}>
                                    Start Shopping
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {purchases.map((purchase) => (
                                    <div
                                        key={purchase.id}
                                        className="border border-gray-200 rounded-lg p-6"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Order Date: {new Date(purchase.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Status: <span className="font-medium text-green-600">{purchase.status}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-gray-800">
                                                    ${purchase.total.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Products in Order */}
                                        <div className="space-y-4">
                                            {purchase.products.map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center space-x-4 border-t pt-4"
                                                >
                                                    <div className="w-16 h-16 bg-gray-200 rounded shrink-0"></div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-800">
                                                            {item.product?.name || 'Product'}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Quantity: {item.quantity} × ${item.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-medium text-gray-800">
                                                            ${(item.quantity * item.price).toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// export default ProfilePage;