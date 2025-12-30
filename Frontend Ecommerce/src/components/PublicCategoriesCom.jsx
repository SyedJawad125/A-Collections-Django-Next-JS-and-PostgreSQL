// 'use client'
// import React, { useEffect, useState, useRef } from 'react';
// import { useRouter } from 'next/navigation';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";

// const PublicCategory = () => {
//     const router = useRouter();
//     const [records, setRecords] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [products, setProducts] = useState([]);
//     const [sliderHeight, setSliderHeight] = useState('auto');
//     const categoriesRef = useRef(null);
//     const resizeObserverRef = useRef(null);
//     const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    
//     // Simplified pagination state
//     const [pagination, setPagination] = useState({
//         currentPage: 1,
//         limit: 24,
//         totalPages: 1,
//         totalCount: 0,
//         hasNext: false,
//         hasPrevious: false
//     });

//     // Fetch categories with pagination
//     const fetchCategories = async (page = 1, limit = 24) => {
//         setLoading(true);
//         try {
//             const res = await AxiosInstance.get(
//                 `/api/myapp/v1/public/category/`,
//                 {
//                     params: {
//                         page: page,
//                         limit: limit,
//                         api_type: 'list'
//                     }
//                 }
//             );
            
//             // Parse response according to backend structure
//             const responseData = res?.data;
            
//             if (!responseData || !responseData.data) {
//                 console.error('Invalid response structure:', res?.data);
//                 toast.error('Invalid response from server');
//                 setRecords([]);
//                 return;
//             }
            
//             // Get the data array directly
//             const dataArr = Array.isArray(responseData.data) ? responseData.data : [];
            
//             console.log('Categories fetched:', dataArr.length);
//             setRecords(dataArr);
            
//             // Calculate pagination values using count from response
//             const totalCount = responseData.count || dataArr.length;
//             const totalPages = Math.ceil(totalCount / limit);
            
//             setPagination({
//                 currentPage: page,
//                 limit: limit,
//                 totalPages: totalPages,
//                 totalCount: totalCount,
//                 hasNext: page < totalPages,
//                 hasPrevious: page > 1
//             });
            
//         } catch (error) {
//             console.error('Error fetching categories:', error);
//             console.error('Error details:', error.response?.data);
            
//             toast.error(
//                 error.response?.data?.message || 'Failed to load categories',
//                 {
//                     position: "top-center",
//                     autoClose: 3000,
//                     hideProgressBar: true,
//                     closeOnClick: true,
//                     pauseOnHover: true,
//                     draggable: true,
//                     theme: "light",
//                 }
//             );
//             setRecords([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Fetch products for the slider - FIXED
//     const fetchProducts = async () => {
//         try {
//             const res = await AxiosInstance.get(
//                 `/api/myapp/v1/public/product/`,
//                 {
//                     params: {
//                         page: 1,
//                         limit: 20,
//                         api_type: 'list'
//                     }
//                 }
//             );
            
//             // Parse response the same way as categories
//             const responseData = res?.data;
//             if (!responseData || !responseData.data) {
//                 console.log('No products data in response');
//                 return;
//             }
            
//             const dataArr = Array.isArray(responseData.data) ? responseData.data : [];
//             console.log('Products fetched for slider:', dataArr.length);
            
//             // Process the products to include proper image URLs
//             const processedProducts = dataArr.map(product => {
//                 // Get image URLs - they're already complete URLs from the API
//                 const imageUrls = product.image_urls || [];
                
//                 // Use the first image, or fallback
//                 let mainImage = '/default-product-image.jpg';
                
//                 if (imageUrls.length > 0) {
//                     // Check if the URL is already complete (has http:// or https://)
//                     const firstImageUrl = imageUrls[0];
//                     if (firstImageUrl.startsWith('http://') || firstImageUrl.startsWith('https://')) {
//                         mainImage = firstImageUrl;
//                     } else {
//                         // If not complete, prepend baseURL
//                         mainImage = `${baseURL}${firstImageUrl.startsWith('/') ? '' : '/'}${firstImageUrl}`;
//                     }
//                 }
                
//                 return {
//                     ...product,
//                     mainImage: mainImage
//                 };
//             });
            
//             console.log('Processed products:', processedProducts.length);
//             setProducts(processedProducts);
            
//         } catch (error) {
//             console.error('Error fetching products for slider:', error);
//             console.error('Error details:', error.response?.data);
//         }
//     };

