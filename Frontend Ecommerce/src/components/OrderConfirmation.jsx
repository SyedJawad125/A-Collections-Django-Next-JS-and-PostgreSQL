// 'use client';
// import React, { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { FaCheckCircle, FaPrint, FaHome, FaShoppingBag } from 'react-icons/fa';
// import jsPDF from 'jspdf';
// import Link from 'next/link';

// const OrderConfirmationPage = () => {
//     const router = useRouter();
//     const [orderData, setOrderData] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         // Retrieve order data from localStorage
//         const storedOrder = localStorage.getItem('latestOrder');
//         if (storedOrder) {
//             setOrderData(JSON.parse(storedOrder));
//             setIsLoading(false);
//         } else {
//             // If no order data found, redirect back to home
//             router.push('/');
//         }
//     }, [router]);

//     const generateInvoice = () => {
//         if (!orderData) return;

//         const doc = new jsPDF();
        
//         // Invoice design
//         doc.setFillColor(20, 20, 20);
//         doc.rect(0, 0, 210, 297, 'F');
//         doc.setTextColor(255, 255, 255);
//         doc.setFontSize(24);
//         doc.text('ORDER CONFIRMATION', 105, 30, { align: 'center' });
        
//         // Company Info
//         doc.setFontSize(12);
//         doc.text('LUXURY COLLECTION', 20, 50);
//         doc.text('123 Main Street, City', 20, 60);
//         doc.text('contact@luxury.com', 20, 70);
        
//         // Customer Info
//         doc.text(`Customer: ${orderData.customer_info.name}`, 20, 90);
//         doc.text(`Email: ${orderData.customer_info.email}`, 20, 100);
//         doc.text(`Phone: ${orderData.customer_info.phone}`, 20, 110);
//         doc.text(`Address: ${orderData.delivery_info.address}`, 20, 120);
        
//         // Order Info
//         doc.text(`Order #: ${orderData.order_id}`, 20, 140);
//         doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 150);
//         doc.text(`Status: ${orderData.status}`, 20, 160);
//         doc.text(`Payment Method: ${orderData.payment_method.replace(/_/g, ' ').toUpperCase()}`, 20, 170);
        
//         // Order Items
//         doc.setFontSize(14);
//         doc.text('ORDER SUMMARY', 20, 190);
        
//         doc.setFontSize(10);
//         let yPosition = 200;
        
//         orderData.order_summary.items.forEach(item => {
//             doc.text(`${item.product_name}`, 20, yPosition);
//             doc.text(`PKR {item.unit_price.toLocaleString()} x ${item.quantity}`, 160, yPosition);
//             doc.text(`PKR {item.total_price.toLocaleString()}`, 190, yPosition);
//             yPosition += 10;
//         });
        
//         // Total
//         doc.setFontSize(12);
//         doc.text('SUBTOTAL:', 160, yPosition + 10);
//         doc.text(`PKR ${orderData.order_summary.subtotal.toLocaleString()}`, 190, yPosition + 10);
        
//         doc.text('SHIPPING:', 160, yPosition + 20);
//         doc.text('PKR 0', 190, yPosition + 20);
        
//         doc.text('TOTAL:', 160, yPosition + 30);
//         doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 190, yPosition + 30);
        
//         doc.save(`order-confirmation-${orderData.order_id}.pdf`);
//     };

//     if (isLoading) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                 <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black mx-auto"></div>
//                     <p className="mt-4 text-lg">Loading your order details...</p>
//                 </div>
//             </div>
//         );
//     }

//     if (!orderData) {
//         return (
//             <div className="min-h-screen flex items-center justify-center bg-gray-50">
//                 <div className="text-center p-8 bg-white rounded-lg shadow-md">
//                     <h2 className="text-2xl font-bold text-gray-800 mb-4">No Order Found</h2>
//                     <p className="text-gray-600 mb-6">We couldn't find your order details. Please check your order history or contact support.</p>
//                     <Link href="/" className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition">
//                         Return to Home
//                     </Link>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-4xl mx-auto">
//                 <div className="bg-white rounded-lg shadow-md overflow-hidden">
//                     {/* Header */}
//                     <div className="bg-green-100 p-6 text-center">
//                         <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
//                         <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
//                         <p className="text-gray-600">Thank you for your purchase. Your order has been received.</p>
//                         <p className="text-gray-600 mt-2">Order #: {orderData.order_id}</p>
//                     </div>

