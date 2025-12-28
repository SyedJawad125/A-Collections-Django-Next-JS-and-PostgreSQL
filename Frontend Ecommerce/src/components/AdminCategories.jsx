'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

const CategoryCom = () => {
  const router = useRouter();
  const { permissions = {
    create_category: false,
    read_category: false,
    update_category: false,
    delete_category: false
  } } = useContext(AuthContext);
  
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
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

  useEffect(() => {
    const fetchCategories = async () => {
      if (!permissions.read_category) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Use new API endpoint with params
        const res = await AxiosInstance.get(
          `/api/myapp/v1/category/`,
          {
            params: {
              page: pagination.currentPage,
              limit: pagination.limit,
              api_type: 'list'
            }
          }
        );

        // Parse response according to create_response structure
        const responseData = res?.data?.data;
        
        if (!responseData) {
          console.error('Invalid response structure:', res?.data);
          toast.error('Invalid response from server');
          setCategories([]);
          return;
        }
        
        // Handle both possible response structures
        const dataArr = Array.isArray(responseData.data) ? responseData.data : 
                       Array.isArray(responseData) ? responseData : [];
        
        setCategories(dataArr);
        
        // Calculate pagination values
        const totalCount = responseData.count || dataArr.length;
        const totalPages = Math.ceil(totalCount / pagination.limit);
        
        setPagination(prev => ({
          ...prev,
          totalPages: totalPages,
          totalCount: totalCount,
          hasNext: pagination.currentPage < totalPages,
          hasPrevious: pagination.currentPage > 1
        }));
        
      } catch (error) {
        console.error('Error fetching categories:', error);
        console.error('Error details:', error.response?.data);
        
        if (error.response?.status === 403) {
          toast.error('You do not have permission to view categories');
        } else {
          toast.error(
            error.response?.data?.message || 'Failed to load categories',
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

    fetchCategories();
  }, [pagination.currentPage, pagination.limit, refreshKey, permissions.read_category]);

  const deleteCategory = async (id) => {
    if (!permissions.delete_category) {
      toast.error('You do not have permission to delete categories');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await AxiosInstance.delete(`/api/myapp/v1/category/${id}/`);
      setRefreshKey(prev => prev + 1);
      toast.success('Category deleted successfully', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error deleting category', {
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

  const updateCategory = (categoryId) => {
    if (!permissions.update_category) {
      toast.error('You do not have permission to update categories');
      return;
    }
    router.push(`/updatecategorypage?categoryid=${categoryId}`);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
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
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // Near the start
        pages.push(2, 3, 4, 5);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('...');
        pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // In the middle
        pages.push('...');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Construct proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-category-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove leading slashes and construct proper URL
    const cleanPath = imagePath.replace(/^\/+/, '');
    return `${baseURL}/${cleanPath}`;
  };

  if (!permissions.read_category) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
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
            You don't have permission to view categories. Please contact your administrator.
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
                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-2">
                  OUR COLLECTIONS
                </h1>
                <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mb-3"></div>
                <p className="text-slate-400">Manage premium product categories</p>
              </div>
              
              {permissions.create_category && (
                <button
                  className="group relative px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-full shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all duration-300 mt-4 md:mt-0"
                  onClick={() => router.push('/addcategories')}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    <span>Add Category</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search and Stats Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900/50 rounded-2xl border border-slate-800/50 mb-8 gap-4 backdrop-blur-sm">
          <div className="text-amber-300 font-semibold">
            Showing {categories.length} of {pagination.totalCount} categories
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
                placeholder="Search categories..."
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

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(pagination.limit)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-slate-900/60 rounded-2xl aspect-square border border-slate-800/50"></div>
                <div className="mt-4 space-y-2">
                  <div className="h-4 bg-slate-900/60 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-900/60 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {categories.map((category) => (
                  <div 
                    key={category.id} 
                    className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20 cursor-pointer"
                  >
                    {/* Category Image */}
                    <div className="relative h-80 overflow-hidden rounded-t-2xl">
                      <img
                        src={getImageUrl(category.image)}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        alt={category.name}
                        onError={(e) => {
                          e.target.src = '/default-category-image.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      
                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {permissions.update_category && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCategory(category.id);
                            }}
                            className="p-2 bg-gradient-to-r from-amber-600 to-yellow-500 rounded-full shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-shadow"
                          >
                            <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        )}
                        {permissions.delete_category && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCategory(category.id);
                            }}
                            className="p-2 bg-gradient-to-r from-red-600 to-red-500 rounded-full shadow-lg shadow-red-500/50 hover:shadow-red-500/70 transition-shadow"
                          >
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Category Info */}
                    <div className="p-6 bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-b-2xl border border-slate-800/50">
                      <h3 className="text-xl font-semibold text-amber-200 mb-2 line-clamp-1">{category.name}</h3>
                      <p className="text-slate-400 text-sm mb-4 line-clamp-2">{category.description}</p>
                      
                      {/* View Products Button */}
                      <button
                        onClick={() => router.push(`/categorywiseproductpage?categoryId=${category.id}`)}
                        className="w-full py-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium"
                      >
                        View Products
                      </button>
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
                <h3 className="text-2xl font-semibold text-amber-200 mb-2">No categories found</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  {searchTerm ? "No categories match your search." : "There are no categories to display."}
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
          </>
        )}

        {/* Enhanced Pagination */}
        {!isLoading && categories.length > 0 && pagination.totalPages > 1 && (
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
      </div>
    </div>
  );
};

export default CategoryCom;