//     // Initial data fetch
//     useEffect(() => {
//         const searchParams = new URLSearchParams(window.location.search);
//         const message = searchParams.get('message');
//         if (message) {
//             toast.success(message);
//             router.replace('/categories');
//         }

//         const fetchInitialData = async () => {
//             await fetchCategories();
//             await fetchProducts();
//         };

//         fetchInitialData();
//     }, []);

//     // Handle page change
//     const handlePageChange = (newPage) => {
//         if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
//             fetchCategories(newPage, pagination.limit);
//             // Scroll to top when page changes
//             window.scrollTo({ top: 0, behavior: 'smooth' });
//         }
//     };

//     // Handle limit change
//     const handleLimitChange = (e) => {
//         const newLimit = parseInt(e.target.value);
//         fetchCategories(1, newLimit);
//     };

//     // Update slider height when records change or window resizes
//     useEffect(() => {
//         const updateSliderHeight = () => {
//             if (categoriesRef.current) {
//                 const categoriesHeight = categoriesRef.current.offsetHeight;
//                 setSliderHeight(`${categoriesHeight}px`);
//             }
//         };

//         if (!resizeObserverRef.current && categoriesRef.current) {
//             resizeObserverRef.current = new ResizeObserver(updateSliderHeight);
//             resizeObserverRef.current.observe(categoriesRef.current);
//         }

//         updateSliderHeight();

//         return () => {
//             if (resizeObserverRef.current) {
//                 resizeObserverRef.current.disconnect();
//             }
//         };
//     }, [records]);

//     // Handle category click
//     const handleCategoryClick = (categoryId) => {
//         router.push(`/categorywiseproductpage?categoryId=${categoryId}`);
//     };

//     // Handle product click
//     const handleProductClick = (product) => {
//         const queryString = new URLSearchParams({
//             ProductId: product.id.toString(),
//             productData: JSON.stringify(product)
//         }).toString();
//         router.push(`/productdetailpage?${queryString}`);
//     };

//     // Generate page numbers for pagination
//     const getPageNumbers = () => {
//         const { currentPage, totalPages } = pagination;
//         const pages = [];
        
//         if (totalPages <= 7) {
//             for (let i = 1; i <= totalPages; i++) {
//                 pages.push(i);
//             }
//         } else {
//             pages.push(1);
            
//             if (currentPage <= 3) {
//                 pages.push(2, 3, 4, 5);
//                 pages.push('...');
//                 pages.push(totalPages);
//             } else if (currentPage >= totalPages - 2) {
//                 pages.push('...');
//                 pages.push(totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
//             } else {
//                 pages.push('...');
//                 pages.push(currentPage - 1, currentPage, currentPage + 1);
//                 pages.push('...');
//                 pages.push(totalPages);
//             }
//         }
        
//         return pages;
//     };

//     // Helper function to get proper image URL
//     const getImageUrl = (imageUrl) => {
//         if (!imageUrl) return null;
        
//         // If image URL already starts with http:// or https://, use it directly
//         if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
//             return imageUrl;
//         }
        
//         // Otherwise, prepend baseURL
//         const separator = imageUrl.startsWith('/') ? '' : '/';
//         return `${baseURL}${separator}${imageUrl}`;
//     };

//     return (
//         <div className="flex min-h-screen bg-gray-50">
//             {/* Left Side - Products Slider */}
//             <div className="w-[10%] bg-gray-100 shadow-lg relative overflow-hidden ml-2" style={{ height: sliderHeight }}>
//                 {products.length > 0 ? (
//                     <>
//                         <div className="absolute top-0 left-0 right-0 animate-scrollUp">
//                             {[...products, ...products].map((product, index) => (
//                                 <div
//                                     key={`${product.id}-${index}`}
//                                     onClick={() => handleProductClick(product)}
//                                     className="shadow-md cursor-pointer p-2 hover:bg-gray-400 transition duration-300"
//                                 >
//                                     <img
//                                         src={product.mainImage}
//                                         className="w-full h-28 object-cover rounded"
//                                         alt={product.name || 'Product'}
//                                         onError={(e) => {
//                                             console.log('Product image failed to load:', product.mainImage);
//                                             e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2R1Y3Q8L3RleHQ+PC9zdmc+';
//                                         }}
//                                     />
//                                     <div className="mt-1 text-xs text-center line-clamp-1 text-black">
//                                         {product.name}
//                                     </div>
//                                     {product.price && (
//                                         <div className="text-xs text-center font-semibold text-gray-700">
//                                             Rs. {product.price}
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                         <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-gray-100 to-transparent z-10 pointer-events-none" />
//                         <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-100 to-transparent z-10 pointer-events-none" />
//                     </>
//                 ) : (
//                     <div className="flex items-center justify-center h-full text-gray-400 text-xs p-4 text-center">
//                         No products available
//                     </div>
//                 )}
//             </div>

