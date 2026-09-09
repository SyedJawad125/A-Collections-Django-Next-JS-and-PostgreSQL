// 'use client';
// import React, { useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { CartContext } from "@/components/CartContext";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import jsPDF from 'jspdf';
// import { FaLock, FaArrowLeft, FaCcVisa, FaCcMastercard, FaCcPaypal, FaShieldAlt, FaTruck, FaCheckCircle, FaTag } from 'react-icons/fa';
// import { BiPackage } from 'react-icons/bi';

// const Checkout = () => {
//     const { cartItems, clearCart, getRegularProducts, getSalesProducts } = useContext(CartContext);
//     const router = useRouter();
//     const [isLoading, setIsLoading] = useState(false);
//     const [activeStep, setActiveStep] = useState(1);
//     const [form, setForm] = useState({
//         customer_name: '',
//         customer_email: '',
//         customer_phone: '',
//         delivery_address: '',
//         city: '',
//         payment_method: 'credit_card',
//     });

//     const regularProducts = getRegularProducts();
//     const salesProducts = getSalesProducts();

//     // Improved image URL processing that matches the cart page
//     const processImageUrl = (url) => {
//         if (!url || url.trim() === '') {
//             return '/images/default-product.jpg';
//         }
        
//         if (url.startsWith('http://') || url.startsWith('https://')) {
//             return url;
//         }
        
//         const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
//         const cleanUrl = url.startsWith('/') ? url : `/${url}`;
//         return `${baseURL}${cleanUrl}`;
//     };

//     const getMainImage = (item) => {
//         // Try multiple image sources in order of priority
//         if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
//             return processImageUrl(item.image_urls[0]);
//         }
//         if (item.image_urls && typeof item.image_urls === 'string') {
//             return processImageUrl(item.image_urls);
//         }
//         if (item.image) {
//             return processImageUrl(item.image);
//         }
//         if (item.mainImage) {
//             return processImageUrl(item.mainImage);
//         }
//         return '/images/default-product.jpg';
//     };

