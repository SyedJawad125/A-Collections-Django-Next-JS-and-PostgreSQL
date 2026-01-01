// 'use client';
// import React, { useContext, useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { CartContext } from "@/components/CartContext";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import jsPDF from 'jspdf';
// import { FaLock, FaArrowLeft, FaCcVisa, FaCcMastercard, FaCcPaypal } from 'react-icons/fa';

// const Checkout = () => {
//     const { cartItems, clearCart, getRegularProducts, getSalesProducts } = useContext(CartContext);
//     const router = useRouter();
//     const [isLoading, setIsLoading] = useState(false);
//     const [form, setForm] = useState({
//         customer_name: '',
//         customer_email: '',
//         customer_phone: '',
//         delivery_address: '',
//         city: '',
//         payment_method: 'credit_card',
//     });
//     const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

//     const regularProducts = getRegularProducts();
//     const salesProducts = getSalesProducts();

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

//     const getMainImage = (item) => {
//         if (item.image_urls && item.image_urls.length > 0) {
//             return `${baseURL}${item.image_urls[0].startsWith('/') ? '' : '/'}${item.image_urls[0]}`;
//         }
//         if (item.image) {
//             return `${baseURL}${item.image.startsWith('/') ? '' : '/'}${item.image}`;
//         }
//         return '/default-product-image.jpg';
//     };

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

//     const generateInvoice = (orderData) => {
//         const doc = new jsPDF();
        
//         doc.setProperties({
//             title: `Invoice #${orderData.order_id}`,
//             subject: 'Invoice from GOHAR COLLECTION',
//             author: 'GOHAR COLLECTION',
//         });

//         doc.setFillColor(40, 40, 40);
//         doc.rect(0, 0, 210, 30, 'F');
//         doc.setTextColor(255, 255, 255);
//         doc.setFontSize(20);
//         doc.text('GOHAR COLLECTION', 105, 20, { align: 'center' });
        
//         doc.setFontSize(12);
//         doc.setTextColor(100, 100, 100);
//         doc.text('INVOICE', 20, 45);
//         doc.setFontSize(10);
//         doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 45);
//         doc.text(`Invoice #: ${orderData.order_id}`, 160, 50);
//         doc.text(`Status: ${orderData.status}`, 160, 55);
        
//         doc.setFontSize(10);
//         doc.setTextColor(0, 0, 0);
        
//         doc.text('From:', 20, 65);
//         doc.setFont(undefined, 'bold');
//         doc.text('GOHAR COLLECTION', 20, 70);
//         doc.setFont(undefined, 'normal');
//         doc.text('Sector D, DHA 2, ISB.', 20, 75);
//         doc.text('contact@luxury.com', 20, 80);
        
//         doc.text('To:', 20, 95);
//         doc.setFont(undefined, 'bold');
//         doc.text(orderData.customer_info.name, 20, 100);
//         doc.setFont(undefined, 'normal');
//         doc.text(orderData.delivery_info.address, 20, 105);
//         doc.text(orderData.customer_info.phone, 20, 110);
//         doc.text(orderData.customer_info.email, 20, 115);
        
//         doc.setFillColor(240, 240, 240);
//         doc.rect(20, 130, 170, 8, 'F');
//         doc.setTextColor(0, 0, 0);
//         doc.setFont(undefined, 'bold');
//         doc.text('Item', 20, 135);
//         doc.text('Type', 60, 135);
//         doc.text('Unit Price', 100, 135);
//         doc.text('Qty', 140, 135);
//         doc.text('Total', 170, 135);
        
//         doc.setFont(undefined, 'normal');
//         let yPosition = 145;
        
//         orderData.order_summary.items.forEach(item => {
//             doc.text(item.product_name, 20, yPosition);
//             doc.text(item.product_type === 'sales_product' ? 'Sale' : 'Regular', 60, yPosition);
//             doc.text(`PKR ${item.unit_price.toLocaleString()}`, 100, yPosition);
//             doc.text(`${item.quantity}`, 140, yPosition);
//             doc.text(`PKR ${item.total_price.toLocaleString()}`, 170, yPosition);
//             yPosition += 10;
//         });
        