//             {/* Right Side - Categories */}
//             <div className="w-[85%] p-8" ref={categoriesRef}>
//                 <h2 className="text-4xl font-serif text-gray-900 font-bold -mb-10 mt-10 text-center tracking-wider">
//                     Collections
//                 </h2>

//                 <br /><br />
//                 {/* Categories count and items per page selector */}
//                 <div className="flex justify-between items-center mb-4">
//                     <div className="text-black text-sm sm:text-base">
//                         {records.length > 0 ? (
//                             <>
//                                 Showing <span className="font-semibold">{(pagination.currentPage - 1) * pagination.limit + 1}</span>
//                                 {' '}-{' '}
//                                 <span className="font-semibold">{Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)}</span>
//                                 {' '}of{' '}
//                                 <span className="font-semibold">{pagination.totalCount}</span> categories
//                             </>
//                         ) : (
//                             'No categories found'
//                         )}
//                     </div>
//                     <div className="flex items-center gap-2 text-black">
//                         <span className="text-sm">Items per page:</span>
//                         <select 
//                             value={pagination.limit}
//                             onChange={handleLimitChange}
//                             className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black bg-white"
//                             disabled={loading}
//                         >
//                             <option value="8">8</option>
//                             <option value="16">16</option>
//                             <option value="24">24</option>
//                             <option value="32">32</option>
//                         </select>
//                     </div>
//                 </div>

//                 {loading ? (
//                     // Loading skeleton
//                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-2">
//                         {Array.from({ length: pagination.limit }).map((_, index) => (
//                             <div key={index} className="bg-gray-100 rounded overflow-hidden shadow-lg animate-pulse border border-gray-200">
//                                 <div className="w-full h-40 bg-gray-200"></div>
//                                 <div className="p-4 space-y-2">
//                                     <div className="h-4 bg-gray-200 rounded w-3/4"></div>
//                                     <div className="h-3 bg-gray-200 rounded w-full"></div>
//                                     <div className="h-8 bg-gray-200 rounded w-full mt-2"></div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 ) : (
//                     <>
//                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-8 gap-2">
//                             {records.length > 0 ? (
//                                 records.map((item) => (
//                                     <div
//                                         key={item.id}
//                                         className="card-5 cursor-pointer group relative mb-2"
//                                         onClick={() => handleCategoryClick(item.id)}
//                                     >
//                                         <div className="relative w-full h-40 overflow-hidden">
//                                             <img
//                                                 src={getImageUrl(item.image) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmFmYWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
//                                                 className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-105 border border-black"
//                                                 alt={item.name || 'Category'}
//                                                 onError={(e) => {
//                                                     console.log('Image failed to load:', item.image);
//                                                     e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmFmYWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
//                                                 }}
//                                             />
//                                         </div>
//                                         <div className="card-body5 p-4">
//                                             <h5 className="text-black text-sm font-medium -m-6 p-3 line-clamp-1">{item.name}</h5>
//                                             <p className="text-black text-xs mt-1 -m-6 p-3 line-clamp-2">Des: {item.description}</p>
//                                             <button className="mt-2 w-full py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition-all duration-300 font-medium">
//                                                 View Products
//                                             </button>
//                                         </div>
//                                     </div>
//                                 ))
//                             ) : (
//                                 <div className="col-span-full text-center py-16">
//                                     <svg
//                                         className="mx-auto h-12 w-12 text-gray-400"
//                                         fill="none"
//                                         stroke="currentColor"
//                                         viewBox="0 0 24 24"
//                                     >
//                                         <path
//                                             strokeLinecap="round"
//                                             strokeLinejoin="round"
//                                             strokeWidth={1}
//                                             d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
//                                         />
//                                     </svg>
//                                     <h3 className="mt-4 text-lg font-medium text-black">No categories found</h3>
//                                     <p className="mt-1 text-gray-600">Check back later for new collections</p>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Pagination Controls */}
//                         {!loading && records.length > 0 && pagination.totalPages > 1 && (
//                             <div className="flex flex-col sm:flex-row justify-center items-center mt-8 gap-4">
//                                 <div className="flex items-center gap-2 flex-wrap justify-center">
//                                     {/* Previous Button */}
//                                     <button
//                                         onClick={() => handlePageChange(pagination.currentPage - 1)}
//                                         disabled={!pagination.hasPrevious || loading}
//                                         className={`px-4 py-2 rounded-lg transition-colors ${
//                                             !pagination.hasPrevious || loading
//                                                 ? 'bg-gray-100 cursor-not-allowed text-gray-400 border border-gray-200' 
//                                                 : 'bg-black hover:bg-gray-800 text-white'
//                                         }`}
//                                     >
//                                         Previous
//                                     </button>
                                    
