'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const NewArrivalOnHome = () => {
    const router = useRouter();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const productsRef = useRef(null);
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Simplified pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 16,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false
    });

    // Fetch new arrival products with pagination
    const fetchNewArrivals = async (page = 1, limit = 16) => {
        setLoading(true);
        try {
            // Use params object for proper URL encoding
            const res = await AxiosInstance.get(
                `/api/myapp/v1/public/product/`,
                {
                    params: {
                        page: page,
                        limit: limit,
                        tags: 'New In', // Filter for New Arrival products
                        api_type: 'list' // Triggers list_serializer if set
                    }
                }
            );
            
            // Parse response according to create_response structure
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
            
            // Process the products to include proper image URLs
            const processedProducts = dataArr.map(product => {
                const imageUrls = product.image_urls || [];
                return {
                    ...product,
                    mainImage: imageUrls.length > 0
                        ? `${baseURL}${imageUrls[0].startsWith('/') ? '' : '/'}${imageUrls[0]}`
                        : '/default-product-image.jpg',
                    remainingImages: imageUrls.slice(1).map(url => 
                        `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`
                    )
                };
            });
            
            setRecords(processedProducts);
            
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
            console.error('Error fetching new arrivals:', error);
            console.error('Error details:', error.response?.data);
            
            toast.error(
                error.response?.data?.message || 'Failed to load new arrivals',
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
        fetchNewArrivals(1, 16);
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
            fetchNewArrivals(newPage, pagination.limit);
            // Scroll to products section
            if (productsRef.current) {
                productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    // Handle limit change
    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        fetchNewArrivals(1, newLimit); // Reset to page 1 when changing limit
    };

    const handleProductClick = (product) => {
        const queryString = new URLSearchParams({
            ProductId: product.id.toString(),
            productData: JSON.stringify(product)
        }).toString();
        router.push(`/productdetailpage?${queryString}`);
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
                    🆕 New Arrivals
                </h2> 
        {/* // <div className="bg-white min-h-screen mb-1 py-16 px-4 sm:px-8 lg:px-20 mb-16 -mt-20">
        //     <div className="max-w-screen-xl mx-auto">
        //         <h2 className="text-5xl font-extrabold font-serif text-black tracking-wide text-center mb-12">
        //             🆕 New Arrivals
        //         </h2> */}
                
                {/* Products count and items per page selector */}
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="text-black text-sm sm:text-base">
                        {records.length > 0 ? (
                            <>
                                Showing <span className="font-semibold">{(pagination.currentPage - 1) * pagination.limit + 1}</span>
                                {' '}-{' '}
                                <span className="font-semibold">{Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}</span>
                                {' '}of{' '}
                                <span className="font-semibold">{pagination.totalCount}</span> products
                            </>
                        ) : (
                            'No products found'
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
                            <option value="8">8</option>
                            <option value="16">16</option>
                            <option value="24">24</option>
                            <option value="32">32</option>
                        </select>
                    </div>
                </div>

                <div 
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    ref={productsRef}
                >
                    {loading ? (
                        // Loading skeleton
                        Array.from({ length: pagination.limit }).map((_, index) => (
                            <div key={index} className="bg-gray-100 rounded-2xl overflow-hidden shadow-lg animate-pulse border border-gray-200">
                                <div className="w-full h-48 bg-gray-200"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
                                </div>
                            </div>
                        ))
                    ) : records.length > 0 ? (
                        records.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleProductClick(item)}
                                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 flex flex-col border border-gray-200 hover:border-gray-300"
                            >
                                {/* Product Image */}
                                <div className="relative w-full h-48 overflow-hidden bg-gray-50">
                                    <img
                                        src={item.mainImage}
                                        alt={item.name || 'Product'}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                                        onError={(e) => {
                                            e.target.src = '/default-product-image.jpg';
                                        }}
                                    />
                                    {/* NEW Badge */}
                                    <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full z-20 shadow-md">
                                        NEW
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div className="flex flex-col justify-between flex-grow p-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-black truncate mb-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            {item.description}
                                        </p>
                                        <p className="text-red-600 font-bold text-sm">
                                            Rs {parseFloat(item.price || 0).toLocaleString()}
                                        </p>
                                    </div>

                                    <button className="mt-4 w-full py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-all duration-300">
                                        View Details
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
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-black">No new arrivals found</h3>
                            <p className="mt-1 text-gray-600">Check back later for new items</p>
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

export default NewArrivalOnHome;