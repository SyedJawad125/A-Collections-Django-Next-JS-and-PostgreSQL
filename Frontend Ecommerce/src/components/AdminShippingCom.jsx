'use client'
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const AdminShippingCom = () => {
    const [shippingMethods, setShippingMethods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        estimated_days: '',
        cost: '',
        is_active: true
    });

    const fetchShippingMethods = async () => {
        setLoading(true);
        try {
            const res = await AxiosInstance.get('/api/myapp/v1/shipping/');
            setShippingMethods(res.data.data || []);
        } catch (error) {
            console.error('Error fetching shipping methods:', error);
            toast.error('Failed to load shipping methods');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShippingMethods();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitData = {
                ...formData,
                estimated_days: parseInt(formData.estimated_days),
                cost: parseFloat(formData.cost)
            };

            if (editingMethod) {
                await AxiosInstance.patch(`/api/myapp/v1/shipping/?id=${editingMethod.id}`, submitData);
                toast.success('Shipping method updated successfully');
            } else {
                await AxiosInstance.post('/api/myapp/v1/shipping/', submitData);
                toast.success('Shipping method created successfully');
            }
            setShowModal(false);
            setEditingMethod(null);
            setFormData({
                name: '',
                estimated_days: '',
                cost: '',
                is_active: true
            });
            fetchShippingMethods();
        } catch (error) {
            console.error('Error saving shipping method:', error);
            toast.error(error.response?.data?.message || 'Failed to save shipping method');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (method) => {
        setEditingMethod(method);
        setFormData({
            name: method.name,
            estimated_days: method.estimated_days,
            cost: method.cost,
            is_active: method.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (methodId) => {
        if (!window.confirm('Are you sure you want to delete this shipping method?')) return;
        
        setLoading(true);
        try {
            await AxiosInstance.delete(`/api/myapp/v1/shipping/?id=${methodId}`);
            toast.success('Shipping method deleted successfully');
            fetchShippingMethods();
        } catch (error) {
            console.error('Error deleting shipping method:', error);
            toast.error('Failed to delete shipping method');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (methodId, currentStatus) => {
        setLoading(true);
        try {
            await AxiosInstance.patch(`/api/myapp/v1/shipping/?id=${methodId}`, { is_active: !currentStatus });
            toast.success(`Shipping method ${!currentStatus ? 'activated' : 'deactivated'}`);
            fetchShippingMethods();
        } catch (error) {
            console.error('Error toggling shipping method status:', error);
            toast.error('Failed to update shipping method status');
        } finally {
            setLoading(false);
        }
    };

    const openModal = () => {
        setEditingMethod(null);
        setFormData({
            name: '',
            estimated_days: '',
            cost: '',
            is_active: true
        });
        setShowModal(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Manage Shipping Methods</h1>
                    <button
                        onClick={openModal}
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        Add Shipping Method
                    </button>
                </div>

                {loading && !showModal ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {shippingMethods.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No shipping methods found
                                        </td>
                                    </tr>
                                ) : (
                                    shippingMethods.map((method) => (
                                        <tr key={method.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                {method.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {method.estimated_days} {method.estimated_days === 1 ? 'day' : 'days'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                Rs {parseFloat(method.cost).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {method.is_active ? (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(method.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleToggleActive(method.id, method.is_active)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    {method.is_active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(method)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(method.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6">
                            {editingMethod ? 'Edit Shipping Method' : 'Add New Shipping Method'}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Method Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                        placeholder="e.g., Standard Delivery, Express Shipping"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Delivery Days</label>
                                    <input
                                        type="number"
                                        name="estimated_days"
                                        value={formData.estimated_days}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                        min="1"
                                        placeholder="e.g., 3"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Cost (Rs)</label>
                                    <input
                                        type="number"
                                        name="cost"
                                        value={formData.cost}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                        min="0"
                                        step="0.01"
                                        placeholder="e.g., 200"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={formData.is_active}
                                        onChange={handleInputChange}
                                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                                    />
                                    <label className="ml-2 text-sm text-gray-700">Active</label>
                                </div>
                            </div>
                            <div className="flex gap-4 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : (editingMethod ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default AdminShippingCom;
