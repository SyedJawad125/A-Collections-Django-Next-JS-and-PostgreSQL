// 'use client';
// import React, { useEffect, useState, useContext } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/components/AuthContext';

// const AdminReviews = () => {
//   const router = useRouter();
//   const { permissions = {} } = useContext(AuthContext);
//   const [reviews, setReviews] = useState([]);
//   const [filteredReviews, setFilteredReviews] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [refreshKey, setRefreshKey] = useState(false);
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     limit: 10,
//     offset: 0,
//     totalPages: 1,
//     count: 0,
//     hasNext: false,
//     hasPrevious: false
//   });

//   useEffect(() => {
//     const fetchReviews = async () => {
//       try {
//         setIsLoading(true);
//         const { currentPage, limit, offset } = pagination;
        
//         // Updated API endpoint
//         const res = await AxiosInstance.get(
//           `/api/myapp/v1/review/?page=${currentPage}&limit=${limit}&offset=${offset}`
//         );
        
//         const responseData = res?.data;
        
//         if (responseData?.message === 'Successful') {
//           setReviews(responseData.data || []);
//           setFilteredReviews(responseData.data || []);
//           setPagination(prev => ({
//             ...prev,
//             count: responseData?.count || 0,
//             totalPages: Math.ceil((responseData?.count || 0) / limit),
//             hasNext: (responseData?.count || 0) > (currentPage * limit),
//             hasPrevious: currentPage > 1
//           }));
//         } else {
//           toast.error(responseData?.message || 'Failed to load reviews', {
//             position: "top-center",
//             autoClose: 2000,
//             hideProgressBar: true,
//             closeOnClick: true,
//             pauseOnHover: true,
//             draggable: true,
//             progress: undefined,
//             theme: "dark",
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching reviews:', error);
//         toast.error('Failed to load reviews', {
//           position: "top-center",
//           autoClose: 2000,
//           hideProgressBar: true,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           progress: undefined,
//           theme: "dark",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchReviews();
//   }, [refreshKey, pagination.currentPage, pagination.limit, pagination.offset]);

//   const deleteReview = async (id) => {
//     try {
//       // Updated API endpoint
//       await AxiosInstance.delete(`/api/myapp/v1/review/?id=${id}`);
//       setRefreshKey(prev => !prev);
//       toast.success('Review deleted successfully', {
//         position: "top-center",
//         autoClose: 2000,
//         hideProgressBar: true,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "dark",
//       });
//     } catch (error) {
//       toast.error('Error deleting review', {
//         position: "top-center",
//         autoClose: 2000,
//         hideProgressBar: true,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "dark",
//       });
//     }
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);

//     const filtered = reviews.filter((review) => {
//       const idMatch = review.id.toString() === value;
//       const nameMatch = review.name?.toLowerCase().includes(value) || 
//                        review.author_name?.toLowerCase().includes(value);
//       const commentMatch = review.comment?.toLowerCase().includes(value);
//       const ratingMatch = review.rating.toString().includes(value);
//       const productMatch = review.item_name?.toLowerCase().includes(value) || 
//                           review.item_data?.name?.toLowerCase().includes(value);
//       const typeMatch = review.item_type?.toLowerCase().includes(value);
//       const emailMatch = review.email?.toLowerCase().includes(value) || 
//                         review.author_email?.toLowerCase().includes(value);
      
//       return idMatch || nameMatch || commentMatch || ratingMatch || productMatch || typeMatch || emailMatch;
//     });

