// 'use client'
// import React, { useEffect, useState, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";

// const PublicSalesProductsCom = () => {
//     const router = useRouter();
//     const [records, setRecords] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [categories, setCategories] = useState([]);
//     const productsRef = useRef(null);
//     const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
//     // Simplified pagination state
//     const [pagination, setPagination] = useState({
//         currentPage: 1,
//         limit: 12,
//         totalPages: 1,
//         totalCount: 0,
//         hasNext: false,
//         hasPrevious: false
//     });

//     // Fetch sales products with pagination
//     const fetchSalesProducts = async (page = 1, limit = 12) => {
//         try {
//             setIsLoading(true);
            
//             // Make API call with page and limit only (remove offset for now)
//             const res = await AxiosInstance.get(
//                 `/api/myapp/v1/public/sales/product/?page=${page}&limit=${limit}`
//             );
            
//             const responseData = res?.data?.data;
//             const dataArr = responseData?.data || [];
            
//             // Process images
//             const processedProducts = dataArr.map(product => ({
//                 ...product,
//                 mainImage: product.image_urls?.[0] 
//                     ? `${baseURL}${product.image_urls[0].startsWith('/') ? '' : '/'}${product.image_urls[0]}`
//                     : '/default-product-image.jpg',
//                 remainingImages: product.image_urls?.slice(1).map(u => 
//                     `${baseURL}${u.startsWith('/') ? '' : '/'}${u}`
//                 ) || []
//             }));
            
//             setRecords(processedProducts);
            
//             // Update pagination state
//             setPagination({
//                 currentPage: page,
//                 limit: limit,
//                 totalPages: responseData?.total_pages || 1,
//                 totalCount: responseData?.count || 0,
//                 hasNext: responseData?.next || false,
//                 hasPrevious: responseData?.previous || false
//             });
            
//         } catch (error) {
//             console.error('Error fetching sale products:', error);
//             toast.error('Failed to load sale products', {
//                 position: "top-center",
//                 autoClose: 3000,
//                 hideProgressBar: true,
//                 closeOnClick: true,
//                 pauseOnHover: true,
//                 draggable: true,
//                 theme: "dark",
//             });
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Fetch categories
//     // const fetchCategories = async () => {
//     //     try {
//     //         const res = await AxiosInstance.get('/api/myapp/v1/slidercategory/');
//     //         setCategories(Array.isArray(res?.data?.data?.data) ? res.data.data.data : []);
//     //     } catch (error) {
//     //         console.error('Error fetching categories:', error);
//     //         setCategories([]);
//     //     }
//     // };

//     // Initial load
//     useEffect(() => {
//         fetchSalesProducts();
//         // fetchCategories();
//     }, []);

//     // Handle toast messages from router
//     useEffect(() => {
//         if (router.query && router.query.name) {
//             toast.success(router.query.name);
//             router.push('/products', undefined, { shallow: true });
//         }
//     }, [router.query?.name]);

//     // Event handlers
//     const handleProductClick = (product) => {
//         const query = new URLSearchParams({
//             ProductId: product.id.toString(),
//             productData: JSON.stringify(product)
//         }).toString();
//         router.push(`/salesproductdetailspage?${query}`);
//     };

//     const handleCategoryClick = (categoryId) => {
//         router.push(`/categorywiseproductpage?categoryId=${categoryId}`);
//     };

//     // Pagination handlers
//     const handlePageChange = (newPage) => {
//         if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
//             fetchSalesProducts(newPage, pagination.limit);
//             // Scroll to top when page changes
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//         }
//     };

//     const handleLimitChange = (e) => {
//         const newLimit = parseInt(e.target.value);
//         fetchSalesProducts(1, newLimit); // Reset to page 1 when changing limit
//     };

