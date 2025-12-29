// 'use client';
// import React, { useEffect, useState, useContext, useRef } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/components/AuthContext';

// const SalesProductsCom = () => {
//   const router = useRouter();
//   const { permissions = {} } = useContext(AuthContext);
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [categories, setCategories] = useState([]);
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const modalRef = useRef(null);
//   const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

//   // Simplified pagination state
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     limit: 12,
//     totalPages: 1,
//     totalCount: 0,
//     hasNext: false,
//     hasPrevious: false
//   });

//   // Handle modal focus
//   useEffect(() => {
//     if (showDetailsModal && modalRef.current) {
//       modalRef.current.focus();
//     }
//   }, [showDetailsModal]);

//   // Fetch sales products
//   useEffect(() => {
//     const fetchSalesProducts = async () => {
//       try {
//         setIsLoading(true);
        
//         // API call with proper parameters
//         const res = await AxiosInstance.get(
//           `/api/myapp/v1/sales/product/`,
//           {
//             params: {
//               page: pagination.currentPage,
//               limit: pagination.limit,
//               order: 'desc',
//               order_by: 'created_at',
//               api_type: 'list' // REQUIRED: triggers list serializer
//             }
//           }
//         );
        
//         // Parse response according to backend structure
//         const responseData = res?.data?.data; // { data: [...], count: X }
        
//         if (!responseData) {
//           console.error('Invalid response structure:', res?.data);
//           toast.error('Invalid response from server');
//           setRecords([]);
//           setFilteredRecords([]);
//           return;
//         }
        
//         // Get the actual data array
//         const dataArr = Array.isArray(responseData.data) ? responseData.data : 
//                        Array.isArray(responseData) ? responseData : [];
        
//         // Process images for each product
//         const processed = dataArr.map(product => {
//           const imageUrls = product.image_urls || [];
//           return {
//             ...product,
//             mainImage: imageUrls.length > 0
//               ? `${baseURL}${imageUrls[0].startsWith('/') ? '' : '/'}${imageUrls[0]}`
//               : '/default-product-image.jpg',
//             remainingImages: imageUrls.slice(1).map(url => 
//               `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`
//             ) || []
//           };
//         });
        
//         setRecords(processed);
//         setFilteredRecords(processed);
        
//         // Get count from response
//         const totalCount = responseData?.count || dataArr.length;
//         const totalPages = Math.ceil(totalCount / pagination.limit);
        
//         setPagination(prev => ({
//           ...prev,
//           totalPages: totalPages,
//           totalCount: totalCount,
//           hasNext: pagination.currentPage < totalPages,
//           hasPrevious: pagination.currentPage > 1
//         }));
        
//       } catch (error) {
//         console.error('Error fetching sale products:', error);
//         console.error('Error details:', error.response?.data);
        
//         toast.error(
//           error.response?.data?.message || 'Failed to load sale products',
//           {
//             position: "top-center",
//             autoClose: 3000,
//             hideProgressBar: true,
//             closeOnClick: true,
//             pauseOnHover: true,
//             draggable: true,
//             theme: "light",
//           }
//         );
//         setRecords([]);
//         setFilteredRecords([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     const fetchCategories = async () => {
//       try {
//         const res = await AxiosInstance.get('/api/myapp/v1/category/');
//         const responseData = res?.data?.data;
//         const categoriesArr = Array.isArray(responseData?.data) ? responseData.data : 
//                              Array.isArray(responseData) ? responseData : [];
//         setCategories(categoriesArr);
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//       }
//     };

//     fetchSalesProducts();
//     fetchCategories();
//   }, [refreshKey, pagination.currentPage, pagination.limit, baseURL]);

//   const openDetailsModal = (product) => {
//     setSelectedProduct(product);
//     setShowDetailsModal(true);
//   };

//   const closeDetailsModal = () => {
//     setShowDetailsModal(false);
//     setSelectedProduct(null);
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);

//     const filtered = records.filter((record) => {
//       const idMatch = record.id.toString() === value;
//       const nameMatch = record.name.toLowerCase().includes(value);
//       const categoryMatch = record.category_name?.toLowerCase().includes(value);
//       return idMatch || nameMatch || categoryMatch;
//     });

//     setFilteredRecords(filtered);
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

//   const deleteRecord = async (id) => {
//     if (!permissions.delete_sales_product) {
//       toast.error('You do not have permission to delete sale products');
//       return;
//     }
    
