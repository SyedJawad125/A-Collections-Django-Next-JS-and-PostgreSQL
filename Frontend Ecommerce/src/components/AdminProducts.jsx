// 'use client'
// import React, { useEffect, useState, useContext, useRef } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/components/AuthContext';

// const AdminProducts = () => {
//   const router = useRouter();
//   const { permissions = {
//     create_product: false,
//     read_product: false,
//     update_product: false,
//     delete_product: false
//   } } = useContext(AuthContext);
  
//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [refreshKey, setRefreshKey] = useState(0);

//   const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
//   const modalRef = useRef(null);

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

//   // Fetch products with pagination
//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!permissions.read_product) {
//         setIsLoading(false);
//         return;
//       }

//       setIsLoading(true);
//       try {
//         const res = await AxiosInstance.get(
//           `/api/myapp/v1/product/`,
//           {
//             params: {
//               page: pagination.currentPage,
//               limit: pagination.limit,
//               api_type: 'list'
//             }
//           }
//         );
        
//         // Parse response - the structure is { message, count, data: [...] }
//         const responseData = res?.data;
        
//         if (!responseData || !responseData.data) {
//           console.error('Invalid response structure:', res?.data);
//           toast.error('Invalid response from server');
//           setRecords([]);
//           return;
//         }
        
//         // Get the data array directly
//         const dataArr = Array.isArray(responseData.data) ? responseData.data : [];
        
//         // Helper function to process image URL
//         const processImageUrl = (url) => {
//           if (!url) return '/default-product-image.jpg';
//           // If URL already includes http:// or https://, use it as is
//           if (url.startsWith('http://') || url.startsWith('https://')) {
//             return url;
//           }
//           // Otherwise, prepend the base URL
//           return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
//         };
        
//         // Process images for each product
//         const processed = dataArr.map(product => {
//           // Use image_urls array from the response
//           const imageUrls = product.image_urls || [];
          
//           return {
//             ...product,
//             mainImage: imageUrls.length > 0
//               ? processImageUrl(imageUrls[0])
//               : '/default-product-image.jpg',
//             remainingImages: imageUrls.slice(1).map(url => processImageUrl(url))
//           };
//         });
        
//         setRecords(processed);
//         setFilteredRecords(processed);
        
//         // Calculate pagination values from the response
//         const totalCount = responseData.count || dataArr.length;
//         const totalPages = Math.ceil(totalCount / pagination.limit);
        
//         setPagination(prev => ({
//           ...prev,
//           totalPages: totalPages,
//           totalCount: totalCount,
//           hasNext: pagination.currentPage < totalPages,
//           hasPrevious: pagination.currentPage > 1
//         }));

//         if (selectedProduct) {
//           const updatedProduct = processed.find(p => p.id === selectedProduct.id);
//           if (updatedProduct) setSelectedProduct(updatedProduct);
//         }
//       } catch (error) {
//         console.error('Error fetching products:', error);
//         console.error('Error details:', error.response?.data);
        
//         if (error.response?.status === 403) {
//           toast.error('You do not have permission to view products');
//         } else {
//           toast.error(
//             error.response?.data?.message || 'Failed to load products',
//             {
//               position: "top-center",
//               autoClose: 3000,
//               hideProgressBar: true,
//               closeOnClick: true,
//               pauseOnHover: true,
//               draggable: true,
//               theme: "light",
//             }
//           );
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [refreshKey, baseURL, pagination.currentPage, pagination.limit, permissions.read_product]);

//   // Handle page change
//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
//       setPagination(prev => ({ ...prev, currentPage: newPage }));
//     }
//   };

//   // Handle limit change
//   const handleLimitChange = (e) => {
//     const newLimit = parseInt(e.target.value);
//     setPagination(prev => ({ 
//       ...prev, 
//       limit: newLimit,
//       currentPage: 1  // Reset to page 1 when changing limit
//     }));
//   };

//   // Event listener for product updates
//   useEffect(() => {
//     const handleProductUpdate = () => setRefreshKey(k => k + 1);
//     window.addEventListener('productUpdated', handleProductUpdate);
//     return () => window.removeEventListener('productUpdated', handleProductUpdate);
//   }, []);

//   const openDetailsModal = (product) => {
//     if (!permissions.read_product) {
//       toast.error('You do not have permission to view product details');
//       return;
//     }
//     setSelectedProduct(product);
//     setShowDetailsModal(true);
//   };

//   const closeDetailsModal = () => {
//     setShowDetailsModal(false);
//     setSelectedProduct(null);
//   };

//   const deleteRecord = async (id) => {
//     if (!permissions.delete_product) {
//       toast.error('You do not have permission to delete products');
//       return;
//     }
    
//     if (!window.confirm('Are you sure you want to delete this product?')) return;
    
//     try {
//       await AxiosInstance.delete(`/api/myapp/v1/product/${id}/`);
//       setRefreshKey(prev => prev + 1);
      
//       if (selectedProduct?.id === id) {
//         closeDetailsModal();
//       }
      
//       toast.success('Product deleted successfully', {
//         position: "top-center",
//         autoClose: 2000,
//         hideProgressBar: true,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: "dark",
//       });
//     } catch (error) {
//       console.error('Error deleting product:', error);
//       toast.error('Error deleting product', {
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

//   const updateRecord = (id) => {
//     if (!permissions.update_product) {
//       toast.error('You do not have permission to update products');
//       return;
//     }
//     router.push(`/updateproductpage?productid=${id}`);
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);
    
//     const filtered = records.filter(r => 
//       r.id.toString() === value ||
//       r.name.toLowerCase().includes(value) ||
//       r.category_data?.name?.toLowerCase().includes(value)
//     );
    
//     setFilteredRecords(filtered);
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

//   // Generate page numbers for pagination
//   const getPageNumbers = () => {
//     const { currentPage, totalPages } = pagination;
//     const pages = [];
    
//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       pages.push(1);
      
//       if (currentPage <= 3) {
//         pages.push(2, 3, 4, 5);
//         pages.push('...');
//         pages.push(totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         pages.push('...');
//         pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
//       } else {
//         pages.push('...');
//         pages.push(currentPage - 1, currentPage, currentPage + 1);
//         pages.push('...');
//         pages.push(totalPages);
//       }
//     }
    
//     return pages;
//   };

//   // Return early if no read permission
//   if (!permissions.read_product) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
//         <div className="text-center p-8 max-w-md">
//           <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
//           <p className="text-gray-300 mb-6">
//             You don't have permission to view products. Please contact your administrator.
//           </p>
//           <button 
//             onClick={() => router.push('/')}
//             className="px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors"
//           >
//             Return to Dashboard
//           </button>
//         </div>
//         <ToastContainer position="top-right" autoClose={2000} />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
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
//             className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex justify-between">
//               <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
//               <button 
//                 onClick={closeDetailsModal} 
//                 className="text-gray-400 hover:text-white text-3xl"
//                 aria-label="Close modal"
//               >
//                 &times;
//               </button>
//             </div>
            
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
//               <div>
//                 <img 
//                   src={selectedProduct.mainImage} 
//                   alt={selectedProduct.name}
//                   className="w-full h-80 object-contain bg-gray-700 rounded-lg" 
//                   onError={(e) => {
//                     e.target.src = '/default-product-image.jpg';
//                   }}
//                 />
//                 {selectedProduct.remainingImages.length > 0 && (
//                   <div className="grid grid-cols-4 gap-2 mt-4">
//                     {selectedProduct.remainingImages.map((img, i) => (
//                       <img 
//                         key={i} 
//                         src={img} 
//                         className="h-20 object-cover rounded" 
//                         alt={`Additional view ${i + 1}`}
//                         onError={(e) => {
//                           e.target.src = '/default-product-image.jpg';
//                         }}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>
              
