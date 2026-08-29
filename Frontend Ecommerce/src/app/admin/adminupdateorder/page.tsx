// 'use client'
// import React, { useState, useEffect, useContext } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import AxiosInstance from "@/components/AxiosInstance";
// import { AuthContext } from '@/components/AuthContext';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// interface Product {
//   id: number;
//   name: string;
//   price: number;
//   has_discount?: boolean;
// }

// interface SalesProduct {
//   id: number;
//   name: string;
//   final_price: number;
//   has_discount?: boolean;
// }

// interface Customer {
//   id: number;
//   username: string;
//   email: string;
//   first_name?: string;
//   last_name?: string;
// }

// interface Rider {
//   id: number;
//   username: string;
//   first_name?: string;
//   last_name?: string;
// }

// interface OrderItem {
//   id?: number;
//   product_type: 'product' | 'sales_product';
//   product_id: number | null;
//   quantity: number;
//   unit_price?: number;
//   total_price?: number;
//   is_discounted?: boolean;
// }

// const UpdateOrder = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const id = searchParams.get('orderid');
//   const { permissions = {} } = useContext(AuthContext);
  
//   const [formData, setFormData] = useState({
//     customer_name: '',
//     customer_email: '',
//     customer_phone: '',
//     delivery_address: '',
//     city: '',
//     payment_method: 'cash_on_delivery',
//     customer: null as number | null,
//     rider: null as number | null,
//     status: 'pending',
//     payment_status: false,
//     delivery_date: '',
//   });

//   const [products, setProducts] = useState<Product[]>([]);
//   const [salesProducts, setSalesProducts] = useState<SalesProduct[]>([]);
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [riders, setRiders] = useState<Rider[]>([]);
//   const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
//   const [itemsToDelete, setItemsToDelete] = useState<number[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [dataLoading, setDataLoading] = useState(true);
//   const [calculatedTotal, setCalculatedTotal] = useState(0);

//   // Fetch all data including order details
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!id) {
//         toast.error('No order ID provided', {
//           position: "top-center",
//           autoClose: 2000,
//           theme: "dark",
//         });
//         router.push('/orderspage');
//         return;
//       }

//       setDataLoading(true);
//       try {
//         console.log('Fetching data for order ID:', id);
        
//         // Fetch products
//         const productsRes = await AxiosInstance.get('/api/myapp/v1/dropdown/product/');
//         console.log('Products Response:', productsRes.data);
        
//         if (productsRes.data?.data && Array.isArray(productsRes.data.data)) {
//           const productsData = productsRes.data.data.map((product: any) => ({
//             id: product.id,
//             name: product.name,
//             price: Number(product.price) || 0,
//             has_discount: product.has_discount || false
//           }));
//           setProducts(productsData);
//           console.log('Products loaded:', productsData.length);
//         }
        
//         // Fetch sales products
//         const salesProductsRes = await AxiosInstance.get('/api/myapp/v1/dropdown/sales/product/');
//         console.log('Sales Products Response:', salesProductsRes.data);
        
//         if (salesProductsRes.data?.data && Array.isArray(salesProductsRes.data.data)) {
//           const salesProductsData = salesProductsRes.data.data.map((product: any) => ({
//             id: product.id,
//             name: product.name,
//             final_price: Number(product.final_price) || 0,
//             has_discount: product.has_discount || false
//           }));
//           setSalesProducts(salesProductsData);
//           console.log('Sales Products loaded:', salesProductsData.length);
//         }
        
//         // Fetch customers
//         const customersRes = await AxiosInstance.get('/api/myapp/v1/user/?role=customer');
//         if (customersRes.data?.data && Array.isArray(customersRes.data.data)) {
//           setCustomers(customersRes.data.data);
//         }
        
//         // Fetch riders
//         const ridersRes = await AxiosInstance.get('/api/myapp/v1/user/?role=rider');
//         if (ridersRes.data?.data && Array.isArray(ridersRes.data.data)) {
//           setRiders(ridersRes.data.data);
//         }
        
//         // Fetch order details
//         const orderRes = await AxiosInstance.get(`/api/myapp/v1/order/${id}/`);
//         console.log('Order Response:', orderRes.data);
        
//         if (orderRes.data?.data) {
//           const orderData = orderRes.data.data;
          
//           // Set form data
//           setFormData({
//             customer_name: orderData.customer_name || '',
//             customer_email: orderData.customer_email || '',
//             customer_phone: orderData.customer_phone || '',
//             delivery_address: orderData.delivery_address || '',
//             city: orderData.city || '',
//             payment_method: orderData.payment_method || 'cash_on_delivery',
//             customer: orderData.customer || null,
//             rider: orderData.rider || null,
//             status: orderData.status || 'pending',
//             payment_status: orderData.payment_status || false,
//             delivery_date: orderData.delivery_date || '',
//           });
          
//           // Map order items
//           if (orderData.items && Array.isArray(orderData.items)) {
//             const items = orderData.items.map((item: any) => {
//               const productType = item.product_type || (item.sales_product ? 'sales_product' : 'product');
//               const productId = item.product_id || item.product || item.sales_product;
              
//               // Calculate prices based on product type
//               let unitPrice = item.unit_price || 0;
//               let totalPrice = item.total_price || 0;
              
//               if (productType === 'product') {
//                 const product = productsData.find((p: any) => p.id === productId);
//                 if (product) {
//                   unitPrice = product.price;
//                   totalPrice = product.price * (item.quantity || 1);
//                 }
//               } else {
//                 const salesProduct = salesProductsData.find((p: any) => p.id === productId);
//                 if (salesProduct) {
//                   unitPrice = salesProduct.final_price;
//                   totalPrice = salesProduct.final_price * (item.quantity || 1);
//                 }
//               }
              
//               return {
//                 id: item.id,
//                 product_type: productType,
//                 product_id: productId,
//                 quantity: item.quantity || 1,
//                 unit_price: unitPrice,
//                 total_price: totalPrice,
//                 is_discounted: item.is_discounted || item.has_discount || false
//               };
//             });
//             setOrderItems(items);
//             console.log('Order items loaded:', items);
//           }
//         }
        
//       } catch (error: any) {
//         console.error('Error fetching data:', error);
//         console.error('Error details:', error.response?.data);
//         const errorMessage = error.response?.data?.message || 'Failed to load order data';
//         toast.error(errorMessage, {
//           position: "top-center",
//           autoClose: 3000,
//           theme: "dark",
//         });
//       } finally {
//         setDataLoading(false);
//       }
//     };
    
//     fetchData();
//   }, [id, router]);

//   // Calculate total when items change
//   useEffect(() => {
//     const calculateTotal = () => {
//       let total = 0;
//       orderItems.forEach(item => {
//         if (item.total_price) {
//           total += item.total_price;
//         }
//       });
//       setCalculatedTotal(total);
//     };
//     calculateTotal();
//   }, [orderItems]);

//   // Auto-fill customer details when customer is selected
//   const handleCustomerSelect = (customerId: number | null) => {
//     if (customerId) {
//       const customer = customers.find(c => c.id === customerId);
//       if (customer) {
//         setFormData(prev => ({
//           ...prev,
//           customer: customerId,
//           customer_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.username,
//           customer_email: customer.email,
//         }));
//       }
//     } else {
//       setFormData(prev => ({
//         ...prev,
//         customer: null,
//       }));
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value, type } = e.target;
    