//     if (!window.confirm('Are you sure you want to delete this sale product?')) return;
    
//     try {
//       // CORRECT DELETE URL - uses query parameter
//       await AxiosInstance.delete(`/api/myapp/v1/sales/product/?id=${id}`);
//       setRefreshKey(prev => prev + 1);
      
//       if (selectedProduct?.id === id) {
//         closeDetailsModal();
//       }
      
//       toast.success('Sale product deleted successfully', {
//         position: "top-center",
//         autoClose: 2000,
//         hideProgressBar: true,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: "dark",
//       });
//     } catch (error) {
//       console.error('Error deleting sale product:', error);
//       toast.error('Error deleting sale product', {
//         position: "top-center",
//         autoClose: 2000,
//         hideProgressBar: true,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: "dark",
//       });
//     }
//   };

//   const updateRecord = async (saleproductid) => {
//     if (!permissions.update_sales_product) {
//       toast.error('You do not have permission to update sale products');
//       return;
//     }
//     router.push(`/updatesalesproductpage?saleproductid=${saleproductid}`);
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
//       setPagination(prev => ({ ...prev, currentPage: newPage }));
//     }
//   };

//   const handleLimitChange = (e) => {
//     const newLimit = parseInt(e.target.value);
//     setPagination(prev => ({ 
//       ...prev, 
//       limit: newLimit,
//       currentPage: 1
//     }));
//   };

//   // Generate page numbers for pagination
//   const getPageNumbers = () => {
//     const { currentPage, totalPages } = pagination;
//     const pages = [];
    
//     if (totalPages <= 7) {
//       // Show all pages if total is 7 or less
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       // Always show first page
//       pages.push(1);
      
//       if (currentPage <= 3) {
//         // Near the start
//         pages.push(2, 3, 4, 5);
//         pages.push('...');
//         pages.push(totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         // Near the end
//         pages.push('...');
//         pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
//       } else {
//         // In the middle
//         pages.push('...');
//         pages.push(currentPage - 1, currentPage, currentPage + 1);
//         pages.push('...');
//         pages.push(totalPages);
//       }
//     }
    
//     return pages;
//   };

//   if (!permissions.read_sales_product) {
//       return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center relative overflow-hidden">
//           {/* Animated Background */}
//           <div className="absolute inset-0">
//             <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
//           </div>
          
//           <div className="text-center p-8 max-w-md relative z-10">
//             <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/50">
//               <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
//               </svg>
//             </div>
//             <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent mb-4">Access Denied</h2>
//             <p className="text-slate-400 mb-6">
//               You don't have permission to view sale products. Please contact your administrator.
//             </p>
//             <button 
//               onClick={() => router.push('/')}
//               className="px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-full hover:shadow-lg hover:shadow-amber-500/50 transition-all"
//             >
//               Return to Dashboard
//             </button>
//           </div>
//           <ToastContainer position="top-right" autoClose={2000} />
//         </div>
//       );
//     }
  
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0">
//         <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
//       </div>

//       <ToastContainer 
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="light"
//       />
      
//       {/* Product Details Modal */}
//       {showDetailsModal && selectedProduct && (
//         <div 
//           ref={modalRef}
//           tabIndex={-1}
//           aria-modal="true"
//           role="dialog"
//           className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-y-auto"
//           onClick={closeDetailsModal}
//         >
//           <div 
//             className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl max-w-4xl w-full max-h-screen overflow-y-auto p-8 border border-amber-400/30 shadow-2xl shadow-amber-500/20"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
//                 {selectedProduct.name}
//               </h2>
//               <button 
//                 onClick={closeDetailsModal} 
//                 className="text-amber-400 hover:text-white text-3xl transition-colors"
//                 aria-label="Close modal"
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               <div>
//                 <div className="relative rounded-2xl overflow-hidden border border-slate-700/50">
//                   <img 
//                     src={selectedProduct.mainImage} 
//                     alt={selectedProduct.name}
//                     className="w-full h-80 object-contain bg-slate-900 rounded-2xl"
//                     onError={(e) => {
//                       e.target.src = '/default-product-image.jpg';
//                     }}
//                   />
//                   {selectedProduct.discount_percent > 0 && (
//                     <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-red-500/50">
//                       {selectedProduct.discount_percent}% OFF
//                     </div>
//                   )}
//                 </div>
//                 {selectedProduct.remainingImages.length > 0 && (
//                   <div className="grid grid-cols-4 gap-2 mt-4">
//                     {selectedProduct.remainingImages.map((img, i) => (
//                       <img 
//                         key={i} 
//                         src={img} 
//                         className="h-20 object-cover rounded-lg border border-slate-700/50" 
//                         alt={`Additional view ${i + 1}`}
//                         onError={(e) => {
//                           e.target.src = '/default-product-image.jpg';
//                         }}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
              