//               <div className="text-gray-300">
//                 <h3 className="text-lg font-semibold text-amber-400 mb-2">Description</h3>
//                 <p>{selectedProduct.description}</p>
                
//                 <div className="grid grid-cols-2 gap-4 mt-6">
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Category</h3>
//                     <p>{selectedProduct.category_data?.name || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Price</h3>
//                     <p>PKR {parseFloat(selectedProduct.price || 0).toLocaleString()}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Group</h3>
//                     <p>{selectedProduct.group || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Tags</h3>
//                     <p>{selectedProduct.tag_names?.join(', ') || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Created At</h3>
//                     <p>{new Date(selectedProduct.created_at).toLocaleDateString()}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Created By</h3>
//                     <p>{selectedProduct.created_by || 'N/A'}</p>
//                   </div>
//                 </div>
                
//                 <div className="flex mt-6 space-x-4">
//                   {permissions.update_product && (
//                     <button 
//                       onClick={() => {
//                         updateRecord(selectedProduct.id);
//                         closeDetailsModal();
//                       }}
//                       className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
//                     >
//                       Edit
//                     </button>
//                   )}
                  
//                   {permissions.delete_product && (
//                     <button 
//                       onClick={() => deleteRecord(selectedProduct.id)}
//                       className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//                     >
//                       Delete
//                     </button>
//                   )}
                  
//                   <button 
//                     onClick={closeDetailsModal}
//                     className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
//           <div>
//             <h1 className="text-4xl font-light text-white">LUXURY PRODUCTS</h1>
//             <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mt-1"></div>
//           </div>
//           <div className="flex gap-3 flex-wrap">
//             {permissions.create_product && (
//               <button 
//                 onClick={() => router.push('/addproductspage')}
//                 className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform"
//               >
//                 Add Product
//               </button>
//             )}
//             <button 
//               onClick={() => router.push('/productvariant')}
//               className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform"
//             >
//               Products Variant
//             </button>
//             <button 
//               onClick={() => router.push('/addproductspage')}
//               className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform"
//             >
//               Products Inventory
//             </button>
//           </div>
//         </div>

//         {/* Search and Stats Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-800/50 rounded-xl mb-8 gap-4">
//           <div className="text-amber-400">
//             Showing {filteredRecords.length} of {pagination.totalCount} items
//           </div>
          
//           <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
//             <div className="relative w-full">
//               <span className="absolute left-3 top-3 text-gray-400">
//                 🔍
//               </span>
//               <input 
//                 type="text" 
//                 value={searchTerm} 
//                 onChange={handleSearch}
//                 placeholder="Search by name, ID or category..."
//                 className="w-full pl-10 py-3 bg-gray-700 rounded-full text-white focus:ring-amber-500 focus:outline-none"
//               />
//             </div>
            
//             <div className="flex gap-2 items-center">
//               <select 
//                 value={pagination.limit}
//                 onChange={handleLimitChange}
//                 className="bg-gray-700 text-white rounded-full px-3 py-2 focus:outline-none focus:ring-amber-500"
//                 disabled={isLoading}
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
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//             {[...Array(pagination.limit)].map((_, idx) => (
//               <div key={idx} className="animate-pulse">
//                 <div className="bg-gray-800 rounded-xl aspect-square"></div>
//                 <div className="mt-3 h-5 bg-gray-800 rounded w-3/4"></div>
//                 <div className="mt-2 h-4 bg-gray-800 rounded w-1/2"></div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <>
//             {filteredRecords.length > 0 ? (
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//                 {filteredRecords.map(item => (
//                   <div
//                     key={item.id}
//                     className="group relative rounded-xl overflow-hidden hover:shadow-lg hover:shadow-amber-400/20 transition-all"
//                   >
//                     <div className="aspect-square bg-gray-800">
//                       <img 
//                         src={item.mainImage} 
//                         alt={item.name}
//                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         onError={(e) => {
//                           e.target.src = '/default-product-image.jpg';
//                         }}
//                       />
//                     </div>
                    
//                     {item.remainingImages.length > 0 && (
//                       <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
//                         +{item.remainingImages.length}
//                       </div>
//                     )}
                    
//                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    
//                     <div className="p-4 absolute bottom-0 left-0 right-0">
//                       <span className="text-xs text-amber-400 uppercase">{item.category_data?.name || 'Uncategorized'}</span>
//                       <h3 className="text-lg font-medium text-white line-clamp-1">{item.name}</h3>
//                       <p className="text-sm text-gray-300 line-clamp-2">{item.description}</p>
                      
//                       <div className="flex justify-between items-center mt-3">
//                         <span className="text-amber-400 font-bold">
//                           PKR {parseFloat(item.price || 0).toLocaleString()}
//                         </span>
                        
//                         <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                           <button
//                             onClick={(e) => { 
//                               e.stopPropagation(); 
//                               openDetailsModal(item); 
//                             }}
//                             className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
//                             aria-label="View details"
//                           >
//                             👁️
//                           </button>

//                           {permissions.update_product && (
//                             <button
//                               onClick={(e) => { 
//                                 e.stopPropagation(); 
//                                 updateRecord(item.id); 
//                               }}
//                               className="p-2 bg-amber-600/90 rounded-lg hover:bg-amber-600 transition-colors"
//                               aria-label="Edit product"
//                             >
//                               ✏️
//                             </button>
//                           )}

//                           {permissions.delete_product && (
//                             <button
//                               onClick={(e) => { 
//                                 e.stopPropagation(); 
//                                 deleteRecord(item.id); 
//                               }}
//                               className="p-2 bg-red-600/90 rounded-lg hover:bg-red-600 transition-colors"
//                               aria-label="Delete product"
//                             >
//                               🗑️
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-20 text-gray-300">
//                 <p>No products match your search.</p>
//                 {permissions.create_product && (
//                   <button 
//                     onClick={() => router.push('/addproductspage')}
//                     className="mt-6 px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors"
//                   >
//                     Add Product
//                   </button>
//                 )}
//               </div>
//             )}

//             {/* Enhanced Pagination */}
//             {pagination.totalPages > 1 && (
//               <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
//                 <div className="flex items-center gap-2 flex-wrap justify-center">
//                   {/* Previous Button */}
//                   <button
//                     onClick={() => handlePageChange(pagination.currentPage - 1)}
//                     disabled={!pagination.hasPrevious || isLoading}
//                     className={`px-4 py-2 rounded-lg transition-colors ${
//                       !pagination.hasPrevious || isLoading
//                         ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
//                         : 'bg-amber-600 hover:bg-amber-700 text-white'
//                     }`}
//                   >
//                     Previous
//                   </button>
                  
//                   {/* Page Numbers */}
//                   <div className="flex items-center gap-1">
//                     {getPageNumbers().map((pageNum, index) => {
//                       if (pageNum === '...') {
//                         return (
//                           <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
//                             ...
//                           </span>
//                         );
//                       }
                      
//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => handlePageChange(pageNum)}
//                           disabled={isLoading}
//                           className={`px-3 py-2 rounded-lg transition-colors min-w-[40px] ${
//                             pagination.currentPage === pageNum 
//                               ? 'bg-amber-600 text-white font-semibold' 
//                               : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
//                           }`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                   </div>
                  
//                   {/* Next Button */}
//                   <button
//                     onClick={() => handlePageChange(pagination.currentPage + 1)}
//                     disabled={!pagination.hasNext || isLoading}
//                     className={`px-4 py-2 rounded-lg transition-colors ${
//                       !pagination.hasNext || isLoading
//                         ? 'bg-gray-700 cursor-not-allowed text-gray-400' 
//                         : 'bg-amber-600 hover:bg-amber-700 text-white'
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>

