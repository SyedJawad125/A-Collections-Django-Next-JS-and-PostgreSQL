// 'use client';
// import React, { useEffect, useState, useContext } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/components/AuthContext';

// const ImagesCategoryCom = () => {
//   const router = useRouter();
//   const authContext = useContext(AuthContext);
  
//   // Safely access permissions with fallback
//   const permissions = authContext?.permissions || {};
//   const user = authContext?.user || null;
  
//   const [data, setData] = useState({
//     categories: [],
//     count: 0,
//     current_page: 1,
//     limit: 10,
//   });
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(true);

//   // Check for permissions - try multiple possible permission names (initialized at start)
//   const hasReadPermission = permissions?.read_image_category || permissions?.READ_IMAGE_CATEGORY || false;
//   const hasCreatePermission = permissions?.create_image_category || permissions?.CREATE_IMAGE_CATEGORY || false;
//   const hasUpdatePermission = permissions?.update_image_category || permissions?.UPDATE_IMAGE_CATEGORY || false;
//   const hasDeletePermission = permissions?.delete_image_category || permissions?.DELETE_IMAGE_CATEGORY || false;

//   useEffect(() => {
//     if (hasReadPermission) {
//       console.log('Component mounted, fetching categories...');
//       fetchCategories();
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [hasReadPermission]);

//   const fetchCategories = async () => {
//     if (!hasReadPermission) {
//       toast.error('You do not have permission to view categories');
//       return;
//     }

//     setIsLoading(true);
    
//     try {
//       const url = `/api/images/v1/categories/?page=${data.current_page}&limit=${data.limit}`;
//       console.log('Making API call to:', url);
      
//       const res = await AxiosInstance.get(url);
      
//       console.log('=== FULL RESPONSE ===');
//       console.log('res:', res);
//       console.log('res.data:', res.data);
//       console.log('res.data.data:', res.data.data);
      
//       // Handle different possible response structures
//       let categories = [];
//       let count = 0;
      
//       if (res.data) {
//         // Check if data is in res.data.data
//         if (res.data.data && Array.isArray(res.data.data)) {
//           categories = res.data.data;
//           count = res.data.count || res.data.data.length;
//           console.log('✅ Found data in res.data.data');
//         }
//         // Check if data is directly in res.data and it's an array
//         else if (Array.isArray(res.data)) {
//           categories = res.data;
//           count = res.data.length;
//           console.log('✅ Found data directly in res.data');
//         }
//         // Check if there's a different structure
//         else {
//           console.log('❌ Unexpected data structure:', res.data);
//         }
//       }
      
//       console.log('Final categories to set:', categories);
//       console.log('Final count to set:', count);
      
//       setData(prev => ({
//         ...prev,
//         categories: categories,
//         count: count
//       }));
      
//       console.log('State update completed');
      
//       if (categories.length > 0) {
//         toast.success(`Loaded ${categories.length} categories`);
//       } else {
//         toast.info('No categories found');
//       }
      
//     } catch (error) {
//       console.error('=== ERROR DETAILS ===');
//       console.error('Error:', error);
//       console.error('Error message:', error.message);
//       console.error('Error response:', error.response);
//       console.error('Error response data:', error.response?.data);
//       console.error('Error response status:', error.response?.status);
      
//       if (error.response?.status === 403) {
//         toast.error('You do not have permission to view categories');
//       } else {
//         toast.error('Error fetching categories: ' + error.message);
//       }
//     } finally {
//       setIsLoading(false);
//       console.log('Loading complete');
//     }
//   };

//   const deleteCategory = async (id) => {
//     if (!hasDeletePermission) {
//       toast.error('You do not have permission to delete categories');
//       return;
//     }

//     if (!window.confirm('Are you sure you want to delete this category?')) {
//       return;
//     }
    
//     try {
//       const res = await AxiosInstance.delete(`/api/images/v1/categories/?id=${id}`);
//       if (res.data.status_code === 200 || res.data.message === "Successful") {
//         toast.success('Category deleted successfully!');
//         fetchCategories();
//       } else {
//         toast.error(res.data.message || 'Failed to delete category');
//       }
//     } catch (error) {
//       console.error('Delete error:', error);
//       if (error.response?.status === 403) {
//         toast.error('You do not have permission to delete categories');
//       } else {
//         toast.error('Error deleting category!');
//       }
//     }
//   };