//         doc.setFont(undefined, 'bold');
//         doc.text('Subtotal:', 140, yPosition + 10);
//         doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 170, yPosition + 10);
        
//         doc.text('Shipping:', 140, yPosition + 20);
//         doc.text('PKR 0', 170, yPosition + 20);
        
//         doc.text('Tax:', 140, yPosition + 30);
//         doc.text('PKR 0', 170, yPosition + 30);
        
//         doc.setFontSize(12);
//         doc.text('Total Amount:', 140, yPosition + 45);
//         doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 170, yPosition + 45);
        
//         doc.setFontSize(8);
//         doc.setTextColor(100, 100, 100);
//         doc.text('Thank you for your business!', 105, 280, { align: 'center' });
//         doc.text('Terms & Conditions: Payment due within 15 days', 105, 285, { align: 'center' });
//         doc.text('GOHAR COLLECTION | Sector D, DHA 2, ISB. | contact@luxury.com', 105, 290, { align: 'center' });
        
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
//                     product_type: item.isSales ? 'sales_product' : 'product',
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
//                 product_type: item.isSales ? 'sales_product' : 'product',
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

//             const response = await AxiosInstance.post('/ecommerce/publicorder', orderData, {
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
//                 theme: "colored",
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

//     const renderCartSummary = (items, title) => {
//         if (items.length === 0) return null;

//         return (
//             <div className="mb-6">
//                 <h4 className="text-sm font-medium text-gray-900 mb-3 border-b border-gray-100 pb-2">
//                     {title} ({items.length} {items.length === 1 ? 'Item' : 'Items'})
//                 </h4>
//                 <div className="space-y-3">
//                     {items.map((item) => {
//                         const unitPrice = getUnitPrice(item);
//                         const regularPrice = Number(item.price) || 0;
//                         const isOnSale = item.isSales && item.final_price !== undefined && unitPrice < regularPrice;
//                         const uniqueKey = `${item.isSales ? 'sales' : 'product'}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;

//                         return (
//                             <div key={uniqueKey} className="flex justify-between items-start">
//                                 <div className="flex items-center">
//                                     <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mr-4">
//                                         <img
//                                             src={getMainImage(item)}
//                                             alt={item.name}
//                                             className="h-full w-full object-cover object-center"
//                                         />
//                                         {item.isSales && (
//                                             <div className="absolute top-0 left-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded-br">
//                                                 SALE
//                                             </div>
//                                         )}
//                                     </div>
//                                     <div>
//                                         <h4 className="text-sm text-gray-900 font-medium">{item.name}</h4>
//                                         <p className="text-gray-700 text-sm">Qty: {item.quantity || 1}</p>
//                                         {item.color && <p className="text-gray-500 text-xs">Color: {item.color}</p>}
//                                         {item.size && <p className="text-gray-500 text-xs">Size: {item.size}</p>}
//                                     </div>
//                                 </div>
//                                 <div className="text-right">
//                                     {isOnSale && (
//                                         <>
//                                             <p className="font-medium text-gray-900 line-through text-sm">
//                                                 PKR {regularPrice.toLocaleString()}
//                                             </p>
//                                             <p className="font-medium text-red-600">
//                                                 PKR {unitPrice.toLocaleString()} × {item.quantity || 1}
//                                             </p>
//                                         </>
//                                     )}
//                                     {!isOnSale && (
//                                         <p className="font-medium text-gray-900">
//                                             PKR {unitPrice.toLocaleString()} × {item.quantity || 1}
//                                         </p>
//                                     )}
//                                     <p className="font-medium text-gray-900">
//                                         PKR {(unitPrice * (item.quantity || 1)).toLocaleString()}/-
//                                     </p>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
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
//                 theme="colored"
//             />
            
//             <div className="max-w-7xl mx-auto">
//                 <div className="flex items-center mb-8 cursor-pointer" onClick={() => router.back()}>
//                     <FaArrowLeft className="text-gray-600 mr-2" />
//                     <span className="text-gray-600 hover:text-gray-900">Back to Shopping</span>
//                 </div>

//                 <h1 className="text-3xl font-serif font-light tracking-wider text-gray-900 mb-2">Checkout</h1>
//                 <p className="text-gray-500 mb-8">Complete your purchase with confidence</p>