//                 {/* Page info */}
//                 <div className="text-gray-400 text-sm">
//                   Page {pagination.currentPage} of {pagination.totalPages}
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminProducts;




// 'use client';
// import React, { useEffect, useState, useContext, useRef } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/components/AuthContext';

// const GROUP_CHOICES = [
//   { value: 'Men', label: 'Men' },
//   { value: 'Women', label: 'Women' },
//   { value: 'Kids', label: 'Kids' },
//   { value: 'General', label: 'General' },
// ];

// const AdminProducts = () => {
//   const router = useRouter();
//   const { permissions = {
//     create_product: false,
//     read_product: false,
//     update_product: false,
//     delete_product: false
//   } } = useContext(AuthContext);

//   const [records, setRecords] = useState([]);
//   const [filteredRecords, setFilteredRecords] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [refreshKey, setRefreshKey] = useState(0);

//   const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
//   const modalRef = useRef(null);

//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     limit: 12,
//     totalPages: 1,
//     totalCount: 0,
//     hasNext: false,
//     hasPrevious: false
//   });

//   // ---------- Add / Update product modal state ----------
//   const [productModalOpen, setProductModalOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [productForm, setProductForm] = useState({
//     name: '',
//     description: '',
//     price: '',
//     prod_has_category: '',
//     group: '',
//     tags: [],
//   });
//   const [images, setImages] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [existingImages, setExistingImages] = useState([]);
//   const [categoryRecords, setCategoryRecords] = useState([]);
//   const [tagRecords, setTagRecords] = useState([]);
//   const [isLoadingCategories, setIsLoadingCategories] = useState(true);
//   const [isLoadingTags, setIsLoadingTags] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // Handle details modal focus
//   useEffect(() => {
//     if (showDetailsModal && modalRef.current) {
//       modalRef.current.focus();
//     }
//   }, [showDetailsModal]);

//   const processImageUrl = (url) => {
//     if (!url) return '/default-product-image.jpg';
//     if (url.startsWith('http://') || url.startsWith('https://')) return url;
//     return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
//   };

//   // ---------- Fetch products ----------
//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!permissions.read_product) {
//         setIsLoading(false);
//         return;
//       }

//       setIsLoading(true);
//       try {
//         const res = await AxiosInstance.get(
//           `/api/myapp/v1/product/`,
//           {
//             params: {
//               page: pagination.currentPage,
//               limit: pagination.limit,
//               api_type: 'list'
//             }
//           }
//         );

//         const responseData = res?.data;

//         if (!responseData || !responseData.data) {
//           console.error('Invalid response structure:', res?.data);
//           toast.error('Invalid response from server');
//           setRecords([]);
//           return;
//         }

//         const dataArr = Array.isArray(responseData.data) ? responseData.data : [];

//         const processed = dataArr.map(product => {
//           const imageUrls = product.image_urls || [];
//           return {
//             ...product,
//             mainImage: imageUrls.length > 0
//               ? processImageUrl(imageUrls[0])
//               : '/default-product-image.jpg',
//             remainingImages: imageUrls.slice(1).map(url => processImageUrl(url)),
//             allImages: imageUrls,
//           };
//         });

//         setRecords(processed);
//         setFilteredRecords(processed);

//         const totalCount = responseData.count || dataArr.length;
//         const totalPages = Math.ceil(totalCount / pagination.limit);

//         setPagination(prev => ({
//           ...prev,
//           totalPages: totalPages,
//           totalCount: totalCount,
//           hasNext: pagination.currentPage < totalPages,
//           hasPrevious: pagination.currentPage > 1
//         }));

//         if (selectedProduct) {
//           const updatedProduct = processed.find(p => p.id === selectedProduct.id);
//           if (updatedProduct) setSelectedProduct(updatedProduct);
//         }
//       } catch (error) {
//         console.error('Error fetching products:', error);
//         console.error('Error details:', error.response?.data);

//         if (error.response?.status === 403) {
//           toast.error('You do not have permission to view products');
//         } else {
//           toast.error(
//             error.response?.data?.message || 'Failed to load products',
//             {
//               position: "top-center",
//               autoClose: 3000,
//               hideProgressBar: true,
//               closeOnClick: true,
//               pauseOnHover: true,
//               draggable: true,
//               theme: "light",
//             }
//           );
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchProducts();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [refreshKey, baseURL, pagination.currentPage, pagination.limit, permissions.read_product]);

//   // ---------- Fetch categories (for dropdown) ----------
//   useEffect(() => {
//     const fetchCategories = async () => {
//       setIsLoadingCategories(true);
//       try {
//         const res = await AxiosInstance.get('/api/myapp/v1/dropdown/category/');
//         const responseData = res?.data?.data;

//         if (!responseData) {
//           console.error('Invalid response structure:', res?.data);
//           setCategoryRecords([]);
//           return;
//         }

//         const dataArr = Array.isArray(responseData.data) ? responseData.data :
//                        Array.isArray(responseData) ? responseData : [];

//         setCategoryRecords(dataArr);
//       } catch (error) {
//         console.error('Error fetching categories:', error);
//         toast.error('Failed to load categories', {
//           position: "top-center",
//           autoClose: 3000,
//           hideProgressBar: true,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           theme: "light",
//         });
//       } finally {
//         setIsLoadingCategories(false);
//       }
//     };

//     fetchCategories();
//   }, []);

//   // ---------- Fetch tags (for dropdown) ----------
//   useEffect(() => {
//     const fetchTags = async () => {
//       setIsLoadingTags(true);
//       try {
//         const res = await AxiosInstance.get('/api/myapp/v1/product/tag/');
//         const responseData = res?.data?.data;

//         if (!responseData) {
//           console.error('Invalid response structure:', res?.data);
//           setTagRecords([]);
//           return;
//         }

//         const dataArr = Array.isArray(responseData.data) ? responseData.data :
//                        Array.isArray(responseData) ? responseData : [];

//         setTagRecords(dataArr);
//       } catch (error) {
//         console.error('Error fetching tags:', error);
//         // Tags are optional, so we don't show an error toast
//       } finally {
//         setIsLoadingTags(false);
//       }
//     };

//     fetchTags();
//   }, []);

//   // Event listener for external product updates
//   useEffect(() => {
//     const handleProductUpdate = () => setRefreshKey(k => k + 1);
//     window.addEventListener('productUpdated', handleProductUpdate);
//     return () => window.removeEventListener('productUpdated', handleProductUpdate);
//   }, []);

//   // ---------- Pagination ----------
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

//   const getPageNumbers = () => {
//     const { currentPage, totalPages } = pagination;
//     const pages = [];

//     if (totalPages <= 7) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       pages.push(1);

//       if (currentPage <= 3) {
//         pages.push(2, 3, 4, 5);
//         pages.push('...');
//         pages.push(totalPages);
//       } else if (currentPage >= totalPages - 2) {
//         pages.push('...');
//         pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
//       } else {
//         pages.push('...');
//         pages.push(currentPage - 1, currentPage, currentPage + 1);
//         pages.push('...');
//         pages.push(totalPages);
//       }
//     }

//     return pages;
//   };

//   // ---------- Details modal ----------
//   const openDetailsModal = (product) => {
//     if (!permissions.read_product) {
//       toast.error('You do not have permission to view product details');
//       return;
//     }
//     setSelectedProduct(product);
//     setShowDetailsModal(true);
//   };

//   const closeDetailsModal = () => {
//     setShowDetailsModal(false);
//     setSelectedProduct(null);
//   };

//   // ---------- Delete ----------
//   const deleteRecord = async (id) => {
//     if (!permissions.delete_product) {
//       toast.error('You do not have permission to delete products');
//       return;
//     }

//     if (!window.confirm('Are you sure you want to delete this product?')) return;