//   const updateCategory = async (id) => {
//     if (!hasUpdatePermission) {
//       toast.error('You do not have permission to update categories');
//       return;
//     }
//     router.push(`/UpdateImagesCategoryPage?id=${id}`);
//   };

//   const handleSearch = async (e) => {
//     const value = e.target.value;
//     setSearchTerm(value);

//     if (!hasReadPermission) {
//       return;
//     }

//     if (!value.trim()) {
//       fetchCategories();
//       return;
//     }

//     try {
//       const res = await AxiosInstance.get(`/api/images/v1/categories/?search=${value}`);
//       console.log('Search response:', res.data);
      
//       let categories = [];
//       let count = 0;
      
//       if (res.data && res.data.data && Array.isArray(res.data.data)) {
//         categories = res.data.data;
//         count = res.data.count || res.data.data.length;
//       } else if (Array.isArray(res.data)) {
//         categories = res.data;
//         count = res.data.length;
//       }
      
//       setData(prev => ({
//         ...prev,
//         categories: categories,
//         count: count,
//         current_page: 1
//       }));
//     } catch (error) {
//       console.error('Search error:', error);
//       if (error.response?.status === 403) {
//         toast.error('You do not have permission to search categories');
//       } else {
//         toast.error('Error searching categories');
//       }
//     }
//   };

//   const handlePageChange = (page) => {
//     console.log('Changing page to:', page);
//     setData(prev => ({
//       ...prev,
//       current_page: page
//     }));
//     // Trigger fetch after state update
//     setTimeout(() => fetchCategories(), 0);
//   };

//   const handleLimitChange = (e) => {
//     const newLimit = parseInt(e.target.value);
//     console.log('Changing limit to:', newLimit);
//     setData(prev => ({
//       ...prev,
//       limit: newLimit,
//       current_page: 1
//     }));
//     // Trigger fetch after state update
//     setTimeout(() => fetchCategories(), 0);
//   };

//   const handleAddCategory = () => {
//     if (!hasCreatePermission) {
//       toast.error('You do not have permission to add categories');
//       return;
//     }
//     router.push('/AddImagesCategoryPage');
//   };

//   const total_pages = Math.ceil(data.count / data.limit);

//   console.log('=== RENDER STATE ===');
//   console.log('categories:', data.categories);
//   console.log('categories.length:', data.categories.length);
//   console.log('count:', data.count);
//   console.log('isLoading:', isLoading);

//   // Check if AuthContext is still loading
//   if (!authContext) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
//         <div className="text-center">
//           <div className="animate-spin h-12 w-12 border-4 border-amber-400 border-t-transparent rounded-full mx-auto mb-4"></div>
//           <p className="text-gray-400">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   // Access denied screen
//   if (!hasReadPermission) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
//         <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-12 text-center max-w-md">
//           <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
//             <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-amber-400 mb-4">Access Denied</h2>
//           <p className="text-gray-300 mb-6">
//             You don't have permission to view Images Categories. Please contact your administrator.
//           </p>
//           <p className="text-xs text-gray-500 mb-6">
//             Required permission: READ_CATEGORY
//           </p>
//           <button 
//             onClick={() => router.push('/')}
//             className="px-6 py-3 bg-amber-600 rounded-full hover:bg-amber-700 text-white font-semibold transition-all duration-200 hover:scale-105"
//           >
//             Return to Dashboard
//           </button>
//         </div>
//         <ToastContainer position="top-right" autoClose={2000} />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white px-6 py-10">
//       <ToastContainer position="top-right" autoClose={3000} />
      
//       <div className="flex justify-between items-center mb-8">
//         <h1 className="text-3xl font-bold text-amber-400">Images Categories Management</h1>
//         {hasCreatePermission && (
//           <button 
//             onClick={handleAddCategory}
//             className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-full shadow-md transition"
//           >
//             Add Category
//           </button>
//         )}
//       </div>