//     if (name === 'customer') {
//       handleCustomerSelect(value ? parseInt(value) : null);
//       return;
//     }
    
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
//     }));
//   };

//   const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
//     const updatedItems = [...orderItems];
//     updatedItems[index] = {
//       ...updatedItems[index],
//       [field]: field === 'quantity' ? parseInt(value) || 1 : value
//     };
    
//     // Reset product_id when product_type changes
//     if (field === 'product_type') {
//       updatedItems[index].product_id = null;
//       updatedItems[index].unit_price = 0;
//       updatedItems[index].total_price = 0;
//     }
    
//     // Recalculate price if product or quantity changed
//     if (field === 'product_id' || field === 'quantity' || field === 'product_type') {
//       const productId = updatedItems[index].product_id;
//       const quantity = updatedItems[index].quantity;
//       const productType = updatedItems[index].product_type;
      
//       if (productId) {
//         if (productType === 'product') {
//           const product = products.find(p => p.id === productId);
//           if (product) {
//             updatedItems[index].unit_price = product.price;
//             updatedItems[index].total_price = product.price * quantity;
//             updatedItems[index].is_discounted = product.has_discount;
//           }
//         } else {
//           const salesProduct = salesProducts.find(p => p.id === productId);
//           if (salesProduct) {
//             updatedItems[index].unit_price = salesProduct.final_price;
//             updatedItems[index].total_price = salesProduct.final_price * quantity;
//             updatedItems[index].is_discounted = salesProduct.has_discount;
//           }
//         }
//       }
//     }
    
//     setOrderItems(updatedItems);
//   };

//   const addItem = () => {
//     setOrderItems([...orderItems, { 
//       product_type: 'product', 
//       product_id: null, 
//       quantity: 1,
//       unit_price: 0,
//       total_price: 0
//     }]);
//   };

//   const removeItem = (index: number) => {
//     const itemToRemove = orderItems[index];
    
//     // If item has an ID, add it to delete list
//     if (itemToRemove.id) {
//       setItemsToDelete([...itemsToDelete, itemToRemove.id]);
//     }
    
//     // Remove item from the list
//     const updatedItems = orderItems.filter((_, i) => i !== index);
//     setOrderItems(updatedItems);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Validation
//     if (!formData.customer_name || !formData.customer_phone || !formData.delivery_address) {
//       toast.error('Please fill in all required fields', {
//         position: "top-center",
//         autoClose: 2000,
//         theme: "dark",
//       });
//       return;
//     }

//     const validItems = orderItems.filter(item => item.product_id !== null);
//     if (validItems.length === 0) {
//       toast.error('Please add at least one product', {
//         position: "top-center",
//         autoClose: 2000,
//         theme: "dark",
//       });
//       return;
//     }

//     setIsLoading(true);
    
//     try {
//       const payload = {
//         customer_name: formData.customer_name,
//         customer_email: formData.customer_email,
//         customer_phone: formData.customer_phone,
//         delivery_address: formData.delivery_address,
//         city: formData.city,
//         payment_method: formData.payment_method,
//         status: formData.status,
//         payment_status: formData.payment_status,
//         delivery_date: formData.delivery_date,
//         ...(formData.customer && { customer: formData.customer }),
//         ...(formData.rider && { rider: formData.rider }),
//         items: validItems.map(item => ({
//           ...(item.id && { id: item.id }),
//           product_type: item.product_type,
//           product_id: item.product_id,
//           quantity: item.quantity
//         })),
//         delete_items: itemsToDelete
//       };

//       console.log('Submitting update:', payload);
//       const response = await AxiosInstance.put(`/api/myapp/v1/order/${id}/`, payload);
      
//       if (response.data) {
//         toast.success('Order updated successfully!', {
//           position: "top-center",
//           autoClose: 2000,
//           theme: "dark",
//         });
//         setTimeout(() => {
//           router.push('/orderspage');
//         }, 2000);
//       }
//     } catch (error: any) {
//       console.error('Error updating order:', error);
//       const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update order';
//       toast.error(errorMessage, {
//         position: "top-center",
//         autoClose: 3000,
//         theme: "dark",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!permissions.update_order) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-6">
//         <div className="text-center p-10 max-w-md backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl">
//           <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
//             <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//             </svg>
//           </div>
//           <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-4">
//             Access Denied
//           </h2>
//           <p className="text-gray-400 mb-8 leading-relaxed">
//             You don't have permission to update orders.
//           </p>
//           <button 
//             onClick={() => router.push('/orderspage')}
//             className="group relative px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-semibold text-white shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300 hover:scale-105"
//           >
//             <span className="relative z-10">Return to Orders</span>
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (dataLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mb-4"></div>
//           <p className="text-gray-400">Loading order data...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
//       <ToastContainer 
//         position="top-center"
//         autoClose={2000}
//         hideProgressBar
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="dark"
//       />

//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="relative">
//             <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-amber-600/20 blur-2xl rounded-full"></div>
//             <h1 className="relative text-5xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent mb-3">
//               Update Order #{id}
//             </h1>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-24 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-transparent rounded-full"></div>
//               <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
//             </div>
//             <p className="relative text-gray-400 text-sm font-light tracking-wide">
//               Update customer details and order items
//             </p>
//           </div>
//         </div>

//         {/* Debug Info - Remove in production */}
//         <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
//           <p className="text-sm text-blue-300">
//             Products loaded: {products.length} | Sales Products loaded: {salesProducts.length} | Order Items: {orderItems.length}
//           </p>
//         </div>

//         {/* Form Card */}
//         <div className="relative group">
//           <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition duration-500"></div>
          
//           <div className="relative backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
//             <form onSubmit={handleSubmit} className="p-8 space-y-8">
//               {/* Customer Information Section */}
//               <div className="space-y-6">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
//                     <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                     </svg>
//                   </div>
//                   <h2 className="text-2xl font-bold text-white">Customer Information</h2>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* Link to Customer Account (Optional) */}
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Link to Customer Account (Optional)
//                     </label>
//                     <div className="relative">
//                       <select
//                         name="customer"
//                         className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
//                         value={formData.customer || ''}
//                         onChange={handleChange}
//                       >
//                         <option value="" className="bg-gray-900">No customer account (Guest order)</option>
//                         {customers.map(customer => (
//                           <option key={customer.id} value={customer.id} className="bg-gray-900">
//                             {customer.first_name || customer.last_name 
//                               ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
//                               : customer.username
//                             } ({customer.email})
//                           </option>
//                         ))}
//                       </select>
//                       <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                         <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                         </svg>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Customer Name */}
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Customer Name <span className="text-red-400">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       name="customer_name"
//                       className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
//                       value={formData.customer_name}
//                       onChange={handleChange}
//                       placeholder="Enter customer name"
//                       required
//                     />
//                   </div>

//                   {/* Customer Email */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Email
//                     </label>
//                     <input
//                       type="email"
//                       name="customer_email"
//                       className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
//                       value={formData.customer_email}
//                       onChange={handleChange}
//                       placeholder="customer@example.com"
//                     />
//                   </div>

//                   {/* Customer Phone */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Phone <span className="text-red-400">*</span>
//                     </label>
//                     <input
//                       type="tel"
//                       name="customer_phone"
//                       className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
//                       value={formData.customer_phone}
//                       onChange={handleChange}
//                       placeholder="+92-300-1234567"
//                       required
//                     />
//                   </div>

//                   {/* Delivery Address */}
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Delivery Address <span className="text-red-400">*</span>
//                     </label>
//                     <textarea
//                       name="delivery_address"
//                       rows={3}
//                       className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition resize-none"
//                       value={formData.delivery_address}
//                       onChange={handleChange}
//                       placeholder="Enter complete delivery address"
//                       required
//                     />
//                   </div>

//                   {/* City */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       City
//                     </label>
//                     <input
//                       type="text"
//                       name="city"
//                       className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
//                       value={formData.city}
//                       onChange={handleChange}
//                       placeholder="Enter city"
//                     />
//                   </div>

//                   {/* Payment Method */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Payment Method <span className="text-red-400">*</span>
//                     </label>
//                     <div className="relative">
//                       <select
//                         name="payment_method"
//                         className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
//                         value={formData.payment_method}
//                         onChange={handleChange}
//                         required
//                       >
//                         <option value="cash_on_delivery" className="bg-gray-900">Cash on Delivery</option>
//                         <option value="online" className="bg-gray-900">Online Payment</option>
//                         <option value="bank_transfer" className="bg-gray-900">Bank Transfer</option>
//                       </select>
//                       <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                         <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                         </svg>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Divider */}
//               <div className="border-t border-white/10"></div>

//               {/* Order Management Section */}
//               <div className="space-y-6">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
//                     <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                     </svg>
//                   </div>
//                   <h2 className="text-2xl font-bold text-white">Order Management</h2>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                   {/* Assign Rider */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Assign Rider (Optional)
//                     </label>
//                     <div className="relative">
//                       <select
//                         name="rider"
//                         className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
//                         value={formData.rider || ''}
//                         onChange={handleChange}
//                       >
//                         <option value="" className="bg-gray-900">No rider assigned</option>
//                         {riders.map(rider => (
//                           <option key={rider.id} value={rider.id} className="bg-gray-900">
//                             {rider.first_name || rider.last_name 
//                               ? `${rider.first_name || ''} ${rider.last_name || ''}`.trim()
//                               : rider.username
//                             }
//                           </option>
//                         ))}
//                       </select>
//                       <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                         <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                         </svg>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Order Status */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Order Status
//                     </label>
//                     <div className="relative">
//                       <select
//                         name="status"
//                         className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
//                         value={formData.status}
//                         onChange={handleChange}
//                       >
//                         <option value="pending" className="bg-gray-900">Pending</option>
//                         <option value="processing" className="bg-gray-900">Processing</option>
//                         <option value="completed" className="bg-gray-900">Completed</option>
//                         <option value="cancelled" className="bg-gray-900">Cancelled</option>
//                       </select>
//                       <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                         <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                         </svg>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Payment Status */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Payment Status
//                     </label>
//                     <div className="flex items-center h-12 px-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl">
//                       <label className="flex items-center cursor-pointer">
//                         <input
//                           type="checkbox"
//                           name="payment_status"
//                           className="w-5 h-5 text-amber-500 bg-gray-700 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
//                           checked={formData.payment_status}
//                           onChange={handleChange}
//                         />
//                         <span className="ml-3 text-sm font-medium text-gray-300">
//                           {formData.payment_status ? 'Paid' : 'Unpaid'}
//                         </span>
//                       </label>
//                     </div>
//                   </div>

//                   {/* Delivery Date */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-300 mb-2">
//                       Delivery Date
//                     </label>
//                     <input
//                       type="date"
//                       name="delivery_date"
//                       className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
//                       value={formData.delivery_date}
//                       onChange={handleChange}
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Divider */}
//               <div className="border-t border-white/10"></div>