//     try {
//       await AxiosInstance.delete(`/api/myapp/v1/product/${id}/`);
//       setRefreshKey(prev => prev + 1);

//       if (selectedProduct?.id === id) {
//         closeDetailsModal();
//       }

//       toast.success('Product deleted successfully', {
//         position: "top-center",
//         autoClose: 2000,
//         hideProgressBar: true,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: "dark",
//       });
//     } catch (error) {
//       console.error('Error deleting product:', error);
//       toast.error('Error deleting product', {
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

//   // ---------- Search ----------
//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);

//     const filtered = records.filter(r =>
//       r.id.toString() === value ||
//       r.name.toLowerCase().includes(value) ||
//       r.category_data?.name?.toLowerCase().includes(value)
//     );

//     setFilteredRecords(filtered);
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

//   // ---------- Add / Update modal helpers ----------
//   const resetProductForm = () => {
//     setProductForm({
//       name: '',
//       description: '',
//       price: '',
//       prod_has_category: '',
//       group: '',
//       tags: [],
//     });
//     setImages([]);
//     setImagePreviews([]);
//     setExistingImages([]);
//     setEditingProduct(null);
//   };

//   const handleAddProduct = () => {
//     if (!permissions.create_product) {
//       toast.error('You do not have permission to add products');
//       return;
//     }
//     resetProductForm();
//     setProductModalOpen(true);
//   };

//   const handleEditProduct = (product) => {
//     if (!permissions.update_product) {
//       toast.error('You do not have permission to update products');
//       return;
//     }

//     // Try to resolve currently assigned tag ids from tag names, once tags are loaded
//     const matchedTagIds = (product.tag_names || [])
//       .map(name => tagRecords.find(t => t.name === name)?.id)
//       .filter(Boolean);

//     setEditingProduct(product);
//     setProductForm({
//       name: product.name || '',
//       description: product.description || '',
//       price: product.price ? String(product.price) : '',
//       prod_has_category: product.category_data?.id ? String(product.category_data.id) : (product.prod_has_category || ''),
//       group: product.group || '',
//       tags: matchedTagIds,
//     });
//     setImages([]);
//     setImagePreviews([]);
//     setExistingImages(product.allImages && product.allImages.length > 0
//       ? product.allImages.map(url => processImageUrl(url))
//       : (product.mainImage ? [product.mainImage] : []));
//     setProductModalOpen(true);
//   };

//   const handleProductFormChange = (e) => {
//     setProductForm({ ...productForm, [e.target.name]: e.target.value });
//   };

//   const handleTagChange = (e) => {
//     const selectedOptions = Array.from(e.target.selectedOptions).map(option => parseInt(option.value));
//     setProductForm({ ...productForm, tags: selectedOptions });
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files || []);

//     if (images.length + files.length > 5) {
//       toast.error('Maximum 5 images allowed');
//       return;
//     }

//     const validFiles = files.filter(file => {
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error(`${file.name} is too large (max 5MB)`);
//         return false;
//       }
//       return true;
//     });

//     setImages(prev => [...prev, ...validFiles]);

//     validFiles.forEach(file => {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setImagePreviews(prev => [...prev, reader.result]);
//       };
//       reader.readAsDataURL(file);
//     });
//   };

//   const removeNewImage = (index) => {
//     setImages(prev => prev.filter((_, i) => i !== index));
//     setImagePreviews(prev => prev.filter((_, i) => i !== index));
//   };

//   const removeExistingImage = (index) => {
//     setExistingImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const saveProduct = async (e) => {
//     e.preventDefault();

//     if (!productForm.name.trim() || !productForm.description.trim() || !String(productForm.price).trim()) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     if (!productForm.prod_has_category) {
//       toast.error('Please select a category');
//       return;
//     }

//     // For new products at least one image is required; for edits, either keep an
//     // existing image or add a new one.
//     const hasAnyImage = images.length > 0 || existingImages.length > 0;
//     if (!hasAnyImage) {
//       toast.error('Please upload at least one image');
//       return;
//     }

//     setSaving(true);
//     try {
//       const submitData = new FormData();
//       submitData.append('name', productForm.name.trim());
//       submitData.append('description', productForm.description.trim());
//       submitData.append('price', String(productForm.price).trim());
//       submitData.append('prod_has_category', productForm.prod_has_category);

//       if (productForm.group) {
//         submitData.append('group', productForm.group);
//       }

//       if (productForm.tags.length > 0) {
//         productForm.tags.forEach(tagId => {
//           submitData.append('tags', tagId.toString());
//         });
//       }

//       images.forEach((image) => {
//         submitData.append('images', image);
//       });

//       if (editingProduct) {
//         await AxiosInstance.patch(`/api/myapp/v1/product/${editingProduct.id}/`, submitData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         toast.success('Product updated successfully', {
//           position: "top-center",
//           autoClose: 2000,
//           hideProgressBar: true,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           theme: "dark",
//         });
//       } else {
//         await AxiosInstance.post('/api/myapp/v1/product/', submitData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         toast.success('Product added successfully', {
//           position: "top-center",
//           autoClose: 2000,
//           hideProgressBar: true,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           theme: "dark",
//         });
//       }

//       setProductModalOpen(false);
//       resetProductForm();
//       setRefreshKey(prev => prev + 1);
//     } catch (error) {
//       console.error('Error saving product:', error);
//       console.error('Error response:', error.response?.data);
//       const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving product';
//       toast.error(errorMessage, {
//         position: "top-center",
//         autoClose: 3000,
//         hideProgressBar: true,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         theme: "light",
//       });
//     } finally {
//       setSaving(false);
//     }
//   };

//   // Return early if no read permission
//   if (!permissions.read_product) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
//         <div className="text-center p-8 max-w-md">
//           <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
//           <p className="text-gray-300 mb-6">
//             You don't have permission to view products. Please contact your administrator.
//           </p>
//           <button
//             onClick={() => router.push('/')}
//             className="px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors"
//           >
//             Return to Dashboard
//           </button>
//         </div>
//         <ToastContainer position="top-right" autoClose={2000} />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
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
//             className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex justify-between">
//               <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
//               <button
//                 onClick={closeDetailsModal}
//                 className="text-gray-400 hover:text-white text-3xl"
//                 aria-label="Close modal"
//               >
//                 &times;
//               </button>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
//               <div>
//                 <img
//                   src={selectedProduct.mainImage}
//                   alt={selectedProduct.name}
//                   className="w-full h-80 object-contain bg-gray-700 rounded-lg"
//                   onError={(e) => {
//                     e.target.src = '/default-product-image.jpg';
//                   }}
//                 />
//                 {selectedProduct.remainingImages.length > 0 && (
//                   <div className="grid grid-cols-4 gap-2 mt-4">
//                     {selectedProduct.remainingImages.map((img, i) => (
//                       <img
//                         key={i}
//                         src={img}
//                         className="h-20 object-cover rounded"
//                         alt={`Additional view ${i + 1}`}
//                         onError={(e) => {
//                           e.target.src = '/default-product-image.jpg';
//                         }}
//                       />
//                     ))}
//                   </div>
//                 )}
//               </div>

//               <div className="text-gray-300">
//                 <h3 className="text-lg font-semibold text-amber-400 mb-2">Description</h3>
//                 <p>{selectedProduct.description}</p>

//                 <div className="grid grid-cols-2 gap-4 mt-6">
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Category</h3>
//                     <p>{selectedProduct.category_data?.name || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Price</h3>
//                     <p>PKR {parseFloat(selectedProduct.price || 0).toLocaleString()}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Group</h3>
//                     <p>{selectedProduct.group || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Tags</h3>
//                     <p>{selectedProduct.tag_names?.join(', ') || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Created At</h3>
//                     <p>{new Date(selectedProduct.created_at).toLocaleDateString()}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Created By</h3>
//                     <p>{selectedProduct.created_by || 'N/A'}</p>
//                   </div>
//                 </div>