//                                     {/* Page Numbers */}
//                                     <div className="flex items-center gap-1">
//                                         {getPageNumbers().map((pageNum, index) => {
//                                             if (pageNum === '...') {
//                                                 return (
//                                                     <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
//                                                         ...
//                                                     </span>
//                                                 );
//                                             }
                                            
//                                             return (
//                                                 <button
//                                                     key={pageNum}
//                                                     onClick={() => handlePageChange(pageNum)}
//                                                     disabled={loading}
//                                                     className={`px-3 py-2 rounded-lg transition-colors min-w-[40px] border ${
//                                                         pagination.currentPage === pageNum 
//                                                             ? 'bg-black text-white font-semibold border-black' 
//                                                             : 'bg-white border-gray-300 hover:bg-gray-50 text-black'
//                                                     }`}
//                                                 >
//                                                     {pageNum}
//                                                 </button>
//                                             );
//                                         })}
//                                     </div>
                                    
//                                     {/* Next Button */}
//                                     <button
//                                         onClick={() => handlePageChange(pagination.currentPage + 1)}
//                                         disabled={!pagination.hasNext || loading}
//                                         className={`px-4 py-2 rounded-lg transition-colors ${
//                                             !pagination.hasNext || loading
//                                                 ? 'bg-gray-100 cursor-not-allowed text-gray-400 border border-gray-200' 
//                                                 : 'bg-black hover:bg-gray-800 text-white'
//                                         }`}
//                                     >
//                                         Next
//                                     </button>
//                                 </div>

//                                 {/* Page info */}
//                                 <div className="text-black text-sm">
//                                     Page {pagination.currentPage} of {pagination.totalPages}
//                                 </div>
//                             </div>
//                         )}
//                     </>
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
//                 theme="light"
//             />

//             <style jsx>{`
//                 @keyframes scrollUp {
//                     0% {
//                         transform: translateY(0);
//                     }
//                     100% {
//                         transform: translateY(-${products.length * 144}px);
//                     }
//                 }
//                 .animate-scrollUp {
//                     animation: scrollUp ${products.length * 5}s linear infinite;
//                 }
//                 .line-clamp-1 {
//                     display: -webkit-box;
//                     -webkit-line-clamp: 1;
//                     -webkit-box-orient: vertical;
//                     overflow: hidden;
//                 }
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

