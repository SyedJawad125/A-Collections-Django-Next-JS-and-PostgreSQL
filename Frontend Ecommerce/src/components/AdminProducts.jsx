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

//   // Simplified pagination state (same as other components)
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

//   // Fetch products with pagination (updated to use new API structure)
//   useEffect(() => {
//     const fetchProducts = async () => {
//       if (!permissions.read_product) {
//         setIsLoading(false);
//         return;
//       }

//       setIsLoading(true);
//       try {
//         // Use the new API endpoint and params structure
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
        
//         // Parse response according to create_response structure
//         const responseData = res?.data?.data;
        
//         if (!responseData) {
//           console.error('Invalid response structure:', res?.data);
//           toast.error('Invalid response from server');
//           setRecords([]);
//           return;
//         }
        
//         // Handle both possible response structures
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
        
//         // Calculate pagination values
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

//   // Handle page change (simplified)
//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
//       setPagination(prev => ({ ...prev, currentPage: newPage }));
//     }
//   };

//   // Handle limit change (simplified)
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
//       // Use new API endpoint
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
//       r.category_name?.toLowerCase().includes(value)
//     );
    
//     setFilteredRecords(filtered);
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

//   // Generate page numbers for pagination (same as other components)
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
//                     <p>{selectedProduct.category_name || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Price</h3>
//                     <p>PKR {parseFloat(selectedProduct.price || 0).toLocaleString()}</p>
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
//                       <span className="text-xs text-amber-400 uppercase">{item.category_name}</span>
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

//             {/* Enhanced Pagination (same as other components) */}
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


'use client'
import React, { useEffect, useState, useContext, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

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

  // Fetch products with pagination
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
        
        // Parse response - the structure is { message, count, data: [...] }
        const responseData = res?.data;
        
        if (!responseData || !responseData.data) {
          console.error('Invalid response structure:', res?.data);
          toast.error('Invalid response from server');
          setRecords([]);
          return;
        }
        
        // Get the data array directly
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
          // Use image_urls array from the response
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
        
        // Calculate pagination values from the response
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
  }, [refreshKey, baseURL, pagination.currentPage, pagination.limit, permissions.read_product]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit,
      currentPage: 1  // Reset to page 1 when changing limit
    }));
  };

  // Event listener for product updates
  useEffect(() => {
    const handleProductUpdate = () => setRefreshKey(k => k + 1);
    window.addEventListener('productUpdated', handleProductUpdate);
    return () => window.removeEventListener('productUpdated', handleProductUpdate);
  }, []);

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

  const deleteRecord = async (id) => {
    if (!permissions.delete_product) {
      toast.error('You do not have permission to delete products');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await AxiosInstance.delete(`/api/myapp/v1/product/${id}/`);
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

  const updateRecord = (id) => {
    if (!permissions.update_product) {
      toast.error('You do not have permission to update products');
      return;
    }
    router.push(`/updateproductpage?productid=${id}`);
  };

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
                        updateRecord(selectedProduct.id);
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
                onClick={() => router.push('/addproductspage')}
                className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform"
              >
                Add Product
              </button>
            )}
            <button 
              onClick={() => router.push('/productvariant')}
              className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform"
            >
              Products Variant
            </button>
            <button 
              onClick={() => router.push('/addproductspage')}
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
                                updateRecord(item.id); 
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
                    onClick={() => router.push('/addproductspage')}
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
                  {/* Previous Button */}
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
                  
                  {/* Page Numbers */}
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
                  
                  {/* Next Button */}
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

                {/* Page info */}
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