//               {/* Order Items Section */}
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
//                       <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//                       </svg>
//                     </div>
//                     <h2 className="text-2xl font-bold text-white">Order Items</h2>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={addItem}
//                     className="group relative px-6 py-2.5 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 text-green-300 rounded-xl hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 flex items-center shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
//                   >
//                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                     </svg>
//                     Add Item
//                   </button>
//                 </div>

//                 {/* Items List */}
//                 <div className="space-y-4">
//                   {orderItems.map((item, index) => (
//                     <div key={index} className="relative group/item">
//                       <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-2xl blur opacity-0 group-hover/item:opacity-100 transition duration-300"></div>
                      
//                       <div className="relative backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10">
//                         <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
//                           {/* Item Number */}
//                           <div className="md:col-span-12 flex items-center justify-between mb-2">
//                             <div className="flex items-center gap-3">
//                               <span className="text-sm font-semibold text-amber-400">Item #{index + 1}</span>
//                               {item.id && (
//                                 <span className="text-xs text-gray-500">(ID: {item.id})</span>
//                               )}
//                             </div>
//                             {orderItems.length > 1 && (
//                               <button
//                                 type="button"
//                                 onClick={() => removeItem(index)}
//                                 className="group/remove p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all duration-200"
//                               >
//                                 <svg className="w-5 h-5 text-red-400 group-hover/remove:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                                 </svg>
//                               </button>
//                             )}
//                           </div>

//                           {/* Product Type */}
//                           <div className="md:col-span-4">
//                             <label className="block text-sm font-medium text-gray-300 mb-2">Product Type</label>
//                             <div className="relative">
//                               <select
//                                 className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
//                                 value={item.product_type}
//                                 onChange={(e) => handleItemChange(index, 'product_type', e.target.value)}
//                               >
//                                 <option value="product" className="bg-gray-900">Regular Product</option>
//                                 <option value="sales_product" className="bg-gray-900">Sales Product (Discounted)</option>
//                               </select>
//                               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                                 </svg>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Product Selection */}
//                           <div className="md:col-span-5">
//                             <label className="block text-sm font-medium text-gray-300 mb-2">
//                               Product 
//                               {item.product_type === 'product' && products.length === 0 && (
//                                 <span className="ml-2 text-xs text-red-400">(No products available)</span>
//                               )}
//                               {item.product_type === 'sales_product' && salesProducts.length === 0 && (
//                                 <span className="ml-2 text-xs text-red-400">(No sales products available)</span>
//                               )}
//                             </label>
//                             <div className="relative">
//                               <select
//                                 className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
//                                 value={item.product_id || ''}
//                                 onChange={(e) => handleItemChange(index, 'product_id', parseInt(e.target.value) || null)}
//                                 required
//                               >
//                                 <option value="" className="bg-gray-900">Select a product</option>
//                                 {item.product_type === 'product' 
//                                   ? products.map(product => (
//                                       <option key={product.id} value={product.id} className="bg-gray-900">
//                                         {product.name} - PKR {product.price.toFixed(2)}
//                                       </option>
//                                     ))
//                                   : salesProducts.map(product => (
//                                       <option key={product.id} value={product.id} className="bg-gray-900">
//                                         {product.name} - PKR {product.final_price.toFixed(2)} (Sale)
//                                       </option>
//                                     ))}
//                               </select>
//                               <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
//                                 <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
//                                 </svg>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Quantity */}
//                           <div className="md:col-span-3">
//                             <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
//                             <input
//                               type="number"
//                               min="1"
//                               className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
//                               value={item.quantity}
//                               onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
//                             />
//                           </div>