//     setFilteredReviews(filtered);
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= pagination.totalPages) {
//       setPagination(prev => ({ ...prev, currentPage: newPage }));
//     }
//   };

//   const handleLimitChange = (e) => {
//     const newLimit = parseInt(e.target.value);
//     setPagination(prev => ({ 
//       ...prev, 
//       limit: newLimit,
//       currentPage: 1,
//       offset: 0
//     }));
//   };

//   const handleOffsetChange = (e) => {
//     const newOffset = Math.max(0, parseInt(e.target.value)) || 0;
//     setPagination(prev => ({ 
//       ...prev, 
//       offset: newOffset,
//       currentPage: 1
//     }));
//   };

//   const renderStars = (rating) => {
//     return (
//       <div className="flex">
//         {[...Array(5)].map((_, i) => (
//           <svg
//             key={i}
//             className={`w-5 h-5 ${i < rating ? 'text-amber-400' : 'text-gray-400'}`}
//             fill="currentColor"
//             viewBox="0 0 20 20"
//           >
//             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//           </svg>
//         ))}
//       </div>
//     );
//   };

//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const updateRecord = async (reviewid) => {
//     router.push(`/adminupdatereview?reviewid=${reviewid}`);
//   };

//   const getProductTypeBadge = (type) => {
//     const typeMap = {
//       'product': { color: 'bg-blue-500/20 text-blue-400', label: 'Product' },
//       'sales_product': { color: 'bg-purple-500/20 text-purple-400', label: 'Sale' }
//     };
    
//     const typeInfo = typeMap[type] || { color: 'bg-gray-500/20 text-gray-400', label: type };
    
//     return (
//       <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
//         {typeInfo.label}
//       </span>
//     );
//   };

//   if (!permissions.read_reviews) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
//         <div className="text-center p-8 max-w-md">
//           <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
//           <p className="text-gray-300 mb-6">
//             You don't have permission to view Reviews. Please contact your administrator.
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
      
//       <div className="max-w-7xl mx-auto">
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
//           <div>
//             <h1 className="text-4xl font-light text-white mb-2">Customer Reviews</h1>
//             <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mb-1"></div>
//             <p className="text-gray-400 text-sm">What customers are saying about your products</p>
//           </div>
//         </div>
        
//         {/* Stats and Search */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-gray-800/50 p-4 rounded-xl gap-4">
//           {permissions.create_reviews && (
//             <button
//               className="px-6 py-3 bg-transparent border border-amber-500 text-amber-500 font-medium text-sm leading-tight uppercase rounded-full hover:bg-amber-500 hover:text-black focus:outline-none focus:ring-0 transition duration-150 ease-in-out transform hover:scale-105 flex items-center"
//               onClick={() => router.push('/adminaddreview')}
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
//               </svg>
//               Add Review
//             </button>
//           )}

//           <div className="text-amber-400 font-light">
//             Showing {filteredReviews.length} of {pagination.count} reviews
//             {pagination.offset > 0 && ` (offset: ${pagination.offset})`}
//           </div>
          
//           <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
//             <div className="relative w-full">
//               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                 <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
//                 </svg>
//               </div>
//               <input
//                 type="text"
//                 placeholder="Search by name, email, comment, rating or product..."
//                 value={searchTerm}
//                 onChange={handleSearch}
//                 className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 transition duration-300"
//               />
//             </div>
            
//             <div className="flex gap-2 items-center">
//               <select 
//                 value={pagination.limit}
//                 onChange={handleLimitChange}
//                 className="bg-gray-700 text-white rounded-full px-3 py-2 border border-gray-600 focus:outline-none focus:ring-amber-500"
//               >
//                 <option value="10">10 per page</option>
//                 <option value="20">20 per page</option>
//                 <option value="30">30 per page</option>
//                 <option value="50">50 per page</option>
//               </select>
              
//               <input
//                 type="number"
//                 value={pagination.offset}
//                 onChange={handleOffsetChange}
//                 min="0"
//                 max={pagination.count}
//                 placeholder="Offset"
//                 className="bg-gray-700 text-white rounded-full px-3 py-2 w-20 border border-gray-600 focus:outline-none focus:ring-amber-500"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Loading State */}
//         {isLoading && (
//           <div className="space-y-6">
//             {[...Array(pagination.limit)].map((_, index) => (
//               <div key={index} className="animate-pulse bg-gray-800 rounded-xl p-6">
//                 <div className="flex items-center space-x-4 mb-4">
//                   <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
//                   <div className="space-y-2">
//                     <div className="h-4 bg-gray-700 rounded w-32"></div>
//                     <div className="h-3 bg-gray-700 rounded w-24"></div>
//                   </div>
//                 </div>
//                 <div className="h-4 bg-gray-700 rounded w-16 mb-4"></div>
//                 <div className="space-y-2">
//                   <div className="h-3 bg-gray-700 rounded w-full"></div>
//                   <div className="h-3 bg-gray-700 rounded w-5/6"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Reviews List */}
//         {!isLoading && (
//           <>
//             {filteredReviews.length > 0 ? (
//               <div className="space-y-6">
//                 {filteredReviews.map((review) => (
//                   <div 
//                     key={review.id} 
//                     className="bg-gray-800/50 rounded-xl p-6 shadow-lg hover:shadow-amber-500/10 transition-shadow duration-300"
//                   >
//                     <div className="flex justify-between items-start">
//                       <div className="flex items-start space-x-4 mb-4">
//                         <div className="bg-amber-500/20 h-10 w-10 rounded-full flex items-center justify-center text-amber-400 font-medium">
//                           {review.author_name?.charAt(0) || 
//                            review.name?.charAt(0) || 
//                            'A'}
//                         </div>
//                         <div>
//                           <h3 className="text-white font-medium">
//                             {review.author_name || review.name || 'Anonymous'}
//                             {review.can_edit && (
//                               <span className="ml-2 text-xs text-green-400 bg-green-400/20 px-2 py-0.5 rounded-full">
//                                 Editable
//                               </span>
//                             )}
//                           </h3>
//                           <p className="text-gray-400 text-sm">{formatDate(review.created_at)}</p>
//                           {(review.author_email || review.email) && (
//                             <p className="text-gray-400 text-sm">
//                               <a 
//                                 href={`mailto:${review.author_email || review.email}`} 
//                                 className="hover:text-amber-400 transition-colors"
//                               >
//                                 {review.author_email || review.email}
//                               </a>
//                             </p>
//                           )}
//                         </div>
//                       </div>
                      
//                       <div className="flex items-center gap-2">
//                         {review.item_data && (
//                           <>
//                             {getProductTypeBadge(review.item_type)}
//                             <div className="text-sm text-gray-300">
//                               ID: {review.item_data.id} • {review.item_name || review.item_data.name}
//                               {review.item_data.discount_percent > 0 && (
//                                 <span className="ml-2 text-purple-300">
//                                   {review.item_data.discount_percent}% off
//                                 </span>
//                               )}
//                             </div>
//                             <div className="text-sm text-amber-400 ml-2">
//                               ${review.item_data.final_price || review.item_data.price}
//                               {review.item_data.original_price && review.item_data.original_price > (review.item_data.final_price || review.item_data.price) && (
//                                 <span className="text-gray-400 line-through ml-1">
//                                   ${review.item_data.original_price}
//                                 </span>
//                               )}
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     </div>
                    
//                     <div className="mb-4">
//                       {renderStars(review.rating)}
//                     </div>
                    
//                     <p className="text-gray-300 mb-4">{review.comment}</p>
                    
//                     <div className="flex justify-between items-center">
//                       <div className="text-xs text-gray-500">
//                         Review ID: {review.id} • User ID: {review.user || 'Anonymous'}
//                       </div>
                      
//                       <div className="flex space-x-3">
//                         {permissions.delete_reviews && review.can_delete && (
//                           <button
//                             onClick={() => deleteReview(review.id)}
//                             className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-red-600/30 to-red-700/20 border border-red-500/30 text-red-300 rounded-lg hover:from-red-600/40 hover:to-red-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
//                           >
//                             <span className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                             </svg>
//                             <span className="relative z-10 font-medium">Delete</span>
//                             <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-400 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
//                           </button>
//                         )}

//                         {permissions.update_reviews && review.can_edit && (
//                           <button
//                             onClick={() => updateRecord(review.id)}
//                             className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-amber-600/30 to-amber-700/20 border border-amber-500/30 text-amber-300 rounded-lg hover:from-amber-600/40 hover:to-amber-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
//                           >
//                             <span className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                             </svg>
//                             <span className="relative z-10 font-medium">Edit</span>
//                             <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-20">
//                 <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
//                   <svg className="h-12 w-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                   </svg>
//                 </div>
//                 <h3 className="text-2xl font-light text-white mb-2">No reviews found</h3>
//                 <p className="text-gray-400 max-w-md mx-auto">We couldn't find any reviews matching your search.</p>
//               </div>
//             )}
//           </>
//         )}

//         {/* Enhanced Pagination */}
//         {pagination.totalPages > 1 && (
//           <div className="flex flex-col md:flex-row justify-between items-center mt-16 gap-4">
//             <div className="text-gray-400 text-sm">
//               Page {pagination.currentPage} of {pagination.totalPages} • Total {pagination.count} reviews
//             </div>
            
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => handlePageChange(1)}
//                 disabled={pagination.currentPage === 1}
//                 className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 aria-label="First page"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
//                 </svg>
//               </button>
              