// export default PublicCategory;


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
            
            // Parse response according to backend structure
            const responseData = res?.data;
            
            if (!responseData || !responseData.data) {
                console.error('Invalid response structure:', res?.data);
                toast.error('Invalid response from server');
                setRecords([]);
                return;
            }
            
            // Get the data array directly
            const dataArr = Array.isArray(responseData.data) ? responseData.data : [];
            
            console.log('Categories fetched:', dataArr.length);
            setRecords(dataArr);
            
            // Calculate pagination values using count from response
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
            
            // Parse response the same way as categories
            const responseData = res?.data;
            if (!responseData || !responseData.data) {
                console.log('No products data in response');
                return;
            }
            
            const dataArr = Array.isArray(responseData.data) ? responseData.data : [];
            console.log('Products fetched for slider:', dataArr.length);
            
            // Process the products to include proper image URLs
            const processedProducts = dataArr.map(product => {
                // Get image URLs - they're already complete URLs from the API
                const imageUrls = product.image_urls || [];
                
                // Use the first image, or fallback
                let mainImage = '/default-product-image.jpg';
                
                if (imageUrls.length > 0) {
                    // Check if the URL is already complete (has http:// or https://)
                    const firstImageUrl = imageUrls[0];
                    if (firstImageUrl.startsWith('http://') || firstImageUrl.startsWith('https://')) {
                        mainImage = firstImageUrl;
                    } else {
                        // If not complete, prepend baseURL
                        mainImage = `${baseURL}${firstImageUrl.startsWith('/') ? '' : '/'}${firstImageUrl}`;
                    }
                }
                
                return {
                    ...product,
                    mainImage: mainImage
                };
            });
            
            console.log('Processed products:', processedProducts.length);
            setProducts(processedProducts);
            
        } catch (error) {
            console.error('Error fetching products for slider:', error);
            console.error('Error details:', error.response?.data);
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

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
            fetchCategories(newPage, pagination.limit);
            // Scroll to categories section
            if (categoriesRef.current) {
                categoriesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    // Handle limit change
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

    // Handle category click
    const handleCategoryClick = (categoryId) => {
        router.push(`/categorywiseproductpage?categoryId=${categoryId}`);
    };

    // Handle product click
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

    // Helper function to get proper image URL
    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        
        // If image URL already starts with http:// or https://, use it directly
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            return imageUrl;
        }
        
        // Otherwise, prepend baseURL
        const separator = imageUrl.startsWith('/') ? '' : '/';
        return `${baseURL}${separator}${imageUrl}`;
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Left Side - Products Slider */}
            <div className="w-[12%] bg-gray-100 shadow-lg ml-4 relative overflow-hidden" style={{ height: sliderHeight }}>
                {products.length > 0 ? (
                    <>
                        <div className="absolute top-0 left-0 right-0 animate-scrollUp">
                            {[...products, ...products].map((product, index) => (
                                <div
                                    key={`${product.id}-${index}`}
                                    onClick={() => handleProductClick(product)}
                                    className="shadow-md cursor-pointer p-2 hover:bg-gray-200 transition duration-300 m-2 rounded-lg bg-white"
                                >
                                    <img
                                        src={product.mainImage}
                                        alt={product.name || 'Product'}
                                        className="w-full h-28 object-cover rounded"
                                        onError={(e) => {
                                            console.log('Product image failed to load:', product.mainImage);
                                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlByb2R1Y3Q8L3RleHQ+PC9zdmc+';
                                        }}
                                    />
                                    <p className="text-center text-sm font-medium text-gray-800 mt-2 truncate">
                                        {product.name}
                                    </p>
                                    {product.price && (
                                        <p className="text-center text-xs font-semibold text-red-600 mt-1">
                                            Rs {parseFloat(product.price || 0).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-gray-100 to-transparent z-10 pointer-events-none" />
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-gray-100 to-transparent z-10 pointer-events-none" />
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-xs p-4 text-center">
                        No products available
                    </div>
                )}
            </div>

            {/* Right Side - Categories */}
            <div className="w-[85%] p-4" ref={categoriesRef}>
                <h2 className="text-3xl font-serif text-gray-900 font-bold text-center tracking-wider mb-8 mt-4">
                    Collections
                </h2>

                {/* Categories count and items per page selector */}
                <div className="flex justify-between items-center mb-6 flex-wrap gap-4 bg-white p-4 rounded-lg shadow">
                    <div className="text-gray-700 text-sm sm:text-base">
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
                        <span className="text-gray-700 text-sm">Items per page:</span>
                        <select 
                            value={pagination.limit}
                            onChange={handleLimitChange}
                            className="border border-gray-300 rounded p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-800"
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
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
                        <p className="mt-4 text-gray-600">Loading categories...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                            {records.length > 0 ? (
                                records.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group border border-gray-200"
                                        onClick={() => handleCategoryClick(item.id)}
                                    >
                                        <div className="relative overflow-hidden">
                                            <img
                                                src={getImageUrl(item.image) || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmFmYWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='}
                                                className="w-full h-48 object-cover transform transition-transform duration-300 group-hover:scale-110"
                                                alt={item.name || 'Category'}
                                                onError={(e) => {
                                                    console.log('Image failed to load:', item.image);
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmFmYWZhIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                                                }}
                                            />
                                        </div>
                                        <div className="p-3">
                                            <h5 className="text-gray-900 font-semibold text-sm truncate mb-1">
                                                {item.name}
                                            </h5>
                                            <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                                                {item.description}
                                            </p>
                                            <button className="w-full mt-3 py-2 bg-gray-900 text-white text-xs font-medium rounded hover:bg-black transition-colors duration-300">
                                                View Products
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
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                        />
                                    </svg>
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">No categories available</h3>
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
                        transform: translateY(-${products.length * 160}px);
                    }
                }
                .animate-scrollUp {
                    animation: scrollUp ${products.length * 8}s linear infinite;
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
            `}</style>
        </div>
    );
};

export default PublicCategory;