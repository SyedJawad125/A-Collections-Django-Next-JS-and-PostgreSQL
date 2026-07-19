// 'use client';
// import React, { useEffect, useState, useContext } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/components/AuthContext';
// import Image from 'next/image';
// import { Search, Plus, Filter, Edit2, Trash2, ImageIcon, Folder, Grid3x3, Eye, X } from 'lucide-react';

// const ImagesCom = () => {
//   const router = useRouter();
//   const { permissions = {} } = useContext(AuthContext);
//   const [images, setImages] = useState([]);
//   const [filteredImages, setFilteredImages] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(12);

//   // Modal states
//   const [imageModalOpen, setImageModalOpen] = useState(false);
//   const [editingImage, setEditingImage] = useState(null);
//   const [categoryModalOpen, setCategoryModalOpen] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [categories, setCategories] = useState([]);

//   // Form states
//   const [imageForm, setImageForm] = useState({ name: '', description: '', category: '', image: null });
//   const [categoryForm, setCategoryForm] = useState({ name: '', image: null });
//   const [saving, setSaving] = useState(false);

//   // Check for permissions
//   const hasReadPermission = permissions.read_image || permissions.READ_IMAGE;
//   const hasCreatePermission = permissions.create_image || permissions.CREATE_IMAGE;
//   const hasUpdatePermission = permissions.update_image || permissions.UPDATE_IMAGE;
//   const hasDeletePermission = permissions.delete_image || permissions.DELETE_IMAGE;

//   useEffect(() => {
//     if (hasReadPermission) {
//       fetchImages();
//     }
//     fetchCategories();
//   }, [hasReadPermission]);

//   // Update filtered images when search term or images change
//   useEffect(() => {
//     if (searchTerm) {
//       const filtered = images.filter(item => 
//         item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         item.description?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//       setFilteredImages(filtered);
//     } else {
//       setFilteredImages(images);
//     }
//     setCurrentPage(1); // Reset to first page when filtering
//   }, [searchTerm, images]);

//   const fetchCategories = async () => {
//     try {
//       const res = await AxiosInstance.get('/api/images/v1/categories/');
//       console.log('Categories response:', res.data);
//       if (res?.data?.data && Array.isArray(res.data.data)) {
//         setCategories(res.data.data);
//       } else if (res?.data && Array.isArray(res.data)) {
//         setCategories(res.data);
//       }
//     } catch (error) {
//       console.error('Error fetching categories:', error);
//       setCategories([]);
//     }
//   };

//   const fetchImages = async () => {
//     if (!hasReadPermission) {
//       toast.error('You do not have permission to view images');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const res = await AxiosInstance.get('/api/images/v1/images/');
      
//       // Handle the response structure from your API
//       if (res?.data?.data && Array.isArray(res.data.data)) {
//         setImages(res.data.data);
//         setFilteredImages(res.data.data);
//       } else if (res?.data && Array.isArray(res.data)) {
//         setImages(res.data);
//         setFilteredImages(res.data);
//       } else {
//         console.error('Unexpected response structure:', res);
//         toast.error('Received unexpected data format from server');
//         setImages([]);
//         setFilteredImages([]);
//       }
//     } catch (error) {
//       console.error('Error occurred:', error);
//       if (error.response?.status === 403) {
//         toast.error('You do not have permission to view images');
//       } else {
//         toast.error(error.response?.data?.message || 'Error fetching images');
//       }
//       setImages([]);
//       setFilteredImages([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const deleteRecord = async (id) => {
//     if (!hasDeletePermission) {
//       toast.error('You do not have permission to delete images');
//       return;
//     }

//     if (!window.confirm('Are you sure you want to delete this image?')) {
//       return;
//     }

//     try {
//       const res = await AxiosInstance.delete(`/api/images/v1/images/?id=${id}`);
//       if (res) {
//         toast.success('Image deleted successfully!');
//         fetchImages();
//       }
//     } catch (error) {
//       console.error('Delete error:', error);
//       if (error.response?.status === 403) {
//         toast.error('You do not have permission to delete images');
//       } else {
//         toast.error(error.response?.data?.message || 'Error deleting image!');
//       }
//     }
//   };