//               <div className="text-slate-300">
//                 <h3 className="text-lg font-semibold text-amber-400 mb-2">Description</h3>
//                 <p className="mb-6">{selectedProduct.description}</p>
                
//                 <div className="grid grid-cols-2 gap-4 mt-6">
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Category</h3>
//                     <p>{selectedProduct.category_name || selectedProduct.category?.name || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Original Price</h3>
//                     <p className="line-through">PKR {parseFloat(selectedProduct.original_price || 0).toLocaleString()}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Discount</h3>
//                     <p>{selectedProduct.discount_percent}% OFF</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Final Price</h3>
//                     <p className="text-amber-300 font-bold">PKR {parseFloat(selectedProduct.final_price || 0).toLocaleString()}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Created At</h3>
//                     <p>{new Date(selectedProduct.created_at).toLocaleDateString()}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Created By</h3>
//                     <p>{selectedProduct.created_by?.get_full_name || selectedProduct.created_by?.email}</p>
//                   </div>
//                 </div>
                
//                 <div className="flex mt-8 space-x-4">
//                   {permissions.update_sales_product && (
//                     <button 
//                       onClick={() => {
//                         updateRecord(selectedProduct.id);
//                         closeDetailsModal();
//                       }}
//                       className="px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all"
//                     >
//                       Edit
//                     </button>
//                   )}
                  
//                   {permissions.delete_sales_product && (
//                     <button 
//                       onClick={() => deleteRecord(selectedProduct.id)}
//                       className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all"
//                     >
//                       Delete
//                     </button>
//                   )}
                  
//                   <button 
//                     onClick={closeDetailsModal}
//                     className="px-6 py-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="relative max-w-7xl mx-auto">
//         {/* Luxury Header Container */}
//         <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-10 relative overflow-hidden mb-10">
//           <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
//           <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
          
//           <div className="relative z-10">
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
//               <div>
//                 <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-2xl shadow-amber-500/50 mb-4">
//                   <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
//                   </svg>
//                 </div>
//                 <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-2">
//                   EXCLUSIVE OFFERS
//                 </h1>
//                 <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mb-3"></div>
//                 <p className="text-slate-400">Manage premium sale products</p>
//               </div>
              
//               {permissions.create_sales_product && (
//                 <button
//                   className="group relative px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-full shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all duration-300 mt-4 md:mt-0"
//                   onClick={() => router.push('/adminaddsales')}
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"></div>
//                   <div className="relative flex items-center space-x-2">
//                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
//                     </svg>
//                     <span>Add Sale Product</span>
//                   </div>
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Search and Stats Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50 mb-8 gap-4 backdrop-blur-sm">
//           <div className="text-amber-300 font-semibold">
//             Showing {filteredRecords.length} of {pagination.totalCount} products
//           </div>
          
//           <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
//             <div className="relative w-full group">
//               <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
//                 <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
//                   <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search sale products..."
//                 value={searchTerm}
//                 onChange={handleSearch}
//                 className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 rounded-xl focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
//               />
//             </div>
            
//             <div className="flex gap-2 items-center">
//               <select 
//                 value={pagination.limit}
//                 onChange={handleLimitChange}
//                 disabled={isLoading}
//                 className="bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 rounded-xl px-4 py-3 focus:border-amber-400 focus:outline-none backdrop-blur-sm"
//               >
//                 <option value="12">12 per page</option>
//                 <option value="24">24 per page</option>
//                 <option value="36">36 per page</option>
//                 <option value="48">48 per page</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Products Grid */}
//         {isLoading ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {[...Array(pagination.limit)].map((_, index) => (
//               <div key={index} className="animate-pulse">
//                 <div className="bg-slate-900/60 rounded-2xl h-80 border border-slate-800/50"></div>
//                 <div className="mt-4 space-y-2">
//                   <div className="h-4 bg-slate-900/60 rounded w-3/4"></div>
//                   <div className="h-4 bg-slate-900/60 rounded w-1/2"></div>
//                   <div className="h-4 bg-slate-900/60 rounded w-1/4"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <>
//             {filteredRecords.length > 0 ? (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//                 {filteredRecords.map((item) => (
//                   <div 
//                     key={item.id} 
//                     className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20"
//                   >
//                     {/* Sale Badge */}
//                     {item.discount_percent > 0 && (
//                       <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-red-500/50">
//                         {item.discount_percent}% OFF
//                       </div>
//                     )}
                    