//                 <div className="flex flex-col lg:flex-row gap-12">
//                     {/* Checkout Form */}
//                     <div className="lg:w-2/3">
//                         <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100 p-8">
//                             <div className="flex items-center mb-8">
//                                 <FaLock className="text-green-500 mr-2" />
//                                 <span className="text-sm text-gray-500">Secure Checkout</span>
//                             </div>

//                             <form onSubmit={handleSubmit}>
//                                 {/* Shipping Information */}
//                                 <div className="mb-12">
//                                     <h3 className="text-lg font-medium text-gray-900 mb-6 border-b border-gray-100 pb-2">Shipping Information</h3>
//                                     <div className="grid grid-cols-1 gap-6">
//                                         <div>
//                                             <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//                                             <input
//                                                 type="text"
//                                                 id="customer_name"
//                                                 name="customer_name"
//                                                 value={form.customer_name}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-2 border border-gray-300  text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                                             <input
//                                                 type="email"
//                                                 id="customer_email"
//                                                 name="customer_email"
//                                                 value={form.customer_email}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                                             <input
//                                                 type="tel"
//                                                 id="customer_phone"
//                                                 name="customer_phone"
//                                                 value={form.customer_phone}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//                                             <input
//                                                 type="text"
//                                                 id="delivery_address"
//                                                 name="delivery_address"
//                                                 value={form.delivery_address}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
//                                                 required
//                                             />
//                                         </div>
//                                         <div>
//                                             <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
//                                             <input
//                                                 type="text"
//                                                 id="city"
//                                                 name="city"
//                                                 value={form.city}
//                                                 onChange={handleChange}
//                                                 className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
//                                                 required
//                                             />
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Payment Method */}
//                                 <div className="mb-12">
//                                     <h3 className="text-lg font-medium text-gray-900 mb-6 border-b border-gray-100 pb-2">Payment Method</h3>
//                                     <div className="space-y-4">
//                                         <div className="flex items-center">
//                                             <input
//                                                 type="radio"
//                                                 id="credit_card"
//                                                 name="payment_method"
//                                                 value="credit_card"
//                                                 checked={form.payment_method === 'credit_card'}
//                                                 onChange={handleChange}
//                                                 className="h-4 w-4 text-black focus:ring-black"
//                                             />
//                                             <label htmlFor="credit_card" className="ml-3 block text-sm font-medium text-gray-700">Credit Card</label>
//                                             <FaCcVisa className="ml-4 text-blue-800" />
//                                             <FaCcMastercard className="ml-2 text-red-600" />
//                                         </div>
//                                         <div className="flex items-center">
//                                             <input
//                                                 type="radio"
//                                                 id="debit_card"
//                                                 name="payment_method"
//                                                 value="debit_card"
//                                                 checked={form.payment_method === 'debit_card'}
//                                                 onChange={handleChange}
//                                                 className="h-4 w-4 text-black focus:ring-black"
//                                             />
//                                             <label htmlFor="debit_card" className="ml-3 block text-sm font-medium text-gray-700">Debit Card</label>
//                                         </div>
//                                         <div className="flex items-center">
//                                             <input
//                                                 type="radio"
//                                                 id="paypal"
//                                                 name="payment_method"
//                                                 value="paypal"
//                                                 checked={form.payment_method === 'paypal'}
//                                                 onChange={handleChange}
//                                                 className="h-4 w-4 text-black focus:ring-black"
//                                             />
//                                             <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700">PayPal</label>
//                                             <FaCcPaypal className="ml-4 text-blue-700" />
//                                         </div>
//                                         <div className="flex items-center">
//                                             <input
//                                                 type="radio"
//                                                 id="cash_on_delivery"
//                                                 name="payment_method"
//                                                 value="cash_on_delivery"
//                                                 checked={form.payment_method === 'cash_on_delivery'}
//                                                 onChange={handleChange}
//                                                 className="h-4 w-4 text-black focus:ring-black"
//                                             />
//                                             <label htmlFor="cash_on_delivery" className="ml-3 block text-sm font-medium text-gray-700">Cash on Delivery</label>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <button
//                                     type="submit"
//                                     disabled={isLoading}
//                                     className={`w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
//                                 >
//                                     {isLoading ? 'Processing...' : 'Complete Order'}
//                                 </button>
//                             </form>
//                         </div>
//                     </div>

