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
    const productsRef = useRef(null);
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

    // Fetch sales products with pagination
    const fetchSalesProducts = async (page = 1, limit = 12) => {
        try {
            setIsLoading(true);
            
            // Make API call with page and limit only (remove offset for now)
            const res = await AxiosInstance.get(
                `/api/myapp/v1/publicsalesproduct/?page=${page}&limit=${limit}`
            );
            
            const responseData = res?.data?.data;
            const dataArr = responseData?.data || [];
            
            // Process images
            const processedProducts = dataArr.map(product => ({
                ...product,
                mainImage: product.image_urls?.[0] 
                    ? `${baseURL}${product.image_urls[0].startsWith('/') ? '' : '/'}${product.image_urls[0]}`
                    : '/default-product-image.jpg',
                remainingImages: product.image_urls?.slice(1).map(u => 
                    `${baseURL}${u.startsWith('/') ? '' : '/'}${u}`
                ) || []
            }));
            
            setRecords(processedProducts);
            
            // Update pagination state
            setPagination({
                currentPage: page,
                limit: limit,
                totalPages: responseData?.total_pages || 1,
                totalCount: responseData?.count || 0,
                hasNext: responseData?.next || false,
                hasPrevious: responseData?.previous || false
            });
            
        } catch (error) {
            console.error('Error fetching sale products:', error);
            toast.error('Failed to load sale products', {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const res = await AxiosInstance.get('/api/myapp/v1/slidercategory/');
            setCategories(Array.isArray(res?.data?.data?.data) ? res.data.data.data : []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        }
    };

    // Initial load
    useEffect(() => {
        fetchSalesProducts();
        fetchCategories();
    }, []);

    // Handle toast messages from router
    useEffect(() => {
        if (router.query && router.query.name) {
            toast.success(router.query.name);
            router.push('/products', undefined, { shallow: true });
        }
    }, [router.query?.name]);

    // Event handlers
    const handleProductClick = (product) => {
        const query = new URLSearchParams({
            ProductId: product.id.toString(),
            productData: JSON.stringify(product)
        }).toString();
        router.push(`/salesproductdetailspage?${query}`);
    };

    const handleCategoryClick = (categoryId) => {
        router.push(`/categorywiseproductpage?categoryId=${categoryId}`);
    };

    // Pagination handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
            fetchSalesProducts(newPage, pagination.limit);
            // Scroll to top when page changes
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        fetchSalesProducts(1, newLimit); // Reset to page 1 when changing limit
    };

    return (
        <div className="py-16 px-4 sm:px-8 lg:px-20 mb-16 -mt-20">
            <div className="max-w-screen-xl mx-auto">
                {/* Header Section */}
                <h2 className="text-5xl font-extrabold font-serif text-gray-900 tracking-wide text-center mb-12">
                    ✨ Sales Collection ✨
                </h2> 
                {/* Items per page selector */}
                <div className="flex justify-between items-center mb-6">
                    <div className="text-gray-600">
                        Showing {records.length > 0 ? ((pagination.currentPage - 1) * pagination.limit + 1) : 0} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} products
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">Items per page:</span>
                        <select 
                            value={pagination.limit}
                            onChange={handleLimitChange}
                            className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-black"
                            disabled={isLoading}
                        >
                            <option value="12">12</option>
                            <option value="24">24</option>
                            <option value="36">36</option>
                            <option value="48">48</option>
                        </select>
                    </div>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8" ref={productsRef}>
                    {!isLoading && records.length > 0 ? (
                        records.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleProductClick(item)}
                                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 flex flex-col relative"
                            >
                                {/* Discount Badge */}
                                {item.discount_percent > 0 && (
                                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full z-20">
                                        {item.discount_percent}% OFF
                                    </div>
                                )}

                                {/* Product Image */}
                                <div className="relative w-full h-48 overflow-hidden">
                                    <img
                                        src={item.mainImage}
                                        alt={item.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                                        onError={(e) => {
                                            e.target.src = '/default-product-image.jpg';
                                        }}
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex flex-col justify-between flex-grow p-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 truncate">{item.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                        <div className="flex items-center gap-2 text-sm mt-2">
                                            {item.discount_percent > 0 && (
                                                <p className="text-gray-400 line-through">Rs {item.original_price}</p>
                                            )}
                                            <p className="text-red-600 font-bold">Rs {item.final_price}</p>
                                        </div>
                                    </div>

                                    <button className="mt-4 w-full py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-red-600 transition-all duration-300">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : isLoading ? (
                        // Loading skeleton
                        Array.from({ length: pagination.limit }).map((_, index) => (
                            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
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
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No sale products found</h3>
                            <p className="mt-1 text-gray-500">Try checking back later for new deals</p>
                        </div>
                    )}
                </div>

                {/* Enhanced Pagination Controls */}
                {!isLoading && records.length > 0 && pagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPrevious || isLoading}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    !pagination.hasPrevious || isLoading
                                        ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                                        : 'bg-gray-900 hover:bg-gray-700 text-white'
                                }`}
                            >
                                Previous
                            </button>
                            
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (pagination.totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (pagination.currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                                        pageNum = pagination.totalPages - 4 + i;
                                    } else {
                                        pageNum = pagination.currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            disabled={isLoading}
                                            className={`px-3 py-2 rounded-lg transition-colors ${
                                                pagination.currentPage === pageNum 
                                                    ? 'bg-gray-900 text-white' 
                                                    : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                
                                {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
                                    <>
                                        <span className="px-2 text-gray-500">...</span>
                                        <button
                                            onClick={() => handlePageChange(pagination.totalPages)}
                                            disabled={isLoading}
                                            className={`px-3 py-2 rounded-lg transition-colors ${
                                                pagination.currentPage === pagination.totalPages 
                                                    ? 'bg-gray-900 text-white' 
                                                    : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                                            }`}
                                        >
                                            {pagination.totalPages}
                                        </button>
                                    </>
                                )}
                            </div>
                            
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasNext || isLoading}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    !pagination.hasNext || isLoading
                                        ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                                        : 'bg-gray-900 hover:bg-gray-700 text-white'
                                }`}
                            >
                                Next
                            </button>
                        </div>

                        {/* Page info */}
                        <div className="text-gray-600 text-sm">
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
                toastClassName="bg-white text-gray-800 shadow-xl rounded-lg"
                progressClassName="bg-gradient-to-r from-amber-500 to-amber-800"
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

export default PublicSalesProductsCom;