//               <button
//                 onClick={() => handlePageChange(pagination.currentPage - 1)}
//                 disabled={!pagination.hasPrevious}
//                 className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 aria-label="Previous page"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
//                 </svg>
//               </button>
              
//               <div className="flex items-center gap-1">
//                 {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
//                   let pageNum;
//                   if (pagination.totalPages <= 5) {
//                     pageNum = i + 1;
//                   } else if (pagination.currentPage <= 3) {
//                     pageNum = i + 1;
//                   } else if (pagination.currentPage >= pagination.totalPages - 2) {
//                     pageNum = pagination.totalPages - 4 + i;
//                   } else {
//                     pageNum = pagination.currentPage - 2 + i;
//                   }
                  
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => handlePageChange(pageNum)}
//                       className={`w-8 h-8 rounded-full text-sm transition-colors ${
//                         pagination.currentPage === pageNum
//                           ? 'bg-amber-600 text-white'
//                           : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
//                       }`}
//                       aria-label={`Page ${pageNum}`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
//               </div>
              
//               <button
//                 onClick={() => handlePageChange(pagination.currentPage + 1)}
//                 disabled={!pagination.hasNext}
//                 className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 aria-label="Next page"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                 </svg>
//               </button>
              
//               <button
//                 onClick={() => handlePageChange(pagination.totalPages)}
//                 disabled={pagination.currentPage === pagination.totalPages}
//                 className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 aria-label="Last page"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                   <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminReviews;



