'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaPrint, FaHome, FaShoppingBag } from 'react-icons/fa';
import jsPDF from 'jspdf';
import Link from 'next/link';

const OrderConfirmationPage = () => {
    const router = useRouter();
    const [orderData, setOrderData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Retrieve order data from localStorage
        const storedOrder = localStorage.getItem('latestOrder');
        if (storedOrder) {
            setOrderData(JSON.parse(storedOrder));
            setIsLoading(false);
        } else {
            // If no order data found, redirect back to home
            router.push('/');
        }
    }, [router]);

    const generateInvoice = () => {
        if (!orderData) return;

        const doc = new jsPDF();
        
        // Invoice design
        doc.setFillColor(20, 20, 20);
        doc.rect(0, 0, 210, 297, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('ORDER CONFIRMATION', 105, 30, { align: 'center' });
        
        // Company Info
        doc.setFontSize(12);
        doc.text('LUXURY COLLECTION', 20, 50);
        doc.text('123 Main Street, City', 20, 60);
        doc.text('contact@luxury.com', 20, 70);
        
        // Customer Info
        doc.text(`Customer: ${orderData.customer_info.name}`, 20, 90);
        doc.text(`Email: ${orderData.customer_info.email}`, 20, 100);
        doc.text(`Phone: ${orderData.customer_info.phone}`, 20, 110);
        doc.text(`Address: ${orderData.delivery_info.address}`, 20, 120);
        
        // Order Info
        doc.text(`Order #: ${orderData.order_id}`, 20, 140);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 150);
        doc.text(`Status: ${orderData.status}`, 20, 160);
        doc.text(`Payment Method: ${orderData.payment_method.replace(/_/g, ' ').toUpperCase()}`, 20, 170);
        
        // Order Items
        doc.setFontSize(14);
        doc.text('ORDER SUMMARY', 20, 190);
        
        doc.setFontSize(10);
        let yPosition = 200;
        
        orderData.order_summary.items.forEach(item => {
            doc.text(`${item.product_name}`, 20, yPosition);
            doc.text(`PKR {item.unit_price.toLocaleString()} x ${item.quantity}`, 160, yPosition);
            doc.text(`PKR {item.total_price.toLocaleString()}`, 190, yPosition);
            yPosition += 10;
        });
        
        // Total
        doc.setFontSize(12);
        doc.text('SUBTOTAL:', 160, yPosition + 10);
        doc.text(`PKR ${orderData.order_summary.subtotal.toLocaleString()}`, 190, yPosition + 10);
        
        doc.text('SHIPPING:', 160, yPosition + 20);
        doc.text('PKR 0', 190, yPosition + 20);
        
        doc.text('TOTAL:', 160, yPosition + 30);
        doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 190, yPosition + 30);
        
        doc.save(`order-confirmation-${orderData.order_id}.pdf`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto"></div>
                    <p className="mt-4 text-lg">Loading your order details...</p>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">No Order Found</h2>
                    <p className="text-gray-600 mb-6">We couldn't find your order details. Please check your order history or contact support.</p>
                    <Link href="/" className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition">
                        Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Header */}
                    <div className="bg-green-100 p-6 text-center">
                        <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-gray-600">Thank you for your purchase. Your order has been received.</p>
                        <p className="text-gray-600 mt-2">Order #: {orderData.order_id}</p>
                    </div>

                    {/* Order Summary */}
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                        
                        <div className="space-y-4">
                            {orderData.order_summary.items.map((item, index) => (
                                <div key={index} className="flex justify-between items-start border-b pb-4">
                                    <div className="flex items-center">
                                        <div className="ml-4">
                                            <h4 className="text-sm font-medium text-gray-900">{item.product_name}</h4>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            PKR {item.total_price.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {item.unit_price.toLocaleString()} each
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-900">Subtotal</span>
                                <span className="font-medium text-gray-900">PKR {orderData.order_summary.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-900">Shipping</span>
                                <span className="font-medium text-gray-900">PKR 0</span>
                            </div>
                            <div className="flex justify-between text-gray-900 text-lg font-bold mt-2">
                                <span>Total</span>
                                <span>PKR {orderData.order_summary.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Contact Information :</h3>
                                <p className="mt-1 text-sm text-gray-900">{orderData.customer_info.email}</p>
                                <p className="mt-1 text-sm text-gray-900">{orderData.customer_info.phone}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-900">Shipping Address :</h3>
                                <p className="mt-1 text-sm text-gray-900">{orderData.delivery_info.address}</p>
                                <p className="mt-1 text-sm text-gray-900">Estimated Delivery: {orderData.delivery_info.estimated_date}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
                        <div className="flex items-center">
                            <div className="bg-gray-900 p-3 rounded-md">
                                <p className="font-medium capitalize text-white">
                                    {orderData.payment_method.replace(/_/g, ' ')}
                                </p>
                            </div>
                            <p className="ml-4 text-sm text-gray-600">
                                {orderData.payment_status ? 'Payment completed' : 'Payment pending'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-between gap-4">
                        <button
                            onClick={generateInvoice}
                            className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-100 transition"
                        >
                            <FaPrint /> Print Invoice
                        </button>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link 
                                href="/" 
                                className="flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition"
                            >
                                <FaHome /> Back to Home
                            </Link>
                            <Link 
                                href="/publicproducts" 
                                className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
                            >
                                <FaShoppingBag /> Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Support Info */}
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>Need help? Contact our customer support at support@luxury.com</p>
                    <p className="mt-1">We'll send you shipping confirmation when your order ships.</p>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;