//                     {/* Order Summary */}
//                     <div className="lg:w-1/3">
//                         <div className="bg-white shadow-sm rounded-lg border border-gray-100 p-6 sticky top-8">
//                             <h2 className="text-xl text-gray-900 font-serif font-light mb-6 border-b border-gray-900 pb-4">Order Summary</h2>
                            
//                             {cartItems.length > 0 ? (
//                                 <>
//                                     {/* Render Regular Products */}
//                                     {renderCartSummary(regularProducts, "Regular Products")}
                                    
//                                     {/* Render Sales Products */}
//                                     {renderCartSummary(salesProducts, "Sale Products")}

//                                     <div className="space-y-4 border-t border-gray-100 pt-4 mb-6">
//                                         {/* Show breakdown by product type if both exist */}
//                                         {regularProducts.length > 0 && salesProducts.length > 0 && (
//                                             <>
//                                                 <div className="flex justify-between text-sm">
//                                                     <span className="text-gray-600">Regular Products Subtotal</span>
//                                                     <span className="text-gray-900">
//                                                         PKR {regularProducts.reduce((total, item) => {
//                                                             const price = getUnitPrice(item);
//                                                             return total + (price * item.quantity);
//                                                         }, 0).toLocaleString()}/-
//                                                     </span>
//                                                 </div>
//                                                 <div className="flex justify-between text-sm">
//                                                     <span className="text-gray-600">Sale Products Subtotal</span>
//                                                     <span className="text-gray-900">
//                                                         PKR {salesProducts.reduce((total, item) => {
//                                                             const price = getUnitPrice(item);
//                                                             return total + (price * item.quantity);
//                                                         }, 0).toLocaleString()}/-
//                                                     </span>
//                                                 </div>
//                                             </>
//                                         )}
                                        
//                                         <div className="flex justify-between">
//                                             <span className="text-gray-900">Subtotal</span>
//                                             <span className="font-medium text-gray-900">PKR {getTotalPrice().toLocaleString()}/-</span>
//                                         </div>
//                                         <div className="flex justify-between">
//                                             <span className="text-gray-900">Shipping</span>
//                                             <span className="font-medium text-gray-900">Free</span>
//                                         </div>
//                                         <div className="flex justify-between">
//                                             <span className="text-gray-900">Tax</span>
//                                             <span className="font-medium text-gray-900">PKR 0</span>
//                                         </div>
//                                     </div>

//                                     <div className="flex justify-between border-t border-gray-900 pt-4 mb-6">
//                                         <span className="text-lg font-medium text-gray-900">Total</span>
//                                         <span className="text-lg font-medium text-gray-900">PKR {getTotalPrice().toLocaleString()}/-</span>
//                                     </div>
//                                 </>
//                             ) : (
//                                 <p className="text-center py-8 text-gray-500">Your cart is empty</p>
//                             )}

//                             <button
//                                 onClick={handleContinueShopping}
//                                 className="w-full bg-white text-black py-3 px-4 rounded-md border border-black hover:bg-gray-50 transition-colors duration-300 mt-4"
//                             >
//                                 Continue Shopping
//                             </button>
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
import { CartContext } from "@/components/CartContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import jsPDF from 'jspdf';
import { FaLock, FaArrowLeft, FaCcVisa, FaCcMastercard, FaCcPaypal, FaShieldAlt, FaTruck, FaCheckCircle, FaTag } from 'react-icons/fa';
import { BiPackage } from 'react-icons/bi';