//                     {/* Order Summary */}
//                     <div className="p-6 border-b">
//                         <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                        
//                         <div className="space-y-4">
//                             {orderData.order_summary.items.map((item, index) => (
//                                 <div key={index} className="flex justify-between items-start border-b pb-4">
//                                     <div className="flex items-center">
//                                         <div className="ml-4">
//                                             <h4 className="text-sm font-medium text-gray-900">{item.product_name}</h4>
//                                             <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
//                                         </div>
//                                     </div>
//                                     <div className="text-right">
//                                         <p className="text-sm font-medium text-gray-900">
//                                             PKR {item.total_price.toLocaleString()}
//                                         </p>
//                                         <p className="text-xs text-gray-500">
//                                             {item.unit_price.toLocaleString()} each
//                                         </p>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>

//                         <div className="mt-6 space-y-2">
//                             <div className="flex justify-between">
//                                 <span className="text-gray-900">Subtotal</span>
//                                 <span className="font-medium text-gray-900">PKR {orderData.order_summary.subtotal.toLocaleString()}</span>
//                             </div>
//                             <div className="flex justify-between">
//                                 <span className="text-gray-900">Shipping</span>
//                                 <span className="font-medium text-gray-900">PKR 0</span>
//                             </div>
//                             <div className="flex justify-between text-gray-900 text-lg font-bold mt-2">
//                                 <span>Total</span>
//                                 <span>PKR {orderData.order_summary.total.toLocaleString()}</span>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Customer Information */}
//                     <div className="p-6 border-b">
//                         <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <h3 className="text-sm font-medium text-gray-900">Contact Information :</h3>
//                                 <p className="mt-1 text-sm text-gray-900">{orderData.customer_info.email}</p>
//                                 <p className="mt-1 text-sm text-gray-900">{orderData.customer_info.phone}</p>
//                             </div>
//                             <div>
//                                 <h3 className="text-sm font-medium text-gray-900">Shipping Address :</h3>
//                                 <p className="mt-1 text-sm text-gray-900">{orderData.delivery_info.address}</p>
//                                 <p className="mt-1 text-sm text-gray-900">Estimated Delivery: {orderData.delivery_info.estimated_date}</p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Payment Method */}
//                     <div className="p-6">
//                         <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Method</h2>
//                         <div className="flex items-center">
//                             <div className="bg-gray-900 p-3 rounded-md">
//                                 <p className="font-medium capitalize text-white">
//                                     {orderData.payment_method.replace(/_/g, ' ')}
//                                 </p>
//                             </div>
//                             <p className="ml-4 text-sm text-gray-600">
//                                 {orderData.payment_status ? 'Payment completed' : 'Payment pending'}
//                             </p>
//                         </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="bg-gray-50 p-6 flex flex-col sm:flex-row justify-between gap-4">
//                         <button
//                             onClick={generateInvoice}
//                             className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-100 transition"
//                         >
//                             <FaPrint /> Print Invoice
//                         </button>
//                         <div className="flex flex-col sm:flex-row gap-4">
//                             <Link 
//                                 href="/" 
//                                 className="flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition"
//                             >
//                                 <FaHome /> Back to Home
//                             </Link>
//                             <Link 
//                                 href="/publicproducts" 
//                                 className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition"
//                             >
//                                 <FaShoppingBag /> Continue Shopping
//                             </Link>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Support Info */}
//                 <div className="mt-8 text-center text-sm text-gray-500">
//                     <p>Need help? Contact our customer support at support@luxury.com</p>
//                     <p className="mt-1">We'll send you shipping confirmation when your order ships.</p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default OrderConfirmationPage;






