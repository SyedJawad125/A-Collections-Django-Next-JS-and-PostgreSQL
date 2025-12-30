'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const PublicProductsOnHome = () => {
    const router = useRouter();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const productsRef = useRef(null);
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

    // Fetch products with pagination
    const fetchProducts = async (page = 1, limit = 24) => {
        setLoading(true);
        try {
            // Use params object for proper URL encoding
            const res = await AxiosInstance.get(
                `/api/myapp/v1/public/product/`,
                {
                    params: {
                        page: page,
                        limit: limit,
                        tags: 'Regular', // Changed from 'Regular Products' to match your backend
                        api_type: 'list' // Triggers list_serializer if set
                    }
                }
            );
            
            // Parse response according to the structure you provided
            const responseData = res?.data;
            
            if (!responseData) {
                console.error('Invalid response structure:', res?.data);
                toast.error('Invalid response from server');
                setRecords([]);
                return;
            }
            
            // Your response has direct data array
            const dataArr = responseData.data || [];
            const totalCount = responseData.count || dataArr.length;
            
            // Process the products to include proper image URLs
            const processedProducts = dataArr.map(product => {
                // Use image_urls if available, otherwise use images array
                const imageUrls = product.image_urls || 
                                (product.images && product.images.length > 0 ? 
                                    product.images.map(img => img.image_url) : []);
                
                // Get the main image URL
                let mainImageUrl = '';
                if (imageUrls.length > 0) {
                    // Check if URL already contains base URL
                    const firstImage = imageUrls[0];
                    if (firstImage.startsWith('http')) {
                        mainImageUrl = firstImage;
                    } else {
                        mainImageUrl = `${baseURL}${firstImage.startsWith('/') ? '' : '/'}${firstImage}`;
                    }
                }
                
                return {
                    ...product,
                    mainImage: mainImageUrl || '/default-product-image.jpg',
                    // Store remaining images for future use (like gallery)
                    remainingImages: imageUrls.slice(1).map(url => {
                        if (url.startsWith('http')) {
                            return url;
                        }
                        return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
                    }),
                    // Original image data for reference
                    allImages: product.images || []
                };
            });
            
            setRecords(processedProducts);
            
            // Calculate pagination values
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
            console.error('Error fetching products:', error);
            console.error('Error details:', error.response?.data);
            
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
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories
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

    // Initial data fetch
    useEffect(() => {
        fetchProducts(1, 24);
        fetchCategories();
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
            fetchProducts(newPage, pagination.limit);
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
        fetchProducts(1, newLimit); // Reset to page 1 when changing limit
    };

    const handleProductClick = (product) => {
        const queryString = new URLSearchParams({
            ProductId: product.id.toString(),
            productData: JSON.stringify(product)
        }).toString();
        router.push(`/productdetailpage?${queryString}`);
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
                    🛍️ Shop Our Collection
                </h2>
                
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
                            <option value="12">12</option>
                            <option value="24">24</option>
                            <option value="36">36</option>
                            <option value="48">48</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                <div 
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 min-h-[400px]" 
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
                                {/* Image Container */}
                                <div className="relative w-full h-48 overflow-hidden bg-gray-50">
                                    {item.mainImage ? (
                                        <img
                                            src={item.mainImage}
                                            alt={item.name || 'Product'}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                                            onError={(e) => {
                                                e.target.src = '/default-product-image.jpg';
                                                e.target.onerror = null; // Prevent infinite loop
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                    
                                    {/* Image Count Badge */}
                                    {/* {item.remainingImages && item.remainingImages.length > 0 && (
                                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                            +{item.remainingImages.length}
                                        </div>
                                    )} */}
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
                                        
                                        {/* Category and Tags */}
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {item.category_name && (
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                                    {item.category_name}
                                                </span>
                                            )}
                                            {item.tag_names && item.tag_names.map((tag, index) => (
                                                <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        
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
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-black">No products available</h3>
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

export default PublicProductsOnHome;