//                 <div className="flex mt-6 space-x-4">
//                   {permissions.update_product && (
//                     <button
//                       onClick={() => {
//                         handleEditProduct(selectedProduct);
//                         closeDetailsModal();
//                       }}
//                       className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
//                     >
//                       Edit
//                     </button>
//                   )}

//                   {permissions.delete_product && (
//                     <button
//                       onClick={() => deleteRecord(selectedProduct.id)}
//                       className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
//                     >
//                       Delete
//                     </button>
//                   )}

//                   <button
//                     onClick={closeDetailsModal}
//                     className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Add / Update Product Modal */}
//       {productModalOpen && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
//           <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] my-8">
//             <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl z-10">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
//                     {editingProduct ? 'Edit Product' : 'Add New Product'}
//                   </h2>
//                   <p className="text-slate-400 text-sm mt-1">
//                     {editingProduct ? 'Update product details' : 'Upload up to 5 images for your product'}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setProductModalOpen(false);
//                     resetProductForm();
//                   }}
//                   className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50 hover:border-slate-600/50"
//                 >
//                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={saveProduct} className="p-6 space-y-6">
//               {/* Images */}
//               <div className="space-y-3">
//                 <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center justify-between">
//                   <span className="flex items-center">
//                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
//                     </svg>
//                     Product Images {!editingProduct && '*'}
//                   </span>
//                   <span className="text-slate-400 text-xs font-normal">
//                     {existingImages.length + images.length}/5 images
//                   </span>
//                 </label>

//                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-2">
//                   {/* Existing images (edit mode) */}
//                   {existingImages.map((url, index) => (
//                     <div key={`existing-${index}`} className="relative group">
//                       <div className="aspect-square rounded-xl overflow-hidden border-2 border-slate-700/50 bg-slate-900/60">
//                         <img
//                           src={url}
//                           alt={`Existing ${index + 1}`}
//                           className="w-full h-full object-cover"
//                           onError={(e) => { e.target.src = '/default-product-image.jpg'; }}
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => removeExistingImage(index)}
//                         className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
//                       >
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                         </svg>
//                       </button>
//                       {index === 0 && (
//                         <div className="absolute top-2 left-2 bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded font-semibold">
//                           Current
//                         </div>
//                       )}
//                     </div>
//                   ))}

//                   {/* New image previews */}
//                   {imagePreviews.map((preview, index) => (
//                     <div key={`new-${index}`} className="relative group">
//                       <div className="aspect-square rounded-xl overflow-hidden border-2 border-amber-400/50 bg-slate-900/60">
//                         <img
//                           src={preview}
//                           alt={`Preview ${index + 1}`}
//                           className="w-full h-full object-cover"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => removeNewImage(index)}
//                         className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
//                       >
//                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                           <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                         </svg>
//                       </button>
//                       {existingImages.length === 0 && index === 0 && (
//                         <div className="absolute top-2 left-2 bg-amber-500 text-slate-900 text-xs px-2 py-1 rounded font-semibold">
//                           Main
//                         </div>
//                       )}
//                     </div>
//                   ))}

//                   {/* Upload placeholder */}
//                   {existingImages.length + images.length < 5 && (
//                     <label className="cursor-pointer">
//                       <div className="aspect-square rounded-xl border-2 border-dashed border-slate-700/50 bg-slate-900/40 hover:border-amber-400/50 transition-colors flex flex-col items-center justify-center p-4 text-center">
//                         <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                         </svg>
//                         <p className="text-slate-400 text-sm">Add Image</p>
//                         <p className="text-slate-500 text-xs mt-1">{existingImages.length + images.length}/5</p>
//                       </div>
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleImageChange}
//                         className="sr-only"
//                         multiple
//                       />
//                     </label>
//                   )}
//                 </div>

//                 <p className="text-slate-500 text-xs">
//                   {editingProduct
//                     ? 'Remove existing images you no longer want, and add new ones. Up to 5 total.'
//                     : 'Upload up to 5 images (PNG, JPG, JPEG). First image will be used as main display.'}
//                 </p>
//               </div>

//               {/* Name & Price */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
//                     Product Name *
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     placeholder="Enter product name"
//                     value={productForm.name}
//                     onChange={handleProductFormChange}
//                     className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
//                     Price (PKR) *
//                   </label>
//                   <input
//                     type="number"
//                     name="price"
//                     placeholder="Enter price"
//                     value={productForm.price}
//                     onChange={handleProductFormChange}
//                     min="0"
//                     step="0.01"
//                     className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500"
//                   />
//                 </div>
//               </div>

//               {/* Description */}
//               <div className="space-y-2">
//                 <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
//                   Description *
//                 </label>
//                 <textarea
//                   name="description"
//                   placeholder="Enter detailed product description"
//                   value={productForm.description}
//                   onChange={handleProductFormChange}
//                   rows={3}
//                   className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500 resize-none"
//                 />
//               </div>

//               {/* Category, Group, Tags */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="space-y-2">
//                   <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
//                     Category *
//                   </label>
//                   <select
//                     name="prod_has_category"
//                     value={productForm.prod_has_category}
//                     onChange={handleProductFormChange}
//                     disabled={isLoadingCategories}
//                     className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
//                   >
//                     <option value="" className="bg-slate-900">Select Category</option>
//                     {isLoadingCategories ? (
//                       <option value="" className="bg-slate-900" disabled>Loading categories...</option>
//                     ) : categoryRecords.length > 0 ? (
//                       categoryRecords.map((category) => (
//                         <option key={category.id} value={category.id} className="bg-slate-900">
//                           {category.name}
//                         </option>
//                       ))
//                     ) : (
//                       <option value="" className="bg-slate-900" disabled>No categories available</option>
//                     )}
//                   </select>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
//                     Group
//                   </label>
//                   <select
//                     name="group"
//                     value={productForm.group}
//                     onChange={handleProductFormChange}
//                     className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
//                   >
//                     <option value="" className="bg-slate-900">Select Group</option>
//                     {GROUP_CHOICES.map((choice) => (
//                       <option key={choice.value} value={choice.value} className="bg-slate-900">
//                         {choice.label}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 <div className="space-y-2">
//                   <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
//                     Tags
//                   </label>
//                   <select
//                     name="tags"
//                     value={productForm.tags}
//                     onChange={handleTagChange}
//                     multiple
//                     disabled={isLoadingTags}
//                     size={3}
//                     className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
//                   >
//                     {isLoadingTags ? (
//                       <option value="" className="bg-slate-900" disabled>Loading tags...</option>
//                     ) : tagRecords.length > 0 ? (
//                       tagRecords.map((tag) => (
//                         <option key={tag.id} value={tag.id} className="bg-slate-900">
//                           {tag.name}
//                         </option>
//                       ))
//                     ) : (
//                       <option value="" className="bg-slate-900" disabled>No tags available</option>
//                     )}
//                   </select>
//                   <p className="text-slate-500 text-xs">Hold Ctrl/Cmd to select multiple tags</p>
//                 </div>
//               </div>

//               <div className="flex gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setProductModalOpen(false);
//                     resetProductForm();
//                   }}
//                   className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-semibold border-2 border-slate-700/50 hover:border-slate-600/50 transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving || isLoadingCategories}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
//           <div>
//             <h1 className="text-4xl font-light text-white">LUXURY PRODUCTS</h1>
//             <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mt-1"></div>
//           </div>
//           <div className="flex gap-3 flex-wrap">
//             {permissions.create_product && (
//               <button
//                 onClick={handleAddProduct}
//                 className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform"
//               >
//                 Add Product
//               </button>
//             )}
//             <button
//               onClick={() => router.push('/productvariant')}
//               className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform"
//             >
//               Products Variant
//             </button>
//             <button
//               onClick={() => router.push('/addproductspage')}
//               className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform"
//             >
//               Products Inventory
//             </button>
//           </div>
//         </div>

