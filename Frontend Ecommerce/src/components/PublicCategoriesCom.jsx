'use client'
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const PublicCategory = () => {
    const router = useRouter();
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [sliderHeight, setSliderHeight] = useState('auto');
    const categoriesRef = useRef(null);
    const resizeObserverRef = useRef(null);
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
    // Simplified pagination state (same as PublicCategoriesOnHome)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 24,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false
    });

    // Fetch categories with pagination (same as PublicCategoriesOnHome)
    const fetchCategories = async (page = 1, limit = 24) => {
        setLoading(true);
        try {
            // Use the same API endpoint and params as PublicCategoriesOnHome
            const res = await AxiosInstance.get(
                `/api/myapp/v1/public/category/`,
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

    // Fetch products for the slider
    const fetchProducts = async () => {
        try {
            const res = await AxiosInstance.get(
                `/api/myapp/v1/public/product/`,
                {
                    params: {
                        page: 1,
                        limit: 20,
                        api_type: 'list'
                    }
                }
            );
            
            const responseData = res?.data?.data;
            if (!responseData) return;
            
            const dataArr = Array.isArray(responseData.data) ? responseData.data : 
                           Array.isArray(responseData) ? responseData : [];
            
            // Process the products to include proper image URLs
            const processedProducts = dataArr.map(product => {
                const imageUrls = product.image_urls || [];
                return {
                    ...product,
                    mainImage: imageUrls.length > 0
                        ? `${baseURL}${imageUrls[0].startsWith('/') ? '' : '/'}${imageUrls[0]}`
                        : '/default-product-image.jpg'
                };
            });
            setProducts(processedProducts);
            
        } catch (error) {
            console.error('Error fetching products for slider:', error);
        }
    };

    // Initial data fetch
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const message = searchParams.get('message');
        if (message) {
            toast.success(message);
            router.replace('/categories');
        }

        const fetchInitialData = async () => {
            await fetchCategories();
            await fetchProducts();
        };

        fetchInitialData();
    }, []);

    // Handle page change (similar to PublicCategoriesOnHome)
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
            fetchCategories(newPage, pagination.limit);
        }
    };

    // Handle limit change (similar to PublicCategoriesOnHome)
    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        fetchCategories(1, newLimit);
    };

    // Update slider height when records change or window resizes
    useEffect(() => {
        const updateSliderHeight = () => {
            if (categoriesRef.current) {
                const categoriesHeight = categoriesRef.current.offsetHeight;
                setSliderHeight(`${categoriesHeight}px`);
            }
        };

        if (!resizeObserverRef.current && categoriesRef.current) {
            resizeObserverRef.current = new ResizeObserver(updateSliderHeight);
            resizeObserverRef.current.observe(categoriesRef.current);
        }

        updateSliderHeight();

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
        };
    }, [records]);

    // Handle category click (same as PublicCategoriesOnHome)
    const handleCategoryClick = (categoryId) => {
        router.push(`/categorywiseproductpage?categoryId=${categoryId}`);
    };

    const handleProductClick = (product) => {
        const queryString = new URLSearchParams({
            ProductId: product.id.toString(),
            productData: JSON.stringify(product)
        }).toString();
        router.push(`/productdetailpage?${queryString}`);
    };

    // Generate page numbers for pagination (same as PublicCategoriesOnHome)
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
            {/* Left Side - Products Slider */}
            <div className="w-[10%] bg-gray-100 shadow-lg relative overflow-hidden ml-2" style={{ height: sliderHeight }}>
                <div className="absolute top-0 left-0 right-0 animate-scrollUp">
                    {[...products, ...products].map((product, index) => (
                        <div
                            key={`${product.id}-${index}`}
                            onClick={() => handleProductClick(product)}
                            className="shadow-md cursor-pointer p-2 hover:bg-gray-400 transition duration-300"
                        >
                            <img
                                src={product.mainImage}
                                className="w-full h-28 object-cover rounded"
                                alt={product.name}
                                onError={(e) => {
                                    e.target.src = '/default-product-image.jpg';
                                }}
                            />
                            <div className="mt-1 text-xs text-center line-clamp-1 text-black">
                                {product.name}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-gray-100 to-transparent z-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-100 to-transparent z-10 pointer-events-none" />
            </div>

            {/* Right Side - Categories */}
            <div className="w-[85%] p-8" ref={categoriesRef}>
                <h2 className="text-4xl font-serif text-gray-900 font-bold -mb-10 mt-10 text-center tracking-wider">
                    Collections
                </h2>

                <br /><br />
                {/* Categories count and items per page selector (similar to PublicCategoriesOnHome) */}
                <div className="flex justify-between items-center mb-4">
                    <div className="text-black">
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
                    <div className="flex items-center gap-2 text-black">
                        <span>Items per page:</span>
                        <select 
                            value={pagination.limit}
                            onChange={handleLimitChange}
                            className="border rounded p-1 text-black"
                            disabled={loading}
                        >
                            <option value="8">8</option>
                            <option value="16">16</option>
                            <option value="24">24</option>
                            <option value="32">32</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    // Loading skeleton similar to PublicCategoriesOnHome
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-2">
                        {Array.from({ length: pagination.limit }).map((_, index) => (
                            <div key={index} className="bg-gray-100 rounded overflow-hidden shadow-lg animate-pulse border border-gray-200">
                                <div className="w-full h-40 bg-gray-200"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-2">
                            {records.length > 0 ? (
                                records.map((item) => (
                                    <div
                                        key={item.id}
                                        className="card-5 cursor-pointer group relative mb-2"
                                        onClick={() => handleCategoryClick(item.id)}
                                    >
                                        <div className="relative w-full h-40 overflow-hidden">
                                            <img
                                                src={item.image 
                                                    ? `${baseURL}${item.image.startsWith('/') ? '' : '/'}${item.image}`
                                                    : 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmFmYWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                                                }
                                                className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105 border border-black"
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmFmYWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                                }}
                                            />
                                        </div>
                                        <div className="card-body5 p-4">
                                            <h5 className="text-black text-sm font-medium -m-6 p-3 line-clamp-1">{item.name}</h5>
                                            <p className="text-black text-xs mt-1 -m-6 p-3 line-clamp-2">Des: {item.description}</p>
                                            <button className="mt-2 w-full py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition-all duration-300 font-medium">
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

                        {/* Pagination Controls (similar to PublicCategoriesOnHome) */}
                        {!loading && records.length > 0 && pagination.totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row justify-center items-center mt-8 gap-4">
                                <div className="flex items-center gap-2 flex-wrap justify-center">
                                    {/* Previous Button */}
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={!pagination.hasPrevious || loading}
                                        className={`px-4 py-2 rounded-lg transition-colors ${
                                            !pagination.hasPrevious || loading
                                                ? 'bg-gray-100 cursor-not-allowed text-gray-400 border border-gray-200' 
                                                : 'bg-blue-500 hover:bg-blue-600 text-white'
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
                                                            ? 'bg-blue-600 text-white font-semibold border-blue-600' 
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
                                                : 'bg-blue-500 hover:bg-blue-600 text-white'
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
                        transform: translateY(-${products.length * 120}px);
                    }
                }
                .animate-scrollUp {
                    animation: scrollUp ${products.length * 5}s linear infinite;
                }
                .line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
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

export default PublicCategory;