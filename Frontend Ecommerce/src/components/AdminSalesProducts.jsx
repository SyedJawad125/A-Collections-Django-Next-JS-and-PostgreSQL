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

//   // ---------- Add / Update sales product modal state ----------
//   const [salesProductModalOpen, setSalesProductModalOpen] = useState(false);
//   const [editingSalesProduct, setEditingSalesProduct] = useState(null);
//   const [salesProductForm, setSalesProductForm] = useState({
//     name: '',
//     description: '',
//     original_price: '',
//     discount_percent: '',
//     prod_has_category: '',
//   });
//   const [images, setImages] = useState([]);
//   const [imagePreviews, setImagePreviews] = useState([]);
//   const [existingImages, setExistingImages] = useState([]);
//   const [removedImageIds, setRemovedImageIds] = useState([]);
//   const [categoryRecords, setCategoryRecords] = useState([]);
//   const [isLoadingCategories, setIsLoadingCategories] = useState(true);
//   const [saving, setSaving] = useState(false);

//   // Handle modal focus
//   useEffect(() => {
//     if (showDetailsModal && modalRef.current) {
//       modalRef.current.focus();
//     }
//   }, [showDetailsModal]);

//   // Fetch sales products
//   useEffect(() => {
//     const fetchSalesProducts = async () => {
//       if (!permissions.read_sales_product) {
//         setIsLoading(false);
//         return;
//       }

//       try {
//         setIsLoading(true);
        
//         // API call with proper parameters
//         const res = await AxiosInstance.get(
//           `/api/myapp/v1/sales/product/`,
//           {
//             params: {
//               page: pagination.currentPage,
//               limit: pagination.limit,
//               api_type: 'list' // REQUIRED: triggers list serializer
//             }
//           }
//         );
        
//         // Parse response according to backend structure: { message, count, data: [...] }
//         const responseData = res?.data;
        
//         if (!responseData || !responseData.data) {
//           console.error('Invalid response structure:', res?.data);
//           toast.error('Invalid response from server');
//           setRecords([]);
//           setFilteredRecords([]);
//           return;
//         }
        
//         // Get the actual data array
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
        
//         // Get count from response
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
//         console.error('Error fetching sale products:', error);
//         console.error('Error details:', error.response?.data);
        
//         if (error.response?.status === 403) {
//           toast.error('You do not have permission to view sale products');
//         } else {
//           toast.error(
//             error.response?.data?.message || 'Failed to load sale products',
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
//         setRecords([]);
//         setFilteredRecords([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchSalesProducts();
//   }, [refreshKey, pagination.currentPage, pagination.limit, baseURL, permissions.read_sales_product]);

//   // Event listener for product updates
//   useEffect(() => {
//     const handleProductUpdate = () => setRefreshKey(k => k + 1);
//     window.addEventListener('saleProductUpdated', handleProductUpdate);
//     return () => window.removeEventListener('saleProductUpdated', handleProductUpdate);
//   }, []);

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

//   const openDetailsModal = (product) => {
//     if (!permissions.read_sales_product) {
//       toast.error('You do not have permission to view sale product details');
//       return;
//     }
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
//       const categoryMatch = record.category_data?.name?.toLowerCase().includes(value);
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
//       // CORRECT DELETE URL - uses query parameter matching backend BaseView
//       // await AxiosInstance.delete(`/api/myapp/v1/sales/product/?id=${id}`);
//       await AxiosInstance.delete(`/api/myapp/v1/sales/product/`, { params: { id } });
      
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

//   const handleAddSalesProduct = () => {
//     if (!permissions.create_sales_product) {
//       toast.error('You do not have permission to add sale products');
//       return;
//     }
//     resetSalesProductForm();
//     setSalesProductModalOpen(true);
//   };

//   const updateRecord = (salesProduct) => {
//     if (!permissions.update_sales_product) {
//       toast.error('You do not have permission to update sale products');
//       return;
//     }
    