//         {/* Search and Stats Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-800/50 rounded-xl mb-8 gap-4">
//           <div className="text-amber-400">
//             Showing {filteredRecords.length} of {pagination.totalCount} items
//           </div>

//           <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
//             <div className="relative w-full">
//               <span className="absolute left-3 top-3 text-gray-400">
//                 🔍
//               </span>
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={handleSearch}
//                 placeholder="Search by name, ID or category..."
//                 className="w-full pl-10 py-3 bg-gray-700 rounded-full text-white focus:ring-amber-500 focus:outline-none"
//               />
//             </div>

//             <div className="flex gap-2 items-center">
//               <select
//                 value={pagination.limit}
//                 onChange={handleLimitChange}
//                 className="bg-gray-700 text-white rounded-full px-3 py-2 focus:outline-none focus:ring-amber-500"
//                 disabled={isLoading}
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
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//             {[...Array(pagination.limit)].map((_, idx) => (
//               <div key={idx} className="animate-pulse">
//                 <div className="bg-gray-800 rounded-xl aspect-square"></div>
//                 <div className="mt-3 h-5 bg-gray-800 rounded w-3/4"></div>
//                 <div className="mt-2 h-4 bg-gray-800 rounded w-1/2"></div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <>
//             {filteredRecords.length > 0 ? (
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//                 {filteredRecords.map(item => (
//                   <div
//                     key={item.id}
//                     className="group relative rounded-xl overflow-hidden hover:shadow-lg hover:shadow-amber-400/20 transition-all"
//                   >
//                     <div className="aspect-square bg-gray-800">
//                       <img
//                         src={item.mainImage}
//                         alt={item.name}
//                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                         onError={(e) => {
//                           e.target.src = '/default-product-image.jpg';
//                         }}
//                       />
//                     </div>

//                     {item.remainingImages.length > 0 && (
//                       <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
//                         +{item.remainingImages.length}
//                       </div>
//                     )}

//                     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

//                     <div className="p-4 absolute bottom-0 left-0 right-0">
//                       <span className="text-xs text-amber-400 uppercase">{item.category_data?.name || 'Uncategorized'}</span>
//                       <h3 className="text-lg font-medium text-white line-clamp-1">{item.name}</h3>
//                       <p className="text-sm text-gray-300 line-clamp-2">{item.description}</p>

//                       <div className="flex justify-between items-center mt-3">
//                         <span className="text-amber-400 font-bold">
//                           PKR {parseFloat(item.price || 0).toLocaleString()}
//                         </span>

//                         <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               openDetailsModal(item);
//                             }}
//                             className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
//                             aria-label="View details"
//                           >
//                             👁️
//                           </button>

//                           {permissions.update_product && (
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleEditProduct(item);
//                               }}
//                               className="p-2 bg-amber-600/90 rounded-lg hover:bg-amber-600 transition-colors"
//                               aria-label="Edit product"
//                             >
//                               ✏️
//                             </button>
//                           )}

//                           {permissions.delete_product && (
//                             <button
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 deleteRecord(item.id);
//                               }}
//                               className="p-2 bg-red-600/90 rounded-lg hover:bg-red-600 transition-colors"
//                               aria-label="Delete product"
//                             >
//                               🗑️
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-20 text-gray-300">
//                 <p>No products match your search.</p>
//                 {permissions.create_product && (
//                   <button
//                     onClick={handleAddProduct}
//                     className="mt-6 px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors"
//                   >
//                     Add Product
//                   </button>
//                 )}
//               </div>
//             )}

//             {/* Enhanced Pagination */}
//             {pagination.totalPages > 1 && (
//               <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
//                 <div className="flex items-center gap-2 flex-wrap justify-center">
//                   <button
//                     onClick={() => handlePageChange(pagination.currentPage - 1)}
//                     disabled={!pagination.hasPrevious || isLoading}
//                     className={`px-4 py-2 rounded-lg transition-colors ${
//                       !pagination.hasPrevious || isLoading
//                         ? 'bg-gray-700 cursor-not-allowed text-gray-400'
//                         : 'bg-amber-600 hover:bg-amber-700 text-white'
//                     }`}
//                   >
//                     Previous
//                   </button>

//                   <div className="flex items-center gap-1">
//                     {getPageNumbers().map((pageNum, index) => {
//                       if (pageNum === '...') {
//                         return (
//                           <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
//                             ...
//                           </span>
//                         );
//                       }

//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => handlePageChange(pageNum)}
//                           disabled={isLoading}
//                           className={`px-3 py-2 rounded-lg transition-colors min-w-[40px] ${
//                             pagination.currentPage === pageNum
//                               ? 'bg-amber-600 text-white font-semibold'
//                               : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
//                           }`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <button
//                     onClick={() => handlePageChange(pagination.currentPage + 1)}
//                     disabled={!pagination.hasNext || isLoading}
//                     className={`px-4 py-2 rounded-lg transition-colors ${
//                       !pagination.hasNext || isLoading
//                         ? 'bg-gray-700 cursor-not-allowed text-gray-400'
//                         : 'bg-amber-600 hover:bg-amber-700 text-white'
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>

//                 <div className="text-gray-400 text-sm">
//                   Page {pagination.currentPage} of {pagination.totalPages}
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminProducts;












'use client';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

const GROUP_CHOICES = [
  { value: 'Men', label: 'Men' },
  { value: 'Women', label: 'Women' },
  { value: 'Kids', label: 'Kids' },
  { value: 'General', label: 'General' },
];