const Checkout = () => {
    const { cartItems, clearCart, getRegularProducts, getSalesProducts } = useContext(CartContext);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [activeStep, setActiveStep] = useState(1);
    const [form, setForm] = useState({
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        delivery_address: '',
        city: '',
        payment_method: 'credit_card',
    });

    const regularProducts = getRegularProducts();
    const salesProducts = getSalesProducts();

    // Improved image URL processing that matches the cart page
    const processImageUrl = (url) => {
        if (!url || url.trim() === '') {
            return '/images/default-product.jpg';
        }
        
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${baseURL}${cleanUrl}`;
    };

    const getMainImage = (item) => {
        // Try multiple image sources in order of priority
        if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
            return processImageUrl(item.image_urls[0]);
        }
        if (item.image_urls && typeof item.image_urls === 'string') {
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

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            setForm(prev => ({
                ...prev,
                customer_name: userData.name || '',
                customer_email: userData.email || '',
                customer_phone: userData.phone || ''
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const getUnitPrice = (item) => {
        return item.final_price !== undefined ? Number(item.final_price) : Number(item.price) || 0;
    };

    const getTotalPrice = () => {
        return cartItems.reduce((total, item) => {
            return total + (getUnitPrice(item) * (item.quantity || 1));
        }, 0);
    };

    const calculateTotalSavings = () => {
        return cartItems.reduce((savings, item) => {
            if (item.original_price && item.final_price && parseFloat(item.original_price) > parseFloat(item.final_price)) {
                return savings + ((parseFloat(item.original_price) - parseFloat(item.final_price)) * item.quantity);
            }
            return savings;
        }, 0);
    };

    const generateInvoice = (orderData) => {
        const doc = new jsPDF();
        
        doc.setProperties({
            title: `Invoice #${orderData.order_id}`,
            subject: 'Invoice from GOHAR COLLECTION',
            author: 'GOHAR COLLECTION',
        });

        // Header with gradient effect
        doc.setFillColor(26, 26, 26);
        doc.rect(0, 0, 210, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('GOHAR COLLECTION', 105, 18, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Premium Luxury Products', 105, 26, { align: 'center' });
        
        // Invoice details
        doc.setFontSize(14);
        doc.setTextColor(26, 26, 26);
        doc.setFont(undefined, 'bold');
        doc.text('INVOICE', 20, 50);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 160, 50);
        doc.text(`Invoice #: ${orderData.order_id}`, 160, 56);
        doc.text(`Status: ${orderData.status}`, 160, 62);
        
        // From section
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('FROM:', 20, 75);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(26, 26, 26);
        doc.text('GOHAR COLLECTION', 20, 82);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Sector D, DHA 2, Islamabad', 20, 88);
        doc.text('Pakistan', 20, 94);
        doc.text('contact@goharcollection.com', 20, 100);
        
        // To section
        doc.setTextColor(100, 100, 100);
        doc.text('TO:', 20, 115);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(26, 26, 26);
        doc.text(orderData.customer_info.name, 20, 122);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(orderData.delivery_info.address, 20, 128);
        doc.text(orderData.delivery_info.city, 20, 134);
        doc.text(orderData.customer_info.phone, 20, 140);
        doc.text(orderData.customer_info.email, 20, 146);
        
        // Table header
        doc.setFillColor(245, 245, 245);
        doc.rect(20, 160, 170, 10, 'F');
        doc.setTextColor(26, 26, 26);
        doc.setFont(undefined, 'bold');
        doc.setFontSize(9);
        doc.text('PRODUCT', 25, 166);
        doc.text('TYPE', 85, 166);
        doc.text('UNIT PRICE', 115, 166);
        doc.text('QTY', 150, 166);
        doc.text('TOTAL', 170, 166);
        
        // Table content
        doc.setFont(undefined, 'normal');
        let yPosition = 176;
        
        orderData.order_summary.items.forEach((item, index) => {
            if (index % 2 === 0) {
                doc.setFillColor(250, 250, 250);
                doc.rect(20, yPosition - 5, 170, 8, 'F');
            }
            
            doc.setTextColor(60, 60, 60);
            const productName = item.product_name.length > 25 
                ? item.product_name.substring(0, 25) + '...' 
                : item.product_name;
            doc.text(productName, 25, yPosition);
            
            const typeText = item.product_type === 'sales_product' ? 'Sale' : 'Regular';
            const typeColor = item.product_type === 'sales_product' ? [220, 38, 38] : [60, 60, 60];
            doc.setTextColor(...typeColor);
            doc.text(typeText, 85, yPosition);
            
            doc.setTextColor(60, 60, 60);
            doc.text(`PKR ${item.unit_price.toLocaleString()}`, 115, yPosition);
            doc.text(`${item.quantity}`, 150, yPosition);
            doc.text(`PKR ${item.total_price.toLocaleString()}`, 170, yPosition);
            yPosition += 10;
        });
        
        // Totals section
        yPosition += 10;
        doc.setDrawColor(220, 220, 220);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Subtotal:', 140, yPosition);
        doc.setTextColor(26, 26, 26);
        doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 170, yPosition);
        
        yPosition += 8;
        doc.setTextColor(100, 100, 100);
        doc.text('Shipping:', 140, yPosition);
        doc.setTextColor(34, 197, 94);
        doc.text('FREE', 170, yPosition);
        
        yPosition += 8;
        doc.setTextColor(100, 100, 100);
        doc.text('Tax:', 140, yPosition);
        doc.setTextColor(26, 26, 26);
        doc.text('PKR 0', 170, yPosition);
        
        // Grand total
        yPosition += 12;
        doc.setFillColor(26, 26, 26);
        doc.rect(130, yPosition - 5, 60, 12, 'F');
        doc.setFont(undefined, 'bold');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
        doc.text('TOTAL:', 135, yPosition + 2);
        doc.text(`PKR ${orderData.order_summary.total.toLocaleString()}`, 165, yPosition + 2);
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont(undefined, 'italic');
        doc.text('Thank you for choosing GOHAR COLLECTION', 105, 270, { align: 'center' });
        doc.setFont(undefined, 'normal');
        doc.text('Terms & Conditions: Payment due within 15 days. All sales are final.', 105, 276, { align: 'center' });
        doc.text('GOHAR COLLECTION | Sector D, DHA 2, Islamabad | contact@goharcollection.com', 105, 282, { align: 'center' });
        
        // Border
        doc.setDrawColor(26, 26, 26);
        doc.setLineWidth(0.5);
        doc.rect(10, 10, 190, 277);
        
        doc.save(`invoice-${orderData.order_id}.pdf`);
    };

    const prepareOrderDataForConfirmation = (responseData) => {
        return {
            order_id: responseData.order_id,
            customer_info: {
                name: form.customer_name,
                email: form.customer_email,
                phone: form.customer_phone
            },
            delivery_info: {
                address: form.delivery_address,
                city: form.city,
                estimated_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()
            },
            payment_method: form.payment_method,
            payment_status: true,
            status: 'Confirmed',
            order_summary: {
                items: cartItems.map(item => ({
                    product_name: item.name,
                    product_type: item.isSalesProduct ? 'sales_product' : 'product',
                    unit_price: getUnitPrice(item),
                    quantity: item.quantity || 1,
                    total_price: getUnitPrice(item) * (item.quantity || 1),
                    image_url: getMainImage(item)
                })),
                subtotal: getTotalPrice(),
                total: getTotalPrice()
            }
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setIsLoading(true);

        try {
            const items = cartItems.map(item => ({
                product_type: item.isSalesProduct ? 'sales_product' : 'product',
                product_id: item.id,
                quantity: item.quantity || 1
            }));

            const orderData = {
                customer_name: form.customer_name,
                customer_email: form.customer_email,
                customer_phone: form.customer_phone,
                delivery_address: form.delivery_address,
                city: form.city,
                payment_method: form.payment_method,
                items: items
            };

            const response = await AxiosInstance.post('/ecommerce/publicorder', orderData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
                }
            });

            const orderResponse = response.data.data;
            generateInvoice(orderResponse);
            clearCart();

            const confirmationData = prepareOrderDataForConfirmation(orderResponse);
            localStorage.setItem('latestOrder', JSON.stringify(confirmationData));

            toast.success('Order placed successfully!', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                onClose: () => {
                    router.push('/orderconfirmation');
                }
            });

        } catch (error) {
            let errorMsg = 'Failed to place order';

            if (error.response) {
                if (error.response.status === 400) {
                    errorMsg = error.response.data.message || 'Validation error';
                } else if (error.response.status === 401) {
                    errorMsg = 'Please login to place an order';
                } else if (error.response.status === 403) {
                    errorMsg = 'You do not have permission to perform this action';
                } else {
                    errorMsg = error.response.data.message || `Server error: ${error.response.status}`;
                }
            } else if (error.request) {
                errorMsg = 'No response from server - please try again';
            } else {
                errorMsg = error.message || 'Unknown error occurred';
            }

            toast.error(errorMsg);
            console.error('Checkout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinueShopping = () => {
        router.push('/publicproducts');
    };

    const isSalesProduct = (item) => {
        return (
            item.productType === 'sales_product' || 
            item.productType === 'sale' || 
            item.type === 'sales_product' || 
            item.type === 'sale' ||
            item.isSalesProduct === true ||
            (item.final_price !== undefined && item.original_price !== undefined && parseFloat(item.final_price) < parseFloat(item.original_price)) ||
            (item.discount_percent && item.discount_percent > 0)
        );
    };

    const renderCartSummary = (items, title, bgColor = 'bg-gray-50') => {
        if (items.length === 0) return null;

        const isSale = title.includes('Sale');

        return (
            <div className={`mb-6 ${bgColor} rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        {isSale && <FaTag className="text-red-500 w-4 h-4" />}
                        <h4 className="text-sm font-semibold text-gray-900">
                            {title}
                        </h4>
                        <span className="text-xs text-gray-500">
                            ({items.length} {items.length === 1 ? 'item' : 'items'})
                        </span>
                    </div>
                </div>
                <div className="space-y-4">
                    {items.map((item) => {
                        const unitPrice = getUnitPrice(item);
                        const isOnSale = isSalesProduct(item);
                        const uniqueKey = `${item.isSalesProduct ? 'sales' : 'product'}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;

                        return (
                            <div key={uniqueKey} className="flex items-start space-x-4 bg-white rounded-lg p-3">
                                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                                    <img
                                        src={getMainImage(item)}
                                        alt={item.name}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            console.error('Image failed to load:', getMainImage(item));
                                            e.target.onerror = null;
                                            e.target.src = '/images/default-product.jpg';
                                        }}
                                    />
                                    {isOnSale && (
                                        <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
                                            {item.discount_percent ? `${item.discount_percent}%` : 'SALE'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-medium text-gray-900 truncate">{item.name}</h5>
                                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                        <span>Qty: {item.quantity || 1}</span>
                                        {item.color && (
                                            <>
                                                <span>•</span>
                                                <span>{item.color}</span>
                                            </>
                                        )}
                                        {item.size && (
                                            <>
                                                <span>•</span>
                                                <span>{item.size}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        {isOnSale && item.original_price && parseFloat(item.original_price) > unitPrice ? (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-400 line-through">
                                                    PKR {parseFloat(item.original_price).toLocaleString()}
                                                </span>
                                                <span className="text-sm font-bold text-red-600">
                                                    PKR {unitPrice.toLocaleString()}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-medium text-gray-900">
                                                PKR {unitPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-gray-900">
                                        PKR {(unitPrice * (item.quantity || 1)).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const totalSavings = calculateTotalSavings();

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
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-8 group"
                >
                    <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back to Cart</span>
                </button>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-serif font-light tracking-tight text-gray-900 mb-3">
                        Secure Checkout
                    </h1>
                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <FaLock className="text-green-600" />
                        <p className="text-sm">Your information is secure and encrypted</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="max-w-3xl mx-auto mb-12">
                    <div className="flex items-center justify-between">
                        {[
                            { num: 1, label: 'Cart', icon: BiPackage },
                            { num: 2, label: 'Checkout', icon: FaLock },
                            { num: 3, label: 'Complete', icon: FaCheckCircle }
                        ].map((step, index) => (
                            <React.Fragment key={step.num}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        step.num === 2 
                                            ? 'bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg' 
                                            : step.num < 2 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-gray-200 text-gray-400'
                                    } transition-all duration-300`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${
                                        step.num === 2 ? 'text-gray-900' : 'text-gray-500'
                                    }`}>
                                        {step.label}
                                    </span>
                                </div>
                                {index < 2 && (
                                    <div className={`flex-1 h-1 mx-4 rounded-full ${
                                        step.num < 2 ? 'bg-green-500' : 'bg-gray-200'
                                    }`} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
                                <div className="flex items-center space-x-3">
                                    <FaShieldAlt className="text-green-400 w-6 h-6" />
                                    <div>
                                        <h2 className="text-2xl font-serif font-light">Checkout Details</h2>
                                        <p className="text-sm text-gray-300">All fields are required</p>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8">
                                {/* Shipping Information */}
                                <div className="mb-10">
                                    <div className="flex items-center space-x-2 mb-6">
                                        <FaTruck className="text-gray-700 w-5 h-5" />
                                        <h3 className="text-xl font-serif font-medium text-gray-900">
                                            Shipping Information
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-2">
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
                                        <div>
                                            <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-2">
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
                                        <div>
                                            <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-2">
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
                                        <div className="md:col-span-2">
                                            <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 mb-2">
                                                Delivery Address *
                                            </label>
                                            <input
                                                type="text"
                                                id="delivery_address"
                                                name="delivery_address"
                                                value={form.delivery_address}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
                                                placeholder="House/Street, Area"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                                City *
                                            </label>
                                            <input
                                                type="text"
                                                id="city"
                                                name="city"
                                                value={form.city}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border-2 border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:border-gray-900 transition-colors"
                                                placeholder="Islamabad"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method */}
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

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                                        isLoading ? 'opacity-70 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

                                {/* Trust Badges */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <FaShieldAlt className="text-green-600 w-6 h-6 mb-2" />
                                            <span className="text-xs text-gray-600">Secure Payment</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <FaTruck className="text-blue-600 w-6 h-6 mb-2" />
                                            <span className="text-xs text-gray-600">Free Delivery</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <FaCheckCircle className="text-purple-600 w-6 h-6 mb-2" />
                                            <span className="text-xs text-gray-600">Easy Returns</span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary - Sticky Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-6">
                            <div className="bg-white shadow-lg rounded-2xl border border-gray-100 overflow-hidden">
                                <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
                                    <h2 className="text-2xl font-serif font-light">Order Summary</h2>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                                
                                <div className="p-6">
                                    {cartItems.length > 0 ? (
                                        <>
                                            {/* Sales Products - Show first */}
                                            {renderCartSummary(salesProducts, "Sale Items", "bg-red-50")}
                                            
                                            {/* Regular Products */}
                                            {renderCartSummary(regularProducts, "Regular Items", "bg-gray-50")}

                                            {/* Order Totals */}
                                            <div className="space-y-3 pt-4 border-t border-gray-200">
                                                {regularProducts.length > 0 && salesProducts.length > 0 && (
                                                    <>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Regular Subtotal</span>
                                                            <span className="font-medium text-gray-900">
                                                                PKR {regularProducts.reduce((total, item) => {
                                                                    return total + (getUnitPrice(item) * item.quantity);
                                                                }, 0).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-600">Sale Subtotal</span>
                                                            <span className="font-medium text-gray-900">
                                                                PKR {salesProducts.reduce((total, item) => {
                                                                    return total + (getUnitPrice(item) * item.quantity);
                                                                }, 0).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                                
                                                <div className="flex justify-between">
                                                    <span className="text-gray-900">Subtotal</span>
                                                    <span className="font-medium text-gray-900">
                                                        PKR {getTotalPrice().toLocaleString()}
                                                    </span>
                                                </div>

                                                {totalSavings > 0 && (
                                                    <div className="flex justify-between bg-green-50 -mx-6 px-6 py-2 rounded-lg">
                                                        <span className="text-green-700 font-medium flex items-center">
                                                            <FaTag className="mr-2" />
                                                            Total Savings
                                                        </span>
                                                        <span className="font-bold text-green-700">
                                                            - PKR {totalSavings.toLocaleString()}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between">
                                                    <span className="text-gray-900">Shipping</span>
                                                    <span className="font-medium text-green-600">FREE</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-900">Tax</span>
                                                    <span className="font-medium text-gray-900">PKR 0</span>
                                                </div>
                                            </div>

                                            {/* Grand Total */}
                                            <div className="flex justify-between pt-4 mt-4 border-t-2 border-gray-900">
                                                <span className="text-xl font-serif font-medium text-gray-900">Total</span>
                                                <span className="text-2xl font-serif font-bold text-gray-900">
                                                    PKR {getTotalPrice().toLocaleString()}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-center py-8 text-gray-500">Your cart is empty</p>
                                    )}

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