//     setEditingSalesProduct(salesProduct);
//     setSalesProductForm({
//       name: salesProduct.name || '',
//       description: salesProduct.description || '',
//       original_price: salesProduct.original_price ? String(salesProduct.original_price) : '',
//       discount_percent: salesProduct.discount_percent ? String(salesProduct.discount_percent) : '',
//       prod_has_category: salesProduct.category_data?.id ? String(salesProduct.category_data.id) : (salesProduct.prod_has_category || ''),
//     });
//     setImages([]);
//     setImagePreviews([]);
//     setExistingImages(salesProduct.allImages && salesProduct.allImages.length > 0
//       ? salesProduct.allImages.map(url => processImageUrl(url))
//       : (salesProduct.mainImage ? [salesProduct.mainImage] : []));
//     setRemovedImageIds([]);
//     setSalesProductModalOpen(true);
//   };

//   const resetSalesProductForm = () => {
//     setSalesProductForm({
//       name: '',
//       description: '',
//       original_price: '',
//       discount_percent: '',
//       prod_has_category: '',
//     });
//     setImages([]);
//     setImagePreviews([]);
//     setExistingImages([]);
//     setRemovedImageIds([]);
//     setEditingSalesProduct(null);
//   };

//   const handleSalesProductFormChange = (e) => {
//     setSalesProductForm({ ...salesProductForm, [e.target.name]: e.target.value });
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
//     const img = existingImages[index];
//     if (img?.id) {
//       setRemovedImageIds(prev => [...prev, img.id]);
//     }
//     setExistingImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const saveSalesProduct = async (e) => {
//     e.preventDefault();

//     if (!salesProductForm.name.trim() || !salesProductForm.description.trim() || !String(salesProductForm.original_price).trim() || !String(salesProductForm.discount_percent).trim()) {
//       toast.error('Please fill in all required fields');
//       return;
//     }

//     if (!salesProductForm.prod_has_category) {
//       toast.error('Please select a category');
//       return;
//     }

//     const hasAnyImage = images.length > 0 || existingImages.length > 0;
//     if (!hasAnyImage) {
//       toast.error('Please upload at least one image');
//       return;
//     }

//     setSaving(true);
//     try {
//       const submitData = new FormData();
//       submitData.append('name', salesProductForm.name.trim());
//       submitData.append('description', salesProductForm.description.trim());
//       submitData.append('original_price', String(salesProductForm.original_price).trim());
//       submitData.append('discount_percent', String(salesProductForm.discount_percent).trim());
//       submitData.append('prod_has_category', salesProductForm.prod_has_category);

//       images.forEach((image) => {
//         submitData.append('images', image);
//       });

//       if (editingSalesProduct) {
//         // SalesProductView.patch() reads "id" from the request body, not the URL
//         submitData.append('id', editingSalesProduct.id);
//         if (removedImageIds.length > 0) {
//           submitData.append('deleted_images', removedImageIds.join(','));
//         }

//         // await AxiosInstance.patch(`/api/myapp/v1/sales/product/`, submitData, {
//         //   headers: { 'Content-Type': 'multipart/form-data' },
//         // });
//         await AxiosInstance.patch(`/api/myapp/v1/sales/product/`, submitData, {
//               params: { id: editingSalesProduct.id },
//               headers: { 'Content-Type': 'multipart/form-data' },
//             });
//         toast.success('Sale product updated successfully', {
//           position: "top-center",
//           autoClose: 2000,
//           hideProgressBar: true,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           theme: "dark",
//         });
//       } else {
//         await AxiosInstance.post('/api/myapp/v1/sales/product/', submitData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         toast.success('Sale product added successfully', {
//           position: "top-center",
//           autoClose: 2000,
//           hideProgressBar: true,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           theme: "dark",
//         });
//       }

//       setSalesProductModalOpen(false);
//       resetSalesProductForm();
//       setRefreshKey(prev => prev + 1);
//     } catch (error) {
//       console.error('Error saving sale product:', error);
//       console.error('Error response:', error.response?.data);
//       const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving sale product';
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