//                           {/* Price Display */}
//                           {item.total_price !== undefined && item.total_price > 0 && (
//                             <div className="md:col-span-12 mt-2">
//                               <div className="flex justify-between text-sm text-gray-400">
//                                 <span>Unit Price: PKR {item.unit_price?.toFixed(2)}</span>
//                                 <span className="font-semibold text-amber-400">
//                                   Total: PKR {item.total_price.toFixed(2)}
//                                 </span>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Order Summary */}
//                 <div className="relative">
//                   <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-2xl blur"></div>
//                   <div className="relative backdrop-blur-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 p-6 rounded-2xl border border-amber-500/20">
//                     <div className="flex items-center justify-between">
//                       <div className="flex items-center gap-3">
//                         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/30 flex items-center justify-center">
//                           <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                           </svg>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-400">Updated Total</p>
//                           <p className="text-3xl font-bold text-amber-400">PKR {calculatedTotal.toFixed(2)}</p>
//                         </div>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-gray-400">Total Items</p>
//                         <p className="text-2xl font-bold text-white">{orderItems.filter(item => item.product_id).length}</p>
//                       </div>
//                     </div>
//                     {itemsToDelete.length > 0 && (
//                       <div className="mt-4 pt-4 border-t border-white/10">
//                         <p className="text-sm text-red-400">
//                           {itemsToDelete.length} item(s) will be removed from the order
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Submit Buttons */}
//               <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
//                 <button
//                   type="button"
//                   onClick={() => router.push('/orderspage')}
//                   className="group relative px-8 py-3.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
//                 >
//                   <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   disabled={isLoading}
//                   className="group relative px-10 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-semibold text-white shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300 hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
//                 >
//                   {isLoading ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Updating Order...
//                     </>
//                   ) : (
//                     <>
//                       <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                       </svg>
//                       Update Order
//                     </>
//                   )}
//                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UpdateOrder;






'use client'
import React, { useState, useEffect, useContext } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AxiosInstance from "@/components/AxiosInstance";
import { AuthContext } from '@/components/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Product {
  id: number;
  name: string;
  price: number;
  has_discount?: boolean;
}

interface SalesProduct {
  id: number;
  name: string;
  final_price: number;
  has_discount?: boolean;
}