//   const updateRecord = async (imgid) => {
//     if (!hasUpdatePermission) {
//       toast.error('You do not have permission to update images');
//       return;
//     }
//     const image = images.find(img => img.id === imgid);
//     if (image) {
//       setEditingImage(image);
//       setImageForm({
//         name: image.name || '',
//         description: image.description || '',
//         category: image.category || image.category_id || '',
//         image: null
//       });
//       setImageModalOpen(true);
//     }
//   };

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const handleAddImage = () => {
//     if (!hasCreatePermission) {
//       toast.error('You do not have permission to add images');
//       return;
//     }
//     setEditingImage(null);
//     setImageForm({ name: '', description: '', category: '', image: null });
//     setImageModalOpen(true);
//   };

//   const handleLimitChange = (e) => {
//     setItemsPerPage(parseInt(e.target.value));
//     setCurrentPage(1);
//   };

//   // Pagination calculations
//   const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentImages = filteredImages.slice(indexOfFirstItem, indexOfLastItem);

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   const saveImage = async (e) => {
//     e.preventDefault();
//     if (!imageForm.name.trim()) {
//       toast.error('Image name is required');
//       return;
//     }

//     setSaving(true);
//     try {
//       const formData = new FormData();
//       formData.append('name', imageForm.name.trim());
//       if (imageForm.description) formData.append('description', imageForm.description.trim());
//       if (imageForm.category) formData.append('category', imageForm.category);
//       if (imageForm.image) formData.append('image', imageForm.image);

//       if (editingImage) {
//         await AxiosInstance.patch(`/api/images/v1/images/?id=${editingImage.id}`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         toast.success('Image updated successfully');
//       } else {
//         await AxiosInstance.post('/api/images/v1/images/', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         toast.success('Image added successfully');
//       }

//       setImageModalOpen(false);
//       fetchImages();
//     } catch (error) {
//       console.error('Error saving image:', error);
//       toast.error(error.response?.data?.message || 'Error saving image');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const saveCategory = async (e) => {
//     e.preventDefault();
//     if (!categoryForm.name.trim()) {
//       toast.error('Category name is required');
//       return;
//     }

//     setSaving(true);
//     try {
//       const formData = new FormData();
//       formData.append('name', categoryForm.name.trim());
//       if (categoryForm.image) formData.append('image', categoryForm.image);

//       if (editingCategory) {
//         await AxiosInstance.patch(`/api/images/v1/categories/?id=${editingCategory.id}`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         toast.success('Category updated successfully');
//       } else {
//         await AxiosInstance.post('/api/images/v1/categories/', formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//         toast.success('Category added successfully');
//       }

//       setCategoryModalOpen(false);
//       fetchCategories();
//     } catch (error) {
//       console.error('Error saving category:', error);
//       toast.error(error.response?.data?.message || 'Error saving category');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const deleteCategory = async (id) => {
//     if (!window.confirm('Are you sure you want to delete this category?')) {
//       return;
//     }

//     try {
//       await AxiosInstance.delete(`/api/images/v1/categories/?id=${id}`);
//       toast.success('Category deleted successfully');
//       fetchCategories();
//     } catch (error) {
//       console.error('Error deleting category:', error);
//       toast.error(error.response?.data?.message || 'Error deleting category');
//     }
//   };

//   const handleAddCategory = () => {
//     setEditingCategory(null);
//     setCategoryForm({ name: '', image: null });
//     setCategoryModalOpen(true);
//   };

//   const handleEditCategory = (category) => {
//     setEditingCategory(category);
//     setCategoryForm({ name: category.name || '', image: null });
//     setCategoryModalOpen(true);
//   };

//   // Access denied screen
//   if (!hasReadPermission) {
//     return (
//       <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
//         <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center max-w-md">
//           <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
//             <Eye className="w-10 h-10 text-red-400" />
//           </div>
//           <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
//           <p className="text-slate-400 mb-6">
//             You don't have permission to view Images. Please contact your administrator.
//           </p>
//           <p className="text-xs text-slate-500 mb-6">
//             Required permission: READ_IMAGE
//           </p>
//           <button 
//             onClick={() => router.push('/')}
//             className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
//           >
//             Return to Dashboard
//           </button>
//         </div>
//         <ToastContainer 
//           position="top-right" 
//           autoClose={3000}
//           theme="dark"
//           className="mt-16"
//         />
//       </div>
//     );
//   }

//   return (
//     <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-auto">
//       <ToastContainer 
//         position="top-right" 
//         autoClose={3000}
//         theme="dark"
//         className="mt-16"
//       />
      
//       {/* Header Section */}
//       <div className="mb-8">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
//               Image Gallery
//             </h1>
//             <p className="text-slate-400 text-sm">Manage and organize your image collection</p>
//           </div>

//           <div className="flex items-center gap-3">
//             {hasCreatePermission && (
//               <button
//                 className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
//                 onClick={handleAddImage}
//               >
//                 <Plus className="w-5 h-5" />
//                 Add Images
//               </button>
//             )}
//             <button
//               className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-white px-6 py-3 rounded-xl font-semibold border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 hover:scale-105"
//               onClick={() => router.push('/ImagesCategoryPage')}
//             >
//               <Folder className="w-5 h-5" />
//               Categories
//             </button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-slate-400 text-sm font-medium">Total Images</span>
//               <ImageIcon className="w-5 h-5 text-blue-400" />
//             </div>
//             <p className="text-3xl font-bold text-white">{images.length}</p>
//           </div>
          
//           <div className="bg-gradient-to-br from-purple-900/20 to-purple-950/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-5 hover:border-purple-600/40 transition-all">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-slate-400 text-sm font-medium">Current Page</span>
//               <Grid3x3 className="w-5 h-5 text-purple-400" />
//             </div>
//             <p className="text-3xl font-bold text-purple-400">{currentPage} / {totalPages || 1}</p>
//           </div>

//           <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-5 hover:border-emerald-600/40 transition-all">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-slate-400 text-sm font-medium">Showing</span>
//               <Eye className="w-5 h-5 text-emerald-400" />
//             </div>
//             <p className="text-3xl font-bold text-emerald-400">{currentImages.length}</p>
//           </div>
//         </div>

//         {/* Search and Filters */}
//         <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
//           <div className="flex flex-wrap gap-4 items-center">
//             <div className="flex-1 min-w-[250px] relative">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
//               <input
//                 type="text"
//                 placeholder="Search by name, category, or description..."
//                 value={searchTerm}
//                 onChange={handleSearch}
//                 className="w-full pl-12 pr-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
//               />
//             </div>

//             <div className="flex items-center gap-2">
//               <Filter className="w-5 h-5 text-slate-400" />
//               <select
//                 value={itemsPerPage}
//                 onChange={handleLimitChange}
//                 className="px-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
//               >
//                 <option value="12">12 per page</option>
//                 <option value="24">24 per page</option>
//                 <option value="36">36 per page</option>
//                 <option value="48">48 per page</option>
//               </select>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Loading State */}
//       {isLoading && (
//         <div className="flex flex-col items-center justify-center py-20">
//           <div className="relative">
//             <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
//             <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
//           </div>
//           <p className="mt-6 text-slate-400 font-medium">Loading images...</p>
//         </div>
//       )}

//       {/* Images Grid - LUXURY DESIGN */}
//       {!isLoading && (
//         <>
//           {currentImages.length > 0 ? (
//             <>
//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
//                 {currentImages.map(item => (
//                   <div
//                     key={item.id}
//                     className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-2 border-slate-700/30 rounded-3xl overflow-hidden hover:border-amber-500/60 transition-all duration-700 hover:shadow-[0_20px_60px_-15px_rgba(251,191,36,0.3)] hover:-translate-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
//                   >
//                     {/* Luxury border frame */}
//                     <div className="absolute inset-0 rounded-3xl pointer-events-none">
//                       <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/40 rounded-tl-3xl"></div>
//                       <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-400/40 rounded-tr-3xl"></div>
//                       <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-400/40 rounded-bl-3xl"></div>
//                       <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/40 rounded-br-3xl"></div>
//                     </div>

//                     <div className="aspect-square relative overflow-hidden m-2 rounded-2xl">
//                       <Image
//                         src={item.image}
//                         alt={item.name}
//                         width={400}
//                         height={400}
//                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
//                         onError={(e) => {
//                           e.target.src = '/fallback-image.jpg';
//                         }}
//                       />
//                       {/* Luxury gradient overlay */}
//                       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                      
//                       {/* Gold shimmer effect */}
//                       <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
//                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
//                       </div>

//                       {/* Vignette effect */}
//                       <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]"></div>
//                     </div>
                    
//                     <div className="absolute inset-0 p-5 flex flex-col justify-between">
//                       {/* Top section - Category badge */}
//                       <div className="flex items-start justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0">
//                         <span className="px-4 py-2 bg-gradient-to-r from-amber-600/90 via-amber-500/90 to-yellow-600/90 backdrop-blur-xl text-white text-xs font-bold rounded-full border-2 border-amber-400/30 shadow-[0_4px_20px_rgba(251,191,36,0.4)] uppercase tracking-wider">
//                           {(() => {
//                             const category = categories.find(cat => cat.id === item.category);
//                             console.log('Image category ID:', item.category, 'Found category:', category, 'All categories:', categories);
//                             return category?.category || category?.name || item.category_name || 'Uncategorized';
//                           })()}
//                         </span>
//                       </div>

//                       {/* Bottom section - Title and Actions */}
//                       <div className="space-y-3">
//                         {/* Title with better visibility */}
//                         <div className="backdrop-blur-md rounded-2xl p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent border-b-2 border-amber-500/30">
//                           <h3 className="text-white font-bold text-base line-clamp-2 leading-tight mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" title={item.name}>
//                             {item.name}
//                           </h3>
//                           {item.description && (
//                             <p className="text-amber-200/90 text-xs mt-2 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
//                               {item.description}
//                             </p>
//                           )}
//                         </div>
                        
//                         {/* Action Buttons - Luxury Design */}
//                         {(hasUpdatePermission || hasDeletePermission) && (
//                           <div className="flex gap-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
//                             {hasUpdatePermission && (
//                               <button
//                                 onClick={(e) => { 
//                                   e.stopPropagation(); 
//                                   updateRecord(item.id); 
//                                 }}
//                                 className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-amber-400 hover:to-yellow-500 text-slate-900 font-bold rounded-xl shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:shadow-[0_6px_30px_rgba(251,191,36,0.6)] transition-all hover:scale-105 border-2 border-amber-400/30"
//                                 title="Edit Image"
//                               >
//                                 <Edit2 className="w-4 h-4" />
//                                 <span className="text-xs uppercase tracking-wide">Edit</span>
//                               </button>
//                             )}
//                             {hasDeletePermission && (
//                               <button
//                                 onClick={(e) => { 
//                                   e.stopPropagation(); 
//                                   deleteRecord(item.id); 
//                                 }}
//                                 className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_30px_rgba(239,68,68,0.4)] transition-all hover:scale-105 border-2 border-slate-500/30 hover:border-red-500/50"
//                                 title="Delete Image"
//                               >
//                                 <Trash2 className="w-4 h-4" />
//                                 <span className="text-xs uppercase tracking-wide">Delete</span>
//                               </button>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="flex justify-center items-center gap-2 mt-8 pb-6">
//                   <button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     disabled={currentPage === 1}
//                     className={`px-4 py-2 rounded-lg font-medium transition-all ${
//                       currentPage === 1
//                         ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
//                         : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
//                     }`}
//                   >
//                     Previous
//                   </button>

//                   <div className="flex gap-2">
//                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                       let pageNum;
//                       if (totalPages <= 5) {
//                         pageNum = i + 1;
//                       } else if (currentPage <= 3) {
//                         pageNum = i + 1;
//                       } else if (currentPage >= totalPages - 2) {
//                         pageNum = totalPages - 4 + i;
//                       } else {
//                         pageNum = currentPage - 2 + i;
//                       }

//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => handlePageChange(pageNum)}
//                           className={`w-10 h-10 rounded-lg font-medium transition-all ${
//                             currentPage === pageNum 
//                               ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
//                               : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
//                           }`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     disabled={currentPage === totalPages}
//                     className={`px-4 py-2 rounded-lg font-medium transition-all ${
//                       currentPage === totalPages
//                         ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
//                         : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
//                     }`}
//                   >
//                     Next
//                   </button>
//                 </div>
//               )}
//             </>
//           ) : (
//             <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
//               <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <ImageIcon className="w-10 h-10 text-slate-600" />
//               </div>
//               <h3 className="text-xl font-semibold text-white mb-2">
//                 {searchTerm ? 'No images found matching your search' : 'No images found'}
//               </h3>
//               <p className="text-slate-400 mb-6">
//                 {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first image'}
//               </p>
//               {hasCreatePermission && !searchTerm && (
//                 <button
//                   className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
//                   onClick={handleAddImage}
//                 >
//                   <Plus className="w-5 h-5" />
//                   Add Your First Image
//                 </button>
//               )}
//             </div>
//           )}
//         </>
//       )}

//       {/* Image Modal */}
//       {imageModalOpen && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
//             <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
//                     {editingImage ? 'Edit Image' : 'Add New Image'}
//                   </h2>
//                   <p className="text-slate-400 text-sm mt-1">
//                     {editingImage ? 'Update image details' : 'Upload a new image to your gallery'}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setImageModalOpen(false)}
//                   className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50 hover:border-slate-600/50"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={saveImage} className="p-6 space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-400 mb-2">
//                   Image Name <span className="text-red-400">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={imageForm.name}
//                   onChange={(e) => setImageForm({ ...imageForm, name: e.target.value })}
//                   placeholder="Enter image name"
//                   className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-400 mb-2">
//                   Description
//                 </label>
//                 <textarea
//                   value={imageForm.description}
//                   onChange={(e) => setImageForm({ ...imageForm, description: e.target.value })}
//                   placeholder="Enter image description"
//                   rows={3}
//                   className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500 resize-none"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-400 mb-2">
//                   Category
//                 </label>
//                 <select
//                   value={imageForm.category}
//                   onChange={(e) => setImageForm({ ...imageForm, category: e.target.value })}
//                   className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
//                 >
//                   <option value="">No category</option>
//                   {categories.map((cat) => (
//                     <option key={cat.id} value={cat.id}>{cat.category || cat.name}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-400 mb-2">
//                   Image File
//                 </label>
//                 <div className="flex items-center gap-4">
//                   <div className="w-20 h-20 rounded-xl bg-slate-900/50 border-2 border-dashed border-slate-700/50 flex items-center justify-center overflow-hidden">
//                     {imageForm.image ? (
//                       <img 
//                         src={URL.createObjectURL(imageForm.image)} 
//                         alt="Preview" 
//                         className="w-full h-full object-cover" 
//                       />
//                     ) : (
//                       <ImageIcon className="w-8 h-8 text-slate-600" />
//                     )}
//                   </div>
//                   <label className="cursor-pointer px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border-2 border-slate-700/50 hover:border-slate-600/50 rounded-xl transition-all">
//                     {imageForm.image ? 'Change Image' : 'Upload Image'}
//                     <input type="file" accept="image/*" onChange={(e) => setImageForm({ ...imageForm, image: e.target.files?.[0] || null })} className="hidden" />
//                   </label>
//                   {imageForm.image && (
//                     <button
//                       type="button"
//                       onClick={() => setImageForm({ ...imageForm, image: null })}
//                       className="text-red-400 hover:text-red-300 text-sm transition-colors"
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="flex gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setImageModalOpen(false)}
//                   className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-semibold border-2 border-slate-700/50 hover:border-slate-600/50 transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {saving ? 'Saving...' : (editingImage ? 'Update Image' : 'Add Image')}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Category Modal */}
//       {categoryModalOpen && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
//             <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
//                     {editingCategory ? 'Edit Category' : 'Add New Category'}
//                   </h2>
//                   <p className="text-slate-400 text-sm mt-1">
//                     {editingCategory ? 'Update category details' : 'Create a new image category'}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => setCategoryModalOpen(false)}
//                   className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50 hover:border-slate-600/50"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
//             </div>

//             <form onSubmit={saveCategory} className="p-6 space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-400 mb-2">
//                   Category Name <span className="text-red-400">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   value={categoryForm.name}
//                   onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
//                   placeholder="Enter category name"
//                   className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-400 mb-2">
//                   Category Image
//                 </label>
//                 <div className="flex items-center gap-4">
//                   <div className="w-20 h-20 rounded-xl bg-slate-900/50 border-2 border-dashed border-slate-700/50 flex items-center justify-center overflow-hidden">
//                     {categoryForm.image ? (
//                       <img 
//                         src={URL.createObjectURL(categoryForm.image)} 
//                         alt="Preview" 
//                         className="w-full h-full object-cover" 
//                       />
//                     ) : (
//                       <Folder className="w-8 h-8 text-slate-600" />
//                     )}
//                   </div>
//                   <label className="cursor-pointer px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border-2 border-slate-700/50 hover:border-slate-600/50 rounded-xl transition-all">
//                     {categoryForm.image ? 'Change Image' : 'Upload Image'}
//                     <input type="file" accept="image/*" onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.files?.[0] || null })} className="hidden" />
//                   </label>
//                   {categoryForm.image && (
//                     <button
//                       type="button"
//                       onClick={() => setCategoryForm({ ...categoryForm, image: null })}
//                       className="text-red-400 hover:text-red-300 text-sm transition-colors"
//                     >
//                       Remove
//                     </button>
//                   )}
//                 </div>
//               </div>

//               <div className="flex gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => setCategoryModalOpen(false)}
//                   className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-semibold border-2 border-slate-700/50 hover:border-slate-600/50 transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={saving}
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {saving ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
//                 </button>
//               </div>
//             </form>

//             {/* Categories List */}
//             <div className="p-6 pt-0">
//               <h3 className="text-lg font-semibold text-white mb-4">Existing Categories</h3>
//               <div className="space-y-3">
//                 {categories.map((cat) => (
//                   <div
//                     key={cat.id}
//                     className="flex items-center justify-between p-4 bg-slate-900/50 border-2 border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all"
//                   >
//                     <div className="flex items-center gap-3">
//                       {cat.image && (
//                         <img 
//                           src={cat.image} 
//                           alt={cat.name} 
//                           className="w-12 h-12 rounded-lg object-cover"
//                         />
//                       )}
//                       <span className="text-white font-medium">{cat.name}</span>
//                     </div>
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleEditCategory(cat)}
//                         className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg transition-all"
//                         title="Edit Category"
//                       >
//                         <Edit2 className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => deleteCategory(cat.id)}
//                         className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all"
//                         title="Delete Category"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//                 {categories.length === 0 && (
//                   <p className="text-slate-500 text-center py-4">No categories found</p>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ImagesCom;









'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';
import Image from 'next/image';
import { Search, Plus, Filter, Edit2, Trash2, ImageIcon, Folder, Grid3x3, Eye, X } from 'lucide-react';

const ImagesCom = () => {
  const router = useRouter();
  const { permissions = {} } = useContext(AuthContext);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editingImage, setEditingImage] = useState(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  // Form states
  const [imageForm, setImageForm] = useState({ name: '', description: '', category: '', image: null });
  const [categoryForm, setCategoryForm] = useState({ name: '', image: null });
  const [saving, setSaving] = useState(false);

  // Check for permissions
  const hasReadPermission = permissions.read_image || permissions.READ_IMAGE;
  const hasCreatePermission = permissions.create_image || permissions.CREATE_IMAGE;
  const hasUpdatePermission = permissions.update_image || permissions.UPDATE_IMAGE;
  const hasDeletePermission = permissions.delete_image || permissions.DELETE_IMAGE;

  useEffect(() => {
    if (hasReadPermission) {
      fetchImages();
    }
    fetchCategories();
  }, [hasReadPermission]);

  // Update filtered images when search term or images change
  useEffect(() => {
    if (searchTerm) {
      const filtered = images.filter(item => 
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredImages(filtered);
    } else {
      setFilteredImages(images);
    }
    setCurrentPage(1);
  }, [searchTerm, images]);

  const fetchCategories = async () => {
    try {
      const res = await AxiosInstance.get('/api/images/v1/dropdown/categories/');
      console.log('Categories response:', res.data);
      if (res?.data?.data && Array.isArray(res.data.data)) {
        setCategories(res.data.data);
      } else if (res?.data && Array.isArray(res.data)) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchImages = async () => {
    if (!hasReadPermission) {
      toast.error('You do not have permission to view images');
      return;
    }

    setIsLoading(true);
    try {
      const res = await AxiosInstance.get('/api/images/v1/images/');
      
      if (res?.data?.data && Array.isArray(res.data.data)) {
        setImages(res.data.data);
        setFilteredImages(res.data.data);
      } else if (res?.data && Array.isArray(res.data)) {
        setImages(res.data);
        setFilteredImages(res.data);
      } else {
        console.error('Unexpected response structure:', res);
        toast.error('Received unexpected data format from server');
        setImages([]);
        setFilteredImages([]);
      }
    } catch (error) {
      console.error('Error occurred:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view images');
      } else {
        toast.error(error.response?.data?.message || 'Error fetching images');
      }
      setImages([]);
      setFilteredImages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecord = async (id) => {
    if (!hasDeletePermission) {
      toast.error('You do not have permission to delete images');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const res = await AxiosInstance.delete(`/api/images/v1/images/?id=${id}`);
      if (res) {
        toast.success('Image deleted successfully!');
        fetchImages();
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to delete images');
      } else {
        toast.error(error.response?.data?.message || 'Error deleting image!');
      }
    }
  };

  // FIXED: Update record function with proper category handling
  const updateRecord = async (imgid) => {
    if (!hasUpdatePermission) {
      toast.error('You do not have permission to update images');
      return;
    }
    const image = images.find(img => img.id === imgid);
    if (image) {
      setEditingImage(image);
      setImageForm({
        name: image.name || '',
        description: image.description || '',
        category: image.category ? image.category.toString() : '', // Ensure category is a string for select
        image: null // Keep null for file input
      });
      setImageModalOpen(true);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleAddImage = () => {
    if (!hasCreatePermission) {
      toast.error('You do not have permission to add images');
      return;
    }
    setEditingImage(null);
    setImageForm({ name: '', description: '', category: '', image: null });
    setImageModalOpen(true);
  };

  const handleLimitChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentImages = filteredImages.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const saveImage = async (e) => {
    e.preventDefault();
    if (!imageForm.name.trim()) {
      toast.error('Image name is required');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', imageForm.name.trim());
      if (imageForm.description) formData.append('description', imageForm.description.trim());
      if (imageForm.category) formData.append('category', imageForm.category);
      if (imageForm.image) formData.append('image', imageForm.image);

      if (editingImage) {
        await AxiosInstance.patch(`/api/images/v1/images/?id=${editingImage.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Image updated successfully');
      } else {
        await AxiosInstance.post('/api/images/v1/images/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Image added successfully');
      }

      setImageModalOpen(false);
      fetchImages();
    } catch (error) {
      console.error('Error saving image:', error);
      toast.error(error.response?.data?.message || 'Error saving image');
    } finally {
      setSaving(false);
    }
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', categoryForm.name.trim());
      if (categoryForm.image) formData.append('image', categoryForm.image);

      if (editingCategory) {
        await AxiosInstance.patch(`/api/images/v1/categories/?id=${editingCategory.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Category updated successfully');
      } else {
        await AxiosInstance.post('/api/images/v1/categories/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Category added successfully');
      }

      setCategoryModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 'Error saving category');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await AxiosInstance.delete(`/api/images/v1/categories/?id=${id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Error deleting category');
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', image: null });
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({ name: category.name || '', image: null });
    setCategoryModalOpen(true);
  };

  // FIXED: Helper function to get category name
  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'Uncategorized';
    // Try to find category by ID (as number or string)
    const category = categories.find(cat => {
      const catId = cat.id?.toString() || cat.category_id?.toString();
      const itemCategoryId = categoryId?.toString();
      return catId === itemCategoryId;
    });
    // Return the category name from various possible fields
    return category?.category || category?.name || category?.category_name || 'Uncategorized';
  };

  // Access denied screen
  if (!hasReadPermission) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Eye className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-slate-400 mb-6">
            You don't have permission to view Images. Please contact your administrator.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Required permission: READ_IMAGE
          </p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
          >
            Return to Dashboard
          </button>
        </div>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme="dark"
          className="mt-16"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-auto">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="dark"
        className="mt-16"
      />
      
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Image Gallery
            </h1>
            <p className="text-slate-400 text-sm">Manage and organize your image collection</p>
          </div>

          <div className="flex items-center gap-3">
            {hasCreatePermission && (
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                onClick={handleAddImage}
              >
                <Plus className="w-5 h-5" />
                Add Images
              </button>
            )}
            <button
              className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-white px-6 py-3 rounded-xl font-semibold border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 hover:scale-105"
              onClick={() => router.push('/ImagesCategoryPage')}
            >
              <Folder className="w-5 h-5" />
              Categories
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Images</span>
              <ImageIcon className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{images.length}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-950/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-5 hover:border-purple-600/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Current Page</span>
              <Grid3x3 className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">{currentPage} / {totalPages || 1}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-5 hover:border-emerald-600/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Showing</span>
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">{currentImages.length}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, category, or description..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={itemsPerPage}
                onChange={handleLimitChange}
                className="px-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
              >
                <option value="12">12 per page</option>
                <option value="24">24 per page</option>
                <option value="36">36 per page</option>
                <option value="48">48 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-slate-400 font-medium">Loading images...</p>
        </div>
      )}

      {/* Images Grid - LUXURY DESIGN */}
      {!isLoading && (
        <>
          {currentImages.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentImages.map(item => (
                  <div
                    key={item.id}
                    className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-2 border-slate-700/30 rounded-3xl overflow-hidden hover:border-amber-500/60 transition-all duration-700 hover:shadow-[0_20px_60px_-15px_rgba(251,191,36,0.3)] hover:-translate-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.5)]"
                  >
                    {/* Luxury border frame */}
                    <div className="absolute inset-0 rounded-3xl pointer-events-none">
                      <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/40 rounded-tl-3xl"></div>
                      <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-400/40 rounded-tr-3xl"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-400/40 rounded-bl-3xl"></div>
                      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/40 rounded-br-3xl"></div>
                    </div>

                    <div className="aspect-square relative overflow-hidden m-2 rounded-2xl">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                        onError={(e) => {
                          e.target.src = '/fallback-image.jpg';
                        }}
                      />
                      {/* Luxury gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
                      
                      {/* Gold shimmer effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
                      </div>

                      {/* Vignette effect */}
                      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]"></div>
                    </div>
                    
                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                      {/* Top section - Category badge - FIXED */}
                      <div className="flex items-start justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0">
                        <span className="px-4 py-2 bg-gradient-to-r from-amber-600/90 via-amber-500/90 to-yellow-600/90 backdrop-blur-xl text-white text-xs font-bold rounded-full border-2 border-amber-400/30 shadow-[0_4px_20px_rgba(251,191,36,0.4)] uppercase tracking-wider">
                          {getCategoryName(item.category)}
                        </span>
                      </div>

                      {/* Bottom section - Title and Actions */}
                      <div className="space-y-3">
                        {/* Title with better visibility */}
                        <div className="backdrop-blur-md rounded-2xl p-4 bg-gradient-to-t from-black/60 via-black/30 to-transparent border-b-2 border-amber-500/30">
                          <h3 className="text-white font-bold text-base line-clamp-2 leading-tight mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" title={item.name}>
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-amber-200/90 text-xs mt-2 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                              {item.description}
                            </p>
                          )}
                        </div>
                        
                        {/* Action Buttons - Luxury Design */}
                        {(hasUpdatePermission || hasDeletePermission) && (
                          <div className="flex gap-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                            {hasUpdatePermission && (
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  updateRecord(item.id); 
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-amber-400 hover:to-yellow-500 text-slate-900 font-bold rounded-xl shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:shadow-[0_6px_30px_rgba(251,191,36,0.6)] transition-all hover:scale-105 border-2 border-amber-400/30"
                                title="Edit Image"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-wide">Edit</span>
                              </button>
                            )}
                            {hasDeletePermission && (
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  deleteRecord(item.id); 
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_30px_rgba(239,68,68,0.4)] transition-all hover:scale-105 border-2 border-slate-500/30 hover:border-red-500/50"
                                title="Delete Image"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-wide">Delete</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pb-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === 1
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === pageNum 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === totalPages
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? 'No images found matching your search' : 'No images found'}
              </h3>
              <p className="text-slate-400 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first image'}
              </p>
              {hasCreatePermission && !searchTerm && (
                <button
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                  onClick={handleAddImage}
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Image
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Image Modal - FIXED with category selection and image preview */}
      {imageModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {editingImage ? 'Edit Image' : 'Add New Image'}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {editingImage ? 'Update image details' : 'Upload a new image to your gallery'}
                  </p>
                </div>
                <button
                  onClick={() => setImageModalOpen(false)}
                  className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50 hover:border-slate-600/50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={saveImage} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Image Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={imageForm.name}
                  onChange={(e) => setImageForm({ ...imageForm, name: e.target.value })}
                  placeholder="Enter image name"
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Description
                </label>
                <textarea
                  value={imageForm.description}
                  onChange={(e) => setImageForm({ ...imageForm, description: e.target.value })}
                  placeholder="Enter image description"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500 resize-none"
                />
              </div>

              {/* FIXED: Category dropdown with proper value and label */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Category <span className="text-slate-500 text-xs">(Select a category)</span>
                </label>
                <select
                  value={imageForm.category}
                  onChange={(e) => setImageForm({ ...imageForm, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category || cat.name || cat.category_name || 'Unnamed Category'}
                    </option>
                  ))}
                </select>
                {imageForm.category && (
                  <p className="text-xs text-green-400 mt-1">
                    Selected: {getCategoryName(parseInt(imageForm.category))}
                  </p>
                )}
              </div>

              {/* FIXED: Image upload with preview for editing */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Image File {editingImage && <span className="text-xs text-slate-500">(Leave empty to keep current image)</span>}
                </label>
                <div className="flex items-center gap-4">
                  {/* Show current image when editing */}
                  {editingImage && !imageForm.image && (
                    <div className="w-20 h-20 rounded-xl bg-slate-900/50 border-2 border-slate-700/50 flex items-center justify-center overflow-hidden">
                      <img 
                        src={editingImage.image} 
                        alt="Current image" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  {/* Show preview of new image */}
                  {imageForm.image && (
                    <div className="w-20 h-20 rounded-xl bg-slate-900/50 border-2 border-slate-700/50 flex items-center justify-center overflow-hidden">
                      <img 
                        src={URL.createObjectURL(imageForm.image)} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  {/* Show placeholder if no image */}
                  {!editingImage && !imageForm.image && (
                    <div className="w-20 h-20 rounded-xl bg-slate-900/50 border-2 border-dashed border-slate-700/50 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-slate-600" />
                    </div>
                  )}
                  <label className="cursor-pointer px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border-2 border-slate-700/50 hover:border-slate-600/50 rounded-xl transition-all">
                    {imageForm.image ? 'Change Image' : editingImage ? 'Change Image' : 'Upload Image'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setImageForm({ ...imageForm, image: file });
                      }} 
                      className="hidden" 
                    />
                  </label>
                  {imageForm.image && (
                    <button
                      type="button"
                      onClick={() => setImageForm({ ...imageForm, image: null })}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Remove
                    </button>
                  )}
                  {editingImage && !imageForm.image && (
                    <span className="text-xs text-slate-500">Current image will be kept</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setImageModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-semibold border-2 border-slate-700/50 hover:border-slate-600/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : (editingImage ? 'Update Image' : 'Add Image')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {categoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {editingCategory ? 'Update category details' : 'Create a new image category'}
                  </p>
                </div>
                <button
                  onClick={() => setCategoryModalOpen(false)}
                  className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/50 hover:border-slate-600/50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={saveCategory} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="Enter category name"
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Category Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-900/50 border-2 border-dashed border-slate-700/50 flex items-center justify-center overflow-hidden">
                    {categoryForm.image ? (
                      <img 
                        src={URL.createObjectURL(categoryForm.image)} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Folder className="w-8 h-8 text-slate-600" />
                    )}
                  </div>
                  <label className="cursor-pointer px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border-2 border-slate-700/50 hover:border-slate-600/50 rounded-xl transition-all">
                    {categoryForm.image ? 'Change Image' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.files?.[0] || null })} className="hidden" />
                  </label>
                  {categoryForm.image && (
                    <button
                      type="button"
                      onClick={() => setCategoryForm({ ...categoryForm, image: null })}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-semibold border-2 border-slate-700/50 hover:border-slate-600/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
                </button>
              </div>
            </form>

            {/* Categories List */}
            <div className="p-6 pt-0">
              <h3 className="text-lg font-semibold text-white mb-4">Existing Categories</h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-4 bg-slate-900/50 border-2 border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      {cat.image && (
                        <img 
                          src={cat.image} 
                          alt={cat.name} 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <span className="text-white font-medium">{cat.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCategory(cat)}
                        className="p-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg transition-all"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-slate-500 text-center py-4">No categories found</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesCom;