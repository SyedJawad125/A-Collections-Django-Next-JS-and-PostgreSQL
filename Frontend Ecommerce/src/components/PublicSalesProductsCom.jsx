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
    
    // Simplified pagination state (same as first code)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 12,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false
    });

    // Fetch sales products with pagination (same as first code)
    const fetchSalesProducts = async (page = 1, limit = 12) => {
        try {
            setIsLoading(true);
            
            // Use the same API endpoint and params as first code
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
            
            // Parse response according to create_response structure
            const responseData = res?.data?.data;
            
            if (!responseData) {
                console.error('Invalid response structure:', res?.data);
                toast.error('Invalid response from server');
                setRecords([]);
                return;
            }
            
            const dataArr = Array.isArray(responseData.data) ? responseData.data : 
                           Array.isArray(responseData) ? responseData : [];
            
            // Process images for each product
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
            const responseData = res?.data?.data;
            const categoriesArr = Array.isArray(responseData?.data) ? responseData.data : 
                                 Array.isArray(responseData) ? responseData : [];
            setCategories(categoriesArr);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    // Initial load
    useEffect(() => {
        fetchSalesProducts(1, 12);
        fetchCategories();
    }, []);

    // Handle toast messages from router
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const message = searchParams.get('message');
        if (message) {
            toast.success(message);
            router.replace('/sales-products');
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

        if (!resizeObserverRef.current && productsRef.current) {
            resizeObserverRef.current = new ResizeObserver(updateSliderHeight);
            resizeObserverRef.current.observe(productsRef.current);
        }

        updateSliderHeight();

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
        };
    }, [records]);

    // Event handlers
    const handleProductClick = (product) => {
        const queryString = new URLSearchParams({
            ProductId: product.id.toString(),
            productData: JSON.stringify(product)
        }).toString();
        router.push(`/salesproductdetailspage?${queryString}`);
    };

    const handleCategoryClick = (categoryId) => {
        router.push(`/categorywiseproductpage?categoryId=${categoryId}`);
    };

    // Pagination handlers (same as first code)
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
            fetchSalesProducts(newPage, pagination.limit);
            // Scroll to products section
            if (productsRef.current) {
                productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        fetchSalesProducts(1, newLimit);
    };

    // Generate page numbers for pagination (same as first code)
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
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Side - Categories Slider */}
            <div className="w-[10%] bg-gray-100 shadow-lg ml-4 relative overflow-hidden" style={{ height: sliderHeight }}>
                <div className="absolute top-0 left-0 right-0 animate-scrollUp">
                    {[...categories, ...categories].map((category, index) => (
                        <div
                            key={`${category.id}-${index}`}
                            onClick={() => handleCategoryClick(category.id)}
                            className="shadow-md cursor-pointer p-2 hover:bg-gray-400 transition duration-300"
                        >
                            <img
                                src={`${baseURL}${category.image?.startsWith('/') ? '' : '/'}${category.image || ''}`}
                                alt={category.name}
                                className="w-full h-28 object-cover rounded"
                                onError={(e) => {
                                    e.target.src = '/default-category-image.jpg';
                                }}
                            />
                        </div>
                    ))}
                </div>
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-gray-100 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-100 to-transparent z-10 pointer-events-none" />
            </div>

            {/* Right Side - Products */}
            <div className="w-[85%] p-8" ref={productsRef}>
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-serif text-gray-900 font-bold mb-8 mt-10 tracking-wider">
                        EXCLUSIVE SALES
                    </h2>
                    
                    {/* Items per page selector and count (similar to first code) */}
                    <div className="flex justify-between items-center mb-6 flex-wrap gap-4 p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-black">
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

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                    {!isLoading && records.length > 0 ? (
                        records.map((item) => (
                            <div
                                key={item.id}
                                className="group relative overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all duration-500 rounded-lg cursor-pointer transform hover:-translate-y-1"
                                onClick={() => handleProductClick(item)}
                            >
                                {/* Discount Ribbon (same as first code) */}
                                {item.discount_percent > 0 && (
                                    <div className="absolute top-2 right-0 bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-bold px-2 py-1 shadow-md z-10 rounded-l-md">
                                        -{item.discount_percent}%
                                    </div>
                                )}
                                
                                {/* Image Container */}
                                <div className="relative overflow-hidden">
                                    <img
                                        src={item.mainImage}
                                        className="w-full h-48 object-cover transition-all duration-700 group-hover:scale-110"
                                        alt={item.name}
                                        onError={(e) => {
                                            e.target.src = '/default-product-image.jpg';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                </div>
                                
                                {/* Product Details */}
                                <div className="p-4">
                                    <h5 className="text-sm font-semibold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors truncate">
                                        {item.name}
                                    </h5>
                                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8">
                                        {item.description}
                                    </p>
                                    
                                    <div className="space-y-1">
                                        {item.discount_percent > 0 && item.original_price && (
                                            <p className="text-xs text-gray-400 line-through">
                                                Rs {parseFloat(item.original_price).toLocaleString()}
                                            </p>
                                        )}
                                        <p className="text-base font-bold text-amber-800">
                                            Rs {parseFloat(item.final_price || item.price || 0).toLocaleString()}
                                        </p>
                                        {item.discount_percent > 0 && item.original_price && (
                                            <p className="text-xs text-green-600">
                                                Save Rs {(parseFloat(item.original_price) - parseFloat(item.final_price || item.price || 0)).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <button className="mt-3 w-full py-2 bg-gray-900 text-white text-xs rounded-md hover:bg-amber-600 transition-all duration-300">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : isLoading ? (
                        // Loading skeleton
                        Array.from({ length: pagination.limit }).map((_, index) => (
                            <div key={index} className="bg-gray-100 rounded overflow-hidden shadow-lg animate-pulse">
                                <div className="w-full h-48 bg-gray-200"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                    <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
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
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-black">No sale products found</h3>
                            <p className="mt-1 text-gray-600">Try checking back later for new deals</p>
                        </div>
                    )}
                </div>

                {/* Enhanced Pagination Controls (similar to first code) */}
                {!isLoading && records.length > 0 && pagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPrevious || isLoading}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    !pagination.hasPrevious || isLoading
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
                                            disabled={isLoading}
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
                                disabled={!pagination.hasNext || isLoading}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    !pagination.hasNext || isLoading
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
                        transform: translateY(-${categories.length * 120}px);
                    }
                }
                .animate-scrollUp {
                    animation: scrollUp ${categories.length * 5}s linear infinite;
                }
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

export default PublicSalesProductsCom;