//                     {/* Image with Text Overlay */}
//                     <div className="relative h-80 w-full rounded-t-2xl overflow-hidden">
//                       <img
//                         src={item.mainImage}
//                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
//                         alt={item.name}
//                         onError={(e) => {
//                           e.target.src = '/default-product-image.jpg';
//                         }}
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      
//                       {/* Additional images badge */}
//                       {item.remainingImages.length > 0 && (
//                         <div className="absolute top-4 left-4 z-20 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
//                           +{item.remainingImages.length}
//                         </div>
//                       )}
                      
//                       {/* Action Buttons */}
//                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 bg-black/60 backdrop-blur-sm">
//                         <div className="flex flex-col space-y-3">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               openDetailsModal(item);
//                             }}
//                             className="px-6 py-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
//                           >
//                             View Details
//                           </button>
                          
//                           <div className="flex space-x-3">
//                             {permissions.update_sales_product && (
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   updateRecord(item.id);
//                                 }}
//                                 className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all"
//                               >
//                                 Edit
//                               </button>
//                             )}
                            
//                             {permissions.delete_sales_product && (
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   deleteRecord(item.id);
//                                 }}
//                                 className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all"
//                               >
//                                 Delete
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
                    
//                     {/* Product Info */}
//                     <div className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-b-2xl border border-slate-800/50">
//                       <h3 className="text-xl font-semibold text-amber-200 mb-2 line-clamp-1">{item.name}</h3>
//                       <div className="flex items-center space-x-3 mb-3">
//                         <span className="text-amber-400 font-bold">
//                           PKR {parseFloat(item.final_price || 0).toLocaleString()}
//                         </span>
//                         {item.original_price && (
//                           <span className="text-slate-400 line-through text-sm">
//                             PKR {parseFloat(item.original_price || 0).toLocaleString()}
//                           </span>
//                         )}
//                       </div>
//                       <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.description}</p>
//                       <span className="text-xs text-amber-300 uppercase block">{item.category_name}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
//                 <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
//                   <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-2xl font-semibold text-amber-200 mb-2">No sale products found</h3>
//                 <p className="text-slate-400 max-w-md mx-auto">
//                   {searchTerm ? "No sale products match your search." : "There are no sale products to display."}
//                 </p>
//                 {searchTerm && (
//                   <button
//                     onClick={() => setSearchTerm('')}
//                     className="mt-6 px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all"
//                   >
//                     Clear search
//                   </button>
//                 )}
//               </div>
//             )}
//           </>
//         )}

//         {/* Enhanced Pagination */}
//         {!isLoading && filteredRecords.length > 0 && pagination.totalPages > 1 && (
//           <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
//             <div className="flex items-center gap-2 flex-wrap justify-center">
//               {/* Previous Button */}
//               <button
//                 onClick={() => handlePageChange(pagination.currentPage - 1)}
//                 disabled={!pagination.hasPrevious || isLoading}
//                 className={`px-4 py-2 rounded-lg transition-colors ${
//                   !pagination.hasPrevious || isLoading
//                     ? 'bg-slate-900/60 cursor-not-allowed text-slate-400 border border-slate-800/50' 
//                     : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:shadow-amber-500/50 text-slate-900 font-semibold'
//                 }`}
//               >
//                 Previous
//               </button>
              
//               {/* Page Numbers */}
//               <div className="flex items-center gap-1">
//                 {getPageNumbers().map((pageNum, index) => {
//                   if (pageNum === '...') {
//                     return (
//                       <span key={`ellipsis-${index}`} className="px-2 text-slate-500">
//                         ...
//                       </span>
//                     );
//                   }
                  
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => handlePageChange(pageNum)}
//                       disabled={isLoading}
//                       className={`px-3 py-2 rounded-lg transition-colors min-w-[40px] ${
//                         pagination.currentPage === pageNum 
//                           ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold shadow-lg shadow-amber-500/50' 
//                           : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800/50'
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
//               </div>
              