interface Customer {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface Rider {
  id: number;
  username: string;
  first_name?: string;
  last_name?: string;
}

interface OrderItem {
  id?: number;
  product_type: 'product' | 'sales_product';
  product_id: number | null;
  quantity: number;
  unit_price?: number;
  total_price?: number;
  is_discounted?: boolean;
}

const UpdateOrder = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('orderid');
  const { permissions = {} } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    city: '',
    payment_method: 'cash_on_delivery',
    customer: null as number | null,
    rider: null as number | null,
    status: 'pending',
    payment_status: false,
    delivery_date: '',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [salesProducts, setSalesProducts] = useState<SalesProduct[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [itemsToDelete, setItemsToDelete] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [calculatedTotal, setCalculatedTotal] = useState(0);

  // Fetch all data including order details
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        toast.error('No order ID provided', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
        router.push('/adminorder');
        return;
      }

      setDataLoading(true);
      try {
        console.log('🔍 Fetching data for order ID:', id);
        
        // Fetch all data in parallel and store products first
        const [productsRes, salesProductsRes, customersRes, ridersRes, orderRes] = await Promise.all([
          AxiosInstance.get('/api/myapp/v1/dropdown/product/'),
          AxiosInstance.get('/api/myapp/v1/dropdown/sales/product/'),
          AxiosInstance.get('/api/myapp/v1/user/?role=customer'),
          AxiosInstance.get('/api/myapp/v1/user/?role=rider'),
          AxiosInstance.get(`/api/myapp/v1/order/${id}/`)
        ]);

        console.log('📦 Products Response:', productsRes.data);
        console.log('🏷️ Sales Products Response:', salesProductsRes.data);
        console.log('📋 Order Response:', orderRes.data);
        
        // Process products
        let loadedProducts: Product[] = [];
        if (productsRes.data?.data && Array.isArray(productsRes.data.data)) {
          loadedProducts = productsRes.data.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            has_discount: product.has_discount || false
          }));
          setProducts(loadedProducts);
          console.log('✅ Products loaded:', loadedProducts.length);
        } else {
          console.warn('⚠️ No products data found');
          setProducts([]);
        }
        
        // Process sales products
        let loadedSalesProducts: SalesProduct[] = [];
        if (salesProductsRes.data?.data && Array.isArray(salesProductsRes.data.data)) {
          loadedSalesProducts = salesProductsRes.data.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            final_price: Number(product.final_price) || 0,
            has_discount: product.has_discount || false
          }));
          setSalesProducts(loadedSalesProducts);
          console.log('✅ Sales Products loaded:', loadedSalesProducts.length);
        } else {
          console.warn('⚠️ No sales products data found');
          setSalesProducts([]);
        }
        
        // Process customers
        if (customersRes.data?.data && Array.isArray(customersRes.data.data)) {
          setCustomers(customersRes.data.data);
          console.log('✅ Customers loaded:', customersRes.data.data.length);
        }
        
        // Process riders
        if (ridersRes.data?.data && Array.isArray(ridersRes.data.data)) {
          setRiders(ridersRes.data.data);
          console.log('✅ Riders loaded:', ridersRes.data.data.length);
        }
        
        // Process order data - using technique from old working code
        let orderData = null;
        
        // Extract order data from response
        if (orderRes.data?.data) {
          orderData = orderRes.data.data;
        } else if (orderRes.data) {
          orderData = orderRes.data;
        }
        
        if (orderData) {
          console.log('📝 Processing order data:', orderData);
          
          // Set form data - map all fields correctly
          const newFormData = {
            customer_name: orderData.customer_name || '',
            customer_email: orderData.customer_email || '',
            customer_phone: orderData.customer_phone || '',
            delivery_address: orderData.delivery_address || '',
            city: orderData.city || '',
            payment_method: orderData.payment_method || 'cash_on_delivery',
            customer: orderData.customer || null,
            rider: orderData.rider || null,
            status: orderData.status || 'pending',
            payment_status: orderData.payment_status || false,
            delivery_date: orderData.delivery_date || '',
          };
          
          console.log('📝 Setting form data:', newFormData);
          setFormData(newFormData);
          
          // Process order items - using old code technique
          if (orderData.items && Array.isArray(orderData.items)) {
            console.log('📦 Processing', orderData.items.length, 'order items');
            
            // Map order items similar to old code
            const items = orderData.items.map((item: any) => {
              // Determine product type based on which field is present
              const isSalesProduct = item.sales_product !== null && item.sales_product !== undefined;
              const productType = isSalesProduct ? 'sales_product' : 'product';
              const productId = isSalesProduct ? item.sales_product : item.product;
              
              // Calculate prices based on product type
              let unitPrice = Number(item.unit_price) || 0;
              let totalPrice = Number(item.total_price) || 0;
              const quantity = Number(item.quantity) || 1;
              
              // If prices not in response, calculate from loaded products
              if (unitPrice === 0 && productId) {
                if (productType === 'product') {
                  const product = loadedProducts.find((p: Product) => p.id === productId);
                  if (product) {
                    unitPrice = product.price;
                    totalPrice = product.price * quantity;
                  }
                } else {
                  const salesProduct = loadedSalesProducts.find((p: SalesProduct) => p.id === productId);
                  if (salesProduct) {
                    unitPrice = salesProduct.final_price;
                    totalPrice = salesProduct.final_price * quantity;
                  }
                }
              }
              
              console.log(`  ✓ Item: ${productType} #${productId}, qty: ${quantity}, price: ${totalPrice}`);
              
              return {
                id: item.id,
                product_type: productType,
                product_id: productId,
                quantity: quantity,
                unit_price: unitPrice,
                total_price: totalPrice,
                is_discounted: isSalesProduct
              };
            });
            
            console.log('✅ Processed order items:', items);
            setOrderItems(items);
            
            toast.success('Order data loaded successfully!', {
              position: "top-center",
              autoClose: 1500,
              theme: "dark",
            });
          } else if (orderData.order_details && Array.isArray(orderData.order_details)) {
            // Alternative field name from old API
            console.log('📦 Processing order_details:', orderData.order_details.length);
            
            const items = orderData.order_details.map((item: any) => {
              const isSalesProduct = item.sales_product !== null && item.sales_product !== undefined;
              const productType = isSalesProduct ? 'sales_product' : 'product';
              const productId = isSalesProduct ? item.sales_product : item.product;
              
              let unitPrice = Number(item.unit_price) || 0;
              let totalPrice = Number(item.total_price) || 0;
              const quantity = Number(item.quantity) || 1;
              
              if (unitPrice === 0 && productId) {
                if (productType === 'product') {
                  const product = loadedProducts.find((p: Product) => p.id === productId);
                  if (product) {
                    unitPrice = product.price;
                    totalPrice = product.price * quantity;
                  }
                } else {
                  const salesProduct = loadedSalesProducts.find((p: SalesProduct) => p.id === productId);
                  if (salesProduct) {
                    unitPrice = salesProduct.final_price;
                    totalPrice = salesProduct.final_price * quantity;
                  }
                }
              }
              
              return {
                id: item.id,
                product_type: productType,
                product_id: productId,
                quantity: quantity,
                unit_price: unitPrice,
                total_price: totalPrice,
                is_discounted: isSalesProduct
              };
            });
            
            console.log('✅ Processed order items:', items);
            setOrderItems(items);
            
            toast.success('Order data loaded successfully!', {
              position: "top-center",
              autoClose: 1500,
              theme: "dark",
            });
          } else {
            console.warn('⚠️ No items or order_details found in order data');
            setOrderItems([]);
          }
        } else {
          throw new Error('Order data not found in response');
        }
        
      } catch (error: any) {
        console.error('❌ Error fetching data:', error);
        console.error('❌ Error details:', error.response?.data);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            'Failed to load order data';
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, [id, router]);

  // Calculate total when items change
  useEffect(() => {
    const calculateTotal = () => {
      let total = 0;
      orderItems.forEach(item => {
        if (item.total_price) {
          total += item.total_price;
        }
      });
      setCalculatedTotal(total);
    };
    calculateTotal();
  }, [orderItems]);

  // Auto-fill customer details when customer is selected
  const handleCustomerSelect = (customerId: number | null) => {
    if (customerId) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        setFormData(prev => ({
          ...prev,
          customer: customerId,
          customer_name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.username,
          customer_email: customer.email,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        customer: null,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'customer') {
      handleCustomerSelect(value ? parseInt(value) : null);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' ? parseInt(value) || 1 : value
    };
    
    // Reset product_id when product_type changes
    if (field === 'product_type') {
      updatedItems[index].product_id = null;
      updatedItems[index].unit_price = 0;
      updatedItems[index].total_price = 0;
    }
    
    // Recalculate price if product or quantity changed
    if (field === 'product_id' || field === 'quantity' || field === 'product_type') {
      const productId = updatedItems[index].product_id;
      const quantity = updatedItems[index].quantity;
      const productType = updatedItems[index].product_type;
      
      if (productId) {
        if (productType === 'product') {
          const product = products.find(p => p.id === productId);
          if (product) {
            updatedItems[index].unit_price = product.price;
            updatedItems[index].total_price = product.price * quantity;
            updatedItems[index].is_discounted = product.has_discount;
          }
        } else {
          const salesProduct = salesProducts.find(p => p.id === productId);
          if (salesProduct) {
            updatedItems[index].unit_price = salesProduct.final_price;
            updatedItems[index].total_price = salesProduct.final_price * quantity;
            updatedItems[index].is_discounted = salesProduct.has_discount;
          }
        }
      }
    }
    
    setOrderItems(updatedItems);
  };

  const addItem = () => {
    setOrderItems([...orderItems, { 
      product_type: 'product', 
      product_id: null, 
      quantity: 1,
      unit_price: 0,
      total_price: 0
    }]);
  };

  const removeItem = (index: number) => {
    const itemToRemove = orderItems[index];
    
    // If item has an ID, add it to delete list
    if (itemToRemove.id) {
      setItemsToDelete([...itemsToDelete, itemToRemove.id]);
    }
    
    // Remove item from the list
    const updatedItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.customer_name || !formData.customer_phone || !formData.delivery_address) {
      toast.error('Please fill in all required fields', {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
      return;
    }

    const validItems = orderItems.filter(item => item.product_id !== null);
    if (validItems.length === 0) {
      toast.error('Please add at least one product', {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        delivery_address: formData.delivery_address,
        city: formData.city,
        payment_method: formData.payment_method,
        status: formData.status,
        payment_status: formData.payment_status,
        delivery_date: formData.delivery_date,
        ...(formData.customer && { customer: formData.customer }),
        ...(formData.rider && { rider: formData.rider }),
        items: validItems.map(item => ({
          ...(item.id && { id: item.id }),
          product_type: item.product_type,
          product_id: item.product_id,
          quantity: item.quantity
        })),
        delete_items: itemsToDelete
      };

      console.log('Submitting update:', payload);
      const response = await AxiosInstance.put(`/api/myapp/v1/order/${id}/`, payload);
      
      if (response.data) {
        toast.success('Order updated successfully!', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
        setTimeout(() => {
          router.push('/adminorder');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error updating order:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to update order';
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!permissions.update_order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="text-center p-10 max-w-md backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
            <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-4">
            Access Denied
          </h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            You don't have permission to update orders.
          </p>
          <button 
            onClick={() => router.push('/adminorder')}
            className="group relative px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-semibold text-white shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300 hover:scale-105"
          >
            <span className="relative z-10">Return to Orders</span>
          </button>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-300 font-light">Loading order data...</p>
          <p className="text-sm text-gray-500 mt-2">Order ID: {id}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer 
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-amber-600/20 blur-2xl rounded-full"></div>
            <h1 className="relative text-5xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent mb-3">
              Update Order #{id}
            </h1>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-24 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-transparent rounded-full"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
            </div>
            <p className="relative text-gray-400 text-sm font-light tracking-wide">
              Update customer details and order items
            </p>
          </div>
        </div>

        {/* Debug Info - Remove in production */}
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-300">
              <span className="font-semibold">Order ID:</span> {id} | 
              <span className="font-semibold ml-2">Products:</span> {products.length} | 
              <span className="font-semibold ml-2">Sales Products:</span> {salesProducts.length} | 
              <span className="font-semibold ml-2">Order Items:</span> {orderItems.length}
            </p>
            {orderItems.length > 0 && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                ✓ Data Loaded
              </span>
            )}
          </div>
        </div>

        {/* Form Card */}
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition duration-500"></div>
          
          <div className="relative backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Customer Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Customer Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Link to Customer Account (Optional) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Link to Customer Account (Optional)
                    </label>
                    <div className="relative">
                      <select
                        name="customer"
                        className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
                        value={formData.customer || ''}
                        onChange={handleChange}
                      >
                        <option value="" className="bg-gray-900">No customer account (Guest order)</option>
                        {customers.map(customer => (
                          <option key={customer.id} value={customer.id} className="bg-gray-900">
                            {customer.first_name || customer.last_name 
                              ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                              : customer.username
                            } ({customer.email})
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Customer Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
                      value={formData.customer_name}
                      onChange={handleChange}
                      placeholder="Enter customer name"
                      required
                    />
                    {formData.customer_name && (
                      <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Loaded: {formData.customer_name}
                      </p>
                    )}
                  </div>

                  {/* Customer Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
                      value={formData.customer_email}
                      onChange={handleChange}
                      placeholder="customer@example.com"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customer_phone"
                      className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      placeholder="+92-300-1234567"
                      required
                    />
                  </div>

                  {/* Delivery Address */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Delivery Address <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="delivery_address"
                      rows={3}
                      className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition resize-none"
                      value={formData.delivery_address}
                      onChange={handleChange}
                      placeholder="Enter complete delivery address"
                      required
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Payment Method <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="payment_method"
                        className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
                        value={formData.payment_method}
                        onChange={handleChange}
                        required
                      >
                        <option value="cash_on_delivery" className="bg-gray-900">Cash on Delivery</option>
                        <option value="online" className="bg-gray-900">Online Payment</option>
                        <option value="bank_transfer" className="bg-gray-900">Bank Transfer</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10"></div>

              {/* Order Management Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Order Management</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Assign Rider */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Assign Rider (Optional)
                    </label>
                    <div className="relative">
                      <select
                        name="rider"
                        className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
                        value={formData.rider || ''}
                        onChange={handleChange}
                      >
                        <option value="" className="bg-gray-900">No rider assigned</option>
                        {riders.map(rider => (
                          <option key={rider.id} value={rider.id} className="bg-gray-900">
                            {rider.first_name || rider.last_name 
                              ? `${rider.first_name || ''} ${rider.last_name || ''}`.trim()
                              : rider.username
                            }
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Order Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Order Status
                    </label>
                    <div className="relative">
                      <select
                        name="status"
                        className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="pending" className="bg-gray-900">Pending</option>
                        <option value="processing" className="bg-gray-900">Processing</option>
                        <option value="completed" className="bg-gray-900">Completed</option>
                        <option value="cancelled" className="bg-gray-900">Cancelled</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Payment Status
                    </label>
                    <div className="flex items-center h-12 px-4 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="payment_status"
                          className="w-5 h-5 text-amber-500 bg-gray-700 border-gray-600 rounded focus:ring-amber-500 focus:ring-2"
                          checked={formData.payment_status}
                          onChange={handleChange}
                        />
                        <span className="ml-3 text-sm font-medium text-gray-300">
                          {formData.payment_status ? 'Paid' : 'Unpaid'}
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Delivery Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      name="delivery_date"
                      className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
                      value={formData.delivery_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10"></div>

              {/* Order Items Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Order Items</h2>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="group relative px-6 py-2.5 bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-xl border border-green-500/30 text-green-300 rounded-xl hover:from-green-600/30 hover:to-emerald-600/30 transition-all duration-300 flex items-center shadow-lg shadow-green-500/20 hover:shadow-green-500/40"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Item
                  </button>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="relative group/item">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-2xl blur opacity-0 group-hover/item:opacity-100 transition duration-300"></div>
                      
                      <div className="relative backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* Item Number */}
                          <div className="md:col-span-12 flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-semibold text-amber-400">Item #{index + 1}</span>
                              {item.id && (
                                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                                  ID: {item.id}
                                </span>
                              )}
                            </div>
                            {orderItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="group/remove p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-all duration-200"
                              >
                                <svg className="w-5 h-5 text-red-400 group-hover/remove:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Product Type */}
                          <div className="md:col-span-4">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Product Type</label>
                            <div className="relative">
                              <select
                                className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
                                value={item.product_type}
                                onChange={(e) => handleItemChange(index, 'product_type', e.target.value)}
                              >
                                <option value="product" className="bg-gray-900">Regular Product</option>
                                <option value="sales_product" className="bg-gray-900">Sales Product (Discounted)</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Product Selection */}
                          <div className="md:col-span-5">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Product 
                              {item.product_type === 'product' && products.length === 0 && (
                                <span className="ml-2 text-xs text-red-400">(No products available)</span>
                              )}
                              {item.product_type === 'sales_product' && salesProducts.length === 0 && (
                                <span className="ml-2 text-xs text-red-400">(No sales products available)</span>
                              )}
                            </label>
                            <div className="relative">
                              <select
                                className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition appearance-none"
                                value={item.product_id || ''}
                                onChange={(e) => handleItemChange(index, 'product_id', parseInt(e.target.value) || null)}
                                required
                              >
                                <option value="" className="bg-gray-900">Select a product</option>
                                {item.product_type === 'product' 
                                  ? products.map(product => (
                                      <option key={product.id} value={product.id} className="bg-gray-900">
                                        {product.name} - PKR {product.price.toFixed(2)}
                                      </option>
                                    ))
                                  : salesProducts.map(product => (
                                      <option key={product.id} value={product.id} className="bg-gray-900">
                                        {product.name} - PKR {product.final_price.toFixed(2)} (Sale)
                                      </option>
                                    ))}
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              className="w-full px-4 py-3 backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                            />
                          </div>

                          {/* Price Display */}
                          {item.total_price !== undefined && item.total_price > 0 && (
                            <div className="md:col-span-12 mt-2">
                              <div className="flex justify-between text-sm p-3 bg-gray-900/50 rounded-lg">
                                <span className="text-gray-400">Unit Price: <span className="text-white">PKR {item.unit_price?.toFixed(2)}</span></span>
                                <span className="font-semibold text-amber-400">
                                  Total: PKR {item.total_price.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-2xl blur"></div>
                  <div className="relative backdrop-blur-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 p-6 rounded-2xl border border-amber-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/30 to-amber-600/30 flex items-center justify-center">
                          <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Updated Total</p>
                          <p className="text-3xl font-bold text-amber-400">PKR {calculatedTotal.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Total Items</p>
                        <p className="text-2xl font-bold text-white">{orderItems.filter(item => item.product_id).length}</p>
                      </div>
                    </div>
                    {itemsToDelete.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/10">
                        <p className="text-sm text-red-400 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {itemsToDelete.length} item(s) will be removed from the order
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/adminorder')}
                  className="group relative px-8 py-3.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative px-10 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-semibold text-white shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300 hover:scale-105 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Order...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Update Order
                    </>
                  )}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrder;