'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const ReturnRequestCom = () => {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        order: null,
        order_detail: null,
        reason: 'damaged',
        description: ''
    });

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await AxiosInstance.get('/api/myapp/v1/order/');
            // Filter only delivered orders
            const deliveredOrders = (res.data.data || []).filter(order => order.status === 'delivered');
            setOrders(deliveredOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleOrderSelect = (order) => {
        setSelectedOrder(order);
        setSelectedOrderDetail(null);
        setFormData(prev => ({
            ...prev,
            order: order.id,
            order_detail: null
        }));
    };

    const handleOrderDetailSelect = (orderDetail) => {
        setSelectedOrderDetail(orderDetail);
        setFormData(prev => ({
            ...prev,
            order_detail: orderDetail.id
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.order || !formData.order_detail) {
            toast.error('Please select an order and item');
            return;
        }

        setSubmitting(true);
        try {
            await AxiosInstance.post('/api/myapp/v1/return/', formData);
            toast.success('Return request submitted successfully');
            setShowModal(false);
            setFormData({
                order: null,
                order_detail: null,
                reason: 'damaged',
                description: ''
            });
            setSelectedOrder(null);
            setSelectedOrderDetail(null);
            fetchOrders();
        } catch (error) {
            console.error('Error submitting return request:', error);
            toast.error(error.response?.data?.message || 'Failed to submit return request');
        } finally {
            setSubmitting(false);
        }
    };

    const openModal = (orderDetail) => {
        setSelectedOrderDetail(orderDetail);
        setFormData({
            order: selectedOrder.id,
            order_detail: orderDetail.id,
            reason: 'damaged',
            description: ''
        });
        setShowModal(true);
    };

    const getItemName = (orderDetail) => {
        if (orderDetail.product) return orderDetail.product.name;
        if (orderDetail.sales_product) return orderDetail.sales_product.name;
        return 'Unknown Product';
    };

    const getItemPrice = (orderDetail) => {
        return orderDetail.unit_price || 0;
    };

    const getItemQuantity = (orderDetail) => {
        return orderDetail.quantity || 1;
    };

    const getItemTotal = (orderDetail) => {
        return orderDetail.total_price || (getItemPrice(orderDetail) * getItemQuantity(orderDetail));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Return Requests</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No delivered orders found</h3>
                        <p className="mt-1 text-gray-600">You can only request returns for delivered orders</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                                        <p className="text-sm text-gray-600">
                                            Delivered on: {new Date(order.delivery_date).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Total: Rs {parseFloat(order.bill || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                                        Delivered
                                    </span>
                                </div>

                                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                                <div className="space-y-3">
                                    {order.order_details?.map((orderDetail) => (
                                        <div key={orderDetail.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{getItemName(orderDetail)}</p>
                                                <p className="text-sm text-gray-600">
                                                    Qty: {getItemQuantity(orderDetail)} × Rs {parseFloat(getItemPrice(orderDetail)).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">
                                                    Rs {parseFloat(getItemTotal(orderDetail)).toLocaleString()}
                                                </p>
                                                <button
                                                    onClick={() => openModal(orderDetail)}
                                                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                                                >
                                                    Request Return
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Return Request Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">Request Return</h2>
                        
                        {selectedOrderDetail && (
                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <p className="font-medium text-gray-900">{getItemName(selectedOrderDetail)}</p>
                                <p className="text-sm text-gray-600">
                                    Qty: {getItemQuantity(selectedOrderDetail)} | 
                                    Price: Rs {parseFloat(getItemTotal(selectedOrderDetail)).toLocaleString()}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Return</label>
                                    <select
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black"
                                        required
                                    >
                                        <option value="damaged">Damaged</option>
                                        <option value="wrong_item">Wrong Item</option>
                                        <option value="not_as_described">Not as Described</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-black"
                                        rows={4}
                                        placeholder="Please provide details about your return request..."
                                    />
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
                                    disabled={submitting}
                                    className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
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

export default ReturnRequestCom;