'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaCheckCircle, FaPrint, FaHome, FaShoppingBag, FaTruck, FaShieldAlt, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCrown } from 'react-icons/fa';
import { BiPackage } from 'react-icons/bi';
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
        
        doc.setProperties({
            title: `Order Confirmation #${orderData.order_id}`,
            subject: 'Order Confirmation from GOHAR COLLECTION',
            author: 'GOHAR COLLECTION',
        });

        // Header with elegant design
        doc.setFillColor(26, 26, 26);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont(undefined, 'bold');
        doc.text('GOHAR COLLECTION', 105, 20, { align: 'center' });
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text('Premium Luxury Products', 105, 28, { align: 'center' });
        
        // Success badge
        doc.setFillColor(34, 197, 94);
        doc.circle(105, 55, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('✓', 105, 57, { align: 'center' });
        
        doc.setTextColor(26, 26, 26);
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('ORDER CONFIRMED', 105, 72, { align: 'center' });
        
        // Order Info
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Order Number: ${orderData.order_id}`, 105, 80, { align: 'center' });
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 86, { align: 'center' });
        
        // Divider - Full width black line
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.line(20, 95, 190, 95);
        
        // Customer Information
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(26, 26, 26);
        doc.text('CUSTOMER INFORMATION', 20, 110);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(`Name: ${orderData.customer_info.name}`, 20, 120);
        doc.text(`Email: ${orderData.customer_info.email}`, 20, 127);
        doc.text(`Phone: ${orderData.customer_info.phone}`, 20, 134);
        
        // Delivery Information
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(26, 26, 26);
        doc.text('DELIVERY ADDRESS', 110, 110);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(orderData.delivery_info.address, 110, 120);
        doc.text(orderData.delivery_info.city || '', 110, 127);
        doc.text(`Est. Delivery: ${orderData.delivery_info.estimated_date}`, 110, 134);
        
        // Divider - Full width black line
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.line(20, 145, 190, 145);
        
        // Order Items Header
        doc.setFillColor(245, 245, 245);
        doc.rect(20, 155, 170, 10, 'F');
        doc.setTextColor(26, 26, 26);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        doc.text('PRODUCT', 25, 161);
        doc.text('TYPE', 90, 161);
        doc.text('UNIT PRICE', 120, 161);
        doc.text('QTY', 155, 161);
        doc.text('TOTAL', 175, 161);
        
        // Black line under header
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.line(20, 165, 190, 165);
        
        // Order Items
        doc.setFont(undefined, 'normal');
        let yPosition = 171;
        
        orderData.order_summary.items.forEach((item, index) => {
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(20, yPosition - 5, 170, 8, 'F');
            }
            
            doc.setTextColor(60, 60, 60);
            const productName = item.product_name.length > 30 
                ? item.product_name.substring(0, 30) + '...' 
                : item.product_name;
            doc.text(productName, 25, yPosition);
            
            const typeText = item.product_type === 'sales_product' ? 'Sale' : 'Regular';
            const typeColor = item.product_type === 'sales_product' ? [220, 38, 38] : [60, 60, 60];
            doc.setTextColor(...typeColor);
            doc.text(typeText, 90, yPosition);
            
            doc.setTextColor(60, 60, 60);
            doc.text(`PKR ${item.unit_price.toLocaleString()}`, 120, yPosition);
            doc.text(`${item.quantity}`, 155, yPosition);
            doc.text(`PKR ${item.total_price.toLocaleString()}`, 175, yPosition);
            yPosition += 10;
        });
        
        // Totals section - Full width black line
        yPosition += 10;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Subtotal:', 140, yPosition);
        doc.setTextColor(26, 26, 26);
        doc.text(`PKR ${orderData.order_summary.subtotal.toLocaleString()}`, 175, yPosition);
        
        yPosition += 8;
        doc.setTextColor(100, 100, 100);
        doc.text('Shipping:', 140, yPosition);
        doc.setTextColor(34, 197, 94);
        doc.text('FREE', 175, yPosition);
        
        yPosition += 8;
        doc.setTextColor(100, 100, 100);
        doc.text('Tax:', 140, yPosition);
        doc.setTextColor(26, 26, 26);
        doc.text('PKR 0', 175, yPosition);
        
        // Grand total with full-width black background
        yPosition += 12;
        doc.setFillColor(26, 26, 26);
        doc.rect(20, yPosition - 5, 170, 12, 'F');
        doc.setFont(undefined, 'bold');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('GRAND TOTAL:', 25, yPosition + 2);
        doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 165, yPosition + 2, { align: 'right' });
        
        // Payment Method
        yPosition += 20;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Payment Method:', 20, yPosition);
        doc.setTextColor(26, 26, 26);
        doc.setFont(undefined, 'bold');
        doc.text(orderData.payment_method.replace(/_/g, ' ').toUpperCase(), 20, yPosition + 6);
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont(undefined, 'italic');
        doc.text('Thank you for choosing GOHAR COLLECTION', 105, 270, { align: 'center' });
        doc.setFont(undefined, 'normal');
        doc.text('For inquiries, please contact us at contact@goharcollection.com', 105, 276, { align: 'center' });
        doc.text('GOHAR COLLECTION | Sector D, DHA 2, Islamabad | Premium Luxury Products', 105, 282, { align: 'center' });
        
        // Border
        doc.setDrawColor(26, 26, 26);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, 190, 277);
        
        doc.save(`order-confirmation-${orderData.order_id}.pdf`);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
                        <FaCrown className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-900 text-xl" />
                    </div>
                    <p className="mt-6 text-lg font-serif text-gray-900">Loading your order details...</p>
                </div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-center p-12 bg-white border-2 border-gray-200 rounded-2xl shadow-xl max-w-md">
                    <BiPackage className="text-gray-400 text-6xl mx-auto mb-6" />
                    <h2 className="text-3xl font-serif font-medium text-gray-900 mb-4">No Order Found</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        We couldn't find your order details. Please check your order history or contact support.
                    </p>
                    <Link 
                        href="/" 
                        className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                    >
                        <FaHome /> Return to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-12 animate-fadeIn">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-60"></div>
                        <div className="relative bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-full">
                            <FaCheckCircle className="text-green-600 text-6xl" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-serif font-light tracking-tight text-gray-900 mb-3">
                        Order Confirmed
                    </h1>
                    <p className="text-lg text-gray-600 mb-2">
                        Thank you for your purchase. Your order has been received.
                    </p>
                    <div className="inline-flex items-center space-x-2 bg-gray-100 px-6 py-3 rounded-full mt-4">
                        <BiPackage className="text-gray-700" />
                        <span className="text-sm font-medium text-gray-900">Order Number:</span>
                        <span className="text-sm font-bold text-gray-900">{orderData.order_id}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Order Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
                                <h2 className="text-2xl font-serif font-light flex items-center">
                                    <FaShoppingBag className="mr-3" />
                                    Order Summary
                                </h2>
                                <p className="text-sm text-gray-300 mt-1">
                                    {orderData.order_summary.items.length} {orderData.order_summary.items.length === 1 ? 'item' : 'items'}
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    {orderData.order_summary.items.map((item, index) => (
                                        <div key={index} className="flex items-start space-x-4 pb-6 border-b border-gray-100 last:border-0">
                                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                                                {item.image_url ? (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.product_name}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/images/default-product.jpg';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <BiPackage className="text-gray-400 text-3xl" />
                                                    </div>
                                                )}
                                                {item.product_type === 'sales_product' && (
                                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold shadow-md">
                                                        SALE
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-lg font-serif font-medium text-gray-900 mb-1">
                                                    {item.product_name}
                                                </h4>
                                                <div className="flex items-center space-x-3 text-sm text-gray-500 mb-2">
                                                    <span className="flex items-center">
                                                        <BiPackage className="mr-1" />
                                                        Qty: {item.quantity}
                                                    </span>
                                                    <span>•</span>
                                                    <span className={item.product_type === 'sales_product' ? 'text-red-600 font-medium' : ''}>
                                                        {item.product_type === 'sales_product' ? 'Sale Item' : 'Regular Item'}
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline space-x-2">
                                                    <span className="text-sm text-gray-500">Unit Price:</span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        PKR {item.unit_price.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-1">Total</p>
                                                <p className="text-xl font-serif font-bold text-gray-900">
                                                    PKR {item.total_price.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="mt-6 pt-6 border-t-2 border-gray-200 space-y-3">
                                    <div className="flex justify-between text-gray-900">
                                        <span className="font-medium">Subtotal</span>
                                        <span className="font-medium">PKR {orderData.order_summary.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-900">
                                        <span className="font-medium">Shipping</span>
                                        <span className="font-semibold text-green-600">FREE</span>
                                    </div>
                                    <div className="flex justify-between text-gray-900">
                                        <span className="font-medium">Tax</span>
                                        <span className="font-medium">PKR 0</span>
                                    </div>
                                    <div className="flex justify-between pt-4 border-t-2 border-gray-900">
                                        <span className="text-2xl font-serif font-medium text-gray-900">Grand Total</span>
                                        <span className="text-3xl font-serif font-bold text-gray-900">
                                            PKR {orderData.order_summary.total.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={generateInvoice}
                                className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-900 px-6 py-4 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 font-medium shadow-sm hover:shadow-md"
                            >
                                <FaPrint className="text-lg" /> Download Invoice
                            </button>
                            <Link 
                                href="/publicproducts" 
                                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-4 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
                            >
                                <FaShoppingBag /> Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Sidebar - Customer & Delivery Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Customer Information */}
                        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gray-900 text-white p-6">
                                <h3 className="text-xl font-serif font-light flex items-center">
                                    <FaEnvelope className="mr-3" />
                                    Contact Info
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="flex items-center text-gray-500 text-sm mb-1">
                                        <FaEnvelope className="mr-2" />
                                        Email
                                    </div>
                                    <p className="text-gray-900 font-medium break-all">{orderData.customer_info.email}</p>
                                </div>
                                <div>
                                    <div className="flex items-center text-gray-500 text-sm mb-1">
                                        <FaPhone className="mr-2" />
                                        Phone
                                    </div>
                                    <p className="text-gray-900 font-medium">{orderData.customer_info.phone}</p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Information */}
                        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gray-900 text-white p-6">
                                <h3 className="text-xl font-serif font-light flex items-center">
                                    <FaTruck className="mr-3" />
                                    Delivery
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <div className="flex items-center text-gray-500 text-sm mb-2">
                                        <FaMapMarkerAlt className="mr-2" />
                                        Shipping Address
                                    </div>
                                    <p className="text-gray-900 font-medium leading-relaxed">
                                        {orderData.delivery_info.address}
                                        {orderData.delivery_info.city && (
                                            <>, {orderData.delivery_info.city}</>
                                        )}
                                    </p>
                                </div>
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex items-center text-gray-500 text-sm mb-1">
                                        <FaTruck className="mr-2" />
                                        Estimated Delivery
                                    </div>
                                    <p className="text-gray-900 font-bold text-lg">
                                        {orderData.delivery_info.estimated_date}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                            <div className="bg-gray-900 text-white p-6">
                                <h3 className="text-xl font-serif font-light flex items-center">
                                    <FaShieldAlt className="mr-3" />
                                    Payment
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="bg-gray-100 p-4 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                                    <p className="text-gray-900 font-bold text-lg capitalize">
                                        {orderData.payment_method.replace(/_/g, ' ')}
                                    </p>
                                    <div className="flex items-center mt-3">
                                        <FaCheckCircle className="text-green-600 mr-2" />
                                        <span className="text-sm text-green-700 font-medium">
                                            {orderData.payment_status ? 'Payment Confirmed' : 'Payment Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl shadow-lg p-6">
                            <h3 className="text-lg font-serif font-light mb-4">Quick Actions</h3>
                            <div className="space-y-3">
                                <Link 
                                    href="/" 
                                    className="flex items-center justify-center gap-2 bg-white text-gray-900 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 font-medium"
                                >
                                    <FaHome /> Back to Home
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Support Information */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center justify-center space-x-2 bg-gray-100 px-8 py-4 rounded-2xl">
                        <FaShieldAlt className="text-gray-700 text-xl" />
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">Need Help?</p>
                            <p className="text-xs text-gray-600">Contact support@goharcollection.com</p>
                        </div>
                    </div>
                    <p className="mt-6 text-sm text-gray-500">
                        We'll send you shipping confirmation when your order ships.
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.6s ease-out;
                }
            `}</style>
        </div>
    );
};

export default OrderConfirmationPage;