//               {/* Next Button */}
//               <button
//                 onClick={() => handlePageChange(pagination.currentPage + 1)}
//                 disabled={!pagination.hasNext || isLoading}
//                 className={`px-4 py-2 rounded-lg transition-colors ${
//                   !pagination.hasNext || isLoading
//                     ? 'bg-slate-900/60 cursor-not-allowed text-slate-400 border border-slate-800/50' 
//                     : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:shadow-amber-500/50 text-slate-900 font-semibold'
//                 }`}
//               >
//                 Next
//               </button>
//             </div>

//             {/* Page info */}
//             <div className="text-slate-400 text-sm">
//               Page {pagination.currentPage} of {pagination.totalPages}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SalesProductsCom;




'use client';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

const SalesProductsCom = () => {
  const router = useRouter();
  const { permissions = {} } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const modalRef = useRef(null);
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  // Simplified pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 12,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Handle modal focus
  useEffect(() => {
    if (showDetailsModal && modalRef.current) {
      modalRef.current.focus();
    }
  }, [showDetailsModal]);

  // Fetch sales products
  useEffect(() => {
    const fetchSalesProducts = async () => {
      if (!permissions.read_sales_product) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // API call with proper parameters
        const res = await AxiosInstance.get(
          `/api/myapp/v1/sales/product/`,
          {
            params: {
              page: pagination.currentPage,
              limit: pagination.limit,
              api_type: 'list' // REQUIRED: triggers list serializer
            }
          }
        );
        
        // Parse response according to backend structure: { message, count, data: [...] }
        const responseData = res?.data;
        
        if (!responseData || !responseData.data) {
          console.error('Invalid response structure:', res?.data);
          toast.error('Invalid response from server');
          setRecords([]);
          setFilteredRecords([]);
          return;
        }
        
        // Get the actual data array
        const dataArr = Array.isArray(responseData.data) ? responseData.data : [];
        
        // Helper function to process image URL
        const processImageUrl = (url) => {
          if (!url) return '/default-product-image.jpg';
          // If URL already includes http:// or https://, use it as is
          if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
          }
          // Otherwise, prepend the base URL
          return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
        };
        
        // Process images for each product
        const processed = dataArr.map(product => {
          const imageUrls = product.image_urls || [];
          return {
            ...product,
            mainImage: imageUrls.length > 0
              ? processImageUrl(imageUrls[0])
              : '/default-product-image.jpg',
            remainingImages: imageUrls.slice(1).map(url => processImageUrl(url))
          };
        });
        
        setRecords(processed);
        setFilteredRecords(processed);
        
        // Get count from response
        const totalCount = responseData.count || dataArr.length;
        const totalPages = Math.ceil(totalCount / pagination.limit);
        
        setPagination(prev => ({
          ...prev,
          totalPages: totalPages,
          totalCount: totalCount,
          hasNext: pagination.currentPage < totalPages,
          hasPrevious: pagination.currentPage > 1
        }));

        if (selectedProduct) {
          const updatedProduct = processed.find(p => p.id === selectedProduct.id);
          if (updatedProduct) setSelectedProduct(updatedProduct);
        }
        
      } catch (error) {
        console.error('Error fetching sale products:', error);
        console.error('Error details:', error.response?.data);
        
        if (error.response?.status === 403) {
          toast.error('You do not have permission to view sale products');
        } else {
          toast.error(
            error.response?.data?.message || 'Failed to load sale products',
            {
              position: "top-center",
              autoClose: 3000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "light",
            }
          );
        }
        setRecords([]);
        setFilteredRecords([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesProducts();
  }, [refreshKey, pagination.currentPage, pagination.limit, baseURL, permissions.read_sales_product]);

  // Event listener for product updates
  useEffect(() => {
    const handleProductUpdate = () => setRefreshKey(k => k + 1);
    window.addEventListener('saleProductUpdated', handleProductUpdate);
    return () => window.removeEventListener('saleProductUpdated', handleProductUpdate);
  }, []);

  const openDetailsModal = (product) => {
    if (!permissions.read_sales_product) {
      toast.error('You do not have permission to view sale product details');
      return;
    }
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedProduct(null);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = records.filter((record) => {
      const idMatch = record.id.toString() === value;
      const nameMatch = record.name.toLowerCase().includes(value);
      const categoryMatch = record.category_data?.name?.toLowerCase().includes(value);
      return idMatch || nameMatch || categoryMatch;
    });

    setFilteredRecords(filtered);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const deleteRecord = async (id) => {
    if (!permissions.delete_sales_product) {
      toast.error('You do not have permission to delete sale products');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this sale product?')) return;
    
    try {
      // CORRECT DELETE URL - uses query parameter matching backend BaseView
      await AxiosInstance.delete(`/api/myapp/v1/sales/product/?id=${id}`);
      setRefreshKey(prev => prev + 1);
      
      if (selectedProduct?.id === id) {
        closeDetailsModal();
      }
      
      toast.success('Sale product deleted successfully', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (error) {
      console.error('Error deleting sale product:', error);
      toast.error('Error deleting sale product', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }
  };

  const updateRecord = async (saleproductid) => {
    if (!permissions.update_sales_product) {
      toast.error('You do not have permission to update sale products');
      return;
    }
    router.push(`/updatesalesproductpage?saleproductid=${saleproductid}`);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit,
      currentPage: 1
    }));
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage <= 3) {
        pages.push(2, 3, 4, 5);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push('...');
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push('...');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (!permissions.read_sales_product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        </div>
        
        <div className="text-center p-8 max-w-md relative z-10">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/50">
            <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent mb-4">Access Denied</h2>
          <p className="text-slate-400 mb-6">
            You don't have permission to view sale products. Please contact your administrator.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-full hover:shadow-lg hover:shadow-amber-500/50 transition-all"
          >
            Return to Dashboard
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Product Details Modal */}
      {showDetailsModal && selectedProduct && (
        <div 
          ref={modalRef}
          tabIndex={-1}
          aria-modal="true"
          role="dialog"
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={closeDetailsModal}
        >
          <div 
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl max-w-4xl w-full max-h-screen overflow-y-auto p-8 border border-amber-400/30 shadow-2xl shadow-amber-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
                {selectedProduct.name}
              </h2>
              <button 
                onClick={closeDetailsModal} 
                className="text-amber-400 hover:text-white text-3xl transition-colors"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <div className="relative rounded-2xl overflow-hidden border border-slate-700/50">
                  <img 
                    src={selectedProduct.mainImage} 
                    alt={selectedProduct.name}
                    className="w-full h-80 object-contain bg-slate-900 rounded-2xl"
                    onError={(e) => {
                      e.target.src = '/default-product-image.jpg';
                    }}
                  />
                  {selectedProduct.discount_percent > 0 && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-red-500/50">
                      {selectedProduct.discount_percent}% OFF
                    </div>
                  )}
                </div>
                {selectedProduct.remainingImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {selectedProduct.remainingImages.map((img, i) => (
                      <img 
                        key={i} 
                        src={img} 
                        className="h-20 object-cover rounded-lg border border-slate-700/50" 
                        alt={`Additional view ${i + 1}`}
                        onError={(e) => {
                          e.target.src = '/default-product-image.jpg';
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="text-slate-300">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Description</h3>
                <p className="mb-6">{selectedProduct.description}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <h3 className="font-semibold text-amber-400">Category</h3>
                    <p>{selectedProduct.category_data?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-400">Original Price</h3>
                    <p className="line-through text-slate-400">PKR {parseFloat(selectedProduct.original_price || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-400">Discount</h3>
                    <p>{selectedProduct.discount_percent}%</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-400">Final Price</h3>
                    <p className="text-amber-300 font-bold text-lg">PKR {parseFloat(selectedProduct.final_price || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-400">You Save</h3>
                    <p className="text-green-400 font-semibold">PKR {parseFloat(selectedProduct.discount_amount || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-400">Status</h3>
                    <p>{selectedProduct.has_discount ? 'Active Sale' : 'Regular'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-400">Created At</h3>
                    <p>{new Date(selectedProduct.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-400">Created By</h3>
                    <p>{selectedProduct.created_by || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="flex mt-8 space-x-4">
                  {permissions.update_sales_product && (
                    <button 
                      onClick={() => {
                        updateRecord(selectedProduct.id);
                        closeDetailsModal();
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all"
                    >
                      Edit
                    </button>
                  )}
                  
                  {permissions.delete_sales_product && (
                    <button 
                      onClick={() => deleteRecord(selectedProduct.id)}
                      className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all"
                    >
                      Delete
                    </button>
                  )}
                  
                  <button 
                    onClick={closeDetailsModal}
                    className="px-6 py-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto">
        {/* Luxury Header Container */}
        <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-10 relative overflow-hidden mb-10">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-2xl shadow-amber-500/50 mb-4">
                  <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-2">
                  EXCLUSIVE OFFERS
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mb-3"></div>
                <p className="text-slate-400">Manage premium sale products</p>
              </div>
              
              {permissions.create_sales_product && (
                <button
                  className="group relative px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-full shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all duration-300 mt-4 md:mt-0"
                  onClick={() => router.push('/adminaddsales')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Add Sale Product</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search and Stats Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50 mb-8 gap-4 backdrop-blur-sm">
          <div className="text-amber-300 font-semibold">
            Showing {filteredRecords.length} of {pagination.totalCount} products
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
            <div className="relative w-full group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, ID or category..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 rounded-xl focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <select 
                value={pagination.limit}
                onChange={handleLimitChange}
                disabled={isLoading}
                className="bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 rounded-xl px-4 py-3 focus:border-amber-400 focus:outline-none backdrop-blur-sm"
              >
                <option value="12">12 per page</option>
                <option value="24">24 per page</option>
                <option value="36">36 per page</option>
                <option value="48">48 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(pagination.limit)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-slate-900/60 rounded-2xl h-80 border border-slate-800/50"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-slate-900/60 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-900/60 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-900/60 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredRecords.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredRecords.map((item) => (
                  <div 
                    key={item.id} 
                    className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20"
                  >
                    {/* Sale Badge */}
                    {item.discount_percent > 0 && (
                      <div className="absolute top-4 right-4 z-20 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-4 py-2 rounded-full shadow-lg shadow-red-500/50">
                        {item.discount_percent}% OFF
                      </div>
                    )}
                    
                    {/* Image with Text Overlay */}
                    <div className="relative h-80 w-full rounded-t-2xl overflow-hidden">
                      <img
                        src={item.mainImage}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = '/default-product-image.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      
                      {/* Additional images badge */}
                      {item.remainingImages.length > 0 && (
                        <div className="absolute top-4 left-4 z-20 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                          +{item.remainingImages.length}
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 bg-black/60 backdrop-blur-sm">
                        <div className="flex flex-col space-y-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailsModal(item);
                            }}
                            className="px-6 py-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                          >
                            View Details
                          </button>
                          
                          <div className="flex space-x-3">
                            {permissions.update_sales_product && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateRecord(item.id);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all"
                              >
                                Edit
                              </button>
                            )}
                            
                            {permissions.delete_sales_product && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteRecord(item.id);
                                }}
                                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/50 transition-all"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-b-2xl border border-slate-800/50">
                      <h3 className="text-xl font-semibold text-amber-200 mb-2 line-clamp-1">{item.name}</h3>
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-amber-400 font-bold text-lg">
                          PKR {parseFloat(item.final_price || 0).toLocaleString()}
                        </span>
                        {item.original_price && (
                          <span className="text-slate-400 line-through text-sm">
                            PKR {parseFloat(item.original_price || 0).toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.description}</p>
                      <span className="text-xs text-amber-300 uppercase block">{item.category_data?.name || 'Uncategorized'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-700/50">
                  <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-amber-200 mb-2">No sale products found</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  {searchTerm ? "No sale products match your search." : "There are no sale products to display."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-6 px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/50 transition-all"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

            {/* Enhanced Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevious || isLoading}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !pagination.hasPrevious || isLoading
                        ? 'bg-slate-900/60 cursor-not-allowed text-slate-400 border border-slate-800/50' 
                        : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:shadow-amber-500/50 text-slate-900 font-semibold'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum, index) => {
                      if (pageNum === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 text-slate-500">
                            ...
                          </span>
                        );
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={isLoading}
                          className={`px-3 py-2 rounded-lg transition-colors min-w-[40px] ${
                            pagination.currentPage === pageNum 
                              ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold shadow-lg shadow-amber-500/50' 
                              : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800/50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Next Button */}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext || isLoading}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !pagination.hasNext || isLoading
                        ? 'bg-slate-900/60 cursor-not-allowed text-slate-400 border border-slate-800/50' 
                        : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:shadow-amber-500/50 text-slate-900 font-semibold'
                    }`}
                  >
                    Next
                  </button>
                </div>

                {/* Page info */}
                <div className="text-slate-400 text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SalesProductsCom;