//   if (!permissions.read_sales_product) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center relative overflow-hidden">
//         <div className="absolute inset-0">
//           <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
//         </div>
        
//         <div className="text-center p-8 max-w-md relative z-10">
//           <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/50">
//             <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent mb-4">Access Denied</h2>
//           <p className="text-slate-400 mb-6">
//             You don't have permission to view sale products. Please contact your administrator.
//           </p>
//           <button 
//             onClick={() => router.push('/')}
//             className="px-6 py-2 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-full hover:shadow-lg hover:shadow-amber-500/50 transition-all"
//           >
//             Return to Dashboard
//           </button>
//         </div>
//         <ToastContainer position="top-right" autoClose={2000} />
//       </div>
//     );
//   }
  
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
//                     <p>{selectedProduct.category_data?.name || 'N/A'}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Original Price</h3>
//                     <p className="line-through text-slate-400">PKR {parseFloat(selectedProduct.original_price || 0).toLocaleString()}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Discount</h3>
//                     <p>{selectedProduct.discount_percent}%</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Final Price</h3>
//                     <p className="text-amber-300 font-bold text-lg">PKR {parseFloat(selectedProduct.final_price || 0).toLocaleString()}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">You Save</h3>
//                     <p className="text-green-400 font-semibold">PKR {parseFloat(selectedProduct.discount_amount || 0).toLocaleString()}</p>
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-amber-400">Status</h3>
//                     <p>{selectedProduct.has_discount ? 'Active Sale' : 'Regular'}</p>
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
                
//                 <div className="flex mt-8 space-x-4">
//                   {permissions.update_sales_product && (
//                     <button
//                       onClick={() => {
//                         updateRecord(selectedProduct);
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
//                   onClick={handleAddSalesProduct}
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
//                 placeholder="Search by name, ID or category..."
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
//                                   updateRecord(item);
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
//                         <span className="text-amber-400 font-bold text-lg">
//                           PKR {parseFloat(item.final_price || 0).toLocaleString()}
//                         </span>
//                         {item.original_price && (
//                           <span className="text-slate-400 line-through text-sm">
//                             PKR {parseFloat(item.original_price || 0).toLocaleString()}
//                           </span>
//                         )}
//                       </div>
//                       <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.description}</p>
//                       <span className="text-xs text-amber-300 uppercase block">{item.category_data?.name || 'Uncategorized'}</span>
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
//                         ? 'bg-slate-900/60 cursor-not-allowed text-slate-400 border border-slate-800/50' 
//                         : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:shadow-amber-500/50 text-slate-900 font-semibold'
//                     }`}
//                   >
//                     Previous
//                   </button>
                  
//                   {/* Page Numbers */}
//                   <div className="flex items-center gap-1">
//                     {getPageNumbers().map((pageNum, index) => {
//                       if (pageNum === '...') {
//                         return (
//                           <span key={`ellipsis-${index}`} className="px-2 text-slate-500">
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
//                               ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold shadow-lg shadow-amber-500/50' 
//                               : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800/50'
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
//                         ? 'bg-slate-900/60 cursor-not-allowed text-slate-400 border border-slate-800/50' 
//                         : 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:shadow-amber-500/50 text-slate-900 font-semibold'
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>

//                 {/* Page info */}
//                 <div className="text-slate-400 text-sm">
//                   Page {pagination.currentPage} of {pagination.totalPages}
//                 </div>
//               </div>
//             )}
//           </>
//         )}

//         {/* Sales Product Edit Modal */}
//         {salesProductModalOpen && (
//           <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//             <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
//               <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
//                       {editingSalesProduct ? 'Edit Sale Product' : 'Add Sale Product'}
//                     </h2>
//                     <p className="text-slate-400 text-sm mt-1">
//                       {editingSalesProduct ? 'Update sale product details' : 'Create a new sale product'}
//                     </p>
//                   </div>
//                   <button
//                     onClick={() => setSalesProductModalOpen(false)}
//                     className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50 hover:border-slate-600/50"
//                   >
//                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                     </svg>
//                   </button>
//                 </div>
//               </div>