//       {/* Search + Limit */}
//       <div className="bg-gray-900 p-4 rounded-xl mb-6 shadow-lg">
//         <div className="flex flex-col md:flex-row items-center justify-between gap-4">
//           <input
//             type="text"
//             placeholder="Search categories..."
//             value={searchTerm}
//             onChange={handleSearch}
//             className="w-full md:w-1/2 px-4 py-2 rounded-md bg-black border border-amber-500 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
//           />
//           <div className="flex items-center gap-2 text-gray-300">
//             <label>Items per page:</label>
//             <select
//               value={data.limit}
//               onChange={handleLimitChange}
//               className="bg-black border border-amber-500 px-3 py-1 rounded-md text-white focus:outline-none"
//             >
//               <option value="10">10</option>
//               <option value="20">20</option>
//               <option value="50">50</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto rounded-lg shadow-xl">
//         {isLoading ? (
//           <div className="text-center p-10 bg-gray-900 rounded-lg">
//             <div className="animate-spin h-12 w-12 border-4 border-amber-400 border-t-transparent rounded-full mx-auto"></div>
//             <p className="mt-4 text-gray-400">Loading categories...</p>
//           </div>
//         ) : (
//           <>
//             <table className="min-w-full divide-y divide-amber-500 bg-gray-950">
//               <thead>
//                 <tr>
//                   <th className="px-6 py-3 text-left text-sm font-bold text-amber-400">ID</th>
//                   <th className="px-6 py-3 text-left text-sm font-bold text-amber-400">Category Name</th>
//                   <th className="px-6 py-3 text-left text-sm font-bold text-amber-400">Images Count</th>
//                   <th className="px-6 py-3 text-left text-sm font-bold text-amber-400">Created By</th>
//                   <th className="px-6 py-3 text-left text-sm font-bold text-amber-400">Created At</th>
//                   <th className="px-6 py-3 text-left text-sm font-bold text-amber-400">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-700">
//                 {data.categories.length > 0 ? (
//                   data.categories.map((category, index) => {
//                     console.log(`Rendering row ${index}:`, category);
//                     return (
//                       <tr key={category.id || index} className="hover:bg-gray-800 transition">
//                         <td className="px-6 py-4 text-sm text-gray-300">{category.id}</td>
//                         <td className="px-6 py-4 text-sm text-white font-medium">{category.category}</td>
//                         <td className="px-6 py-4 text-sm text-gray-300">{category.images_count}</td>
//                         <td className="px-6 py-4 text-sm text-gray-400">
//                           {category.created_by?.full_name || 'System'}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-400">
//                           {new Date(category.created_at).toLocaleDateString()}
//                         </td>
//                         <td className="px-6 py-4 text-sm text-gray-300 space-x-4">
//                           {hasUpdatePermission && (
//                             <button
//                               onClick={() => updateCategory(category.id)}
//                               className="text-amber-400 hover:underline"
//                             >
//                               Edit
//                             </button>
//                           )}
//                           {hasDeletePermission && (
//                             <button
//                               onClick={() => deleteCategory(category.id)}
//                               className="text-red-400 hover:underline"
//                             >
//                               Delete
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     );
//                   })
//                 ) : (
//                   <tr>
//                     <td colSpan="6" className="text-center px-6 py-8 text-gray-500">
//                       <div className="flex flex-col items-center">
//                         <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <p className="text-lg font-bold text-red-400">No categories found</p>
//                         <p className="text-sm mt-2">Try adjusting your search or add a new category</p>
//                       </div>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>

//             {/* Pagination */}
//             {total_pages > 1 && (
//               <div className="flex items-center justify-between mt-6 text-gray-300 bg-gray-900 p-4 rounded">
//                 <div>
//                   Showing <span className="text-amber-400">{(data.current_page - 1) * data.limit + 1}</span> to{' '}
//                   <span className="text-amber-400">{Math.min(data.current_page * data.limit, data.count)}</span> of{' '}
//                   <span className="text-amber-400">{data.count}</span> results
//                 </div>
//                 <div className="space-x-2">
//                   <button
//                     onClick={() => handlePageChange(1)}
//                     disabled={data.current_page === 1}
//                     className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30"
//                   >
//                     First
//                   </button>
//                   <button
//                     onClick={() => handlePageChange(Math.max(1, data.current_page - 1))}
//                     disabled={data.current_page === 1}
//                     className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30"
//                   >
//                     Prev
//                   </button>

