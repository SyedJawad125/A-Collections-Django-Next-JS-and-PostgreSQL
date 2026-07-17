'use client'
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const ShippingMethodCom = ({ onShippingSelected }) => {
    const [shippingMethods, setShippingMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchShippingMethods = async () => {
        setLoading(true);
        try {
            const res = await AxiosInstance.get('/api/myapp/v1/public/shipping/');
            const activeMethods = (res.data.data || []).filter(method => method.is_active);
            setShippingMethods(activeMethods);
            
            // Auto-select the first method if available
            if (activeMethods.length > 0) {
                const firstMethod = activeMethods[0];
                setSelectedMethod(firstMethod);
                if (onShippingSelected) {
                    onShippingSelected(firstMethod);
                }
            }
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

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        if (onShippingSelected) {
            onShippingSelected(method);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading shipping options...</p>
                </div>
            </div>
        );
    }

    if (shippingMethods.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Shipping Method</h3>
                <p className="text-gray-600 text-sm">No shipping methods available at the moment.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Select Shipping Method</h3>
            
            <div className="space-y-3">
                {shippingMethods.map((method) => (
                    <div
                        key={method.id}
                        onClick={() => handleMethodSelect(method)}
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                            selectedMethod?.id === method.id
                                ? 'border-black bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        selectedMethod?.id === method.id
                                            ? 'border-black bg-black'
                                            : 'border-gray-300'
                                    }`}>
                                        {selectedMethod?.id === method.id && (
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{method.name}</p>
                                        <p className="text-sm text-gray-600">
                                            Estimated delivery: {method.estimated_days} {method.estimated_days === 1 ? 'day' : 'days'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">
                                    Rs {parseFloat(method.cost).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {selectedMethod && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <span className="font-medium">Selected:</span> {selectedMethod.name}
                    </p>
                    <p className="text-sm text-blue-800">
                        <span className="font-medium">Delivery in:</span> {selectedMethod.estimated_days} {selectedMethod.estimated_days === 1 ? 'day' : 'days'}
                    </p>
                    <p className="text-sm text-blue-800">
                        <span className="font-medium">Cost:</span> Rs {parseFloat(selectedMethod.cost).toLocaleString()}
                    </p>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default ShippingMethodCom;