//               <form onSubmit={saveSalesProduct} className="p-6 space-y-6">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-400 mb-2">
//                     Product Name <span className="text-red-400">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={salesProductForm.name}
//                     onChange={handleSalesProductFormChange}
//                     placeholder="Enter product name"
//                     className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-400 mb-2">
//                     Description <span className="text-red-400">*</span>
//                   </label>
//                   <textarea
//                     name="description"
//                     value={salesProductForm.description}
//                     onChange={handleSalesProductFormChange}
//                     placeholder="Enter product description"
//                     rows={3}
//                     className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500 resize-none"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-400 mb-2">
//                       Original Price (PKR) <span className="text-red-400">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       name="original_price"
//                       value={salesProductForm.original_price}
//                       onChange={handleSalesProductFormChange}
//                       placeholder="0"
//                       className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-slate-400 mb-2">
//                       Discount (%) <span className="text-red-400">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       name="discount_percent"
//                       value={salesProductForm.discount_percent}
//                       onChange={handleSalesProductFormChange}
//                       placeholder="0"
//                       min="0"
//                       max="100"
//                       className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-400 mb-2">
//                     Category <span className="text-red-400">*</span>
//                   </label>
//                   <select
//                     name="prod_has_category"
//                     value={salesProductForm.prod_has_category}
//                     onChange={handleSalesProductFormChange}
//                     disabled={isLoadingCategories}
//                     className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
//                   >
//                     <option value="">Select a category</option>
//                     {categoryRecords.map(cat => (
//                       <option key={cat.id} value={cat.id}>{cat.name}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Images */}
//                 <div className="space-y-3">
//                   <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center justify-between">
//                     <span className="flex items-center">
//                       <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
//                       </svg>
//                       Product Images {!editingSalesProduct && '*'}
//                     </span>
//                     <span className="text-slate-400 text-xs font-normal">
//                       {existingImages.length + images.length}/5 images
//                     </span>
//                   </label>

//                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-2">
//                     {/* Existing images (edit mode) */}
//                     {existingImages.map((img, index) => (
//                       <div key={`existing-${img.id ?? index}`} className="relative group">
//                         <div className="aspect-square rounded-xl overflow-hidden border-2 border-slate-700/50 bg-slate-900/60">
//                           <img
//                             src={typeof img === 'string' ? img : img.url}
//                             alt={`Existing ${index + 1}`}
//                             className="w-full h-full object-cover"
//                           />
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => removeExistingImage(index)}
//                           className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
//                         >
//                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                           </svg>
//                         </button>
//                         {index === 0 && (
//                           <div className="absolute top-2 left-2 bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded font-semibold">
//                             Current
//                           </div>
//                         )}
//                       </div>
//                     ))}

//                     {/* New image previews */}
//                     {imagePreviews.map((preview, index) => (
//                       <div key={`new-${index}`} className="relative group">
//                         <div className="aspect-square rounded-xl overflow-hidden border-2 border-amber-400/50 bg-slate-900/60">
//                           <img
//                             src={preview}
//                             alt={`Preview ${index + 1}`}
//                             className="w-full h-full object-cover"
//                           />
//                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => removeNewImage(index)}
//                           className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
//                         >
//                           <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
//                             <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                           </svg>
//                         </button>
//                         {existingImages.length === 0 && index === 0 && (
//                           <div className="absolute top-2 left-2 bg-amber-500 text-slate-900 text-xs px-2 py-1 rounded font-semibold">
//                             Main
//                           </div>
//                         )}
//                       </div>
//                     ))}

//                     {/* Upload placeholder */}
//                     {existingImages.length + images.length < 5 && (
//                       <label className="cursor-pointer">
//                         <div className="aspect-square rounded-xl border-2 border-dashed border-slate-700/50 bg-slate-900/40 hover:border-amber-400/50 transition-colors flex flex-col items-center justify-center p-4 text-center">
//                           <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                           </svg>
//                           <p className="text-slate-400 text-sm">Add Image</p>
//                           <p className="text-slate-500 text-xs mt-1">{existingImages.length + images.length}/5</p>
//                         </div>
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={handleImageChange}
//                           className="sr-only"
//                           multiple
//                         />
//                       </label>
//                     )}
//                   </div>

