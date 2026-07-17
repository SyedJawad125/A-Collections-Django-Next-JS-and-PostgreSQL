'use client'
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const AdminReturnsCom = () => {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedReturn, setSelectedReturn] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchReturns = async () => {
        setLoading(true);
        try {
            const res = await AxiosInstance.get('/api/myapp/v1/return/');
            setReturns(res.data.data || []);
        } catch (error) {
            console.error('Error fetching return requests:', error);
            toast.error('Failed to load return requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    const handleStatusUpdate = async (returnId, newStatus) => {
        setLoading(true);
        try {
            await AxiosInstance.patch(`/api/myapp/v1/return/?id=${returnId}`, { status: newStatus });
            toast.success(`Return request ${newStatus}`);
            fetchReturns();
        } catch (error) {
            console.error('Error updating return status:', error);
            toast.error('Failed to update return status');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (returnRequest) => {
        setSelectedReturn(returnRequest);
        setShowModal(true);
    };

    const filteredReturns = returns.filter(ret => {
        const matchesSearch = 
            ret.order_id?.toString().includes(searchTerm) ||
            ret.reason?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || ret.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'requested': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Return Requests</h1>

                {/* Filters */}
                <div className="mb-6 flex gap-4 flex-wrap">
                    <input
                        type="text"
                        placeholder="Search by order ID or reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 min-w-[200px] border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="all">All Status</option>
                        <option value="requested">Requested</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="completed">Completed</option>
                    </select>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredReturns.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                            No return requests found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReturns.map((ret) => (
                                        <tr key={ret.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                #{ret.id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                #{ret.order_id}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {ret.customer_name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                                {ret.reason}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {ret.refund_amount ? `Rs ${parseFloat(ret.refund_amount).toLocaleString()}` : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ret.status)}`}>
                                                    {ret.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(ret.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => handleViewDetails(ret)}
                                                    className="text-blue-600 hover:text-blue-900 mr-4"
                                                >
                                                    View Details
                                                </button>
                                                {ret.status === 'requested' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusUpdate(ret.id, 'approved')}
                                                            className="text-green-600 hover:text-green-900 mr-4"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(ret.id, 'rejected')}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {ret.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(ret.id, 'completed')}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Mark Complete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {showModal && selectedReturn && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6">Return Request Details</h2>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Return ID</p>
                                    <p className="font-semibold">#{selectedReturn.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Order ID</p>
                                    <p className="font-semibold">#{selectedReturn.order_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedReturn.status)}`}>
                                        {selectedReturn.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Refund Amount</p>
                                    <p className="font-semibold">
                                        {selectedReturn.refund_amount ? `Rs ${parseFloat(selectedReturn.refund_amount).toLocaleString()}` : 'Pending'}
                                    </p>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-500">Reason</p>
                                <p className="font-semibold capitalize">{selectedReturn.reason}</p>
                            </div>

                            {selectedReturn.description && (
                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="text-gray-900">{selectedReturn.description}</p>
                                </div>
                            )}

                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-500">Submitted On</p>
                                <p className="font-semibold">{new Date(selectedReturn.created_at).toLocaleString()}</p>
                            </div>

                            {selectedReturn.status === 'requested' && (
                                <div className="border-t pt-4 flex gap-4">
                                    <button
                                        onClick={() => {
                                            handleStatusUpdate(selectedReturn.id, 'approved');
                                            setShowModal(false);
                                        }}
                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Approve Return
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleStatusUpdate(selectedReturn.id, 'rejected');
                                            setShowModal(false);
                                        }}
                                        className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Reject Return
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full mt-6 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default AdminReturnsCom;