//                   {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
//                     let pageNum;
//                     if (total_pages <= 5) {
//                       pageNum = i + 1;
//                     } else if (data.current_page <= 3) {
//                       pageNum = i + 1;
//                     } else if (data.current_page >= total_pages - 2) {
//                       pageNum = total_pages - 4 + i;
//                     } else {
//                       pageNum = data.current_page - 2 + i;
//                     }

//                     return (
//                       <button
//                         key={pageNum}
//                         onClick={() => handlePageChange(pageNum)}
//                         className={`px-3 py-1 rounded ${
//                           data.current_page === pageNum
//                             ? 'bg-amber-500 text-black'
//                             : 'bg-gray-800 hover:bg-gray-700'
//                         }`}
//                       >
//                         {pageNum}
//                       </button>
//                     );
//                   })}

//                   <button
//                     onClick={() => handlePageChange(Math.min(total_pages, data.current_page + 1))}
//                     disabled={data.current_page === total_pages}
//                     className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30"
//                   >
//                     Next
//                   </button>
//                   <button
//                     onClick={() => handlePageChange(total_pages)}
//                     disabled={data.current_page === total_pages}
//                     className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-white disabled:opacity-30"
//                   >
//                     Last
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ImagesCategoryCom;




'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';
import { Search, Plus, Filter, Edit2, Trash2, Folder, Grid3x3, Eye, Calendar, User, Image } from 'lucide-react';

