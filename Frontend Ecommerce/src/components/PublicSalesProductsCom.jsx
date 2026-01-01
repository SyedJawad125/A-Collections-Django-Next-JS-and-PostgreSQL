'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const PublicSalesProductsCom = () => {
    const router = useRouter();
    const [records, setRecords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [sliderHeight, setSliderHeight] = useState('auto');
    const productsRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 12,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false
    });

    // Helper function to process image URL (same as first code)
    const processImageUrl = (url) => {
        // First, check if it's an empty URL
        if (!url || url.trim() === '') {
            return '/images/default-product.jpg';
        }
        
        // If URL already starts with http:// or https://, return as is
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        // Otherwise, it's a relative path, so add the base URL
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${baseURL}${cleanUrl}`;
    };

    // Fetch sales products with pagination
    const fetchSalesProducts = async (page = 1, limit = 12) => {
        try {
            setIsLoading(true);
            
            const res = await AxiosInstance.get(
                `/api/myapp/v1/public/sales/product/`,
                {
                    params: {
                        page: page,
                        limit: limit,
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
            
            const processedProducts = dataArr.map(product => {
                const imageUrls = product.image_urls || [];
                return {
                    ...product,
                    mainImage: imageUrls.length > 0
                        ? processImageUrl(imageUrls[0])
                        : '/default-product-image.jpg',
                    remainingImages: imageUrls.slice(1).map(url => processImageUrl(url))
                };
            });
            
            setRecords(processedProducts);
            
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
            console.error('Error fetching sale products:', error);
            console.error('Error details:', error.response?.data);
            
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
            setRecords([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch categories for slider
    const fetchCategories = async () => {
        try {
            const res = await AxiosInstance.get('/api/myapp/v1/public/category/');
            const responseData = res?.data;
            
            const dataArr = Array.isArray(responseData?.data) ? responseData.data : 
                           Array.isArray(responseData) ? responseData : [];
            
            const processedCategories = dataArr.map(category => {
                return {
                    ...category,
                    image: category.image ? processImageUrl(category.image) : '/default-category-image.jpg'
                };
            });
            
            setCategories(processedCategories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    // Initial load
    useEffect(() => {
        fetchSalesProducts(1, 12);
        fetchCategories();
        
        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
        };
    }, []);

    // Handle toast messages from router
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const message = searchParams.get('message');
            if (message) {
                toast.success(message);
                const newUrl = window.location.pathname;
                window.history.replaceState({}, '', newUrl);
            }
        }
    }, []);

    // Update slider height when records change
    useEffect(() => {
        const updateSliderHeight = () => {
            if (productsRef.current) {
                const productsHeight = productsRef.current.offsetHeight;
                setSliderHeight(`${productsHeight}px`);
            }
        };

        if (productsRef.current) {
            if (!resizeObserverRef.current) {
                resizeObserverRef.current = new ResizeObserver(updateSliderHeight);
                resizeObserverRef.current.observe(productsRef.current);
            }
            
            updateSliderHeight();
        }

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
                resizeObserverRef.current = null;
            }
        };
    }, [records, isLoading]);

    // Event handlers - FIXED: Changed to lowercase /salesdetail
    const handleProductClick = (product) => {
        const queryString = new URLSearchParams({
            ProductId: product.id.toString(),
            productData: JSON.stringify(product)
        }).toString();
        router.push(`/salesdetail?${queryString}`); // Changed from /SalesDetail to /salesdetail
    };

    const handleCategoryClick = (categoryId) => {
        router.push(`/categorywiseproductpage?categoryId=${categoryId}`);
    };

    // Pagination handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
            fetchSalesProducts(newPage, pagination.limit);
            if (productsRef.current) {
                productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        fetchSalesProducts(1, newLimit);
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

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Side - Categories Slider */}
            {categories.length > 0 && (
                <div className="w-[10%] bg-gray-100 shadow-lg ml-4 relative overflow-hidden" style={{ height: sliderHeight }}>
                    <div className="absolute top-0 left-0 right-0 animate-scrollUp">
                        {[...categories, ...categories].map((category, index) => (
                            <div
                                key={`${category.id}-${index}`}
                                onClick={() => handleCategoryClick(category.id)}
                                className="shadow-md cursor-pointer p-2 hover:bg-gray-200 transition duration-300"
                            >
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-28 object-cover rounded"
                                    onError={(e) => {
                                        e.target.src = '/default-category-image.jpg';
                                    }}
                                />
                                <p className="text-xs text-center mt-1 text-gray-700 font-medium truncate">
                                    {category.name}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-gray-100 to-transparent z-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-100 to-transparent z-10 pointer-events-none" />
                </div>
            )}

            {/* Right Side - Products */}
            <div className={`${categories.length > 0 ? 'w-[85%]' : 'w-full'} p-4 md:p-8`} ref={productsRef}>
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-900 font-bold mb-6 md:mb-8 mt-4 md:mt-10 tracking-wider">
                        ✨ EXCLUSIVE SALES ✨
                    </h2>
                    
                    {/* Items per page selector and count */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-gray-700 text-sm md:text-base">
                            {records.length > 0 ? (
                                <>
                                    Showing <span className="font-semibold">{(pagination.currentPage - 1) * pagination.limit + 1}</span>
                                    {' '}-{' '}
                                    <span className="font-semibold">{Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}</span>
                                    {' '}of{' '}
                                    <span className="font-semibold">{pagination.totalCount}</span> products
                                </>
                            ) : (
                                !isLoading && 'No products found'
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-sm">Items per page:</span>
                            <select 
                                value={pagination.limit}
                                onChange={handleLimitChange}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 bg-white"
                                disabled={isLoading}
                            >
                                <option value="12">12</option>
                                <option value="24">24</option>
                                <option value="36">36</option>
                                <option value="48">48</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Grid - 6 columns like first code */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 mb-8">
                    {!isLoading && records.length > 0 ? (
                        records.map((item) => (
                            <div
                                key={item.id}
                                className="group relative overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-500 rounded-lg cursor-pointer transform hover:-translate-y-1"
                                onClick={() => handleProductClick(item)}
                            >
                                {/* Discount Badge */}
                                {item.discount_percent > 0 && (
                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
                                        -{item.discount_percent}%
                                    </div>
                                )}
                                
                                {/* Image Container */}
                                <div className="relative overflow-hidden pt-[100%] bg-gray-50">
                                    <img
                                        src={item.mainImage}
                                        className="absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 p-1"
                                        alt={item.name}
                                        onError={(e) => {
                                            e.target.src = '/default-product-image.jpg';
                                        }}
                                    />
                                </div>
                                
                                {/* Product Details */}
                                <div className="p-3 md:p-4">
                                    <h5 className="text-sm md:text-base font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors truncate">
                                        {item.name}
                                    </h5>
                                    
                                    <div className="mb-2">
                                        {item.discount_percent > 0 && item.original_price && (
                                            <div className="text-xs text-gray-500 line-through">
                                                PKR {parseFloat(item.original_price || 0).toLocaleString()}
                                            </div>
                                        )}
                                        <div className="text-base sm:text-lg font-bold text-gray-900">
                                            PKR {parseFloat(item.final_price || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    
                                    {item.discount_percent > 0 && item.original_price && (
                                        <div className="text-xs text-green-600 font-medium mb-3">
                                            Save PKR {(parseFloat(item.original_price || 0) - parseFloat(item.final_price || 0)).toLocaleString()}
                                        </div>
                                    )}
                                    
                                    <div className="mt-auto">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {item.category_data?.name || 'Uncategorized'}
                                            </span>
                                        </div>
                                        <button className="w-full py-2 bg-gray-900 text-white text-xs sm:text-sm rounded hover:bg-blue-700 transition-colors font-medium">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : isLoading ? (
                        // Loading skeleton
                        Array.from({ length: pagination.limit }).map((_, index) => (
                            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse">
                                <div className="pt-[100%] bg-gray-200"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No sale products found</h3>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Check back soon for exciting new deals!
                            </p>
                        </div>
                    )}
                </div>

                {/* Enhanced Pagination Controls */}
                {!isLoading && records.length > 0 && pagination.totalPages > 1 && (
                    <div className="mt-10 md:mt-12">
                        <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="text-gray-700 text-sm sm:text-base">
                                    Page <span className="font-bold text-blue-600">{pagination.currentPage}</span> of <span className="font-bold">{pagination.totalPages}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={!pagination.hasPrevious || isLoading}
                                        className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
                                            !pagination.hasPrevious || isLoading
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-800 text-white hover:bg-gray-900 hover:shadow-md transition-all'
                                        }`}
                                    >
                                        ← Previous
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
                                                    className={`px-3 py-2 rounded-lg text-sm sm:text-base min-w-[36px] sm:min-w-[40px] ${
                                                        pagination.currentPage === pageNum
                                                            ? 'bg-blue-600 text-white font-semibold shadow-sm'
                                                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
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
                                        className={`px-4 py-2 rounded-lg text-sm sm:text-base ${
                                            !pagination.hasNext || isLoading
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                : 'bg-gray-800 text-white hover:bg-gray-900 hover:shadow-md transition-all'
                                        }`}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

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

            <style jsx>{`
                @keyframes scrollUp {
                    0% {
                        transform: translateY(0);
                    }
                    100% {
                        transform: translateY(-${categories.length * 140}px);
                    }
                }
                .animate-scrollUp {
                    animation: scrollUp ${categories.length * 8}s linear infinite;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                @media (max-width: 768px) {
                    .animate-scrollUp {
                        animation: scrollUp ${categories.length * 6}s linear infinite;
                    }
                }
            `}</style>
        </div>
    );
};

export default PublicSalesProductsCom;