//     useEffect(() => {
//         const userData = JSON.parse(localStorage.getItem('user'));
//         if (userData) {
//             setForm(prev => ({
//                 ...prev,
//                 customer_name: userData.name || '',
//                 customer_email: userData.email || '',
//                 customer_phone: userData.phone || ''
//             }));
//         }
//     }, []);

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setForm({
//             ...form,
//             [name]: type === 'checkbox' ? checked : value
//         });
//     };

//     const getUnitPrice = (item) => {
//         return item.final_price !== undefined ? Number(item.final_price) : Number(item.price) || 0;
//     };

//     const getTotalPrice = () => {
//         return cartItems.reduce((total, item) => {
//             return total + (getUnitPrice(item) * (item.quantity || 1));
//         }, 0);
//     };

//     const calculateTotalSavings = () => {
//         return cartItems.reduce((savings, item) => {
//             if (item.original_price && item.final_price && parseFloat(item.original_price) > parseFloat(item.final_price)) {
//                 return savings + ((parseFloat(item.original_price) - parseFloat(item.final_price)) * item.quantity);
//             }
//             return savings;
//         }, 0);
//     };

//     const generateInvoice = (orderData) => {
//         const doc = new jsPDF();
        
//         doc.setProperties({
//             title: `Invoice #${orderData.order_id}`,
//             subject: 'Invoice from GOHAR COLLECTION',
//             author: 'GOHAR COLLECTION',
//         });

//         // Header with gradient effect
//         doc.setFillColor(26, 26, 26);
//         doc.rect(0, 0, 210, 35, 'F');
//         doc.setTextColor(255, 255, 255);
//         doc.setFontSize(24);
//         doc.setFont(undefined, 'bold');
//         doc.text('GOHAR COLLECTION', 105, 18, { align: 'center' });
//         doc.setFontSize(10);
//         doc.setFont(undefined, 'normal');
//         doc.text('Premium Luxury Products', 105, 26, { align: 'center' });
        
//         // Invoice details
//         doc.setFontSize(14);
//         doc.setTextColor(26, 26, 26);
//         doc.setFont(undefined, 'bold');
//         doc.text('INVOICE', 20, 50);
//         doc.setFont(undefined, 'normal');
//         doc.setFontSize(10);
//         doc.setTextColor(100, 100, 100);
//         doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 50);
//         doc.text(`Invoice #: ${orderData.order_id}`, 160, 56);
//         doc.text(`Status: ${orderData.status}`, 160, 62);
        
//         // From section
//         doc.setFontSize(10);
//         doc.setTextColor(100, 100, 100);
//         doc.text('FROM:', 20, 75);
//         doc.setFont(undefined, 'bold');
//         doc.setTextColor(26, 26, 26);
//         doc.text('GOHAR COLLECTION', 20, 82);
//         doc.setFont(undefined, 'normal');
//         doc.setTextColor(100, 100, 100);
//         doc.text('Sector D, DHA 2, Islamabad', 20, 88);
//         doc.text('Pakistan', 20, 94);
//         doc.text('contact@goharcollection.com', 20, 100);
        
//         // To section
//         doc.setTextColor(100, 100, 100);
//         doc.text('TO:', 20, 115);
//         doc.setFont(undefined, 'bold');
//         doc.setTextColor(26, 26, 26);
//         doc.text(orderData.customer_info.name, 20, 122);
//         doc.setFont(undefined, 'normal');
//         doc.setTextColor(100, 100, 100);
//         doc.text(orderData.delivery_info.address, 20, 128);
//         doc.text(orderData.delivery_info.city, 20, 134);
//         doc.text(orderData.customer_info.phone, 20, 140);
//         doc.text(orderData.customer_info.email, 20, 146);
        
//         // Table header
//         doc.setFillColor(245, 245, 245);
//         doc.rect(20, 160, 170, 10, 'F');
//         doc.setTextColor(26, 26, 26);
//         doc.setFont(undefined, 'bold');
//         doc.setFontSize(9);
//         doc.text('PRODUCT', 25, 166);
//         doc.text('TYPE', 85, 166);
//         doc.text('UNIT PRICE', 115, 166);
//         doc.text('QTY', 150, 166);
//         doc.text('TOTAL', 170, 166);
        
//         // Table content
//         doc.setFont(undefined, 'normal');
//         let yPosition = 176;
        
//         orderData.order_summary.items.forEach((item, index) => {
//             if (index % 2 === 0) {
//                 doc.setFillColor(250, 250, 250);
//                 doc.rect(20, yPosition - 5, 170, 8, 'F');
//             }
            
//             doc.setTextColor(60, 60, 60);
//             const productName = item.product_name.length > 25 
//                 ? item.product_name.substring(0, 25) + '...' 
//                 : item.product_name;
//             doc.text(productName, 25, yPosition);
            
//             const typeText = item.product_type === 'sales_product' ? 'Sale' : 'Regular';
//             const typeColor = item.product_type === 'sales_product' ? [220, 38, 38] : [60, 60, 60];
//             doc.setTextColor(...typeColor);
//             doc.text(typeText, 85, yPosition);
            
//             doc.setTextColor(60, 60, 60);
//             doc.text(`PKR ${item.unit_price.toLocaleString()}`, 115, yPosition);
//             doc.text(`${item.quantity}`, 150, yPosition);
//             doc.text(`PKR ${item.total_price.toLocaleString()}`, 170, yPosition);
//             yPosition += 10;
//         });
        
//         // Totals section
//         yPosition += 10;
//         doc.setDrawColor(220, 220, 220);
//         doc.line(20, yPosition, 190, yPosition);
//         yPosition += 10;
        
//         doc.setFont(undefined, 'normal');
//         doc.setTextColor(100, 100, 100);
//         doc.text('Subtotal:', 140, yPosition);
//         doc.setTextColor(26, 26, 26);
//         doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 170, yPosition);
        
//         yPosition += 8;
//         doc.setTextColor(100, 100, 100);
//         doc.text('Shipping:', 140, yPosition);
//         doc.setTextColor(34, 197, 94);
//         doc.text('FREE', 170, yPosition);
        
//         yPosition += 8;
//         doc.setTextColor(100, 100, 100);
//         doc.text('Tax:', 140, yPosition);
//         doc.setTextColor(26, 26, 26);
//         doc.text('PKR 0', 170, yPosition);
        
//         // Grand total
//         yPosition += 12;
//         doc.setFillColor(26, 26, 26);
//         doc.rect(130, yPosition - 5, 60, 12, 'F');
//         doc.setFont(undefined, 'bold');
//         doc.setFontSize(11);
//         doc.setTextColor(255, 255, 255);
//         doc.text('TOTAL:', 135, yPosition + 2);
//         doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 165, yPosition + 2);
        
//         // Footer
//         doc.setFontSize(8);
//         doc.setTextColor(100, 100, 100);
//         doc.setFont(undefined, 'italic');
//         doc.text('Thank you for choosing GOHAR COLLECTION', 105, 270, { align: 'center' });
//         doc.setFont(undefined, 'normal');
//         doc.text('Terms & Conditions: Payment due within 15 days. All sales are final.', 105, 276, { align: 'center' });
//         doc.text('GOHAR COLLECTION | Sector D, DHA 2, Islamabad | contact@goharcollection.com', 105, 282, { align: 'center' });
        
//         // Border
//         doc.setDrawColor(26, 26, 26);
//         doc.setLineWidth(0.5);
//         doc.rect(10, 10, 190, 277);
        
//         doc.save(`invoice-${orderData.order_id}.pdf`);
//     };

//     const prepareOrderDataForConfirmation = (responseData) => {
//         return {
//             order_id: responseData.order_id,
//             customer_info: {
//                 name: form.customer_name,
//                 email: form.customer_email,
//                 phone: form.customer_phone
//             },
//             delivery_info: {
//                 address: form.delivery_address,
//                 city: form.city,
//                 estimated_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
//             },
//             payment_method: form.payment_method,
//             payment_status: true,
//             status: 'Confirmed',
//             order_summary: {
//                 items: cartItems.map(item => ({
//                     product_name: item.name,
//                     product_type: item.isSalesProduct ? 'sales_product' : 'product',
//                     unit_price: getUnitPrice(item),
//                     quantity: item.quantity || 1,
//                     total_price: getUnitPrice(item) * (item.quantity || 1),
//                     image_url: getMainImage(item)
//                 })),
//                 subtotal: getTotalPrice(),
//                 total: getTotalPrice()
//             }
//         };
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (cartItems.length === 0) {
//             toast.error('Your cart is empty');
//             return;
//         }

//         setIsLoading(true);

//         try {
//             const items = cartItems.map(item => ({
//                 product_type: item.isSalesProduct ? 'sales_product' : 'product',
//                 product_id: item.id,
//                 quantity: item.quantity || 1
//             }));

//             const orderData = {
//                 customer_name: form.customer_name,
//                 customer_email: form.customer_email,
//                 customer_phone: form.customer_phone,
//                 delivery_address: form.delivery_address,
//                 city: form.city,
//                 payment_method: form.payment_method,
//                 items: items
//             };

//             const response = await AxiosInstance.post('/api/myapp/v1/public/order/', orderData, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
//                 }
//             });

//             const orderResponse = response.data.data;
//             generateInvoice(orderResponse);
//             clearCart();

//             const confirmationData = prepareOrderDataForConfirmation(orderResponse);
//             localStorage.setItem('latestOrder', JSON.stringify(confirmationData));

//             toast.success('Order placed successfully!', {
//                 position: "top-center",
//                 autoClose: 3000,
//                 hideProgressBar: false,
//                 closeOnClick: true,
//                 pauseOnHover: true,
//                 draggable: true,
//                 progress: undefined,
//                 theme: "light",
//                 onClose: () => {
//                     router.push('/orderconfirmation');
//                 }
//             });

//         } catch (error) {
//             let errorMsg = 'Failed to place order';

//             if (error.response) {
//                 if (error.response.status === 400) {
//                     errorMsg = error.response.data.message || 'Validation error';
//                 } else if (error.response.status === 401) {
//                     errorMsg = 'Please login to place an order';
//                 } else if (error.response.status === 403) {
//                     errorMsg = 'You do not have permission to perform this action';
//                 } else {
//                     errorMsg = error.response.data.message || `Server error: ${error.response.status}`;
//                 }
//             } else if (error.request) {
//                 errorMsg = 'No response from server - please try again';
//             } else {
//                 errorMsg = error.message || 'Unknown error occurred';
//             }

//             toast.error(errorMsg);
//             console.error('Checkout error:', error);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleContinueShopping = () => {
//         router.push('/publicproducts');
//     };

//     const isSalesProduct = (item) => {
//         return (
//             item.productType === 'sales_product' || 
//             item.productType === 'sale' || 
//             item.type === 'sales_product' || 
//             item.type === 'sale' ||
//             item.isSalesProduct === true ||
//             (item.final_price !== undefined && item.original_price !== undefined && parseFloat(item.final_price) < parseFloat(item.original_price)) ||
//             (item.discount_percent && item.discount_percent > 0)
//         );
//     };

//     const renderCartSummary = (items, title, bgColor = 'bg-gray-50') => {
//         if (items.length === 0) return null;

//         const isSale = title.includes('Sale');

//         return (
//             <div className={`mb-6 ${bgColor} rounded-xl p-4`}>
//                 <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-2">
//                         {isSale && <FaTag className="text-red-500 w-4 h-4" />}
//                         <h4 className="text-sm font-semibold text-gray-900">
//                             {title}
//                         </h4>
//                         <span className="text-xs text-gray-500">
//                             ({items.length} {items.length === 1 ? 'item' : 'items'})
//                         </span>
//                     </div>
//                 </div>
//                 <div className="space-y-4">
//                     {items.map((item) => {
//                         const unitPrice = getUnitPrice(item);
//                         const isOnSale = isSalesProduct(item);
//                         const uniqueKey = `${item.isSalesProduct ? 'sales' : 'product'}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;

//                         return (
//                             <div key={uniqueKey} className="flex items-start space-x-4 bg-white rounded-lg p-3">
//                                 <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
//                                     <img
//                                         src={getMainImage(item)}
//                                         alt={item.name}
//                                         className="h-full w-full object-cover"
//                                         onError={(e) => {
//                                             console.error('Image failed to load:', getMainImage(item));
//                                             e.target.onerror = null;
//                                             e.target.src = '/images/default-product.jpg';
//                                         }}
//                                     />
//                                     {isOnSale && (
//                                         <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
//                                             {item.discount_percent ? `${item.discount_percent}%` : 'SALE'}
//                                         </div>
//                                     )}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                     <h5 className="text-sm font-medium text-gray-900 truncate">{item.name}</h5>
//                                     <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
//                                         <span>Qty: {item.quantity || 1}</span>
//                                         {item.color && (
//                                             <>
//                                                 <span>•</span>
//                                                 <span>{item.color}</span>
//                                             </>
//                                         )}
//                                         {item.size && (
//                                             <>
//                                                 <span>•</span>
//                                                 <span>{item.size}</span>
//                                             </>
//                                         )}
//                                     </div>
//                                     <div className="mt-2">
//                                         {isOnSale && item.original_price && parseFloat(item.original_price) > unitPrice ? (
//                                             <div className="flex items-center space-x-2">
//                                                 <span className="text-xs text-gray-400 line-through">
//                                                     PKR {parseFloat(item.original_price).toLocaleString()}
//                                                 </span>
//                                                 <span className="text-sm font-bold text-red-600">
//                                                     PKR {unitPrice.toLocaleString()}
//                                                 </span>
//                                             </div>
//                                         ) : (
//                                             <span className="text-sm font-medium text-gray-900">
//                                                 PKR {unitPrice.toLocaleString()}
//                                             </span>
//                                         )}
//                                     </div>
//                                 </div>
//                                 <div className="text-right">
//                                     <p className="text-sm font-bold text-gray-900">
//                                         PKR {(unitPrice * (item.quantity || 1)).toLocaleString()}
//                                     </p>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         );
//     };

//     const totalSavings = calculateTotalSavings();

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
//             <ToastContainer 
//                 position="top-center"
//                 autoClose={3000}
//                 hideProgressBar={false}
//                 newestOnTop={false}
//                 closeOnClick
//                 rtl={false}
//                 pauseOnFocusLoss
//                 draggable
//                 pauseOnHover
//                 theme="light"
//             />
            
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {/* Back Button */}
//                 <button 
//                     onClick={() => router.back()}
//                     className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-8 group"
//                 >
//                     <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
//                     <span className="font-medium">Back to Cart</span>
//                 </button>

//                 {/* Header */}
//                 <div className="text-center mb-12">
//                     <h1 className="text-5xl font-serif font-light tracking-tight text-gray-900 mb-3">
//                         Secure Checkout
//                     </h1>
//                     <div className="flex items-center justify-center space-x-2 text-gray-600">
//                         <FaLock className="text-green-600" />
//                         <p className="text-sm">Your information is secure and encrypted</p>
//                     </div>
//                 </div>

//                 {/* Progress Steps */}
//                 <div className="max-w-3xl mx-auto mb-12">
//                     <div className="flex items-center justify-between">
//                         {[
//                             { num: 1, label: 'Cart', icon: BiPackage },
//                             { num: 2, label: 'Checkout', icon: FaLock },
//                             { num: 3, label: 'Complete', icon: FaCheckCircle }
//                         ].map((step, index) => (
//                             <React.Fragment key={step.num}>
//                                 <div className="flex flex-col items-center">
//                                     <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                                         step.num === 2 
//                                             ? 'bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg' 
//                                             : step.num < 2 
//                                             ? 'bg-green-500 text-white' 
//                                             : 'bg-gray-200 text-gray-400'
//                                     } transition-all duration-300`}>
//                                         <step.icon className="w-5 h-5" />
//                                     </div>
//                                     <span className={`text-xs mt-2 font-medium ${
//                                         step.num === 2 ? 'text-gray-900' : 'text-gray-500'
//                                     }`}>
//                                         {step.label}
//                                     </span>
//                                 </div>
//                                 {index < 2 && (
//                                     <div className={`flex-1 h-1 mx-4 rounded-full ${
//                                         step.num < 2 ? 'bg-green-500' : 'bg-gray-200'
//                                     }`} />
//                                 )}
//                             </React.Fragment>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     {/* Checkout Form */}
//                     <div className="lg:col-span-2">
//                         <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
//                             <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
//                                 <div className="flex items-center space-x-3">
//                                     <FaShieldAlt className="text-green-400 w-6 h-6" />
//                                     <div>
//                                         <h2 className="text-2xl font-serif font-light">Checkout Details</h2>
//                                         <p className="text-sm text-gray-300">All fields are required</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             <form onSubmit={handleSubmit} className="p-8">
//                                 {/* Shipping Information */}
//                                 <div className="mb-10">
//                                     <div className="flex items-center space-x-2 mb-6">
//                                         <FaTruck className="text-gray-700 w-5 h-5" />
//                                         <h3 className="text-xl font-serif font-medium text-gray-900">
//                                             Shipping Information
//                                         </h3>
//                                     </div>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         <div className="md:col-span-2">
//                                             <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
//                                                 Full Name *
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 id="customer_name"
//                                                 name="customer_name"
//                                                 value={form.customer_name}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
//                                                 placeholder="Enter your full name"
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-2">
//                                                 Email Address *
//                                             </label>
//                                             <input
//                                                 type="email"
//                                                 id="customer_email"
//                                                 name="customer_email"
//                                                 value={form.customer_email}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
//                                                 placeholder="your@email.com"
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
//                                                 Phone Number *
//                                             </label>
//                                             <input
//                                                 type="tel"
//                                                 id="customer_phone"
//                                                 name="customer_phone"
//                                                 value={form.customer_phone}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
//                                                 placeholder="+92 300 1234567"
//                                                 required
//                                             />
//                                         </div>
//                                         <div className="md:col-span-2">
//                                             <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 mb-2">
//                                                 Delivery Address *
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 id="delivery_address"
//                                                 name="delivery_address"
//                                                 value={form.delivery_address}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
//                                                 placeholder="House/Street, Area"
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
//                                                 City *
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 id="city"
//                                                 name="city"
//                                                 value={form.city}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
//                                                 placeholder="Islamabad"
//                                                 required
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Payment Method */}
//                                 <div className="mb-10">
//                                     <div className="flex items-center space-x-2 mb-6">
//                                         <FaLock className="text-gray-700 w-5 h-5" />
//                                         <h3 className="text-xl font-serif font-medium text-gray-900">
//                                             Payment Method
//                                         </h3>
//                                     </div>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         {[
//                                             { value: 'credit_card', label: 'Credit Card', icons: [FaCcVisa, FaCcMastercard] },
//                                             { value: 'debit_card', label: 'Debit Card', icons: [] },
//                                             { value: 'paypal', label: 'PayPal', icons: [FaCcPaypal] },
//                                             { value: 'cash_on_delivery', label: 'Cash on Delivery', icons: [] }
//                                         ].map((method) => (
//                                             <label
//                                                 key={method.value}
//                                                 className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
//                                                     form.payment_method === method.value
//                                                         ? 'border-gray-900 bg-gray-50 shadow-md'
//                                                         : 'border-gray-200 hover:border-gray-300'
//                                                 }`}
//                                             >
//                                                 <input
//                                                     type="radio"
//                                                     name="payment_method"
//                                                     value={method.value}
//                                                     checked={form.payment_method === method.value}
//                                                     onChange={handleChange}
//                                                     className="w-5 h-5 text-gray-900 focus:ring-gray-900"
//                                                 />
//                                                 <span className="ml-3 text-sm font-medium text-gray-900 flex-1">
//                                                     {method.label}
//                                                 </span>
//                                                 <div className="flex space-x-1">
//                                                     {method.icons.map((Icon, idx) => (
//                                                         <Icon key={idx} className="w-8 h-8 text-gray-600" />
//                                                     ))}
//                                                 </div>
//                                             </label>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {/* Submit Button */}
//                                 <button
//                                     type="submit"
//                                     disabled={isLoading}
//                                     className={`w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
//                                         isLoading ? 'opacity-70 cursor-not-allowed' : ''
//                                     }`}
//                                 >
//                                     {isLoading ? (
//                                         <span className="flex items-center justify-center">
//                                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                             </svg>
//                                             Processing Order...
//                                         </span>
//                                     ) : (
//                                         <span className="flex items-center justify-center">
//                                             <FaCheckCircle className="mr-2" />
//                                             Complete Order
//                                         </span>
//                                     )}
//                                 </button>

//                                 {/* Trust Badges */}
//                                 <div className="mt-6 pt-6 border-t border-gray-100">
//                                     <div className="grid grid-cols-3 gap-4 text-center">
//                                         <div className="flex flex-col items-center">
//                                             <FaShieldAlt className="text-green-600 w-6 h-6 mb-2" />
//                                             <span className="text-xs text-gray-600">Secure Payment</span>
//                                         </div>
//                                         <div className="flex flex-col items-center">
//                                             <FaTruck className="text-blue-600 w-6 h-6 mb-2" />
//                                             <span className="text-xs text-gray-600">Free Delivery</span>
//                                         </div>
//                                         <div className="flex flex-col items-center">
//                                             <FaCheckCircle className="text-purple-600 w-6 h-6 mb-2" />
//                                             <span className="text-xs text-gray-600">Easy Returns</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>

//                     {/* Order Summary - Sticky Sidebar */}
//                     <div className="lg:col-span-1">
//                         <div className="sticky top-6">
//                             <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
//                                 <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
//                                     <h2 className="text-2xl font-serif font-light">Order Summary</h2>
//                                     <p className="text-sm text-gray-300 mt-1">
//                                         {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
//                                     </p>
//                                 </div>
                                
//                                 <div className="p-6">
//                                     {cartItems.length > 0 ? (
//                                         <>
//                                             {/* Sales Products - Show first */}
//                                             {renderCartSummary(salesProducts, "Sale Items", "bg-red-50")}
                                            
//                                             {/* Regular Products */}
//                                             {renderCartSummary(regularProducts, "Regular Items", "bg-gray-50")}

//                                             {/* Order Totals */}
//                                             <div className="space-y-3 pt-4 border-t border-gray-200">
//                                                 {regularProducts.length > 0 && salesProducts.length > 0 && (
//                                                     <>
//                                                         <div className="flex justify-between text-sm">
//                                                             <span className="text-gray-600">Regular Subtotal</span>
//                                                             <span className="font-medium text-gray-900">
//                                                                 PKR {regularProducts.reduce((total, item) => {
//                                                                     return total + (getUnitPrice(item) * item.quantity);
//                                                                 }, 0).toLocaleString()}
//                                                             </span>
//                                                         </div>
//                                                         <div className="flex justify-between text-sm">
//                                                             <span className="text-gray-600">Sale Subtotal</span>
//                                                             <span className="font-medium text-gray-900">
//                                                                 PKR {salesProducts.reduce((total, item) => {
//                                                                     return total + (getUnitPrice(item) * item.quantity);
//                                                                 }, 0).toLocaleString()}
//                                                             </span>
//                                                         </div>
//                                                     </>
//                                                 )}
                                                
//                                                 <div className="flex justify-between">
//                                                     <span className="text-gray-900">Subtotal</span>
//                                                     <span className="font-medium text-gray-900">
//                                                         PKR {getTotalPrice().toLocaleString()}
//                                                     </span>
//                                                 </div>

//                                                 {totalSavings > 0 && (
//                                                     <div className="flex justify-between bg-green-50 -mx-6 px-6 py-2 rounded-lg">
//                                                         <span className="text-green-700 font-medium flex items-center">
//                                                             <FaTag className="mr-2" />
//                                                             Total Savings
//                                                         </span>
//                                                         <span className="font-bold text-green-700">
//                                                             - PKR {totalSavings.toLocaleString()}
//                                                         </span>
//                                                     </div>
//                                                 )}

//                                                 <div className="flex justify-between">
//                                                     <span className="text-gray-900">Shipping</span>
//                                                     <span className="font-medium text-green-600">FREE</span>
//                                                 </div>
//                                                 <div className="flex justify-between">
//                                                     <span className="text-gray-900">Tax</span>
//                                                     <span className="font-medium text-gray-900">PKR 0</span>
//                                                 </div>
//                                             </div>

//                                             {/* Grand Total */}
//                                             <div className="flex justify-between pt-4 mt-4 border-t-2 border-gray-900">
//                                                 <span className="text-xl font-serif font-medium text-gray-900">Total</span>
//                                                 <span className="text-2xl font-serif font-bold text-gray-900">
//                                                     PKR {getTotalPrice().toLocaleString()}
//                                                 </span>
//                                             </div>
//                                         </>
//                                     ) : (
//                                         <p className="text-center py-8 text-gray-500">Your cart is empty</p>
//                                     )}

//                                     <button
//                                         onClick={handleContinueShopping}
//                                         className="w-full bg-white text-gray-900 py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 mt-6 font-medium"
//                                     >
//                                         Continue Shopping
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Checkout;









// 'use client';
// import React, { useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { CartContext } from "@/components/CartContext";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import jsPDF from 'jspdf';
// import { FaLock, FaArrowLeft, FaCcVisa, FaCcMastercard, FaCcPaypal, FaShieldAlt, FaTruck, FaCheckCircle, FaTag } from 'react-icons/fa';
// import { BiPackage } from 'react-icons/bi';

// const Checkout = () => {
//     const { cartItems, clearCart, getRegularProducts, getSalesProducts } = useContext(CartContext);
//     const router = useRouter();
//     const [isLoading, setIsLoading] = useState(false);
//     const [activeStep, setActiveStep] = useState(1);
//     const [form, setForm] = useState({
//         customer_name: '',
//         customer_email: '',
//         customer_phone: '',
//         delivery_address: '',
//         city: '',
//         payment_method: 'credit_card',
//     });

//     const regularProducts = getRegularProducts();
//     const salesProducts = getSalesProducts();

//     // Improved image URL processing that matches the cart page
//     const processImageUrl = (url) => {
//         if (!url || url.trim() === '') {
//             return '/images/default-product.jpg';
//         }
        
//         if (url.startsWith('http://') || url.startsWith('https://')) {
//             return url;
//         }
        
//         const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
//         const cleanUrl = url.startsWith('/') ? url : `/${url}`;
//         return `${baseURL}${cleanUrl}`;
//     };

//     const getMainImage = (item) => {
//         // Try multiple image sources in order of priority
//         if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
//             return processImageUrl(item.image_urls[0]);
//         }
//         if (item.image_urls && typeof item.image_urls === 'string') {
//             return processImageUrl(item.image_urls);
//         }
//         if (item.image) {
//             return processImageUrl(item.image);
//         }
//         if (item.mainImage) {
//             return processImageUrl(item.mainImage);
//         }
//         return '/images/default-product.jpg';
//     };

//     useEffect(() => {
//         const userData = JSON.parse(localStorage.getItem('user'));
//         if (userData) {
//             setForm(prev => ({
//                 ...prev,
//                 customer_name: userData.name || '',
//                 customer_email: userData.email || '',
//                 customer_phone: userData.phone || ''
//             }));
//         }
//     }, []);

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setForm({
//             ...form,
//             [name]: type === 'checkbox' ? checked : value
//         });
//     };

//     const getUnitPrice = (item) => {
//         return item.final_price !== undefined ? Number(item.final_price) : Number(item.price) || 0;
//     };

//     const getTotalPrice = () => {
//         return cartItems.reduce((total, item) => {
//             return total + (getUnitPrice(item) * (item.quantity || 1));
//         }, 0);
//     };

//     const calculateTotalSavings = () => {
//         return cartItems.reduce((savings, item) => {
//             if (item.original_price && item.final_price && parseFloat(item.original_price) > parseFloat(item.final_price)) {
//                 return savings + ((parseFloat(item.original_price) - parseFloat(item.final_price)) * item.quantity);
//             }
//             return savings;
//         }, 0);
//     };

//     const generateInvoice = (orderData) => {
//         try {
//             const doc = new jsPDF();
            
//             doc.setProperties({
//                 title: `Invoice #${orderData.order_id}`,
//                 subject: 'Invoice from GOHAR COLLECTION',
//                 author: 'GOHAR COLLECTION',
//             });

//             // Header with gradient effect
//             doc.setFillColor(26, 26, 26);
//             doc.rect(0, 0, 210, 35, 'F');
//             doc.setTextColor(255, 255, 255);
//             doc.setFontSize(24);
//             doc.setFont(undefined, 'bold');
//             doc.text('GOHAR COLLECTION', 105, 18, { align: 'center' });
//             doc.setFontSize(10);
//             doc.setFont(undefined, 'normal');
//             doc.text('Premium Luxury Products', 105, 26, { align: 'center' });
            
//             // Invoice details
//             doc.setFontSize(14);
//             doc.setTextColor(26, 26, 26);
//             doc.setFont(undefined, 'bold');
//             doc.text('INVOICE', 20, 50);
//             doc.setFont(undefined, 'normal');
//             doc.setFontSize(10);
//             doc.setTextColor(100, 100, 100);
//             doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 50);
//             doc.text(`Invoice #: ${orderData.order_id}`, 160, 56);
//             doc.text(`Status: ${orderData.status}`, 160, 62);
            
//             // From section
//             doc.setFontSize(10);
//             doc.setTextColor(100, 100, 100);
//             doc.text('FROM:', 20, 75);
//             doc.setFont(undefined, 'bold');
//             doc.setTextColor(26, 26, 26);
//             doc.text('GOHAR COLLECTION', 20, 82);
//             doc.setFont(undefined, 'normal');
//             doc.setTextColor(100, 100, 100);
//             doc.text('Sector D, DHA 2, Islamabad', 20, 88);
//             doc.text('Pakistan', 20, 94);
//             doc.text('contact@goharcollection.com', 20, 100);
            
//             // To section
//             doc.setTextColor(100, 100, 100);
//             doc.text('TO:', 20, 115);
//             doc.setFont(undefined, 'bold');
//             doc.setTextColor(26, 26, 26);
//             doc.text(orderData.customer_info.name, 20, 122);
//             doc.setFont(undefined, 'normal');
//             doc.setTextColor(100, 100, 100);
//             doc.text(orderData.delivery_info.address, 20, 128);
//             doc.text(orderData.delivery_info.city, 20, 134);
//             doc.text(orderData.customer_info.phone, 20, 140);
//             doc.text(orderData.customer_info.email, 20, 146);
            
//             // Table header
//             doc.setFillColor(245, 245, 245);
//             doc.rect(20, 160, 170, 10, 'F');
//             doc.setTextColor(26, 26, 26);
//             doc.setFont(undefined, 'bold');
//             doc.setFontSize(9);
//             doc.text('PRODUCT', 25, 166);
//             doc.text('TYPE', 85, 166);
//             doc.text('UNIT PRICE', 115, 166);
//             doc.text('QTY', 150, 166);
//             doc.text('TOTAL', 170, 166);
            
//             // Table content
//             doc.setFont(undefined, 'normal');
//             let yPosition = 176;
            
//             orderData.order_summary.items.forEach((item, index) => {
//                 if (index % 2 === 0) {
//                     doc.setFillColor(250, 250, 250);
//                     doc.rect(20, yPosition - 5, 170, 8, 'F');
//                 }
                
//                 doc.setTextColor(60, 60, 60);
//                 const productName = item.product_name.length > 25 
//                     ? item.product_name.substring(0, 25) + '...' 
//                     : item.product_name;
//                 doc.text(productName, 25, yPosition);
                
//                 const typeText = item.product_type === 'sales_product' ? 'Sale' : 'Regular';
//                 const typeColor = item.product_type === 'sales_product' ? [220, 38, 38] : [60, 60, 60];
//                 doc.setTextColor(...typeColor);
//                 doc.text(typeText, 85, yPosition);
                
//                 doc.setTextColor(60, 60, 60);
//                 doc.text(`PKR ${item.unit_price.toLocaleString()}`, 115, yPosition);
//                 doc.text(`${item.quantity}`, 150, yPosition);
//                 doc.text(`PKR ${item.total_price.toLocaleString()}`, 170, yPosition);
//                 yPosition += 10;
//             });
            
//             // Totals section
//             yPosition += 10;
//             doc.setDrawColor(220, 220, 220);
//             doc.line(20, yPosition, 190, yPosition);
//             yPosition += 10;
            
//             doc.setFont(undefined, 'normal');
//             doc.setTextColor(100, 100, 100);
//             doc.text('Subtotal:', 140, yPosition);
//             doc.setTextColor(26, 26, 26);
//             doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 170, yPosition);
            
//             yPosition += 8;
//             doc.setTextColor(100, 100, 100);
//             doc.text('Shipping:', 140, yPosition);
//             doc.setTextColor(34, 197, 94);
//             doc.text('FREE', 170, yPosition);
            
//             yPosition += 8;
//             doc.setTextColor(100, 100, 100);
//             doc.text('Tax:', 140, yPosition);
//             doc.setTextColor(26, 26, 26);
//             doc.text('PKR 0', 170, yPosition);
            
//             // Grand total
//             yPosition += 12;
//             doc.setFillColor(26, 26, 26);
//             doc.rect(130, yPosition - 5, 60, 12, 'F');
//             doc.setFont(undefined, 'bold');
//             doc.setFontSize(11);
//             doc.setTextColor(255, 255, 255);
//             doc.text('TOTAL:', 135, yPosition + 2);
//             doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 165, yPosition + 2);
            
//             // Footer
//             doc.setFontSize(8);
//             doc.setTextColor(100, 100, 100);
//             doc.setFont(undefined, 'italic');
//             doc.text('Thank you for choosing GOHAR COLLECTION', 105, 270, { align: 'center' });
//             doc.setFont(undefined, 'normal');
//             doc.text('Terms & Conditions: Payment due within 15 days. All sales are final.', 105, 276, { align: 'center' });
//             doc.text('GOHAR COLLECTION | Sector D, DHA 2, Islamabad | contact@goharcollection.com', 105, 282, { align: 'center' });
            
//             // Border
//             doc.setDrawColor(26, 26, 26);
//             doc.setLineWidth(0.5);
//             doc.rect(10, 10, 190, 277);
            
//             doc.save(`invoice-${orderData.order_id}.pdf`);
//         } catch (error) {
//             console.error('Error generating invoice:', error);
//             toast.error('Failed to generate invoice, but order was placed successfully');
//         }
//     };

//     const prepareOrderDataForConfirmation = (apiResponse) => {
//         // Handle different possible response structures
//         let orderId, status;
        
//         // Try to extract order_id from different possible locations
//         if (apiResponse.order_id) {
//             orderId = apiResponse.order_id;
//         } else if (apiResponse.id) {
//             orderId = apiResponse.id;
//         } else if (apiResponse.order && apiResponse.order.id) {
//             orderId = apiResponse.order.id;
//         } else {
//             orderId = Date.now(); // Fallback to timestamp
//         }

//         // Try to extract status
//         status = apiResponse.status || apiResponse.order_status || 'Confirmed';

//         return {
//             order_id: orderId,
//             customer_info: {
//                 name: form.customer_name,
//                 email: form.customer_email,
//                 phone: form.customer_phone
//             },
//             delivery_info: {
//                 address: form.delivery_address,
//                 city: form.city,
//                 estimated_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
//             },
//             payment_method: form.payment_method,
//             payment_status: true,
//             status: status,
//             order_summary: {
//                 items: cartItems.map(item => ({
//                     product_name: item.name,
//                     product_type: item.isSalesProduct ? 'sales_product' : 'product',
//                     unit_price: getUnitPrice(item),
//                     quantity: item.quantity || 1,
//                     total_price: getUnitPrice(item) * (item.quantity || 1),
//                     image_url: getMainImage(item)
//                 })),
//                 subtotal: getTotalPrice(),
//                 total: getTotalPrice()
//             }
//         };
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (cartItems.length === 0) {
//             toast.error('Your cart is empty');
//             return;
//         }

//         setIsLoading(true);

//         try {
//             const items = cartItems.map(item => ({
//                 product_type: item.isSalesProduct ? 'sales_product' : 'product',
//                 product_id: item.id,
//                 quantity: item.quantity || 1
//             }));

//             const orderData = {
//                 customer_name: form.customer_name,
//                 customer_email: form.customer_email,
//                 customer_phone: form.customer_phone,
//                 delivery_address: form.delivery_address,
//                 city: form.city,
//                 payment_method: form.payment_method,
//                 items: items
//             };

//             console.log('Sending order data:', orderData);

//             const response = await AxiosInstance.post('/api/myapp/v1/public/order/', orderData, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
//                 }
//             });

//             console.log('Full API Response:', response);
//             console.log('Response data:', response.data);

//             // Handle different response structures
//             let orderResponse;
//             if (response.data && response.data.data) {
//                 // Structure: { data: { data: {...} } }
//                 orderResponse = response.data.data;
//             } else if (response.data) {
//                 // Structure: { data: {...} }
//                 orderResponse = response.data;
//             } else {
//                 // Fallback
//                 orderResponse = response;
//             }

//             console.log('Processed order response:', orderResponse);

//             // Prepare confirmation data with error handling
//             const confirmationData = prepareOrderDataForConfirmation(orderResponse);
//             console.log('Confirmation data:', confirmationData);

//             // Generate invoice
//             generateInvoice(confirmationData);
            
//             // Clear cart and save order
//             clearCart();
//             localStorage.setItem('latestOrder', JSON.stringify(confirmationData));

//             // Show success message and redirect
//             toast.success('Order placed successfully!', {
//                 position: "top-center",
//                 autoClose: 2000,
//                 hideProgressBar: false,
//                 closeOnClick: true,
//                 pauseOnHover: true,
//                 draggable: true,
//                 theme: "light",
//             });

//             // Wait a bit before redirecting
//             setTimeout(() => {
//                 router.push('/orderconfirmation');
//             }, 2000);

//         } catch (error) {
//             console.error('Full error object:', error);
//             console.error('Error response:', error.response);
            
//             let errorMsg = 'Failed to place order';

//             if (error.response) {
//                 console.error('Error response data:', error.response.data);
//                 console.error('Error response status:', error.response.status);
                
//                 if (error.response.status === 400) {
//                     const errorData = error.response.data;
//                     if (errorData.message) {
//                         errorMsg = errorData.message;
//                     } else if (errorData.error) {
//                         errorMsg = errorData.error;
//                     } else if (errorData.detail) {
//                         errorMsg = errorData.detail;
//                     } else {
//                         errorMsg = 'Validation error - please check your input';
//                     }
//                 } else if (error.response.status === 401) {
//                     errorMsg = 'Please login to place an order';
//                 } else if (error.response.status === 403) {
//                     errorMsg = 'You do not have permission to perform this action';
//                 } else if (error.response.status === 500) {
//                     errorMsg = 'Server error - please try again later';
//                 } else {
//                     errorMsg = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
//                 }
//             } else if (error.request) {
//                 console.error('Error request:', error.request);
//                 errorMsg = 'No response from server - please check your connection';
//             } else {
//                 console.error('Error message:', error.message);
//                 errorMsg = error.message || 'Unknown error occurred';
//             }

//             toast.error(errorMsg, {
//                 position: "top-center",
//                 autoClose: 5000,
//             });
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleContinueShopping = () => {
//         router.push('/publicproducts');
//     };

//     const isSalesProduct = (item) => {
//         return (
//             item.productType === 'sales_product' || 
//             item.productType === 'sale' || 
//             item.type === 'sales_product' || 
//             item.type === 'sale' ||
//             item.isSalesProduct === true ||
//             (item.final_price !== undefined && item.original_price !== undefined && parseFloat(item.final_price) < parseFloat(item.original_price)) ||
//             (item.discount_percent && item.discount_percent > 0)
//         );
//     };

//     const renderCartSummary = (items, title, bgColor = 'bg-gray-50') => {
//         if (items.length === 0) return null;

//         const isSale = title.includes('Sale');

//         return (
//             <div className={`mb-6 ${bgColor} rounded-xl p-4`}>
//                 <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-2">
//                         {isSale && <FaTag className="text-red-500 w-4 h-4" />}
//                         <h4 className="text-sm font-semibold text-gray-900">
//                             {title}
//                         </h4>
//                         <span className="text-xs text-gray-500">
//                             ({items.length} {items.length === 1 ? 'item' : 'items'})
//                         </span>
//                     </div>
//                 </div>
//                 <div className="space-y-4">
//                     {items.map((item) => {
//                         const unitPrice = getUnitPrice(item);
//                         const isOnSale = isSalesProduct(item);
//                         const uniqueKey = `${item.isSalesProduct ? 'sales' : 'product'}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;

//                         return (
//                             <div key={uniqueKey} className="flex items-start space-x-4 bg-white rounded-lg p-3">
//                                 <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
//                                     <img
//                                         src={getMainImage(item)}
//                                         alt={item.name}
//                                         className="h-full w-full object-cover"
//                                         onError={(e) => {
//                                             console.error('Image failed to load:', getMainImage(item));
//                                             e.target.onerror = null;
//                                             e.target.src = '/images/default-product.jpg';
//                                         }}
//                                     />
//                                     {isOnSale && (
//                                         <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
//                                             {item.discount_percent ? `${item.discount_percent}%` : 'SALE'}
//                                         </div>
//                                     )}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                     <h5 className="text-sm font-medium text-gray-900 truncate">{item.name}</h5>
//                                     <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
//                                         <span>Qty: {item.quantity || 1}</span>
//                                         {item.color && (
//                                             <>
//                                                 <span>•</span>
//                                                 <span>{item.color}</span>
//                                             </>
//                                         )}
//                                         {item.size && (
//                                             <>
//                                                 <span>•</span>
//                                                 <span>{item.size}</span>
//                                             </>
//                                         )}
//                                     </div>
//                                     <div className="mt-2">
//                                         {isOnSale && item.original_price && parseFloat(item.original_price) > unitPrice ? (
//                                             <div className="flex items-center space-x-2">
//                                                 <span className="text-xs text-gray-400 line-through">
//                                                     PKR {parseFloat(item.original_price).toLocaleString()}
//                                                 </span>
//                                                 <span className="text-sm font-bold text-red-600">
//                                                     PKR {unitPrice.toLocaleString()}
//                                                 </span>
//                                             </div>
//                                         ) : (
//                                             <span className="text-sm font-medium text-gray-900">
//                                                 PKR {unitPrice.toLocaleString()}
//                                             </span>
//                                         )}
//                                     </div>
//                                 </div>
//                                 <div className="text-right">
//                                     <p className="text-sm font-bold text-gray-900">
//                                         PKR {(unitPrice * (item.quantity || 1)).toLocaleString()}
//                                     </p>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         );
//     };

//     const totalSavings = calculateTotalSavings();

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
//             <ToastContainer 
//                 position="top-center"
//                 autoClose={3000}
//                 hideProgressBar={false}
//                 newestOnTop={false}
//                 closeOnClick
//                 rtl={false}
//                 pauseOnFocusLoss
//                 draggable
//                 pauseOnHover
//                 theme="light"
//             />
            
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {/* Back Button */}
//                 <button 
//                     onClick={() => router.back()}
//                     className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-8 group"
//                 >
//                     <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
//                     <span className="font-medium">Back to Cart</span>
//                 </button>

//                 {/* Header */}
//                 <div className="text-center mb-12">
//                     <h1 className="text-5xl font-serif font-light tracking-tight text-gray-900 mb-3">
//                         Secure Checkout
//                     </h1>
//                     <div className="flex items-center justify-center space-x-2 text-gray-600">
//                         <FaLock className="text-green-600" />
//                         <p className="text-sm">Your information is secure and encrypted</p>
//                     </div>
//                 </div>

//                 {/* Progress Steps */}
//                 <div className="max-w-3xl mx-auto mb-12">
//                     <div className="flex items-center justify-between">
//                         {[
//                             { num: 1, label: 'Cart', icon: BiPackage },
//                             { num: 2, label: 'Checkout', icon: FaLock },
//                             { num: 3, label: 'Complete', icon: FaCheckCircle }
//                         ].map((step, index) => (
//                             <React.Fragment key={step.num}>
//                                 <div className="flex flex-col items-center">
//                                     <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
//                                         step.num === 2 
//                                             ? 'bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg' 
//                                             : step.num < 2 
//                                             ? 'bg-green-500 text-white' 
//                                             : 'bg-gray-200 text-gray-400'
//                                     } transition-all duration-300`}>
//                                         <step.icon className="w-5 h-5" />
//                                     </div>
//                                     <span className={`text-xs mt-2 font-medium ${
//                                         step.num === 2 ? 'text-gray-900' : 'text-gray-500'
//                                     }`}>
//                                         {step.label}
//                                     </span>
//                                 </div>
//                                 {index < 2 && (
//                                     <div className={`flex-1 h-1 mx-4 rounded-full ${
//                                         step.num < 2 ? 'bg-green-500' : 'bg-gray-200'
//                                     }`} />
//                                 )}
//                             </React.Fragment>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     {/* Checkout Form */}
//                     <div className="lg:col-span-2">
//                         <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
//                             <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
//                                 <div className="flex items-center space-x-3">
//                                     <FaShieldAlt className="text-green-400 w-6 h-6" />
//                                     <div>
//                                         <h2 className="text-2xl font-serif font-light">Checkout Details</h2>
//                                         <p className="text-sm text-gray-300">All fields are required</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             <form onSubmit={handleSubmit} className="p-8">
//                                 {/* Shipping Information */}
//                                 <div className="mb-10">
//                                     <div className="flex items-center space-x-2 mb-6">
//                                         <FaTruck className="text-gray-700 w-5 h-5" />
//                                         <h3 className="text-xl font-serif font-medium text-gray-900">
//                                             Shipping Information
//                                         </h3>
//                                     </div>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         <div className="md:col-span-2">
//                                             <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
//                                                 Full Name *
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 id="customer_name"
//                                                 name="customer_name"
//                                                 value={form.customer_name}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
//                                                 placeholder="Enter your full name"
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-2">
//                                                 Email Address *
//                                             </label>
//                                             <input
//                                                 type="email"
//                                                 id="customer_email"
//                                                 name="customer_email"
//                                                 value={form.customer_email}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
//                                                 placeholder="your@email.com"
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
//                                                 Phone Number *
//                                             </label>
//                                             <input
//                                                 type="tel"
//                                                 id="customer_phone"
//                                                 name="customer_phone"
//                                                 value={form.customer_phone}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
//                                                 placeholder="+92 300 1234567"
//                                                 required
//                                             />
//                                         </div>
//                                         <div className="md:col-span-2">
//                                             <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 mb-2">
//                                                 Delivery Address *
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 id="delivery_address"
//                                                 name="delivery_address"
//                                                 value={form.delivery_address}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
//                                                 placeholder="House/Street, Area"
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
//                                                 City *
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 id="city"
//                                                 name="city"
//                                                 value={form.city}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
//                                                 placeholder="Islamabad"
//                                                 required
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Payment Method */}
//                                 <div className="mb-10">
//                                     <div className="flex items-center space-x-2 mb-6">
//                                         <FaLock className="text-gray-700 w-5 h-5" />
//                                         <h3 className="text-xl font-serif font-medium text-gray-900">
//                                             Payment Method
//                                         </h3>
//                                     </div>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         {[
//                                             { value: 'credit_card', label: 'Credit Card', icons: [FaCcVisa, FaCcMastercard] },
//                                             { value: 'debit_card', label: 'Debit Card', icons: [] },
//                                             { value: 'paypal', label: 'PayPal', icons: [FaCcPaypal] },
//                                             { value: 'cash_on_delivery', label: 'Cash on Delivery', icons: [] }
//                                         ].map((method) => (
//                                             <label
//                                                 key={method.value}
//                                                 className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
//                                                     form.payment_method === method.value
//                                                         ? 'border-gray-900 bg-gray-50 shadow-md'
//                                                         : 'border-gray-200 hover:border-gray-300'
//                                                 }`}
//                                             >
//                                                 <input
//                                                     type="radio"
//                                                     name="payment_method"
//                                                     value={method.value}
//                                                     checked={form.payment_method === method.value}
//                                                     onChange={handleChange}
//                                                     className="w-5 h-5 text-gray-900 focus:ring-gray-900"
//                                                 />
//                                                 <span className="ml-3 text-sm font-medium text-gray-900 flex-1">
//                                                     {method.label}
//                                                 </span>
//                                                 <div className="flex space-x-1">
//                                                     {method.icons.map((Icon, idx) => (
//                                                         <Icon key={idx} className="w-8 h-8 text-gray-600" />
//                                                     ))}
//                                                 </div>
//                                             </label>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {/* Submit Button */}
//                                 <button
//                                     type="submit"
//                                     disabled={isLoading}
//                                     className={`w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
//                                         isLoading ? 'opacity-70 cursor-not-allowed' : ''
//                                     }`}
//                                 >
//                                     {isLoading ? (
//                                         <span className="flex items-center justify-center">
//                                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                             </svg>
//                                             Processing Order...
//                                         </span>
//                                     ) : (
//                                         <span className="flex items-center justify-center">
//                                             <FaCheckCircle className="mr-2" />
//                                             Complete Order
//                                         </span>
//                                     )}
//                                 </button>

//                                 {/* Trust Badges */}
//                                 <div className="mt-6 pt-6 border-t border-gray-100">
//                                     <div className="grid grid-cols-3 gap-4 text-center">
//                                         <div className="flex flex-col items-center">
//                                             <FaShieldAlt className="text-green-600 w-6 h-6 mb-2" />
//                                             <span className="text-xs text-gray-600">Secure Payment</span>
//                                         </div>
//                                         <div className="flex flex-col items-center">
//                                             <FaTruck className="text-blue-600 w-6 h-6 mb-2" />
//                                             <span className="text-xs text-gray-600">Free Delivery</span>
//                                         </div>
//                                         <div className="flex flex-col items-center">
//                                             <FaCheckCircle className="text-purple-600 w-6 h-6 mb-2" />
//                                             <span className="text-xs text-gray-600">Easy Returns</span>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>

//                     {/* Order Summary - Sticky Sidebar */}
//                     <div className="lg:col-span-1">
//                         <div className="sticky top-6">
//                             <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
//                                 <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
//                                     <h2 className="text-2xl font-serif font-light">Order Summary</h2>
//                                     <p className="text-sm text-gray-300 mt-1">
//                                         {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
//                                     </p>
//                                 </div>
                                
//                                 <div className="p-6">
//                                     {cartItems.length > 0 ? (
//                                         <>
//                                             {/* Sales Products - Show first */}
//                                             {renderCartSummary(salesProducts, "Sale Items", "bg-red-50")}
                                            
//                                             {/* Regular Products */}
//                                             {renderCartSummary(regularProducts, "Regular Items", "bg-gray-50")}

//                                             {/* Order Totals */}
//                                             <div className="space-y-3 pt-4 border-t border-gray-200">
//                                                 {regularProducts.length > 0 && salesProducts.length > 0 && (
//                                                     <>
//                                                         <div className="flex justify-between text-sm">
//                                                             <span className="text-gray-600">Regular Subtotal</span>
//                                                             <span className="font-medium text-gray-900">
//                                                                 PKR {regularProducts.reduce((total, item) => {
//                                                                     return total + (getUnitPrice(item) * item.quantity);
//                                                                 }, 0).toLocaleString()}
//                                                             </span>
//                                                         </div>
//                                                         <div className="flex justify-between text-sm">
//                                                             <span className="text-gray-600">Sale Subtotal</span>
//                                                             <span className="font-medium text-gray-900">
//                                                                 PKR {salesProducts.reduce((total, item) => {
//                                                                     return total + (getUnitPrice(item) * item.quantity);
//                                                                 }, 0).toLocaleString()}
//                                                             </span>
//                                                         </div>
//                                                     </>
//                                                 )}
                                                
//                                                 <div className="flex justify-between">
//                                                     <span className="text-gray-900">Subtotal</span>
//                                                     <span className="font-medium text-gray-900">
//                                                         PKR {getTotalPrice().toLocaleString()}
//                                                     </span>
//                                                 </div>

//                                                 {totalSavings > 0 && (
//                                                     <div className="flex justify-between bg-green-50 -mx-6 px-6 py-2 rounded-lg">
//                                                         <span className="text-green-700 font-medium flex items-center">
//                                                             <FaTag className="mr-2" />
//                                                             Total Savings
//                                                         </span>
//                                                         <span className="font-bold text-green-700">
//                                                             - PKR {totalSavings.toLocaleString()}
//                                                         </span>
//                                                     </div>
//                                                 )}

//                                                 <div className="flex justify-between">
//                                                     <span className="text-gray-900">Shipping</span>
//                                                     <span className="font-medium text-green-600">FREE</span>
//                                                 </div>
//                                                 <div className="flex justify-between">
//                                                     <span className="text-gray-900">Tax</span>
//                                                     <span className="font-medium text-gray-900">PKR 0</span>
//                                                 </div>
//                                             </div>

//                                             {/* Grand Total */}
//                                             <div className="flex justify-between pt-4 mt-4 border-t-2 border-gray-900">
//                                                 <span className="text-xl font-serif font-medium text-gray-900">Total</span>
//                                                 <span className="text-2xl font-serif font-bold text-gray-900">
//                                                     PKR {getTotalPrice().toLocaleString()}
//                                                 </span>
//                                             </div>
//                                         </>
//                                     ) : (
//                                         <p className="text-center py-8 text-gray-500">Your cart is empty</p>
//                                     )}

//                                     <button
//                                         onClick={handleContinueShopping}
//                                         className="w-full bg-white text-gray-900 py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 mt-6 font-medium"
//                                     >
//                                         Continue Shopping
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
// </div>
//             </div>
//         </div>
//     );
// };

// export default Checkout;




// 'use client';
// import React, { useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { CartContext } from "@/components/CartContext";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import jsPDF from 'jspdf';
// import { 
//   FaLock, FaArrowLeft, FaCcVisa, FaCcMastercard, FaCcPaypal, 
//   FaShieldAlt, FaTruck, FaCheckCircle, FaTag, FaAddressBook, 
//   FaPlus, FaEdit, FaTrash, FaHome, FaBuilding, FaMapMarkerAlt,
//   FaUser, FaPhone, FaEnvelope, FaCity
// } from 'react-icons/fa';
// import { BiPackage } from 'react-icons/bi';

// const Checkout = () => {
//     const { cartItems, clearCart, getRegularProducts, getSalesProducts } = useContext(CartContext);
//     const router = useRouter();
//     const [isLoading, setIsLoading] = useState(false);

//     // --- Auth check ---
//     const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//     const isLoggedIn = !!token;

//     // --- Address state (only used when logged in) ---
//     const [addresses, setAddresses] = useState([]);
//     const [selectedAddressId, setSelectedAddressId] = useState(null);
//     const [showAddAddressForm, setShowAddAddressForm] = useState(false);
//     const [editingAddress, setEditingAddress] = useState(null);
//     const [addressForm, setAddressForm] = useState({
//         label: 'home',
//         full_name: '',
//         phone: '',
//         email: '',
//         delivery_address: '',
//         city: '',
//         postal_code: '',
//         is_default: false
//     });

//     // --- Main form (customer info & payment) ---
//     const [form, setForm] = useState({
//         customer_name: '',
//         customer_email: '',
//         customer_phone: '',
//         delivery_address: '',   // used for guest checkout
//         city: '',               // used for guest checkout
//         payment_method: 'credit_card',
//     });

//     const regularProducts = getRegularProducts();
//     const salesProducts = getSalesProducts();

//     // ------------------------------------------------------------------------
//     // Image helpers (unchanged)
//     // ------------------------------------------------------------------------
//     const processImageUrl = (url) => {
//         if (!url || url.trim() === '') return '/images/default-product.jpg';
//         if (url.startsWith('http://') || url.startsWith('https://')) return url;
//         const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
//         const cleanUrl = url.startsWith('/') ? url : `/${url}`;
//         return `${baseURL}${cleanUrl}`;
//     };

//     const getMainImage = (item) => {
//         if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
//             return processImageUrl(item.image_urls[0]);
//         }
//         if (item.image_urls && typeof item.image_urls === 'string') {
//             return processImageUrl(item.image_urls);
//         }
//         if (item.image) return processImageUrl(item.image);
//         if (item.mainImage) return processImageUrl(item.mainImage);
//         return '/images/default-product.jpg';
//     };

//     // ------------------------------------------------------------------------
//     // Fetch addresses (only when logged in)
//     // ------------------------------------------------------------------------
//     const fetchAddresses = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) return;

//             const response = await AxiosInstance.get('/api/myapp/v1/address/', {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             console.log('Addresses response:', response.data);

//             let addressData = [];
//             if (response.data && Array.isArray(response.data)) {
//                 addressData = response.data;
//             } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
//                 addressData = response.data.data;
//             } else if (response.data && response.data.results && Array.isArray(response.data.results)) {
//                 addressData = response.data.results;
//             } else if (response.data) {
//                 // single object fallback
//                 addressData = [response.data].filter(Boolean);
//             }

//             // filter out soft-deleted
//             addressData = addressData.filter(addr => !addr.deleted);

//             setAddresses(addressData);

//             // Auto-select default or first
//             const defaultAddress = addressData.find(addr => addr.is_default);
//             if (defaultAddress) {
//                 setSelectedAddressId(defaultAddress.id);
//             } else if (addressData.length > 0) {
//                 setSelectedAddressId(addressData[0].id);
//             }
//         } catch (error) {
//             console.error('Error fetching addresses:', error);
//             if (error.response?.status === 401) {
//                 toast.info('Please login to use saved addresses');
//             } else {
//                 toast.error('Failed to load saved addresses');
//             }
//         }
//     };

//     // ------------------------------------------------------------------------
//     // Load user data and addresses
//     // ------------------------------------------------------------------------
//     useEffect(() => {
//         const userData = JSON.parse(localStorage.getItem('user'));
//         if (userData) {
//             setForm(prev => ({
//                 ...prev,
//                 customer_name: userData.name || '',
//                 customer_email: userData.email || '',
//                 customer_phone: userData.phone || ''
//             }));
//             // Pre-fill address form (if logged in)
//             setAddressForm(prev => ({
//                 ...prev,
//                 full_name: userData.name || '',
//                 phone: userData.phone || '',
//                 email: userData.email || ''
//             }));
//         }
//         if (isLoggedIn) {
//             fetchAddresses();
//         }
//     }, []);

//     // ------------------------------------------------------------------------
//     // Address handlers (only for logged in)
//     // ------------------------------------------------------------------------
//     const handleAddressSelect = (addressId) => {
//         setSelectedAddressId(addressId);
//         const selectedAddress = addresses.find(addr => addr.id === addressId);
//         if (selectedAddress) {
//             setForm(prev => ({
//                 ...prev,
//                 customer_name: selectedAddress.full_name || prev.customer_name,
//                 customer_phone: selectedAddress.phone || prev.customer_phone,
//                 customer_email: selectedAddress.email || prev.customer_email,
//             }));
//         }
//     };

//     const handleAddressFormChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setAddressForm({
//             ...addressForm,
//             [name]: type === 'checkbox' ? checked : value
//         });
//     };

//     const handleAddressFormSubmit = async (e) => {
//         // e is not needed here because we call it from a button
//         // but we keep it to prevent any accidental event
//         if (e) e.preventDefault();

//         // Validate required fields
//         if (!addressForm.full_name.trim()) {
//             toast.error('Full name is required');
//             return;
//         }
//         if (!addressForm.phone.trim()) {
//             toast.error('Phone number is required');
//             return;
//         }
//         if (!addressForm.delivery_address.trim()) {
//             toast.error('Delivery address is required');
//             return;
//         }
//         if (!addressForm.city.trim()) {
//             toast.error('City is required');
//             return;
//         }

//         setIsLoading(true);

//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 toast.error('Please login to save addresses');
//                 return;
//             }

//             const addressData = {
//                 label: addressForm.label,
//                 full_name: addressForm.full_name,
//                 phone: addressForm.phone,
//                 email: addressForm.email || '',
//                 delivery_address: addressForm.delivery_address,
//                 city: addressForm.city,
//                 postal_code: addressForm.postal_code || '',
//                 is_default: addressForm.is_default || false
//             };

//             let response;
//             if (editingAddress) {
//                 response = await AxiosInstance.patch(
//                     `/api/myapp/v1/address/?id=${editingAddress.id}`,
//                     addressData,
//                     {
//                         headers: {
//                             'Authorization': `Bearer ${token}`,
//                             'Content-Type': 'application/json'
//                         }
//                     }
//                 );
//                 toast.success('Address updated successfully!');
//             } else {
//                 response = await AxiosInstance.post(
//                     '/api/myapp/v1/address/',
//                     addressData,
//                     {
//                         headers: {
//                             'Authorization': `Bearer ${token}`,
//                             'Content-Type': 'application/json'
//                         }
//                     }
//                 );
//                 toast.success('Address added successfully!');
//             }

//             console.log('Address save response:', response.data);

//             // Reset form
//             setAddressForm({
//                 label: 'home',
//                 full_name: form.customer_name || '',
//                 phone: form.customer_phone || '',
//                 email: form.customer_email || '',
//                 delivery_address: '',
//                 city: '',
//                 postal_code: '',
//                 is_default: false
//             });
//             setShowAddAddressForm(false);
//             setEditingAddress(null);

//             // Refresh addresses
//             await fetchAddresses();

//         } catch (error) {
//             console.error('Error saving address:', error);
//             let errorMsg = 'Failed to save address';
//             if (error.response?.data?.message) errorMsg = error.response.data.message;
//             else if (error.response?.data?.error) errorMsg = error.response.data.error;
//             toast.error(errorMsg);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleDeleteAddress = async (addressId) => {
//         if (!confirm('Are you sure you want to delete this address?')) return;

//         try {
//             const token = localStorage.getItem('token');
//             await AxiosInstance.delete(`/api/myapp/v1/address/?id=${addressId}`, {
//                 headers: { 'Authorization': `Bearer ${token}` }
//             });

//             toast.success('Address deleted');
//             if (selectedAddressId === addressId) setSelectedAddressId(null);
//             await fetchAddresses();
//         } catch (error) {
//             console.error('Error deleting address:', error);
//             toast.error('Failed to delete address');
//         }
//     };

//     const handleEditAddress = (address) => {
//         setEditingAddress(address);
//         setAddressForm({
//             label: address.label || 'home',
//             full_name: address.full_name || '',
//             phone: address.phone || '',
//             email: address.email || '',
//             delivery_address: address.delivery_address || '',
//             city: address.city || '',
//             postal_code: address.postal_code || '',
//             is_default: address.is_default || false
//         });
//         setShowAddAddressForm(true);
//     };

//     const getSelectedAddress = () => {
//         return addresses.find(addr => addr.id === selectedAddressId);
//     };

//     const getAddressIcon = (label) => {
//         switch(label) {
//             case 'home': return <FaHome className="w-4 h-4" />;
//             case 'work': return <FaBuilding className="w-4 h-4" />;
//             default: return <FaMapMarkerAlt className="w-4 h-4" />;
//         }
//     };

//     // ------------------------------------------------------------------------
//     // General form handlers
//     // ------------------------------------------------------------------------
//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setForm({
//             ...form,
//             [name]: type === 'checkbox' ? checked : value
//         });
//     };

//     // ------------------------------------------------------------------------
//     // Cart calculations
//     // ------------------------------------------------------------------------
//     const getUnitPrice = (item) => {
//         return item.final_price !== undefined ? Number(item.final_price) : Number(item.price) || 0;
//     };

//     const getTotalPrice = () => {
//         return cartItems.reduce((total, item) => {
//             return total + (getUnitPrice(item) * (item.quantity || 1));
//         }, 0);
//     };

//     const calculateTotalSavings = () => {
//         return cartItems.reduce((savings, item) => {
//             if (item.original_price && item.final_price && parseFloat(item.original_price) > parseFloat(item.final_price)) {
//                 return savings + ((parseFloat(item.original_price) - parseFloat(item.final_price)) * item.quantity);
//             }
//             return savings;
//         }, 0);
//     };

//     // ------------------------------------------------------------------------
//     // Invoice generation (unchanged)
//     // ------------------------------------------------------------------------
//     const generateInvoice = (orderData) => {
//         try {
//             const doc = new jsPDF();
//             doc.setProperties({
//                 title: `Invoice #${orderData.order_id}`,
//                 subject: 'Invoice from GOHAR COLLECTION',
//                 author: 'GOHAR COLLECTION',
//             });

//             // Header
//             doc.setFillColor(26, 26, 26);
//             doc.rect(0, 0, 210, 35, 'F');
//             doc.setTextColor(255, 255, 255);
//             doc.setFontSize(24);
//             doc.setFont(undefined, 'bold');
//             doc.text('GOHAR COLLECTION', 105, 18, { align: 'center' });
//             doc.setFontSize(10);
//             doc.setFont(undefined, 'normal');
//             doc.text('Premium Luxury Products', 105, 26, { align: 'center' });

//             // Invoice details
//             doc.setFontSize(14);
//             doc.setTextColor(26, 26, 26);
//             doc.setFont(undefined, 'bold');
//             doc.text('INVOICE', 20, 50);
//             doc.setFont(undefined, 'normal');
//             doc.setFontSize(10);
//             doc.setTextColor(100, 100, 100);
//             doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 50);
//             doc.text(`Invoice #: ${orderData.order_id}`, 160, 56);
//             doc.text(`Status: ${orderData.status}`, 160, 62);

//             // From section
//             doc.setFontSize(10);
//             doc.setTextColor(100, 100, 100);
//             doc.text('FROM:', 20, 75);
//             doc.setFont(undefined, 'bold');
//             doc.setTextColor(26, 26, 26);
//             doc.text('GOHAR COLLECTION', 20, 82);
//             doc.setFont(undefined, 'normal');
//             doc.setTextColor(100, 100, 100);
//             doc.text('Sector D, DHA 2, Islamabad', 20, 88);
//             doc.text('Pakistan', 20, 94);
//             doc.text('contact@goharcollection.com', 20, 100);

//             // To section
//             doc.setTextColor(100, 100, 100);
//             doc.text('TO:', 20, 115);
//             doc.setFont(undefined, 'bold');
//             doc.setTextColor(26, 26, 26);
//             doc.text(orderData.customer_info.name, 20, 122);
//             doc.setFont(undefined, 'normal');
//             doc.setTextColor(100, 100, 100);
//             doc.text(orderData.delivery_info.address, 20, 128);
//             doc.text(orderData.delivery_info.city, 20, 134);
//             doc.text(orderData.customer_info.phone, 20, 140);
//             doc.text(orderData.customer_info.email, 20, 146);

//             // Table header
//             doc.setFillColor(245, 245, 245);
//             doc.rect(20, 160, 170, 10, 'F');
//             doc.setTextColor(26, 26, 26);
//             doc.setFont(undefined, 'bold');
//             doc.setFontSize(9);
//             doc.text('PRODUCT', 25, 166);
//             doc.text('TYPE', 85, 166);
//             doc.text('UNIT PRICE', 115, 166);
//             doc.text('QTY', 150, 166);
//             doc.text('TOTAL', 170, 166);

//             // Table content
//             doc.setFont(undefined, 'normal');
//             let yPosition = 176;
//             orderData.order_summary.items.forEach((item, index) => {
//                 if (index % 2 === 0) {
//                     doc.setFillColor(250, 250, 250);
//                     doc.rect(20, yPosition - 5, 170, 8, 'F');
//                 }
//                 doc.setTextColor(60, 60, 60);
//                 const productName = item.product_name.length > 25 
//                     ? item.product_name.substring(0, 25) + '...' 
//                     : item.product_name;
//                 doc.text(productName, 25, yPosition);
//                 const typeText = item.product_type === 'sales_product' ? 'Sale' : 'Regular';
//                 const typeColor = item.product_type === 'sales_product' ? [220, 38, 38] : [60, 60, 60];
//                 doc.setTextColor(...typeColor);
//                 doc.text(typeText, 85, yPosition);
//                 doc.setTextColor(60, 60, 60);
//                 doc.text(`PKR ${item.unit_price.toLocaleString()}`, 115, yPosition);
//                 doc.text(`${item.quantity}`, 150, yPosition);
//                 doc.text(`PKR ${item.total_price.toLocaleString()}`, 170, yPosition);
//                 yPosition += 10;
//             });

//             // Totals
//             yPosition += 10;
//             doc.setDrawColor(220, 220, 220);
//             doc.line(20, yPosition, 190, yPosition);
//             yPosition += 10;
//             doc.setFont(undefined, 'normal');
//             doc.setTextColor(100, 100, 100);
//             doc.text('Subtotal:', 140, yPosition);
//             doc.setTextColor(26, 26, 26);
//             doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 170, yPosition);
//             yPosition += 8;
//             doc.setTextColor(100, 100, 100);
//             doc.text('Shipping:', 140, yPosition);
//             doc.setTextColor(34, 197, 94);
//             doc.text('FREE', 170, yPosition);
//             yPosition += 8;
//             doc.setTextColor(100, 100, 100);
//             doc.text('Tax:', 140, yPosition);
//             doc.setTextColor(26, 26, 26);
//             doc.text('PKR 0', 170, yPosition);

//             // Grand total
//             yPosition += 12;
//             doc.setFillColor(26, 26, 26);
//             doc.rect(130, yPosition - 5, 60, 12, 'F');
//             doc.setFont(undefined, 'bold');
//             doc.setFontSize(11);
//             doc.setTextColor(255, 255, 255);
//             doc.text('TOTAL:', 135, yPosition + 2);
//             doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 165, yPosition + 2);

//             // Footer
//             doc.setFontSize(8);
//             doc.setTextColor(100, 100, 100);
//             doc.setFont(undefined, 'italic');
//             doc.text('Thank you for choosing GOHAR COLLECTION', 105, 270, { align: 'center' });
//             doc.setFont(undefined, 'normal');
//             doc.text('Terms & Conditions: Payment due within 15 days. All sales are final.', 105, 276, { align: 'center' });
//             doc.text('GOHAR COLLECTION | Sector D, DHA 2, Islamabad | contact@goharcollection.com', 105, 282, { align: 'center' });
//             doc.setDrawColor(26, 26, 26);
//             doc.setLineWidth(0.5);
//             doc.rect(10, 10, 190, 277);
//             doc.save(`invoice-${orderData.order_id}.pdf`);
//         } catch (error) {
//             console.error('Error generating invoice:', error);
//             toast.error('Failed to generate invoice, but order was placed successfully');
//         }
//     };

//     const prepareOrderDataForConfirmation = (apiResponse) => {
//         let orderId, status;
//         if (apiResponse.order_id) orderId = apiResponse.order_id;
//         else if (apiResponse.id) orderId = apiResponse.id;
//         else if (apiResponse.order && apiResponse.order.id) orderId = apiResponse.order.id;
//         else orderId = Date.now();

//         status = apiResponse.status || apiResponse.order_status || 'Confirmed';

//         let deliveryAddress, city;
//         if (isLoggedIn) {
//             const selected = getSelectedAddress();
//             deliveryAddress = selected ? selected.delivery_address : form.delivery_address;
//             city = selected ? selected.city : form.city;
//         } else {
//             deliveryAddress = form.delivery_address;
//             city = form.city;
//         }

//         return {
//             order_id: orderId,
//             customer_info: {
//                 name: form.customer_name,
//                 email: form.customer_email,
//                 phone: form.customer_phone
//             },
//             delivery_info: {
//                 address: deliveryAddress,
//                 city: city,
//                 estimated_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
//             },
//             payment_method: form.payment_method,
//             payment_status: true,
//             status: status,
//             order_summary: {
//                 items: cartItems.map(item => ({
//                     product_name: item.name,
//                     product_type: item.isSalesProduct ? 'sales_product' : 'product',
//                     unit_price: getUnitPrice(item),
//                     quantity: item.quantity || 1,
//                     total_price: getUnitPrice(item) * (item.quantity || 1),
//                     image_url: getMainImage(item)
//                 })),
//                 subtotal: getTotalPrice(),
//                 total: getTotalPrice()
//             }
//         };
//     };

//     // ------------------------------------------------------------------------
//     // MAIN SUBMIT (Order placement)
//     // ------------------------------------------------------------------------
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (cartItems.length === 0) {
//             toast.error('Your cart is empty');
//             return;
//         }

//         // Validate required fields
//         if (!form.customer_name.trim()) {
//             toast.error('Please enter your full name');
//             return;
//         }
//         if (!form.customer_email.trim()) {
//             toast.error('Please enter your email');
//             return;
//         }
//         if (!form.customer_phone.trim()) {
//             toast.error('Please enter your phone number');
//             return;
//         }

//         // Build order data
//         const orderData = {
//             customer_name: form.customer_name,
//             customer_email: form.customer_email,
//             customer_phone: form.customer_phone,
//             payment_method: form.payment_method,
//             items: cartItems.map(item => ({
//                 product_type: item.isSalesProduct ? 'sales_product' : 'product',
//                 product_id: item.id,
//                 quantity: item.quantity || 1
//             }))
//         };

//         if (isLoggedIn) {
//             // Logged in: must select an address
//             if (!selectedAddressId) {
//                 toast.error('Please select a delivery address');
//                 return;
//             }
//             const selectedAddress = getSelectedAddress();
//             if (!selectedAddress) {
//                 toast.error('Selected address not found');
//                 return;
//             }
//             orderData.address_id = selectedAddressId;
//             orderData.delivery_address = selectedAddress.delivery_address;
//             orderData.city = selectedAddress.city;
//         } else {
//             // Guest: use form fields
//             if (!form.delivery_address?.trim() || !form.city?.trim()) {
//                 toast.error('Please fill in delivery address and city');
//                 return;
//             }
//             orderData.delivery_address = form.delivery_address;
//             orderData.city = form.city;
//         }

//         console.log('Sending order data:', orderData);

//         setIsLoading(true);

//         try {
//             const response = await AxiosInstance.post('/api/myapp/v1/public/order/', orderData, {
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'Authorization': token ? `Bearer ${token}` : ''
//                 }
//             });

//             console.log('Full API Response:', response);
//             console.log('Response data:', response.data);

//             let orderResponse;
//             if (response.data && response.data.data) orderResponse = response.data.data;
//             else if (response.data) orderResponse = response.data;
//             else orderResponse = response;

//             const confirmationData = prepareOrderDataForConfirmation(orderResponse);
//             console.log('Confirmation data:', confirmationData);

//             generateInvoice(confirmationData);
//             clearCart();
//             localStorage.setItem('latestOrder', JSON.stringify(confirmationData));

//             toast.success('Order placed successfully!', {
//                 position: "top-center",
//                 autoClose: 2000,
//                 hideProgressBar: false,
//                 closeOnClick: true,
//                 pauseOnHover: true,
//                 draggable: true,
//                 theme: "light",
//             });

//             setTimeout(() => {
//                 router.push('/orderconfirmation');
//             }, 2000);

//         } catch (error) {
//             console.error('Full error object:', error);
//             console.error('Error response:', error.response);

//             let errorMsg = 'Failed to place order';
//             if (error.response) {
//                 console.error('Error response data:', error.response.data);
//                 console.error('Error response status:', error.response.status);
//                 if (error.response.status === 400) {
//                     const errorData = error.response.data;
//                     if (errorData.message) errorMsg = errorData.message;
//                     else if (errorData.error) errorMsg = errorData.error;
//                     else if (errorData.detail) errorMsg = errorData.detail;
//                     else errorMsg = 'Validation error - please check your input';
//                 } else if (error.response.status === 401) {
//                     errorMsg = 'Please login to place an order';
//                 } else if (error.response.status === 403) {
//                     errorMsg = 'You do not have permission to perform this action';
//                 } else if (error.response.status === 500) {
//                     errorMsg = 'Server error - please try again later';
//                 } else {
//                     errorMsg = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
//                 }
//             } else if (error.request) {
//                 errorMsg = 'No response from server - please check your connection';
//             } else {
//                 errorMsg = error.message || 'Unknown error occurred';
//             }
//             toast.error(errorMsg, {
//                 position: "top-center",
//                 autoClose: 5000,
//             });
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleContinueShopping = () => {
//         router.push('/publicproducts');
//     };

//     const isSalesProduct = (item) => {
//         return (
//             item.productType === 'sales_product' ||
//             item.productType === 'sale' ||
//             item.type === 'sales_product' ||
//             item.type === 'sale' ||
//             item.isSalesProduct === true ||
//             (item.final_price !== undefined && item.original_price !== undefined && parseFloat(item.final_price) < parseFloat(item.original_price)) ||
//             (item.discount_percent && item.discount_percent > 0)
//         );
//     };

//     // ------------------------------------------------------------------------
//     // Render: Cart Summary (unchanged)
//     // ------------------------------------------------------------------------
//     const renderCartSummary = (items, title, bgColor = 'bg-gray-50') => {
//         if (items.length === 0) return null;
//         const isSale = title.includes('Sale');
//         return (
//             <div className={`mb-6 ${bgColor} rounded-xl p-4`}>
//                 <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-2">
//                         {isSale && <FaTag className="text-red-500 w-4 h-4" />}
//                         <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
//                         <span className="text-xs text-gray-500">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
//                     </div>
//                 </div>
//                 <div className="space-y-4">
//                     {items.map((item) => {
//                         const unitPrice = getUnitPrice(item);
//                         const isOnSale = isSalesProduct(item);
//                         const uniqueKey = `${item.isSalesProduct ? 'sales' : 'product'}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;
//                         return (
//                             <div key={uniqueKey} className="flex items-start space-x-4 bg-white rounded-lg p-3">
//                                 <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
//                                     <img
//                                         src={getMainImage(item)}
//                                         alt={item.name}
//                                         className="h-full w-full object-cover"
//                                         onError={(e) => {
//                                             e.target.onerror = null;
//                                             e.target.src = '/images/default-product.jpg';
//                                         }}
//                                     />
//                                     {isOnSale && (
//                                         <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
//                                             {item.discount_percent ? `${item.discount_percent}%` : 'SALE'}
//                                         </div>
//                                     )}
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                     <h5 className="text-sm font-medium text-gray-900 truncate">{item.name}</h5>
//                                     <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
//                                         <span>Qty: {item.quantity || 1}</span>
//                                         {item.color && <><span>•</span><span>{item.color}</span></>}
//                                         {item.size && <><span>•</span><span>{item.size}</span></>}
//                                     </div>
//                                     <div className="mt-2">
//                                         {isOnSale && item.original_price && parseFloat(item.original_price) > unitPrice ? (
//                                             <div className="flex items-center space-x-2">
//                                                 <span className="text-xs text-gray-400 line-through">PKR {parseFloat(item.original_price).toLocaleString()}</span>
//                                                 <span className="text-sm font-bold text-red-600">PKR {unitPrice.toLocaleString()}</span>
//                                             </div>
//                                         ) : (
//                                             <span className="text-sm font-medium text-gray-900">PKR {unitPrice.toLocaleString()}</span>
//                                         )}
//                                     </div>
//                                 </div>
//                                 <div className="text-right">
//                                     <p className="text-sm font-bold text-gray-900">PKR {(unitPrice * (item.quantity || 1)).toLocaleString()}</p>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         );
//     };

//     // ------------------------------------------------------------------------
//     // Render: Address Selection (for logged‑in users)
//     // ------------------------------------------------------------------------
//     const renderAddressSelection = () => {
//         return (
//             <div className="mb-10">
//                 <div className="flex items-center justify-between mb-6">
//                     <div className="flex items-center space-x-2">
//                         <FaAddressBook className="text-gray-700 w-5 h-5" />
//                         <h3 className="text-xl font-serif font-medium text-gray-900">Delivery Address</h3>
//                     </div>
//                     <button
//                         type="button"
//                         onClick={() => {
//                             setEditingAddress(null);
//                             setAddressForm({
//                                 label: 'home',
//                                 full_name: form.customer_name || '',
//                                 phone: form.customer_phone || '',
//                                 email: form.customer_email || '',
//                                 delivery_address: '',
//                                 city: '',
//                                 postal_code: '',
//                                 is_default: false
//                             });
//                             setShowAddAddressForm(!showAddAddressForm);
//                         }}
//                         className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
//                     >
//                         <FaPlus className="mr-1" />
//                         {showAddAddressForm ? 'Cancel' : 'Add New Address'}
//                     </button>
//                 </div>

//                 {/* Existing Addresses */}
//                 {addresses.length > 0 && (
//                     <div className="space-y-3 mb-6">
//                         {addresses.map((address) => (
//                             <div
//                                 key={address.id}
//                                 className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedAddressId === address.id ? 'border-gray-900 bg-gray-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
//                             >
//                                 <div className="flex items-start">
//                                     <input
//                                         type="radio"
//                                         name="selected_address"
//                                         checked={selectedAddressId === address.id}
//                                         onChange={() => handleAddressSelect(address.id)}
//                                         className="mt-1 w-5 h-5 text-gray-900 focus:ring-gray-900"
//                                     />
//                                     <div className="ml-3 flex-1">
//                                         <div className="flex items-center justify-between">
//                                             <div className="flex items-center space-x-2">
//                                                 {getAddressIcon(address.label)}
//                                                 <span className="text-sm font-medium text-gray-900">{address.label.charAt(0).toUpperCase() + address.label.slice(1)}</span>
//                                                 {address.is_default && <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">Default</span>}
//                                             </div>
//                                             <div className="flex items-center space-x-2">
//                                                 <button type="button" onClick={(e) => { e.stopPropagation(); handleEditAddress(address); }} className="text-gray-400 hover:text-gray-600 transition-colors">
//                                                     <FaEdit className="w-4 h-4" />
//                                                 </button>
//                                                 <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id); }} className="text-gray-400 hover:text-red-600 transition-colors">
//                                                     <FaTrash className="w-4 h-4" />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                         <p className="text-sm text-gray-700 mt-1 font-medium">{address.full_name}</p>
//                                         <p className="text-sm text-gray-600">{address.delivery_address}</p>
//                                         <p className="text-sm text-gray-600">{address.city} {address.postal_code ? `, ${address.postal_code}` : ''}</p>
//                                         <p className="text-sm text-gray-600">
//                                             <FaPhone className="inline w-3 h-3 mr-1" /> {address.phone}
//                                             {address.email && (
//                                                 <>
//                                                     <span className="mx-2">•</span>
//                                                     <FaEnvelope className="inline w-3 h-3 mr-1" /> {address.email}
//                                                 </>
//                                             )}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 )}

//                 {/* Add/Edit Address Form */}
//                 {showAddAddressForm && (
//                     <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
//                         <h4 className="text-lg font-medium text-gray-900 mb-4">
//                             {editingAddress ? 'Edit Address' : 'Add New Address'}
//                         </h4>
//                         <div className="space-y-4">
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
//                                     <select
//                                         name="label"
//                                         value={addressForm.label}
//                                         onChange={handleAddressFormChange}
//                                         className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
//                                         required
//                                     >
//                                         <option value="home">Home</option>
//                                         <option value="work">Work</option>
//                                         <option value="other">Other</option>
//                                     </select>
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
//                                     <input
//                                         type="text"
//                                         name="full_name"
//                                         value={addressForm.full_name}
//                                         onChange={handleAddressFormChange}
//                                         className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
//                                     <input
//                                         type="tel"
//                                         name="phone"
//                                         value={addressForm.phone}
//                                         onChange={handleAddressFormChange}
//                                         className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                                     <input
//                                         type="email"
//                                         name="email"
//                                         value={addressForm.email}
//                                         onChange={handleAddressFormChange}
//                                         className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
//                                     />
//                                 </div>
//                                 <div className="md:col-span-2">
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address *</label>
//                                     <input
//                                         type="text"
//                                         name="delivery_address"
//                                         value={addressForm.delivery_address}
//                                         onChange={handleAddressFormChange}
//                                         className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
//                                         placeholder="House/Street/Area"
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
//                                     <input
//                                         type="text"
//                                         name="city"
//                                         value={addressForm.city}
//                                         onChange={handleAddressFormChange}
//                                         className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
//                                         required
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
//                                     <input
//                                         type="text"
//                                         name="postal_code"
//                                         value={addressForm.postal_code}
//                                         onChange={handleAddressFormChange}
//                                         className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
//                                     />
//                                 </div>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                                 <input
//                                     type="checkbox"
//                                     name="is_default"
//                                     checked={addressForm.is_default}
//                                     onChange={handleAddressFormChange}
//                                     className="w-4 h-4 text-gray-900 focus:ring-gray-900"
//                                 />
//                                 <label className="text-sm text-gray-700">Set as default address</label>
//                             </div>
//                             <div className="flex space-x-3 pt-2">
//                                 <button
//                                     type="button"
//                                     onClick={handleAddressFormSubmit}
//                                     disabled={isLoading}
//                                     className="bg-gray-900 text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
//                                 >
//                                     {isLoading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Save Address')}
//                                 </button>
//                                 <button
//                                     type="button"
//                                     onClick={() => {
//                                         setShowAddAddressForm(false);
//                                         setEditingAddress(null);
//                                     }}
//                                     className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-300 transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {addresses.length === 0 && !showAddAddressForm && (
//                     <p className="text-center py-8 text-gray-500">No saved addresses. Add one above.</p>
//                 )}
//             </div>
//         );
//     };

//     // ------------------------------------------------------------------------
//     // Render: Guest Address Fields
//     // ------------------------------------------------------------------------
//     const renderGuestAddressFields = () => (
//         <div className="mb-10">
//             <div className="flex items-center space-x-2 mb-6">
//                 <FaMapMarkerAlt className="text-gray-700 w-5 h-5" />
//                 <h3 className="text-xl font-serif font-medium text-gray-900">Delivery Address</h3>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
//                     <input
//                         type="text"
//                         name="delivery_address"
//                         value={form.delivery_address || ''}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900"
//                         placeholder="House/Street/Area"
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
//                     <input
//                         type="text"
//                         name="city"
//                         value={form.city || ''}
//                         onChange={handleChange}
//                         className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900"
//                         placeholder="Islamabad"
//                         required
//                     />
//                 </div>
//             </div>
//         </div>
//     );

//     // ------------------------------------------------------------------------
//     // Main render
//     // ------------------------------------------------------------------------
//     const totalSavings = calculateTotalSavings();

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
//             <ToastContainer position="top-center" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {/* Back Button */}
//                 <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-8 group">
//                     <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
//                     <span className="font-medium">Back to Cart</span>
//                 </button>

//                 {/* Header */}
//                 <div className="text-center mb-12">
//                     <h1 className="text-5xl font-serif font-light tracking-tight text-gray-900 mb-3">Secure Checkout</h1>
//                     <div className="flex items-center justify-center space-x-2 text-gray-600">
//                         <FaLock className="text-green-600" />
//                         <p className="text-sm">Your information is secure and encrypted</p>
//                     </div>
//                 </div>

//                 {/* Progress Steps */}
//                 <div className="max-w-3xl mx-auto mb-12">
//                     <div className="flex items-center justify-between">
//                         {[
//                             { num: 1, label: 'Cart', icon: BiPackage },
//                             { num: 2, label: 'Checkout', icon: FaLock },
//                             { num: 3, label: 'Complete', icon: FaCheckCircle }
//                         ].map((step, index) => (
//                             <React.Fragment key={step.num}>
//                                 <div className="flex flex-col items-center">
//                                     <div className={`w-12 h-12 rounded-full flex items-center justify-center ${step.num === 2 ? 'bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg' : step.num < 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'} transition-all duration-300`}>
//                                         <step.icon className="w-5 h-5" />
//                                     </div>
//                                     <span className={`text-xs mt-2 font-medium ${step.num === 2 ? 'text-gray-900' : 'text-gray-500'}`}>{step.label}</span>
//                                 </div>
//                                 {index < 2 && <div className={`flex-1 h-1 mx-4 rounded-full ${step.num < 2 ? 'bg-green-500' : 'bg-gray-200'}`} />}
//                             </React.Fragment>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     {/* Checkout Form */}
//                     <div className="lg:col-span-2">
//                         <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
//                             <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
//                                 <div className="flex items-center space-x-3">
//                                     <FaShieldAlt className="text-green-400 w-6 h-6" />
//                                     <div>
//                                         <h2 className="text-2xl font-serif font-light">Checkout Details</h2>
//                                         <p className="text-sm text-gray-300">All fields are required</p>
//                                     </div>
//                                 </div>
//                             </div>

//                             <form onSubmit={handleSubmit} className="p-8">
//                                 {/* Customer Information */}
//                                 <div className="mb-10">
//                                     <div className="flex items-center space-x-2 mb-6">
//                                         <FaUser className="text-gray-700 w-5 h-5" />
//                                         <h3 className="text-xl font-serif font-medium text-gray-900">Customer Information</h3>
//                                     </div>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         <div className="md:col-span-2">
//                                             <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
//                                             <input type="text" id="customer_name" name="customer_name" value={form.customer_name} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors" placeholder="Enter your full name" required />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
//                                             <input type="email" id="customer_email" name="customer_email" value={form.customer_email} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors" placeholder="your@email.com" required />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
//                                             <input type="tel" id="customer_phone" name="customer_phone" value={form.customer_phone} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors" placeholder="+92 300 1234567" required />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Address section – conditional */}
//                                 {isLoggedIn ? renderAddressSelection() : renderGuestAddressFields()}

//                                 {/* Payment Method */}
//                                 <div className="mb-10">
//                                     <div className="flex items-center space-x-2 mb-6">
//                                         <FaLock className="text-gray-700 w-5 h-5" />
//                                         <h3 className="text-xl font-serif font-medium text-gray-900">Payment Method</h3>
//                                     </div>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         {[
//                                             { value: 'credit_card', label: 'Credit Card', icons: [FaCcVisa, FaCcMastercard] },
//                                             { value: 'debit_card', label: 'Debit Card', icons: [] },
//                                             { value: 'paypal', label: 'PayPal', icons: [FaCcPaypal] },
//                                             { value: 'cash_on_delivery', label: 'Cash on Delivery', icons: [] }
//                                         ].map((method) => (
//                                             <label key={method.value} className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${form.payment_method === method.value ? 'border-gray-900 bg-gray-50 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}>
//                                                 <input type="radio" name="payment_method" value={method.value} checked={form.payment_method === method.value} onChange={handleChange} className="w-5 h-5 text-gray-900 focus:ring-gray-900" />
//                                                 <span className="ml-3 text-sm font-medium text-gray-900 flex-1">{method.label}</span>
//                                                 <div className="flex space-x-1">{method.icons.map((Icon, idx) => <Icon key={idx} className="w-8 h-8 text-gray-600" />)}</div>
//                                             </label>
//                                         ))}
//                                     </div>
//                                 </div>

//                                 {/* Submit Button */}
//                                 <button type="submit" disabled={isLoading} className={`w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
//                                     {isLoading ? (
//                                         <span className="flex items-center justify-center">
//                                             <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                             </svg>
//                                             Processing Order...
//                                         </span>
//                                     ) : (
//                                         <span className="flex items-center justify-center"><FaCheckCircle className="mr-2" /> Complete Order</span>
//                                     )}
//                                 </button>

//                                 {/* Trust Badges */}
//                                 <div className="mt-6 pt-6 border-t border-gray-100">
//                                     <div className="grid grid-cols-3 gap-4 text-center">
//                                         <div className="flex flex-col items-center"><FaShieldAlt className="text-green-600 w-6 h-6 mb-2" /><span className="text-xs text-gray-600">Secure Payment</span></div>
//                                         <div className="flex flex-col items-center"><FaTruck className="text-blue-600 w-6 h-6 mb-2" /><span className="text-xs text-gray-600">Free Delivery</span></div>
//                                         <div className="flex flex-col items-center"><FaCheckCircle className="text-purple-600 w-6 h-6 mb-2" /><span className="text-xs text-gray-600">Easy Returns</span></div>
//                                     </div>
//                                 </div>
//                             </form>
//                         </div>
//                     </div>

//                     {/* Order Summary */}
//                     <div className="lg:col-span-1">
//                         <div className="sticky top-6">
//                             <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
//                                 <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
//                                     <h2 className="text-2xl font-serif font-light">Order Summary</h2>
//                                     <p className="text-sm text-gray-300 mt-1">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
//                                 </div>
//                                 <div className="p-6">
//                                     {cartItems.length > 0 ? (
//                                         <>
//                                             {renderCartSummary(salesProducts, "Sale Items", "bg-red-50")}
//                                             {renderCartSummary(regularProducts, "Regular Items", "bg-gray-50")}
//                                             <div className="space-y-3 pt-4 border-t border-gray-200">
//                                                 {regularProducts.length > 0 && salesProducts.length > 0 && (
//                                                     <>
//                                                         <div className="flex justify-between text-sm">
//                                                             <span className="text-gray-600">Regular Subtotal</span>
//                                                             <span className="font-medium text-gray-900">PKR {regularProducts.reduce((total, item) => total + (getUnitPrice(item) * item.quantity), 0).toLocaleString()}</span>
//                                                         </div>
//                                                         <div className="flex justify-between text-sm">
//                                                             <span className="text-gray-600">Sale Subtotal</span>
//                                                             <span className="font-medium text-gray-900">PKR {salesProducts.reduce((total, item) => total + (getUnitPrice(item) * item.quantity), 0).toLocaleString()}</span>
//                                                         </div>
//                                                     </>
//                                                 )}
//                                                 <div className="flex justify-between"><span className="text-gray-900">Subtotal</span><span className="font-medium text-gray-900">PKR {getTotalPrice().toLocaleString()}</span></div>
//                                                 {totalSavings > 0 && (
//                                                     <div className="flex justify-between bg-green-50 -mx-6 px-6 py-2 rounded-lg">
//                                                         <span className="text-green-700 font-medium flex items-center"><FaTag className="mr-2" /> Total Savings</span>
//                                                         <span className="font-bold text-green-700">- PKR {totalSavings.toLocaleString()}</span>
//                                                     </div>
//                                                 )}
//                                                 <div className="flex justify-between"><span className="text-gray-900">Shipping</span><span className="font-medium text-green-600">FREE</span></div>
//                                                 <div className="flex justify-between"><span className="text-gray-900">Tax</span><span className="font-medium text-gray-900">PKR 0</span></div>
//                                             </div>
//                                             <div className="flex justify-between pt-4 mt-4 border-t-2 border-gray-900">
//                                                 <span className="text-xl font-serif font-medium text-gray-900">Total</span>
//                                                 <span className="text-2xl font-serif font-bold text-gray-900">PKR {getTotalPrice().toLocaleString()}</span>
//                                             </div>
//                                         </>
//                                     ) : (
//                                         <p className="text-center py-8 text-gray-500">Your cart is empty</p>
//                                     )}
//                                     <button onClick={handleContinueShopping} className="w-full bg-white text-gray-900 py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 mt-6 font-medium">Continue Shopping</button>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Checkout;




'use client';

import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CartContext } from '@/components/CartContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from '@/components/AxiosInstance';
import jsPDF from 'jspdf';

import {
    FaLock,
    FaArrowLeft,
    FaCcVisa,
    FaCcMastercard,
    FaCcPaypal,
    FaShieldAlt,
    FaTruck,
    FaCheckCircle,
    FaTag,
    FaAddressBook,
    FaPlus,
    FaEdit,
    FaTrash,
    FaHome,
    FaBuilding,
    FaMapMarkerAlt,
    FaUser,
    FaPhone,
    FaEnvelope
} from 'react-icons/fa';

import { BiPackage } from 'react-icons/bi';

const Checkout = () => {
    const {
        cartItems,
        clearCart,
        getRegularProducts,
        getSalesProducts
    } = useContext(CartContext);

    const router = useRouter();

    const [isLoading, setIsLoading] = useState(false);

    // ------------------------------------------------------------------------
    // Authentication
    // ------------------------------------------------------------------------

    const token =
        typeof window !== 'undefined'
            ? localStorage.getItem('token')
            : null;

    const isLoggedIn = !!token;

    // ------------------------------------------------------------------------
    // Saved addresses
    // ------------------------------------------------------------------------

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    const [showAddAddressForm, setShowAddAddressForm] =
        useState(false);

    const [editingAddress, setEditingAddress] = useState(null);

    const [addressForm, setAddressForm] = useState({
        label: 'home',
        full_name: '',
        phone: '',
        email: '',
        delivery_address: '',
        city: '',
        postal_code: '',
        is_default: false
    });

    // ------------------------------------------------------------------------
    // Checkout form
    // ------------------------------------------------------------------------

    const [form, setForm] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',

        // Used ONLY for guest checkout
        delivery_address: '',
        city: '',

        payment_method: 'credit_card'
    });

    // ------------------------------------------------------------------------
    // Cart products
    // ------------------------------------------------------------------------

    const regularProducts = getRegularProducts();
    const salesProducts = getSalesProducts();

    // ------------------------------------------------------------------------
    // Image helpers
    // ------------------------------------------------------------------------

    const processImageUrl = (url) => {
        if (!url || url.trim() === '') {
            return '/images/default-product.jpg';
        }

        if (
            url.startsWith('http://') ||
            url.startsWith('https://')
        ) {
            return url;
        }

        const baseURL =
            process.env.NEXT_PUBLIC_BACKEND_URL ||
            'http://localhost:8000';

        const cleanUrl =
            url.startsWith('/')
                ? url
                : `/${url}`;

        return `${baseURL}${cleanUrl}`;
    };

    const getMainImage = (item) => {
        if (
            item.image_urls &&
            Array.isArray(item.image_urls) &&
            item.image_urls.length > 0
        ) {
            return processImageUrl(item.image_urls[0]);
        }

        if (
            item.image_urls &&
            typeof item.image_urls === 'string'
        ) {
            return processImageUrl(item.image_urls);
        }

        if (item.image) {
            return processImageUrl(item.image);
        }

        if (item.mainImage) {
            return processImageUrl(item.mainImage);
        }

        return '/images/default-product.jpg';
    };

    // ------------------------------------------------------------------------
    // Fetch saved addresses
    // ------------------------------------------------------------------------

    const fetchAddresses = async () => {
        try {
            const currentToken =
                localStorage.getItem('token');

            if (!currentToken) {
                return;
            }

            const response = await AxiosInstance.get(
                '/api/myapp/v1/address/',
                {
                    headers: {
                        Authorization:
                            `Bearer ${currentToken}`
                    }
                }
            );

            console.log(
                'Addresses response:',
                response.data
            );

            let addressData = [];

            if (
                response.data &&
                Array.isArray(response.data)
            ) {
                addressData = response.data;

            } else if (
                response.data &&
                Array.isArray(response.data.data)
            ) {
                addressData = response.data.data;

            } else if (
                response.data &&
                Array.isArray(response.data.results)
            ) {
                addressData = response.data.results;

            } else if (response.data) {
                addressData = [
                    response.data
                ].filter(Boolean);
            }

            // Remove soft-deleted addresses
            addressData = addressData.filter(
                (address) => !address.deleted
            );

            setAddresses(addressData);

            // ------------------------------------------------------------
            // Preserve current selection if still valid
            // ------------------------------------------------------------

            const currentSelected =
                addressData.find(
                    (address) =>
                        address.id === selectedAddressId
                );

            if (currentSelected) {
                return;
            }

            // ------------------------------------------------------------
            // Automatically select default address
            // ------------------------------------------------------------

            const defaultAddress =
                addressData.find(
                    (address) =>
                        address.is_default
                );

            if (defaultAddress) {
                setSelectedAddressId(
                    defaultAddress.id
                );

                return;
            }

            // ------------------------------------------------------------
            // Otherwise select first address
            // ------------------------------------------------------------

            if (addressData.length > 0) {
                setSelectedAddressId(
                    addressData[0].id
                );
            } else {
                setSelectedAddressId(null);
            }

        } catch (error) {
            console.error(
                'Error fetching addresses:',
                error
            );

            if (
                error.response?.status === 401
            ) {
                toast.info(
                    'Please login to use saved addresses'
                );
            } else {
                toast.error(
                    'Failed to load saved addresses'
                );
            }
        }
    };

    // ------------------------------------------------------------------------
    // Load user information
    // ------------------------------------------------------------------------

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            const storedUser =
                localStorage.getItem('user');

            const userData =
                storedUser
                    ? JSON.parse(storedUser)
                    : null;

            if (userData) {
                setForm((prev) => ({
                    ...prev,

                    customer_name:
                        userData.name || '',

                    customer_email:
                        userData.email || '',

                    customer_phone:
                        userData.phone || ''
                }));

                setAddressForm((prev) => ({
                    ...prev,

                    full_name:
                        userData.name || '',

                    phone:
                        userData.phone || '',

                    email:
                        userData.email || ''
                }));
            }

        } catch (error) {
            console.error(
                'Error loading user data:',
                error
            );
        }
    }, []);

    // ------------------------------------------------------------------------
    // Fetch addresses when logged in
    // ------------------------------------------------------------------------

    useEffect(() => {
        if (isLoggedIn) {
            fetchAddresses();
        }
    }, [isLoggedIn]);

    // ------------------------------------------------------------------------
    // Get selected address
    // ------------------------------------------------------------------------

    const getSelectedAddress = () => {
        return addresses.find(
            (address) =>
                address.id === selectedAddressId
        );
    };

    // ------------------------------------------------------------------------
    // Address selection
    // ------------------------------------------------------------------------

    const handleAddressSelect = (addressId) => {
        setSelectedAddressId(addressId);

        const selectedAddress =
            addresses.find(
                (address) =>
                    address.id === addressId
            );

        if (selectedAddress) {
            /*
             * This only updates the UI/customer information.
             *
             * The backend remains responsible for validating
             * address ownership and obtaining the trusted
             * delivery_address/city values from the database.
             */
            setForm((prev) => ({
                ...prev,

                customer_name:
                    selectedAddress.full_name ||
                    prev.customer_name,

                customer_phone:
                    selectedAddress.phone ||
                    prev.customer_phone,

                customer_email:
                    selectedAddress.email ||
                    prev.customer_email
            }));
        }
    };

    // ------------------------------------------------------------------------
    // Address form change
    // ------------------------------------------------------------------------

    const handleAddressFormChange = (e) => {
        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setAddressForm((prev) => ({
            ...prev,

            [name]:
                type === 'checkbox'
                    ? checked
                    : value
        }));
    };

    // ------------------------------------------------------------------------
    // Save / update address
    // ------------------------------------------------------------------------

    const handleAddressFormSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        // ------------------------------------------------------------
        // Validation
        // ------------------------------------------------------------

        if (!addressForm.full_name.trim()) {
            toast.error(
                'Full name is required'
            );
            return;
        }

        if (!addressForm.phone.trim()) {
            toast.error(
                'Phone number is required'
            );
            return;
        }

        if (
            !addressForm.delivery_address.trim()
        ) {
            toast.error(
                'Delivery address is required'
            );
            return;
        }

        if (!addressForm.city.trim()) {
            toast.error(
                'City is required'
            );
            return;
        }

        setIsLoading(true);

        try {
            const currentToken =
                localStorage.getItem('token');

            if (!currentToken) {
                toast.error(
                    'Please login to save addresses'
                );
                return;
            }

            const addressData = {
                label:
                    addressForm.label,

                full_name:
                    addressForm.full_name.trim(),

                phone:
                    addressForm.phone.trim(),

                email:
                    addressForm.email?.trim() || '',

                delivery_address:
                    addressForm.delivery_address.trim(),

                city:
                    addressForm.city.trim(),

                postal_code:
                    addressForm.postal_code?.trim() || '',

                is_default:
                    Boolean(addressForm.is_default)
            };

            let response;

            // --------------------------------------------------------
            // Update existing address
            // --------------------------------------------------------

            if (editingAddress) {
                response =
                    await AxiosInstance.patch(
                        `/api/myapp/v1/address/?id=${editingAddress.id}`,
                        addressData,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${currentToken}`,

                                'Content-Type':
                                    'application/json'
                            }
                        }
                    );

                toast.success(
                    'Address updated successfully!'
                );

            } else {

                // ----------------------------------------------------
                // Create new address
                // ----------------------------------------------------

                response =
                    await AxiosInstance.post(
                        '/api/myapp/v1/address/',
                        addressData,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${currentToken}`,

                                'Content-Type':
                                    'application/json'
                            }
                        }
                    );

                toast.success(
                    'Address added successfully!'
                );
            }

            console.log(
                'Address save response:',
                response.data
            );

            // --------------------------------------------------------
            // Reset address form
            // --------------------------------------------------------

            setAddressForm({
                label: 'home',

                full_name:
                    form.customer_name || '',

                phone:
                    form.customer_phone || '',

                email:
                    form.customer_email || '',

                delivery_address: '',

                city: '',

                postal_code: '',

                is_default: false
            });

            setShowAddAddressForm(false);
            setEditingAddress(null);

            // --------------------------------------------------------
            // Reload addresses
            // --------------------------------------------------------

            await fetchAddresses();

        } catch (error) {
            console.error(
                'Error saving address:',
                error
            );

            let errorMsg =
                'Failed to save address';

            const data =
                error.response?.data;

            if (data?.message) {
                errorMsg = data.message;

            } else if (data?.error) {
                errorMsg = data.error;

            } else if (data?.detail) {
                errorMsg = data.detail;

            } else if (typeof data === 'object') {

                const firstError =
                    Object.values(data)
                        .flat()
                        .find(Boolean);

                if (firstError) {
                    errorMsg = firstError;
                }
            }

            toast.error(errorMsg);

        } finally {
            setIsLoading(false);
        }
    };

    // ------------------------------------------------------------------------
    // Delete address
    // ------------------------------------------------------------------------

    const handleDeleteAddress = async (
        addressId
    ) => {
        if (
            !confirm(
                'Are you sure you want to delete this address?'
            )
        ) {
            return;
        }

        try {
            const currentToken =
                localStorage.getItem('token');

            if (!currentToken) {
                toast.error(
                    'Please login first'
                );
                return;
            }

            await AxiosInstance.delete(
                `/api/myapp/v1/address/?id=${addressId}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${currentToken}`
                    }
                }
            );

            toast.success(
                'Address deleted'
            );

            if (
                selectedAddressId === addressId
            ) {
                setSelectedAddressId(null);
            }

            await fetchAddresses();

        } catch (error) {
            console.error(
                'Error deleting address:',
                error
            );

            if (
                error.response?.status === 401
            ) {
                toast.error(
                    'Your session has expired. Please login again.'
                );
            } else if (
                error.response?.status === 403
            ) {
                toast.error(
                    'You do not have permission to delete this address.'
                );
            } else {
                toast.error(
                    'Failed to delete address'
                );
            }
        }
    };

    // ------------------------------------------------------------------------
    // Edit address
    // ------------------------------------------------------------------------

    const handleEditAddress = (address) => {
        setEditingAddress(address);

        setAddressForm({
            label:
                address.label || 'home',

            full_name:
                address.full_name || '',

            phone:
                address.phone || '',

            email:
                address.email || '',

            delivery_address:
                address.delivery_address || '',

            city:
                address.city || '',

            postal_code:
                address.postal_code || '',

            is_default:
                Boolean(address.is_default)
        });

        setShowAddAddressForm(true);
    };

    // ------------------------------------------------------------------------
    // Address icon
    // ------------------------------------------------------------------------

    const getAddressIcon = (label) => {
        switch (label) {
            case 'home':
                return (
                    <FaHome className="w-4 h-4" />
                );

            case 'work':
                return (
                    <FaBuilding className="w-4 h-4" />
                );

            default:
                return (
                    <FaMapMarkerAlt className="w-4 h-4" />
                );
        }
    };

    // ------------------------------------------------------------------------
    // General form change
    // ------------------------------------------------------------------------

    const handleChange = (e) => {
        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setForm((prev) => ({
            ...prev,

            [name]:
                type === 'checkbox'
                    ? checked
                    : value
        }));
    };

    // ------------------------------------------------------------------------
    // Cart calculations
    // ------------------------------------------------------------------------

    const getUnitPrice = (item) => {
        if (
            item.final_price !== undefined &&
            item.final_price !== null
        ) {
            return Number(item.final_price);
        }

        return Number(item.price) || 0;
    };

    const getTotalPrice = () => {
        return cartItems.reduce(
            (total, item) => {
                return (
                    total +
                    getUnitPrice(item) *
                    (item.quantity || 1)
                );
            },
            0
        );
    };

    const calculateTotalSavings = () => {
        return cartItems.reduce(
            (savings, item) => {
                if (
                    item.original_price &&
                    item.final_price &&
                    parseFloat(
                        item.original_price
                    ) >
                    parseFloat(
                        item.final_price
                    )
                ) {
                    return (
                        savings +
                        (
                            parseFloat(
                                item.original_price
                            ) -
                            parseFloat(
                                item.final_price
                            )
                        ) *
                        (item.quantity || 1)
                    );
                }

                return savings;
            },
            0
        );
    };

    // ------------------------------------------------------------------------
    // Product type helper
    // ------------------------------------------------------------------------

    const isSalesProduct = (item) => {
        return (
            item.productType ===
                'sales_product' ||

            item.productType ===
                'sale' ||

            item.type ===
                'sales_product' ||

            item.type ===
                'sale' ||

            item.isSalesProduct === true ||

            (
                item.final_price !==
                    undefined &&

                item.original_price !==
                    undefined &&

                parseFloat(
                    item.final_price
                ) <
                parseFloat(
                    item.original_price
                )
            ) ||

            (
                item.discount_percent &&
                item.discount_percent > 0
            )
        );
    };

    // ------------------------------------------------------------------------
    // Invoice generation
    // ------------------------------------------------------------------------

    const generateInvoice = (orderData) => {
        try {
            const doc = new jsPDF();

            doc.setProperties({
                title:
                    `Invoice #${orderData.order_id}`,

                subject:
                    'Invoice from GOHAR COLLECTION',

                author:
                    'GOHAR COLLECTION'
            });

            // --------------------------------------------------------
            // Header
            // --------------------------------------------------------

            doc.setFillColor(
                26,
                26,
                26
            );

            doc.rect(
                0,
                0,
                210,
                35,
                'F'
            );

            doc.setTextColor(
                255,
                255,
                255
            );

            doc.setFontSize(24);

            doc.setFont(
                undefined,
                'bold'
            );

            doc.text(
                'GOHAR COLLECTION',
                105,
                18,
                {
                    align: 'center'
                }
            );

            doc.setFontSize(10);

            doc.setFont(
                undefined,
                'normal'
            );

            doc.text(
                'Premium Luxury Products',
                105,
                26,
                {
                    align: 'center'
                }
            );

            // --------------------------------------------------------
            // Invoice details
            // --------------------------------------------------------

            doc.setFontSize(14);

            doc.setTextColor(
                26,
                26,
                26
            );

            doc.setFont(
                undefined,
                'bold'
            );

            doc.text(
                'INVOICE',
                20,
                50
            );

            doc.setFont(
                undefined,
                'normal'
            );

            doc.setFontSize(10);

            doc.setTextColor(
                100,
                100,
                100
            );

            doc.text(
                `Date: ${new Date().toLocaleDateString()}`,
                160,
                50
            );

            doc.text(
                `Invoice #: ${orderData.order_id}`,
                160,
                56
            );

            doc.text(
                `Status: ${orderData.status}`,
                160,
                62
            );

            // --------------------------------------------------------
            // From
            // --------------------------------------------------------

            doc.setFontSize(10);

            doc.setTextColor(
                100,
                100,
                100
            );

            doc.text(
                'FROM:',
                20,
                75
            );

            doc.setFont(
                undefined,
                'bold'
            );

            doc.setTextColor(
                26,
                26,
                26
            );

            doc.text(
                'GOHAR COLLECTION',
                20,
                82
            );

            doc.setFont(
                undefined,
                'normal'
            );

            doc.setTextColor(
                100,
                100,
                100
            );

            doc.text(
                'Sector D, DHA 2, Islamabad',
                20,
                88
            );

            doc.text(
                'Pakistan',
                20,
                94
            );

            doc.text(
                'contact@goharcollection.com',
                20,
                100
            );

            // --------------------------------------------------------
            // To
            // --------------------------------------------------------

            doc.setTextColor(
                100,
                100,
                100
            );

            doc.text(
                'TO:',
                20,
                115
            );

            doc.setFont(
                undefined,
                'bold'
            );

            doc.setTextColor(
                26,
                26,
                26
            );

            doc.text(
                orderData.customer_info.name || '',
                20,
                122
            );

            doc.setFont(
                undefined,
                'normal'
            );

            doc.setTextColor(
                100,
                100,
                100
            );

            doc.text(
                orderData.delivery_info.address || '',
                20,
                128
            );

            doc.text(
                orderData.delivery_info.city || '',
                20,
                134
            );

            doc.text(
                orderData.customer_info.phone || '',
                20,
                140
            );

            doc.text(
                orderData.customer_info.email || '',
                20,
                146
            );

            // --------------------------------------------------------
            // Table header
            // --------------------------------------------------------

            doc.setFillColor(
                245,
                245,
                245
            );

            doc.rect(
                20,
                160,
                170,
                10,
                'F'
            );

            doc.setTextColor(
                26,
                26,
                26
            );

            doc.setFont(
                undefined,
                'bold'
            );

            doc.setFontSize(9);

            doc.text(
                'PRODUCT',
                25,
                166
            );

            doc.text(
                'TYPE',
                85,
                166
            );

            doc.text(
                'UNIT PRICE',
                115,
                166
            );

            doc.text(
                'QTY',
                150,
                166
            );

            doc.text(
                'TOTAL',
                170,
                166
            );

            // --------------------------------------------------------
            // Table content
            // --------------------------------------------------------

            doc.setFont(
                undefined,
                'normal'
            );

            let yPosition = 176;

            const invoiceItems =
                orderData.order_summary?.items ||
                [];

            invoiceItems.forEach(
                (item, index) => {

                    if (index % 2 === 0) {
                        doc.setFillColor(
                            250,
                            250,
                            250
                        );

                        doc.rect(
                            20,
                            yPosition - 5,
                            170,
                            8,
                            'F'
                        );
                    }

                    doc.setTextColor(
                        60,
                        60,
                        60
                    );

                    const productName =
                        item.product_name || '';

                    const displayName =
                        productName.length > 25
                            ? productName.substring(
                                  0,
                                  25
                              ) + '...'
                            : productName;

                    doc.text(
                        displayName,
                        25,
                        yPosition
                    );

                    const typeText =
                        item.product_type ===
                        'sales_product'
                            ? 'Sale'
                            : 'Regular';

                    if (
                        item.product_type ===
                        'sales_product'
                    ) {
                        doc.setTextColor(
                            220,
                            38,
                            38
                        );
                    } else {
                        doc.setTextColor(
                            60,
                            60,
                            60
                        );
                    }

                    doc.text(
                        typeText,
                        85,
                        yPosition
                    );

                    doc.setTextColor(
                        60,
                        60,
                        60
                    );

                    doc.text(
                        `PKR ${Number(
                            item.unit_price || 0
                        ).toLocaleString()}`,
                        115,
                        yPosition
                    );

                    doc.text(
                        `${item.quantity || 1}`,
                        150,
                        yPosition
                    );

                    doc.text(
                        `PKR ${Number(
                            item.total_price || 0
                        ).toLocaleString()}`,
                        170,
                        yPosition
                    );

                    yPosition += 10;
                }
            );

            // --------------------------------------------------------
            // Totals
            // --------------------------------------------------------

            yPosition += 10;

            doc.setDrawColor(
                220,
                220,
                220
            );

            doc.line(
                20,
                yPosition,
                190,
                yPosition
            );

            yPosition += 10;

            doc.setFont(
                undefined,
                'normal'
            );

            doc.setTextColor(
                100,
                100,
                100
            );

            doc.text(
                'Subtotal:',
                140,
                yPosition
            );

            doc.setTextColor(
                26,
                26,
                26
            );

            doc.text(
                `PKR ${Number(
                    orderData.order_summary?.total || 0
                ).toLocaleString()}`,
                170,
                yPosition
            );

            yPosition += 8;

            doc.setTextColor(
                100,
                100,
                100
            );

            doc.text(
                'Shipping:',
                140,
                yPosition
            );

            doc.setTextColor(
                34,
                197,
                94
            );

            doc.text(
                'FREE',
                170,
                yPosition
            );

            yPosition += 8;

            doc.setTextColor(
                100,
                100,
                100
            );

            doc.text(
                'Tax:',
                140,
                yPosition
            );

            doc.setTextColor(
                26,
                26,
                26
            );

            doc.text(
                'PKR 0',
                170,
                yPosition
            );

            // --------------------------------------------------------
            // Grand total
            // --------------------------------------------------------

            yPosition += 12;

            doc.setFillColor(
                26,
                26,
                26
            );

            doc.rect(
                130,
                yPosition - 5,
                60,
                12,
                'F'
            );

            doc.setFont(
                undefined,
                'bold'
            );

            doc.setFontSize(11);

            doc.setTextColor(
                255,
                255,
                255
            );

            doc.text(
                'TOTAL:',
                135,
                yPosition + 2
            );

            doc.text(
                `PKR ${Number(
                    orderData.order_summary?.total || 0
                ).toLocaleString()}`,
                165,
                yPosition + 2
            );

            // --------------------------------------------------------
            // Footer
            // --------------------------------------------------------

            doc.setFontSize(8);

            doc.setTextColor(
                100,
                100,
                100
            );

            doc.setFont(
                undefined,
                'italic'
            );

            doc.text(
                'Thank you for choosing GOHAR COLLECTION',
                105,
                270,
                {
                    align: 'center'
                }
            );

            doc.setFont(
                undefined,
                'normal'
            );

            doc.text(
                'Terms & Conditions: Payment due within 15 days. All sales are final.',
                105,
                276,
                {
                    align: 'center'
                }
            );

            doc.text(
                'GOHAR COLLECTION | Sector D, DHA 2, Islamabad | contact@goharcollection.com',
                105,
                282,
                {
                    align: 'center'
                }
            );

            doc.setDrawColor(
                26,
                26,
                26
            );

            doc.setLineWidth(0.5);

            doc.rect(
                10,
                10,
                190,
                277
            );

            doc.save(
                `invoice-${orderData.order_id}.pdf`
            );

        } catch (error) {
            console.error(
                'Error generating invoice:',
                error
            );

            toast.error(
                'Failed to generate invoice, but order was placed successfully'
            );
        }
    };

    // ------------------------------------------------------------------------
    // Prepare confirmation data
    // ------------------------------------------------------------------------

    const prepareOrderDataForConfirmation = (
        apiResponse
    ) => {

        let orderId;

        if (apiResponse?.order_id) {
            orderId =
                apiResponse.order_id;

        } else if (apiResponse?.id) {
            orderId =
                apiResponse.id;

        } else if (
            apiResponse?.order?.id
        ) {
            orderId =
                apiResponse.order.id;

        } else {
            orderId = Date.now();
        }

        const status =
            apiResponse?.status ||
            apiResponse?.order_status ||
            'Confirmed';

        // ------------------------------------------------------------
        // Prefer trusted backend response
        // ------------------------------------------------------------

        let deliveryAddress = '';
        let city = '';

        if (
            apiResponse?.delivery_info
        ) {

            deliveryAddress =
                apiResponse.delivery_info.address ||
                '';

            city =
                apiResponse.delivery_info.city ||
                '';

        } else if (
            apiResponse?.delivery_address ||
            apiResponse?.city
        ) {

            deliveryAddress =
                apiResponse.delivery_address ||
                '';

            city =
                apiResponse.city ||
                '';

        } else if (isLoggedIn) {

            // Frontend fallback only for confirmation UI
            const selected =
                getSelectedAddress();

            if (selected) {
                deliveryAddress =
                    selected.delivery_address ||
                    '';

                city =
                    selected.city ||
                    '';
            }

        } else {

            // Guest fallback
            deliveryAddress =
                form.delivery_address ||
                '';

            city =
                form.city ||
                '';
        }

        return {
            order_id: orderId,

            customer_info: {
                name:
                    form.customer_name,

                email:
                    form.customer_email,

                phone:
                    form.customer_phone
            },

            delivery_info: {
                address:
                    deliveryAddress,

                city:
                    city,

                estimated_date:
                    new Date(
                        Date.now() +
                        3 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString()
            },

            payment_method:
                form.payment_method,

            payment_status: true,

            status: status,

            order_summary: {
                items:
                    cartItems.map(
                        (item) => ({
                            product_name:
                                item.name,

                            product_type:
                                item.isSalesProduct
                                    ? 'sales_product'
                                    : 'product',

                            unit_price:
                                getUnitPrice(item),

                            quantity:
                                item.quantity || 1,

                            total_price:
                                getUnitPrice(item) *
                                (item.quantity || 1),

                            image_url:
                                getMainImage(item)
                        })
                    ),

                subtotal:
                    getTotalPrice(),

                total:
                    getTotalPrice()
            }
        };
    };

    // ------------------------------------------------------------------------
    // MAIN SUBMIT
    // ------------------------------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ------------------------------------------------------------
        // Cart validation
        // ------------------------------------------------------------

        if (cartItems.length === 0) {
            toast.error(
                'Your cart is empty'
            );
            return;
        }

        // ------------------------------------------------------------
        // Customer validation
        // ------------------------------------------------------------

        if (!form.customer_name.trim()) {
            toast.error(
                'Please enter your full name'
            );
            return;
        }

        if (!form.customer_email.trim()) {
            toast.error(
                'Please enter your email'
            );
            return;
        }

        if (!form.customer_phone.trim()) {
            toast.error(
                'Please enter your phone number'
            );
            return;
        }

        // ------------------------------------------------------------
        // Build base order payload
        // ------------------------------------------------------------

        const orderData = {
            customer_name:
                form.customer_name.trim(),

            customer_email:
                form.customer_email.trim(),

            customer_phone:
                form.customer_phone.trim(),

            payment_method:
                form.payment_method,

            items:
                cartItems.map(
                    (item) => ({
                        product_type:
                            item.isSalesProduct
                                ? 'sales_product'
                                : 'product',

                        product_id:
                            item.id,

                        quantity:
                            item.quantity || 1
                    })
                )
        };

        // ------------------------------------------------------------
        // LOGGED-IN CUSTOMER
        // ------------------------------------------------------------

        if (isLoggedIn) {

            /*
             * IMPORTANT SECURITY RULE
             *
             * Logged-in customers must use a saved address.
             *
             * Only address_id is sent.
             *
             * We intentionally DO NOT send:
             *
             *   delivery_address
             *   city
             *
             * The backend validates:
             *
             *   address.id
             *   address.user == request.user
             *   address.deleted == False
             *
             * Then it reads:
             *
             *   address.delivery_address
             *   address.city
             *
             * and stores those values on the Order snapshot.
             */

            if (
                selectedAddressId === null ||
                selectedAddressId === undefined
            ) {
                toast.error(
                    'Please select a delivery address'
                );
                return;
            }

            const selectedAddress =
                getSelectedAddress();

            if (!selectedAddress) {
                toast.error(
                    'Selected address not found. Please select another address.'
                );
                return;
            }

            // Only send trusted identifier.
            orderData.address_id =
                selectedAddress.id;

        } else {

            // --------------------------------------------------------
            // GUEST CUSTOMER
            // --------------------------------------------------------

            /*
             * Guests cannot use address_id.
             *
             * They must provide their address directly.
             */

            if (
                !form.delivery_address?.trim()
            ) {
                toast.error(
                    'Please enter your delivery address'
                );
                return;
            }

            if (!form.city?.trim()) {
                toast.error(
                    'Please enter your city'
                );
                return;
            }

            orderData.delivery_address =
                form.delivery_address.trim();

            orderData.city =
                form.city.trim();
        }

        console.log(
            'Final order payload:',
            orderData
        );

        setIsLoading(true);

        try {
            // --------------------------------------------------------
            // Request headers
            // --------------------------------------------------------

            const headers = {
                'Content-Type':
                    'application/json'
            };

            if (token) {
                headers.Authorization =
                    `Bearer ${token}`;
            }

            // --------------------------------------------------------
            // Create order
            // --------------------------------------------------------

            const response =
                await AxiosInstance.post(
                    '/api/myapp/v1/public/order/',
                    orderData,
                    {
                        headers
                    }
                );

            console.log(
                'Full API Response:',
                response
            );

            console.log(
                'Response data:',
                response.data
            );

            // --------------------------------------------------------
            // Normalize API response
            // --------------------------------------------------------

            let orderResponse;

            if (
                response.data?.data
            ) {
                orderResponse =
                    response.data.data;

            } else if (
                response.data
            ) {
                orderResponse =
                    response.data;

            } else {
                orderResponse =
                    response;
            }

            // --------------------------------------------------------
            // Prepare confirmation
            // --------------------------------------------------------

            const confirmationData =
                prepareOrderDataForConfirmation(
                    orderResponse
                );

            console.log(
                'Confirmation data:',
                confirmationData
            );

            // --------------------------------------------------------
            // Generate invoice
            // --------------------------------------------------------

            generateInvoice(
                confirmationData
            );

            // --------------------------------------------------------
            // Clear cart
            // --------------------------------------------------------

            clearCart();

            // --------------------------------------------------------
            // Save order for confirmation page
            // --------------------------------------------------------

            localStorage.setItem(
                'latestOrder',
                JSON.stringify(
                    confirmationData
                )
            );

            // --------------------------------------------------------
            // Success
            // --------------------------------------------------------

            toast.success(
                'Order placed successfully!',
                {
                    position:
                        'top-center',

                    autoClose: 2000,

                    hideProgressBar:
                        false,

                    closeOnClick:
                        true,

                    pauseOnHover:
                        true,

                    draggable:
                        true,

                    theme:
                        'light'
                }
            );

            setTimeout(() => {
                router.push(
                    '/orderconfirmation'
                );
            }, 2000);

        } catch (error) {

            console.error(
                'Full error object:',
                error
            );

            console.error(
                'Error response:',
                error.response
            );

            let errorMsg =
                'Failed to place order';

            // --------------------------------------------------------
            // Server response
            // --------------------------------------------------------

            if (error.response) {

                const status =
                    error.response.status;

                const errorData =
                    error.response.data;

                console.error(
                    'Error response data:',
                    errorData
                );

                console.error(
                    'Error response status:',
                    status
                );

                // ----------------------------------------------------
                // Validation error
                // ----------------------------------------------------

                if (status === 400) {

                    /*
                     * DRF can return:
                     *
                     * {
                     *   "address_id": [
                     *       "Invalid address..."
                     *   ]
                     * }
                     *
                     * So handle field errors first.
                     */

                    if (
                        errorData?.address_id
                    ) {

                        errorMsg =
                            Array.isArray(
                                errorData.address_id
                            )
                                ? errorData.address_id[0]
                                : errorData.address_id;

                    } else if (
                        errorData?.customer_email
                    ) {

                        errorMsg =
                            Array.isArray(
                                errorData.customer_email
                            )
                                ? errorData.customer_email[0]
                                : errorData.customer_email;

                    } else if (
                        errorData?.message
                    ) {

                        errorMsg =
                            errorData.message;

                    } else if (
                        errorData?.error
                    ) {

                        errorMsg =
                            errorData.error;

                    } else if (
                        errorData?.detail
                    ) {

                        errorMsg =
                            errorData.detail;

                    } else if (
                        typeof errorData === 'object'
                    ) {

                        const firstError =
                            Object.values(
                                errorData
                            )
                                .flat()
                                .find(Boolean);

                        if (firstError) {
                            errorMsg =
                                firstError;
                        } else {
                            errorMsg =
                                'Validation error - please check your input';
                        }

                    } else {

                        errorMsg =
                            'Validation error - please check your input';
                    }

                // ----------------------------------------------------
                // Unauthorized
                // ----------------------------------------------------

                } else if (status === 401) {

                    errorMsg =
                        'Your session has expired. Please login again.';

                // ----------------------------------------------------
                // Forbidden
                // ----------------------------------------------------

                } else if (status === 403) {

                    errorMsg =
                        'You do not have permission to perform this action';

                // ----------------------------------------------------
                // Server error
                // ----------------------------------------------------

                } else if (status >= 500) {

                    errorMsg =
                        'Server error - please try again later';

                } else {

                    errorMsg =
                        errorData?.message ||
                        errorData?.error ||
                        errorData?.detail ||
                        `Server error: ${status}`;
                }

            } else if (error.request) {

                errorMsg =
                    'No response from server - please check your connection';

            } else {

                errorMsg =
                    error.message ||
                    'Unknown error occurred';
            }

            toast.error(
                errorMsg,
                {
                    position:
                        'top-center',

                    autoClose:
                        5000
                }
            );

        } finally {
            setIsLoading(false);
        }
    };

    // ------------------------------------------------------------------------
    // Continue shopping
    // ------------------------------------------------------------------------

    const handleContinueShopping = () => {
        router.push(
            '/publicproducts'
        );
    };

    // ------------------------------------------------------------------------
    // Render cart summary
    // ------------------------------------------------------------------------

    const renderCartSummary = (
        items,
        title,
        bgColor = 'bg-gray-50'
    ) => {

        if (items.length === 0) {
            return null;
        }

        const isSale =
            title.includes('Sale');

        return (
            <div
                className={`mb-6 ${bgColor} rounded-xl p-4`}
            >
                <div className="flex items-center justify-between mb-4">

                    <div className="flex items-center space-x-2">

                        {isSale && (
                            <FaTag className="text-red-500 w-4 h-4" />
                        )}

                        <h4 className="text-sm font-semibold text-gray-900">
                            {title}
                        </h4>

                        <span className="text-xs text-gray-500">
                            ({items.length}{' '}
                            {items.length === 1
                                ? 'item'
                                : 'items'}
                            )
                        </span>

                    </div>
                </div>

                <div className="space-y-4">

                    {items.map((item) => {

                        const unitPrice =
                            getUnitPrice(item);

                        const isOnSale =
                            isSalesProduct(item);

                        const uniqueKey =
                            `${item.isSalesProduct ? 'sales' : 'product'}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;

                        return (
                            <div
                                key={uniqueKey}
                                className="flex items-start space-x-4 bg-white rounded-lg p-3"
                            >

                                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">

                                    <img
                                        src={getMainImage(item)}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src =
                                                '/images/default-product.jpg';
                                        }}
                                    />

                                    {isOnSale && (
                                        <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
                                            {item.discount_percent
                                                ? `${item.discount_percent}%`
                                                : 'SALE'}
                                        </div>
                                    )}

                                </div>

                                <div className="flex-1 min-w-0">

                                    <h5 className="text-sm font-medium text-gray-900 truncate">
                                        {item.name}
                                    </h5>

                                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">

                                        <span>
                                            Qty:{' '}
                                            {item.quantity || 1}
                                        </span>

                                        {item.color && (
                                            <>
                                                <span>•</span>
                                                <span>
                                                    {item.color}
                                                </span>
                                            </>
                                        )}

                                        {item.size && (
                                            <>
                                                <span>•</span>
                                                <span>
                                                    {item.size}
                                                </span>
                                            </>
                                        )}

                                    </div>

                                    <div className="mt-2">

                                        {isOnSale &&
                                        item.original_price &&
                                        parseFloat(
                                            item.original_price
                                        ) >
                                            unitPrice ? (

                                            <div className="flex items-center space-x-2">

                                                <span className="text-xs text-gray-400 line-through">
                                                    PKR{' '}
                                                    {parseFloat(
                                                        item.original_price
                                                    ).toLocaleString()}
                                                </span>

                                                <span className="text-sm font-bold text-red-600">
                                                    PKR{' '}
                                                    {unitPrice.toLocaleString()}
                                                </span>

                                            </div>

                                        ) : (

                                            <span className="text-sm font-medium text-gray-900">
                                                PKR{' '}
                                                {unitPrice.toLocaleString()}
                                            </span>
                                        )}

                                    </div>
                                </div>

                                <div className="text-right">

                                    <p className="text-sm font-bold text-gray-900">
                                        PKR{' '}
                                        {(
                                            unitPrice *
                                            (item.quantity || 1)
                                        ).toLocaleString()}
                                    </p>

                                </div>

                            </div>
                        );
                    })}

                </div>
            </div>
        );
    };

    // ------------------------------------------------------------------------
    // Render saved address selection
    // ------------------------------------------------------------------------

    const renderAddressSelection = () => {
        return (
            <div className="mb-10">

                <div className="flex items-center justify-between mb-6">

                    <div className="flex items-center space-x-2">

                        <FaAddressBook className="text-gray-700 w-5 h-5" />

                        <h3 className="text-xl font-serif font-medium text-gray-900">
                            Delivery Address
                        </h3>

                    </div>

                    <button
                        type="button"
                        onClick={() => {

                            setEditingAddress(null);

                            setAddressForm({
                                label: 'home',

                                full_name:
                                    form.customer_name || '',

                                phone:
                                    form.customer_phone || '',

                                email:
                                    form.customer_email || '',

                                delivery_address: '',

                                city: '',

                                postal_code: '',

                                is_default: false
                            });

                            setShowAddAddressForm(
                                (prev) => !prev
                            );
                        }}
                        className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <FaPlus className="mr-1" />

                        {showAddAddressForm
                            ? 'Cancel'
                            : 'Add New Address'}
                    </button>

                </div>

                {/* ----------------------------------------------------------
                    Existing Addresses
                ---------------------------------------------------------- */}

                {addresses.length > 0 && (

                    <div className="space-y-3 mb-6">

                        {addresses.map(
                            (address) => (

                                <div
                                    key={address.id}
                                    className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                        selectedAddressId ===
                                        address.id
                                            ? 'border-gray-900 bg-gray-50 shadow-md'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() =>
                                        handleAddressSelect(
                                            address.id
                                        )
                                    }
                                >

                                    <div className="flex items-start">

                                        <input
                                            type="radio"
                                            name="selected_address"
                                            checked={
                                                selectedAddressId ===
                                                address.id
                                            }
                                            onChange={() =>
                                                handleAddressSelect(
                                                    address.id
                                                )
                                            }
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                            className="mt-1 w-5 h-5 text-gray-900 focus:ring-gray-900"
                                        />

                                        <div className="ml-3 flex-1">

                                            <div className="flex items-center justify-between">

                                                <div className="flex items-center space-x-2">

                                                    {getAddressIcon(
                                                        address.label
                                                    )}

                                                    <span className="text-sm font-medium text-gray-900">
                                                        {(address.label || 'address')
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            (address.label || 'address').slice(1)}
                                                    </span>

                                                    {address.is_default && (
                                                        <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded-full">
                                                            Default
                                                        </span>
                                                    )}

                                                </div>

                                                <div className="flex items-center space-x-2">

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditAddress(address);
                                                        }}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        <FaEdit className="w-4 h-4" />
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteAddress(address.id);
                                                        }}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>

                                                </div>

                                            </div>

                                            <p className="text-sm text-gray-700 mt-1 font-medium">
                                                {address.full_name}
                                            </p>

                                            <p className="text-sm text-gray-600">
                                                {address.delivery_address}
                                            </p>

                                            <p className="text-sm text-gray-600">
                                                {address.city}
                                                {address.postal_code ? `, ${address.postal_code}` : ''}
                                            </p>

                                            <p className="text-sm text-gray-600">
                                                <FaPhone className="inline w-3 h-3 mr-1" />
                                                {address.phone}
                                                {address.email && (
                                                    <>
                                                        <span className="mx-2">•</span>
                                                        <FaEnvelope className="inline w-3 h-3 mr-1" />
                                                        {address.email}
                                                    </>
                                                )}
                                            </p>

                                        </div>
                                    </div>
                                </div>
                            )
                        )}

                    </div>
                )}

                {/* ----------------------------------------------------------
                    Add/Edit Address
                ---------------------------------------------------------- */}

                {showAddAddressForm && (

                    <div className="bg-gray-50 p-6 rounded-xl border-2 border-gray-200">

                        <h4 className="text-lg font-medium text-gray-900 mb-4">
                            {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h4>

                        <div className="space-y-4">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Label */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Label *
                                    </label>

                                    <select
                                        name="label"
                                        value={addressForm.label}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                        required
                                    >
                                        <option value="home">Home</option>
                                        <option value="work">Work</option>
                                        <option value="other">Other</option>
                                    </select>

                                </div>

                                {/* Full name */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="full_name"
                                        value={addressForm.full_name}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                        required
                                    />

                                </div>

                                {/* Phone */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone *
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={addressForm.phone}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                        required
                                    />

                                </div>

                                {/* Email */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={addressForm.email}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    />

                                </div>

                                {/* Delivery address */}

                                <div className="md:col-span-2">

                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Delivery Address *
                                    </label>

                                    <input
                                        type="text"
                                        name="delivery_address"
                                        value={addressForm.delivery_address}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                        placeholder="House/Street/Area"
                                        required
                                    />

                                </div>

                                {/* City */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City *
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={addressForm.city}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                        required
                                    />

                                </div>

                                {/* Postal code */}

                                <div>

                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Postal Code
                                    </label>

                                    <input
                                        type="text"
                                        name="postal_code"
                                        value={addressForm.postal_code}
                                        onChange={handleAddressFormChange}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
                                    />

                                </div>

                            </div>

                            {/* Default */}

                            <div className="flex items-center space-x-2">

                                <input
                                    type="checkbox"
                                    name="is_default"
                                    checked={addressForm.is_default}
                                    onChange={handleAddressFormChange}
                                    className="w-4 h-4 text-gray-900 focus:ring-gray-900"
                                />

                                <label className="text-sm text-gray-700">
                                    Set as default address
                                </label>

                            </div>

                            {/* Buttons */}

                            <div className="flex space-x-3 pt-2">

                                <button
                                    type="button"
                                    onClick={handleAddressFormSubmit}
                                    disabled={isLoading}
                                    className="bg-gray-900 text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {isLoading
                                        ? 'Saving...'
                                        : editingAddress
                                            ? 'Update Address'
                                            : 'Save Address'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddAddressForm(false);
                                        setEditingAddress(null);
                                    }}
                                    className="bg-gray-200 text-gray-700 px-6 py-2 rounded-xl hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>
                    </div>
                )}

                {/* No addresses */}

                {addresses.length === 0 && !showAddAddressForm && (
                    <p className="text-center py-8 text-gray-500">
                        No saved addresses. Add one above.
                    </p>
                )}

            </div>
        );
    };

    // ------------------------------------------------------------------------
    // Guest address fields
    // ------------------------------------------------------------------------

    const renderGuestAddressFields = () => (
        <div className="mb-10">

            <div className="flex items-center space-x-2 mb-6">

                <FaMapMarkerAlt className="text-gray-700 w-5 h-5" />

                <h3 className="text-xl font-serif font-medium text-gray-900">
                    Delivery Address
                </h3>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="md:col-span-2">

                    <label
                        htmlFor="delivery_address"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Delivery Address *
                    </label>

                    <input
                        type="text"
                        id="delivery_address"
                        name="delivery_address"
                        value={form.delivery_address || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                        placeholder="House/Street/Area"
                        required
                    />

                </div>

                <div>

                    <label
                        htmlFor="city"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        City *
                    </label>

                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={form.city || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900"
                        placeholder="Islamabad"
                        required
                    />

                </div>

            </div>
        </div>
    );

    // ------------------------------------------------------------------------
    // Total savings
    // ------------------------------------------------------------------------

    const totalSavings =
        calculateTotalSavings();

    // ------------------------------------------------------------------------
    // Main render
    // ------------------------------------------------------------------------

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">

            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Back button */}

                <button
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-8 group"
                >
                    <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />

                    <span className="font-medium">
                        Back to Cart
                    </span>
                </button>

                {/* Header */}

                <div className="text-center mb-12">

                    <h1 className="text-5xl font-serif font-light tracking-tight text-gray-900 mb-3">
                        Secure Checkout
                    </h1>

                    <div className="flex items-center justify-center space-x-2 text-gray-600">

                        <FaLock className="text-green-600" />

                        <p className="text-sm">
                            Your information is secure and encrypted
                        </p>

                    </div>

                </div>

                {/* Progress */}

                <div className="max-w-3xl mx-auto mb-12">
                    <div className="flex items-center justify-between">
                        {[
                            { num: 1, label: 'Cart', icon: BiPackage },
                            { num: 2, label: 'Checkout', icon: FaLock },
                            { num: 3, label: 'Complete', icon: FaCheckCircle }
                        ].map((step, index) => (
                            <React.Fragment key={step.num}>
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            step.num === 2
                                                ? 'bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg'
                                                : step.num < 2
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gray-200 text-gray-400'
                                        } transition-all duration-300`}
                                    >
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <span
                                        className={`text-xs mt-2 font-medium ${
                                            step.num === 2 ? 'text-gray-900' : 'text-gray-500'
                                        }`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {index < 2 && (
                                    <div
                                        className={`flex-1 h-1 mx-4 rounded-full ${
                                            step.num < 2 ? 'bg-green-500' : 'bg-gray-200'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Main grid */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ======================================================
                        Checkout form
                    ====================================================== */}

                    <div className="lg:col-span-2">

                        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">

                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">

                                <div className="flex items-center space-x-3">

                                    <FaShieldAlt className="text-green-400 w-6 h-6" />

                                    <div>

                                        <h2 className="text-2xl font-serif font-light">
                                            Checkout Details
                                        </h2>

                                        <p className="text-sm text-gray-300">
                                            All fields are required
                                        </p>

                                    </div>

                                </div>

                            </div>

                            <form
                                onSubmit={handleSubmit}
                                className="p-8"
                            >

                                {/* ==================================================
                                    Customer information
                                ================================================== */}

                                <div className="mb-10">

                                    <div className="flex items-center space-x-2 mb-6">

                                        <FaUser className="text-gray-700 w-5 h-5" />

                                        <h3 className="text-xl font-serif font-medium text-gray-900">
                                            Customer Information
                                        </h3>

                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* Name */}

                                        <div className="md:col-span-2">

                                            <label
                                                htmlFor="customer_name"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Full Name *
                                            </label>

                                            <input
                                                type="text"
                                                id="customer_name"
                                                name="customer_name"
                                                value={form.customer_name}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
                                                placeholder="Enter your full name"
                                                required
                                            />

                                        </div>

                                        {/* Email */}

                                        <div>

                                            <label
                                                htmlFor="customer_email"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Email Address *
                                            </label>

                                            <input
                                                type="email"
                                                id="customer_email"
                                                name="customer_email"
                                                value={form.customer_email}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
                                                placeholder="your@email.com"
                                                required
                                            />

                                        </div>

                                        {/* Phone */}

                                        <div>

                                            <label
                                                htmlFor="customer_phone"
                                                className="block text-sm font-medium text-gray-700 mb-2"
                                            >
                                                Phone Number *
                                            </label>

                                            <input
                                                type="tel"
                                                id="customer_phone"
                                                name="customer_phone"
                                                value={form.customer_phone}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
                                                placeholder="+92 300 1234567"
                                                required
                                            />

                                        </div>

                                    </div>

                                </div>

                                {/* ==================================================
                                    Address
                                ================================================== */}

                                {isLoggedIn
                                    ? renderAddressSelection()
                                    : renderGuestAddressFields()}

                                {/* ==================================================
                                    Payment
                                ================================================== */}

                                <div className="mb-10">

                                    <div className="flex items-center space-x-2 mb-6">

                                        <FaLock className="text-gray-700 w-5 h-5" />

                                        <h3 className="text-xl font-serif font-medium text-gray-900">
                                            Payment Method
                                        </h3>

                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                        {[
                                            { value: 'credit_card', label: 'Credit Card', icons: [FaCcVisa, FaCcMastercard] },
                                            { value: 'debit_card', label: 'Debit Card', icons: [] },
                                            { value: 'paypal', label: 'PayPal', icons: [FaCcPaypal] },
                                            { value: 'cash_on_delivery', label: 'Cash on Delivery', icons: [] }
                                        ].map((method) => (
                                            <label
                                                key={method.value}
                                                className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                                                    form.payment_method === method.value
                                                        ? 'border-gray-900 bg-gray-50 shadow-md'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment_method"
                                                    value={method.value}
                                                    checked={form.payment_method === method.value}
                                                    onChange={handleChange}
                                                    className="w-5 h-5 text-gray-900 focus:ring-gray-900"
                                                />
                                                <span className="ml-3 text-sm font-medium text-gray-900 flex-1">
                                                    {method.label}
                                                </span>
                                                <div className="flex space-x-1">
                                                    {method.icons.map((Icon, idx) => (
                                                        <Icon key={idx} className="w-8 h-8 text-gray-600" />
                                                    ))}
                                                </div>
                                            </label>
                                        ))}

                                    </div>

                                </div>

                                {/* ==================================================
                                    Submit
                                ================================================== */}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                                        isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >

                                    {isLoading ? (

                                        <span className="flex items-center justify-center">

                                            <svg
                                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>

                                            Processing Order...

                                        </span>

                                    ) : (

                                        <span className="flex items-center justify-center">

                                            <FaCheckCircle className="mr-2" />

                                            Complete Order

                                        </span>
                                    )}

                                </button>

                                {/* ==================================================
                                    Trust badges
                                ================================================== */}

                                <div className="mt-6 pt-6 border-t border-gray-100">

                                    <div className="grid grid-cols-3 gap-4 text-center">

                                        <div className="flex flex-col items-center">

                                            <FaShieldAlt className="text-green-600 w-6 h-6 mb-2" />

                                            <span className="text-xs text-gray-600">
                                                Secure Payment
                                            </span>

                                        </div>

                                        <div className="flex flex-col items-center">

                                            <FaTruck className="text-blue-600 w-6 h-6 mb-2" />

                                            <span className="text-xs text-gray-600">
                                                Free Delivery
                                            </span>

                                        </div>

                                        <div className="flex flex-col items-center">

                                            <FaCheckCircle className="text-purple-600 w-6 h-6 mb-2" />

                                            <span className="text-xs text-gray-600">
                                                Easy Returns
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </form>

                        </div>

                    </div>

                    {/* ======================================================
                        Order summary
                    ====================================================== */}

                    <div className="lg:col-span-1">

                        <div className="sticky top-6">

                            <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">

                                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">

                                    <h2 className="text-2xl font-serif font-light">
                                        Order Summary
                                    </h2>

                                    <p className="text-sm text-gray-300 mt-1">
                                        {cartItems.length}{' '}
                                        {cartItems.length === 1 ? 'item' : 'items'}
                                    </p>

                                </div>

                                <div className="p-6">

                                    {cartItems.length > 0 ? (

                                        <>

                                            {renderCartSummary(
                                                salesProducts,
                                                'Sale Items',
                                                'bg-red-50'
                                            )}

                                            {renderCartSummary(
                                                regularProducts,
                                                'Regular Items',
                                                'bg-gray-50'
                                            )}

                                            <div className="space-y-3 pt-4 border-t border-gray-200">

                                                {/* Mixed subtotals */}

                                                {regularProducts.length > 0 && salesProducts.length > 0 && (
                                                    <>
                                                        <div className="flex justify-between text-sm">

                                                            <span className="text-gray-600">
                                                                Regular Subtotal
                                                            </span>

                                                            <span className="font-medium text-gray-900">
                                                                PKR{' '}
                                                                {regularProducts
                                                                    .reduce((total, item) => total + getUnitPrice(item) * (item.quantity || 1), 0)
                                                                    .toLocaleString()}
                                                            </span>

                                                        </div>

                                                        <div className="flex justify-between text-sm">

                                                            <span className="text-gray-600">
                                                                Sale Subtotal
                                                            </span>

                                                            <span className="font-medium text-gray-900">
                                                                PKR{' '}
                                                                {salesProducts
                                                                    .reduce((total, item) => total + getUnitPrice(item) * (item.quantity || 1), 0)
                                                                    .toLocaleString()}
                                                            </span>

                                                        </div>
                                                    </>
                                                )}

                                                {/* Subtotal */}

                                                <div className="flex justify-between">

                                                    <span className="text-gray-900">
                                                        Subtotal
                                                    </span>

                                                    <span className="font-medium text-gray-900">
                                                        PKR{' '}
                                                        {getTotalPrice().toLocaleString()}
                                                    </span>

                                                </div>

                                                {/* Savings */}

                                                {totalSavings > 0 && (

                                                    <div className="flex justify-between bg-green-50 -mx-6 px-6 py-2 rounded-lg">

                                                        <span className="text-green-700 font-medium flex items-center">

                                                            <FaTag className="mr-2" />

                                                            Total Savings

                                                        </span>

                                                        <span className="font-bold text-green-700">

                                                            - PKR{' '}
                                                            {totalSavings.toLocaleString()}

                                                        </span>

                                                    </div>
                                                )}

                                                {/* Shipping */}

                                                <div className="flex justify-between">

                                                    <span className="text-gray-900">
                                                        Shipping
                                                    </span>

                                                    <span className="font-medium text-green-600">
                                                        FREE
                                                    </span>

                                                </div>

                                                {/* Tax */}

                                                <div className="flex justify-between">

                                                    <span className="text-gray-900">
                                                        Tax
                                                    </span>

                                                    <span className="font-medium text-gray-900">
                                                        PKR 0
                                                    </span>

                                                </div>

                                            </div>

                                            {/* Total */}

                                            <div className="flex justify-between pt-4 mt-4 border-t-2 border-gray-900">

                                                <span className="text-xl font-serif font-medium text-gray-900">
                                                    Total
                                                </span>

                                                <span className="text-2xl font-serif font-bold text-gray-900">
                                                    PKR{' '}
                                                    {getTotalPrice().toLocaleString()}
                                                </span>

                                            </div>

                                        </>

                                    ) : (

                                        <p className="text-center py-8 text-gray-500">
                                            Your cart is empty
                                        </p>
                                    )}

                                    {/* Continue shopping */}

                                    <button
                                        onClick={handleContinueShopping}
                                        className="w-full bg-white text-gray-900 py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 mt-6 font-medium"
                                    >
                                        Continue Shopping
                                    </button>

                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Checkout;