'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

const AdminReviews = () => {
  const router = useRouter();
  const { permissions = {} } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    offset: 0,
    totalPages: 1,
    count: 0,
    hasNext: false,
    hasPrevious: false
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const { currentPage, limit, offset } = pagination;
        
        const res = await AxiosInstance.get(
          `/api/myapp/v1/review/?page=${currentPage}&limit=${limit}&offset=${offset}`
        );
        
        const responseData = res?.data;
        
        // Backend returns message: "Successful" for list endpoint
        if (responseData?.message === 'Successful') {
          setReviews(responseData.data || []);
          setFilteredReviews(responseData.data || []);
          setPagination(prev => ({
            ...prev,
            count: responseData?.count || 0,
            totalPages: Math.ceil((responseData?.count || 0) / limit),
            hasNext: (responseData?.count || 0) > (currentPage * limit),
            hasPrevious: currentPage > 1
          }));
        } else {
          toast.error(responseData?.message || 'Failed to load reviews', {
            position: "top-center",
            autoClose: 2000,
            theme: "dark",
          });
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Failed to load reviews', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [refreshKey, pagination.currentPage, pagination.limit, pagination.offset]);

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      const res = await AxiosInstance.delete(`/api/myapp/v1/review/?id=${id}`);
      
      // Backend returns status: 'SUCCESS' or 'ERROR'
      if (res?.data?.status === 'SUCCESS') {
        setRefreshKey(prev => !prev);
        toast.success(res.data.message || 'Review deleted successfully', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
      } else {
        toast.error(res?.data?.message || 'Error deleting review', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || 'You can only delete your own reviews';
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = reviews.filter((review) => {
      const idMatch = review.id.toString() === value;
      const nameMatch = review.name?.toLowerCase().includes(value) || 
                       review.author_name?.toLowerCase().includes(value);
      const commentMatch = review.comment?.toLowerCase().includes(value);
      const ratingMatch = review.rating.toString().includes(value);
      const productMatch = review.item_name?.toLowerCase().includes(value) || 
                          review.item_data?.name?.toLowerCase().includes(value);
      const typeMatch = review.item_type?.toLowerCase().includes(value);
      const emailMatch = review.email?.toLowerCase().includes(value) || 
                        review.author_email?.toLowerCase().includes(value);
      
      return idMatch || nameMatch || commentMatch || ratingMatch || productMatch || typeMatch || emailMatch;
    });

    setFilteredReviews(filtered);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit,
      currentPage: 1,
      offset: 0
    }));
  };

  const handleOffsetChange = (e) => {
    const newOffset = Math.max(0, parseInt(e.target.value)) || 0;
    setPagination(prev => ({ 
      ...prev, 
      offset: newOffset,
      currentPage: 1
    }));
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-5 h-5 ${i < rating ? 'text-amber-400' : 'text-gray-400'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const updateRecord = (reviewid) => {
    router.push(`/adminupdatereview?reviewid=${reviewid}`);
  };

  const getProductTypeBadge = (type) => {
    const typeMap = {
      'product': { color: 'bg-blue-500/20 text-blue-400', label: 'Product' },
      'sales_product': { color: 'bg-purple-500/20 text-purple-400', label: 'Sale' }
    };
    
    const typeInfo = typeMap[type] || { color: 'bg-gray-500/20 text-gray-400', label: type };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  // Backend enforces read_reviews permission
  if (permissions.read_reviews === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">
            You don't have permission to view Reviews. Please contact your administrator.
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
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-4xl font-light text-white mb-2">Customer Reviews</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mb-1"></div>
            <p className="text-gray-400 text-sm">What customers are saying about your products</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-gray-800/50 p-4 rounded-xl gap-4">
          {permissions.create_reviews && (
            <button
              className="px-6 py-3 bg-transparent border border-amber-500 text-amber-500 font-medium text-sm leading-tight uppercase rounded-full hover:bg-amber-500 hover:text-black focus:outline-none focus:ring-0 transition duration-150 ease-in-out transform hover:scale-105 flex items-center"
              onClick={() => router.push('/adminaddreview')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Review
            </button>
          )}

          <div className="text-amber-400 font-light">
            Showing {filteredReviews.length} of {pagination.count} reviews
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, email, comment, rating or product..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 transition duration-300"
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <select 
                value={pagination.limit}
                onChange={handleLimitChange}
                className="bg-gray-700 text-white rounded-full px-3 py-2 border border-gray-600 focus:outline-none focus:ring-amber-500"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="30">30 per page</option>
                <option value="50">50 per page</option>
              </select>
              
              <input
                type="number"
                value={pagination.offset}
                onChange={handleOffsetChange}
                min="0"
                max={pagination.count}
                placeholder="Offset"
                className="bg-gray-700 text-white rounded-full px-3 py-2 w-20 border border-gray-600 focus:outline-none focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="space-y-6">
            {[...Array(pagination.limit)].map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-700 rounded w-16 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <>
            {filteredReviews.length > 0 ? (
              <div className="space-y-6">
                {filteredReviews.map((review) => (
                  <div 
                    key={review.id} 
                    className="bg-gray-800/50 rounded-xl p-6 shadow-lg hover:shadow-amber-500/10 transition-shadow duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="bg-amber-500/20 h-10 w-10 rounded-full flex items-center justify-center text-amber-400 font-medium">
                          {review.author_name?.charAt(0) || review.name?.charAt(0) || 'A'}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">
                            {review.author_name || review.name || 'Anonymous'}
                            {review.can_edit && (
                              <span className="ml-2 text-xs text-green-400 bg-green-400/20 px-2 py-0.5 rounded-full">
                                Editable
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-400 text-sm">{formatDate(review.created_at)}</p>
                          {(review.author_email || review.email) && (
                            <p className="text-gray-400 text-sm">
                              <a 
                                href={`mailto:${review.author_email || review.email}`} 
                                className="hover:text-amber-400 transition-colors"
                              >
                                {review.author_email || review.email}
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {review.item_data && (
                          <>
                            {getProductTypeBadge(review.item_type)}
                            <div className="text-sm text-gray-300">
                              ID: {review.item_data.id} • {review.item_name || review.item_data.name}
                              {review.item_data.discount_percent > 0 && (
                                <span className="ml-2 text-purple-300">
                                  {review.item_data.discount_percent}% off
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-amber-400 ml-2">
                              ${review.item_data.final_price || review.item_data.price}
                              {review.item_data.original_price && review.item_data.original_price > (review.item_data.final_price || review.item_data.price) && (
                                <span className="text-gray-400 line-through ml-1">
                                  ${review.item_data.original_price}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      {renderStars(review.rating)}
                    </div>
                    
                    <p className="text-gray-300 mb-4">{review.comment}</p>
                    
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <div className="text-xs text-gray-500">
                        Review ID: {review.id} • User ID: {review.user || 'Anonymous'}
                      </div>
                      
                      <div className="flex space-x-3">
                        {/* Backend checks: delete_reviews permission + ownership (can_delete) */}
                        {permissions.delete_reviews && review.can_delete && (
                          <button
                            onClick={() => deleteReview(review.id)}
                            className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-red-600/30 to-red-700/20 border border-red-500/30 text-red-300 rounded-lg hover:from-red-600/40 hover:to-red-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="relative z-10 font-medium">Delete</span>
                          </button>
                        )}

                        {/* Backend checks: update_reviews permission + ownership (can_edit) */}
                        {permissions.update_reviews && (
                          <button
                            onClick={() => updateRecord(review.id)}
                            className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-amber-600/30 to-amber-700/20 border border-amber-500/30 text-amber-300 rounded-lg hover:from-amber-600/40 hover:to-amber-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="relative z-10 font-medium">Edit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-12 w-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-white mb-2">No reviews found</h3>
                <p className="text-gray-400 max-w-md mx-auto">We couldn't find any reviews matching your search.</p>
              </div>
            )}
          </>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-16 gap-4">
            <div className="text-gray-400 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages} • Total {pagination.count} reviews
            </div>
            
            <div className="flex items-center gap-2">
              <button onClick={() => handlePageChange(1)} disabled={pagination.currentPage === 1} className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrevious} className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) pageNum = i + 1;
                  else if (pagination.currentPage <= 3) pageNum = i + 1;
                  else if (pagination.currentPage >= pagination.totalPages - 2) pageNum = pagination.totalPages - 4 + i;
                  else pageNum = pagination.currentPage - 2 + i;
                  
                  return (
                    <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`w-8 h-8 rounded-full text-sm transition-colors ${pagination.currentPage === pageNum ? 'bg-amber-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}>
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNext} className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button onClick={() => handlePageChange(pagination.totalPages)} disabled={pagination.currentPage === pagination.totalPages} className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;