//     return (
//         <div className="py-16 px-4 sm:px-8 lg:px-20 mb-16 -mt-20">
//             <div className="max-w-screen-xl mx-auto">
//                 {/* Header Section */}
//                 <h2 className="text-5xl font-extrabold font-serif text-gray-900 tracking-wide text-center mb-12">
//                     ✨ Sales Collection ✨
//                 </h2> 
//                 {/* Items per page selector */}
//                 <div className="flex justify-between items-center mb-6">
//                     <div className="text-gray-600">
//                         Showing {records.length > 0 ? ((pagination.currentPage - 1) * pagination.limit + 1) : 0} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of {pagination.totalCount} products
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <span className="text-gray-600">Items per page:</span>
//                         <select 
//                             value={pagination.limit}
//                             onChange={handleLimitChange}
//                             className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 text-black"
//                             disabled={isLoading}
//                         >
//                             <option value="12">12</option>
//                             <option value="24">24</option>
//                             <option value="36">36</option>
//                             <option value="48">48</option>
//                         </select>
//                     </div>
//                 </div>

//                 {/* Products Grid */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8" ref={productsRef}>
//                     {!isLoading && records.length > 0 ? (
//                         records.map((item) => (
//                             <div
//                                 key={item.id}
//                                 onClick={() => handleProductClick(item)}
//                                 className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 flex flex-col relative"
//                             >
//                                 {/* Discount Badge */}
//                                 {item.discount_percent > 0 && (
//                                     <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full z-20">
//                                         {item.discount_percent}% OFF
//                                     </div>
//                                 )}

//                                 {/* Product Image */}
//                                 <div className="relative w-full h-48 overflow-hidden">
//                                     <img
//                                         src={item.mainImage}
//                                         alt={item.name}
//                                         className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
//                                         onError={(e) => {
//                                             e.target.src = '/default-product-image.jpg';
//                                         }}
//                                     />
//                                 </div>

//                                 {/* Product Details */}
//                                 <div className="flex flex-col justify-between flex-grow p-4">
//                                     <div>
//                                         <h3 className="text-base font-semibold text-gray-900 truncate">{item.name}</h3>
//                                         <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
//                                         <div className="flex items-center gap-2 text-sm mt-2">
//                                             {item.discount_percent > 0 && (
//                                                 <p className="text-gray-400 line-through">Rs {item.original_price}</p>
//                                             )}
//                                             <p className="text-red-600 font-bold">Rs {item.final_price}</p>
//                                         </div>
//                                     </div>

//                                     <button className="mt-4 w-full py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-red-600 transition-all duration-300">
//                                         View Details
//                                     </button>
//                                 </div>
//                             </div>
//                         ))
//                     ) : isLoading ? (
//                         // Loading skeleton
//                         Array.from({ length: pagination.limit }).map((_, index) => (
//                             <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
//                                 <div className="w-full h-48 bg-gray-200"></div>
//                                 <div className="p-4 space-y-2">
//                                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                                     <div className="h-3 bg-gray-200 rounded w-full"></div>
//                                     <div className="h-3 bg-gray-200 rounded w-1/2"></div>
//                                     <div className="h-8 bg-gray-200 rounded w-full mt-4"></div>
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <div className="col-span-full text-center py-16">
//                             <svg
//                                 className="mx-auto h-12 w-12 text-gray-400"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={1}
//                                     d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                                 />
//                             </svg>
//                             <h3 className="mt-4 text-lg font-medium text-gray-900">No sale products found</h3>
//                             <p className="mt-1 text-gray-500">Try checking back later for new deals</p>
//                         </div>
//                     )}
//                 </div>

//                 {/* Enhanced Pagination Controls */}
//                 {!isLoading && records.length > 0 && pagination.totalPages > 1 && (
//                     <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
//                         <div className="flex items-center gap-2">
//                             <button
//                                 onClick={() => handlePageChange(pagination.currentPage - 1)}
//                                 disabled={!pagination.hasPrevious || isLoading}
//                                 className={`px-4 py-2 rounded-lg transition-colors ${
//                                     !pagination.hasPrevious || isLoading
//                                         ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
//                                         : 'bg-gray-900 hover:bg-gray-700 text-white'
//                                 }`}
//                             >
//                                 Previous
//                             </button>
                            
