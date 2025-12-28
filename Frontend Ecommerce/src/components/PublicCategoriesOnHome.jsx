'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const PublicCategoriesOnHome = () => {
  const router = useRouter();
  
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  
  // Simplified pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 24,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Fetch categories with pagination
  const fetchCategories = async (page = 1, limit = 24) => {
    setLoading(true);
    try {
      // Use params object for proper URL encoding
      const res = await AxiosInstance.get(
        `/api/myapp/v1/public/category/`,
        {
          params: {
            page: page,
            limit: limit,
            api_type: 'list' // This triggers list_serializer if set in backend
          }
        }
      );
      
      // Parse response according to your create_response structure
      const responseData = res?.data?.data;
      
      if (!responseData) {
        console.error('Invalid response structure:', res?.data);
        toast.error('Invalid response from server');
        setRecords([]);
        return;
      }
      
      // Handle both possible response structures
      const dataArr = Array.isArray(responseData.data) ? responseData.data : 
                     Array.isArray(responseData) ? responseData : [];
      
      console.log('Categories fetched:', dataArr.length);
      setRecords(dataArr);
      
      // Calculate pagination values
      const totalCount = responseData.count || dataArr.length;
      const totalPages = Math.ceil(totalCount / limit);
      
      setPagination({
        currentPage: page,
        limit: limit,
        totalPages: totalPages,
        totalCount: totalCount,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      });
      
    } catch (error) {
      console.error('Error fetching categories:', error);
      console.error('Error details:', error.response?.data);
      
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
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCategories(1, 24);
  }, []);

  // Handle router messages (Next.js 13+ App Router)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const message = searchParams.get('message');
    if (message) {
      toast.success(message);
      router.replace('/products');
    }
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      fetchCategories(newPage, pagination.limit);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle limit change
  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    fetchCategories(1, newLimit); // Reset to page 1 when changing limit
  };

  const handleCategoryClick = (categoryId) => {
    router.push(`/categorywiseproductpage?categoryId=${categoryId}`);
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

  return (
    <div className="py-16 px-4 sm:px-8 lg:px-20 mb-1 -mt-20 bg-white min-h-screen">
            <div className="max-w-screen-xl mx-auto">
                {/* Header Section */}
                <h2 className="text-5xl font-extrabold font-serif text-black tracking-wide text-center mt-16 mb-12">
                    🧺 Browse Our Collections
                </h2> 
    {/* // <div className="bg-white min-h-screen mb-1 py-16 px-4 sm:px-8 lg:px-20">
    //   <div className="max-w-screen-xl mx-auto">
    //     <h2 className="text-5xl font-extrabold font-serif text-black tracking-wide text-center mb-12">
    //       🧺 Browse Our Collections
    //     </h2> */}
        
        {/* Results info and limit selector */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="text-black text-sm sm:text-base">
            {records.length > 0 ? (
              <>
                Showing <span className="font-semibold">{(pagination.currentPage - 1) * pagination.limit + 1}</span>
                {' '}-{' '}
                <span className="font-semibold">{Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}</span>
                {' '}of{' '}
                <span className="font-semibold">{pagination.totalCount}</span> categories
              </>
            ) : (
              'No categories found'
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-black text-sm">Items per page:</span>
            <select
              value={pagination.limit}
              onChange={handleLimitChange}
              className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
              disabled={loading}
            >
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
              <option value={32}>32</option>
            </select>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          // Loading skeleton
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {Array.from({ length: pagination.limit }).map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="w-full h-44 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
              {records.length > 0 ? (
                records.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleCategoryClick(item.id)}
                    className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 flex flex-col border border-gray-200 hover:border-gray-300"
                  >
                    {/* Image */}
                    <div className="relative w-full h-44 overflow-hidden bg-gray-50">
                      <img
                        src={item.image 
                          ? `${baseURL}${item.image.startsWith('/') ? '' : '/'}${item.image}`
                          : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmFmYWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                        }
                        alt={item.name || 'Category'}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                        onError={(e) => {
                          console.log('Image failed to load:', item.image);
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmFmYWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col justify-between flex-grow p-4">
                      <div>
                        <h3 className="text-base font-semibold text-black truncate mb-1">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {item.description}
                        </p>
                      </div>
                      <button className="mt-4 w-full py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-all duration-300 font-medium">
                        View Products
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-black">No categories found</h3>
                  <p className="mt-1 text-gray-600">Check back later for new collections</p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {!loading && records.length > 0 && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {/* Previous Button */}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrevious || loading}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !pagination.hasPrevious || loading
                        ? 'bg-gray-100 cursor-not-allowed text-gray-400 border border-gray-200' 
                        : 'bg-black hover:bg-gray-800 text-white'
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
                          disabled={loading}
                          className={`px-3 py-2 rounded-lg transition-colors min-w-[40px] border ${
                            pagination.currentPage === pageNum 
                              ? 'bg-black text-white font-semibold border-black' 
                              : 'bg-white border-gray-300 hover:bg-gray-50 text-black'
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
                    disabled={!pagination.hasNext || loading}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      !pagination.hasNext || loading
                        ? 'bg-gray-100 cursor-not-allowed text-gray-400 border border-gray-200' 
                        : 'bg-black hover:bg-gray-800 text-white'
                    }`}
                  >
                    Next
                  </button>
                </div>

                {/* Page info */}
                <div className="text-black text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </div>
              </div>
            )}
          </>
        )}

        <ToastContainer 
          position="bottom-right"
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
      </div>

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default PublicCategoriesOnHome;