const AdminProducts = () => {
  const router = useRouter();
  const { permissions = {
    create_product: false,
    read_product: false,
    update_product: false,
    delete_product: false
  } } = useContext(AuthContext);

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  const modalRef = useRef(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 12,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false
  });

  // ---------- Add / Update product modal state ----------
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    prod_has_category: '',
    group: '',
    tags: [],
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // array of {id, image_url, alt_text} from product.images
  const [removedImageIds, setRemovedImageIds] = useState([]); // ProductImage ids removed during edit, sent as deleted_images
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [tagRecords, setTagRecords] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingTags, setIsLoadingTags] = useState(true);
  const [saving, setSaving] = useState(false);

  // Handle details modal focus
  useEffect(() => {
    if (showDetailsModal && modalRef.current) {
      modalRef.current.focus();
    }
  }, [showDetailsModal]);

  const processImageUrl = (url) => {
    if (!url) return '/default-product-image.jpg';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // ---------- Fetch products ----------
  useEffect(() => {
    const fetchProducts = async () => {
      if (!permissions.read_product) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await AxiosInstance.get(
          `/api/myapp/v1/product/`,
          {
            params: {
              page: pagination.currentPage,
              limit: pagination.limit,
              api_type: 'list'
            }
          }
        );

        const responseData = res?.data;

        if (!responseData || !responseData.data) {
          console.error('Invalid response structure:', res?.data);
          toast.error('Invalid response from server');
          setRecords([]);
          return;
        }

        const dataArr = Array.isArray(responseData.data) ? responseData.data : [];

        const processed = dataArr.map(product => {
          const imageUrls = product.image_urls || [];
          return {
            ...product,
            mainImage: imageUrls.length > 0
              ? processImageUrl(imageUrls[0])
              : '/default-product-image.jpg',
            remainingImages: imageUrls.slice(1).map(url => processImageUrl(url)),
            allImages: imageUrls,
          };
        });

        setRecords(processed);
        setFilteredRecords(processed);

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
        console.error('Error fetching products:', error);
        console.error('Error details:', error.response?.data);

        if (error.response?.status === 403) {
          toast.error('You do not have permission to view products');
        } else {
          toast.error(
            error.response?.data?.message || 'Failed to load products',
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, baseURL, pagination.currentPage, pagination.limit, permissions.read_product]);

  // ---------- Fetch categories (for dropdown) ----------
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const res = await AxiosInstance.get('/api/myapp/v1/dropdown/category/');
        const responseData = res?.data?.data;

        if (!responseData) {
          console.error('Invalid response structure:', res?.data);
          setCategoryRecords([]);
          return;
        }

        const dataArr = Array.isArray(responseData.data) ? responseData.data :
                       Array.isArray(responseData) ? responseData : [];

        setCategoryRecords(dataArr);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // ---------- Fetch tags (for dropdown) ----------
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        const res = await AxiosInstance.get('/api/myapp/v1/product/tag/');
        const responseData = res?.data?.data;

        if (!responseData) {
          console.error('Invalid response structure:', res?.data);
          setTagRecords([]);
          return;
        }

        const dataArr = Array.isArray(responseData.data) ? responseData.data :
                       Array.isArray(responseData) ? responseData : [];

        setTagRecords(dataArr);
      } catch (error) {
        console.error('Error fetching tags:', error);
        // Tags are optional, so we don't show an error toast
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  // Event listener for external product updates
  useEffect(() => {
    const handleProductUpdate = () => setRefreshKey(k => k + 1);
    window.addEventListener('productUpdated', handleProductUpdate);
    return () => window.removeEventListener('productUpdated', handleProductUpdate);
  }, []);

  // ---------- Pagination ----------
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

  // ---------- Details modal ----------
  const openDetailsModal = (product) => {
    if (!permissions.read_product) {
      toast.error('You do not have permission to view product details');
      return;
    }
    setSelectedProduct(product);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedProduct(null);
  };

  // ---------- Delete ----------
  const deleteRecord = async (id) => {
    if (!permissions.delete_product) {
      toast.error('You do not have permission to delete products');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await AxiosInstance.delete(`/api/myapp/v1/product/`, { params: { id } });
      setRefreshKey(prev => prev + 1);

      if (selectedProduct?.id === id) {
        closeDetailsModal();
      }

      toast.success('Product deleted successfully', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product', {
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

  // ---------- Search ----------
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = records.filter(r =>
      r.id.toString() === value ||
      r.name.toLowerCase().includes(value) ||
      r.category_data?.name?.toLowerCase().includes(value)
    );

    setFilteredRecords(filtered);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // ---------- Add / Update modal helpers ----------
  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      prod_has_category: '',
      group: '',
      tags: [],
    });
    setImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setRemovedImageIds([]);
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    if (!permissions.create_product) {
      toast.error('You do not have permission to add products');
      return;
    }
    resetProductForm();
    setProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    if (!permissions.update_product) {
      toast.error('You do not have permission to update products');
      return;
    }

    // ProductSerializer's "tags" field is already a plain list of tag ids (tags_data
    // holds the full objects, but the writable "tags" field is what we need here),
    // and "prod_has_category" is already the plain category id.
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ? String(product.price) : '',
      prod_has_category: product.prod_has_category
        ? String(product.prod_has_category)
        : (product.category_data?.id ? String(product.category_data.id) : ''),
      group: product.group || '',
      tags: Array.isArray(product.tags) ? product.tags : [],
    });
    setImages([]);
    setImagePreviews([]);
    // product.images is the real ProductImage array: [{id, image_url, alt_text}, ...]
    setExistingImages(Array.isArray(product.images) ? product.images : []);
    setRemovedImageIds([]);
    setProductModalOpen(true);
  };

  const handleProductFormChange = (e) => {
    setProductForm({ ...productForm, [e.target.name]: e.target.value });
  };

  const handleTagChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => parseInt(option.value));
    setProductForm({ ...productForm, tags: selectedOptions });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    const img = existingImages[index];
    if (img?.id) {
      setRemovedImageIds(prev => [...prev, img.id]);
    }
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const saveProduct = async (e) => {
    e.preventDefault();

    if (!productForm.name.trim() || !productForm.description.trim() || !String(productForm.price).trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!productForm.prod_has_category) {
      toast.error('Please select a category');
      return;
    }

    // For new products at least one image is required; for edits, either keep an
    // existing image or add a new one.
    const hasAnyImage = images.length > 0 || existingImages.length > 0;
    if (!hasAnyImage) {
      toast.error('Please upload at least one image');
      return;
    }

    setSaving(true);
    try {
      const submitData = new FormData();
      submitData.append('name', productForm.name.trim());
      submitData.append('description', productForm.description.trim());
      submitData.append('price', String(productForm.price).trim());
      submitData.append('prod_has_category', productForm.prod_has_category);

      if (productForm.group) {
        submitData.append('group', productForm.group);
      }

      if (productForm.tags.length > 0) {
        productForm.tags.forEach(tagId => {
          submitData.append('tags', tagId.toString());
        });
      }

      images.forEach((image) => {
        submitData.append('images', image);
      });

      if (editingProduct) {
        // ProductView.patch() reads "id" from the request body, not the URL,
        // and expects "deleted_images" as a comma-separated string of ProductImage ids.
        submitData.append('id', editingProduct.id);
        if (removedImageIds.length > 0) {
          submitData.append('deleted_images', removedImageIds.join(','));
        }

        // await AxiosInstance.patch(`/api/myapp/v1/product/`, submitData, {
        //   headers: { 'Content-Type': 'multipart/form-data' },
        // });
        await AxiosInstance.patch(`/api/myapp/v1/product/`, submitData, {
                  params: { id: editingProduct.id },
                  headers: { 'Content-Type': 'multipart/form-data' },
                });
        toast.success('Product updated successfully', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      } else {
        await AxiosInstance.post('/api/myapp/v1/product/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product added successfully', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }

      setProductModalOpen(false);
      resetProductForm();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving product';
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } finally {
      setSaving(false);
    }
  };

  // Return early if no read permission
  if (!permissions.read_product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">
            You don't have permission to view products. Please contact your administrator.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
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
            className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-white text-3xl"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
              <div>
                <img
                  src={selectedProduct.mainImage}
                  alt={selectedProduct.name}
                  className="w-full h-80 object-contain bg-gray-700 rounded-lg"
                  onError={(e) => {
                    e.target.src = '/default-product-image.jpg';
                  }}
                />
                {selectedProduct.remainingImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {selectedProduct.remainingImages.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        className="h-20 object-cover rounded"
                        alt={`Additional view ${i + 1}`}
                        onError={(e) => {
                          e.target.src = '/default-product-image.jpg';
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="text-gray-300">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Description</h3>
                <p>{selectedProduct.description}</p>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <h3 className="font-semibold text-amber-400">Category</h3>
                    <p>{selectedProduct.category_data?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-400">Price</h3>
                    <p>PKR {parseFloat(selectedProduct.price || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-400">Group</h3>
                    <p>{selectedProduct.group || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-400">Tags</h3>
                    <p>{selectedProduct.tag_names?.join(', ') || 'N/A'}</p>
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

                <div className="flex mt-6 space-x-4">
                  {permissions.update_product && (
                    <button
                      onClick={() => {
                        handleEditProduct(selectedProduct);
                        closeDetailsModal();
                      }}
                      className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
                    >
                      Edit
                    </button>
                  )}

                  {permissions.delete_product && (
                    <button
                      onClick={() => deleteRecord(selectedProduct.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  )}

                  <button
                    onClick={closeDetailsModal}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Update Product Modal */}
      {productModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] my-8">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {editingProduct ? 'Update product details' : 'Upload up to 5 images for your product'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setProductModalOpen(false);
                    resetProductForm();
                  }}
                  className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50 hover:border-slate-600/50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={saveProduct} className="p-6 space-y-6">
              {/* Images */}
              <div className="space-y-3">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Product Images {!editingProduct && '*'}
                  </span>
                  <span className="text-slate-400 text-xs font-normal">
                    {existingImages.length + images.length}/5 images
                  </span>
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-2">
                  {/* Existing images (edit mode) */}
                  {existingImages.map((img, index) => (
                    <div key={`existing-${img.id ?? index}`} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden border-2 border-slate-700/50 bg-slate-900/60">
                        <img
                          src={img.image_url}
                          alt={img.alt_text || `Existing ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = '/default-product-image.jpg'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded font-semibold">
                          Current
                        </div>
                      )}
                    </div>
                  ))}

                  {/* New image previews */}
                  {imagePreviews.map((preview, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden border-2 border-amber-400/50 bg-slate-900/60">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {existingImages.length === 0 && index === 0 && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-slate-900 text-xs px-2 py-1 rounded font-semibold">
                          Main
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Upload placeholder */}
                  {existingImages.length + images.length < 5 && (
                    <label className="cursor-pointer">
                      <div className="aspect-square rounded-xl border-2 border-dashed border-slate-700/50 bg-slate-900/40 hover:border-amber-400/50 transition-colors flex flex-col items-center justify-center p-4 text-center">
                        <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-slate-400 text-sm">Add Image</p>
                        <p className="text-slate-500 text-xs mt-1">{existingImages.length + images.length}/5</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                        multiple
                      />
                    </label>
                  )}
                </div>

                <p className="text-slate-500 text-xs">
                  {editingProduct
                    ? 'Remove existing images you no longer want, and add new ones. Up to 5 total.'
                    : 'Upload up to 5 images (PNG, JPG, JPEG). First image will be used as main display.'}
                </p>
              </div>

              {/* Name & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter product name"
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Enter price"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
                  Description *
                </label>
                <textarea
                  name="description"
                  placeholder="Enter detailed product description"
                  value={productForm.description}
                  onChange={handleProductFormChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500 resize-none"
                />
              </div>

              {/* Category, Group, Tags */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
                    Category *
                  </label>
                  <select
                    name="prod_has_category"
                    value={productForm.prod_has_category}
                    onChange={handleProductFormChange}
                    disabled={isLoadingCategories}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  >
                    <option value="" className="bg-slate-900">Select Category</option>
                    {isLoadingCategories ? (
                      <option value="" className="bg-slate-900" disabled>Loading categories...</option>
                    ) : categoryRecords.length > 0 ? (
                      categoryRecords.map((category) => (
                        <option key={category.id} value={category.id} className="bg-slate-900">
                          {category.name}
                        </option>
                      ))
                    ) : (
                      <option value="" className="bg-slate-900" disabled>No categories available</option>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
                    Group
                  </label>
                  <select
                    name="group"
                    value={productForm.group}
                    onChange={handleProductFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  >
                    <option value="" className="bg-slate-900">Select Group</option>
                    {GROUP_CHOICES.map((choice) => (
                      <option key={choice.value} value={choice.value} className="bg-slate-900">
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
                    Tags
                  </label>
                  <select
                    name="tags"
                    value={productForm.tags}
                    onChange={handleTagChange}
                    multiple
                    disabled={isLoadingTags}
                    size={3}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  >
                    {isLoadingTags ? (
                      <option value="" className="bg-slate-900" disabled>Loading tags...</option>
                    ) : tagRecords.length > 0 ? (
                      tagRecords.map((tag) => (
                        <option key={tag.id} value={tag.id} className="bg-slate-900">
                          {tag.name}
                        </option>
                      ))
                    ) : (
                      <option value="" className="bg-slate-900" disabled>No tags available</option>
                    )}
                  </select>
                  <p className="text-slate-500 text-xs">Hold Ctrl/Cmd to select multiple tags</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setProductModalOpen(false);
                    resetProductForm();
                  }}
                  className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-semibold border-2 border-slate-700/50 hover:border-slate-600/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || isLoadingCategories}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-light text-white">LUXURY PRODUCTS</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mt-1"></div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {permissions.create_product && (
              <button
                onClick={handleAddProduct}
                className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform"
              >
                Add Product
              </button>
            )}
            <button
              onClick={() => router.push('/admin/productvariant')}
              className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform"
            >
              Products Variant
            </button>
            <button
              onClick={() => router.push('/admin/productinventory')}
              className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform"
            >
              Products Inventory
            </button>
          </div>
        </div>

        {/* Search and Stats Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-800/50 rounded-xl mb-8 gap-4">
          <div className="text-amber-400">
            Showing {filteredRecords.length} of {pagination.totalCount} items
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
            <div className="relative w-full">
              <span className="absolute left-3 top-3 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search by name, ID or category..."
                className="w-full pl-10 py-3 bg-gray-700 rounded-full text-white focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={pagination.limit}
                onChange={handleLimitChange}
                className="bg-gray-700 text-white rounded-full px-3 py-2 focus:outline-none focus:ring-amber-500"
                disabled={isLoading}
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(pagination.limit)].map((_, idx) => (
              <div key={idx} className="animate-pulse">
                <div className="bg-gray-800 rounded-xl aspect-square"></div>
                <div className="mt-3 h-5 bg-gray-800 rounded w-3/4"></div>
                <div className="mt-2 h-4 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {filteredRecords.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredRecords.map(item => (
                  <div
                    key={item.id}
                    className="group relative rounded-xl overflow-hidden hover:shadow-lg hover:shadow-amber-400/20 transition-all"
                  >
                    <div className="aspect-square bg-gray-800">
                      <img
                        src={item.mainImage}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = '/default-product-image.jpg';
                        }}
                      />
                    </div>

                    {item.remainingImages.length > 0 && (
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        +{item.remainingImages.length}
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                    <div className="p-4 absolute bottom-0 left-0 right-0">
                      <span className="text-xs text-amber-400 uppercase">{item.category_data?.name || 'Uncategorized'}</span>
                      <h3 className="text-lg font-medium text-white line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-gray-300 line-clamp-2">{item.description}</p>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-amber-400 font-bold">
                          PKR {parseFloat(item.price || 0).toLocaleString()}
                        </span>

                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetailsModal(item);
                            }}
                            className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                            aria-label="View details"
                          >
                            👁️
                          </button>

                          {permissions.update_product && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProduct(item);
                              }}
                              className="p-2 bg-amber-600/90 rounded-lg hover:bg-amber-600 transition-colors"
                              aria-label="Edit product"
                            >
                              ✏️
                            </button>
                          )}

                          {permissions.delete_product && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteRecord(item.id);
                              }}
                              className="p-2 bg-red-600/90 rounded-lg hover:bg-red-600 transition-colors"
                              aria-label="Delete product"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-300">
                <p>No products match your search.</p>
                {permissions.create_product && (
                  <button
                    onClick={handleAddProduct}
                    className="mt-6 px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors"
                  >
                    Add Product
                  </button>
                )}
              </div>
            )}

            {/* Enhanced Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevious || isLoading}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !pagination.hasPrevious || isLoading
                        ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {getPageNumbers().map((pageNum, index) => {
                      if (pageNum === '...') {
                        return (
                          <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
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
                              ? 'bg-amber-600 text-white font-semibold'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext || isLoading}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !pagination.hasNext || isLoading
                        ? 'bg-gray-700 cursor-not-allowed text-gray-400'
                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                    }`}
                  >
                    Next
                  </button>
                </div>

                <div className="text-gray-400 text-sm">
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

export default AdminProducts;