//                             <div className="flex items-center gap-1">
//                                 {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
//                                     let pageNum;
//                                     if (pagination.totalPages <= 5) {
//                                         pageNum = i + 1;
//                                     } else if (pagination.currentPage <= 3) {
//                                         pageNum = i + 1;
//                                     } else if (pagination.currentPage >= pagination.totalPages - 2) {
//                                         pageNum = pagination.totalPages - 4 + i;
//                                     } else {
//                                         pageNum = pagination.currentPage - 2 + i;
//                                     }
                                    
//                                     return (
//                                         <button
//                                             key={pageNum}
//                                             onClick={() => handlePageChange(pageNum)}
//                                             disabled={isLoading}
//                                             className={`px-3 py-2 rounded-lg transition-colors ${
//                                                 pagination.currentPage === pageNum 
//                                                     ? 'bg-gray-900 text-white' 
//                                                     : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
//                                             }`}
//                                         >
//                                             {pageNum}
//                                         </button>
//                                     );
//                                 })}
                                
//                                 {pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2 && (
//                                     <>
//                                         <span className="px-2 text-gray-500">...</span>
//                                         <button
//                                             onClick={() => handlePageChange(pagination.totalPages)}
//                                             disabled={isLoading}
//                                             className={`px-3 py-2 rounded-lg transition-colors ${
//                                                 pagination.currentPage === pagination.totalPages 
//                                                     ? 'bg-gray-900 text-white' 
//                                                     : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
//                                             }`}
//                                         >
//                                             {pagination.totalPages}
//                                         </button>
//                                     </>
//                                 )}
//                             </div>
                            
//                             <button
//                                 onClick={() => handlePageChange(pagination.currentPage + 1)}
//                                 disabled={!pagination.hasNext || isLoading}
//                                 className={`px-4 py-2 rounded-lg transition-colors ${
//                                     !pagination.hasNext || isLoading
//                                         ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
//                                         : 'bg-gray-900 hover:bg-gray-700 text-white'
//                                 }`}
//                             >
//                                 Next
//                             </button>
//                         </div>

//                         {/* Page info */}
//                         <div className="text-gray-600 text-sm">
//                             Page {pagination.currentPage} of {pagination.totalPages}
//                         </div>
//                     </div>
//                 )}
//             </div>

//             <ToastContainer 
//                 position="bottom-right"
//                 autoClose={5000}
//                 hideProgressBar={false}
//                 newestOnTop={false}
//                 closeOnClick
//                 rtl={false}
//                 pauseOnFocusLoss
//                 draggable
//                 pauseOnHover
//                 toastClassName="bg-white text-gray-800 shadow-xl rounded-lg"
//                 progressClassName="bg-gradient-to-r from-amber-500 to-amber-800"
//             />

//             <style jsx>{`
//                 .line-clamp-2 {
//                     display: -webkit-box;
//                     -webkit-line-clamp: 2;
//                     -webkit-box-orient: vertical;
//                     overflow: hidden;
//                 }
//             `}</style>
//         </div>
//     );
// };

// export default PublicSalesProductsCom;

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
    const productsRef = useRef(null);
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

    // Fetch sales products with pagination
    const fetchSalesProducts = async (page = 1, limit = 12) => {
        try {
            setIsLoading(true);
            
            // API call matching your backend structure
            const res = await AxiosInstance.get(
                `/api/myapp/v1/public/sales/product/`,
                {
                    params: {
                        page: page,
                        limit: limit,
                        api_type: 'list' // This triggers list_serializer if set in backend
                    }
                }
            );
            
            // Parse response according to your create_response structure
            // Expected: { status: "...", data: { data: [...], count: X, ... } }
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
                    theme: "dark",
                }
            );
            setRecords([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchSalesProducts(1, 12);
    }, []);

    // Handle toast messages from router (Next.js 13+ App Router)
    useEffect(() => {
        // For App Router, you'd use searchParams instead
        const searchParams = new URLSearchParams(window.location.search);
        const message = searchParams.get('message');
        if (message) {
            toast.success(message);
            // Clean URL
            router.replace('/products');
        }
    }, []);

    // Event handlers
    const handleProductClick = (product) => {
        const queryString = new URLSearchParams({
            ProductId: product.id.toString(),
            productData: JSON.stringify(product)
        }).toString();
        router.push(`/salesproductdetailspage?${queryString}`);
    };

    // Pagination handlers
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
            fetchSalesProducts(newPage, pagination.limit);
            // Scroll to products section
            if (productsRef.current) {
                productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    };

    const handleLimitChange = (e) => {
        const newLimit = parseInt(e.target.value);
        fetchSalesProducts(1, newLimit); // Reset to page 1 when changing limit
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
        <div className="py-16 px-4 sm:px-8 lg:px-20 mb-16 -mt-20 bg-black min-h-screen">
            <div className="max-w-screen-xl mx-auto">
                {/* Header Section */}
                <h2 className="text-5xl font-extrabold font-serif text-white tracking-wide text-center mt-12 mb-12">
                    ✨ Sales Collection ✨
                </h2> 
                
                {/* Items per page selector and count */}
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                    <div className="text-white text-sm sm:text-base">
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
                        <span className="text-white text-sm">Items per page:</span>
                        <select 
                            value={pagination.limit}
                            onChange={handleLimitChange}
                            className="px-3 py-1 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white bg-gray-800"
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
                <div 
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8" 
                    ref={productsRef}
                >
                    {!isLoading && records.length > 0 ? (
                        records.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleProductClick(item)}
                                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 flex flex-col relative"
                            >
                                {/* Discount Badge */}
                                {item.discount_percent > 0 && (
                                    <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full z-20 shadow-md">
                                        {item.discount_percent}% OFF
                                    </div>
                                )}

                                {/* Product Image */}
                                <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                                    <img
                                        src={item.mainImage}
                                        alt={item.name || 'Product'}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                                        onError={(e) => {
                                            e.target.src = '/default-product-image.jpg';
                                        }}
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex flex-col justify-between flex-grow p-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 truncate mb-1">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                                            {item.description}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm">
                                            {item.discount_percent > 0 && item.original_price && (
                                                <p className="text-gray-400 line-through">
                                                    Rs {parseFloat(item.original_price).toLocaleString()}
                                                </p>
                                            )}
                                            <p className="text-red-600 font-bold">
                                                Rs {parseFloat(item.final_price || item.price || 0).toLocaleString()}
                                            </p>
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
                            <div key={index} className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg animate-pulse">
                                <div className="w-full h-48 bg-gray-700"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-700 rounded w-full"></div>
                                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                                    <div className="h-8 bg-gray-700 rounded w-full mt-4"></div>
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
                            <h3 className="mt-4 text-lg font-medium text-white">No sale products found</h3>
                            <p className="mt-1 text-gray-400">Try checking back later for new deals</p>
                        </div>
                    )}
                </div>

                {/* Enhanced Pagination Controls */}
                {!isLoading && records.length > 0 && pagination.totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
                        <div className="flex items-center gap-2 flex-wrap justify-center">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPrevious || isLoading}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    !pagination.hasPrevious || isLoading
                                        ? 'bg-gray-700 cursor-not-allowed text-gray-500' 
                                        : 'bg-white hover:bg-gray-200 text-black'
                                }`}
                            >
                                Previous
                            </button>
                            
                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {getPageNumbers().map((pageNum, index) => {
                                    if (pageNum === '...') {
                                        return (
                                            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
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
                                                    ? 'bg-white text-black font-semibold' 
                                                    : 'bg-gray-800 border border-gray-600 hover:bg-gray-700 text-white'
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
                                        ? 'bg-gray-700 cursor-not-allowed text-gray-500' 
                                        : 'bg-white hover:bg-gray-200 text-black'
                                }`}
                            >
                                Next
                            </button>
                        </div>

                        {/* Page info */}
                        <div className="text-white text-sm">
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

export default PublicSalesProductsCom;