const ImagesCategoryCom = () => {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  
  // Safely access permissions with fallback
  const permissions = authContext?.permissions || {};
  const user = authContext?.user || null;
  
  const [data, setData] = useState({
    categories: [],
    count: 0,
    current_page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Check for permissions - try multiple possible permission names (initialized at start)
  const hasReadPermission = permissions?.read_image_category || permissions?.READ_IMAGE_CATEGORY || false;
  const hasCreatePermission = permissions?.create_image_category || permissions?.CREATE_IMAGE_CATEGORY || false;
  const hasUpdatePermission = permissions?.update_image_category || permissions?.UPDATE_IMAGE_CATEGORY || false;
  const hasDeletePermission = permissions?.delete_image_category || permissions?.DELETE_IMAGE_CATEGORY || false;

  useEffect(() => {
    if (hasReadPermission) {
      console.log('Component mounted, fetching categories...');
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasReadPermission]);

  const fetchCategories = async () => {
    if (!hasReadPermission) {
      toast.error('You do not have permission to view categories');
      return;
    }

    setIsLoading(true);
    
    try {
      const url = `/api/images/v1/categories/?page=${data.current_page}&limit=${data.limit}`;
      console.log('Making API call to:', url);
      
      const res = await AxiosInstance.get(url);
      
      console.log('=== FULL RESPONSE ===');
      console.log('res:', res);
      console.log('res.data:', res.data);
      console.log('res.data.data:', res.data.data);
      
      // Handle different possible response structures
      let categories = [];
      let count = 0;
      
      if (res.data) {
        // Check if data is in res.data.data
        if (res.data.data && Array.isArray(res.data.data)) {
          categories = res.data.data;
          count = res.data.count || res.data.data.length;
          console.log('✅ Found data in res.data.data');
        }
        // Check if data is directly in res.data and it's an array
        else if (Array.isArray(res.data)) {
          categories = res.data;
          count = res.data.length;
          console.log('✅ Found data directly in res.data');
        }
        // Check if there's a different structure
        else {
          console.log('❌ Unexpected data structure:', res.data);
        }
      }
      
      console.log('Final categories to set:', categories);
      console.log('Final count to set:', count);
      
      setData(prev => ({
        ...prev,
        categories: categories,
        count: count
      }));
      
      console.log('State update completed');
      
      if (categories.length > 0) {
        toast.success(`Loaded ${categories.length} categories`);
      } else {
        toast.info('No categories found');
      }
      
    } catch (error) {
      console.error('=== ERROR DETAILS ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      if (error.response?.status === 403) {
        toast.error('You do not have permission to view categories');
      } else {
        toast.error('Error fetching categories: ' + error.message);
      }
    } finally {
      setIsLoading(false);
      console.log('Loading complete');
    }
  };

  const deleteCategory = async (id) => {
    if (!hasDeletePermission) {
      toast.error('You do not have permission to delete categories');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }
    
    try {
      const res = await AxiosInstance.delete(`/api/images/v1/categories/?id=${id}`);
      if (res.data.status_code === 200 || res.data.message === "Successful") {
        toast.success('Category deleted successfully!');
        fetchCategories();
      } else {
        toast.error(res.data.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to delete categories');
      } else {
        toast.error('Error deleting category!');
      }
    }
  };

  const updateCategory = async (id) => {
    if (!hasUpdatePermission) {
      toast.error('You do not have permission to update categories');
      return;
    }
    router.push(`/UpdateImagesCategoryPage?id=${id}`);
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!hasReadPermission) {
      return;
    }

    if (!value.trim()) {
      fetchCategories();
      return;
    }

    try {
      const res = await AxiosInstance.get(`/api/images/v1/categories/?search=${value}`);
      console.log('Search response:', res.data);
      
      let categories = [];
      let count = 0;
      
      if (res.data && res.data.data && Array.isArray(res.data.data)) {
        categories = res.data.data;
        count = res.data.count || res.data.data.length;
      } else if (Array.isArray(res.data)) {
        categories = res.data;
        count = res.data.length;
      }
      
      setData(prev => ({
        ...prev,
        categories: categories,
        count: count,
        current_page: 1
      }));
    } catch (error) {
      console.error('Search error:', error);
      if (error.response?.status === 403) {
        toast.error('You do not have permission to search categories');
      } else {
        toast.error('Error searching categories');
      }
    }
  };

  const handlePageChange = (page) => {
    console.log('Changing page to:', page);
    setData(prev => ({
      ...prev,
      current_page: page
    }));
    // Trigger fetch after state update
    setTimeout(() => fetchCategories(), 0);
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    console.log('Changing limit to:', newLimit);
    setData(prev => ({
      ...prev,
      limit: newLimit,
      current_page: 1
    }));
    // Trigger fetch after state update
    setTimeout(() => fetchCategories(), 0);
  };

  const handleAddCategory = () => {
    if (!hasCreatePermission) {
      toast.error('You do not have permission to add categories');
      return;
    }
    router.push('/AddImagesCategoryPage');
  };

  const total_pages = Math.ceil(data.count / data.limit);

  console.log('=== RENDER STATE ===');
  console.log('categories:', data.categories);
  console.log('categories.length:', data.categories.length);
  console.log('count:', data.count);
  console.log('isLoading:', isLoading);

  // Check if AuthContext is still loading
  if (!authContext) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-6">
        <div className="flex flex-col items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-slate-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

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
            You don't have permission to view Images Categories. Please contact your administrator.
          </p>
          <p className="text-xs text-slate-500 mb-6">
            Required permission: READ_IMAGE_CATEGORY
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
              Category Management
            </h1>
            <p className="text-slate-400 text-sm">Organize and manage your image categories</p>
          </div>

          <div className="flex items-center gap-3">
            {hasCreatePermission && (
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                onClick={handleAddCategory}
              >
                <Plus className="w-5 h-5" />
                Add Category
              </button>
            )}
            <button
              className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-white px-6 py-3 rounded-xl font-semibold border border-slate-700/50 hover:border-slate-600/50 transition-all duration-200 hover:scale-105"
              onClick={() => router.push('/imagespage')}
            >
              <Image className="w-5 h-5" />
              Images
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Categories</span>
              <Folder className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{data.count}</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-950/30 backdrop-blur-sm border border-purple-700/30 rounded-xl p-5 hover:border-purple-600/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Current Page</span>
              <Grid3x3 className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-purple-400">{data.current_page} / {total_pages || 1}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-5 hover:border-emerald-600/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Per Page</span>
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">{data.limit}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={data.limit}
                onChange={handleLimitChange}
                className="px-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all cursor-pointer"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
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
          <p className="mt-6 text-slate-400 font-medium">Loading categories...</p>
        </div>
      )}

      {/* Categories Grid - LUXURY DESIGN */}
      {!isLoading && (
        <>
          {data.categories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.categories.map((category, index) => {
                  console.log(`Rendering row ${index}:`, category);
                  return (
                    <div
                      key={category.id || index}
                      className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-2 border-slate-700/30 rounded-3xl overflow-hidden hover:border-amber-500/60 transition-all duration-700 hover:shadow-[0_20px_60px_-15px_rgba(251,191,36,0.3)] hover:-translate-y-2 shadow-[0_8px_30px_rgb(0,0,0,0.5)] p-6"
                    >
                      {/* Luxury border frame */}
                      <div className="absolute inset-0 rounded-3xl pointer-events-none">
                        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-400/40 rounded-tl-3xl"></div>
                        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-amber-400/40 rounded-tr-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-amber-400/40 rounded-bl-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-400/40 rounded-br-3xl"></div>
                      </div>

                      {/* Gold shimmer effect */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500"></div>
                      </div>

                      <div className="relative z-10">
                        {/* Category Icon Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-amber-600/20 to-amber-500/10 rounded-2xl flex items-center justify-center border-2 border-amber-500/30 group-hover:scale-110 transition-transform duration-500">
                            <Folder className="w-8 h-8 text-amber-400" />
                          </div>
                          <div className="px-4 py-2 bg-gradient-to-r from-amber-600/20 via-amber-500/20 to-yellow-600/20 backdrop-blur-sm border border-amber-400/30 rounded-full">
                            <div className="flex items-center gap-2">
                              <Image className="w-4 h-4 text-amber-400" />
                              <span className="text-amber-400 font-bold text-sm">{category.images_count}</span>
                            </div>
                          </div>
                        </div>

                        {/* Category Name */}
                        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors duration-300">
                          {category.category}
                        </h3>

                        {/* Meta Information */}
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-3 text-slate-400 text-sm">
                            <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Created by</p>
                              <p className="text-slate-300 font-medium">{category.created_by?.full_name || 'System'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 text-slate-400 text-sm">
                            <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500">Created on</p>
                              <p className="text-slate-300 font-medium">
                                {new Date(category.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons - Luxury Design */}
                        {(hasUpdatePermission || hasDeletePermission) && (
                          <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                            {hasUpdatePermission && (
                              <button
                                onClick={() => updateCategory(category.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:via-amber-400 hover:to-yellow-500 text-slate-900 font-bold rounded-xl shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:shadow-[0_6px_30px_rgba(251,191,36,0.6)] transition-all hover:scale-105 border-2 border-amber-400/30"
                              >
                                <Edit2 className="w-4 h-4" />
                                <span className="text-sm uppercase tracking-wide">Edit</span>
                              </button>
                            )}
                            {hasDeletePermission && (
                              <button
                                onClick={() => deleteCategory(category.id)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-red-600 hover:to-red-500 text-white font-bold rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_30px_rgba(239,68,68,0.4)] transition-all hover:scale-105 border-2 border-slate-500/30 hover:border-red-500/50"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-sm uppercase tracking-wide">Delete</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {total_pages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 pb-6">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={data.current_page === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      data.current_page === 1
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    First
                  </button>

                  <button
                    onClick={() => handlePageChange(Math.max(1, data.current_page - 1))}
                    disabled={data.current_page === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      data.current_page === 1
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    Prev
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
                      let pageNum;
                      if (total_pages <= 5) {
                        pageNum = i + 1;
                      } else if (data.current_page <= 3) {
                        pageNum = i + 1;
                      } else if (data.current_page >= total_pages - 2) {
                        pageNum = total_pages - 4 + i;
                      } else {
                        pageNum = data.current_page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            data.current_page === pageNum 
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
                    onClick={() => handlePageChange(Math.min(total_pages, data.current_page + 1))}
                    disabled={data.current_page === total_pages}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      data.current_page === total_pages
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    Next
                  </button>

                  <button
                    onClick={() => handlePageChange(total_pages)}
                    disabled={data.current_page === total_pages}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      data.current_page === total_pages
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    Last
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Folder className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchTerm ? 'No categories found matching your search' : 'No categories found'}
              </h3>
              <p className="text-slate-400 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first category'}
              </p>
              {hasCreatePermission && !searchTerm && (
                <button
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                  onClick={handleAddCategory}
                >
                  <Plus className="w-5 h-5" />
                  Add Your First Category
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImagesCategoryCom;