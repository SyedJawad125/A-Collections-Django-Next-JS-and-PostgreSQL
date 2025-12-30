'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const PublicProducts = () => {
    const router = useRouter();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [flag, setFlag] = useState(false);
    const [categories, setCategories] = useState([]);
    const [sliderHeight, setSliderHeight] = useState('auto');
    const productsRef = useRef(null);
    const resizeObserverRef = useRef(null);
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
                        tags: 'Regular', // Changed to match your backend data
                        api_type: 'list'
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
                    // Store remaining images for future use
                    remainingImages: imageUrls.slice(1).map(url => {
                        if (url.startsWith('http')) {
                            return url;
                        }
                        return `${baseURL}${url.startsWith('/') ? '' : '/'}${url}`;
                    })
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
            const responseData = res?.data;
            
            // Handle both response structures
            let categoriesArr = [];
            if (responseData) {
                if (Array.isArray(responseData.data)) {
                    categoriesArr = responseData.data;
                } else if (Array.isArray(responseData)) {
                    categoriesArr = responseData;
                } else if (responseData.data && Array.isArray(responseData.data.data)) {
                    categoriesArr = responseData.data.data;
                }
            }
            
            setCategories(categoriesArr);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    // Initial data fetch
    useEffect(() => {
        // Check for query parameters
        if (typeof window !== 'undefined') {
            const searchParams = new URLSearchParams(window.location.search);
            const message = searchParams.get('message');
            if (message) {
                toast.success(message);
                // Clear the query parameter without refresh
                window.history.replaceState({}, '', window.location.pathname);
            }
        }

        const fetchInitialData = async () => {
            await fetchProducts();
            await fetchCategories();
        };

        fetchInitialData();
    }, [flag]);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
            fetchProducts(newPage, pagination.limit);
            // Scroll to products section
            if (productsRef.current) {
                productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    // Handle limit change
    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        fetchProducts(1, newLimit);
    };

    // Update slider height when records change or window resizes
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

    // Handle product click
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
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Side - Categories Slider */}
            <div className="w-[12%] bg-gray-100 shadow-lg ml-4 relative overflow-hidden" style={{ height: sliderHeight }}>
                <div className="absolute top-0 left-0 right-0 animate-scrollUp">
                    {[...categories, ...categories].map((category, index) => (
                        <div
                            key={`${category.id}-${index}`}
                            onClick={() => handleCategoryClick(category.id)}
                            className="shadow-md cursor-pointer p-2 hover:bg-gray-200 transition duration-300 m-2 rounded-lg bg-white"
                        >
                            <img
                                src={category.image || '/default-product-image.jpg'}
                                alt={category.name}
                                className="w-full h-28 object-cover rounded"
                                onError={(e) => {
                                    e.target.src = '/default-product-image.jpg';
                                    e.target.onerror = null;
                                }}
                            />
                            <p className="text-center text-sm font-medium text-gray-800 mt-2 truncate">
                                {category.name}
                            </p>
                        </div>
                    ))}
                </div>
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-gray-100 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-100 to-transparent z-10 pointer-events-none" />
            </div>

            {/* Right Side - Products */}
            <div className="w-[85%] p-4" ref={productsRef}>
                <h2 className="text-3xl font-serif text-gray-900 font-bold text-center tracking-wider mb-8 mt-4">
                    Our Products
                </h2>

                {/* Products count and items per page selector */}
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4 bg-white p-4 rounded-lg shadow">
                    <div className="text-gray-700 text-sm sm:text-base">
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
                        <span className="text-gray-700 text-sm">Items per page:</span>
                        <select 
                            value={pagination.limit}
                            onChange={handleLimitChange}
                            className="border border-gray-300 rounded p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            <option value="12">12</option>
                            <option value="24">24</option>
                            <option value="36">36</option>
                            <option value="48">48</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-gray-600">Loading products...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {records.length > 0 ? (
                                records.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200"
                                        onClick={() => handleProductClick(item)}
                                    >
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={item.mainImage}
                                                className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-110"
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.target.src = '/default-product-image.jpg';
                                                    e.target.onerror = null;
                                                }}
                                            />
                                            {/* Image count badge */}
                                            {/* {item.remainingImages && item.remainingImages.length > 0 && (
                                                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                                                    +{item.remainingImages.length}
                                                </div>
                                            )} */}
                                            {/* Category badge */}
                                            {/* {item.category_name && (
                                                <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                                    {item.category_name}
                                                </div>
                                            )} */}
                                        </div>
                                        <div className="p-3">
                                            <h5 className="text-gray-900 font-semibold text-sm truncate mb-1">
                                                {item.name}
                                            </h5>
                                            <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                                                {item.description}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <p className="text-red-600 font-bold text-sm">
                                                    Rs {parseFloat(item.price || 0).toLocaleString()}
                                                </p>
                                                {item.tag_names && item.tag_names.length > 0 && (
                                                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                                        {item.tag_names[0]}
                                                    </span>
                                                )}
                                            </div>
                                            <button className="w-full mt-3 py-2 bg-gray-900 text-white text-xs font-medium rounded hover:bg-black transition-colors duration-300">
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-16 bg-white rounded-lg shadow">
                                    <svg
                                        className="mx-auto h-16 w-16 text-gray-400"
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
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">No products available</h3>
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
                                                : 'bg-gray-800 hover:bg-black text-white'
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
                                                            : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-800'
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
                                                : 'bg-gray-800 hover:bg-black text-white'
                                        }`}
                                    >
                                        Next
                                    </button>
                                </div>

                                {/* Page info */}
                                <div className="text-gray-700 text-sm">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </div>
                            </div>
                        )}
                    </>
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
                        transform: translateY(-${categories.length * 150}px);
                    }
                }
                .animate-scrollUp {
                    animation: scrollUp ${categories.length * 8}s linear infinite;
                    animation-play-state: running;
                }
                .animate-scrollUp:hover {
                    animation-play-state: paused;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .card-5 {
                    background: white;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .card-image5 {
                    transition: transform 0.3s ease;
                }
                .card-body5 {
                    padding: 1rem;
                }
            `}</style>
        </div>
    );
};

export default PublicProducts;