//                   <p className="text-slate-500 text-xs">
//                     {editingSalesProduct
//                       ? 'Remove existing images you no longer want, and add new ones. Up to 5 total.'
//                       : 'Upload up to 5 images (PNG, JPG, JPEG). First image will be used as main display.'}
//                   </p>
//                 </div>

//                 <div className="flex gap-3 pt-4">
//                   <button
//                     type="button"
//                     onClick={() => setSalesProductModalOpen(false)}
//                     className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-semibold border-2 border-slate-700/50 hover:border-slate-600/50 transition-all"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={saving}
//                     className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {saving ? 'Saving...' : (editingSalesProduct ? 'Update Sale Product' : 'Add Sale Product')}
//                   </button>
//                 </div>
//               </form>
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

  // ---------- Add / Update sales product modal state ----------
  const [salesProductModalOpen, setSalesProductModalOpen] = useState(false);
  const [editingSalesProduct, setEditingSalesProduct] = useState(null);
  const [salesProductForm, setSalesProductForm] = useState({
    name: '',
    description: '',
    original_price: '',
    discount_percent: '',
    prod_has_category: '',
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState([]);
  const [categoryRecords, setCategoryRecords] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);

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
      await AxiosInstance.delete(`/api/myapp/v1/sales/product/`, { params: { id } });
      
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

  const handleAddSalesProduct = () => {
    if (!permissions.create_sales_product) {
      toast.error('You do not have permission to add sale products');
      return;
    }
    resetSalesProductForm();
    setSalesProductModalOpen(true);
  };

  const updateRecord = (salesProduct) => {
    if (!permissions.update_sales_product) {
      toast.error('You do not have permission to update sale products');
      return;
    }
    
    setEditingSalesProduct(salesProduct);
    setSalesProductForm({
      name: salesProduct.name || '',
      description: salesProduct.description || '',
      original_price: salesProduct.original_price ? String(salesProduct.original_price) : '',
      discount_percent: salesProduct.discount_percent ? String(salesProduct.discount_percent) : '',
      prod_has_category: salesProduct.category_data?.id ? String(salesProduct.category_data.id) : (salesProduct.prod_has_category || ''),
    });
    setImages([]);
    setImagePreviews([]);
    setExistingImages(salesProduct.allImages && salesProduct.allImages.length > 0
      ? salesProduct.allImages.map(url => processImageUrl(url))
      : (salesProduct.mainImage ? [salesProduct.mainImage] : []));
    setRemovedImageIds([]);
    setSalesProductModalOpen(true);
  };

  const resetSalesProductForm = () => {
    setSalesProductForm({
      name: '',
      description: '',
      original_price: '',
      discount_percent: '',
      prod_has_category: '',
    });
    setImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setRemovedImageIds([]);
    setEditingSalesProduct(null);
  };

  const handleSalesProductFormChange = (e) => {
    setSalesProductForm({ ...salesProductForm, [e.target.name]: e.target.value });
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

  const saveSalesProduct = async (e) => {
    e.preventDefault();

    if (!salesProductForm.name.trim() || !salesProductForm.description.trim() || !String(salesProductForm.original_price).trim() || !String(salesProductForm.discount_percent).trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!salesProductForm.prod_has_category) {
      toast.error('Please select a category');
      return;
    }

    const hasAnyImage = images.length > 0 || existingImages.length > 0;
    if (!hasAnyImage) {
      toast.error('Please upload at least one image');
      return;
    }

    setSaving(true);
    try {
      const submitData = new FormData();
      submitData.append('name', salesProductForm.name.trim());
      submitData.append('description', salesProductForm.description.trim());
      submitData.append('original_price', String(salesProductForm.original_price).trim());
      submitData.append('discount_percent', String(salesProductForm.discount_percent).trim());
      submitData.append('prod_has_category', salesProductForm.prod_has_category);

      images.forEach((image) => {
        submitData.append('images', image);
      });

      if (editingSalesProduct) {
        submitData.append('id', editingSalesProduct.id);
        if (removedImageIds.length > 0) {
          submitData.append('deleted_images', removedImageIds.join(','));
        }

        await AxiosInstance.patch(`/api/myapp/v1/sales/product/`, submitData, {
              params: { id: editingSalesProduct.id },
              headers: { 'Content-Type': 'multipart/form-data' },
            });
        toast.success('Sale product updated successfully', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      } else {
        await AxiosInstance.post('/api/myapp/v1/sales/product/', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Sale product added successfully', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
      }

      setSalesProductModalOpen(false);
      resetSalesProductForm();
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error saving sale product:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error saving sale product';
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
                        updateRecord(selectedProduct);
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
        <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-10 relative overflow-hidden mb-4 -mt-16">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2 -mt-4">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-2xl shadow-amber-500/50 mb-4">
                  <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-2">
                  SALE PRODUCTS
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mb-3"></div>
                <p className="text-slate-400">Manage your sale products inventory and variants</p>
              </div>
              
              {/* Action Buttons Row */}
              <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
                {/* Add Product Button */}
                {permissions.create_sales_product && (
                  <button
                    className="group relative px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-full shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all duration-300"
                    onClick={handleAddSalesProduct}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      <span>Add Product</span>
                    </div>
                  </button>
                )}

                {/* Product Variant Button */}
                <button
                  className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-full shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/70 transform hover:scale-105 transition-all duration-300"
                  onClick={() => router.push('/admin/salesproductvariant')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span>Products Variant</span>
                  </div>
                </button>

                {/* Product Inventory Button */}
                <button
                  className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-full shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/70 transform hover:scale-105 transition-all duration-300"
                  onClick={() => router.push('/admin/salesinventory')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>Products Inventory</span>
                  </div>
                </button>
              </div>
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
                                  updateRecord(item);
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

        {/* Sales Product Edit Modal */}
        {salesProductModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                      {editingSalesProduct ? 'Edit Sale Product' : 'Add Sale Product'}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                      {editingSalesProduct ? 'Update sale product details' : 'Create a new sale product'}
                    </p>
                  </div>
                  <button
                    onClick={() => setSalesProductModalOpen(false)}
                    className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50 hover:border-slate-600/50"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={saveSalesProduct} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Product Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={salesProductForm.name}
                    onChange={handleSalesProductFormChange}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={salesProductForm.description}
                    onChange={handleSalesProductFormChange}
                    placeholder="Enter product description"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Original Price (PKR) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="original_price"
                      value={salesProductForm.original_price}
                      onChange={handleSalesProductFormChange}
                      placeholder="0"
                      className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">
                      Discount (%) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      name="discount_percent"
                      value={salesProductForm.discount_percent}
                      onChange={handleSalesProductFormChange}
                      placeholder="0"
                      min="0"
                      max="100"
                      className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="prod_has_category"
                    value={salesProductForm.prod_has_category}
                    onChange={handleSalesProductFormChange}
                    disabled={isLoadingCategories}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                  >
                    <option value="">Select a category</option>
                    {categoryRecords.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Images */}
                <div className="space-y-3">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      Product Images {!editingSalesProduct && '*'}
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
                            src={typeof img === 'string' ? img : img.url}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-full object-cover"
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
                    {editingSalesProduct
                      ? 'Remove existing images you no longer want, and add new ones. Up to 5 total.'
                      : 'Upload up to 5 images (PNG, JPG, JPEG). First image will be used as main display.'}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setSalesProductModalOpen(false)}
                    className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-semibold border-2 border-slate-700/50 hover:border-slate-600/50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : (editingSalesProduct ? 'Update Sale Product' : 'Add Sale Product')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesProductsCom;