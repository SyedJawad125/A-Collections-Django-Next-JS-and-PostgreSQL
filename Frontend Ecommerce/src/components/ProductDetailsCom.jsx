// 'use client';
// import React, { useEffect, useState, useRef } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import AxiosInstance from "@/components/AxiosInstance";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useCart } from '@/components/CartContext';

// const ProductDetailsCom = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const sliderRef = useRef(null);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isHovered, setIsHovered] = useState(false);

//   const [product, setProduct] = useState(null);
//   const [mainImage, setMainImage] = useState('');
//   const [quantity, setQuantity] = useState(1);
//   const { addToCart } = useCart();
//   const [loading, setLoading] = useState(true);
//   const [reviews, setReviews] = useState([]);
//   const [reviewLoading, setReviewLoading] = useState(true);
//   const [newReview, setNewReview] = useState({
//     rating: 5,
//     comment: '',
//     name: '',
//     email: ''
//   });

//   const [featuredProducts, setFeaturedProducts] = useState([]);
//   const [productVariants, setProductVariants] = useState([]);
//   const [colors, setColors] = useState([]);
//   const [selectedVariant, setSelectedVariant] = useState(null);
//   const [selectedColor, setSelectedColor] = useState(null);
//   const [variantLoading, setVariantLoading] = useState(true);
//   const [inventoryData, setInventoryData] = useState({});

//   const ProductId = searchParams.get('ProductId');

//   // Helper function to process image URL
//   const processImageUrl = (url) => {
//     // First, check if it's an empty URL
//     if (!url || url.trim() === '') {
//       // Return a reliable fallback - either a local file or external URL
//       return '/images/default-product.jpg';
//     }
    
//     // If URL already starts with http:// or https://, return as is
//     if (url.startsWith('http://') || url.startsWith('https://')) {
//       return url;
//     }
    
//     // Otherwise, it's a relative path, so add the base URL
//     const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
//     const cleanUrl = url.startsWith('/') ? url : `/${url}`;
//     return `${baseURL}${cleanUrl}`;
//   };

//   // Helper function to process product data
//   const processProductData = (productData) => {
//     if (!productData) return null;

//     // Handle single image or image array
//     let imageUrls = [];
//     if (Array.isArray(productData.image_urls) && productData.image_urls.length > 0) {
//       imageUrls = productData.image_urls;
//     } else if (productData.image_urls && typeof productData.image_urls === 'string') {
//       imageUrls = [productData.image_urls];
//     } else if (productData.image) {
//       imageUrls = [productData.image];
//     }

//     const firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

//     return {
//       ...productData,
//       id: productData.id || productData.product_id,
//       name: productData.name || productData.product_name,
//       description: productData.description || productData.product_description,
//       price: productData.price || productData.product_price,
//       mainImage: processImageUrl(firstImageUrl),
//       processedImageUrls: imageUrls.map(url => processImageUrl(url)),
//       original_price: productData.original_price || productData.price || productData.product_price,
//       final_price: productData.final_price || productData.price || productData.product_price,
//       discount_percent: productData.discount_percent || 0,
//       stock: productData.stock || productData.quantity_available,
//       category: productData.category || productData.product_category,
//       sku: productData.sku || productData.product_sku,
//       longDescription: productData.long_description || productData.full_description
//     };
//   };

//   // Fetch product variants for this product
//   const fetchProductVariants = async () => {
//     if (!ProductId) return;
    
//     setVariantLoading(true);
//     try {
//       const res = await AxiosInstance.get('/api/myapp/v1/public/product/variant/', {
//         params: {
//           product: ProductId,
//           is_active: true
//         }
//       });
      
//       const variantsData = res?.data?.data || [];
//       setProductVariants(variantsData);
      
//       // Auto-select first variant if available
//       if (variantsData.length > 0) {
//         setSelectedVariant(variantsData[0]);
//       }
      
//       console.log('Product variants:', variantsData);
//     } catch (error) {
//       console.error('Error fetching product variants:', error);
//       setProductVariants([]);
//     } finally {
//       setVariantLoading(false);
//     }
//   };

//   // Fetch all colors
//   const fetchColors = async () => {
//     try {
//       const res = await AxiosInstance.get('/api/myapp/v1/public/color/');
//       const colorsData = res?.data?.data || [];
//       setColors(colorsData);
//       console.log('Available colors:', colorsData);
//     } catch (error) {
//       console.error('Error fetching colors:', error);
//       setColors([]);
//     }
//   };

//   // Fetch inventory data for variants
//   const fetchInventoryData = async () => {
//     if (!ProductId) return;
    
//     try {
//       const res = await AxiosInstance.get('/api/myapp/v1/public/inventory/', {
//         params: {
//           product: ProductId
//         }
//       });
      
//       const inventoryList = res?.data?.data || [];
      
//       // Create a map of variant_id -> inventory data
//       const inventoryMap = {};
//       inventoryList.forEach(inv => {
//         if (inv.product_variant) {
//           inventoryMap[inv.product_variant] = inv;
//         }
//       });
      
//       setInventoryData(inventoryMap);
//       console.log('Inventory data:', inventoryMap);
//     } catch (error) {
//       console.error('Error fetching inventory data:', error);
//       setInventoryData({});
//     }
//   };

//   useEffect(() => {
//     if (!ProductId) {
//       console.error('No ProductId found in URL');
//       toast.error('No product ID found');
//       return;
//     }

//     const fetchProductAndReviews = async () => {
//       setLoading(true);

//       try {
//         console.log('Fetching product with ID:', ProductId);
        
//         // Fetch product from API
//         const res = await AxiosInstance.get(`/api/myapp/v1/public/product/`, {
//           params: {
//             id: ProductId
//           }
//         });

//         console.log('Product API Response:', res.data);

//         if (res?.data?.data) {
//           // Handle different response structures
//           let fetchedProduct;
          
//           if (Array.isArray(res.data.data)) {
//             fetchedProduct = res.data.data[0];
//           } else if (res.data.data.data && Array.isArray(res.data.data.data)) {
//             fetchedProduct = res.data.data.data[0];
//           } else if (typeof res.data.data === 'object') {
//             fetchedProduct = res.data.data;
//           } else {
//             throw new Error('Unexpected API response structure');
//           }
          
//           console.log('Fetched Product:', fetchedProduct);
          
//           const processedProduct = processProductData(fetchedProduct);
          
//           setProduct(processedProduct);
//           setMainImage(processedProduct.mainImage);
          
//           console.log('Processed Product:', processedProduct);
//         } else {
//           throw new Error('No product data found');
//         }
//       } catch (error) {
//         console.error('Error fetching product:', error);
//         console.error('Error details:', error.response?.data);
//         toast.error('Failed to load product details.');
//       } finally {
//         setLoading(false);
//       }

//       // Fetch reviews for this product
//       if (ProductId) {
//         setReviewLoading(true);
//         try {
//           const response = await AxiosInstance.get(`/api/myapp/v1/public/reviews/`, {
//             params: {
//               product: ProductId
//             }
//           });
          
//           console.log('Reviews Response:', response.data);
          
//           if (response.data?.data) {
//             const reviewsData = Array.isArray(response.data.data) 
//               ? response.data.data 
//               : response.data.data?.reviews || response.data.data?.data || [];
            
//             setReviews(reviewsData);
//           } else {
//             setReviews([]);
//           }
//         } catch (error) {
//           console.error('Error fetching reviews:', error);
//           setReviews([]);
//         } finally {
//           setReviewLoading(false);
//         }
//       }
//     };

//     const fetchFeaturedProducts = async () => {
//       try {
//         const res = await AxiosInstance.get('/api/myapp/v1/public/product/', {
//           params: {
//             limit: 8
//           }
//         });
        
//         console.log('Featured Products Response:', res.data);
        
//         if (res?.data?.data) {
//           let dataArr = [];
          
//           if (Array.isArray(res.data.data)) {
//             dataArr = res.data.data;
//           } else if (res.data.data.data && Array.isArray(res.data.data.data)) {
//             dataArr = res.data.data.data;
//           }
          
//           setFeaturedProducts(
//             dataArr.slice(0, 8).map(product => processProductData(product))
//           );
//         }
//       } catch (error) {
//         console.error('Error fetching featured products:', error);
//       }
//     };

//     fetchProductAndReviews();
//     fetchFeaturedProducts();
//     fetchProductVariants();
//     fetchColors();
//     fetchInventoryData();
//   }, [ProductId]);

//   useEffect(() => {
//     if (featuredProducts.length <= 1 || isHovered) return;

//     const slider = sliderRef.current;
//     if (!slider) return;

//     const interval = setInterval(() => {
//       setCurrentIndex(prev => {
//         const itemWidth = slider.firstChild?.offsetWidth || 300;
//         const newScrollPos = (prev + 1) * itemWidth;
//         const maxScrollLeft = slider.scrollWidth - slider.clientWidth;

//         if (newScrollPos >= maxScrollLeft && featuredProducts.length > 0) {
//           slider.scrollTo({ left: 0, behavior: 'instant' });
//           return 0;
//         } else {
//           slider.scrollTo({ left: newScrollPos, behavior: 'smooth' });
//           return (prev + 1) % featuredProducts.length;
//         }
//       });
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [featuredProducts.length, isHovered]);

//   const handleBackButton = () => {
//     router.push('/publicproducts');
//   };

//   const handleAddToCart = () => {
//     if (product) {
//       const cartProduct = {
//         ...product,
//         id: product.id,
//         name: product.name,
//         description: product.description,
//         image_urls: product.processedImageUrls,
//         quantity: quantity,
//         price: product.final_price || product.price,
//         original_price: product.original_price || product.price,
//         isSalesProduct: false, // This is regular product, not sales
//         // Add variant information if selected
//         variant: selectedVariant,
//         color: selectedColor
//       };

//       addToCart(cartProduct, quantity);
//       toast.success('Product added to cart!');
//       router.push('/addtocart');
//     } else {
//       console.error('No product to add to cart');
//       toast.error('Failed to add product to cart');
//     }
//   };

//   const handleVariantSelect = (variant) => {
//     setSelectedVariant(variant);
//     // Update price based on variant
//     if (variant.additional_price) {
//       const basePrice = parseFloat(product.final_price || product.price || 0);
//       const additionalPrice = parseFloat(variant.additional_price || 0);
//       // You could update a display price here if needed
//     }
//   };

//   const handleColorSelect = (color) => {
//     setSelectedColor(color);
//   };

//   const getStockStatus = (variantId) => {
//     const inventory = inventoryData[variantId];
//     if (!inventory) return { status: 'unknown', text: 'Stock unknown' };
    
//     const currentStock = inventory.current_stock || 0;
//     const minimumStock = inventory.minimum_stock_level || 5;
    
//     if (currentStock === 0) {
//       return { status: 'out', text: 'Out of Stock', color: 'red' };
//     } else if (currentStock <= minimumStock) {
//       return { status: 'low', text: `Low Stock (${currentStock} left)`, color: 'orange' };
//     } else {
//       return { status: 'available', text: 'In Stock', color: 'green' };
//     }
//   };

//   const increaseQuantity = () => {
//     setQuantity((prevQuantity) => prevQuantity + 1);
//   };

//   const decreaseQuantity = () => {
//     setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
//   };

//   const handleReviewChange = (e) => {
//     const { name, value } = e.target;
//     setNewReview(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleRatingChange = (rating) => {
//     setNewReview(prev => ({
//       ...prev,
//       rating
//     }));
//   };

//   const submitReview = async () => {
//     if (!newReview.name.trim()) {
//       toast.error('Please enter your name');
//       return;
//     }

//     if (!newReview.comment.trim()) {
//       toast.error('Please enter a review comment');
//       return;
//     }

//     try {
//       const reviewData = {
//         ...newReview,
//         product: ProductId, // Using 'product' instead of 'sales_product'
//         rating: parseInt(newReview.rating),
//         email: newReview.email.trim() || undefined
//       };

//       const res = await AxiosInstance.post('/api/myapp/v1/public/reviews/', reviewData);
      
//       if (res.data?.status === 'SUCCESS' || res.data?.data) {
//         toast.success('Review submitted successfully!');
//         setReviews(prev => [{
//           ...(res.data.data || reviewData),
//           created_at: new Date().toISOString()
//         }, ...prev]);
        
//         setNewReview({
//           rating: 5,
//           comment: '',
//           name: '',
//           email: ''
//         });
//       } else {
//         throw new Error(res.data?.message || 'Failed to submit review');
//       }
//     } catch (error) {
//       console.error('Error submitting review:', error);
//       toast.error(error.response?.data?.message || error.message || 'Failed to submit review');
//     }
//   };

//   const averageRating = reviews.length > 0 
//     ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
//     : 0;

//   const renderStars = (rating, interactive = false) => {
//     return (
//       <div className="flex">
//         {[...Array(5)].map((_, i) => (
//           <svg
//             key={i}
//             className={`w-6 h-6 ${i < rating ? 'text-amber-400' : 'text-gray-400'} ${
//               interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
//             }`}
//             fill="currentColor"
//             viewBox="0 0 20 20"
//             onClick={() => interactive && handleRatingChange(i + 1)}
//           >
//             <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//           </svg>
//         ))}
//       </div>
//     );
//   };

//   const formatDate = (dateString) => {
//     const options = { year: 'numeric', month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const scrollToItem = (direction) => {
//     const slider = sliderRef.current;
//     if (!slider) return;

//     const itemWidth = slider.firstChild?.offsetWidth || 300;
//     const scrollAmount = direction === 'left' ? -itemWidth : itemWidth;

//     slider.scrollBy({
//       left: scrollAmount,
//       behavior: 'smooth'
//     });
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen bg-gray-50">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-500"></div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="flex flex-col justify-center items-center h-screen text-gray-700 bg-gray-50">
//         <p className="text-xl mb-4">Product not found.</p>
//         <button 
//           onClick={() => router.push('/publicproducts')}
//           className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
//         >
//           Back to Products
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Navigation Bar */}
//       <nav className="bg-white shadow-sm py-4 px-8 flex justify-between items-center">
//         <button
//           onClick={handleBackButton}
//           className="flex items-center text-gray-700 hover:text-gold-600 transition-colors"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//           </svg>
//           Back to Products
//         </button>
//         <div className="flex items-center space-x-6">
//           <button className="text-gray-700 hover:text-gold-600 transition-colors">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
//             </svg>
//           </button>
//           <button className="text-gray-700 hover:text-gold-600 transition-colors">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//             </svg>
//           </button>
//         </div>
//       </nav>

//       {/* Main Product Section */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 -mt-8">
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
//             {/* Product Images */}
//             <div className="p-8">
//               <div className="relative h-96 w-full mb-6 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
//                 {mainImage ? (
//                   <img
//                     src={mainImage}
//                     alt={product.name}
//                     className="object-contain w-full h-full transition-transform duration-500 hover:scale-105"
//                     onError={(e) => {
//                       console.error('Image failed to load:', mainImage);
//                       e.target.onerror = null;
//                       e.target.src = '/images/default-product.jpg';
//                     }}
//                   />
//                 ) : (
//                   <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">
//                     <span>No image available</span>
//                   </div>
//                 )}
//               </div>
              
//               {/* Thumbnail Gallery */}
//               {product.processedImageUrls && product.processedImageUrls.length > 1 && (
//                 <div className="flex space-x-3 overflow-x-auto py-2 scrollbar-hide">
//                   {product.processedImageUrls.map((imgUrl, index) => (
//                     <div
//                       key={index}
//                       className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
//                         mainImage === imgUrl 
//                           ? 'border-gold-500 shadow-md' 
//                           : 'border-gray-200 hover:border-gray-300'
//                       }`}
//                       onClick={() => setMainImage(imgUrl)}
//                     >
//                       <img
//                         src={imgUrl}
//                         alt={`Thumbnail ${index + 1}`}
//                         className="object-cover w-full h-full"
//                         onError={(e) => { 
//                           console.error('Thumbnail failed to load:', imgUrl);
//                           e.target.onerror = null; 
//                           e.target.src = '/images/default-product.jpg'; 
//                         }}
//                       />
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Product Details */}
//             <div className="p-8 flex flex-col justify-center -mt-8">
//               <div className="mb-6">
//                 <span className="text-sm font-medium text-gold-600 uppercase tracking-wider">Premium Product</span>
//                 <h1 className="text-3xl font-serif font-bold text-gray-900 mt-2">{product.name}</h1>
//               </div>

//               <div className="flex items-center mb-6">
//                 <div className="flex items-center">
//                   {renderStars(Math.round(averageRating))}
//                   <span className="text-gray-600 ml-2">({reviews.length} reviews)</span>
//                 </div>
//                 <span className="ml-4 text-sm text-gray-500">|</span>
//                 <span className="ml-4 text-sm text-gray-500">SKU: {product.sku || product.id}</span>
//                 <span className="ml-4 text-sm text-gray-500">|</span>
//                 <span className="ml-4 text-sm text-gray-500">Category: {product.category}</span>
//               </div>

//               <div className="mb-8">
//                 <p className="text-gray-700 leading-relaxed">{product.description}</p>
//               </div>

//               <div className="mb-8">
//                 <div className="flex items-center">
//                   <span className="text-3xl font-serif font-bold text-gray-900">PKR {parseFloat(product.final_price || 0).toLocaleString()}</span>
//                   {product.original_price && parseFloat(product.original_price) > parseFloat(product.final_price) && (
//                     <>
//                       <span className="ml-3 text-lg text-gray-500 line-through">PKR {parseFloat(product.original_price || 0).toLocaleString()}</span>
//                       <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
//                         SAVE {product.discount_percent || Math.round(((product.original_price - product.final_price) / product.original_price * 100))}%
//                       </span>
//                     </>
//                   )}
//                 </div>
//               </div>
            
//               <div className="mb-8">
//                 <h3 className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">
//                   Quantity
//                 </h3>

//                 <div className="inline-flex items-center h-10 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-0.5 shadow-sm">
                  
//                   {/* Decrease */}
//                   <button
//                     onClick={decreaseQuantity}
//                     aria-label="Decrease quantity"
//                     className="group w-9 h-9 rounded-full flex items-center justify-center
//                               text-gray-600
//                               transition-all duration-300
//                               hover:bg-amber-600 hover:text-white
//                               active:scale-90"
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                       strokeWidth={1.8}
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M20 12H4"
//                       />
//                     </svg>
//                   </button>

//                   {/* Quantity */}
//                   <div className="min-w-[52px] px-2 text-center">
//                     <span className="text-base font-semibold tracking-wide text-gray-900">
//                       {quantity}
//                     </span>
//                   </div>

//                   {/* Increase */}
//                   <button
//                     onClick={increaseQuantity}
//                     aria-label="Increase quantity"
//                     className="group w-9 h-9 rounded-full flex items-center justify-center
//                               text-gray-600
//                               transition-all duration-300
//                               hover:bg-amber-600 hover:text-white
//                               active:scale-90"
//                   >
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                       strokeWidth={1.8}
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M12 4v16m8-8H4"
//                       />
//                     </svg>
//                   </button>

//                 </div>
//               </div>

//               {/* Product Variants Section */}
//               {!variantLoading && productVariants.length > 0 && (
//                 <div className="mb-8">
//                   <h3 className="text-sm font-medium text-gray-900 uppercase mb-3">Variants</h3>
//                   <div className="space-y-3">
//                     {productVariants.map((variant) => {
//                       const stockStatus = getStockStatus(variant.id);
//                       return (
//                         <div
//                           key={variant.id}
//                           onClick={() => handleVariantSelect(variant)}
//                           className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
//                             selectedVariant?.id === variant.id
//                               ? 'border-black bg-gray-50'
//                               : 'border-gray-200 hover:border-gray-300'
//                           }`}
//                         >
//                           <div className="flex justify-between items-start">
//                             <div>
//                               <div className="font-medium text-gray-900">
//                                 {variant.size && <span className="mr-2">Size: {variant.size}</span>}
//                                 {variant.material && <span>Material: {variant.material}</span>}
//                               </div>
//                               {variant.additional_price && parseFloat(variant.additional_price) > 0 && (
//                                 <div className="text-sm text-gray-600">
//                                   +PKR {parseFloat(variant.additional_price).toLocaleString()}
//                                 </div>
//                               )}
//                             </div>
//                             <div className={`text-sm font-medium ${
//                               stockStatus.color === 'red' ? 'text-red-600' :
//                               stockStatus.color === 'orange' ? 'text-orange-600' :
//                               'text-green-600'
//                             }`}>
//                               {stockStatus.text}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )}

//               {/* Colors Section */}
//               {colors.length > 0 && selectedVariant && (
//                 <div className="mb-8">
//                   <h3 className="text-sm font-medium text-gray-900 uppercase mb-3">Available Colors</h3>
//                   <div className="flex flex-wrap gap-3">
//                     {colors.map((color) => {
//                       const isColorAvailable = selectedVariant.colors && 
//                         selectedVariant.colors.includes(color.id);
                      
//                       return (
//                         <div
//                           key={color.id}
//                           onClick={() => isColorAvailable && handleColorSelect(color)}
//                           className={`relative w-10 h-10 rounded-full cursor-pointer transition-all ${
//                             !isColorAvailable 
//                               ? 'opacity-30 cursor-not-allowed grayscale' 
//                               : selectedColor?.id === color.id
//                                 ? 'ring-2 ring-offset-2 ring-black scale-110'
//                                 : 'hover:scale-105'
//                           }`}
//                           style={{ 
//                             backgroundColor: color.name.toLowerCase(),
//                             border: '1px solid #e5e7eb'
//                           }}
//                           title={color.name}
//                         >
//                           {selectedColor?.id === color.id && (
//                             <div className="absolute inset-0 flex items-center justify-center">
//                               <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                               </svg>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                   {selectedColor && (
//                     <p className="mt-2 text-sm text-gray-600">
//                       Selected: {selectedColor.name}
//                     </p>
//                   )}
//                 </div>
//               )}

//               {/* Stock Status for Selected Variant */}
//               {selectedVariant && (
//                 <div className="mb-8">
//                   {(() => {
//                     const stockStatus = getStockStatus(selectedVariant.id);
//                     return (
//                       <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                         stockStatus.color === 'red' ? 'bg-red-100 text-red-800' :
//                         stockStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
//                         'bg-green-100 text-green-800'
//                       }`}>
//                         {stockStatus.text}
//                       </div>
//                     );
//                   })()}
//                 </div>
//               )}

//               <button
//                 onClick={handleAddToCart}
//                 className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-6"
//               >
//                 Add to Cart
//               </button>

//               <div className="mb-8">
//                 <h3 className="text-sm font-medium text-gray-900 uppercase mb-3">Details</h3>
//                 <ul className="space-y-2 text-gray-700">
//                   <li className="flex items-center">
//                     <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                     </svg>
//                     Premium quality material
//                   </li>
//                   <li className="flex items-center">
//                     <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                     </svg>
//                     Authentic craftsmanship
//                   </li>
//                   <li className="flex items-center">
//                     <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                     </svg>
//                     Fast shipping available
//                   </li>
//                 </ul>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Reviews Section */}
//         <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
//           <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Customer Reviews</h2>
          
//           {/* Review Form */}
//           <div className="mb-8 p-6 bg-gray-50 rounded-lg">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
//               <div className="flex">
//                 {renderStars(newReview.rating, true)}
//               </div>
//             </div>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
//               <input
//                 type="text"
//                 name="name"
//                 value={newReview.name}
//                 onChange={handleReviewChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
//                 placeholder="Your name"
//               />
//             </div>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
//               <input
//                 type="email"
//                 name="email"
//                 value={newReview.email}
//                 onChange={handleReviewChange}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
//                 placeholder="your@email.com"
//               />
//             </div>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
//               <textarea
//                 name="comment"
//                 value={newReview.comment}
//                 onChange={handleReviewChange}
//                 rows="4"
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
//                 placeholder="Share your thoughts about this product..."
//               />
//             </div>
//             <button
//               onClick={submitReview}
//               className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
//             >
//               Submit Review
//             </button>
//           </div>

//           {/* Reviews List */}
//           {reviewLoading ? (
//             <div className="flex justify-center items-center py-8">
//               <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
//             </div>
//           ) : reviews.length > 0 ? (
//             <div className="space-y-6">
//               {reviews.map((review) => (
//                 <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
//                   <div className="flex items-center mb-2">
//                     {renderStars(review.rating)}
//                     <span className="ml-2 text-sm text-gray-500">{formatDate(review.created_at)}</span>
//                   </div>
//                   <p className="font-medium text-gray-900 mb-1">{review.name}</p>
//                   <p className="text-gray-700">{review.comment}</p>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
//           )}
//         </div>

//         {/* Featured Products */}
//         {featuredProducts.length > 0 && (
//           <div className="mt-12">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-serif font-bold text-gray-900">You May Also Like</h2>
//               <div className="flex space-x-2">
//                 <button
//                   onClick={() => scrollToItem('left')}
//                   className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                   </svg>
//                 </button>
//                 <button
//                   onClick={() => scrollToItem('right')}
//                   className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//             <div
//               ref={sliderRef}
//               className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
//               onMouseEnter={() => setIsHovered(true)}
//               onMouseLeave={() => setIsHovered(false)}
//             >
//               {featuredProducts.map((featuredProduct) => (
//                 <div
//                   key={featuredProduct.id}
//                   onClick={() => router.push(`/productdetailpage?ProductId=${featuredProduct.id}`)}
//                   className="flex-shrink-0 w-60 bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transform transition-all hover:shadow-lg hover:-translate-y-1"
//                 >
//                   <div className="relative h-64 w-full">
//                     <img
//                       src={featuredProduct.mainImage}
//                       alt={featuredProduct.name}
//                       className="object-cover w-full h-full"
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = '/images/default-product.jpg';
//                       }}
//                     />
//                   </div>
//                   <div className="p-4">
//                     <h3 className="font-medium text-gray-900 mb-2 truncate">{featuredProduct.name}</h3>
//                     <p className="text-gold-600 font-bold">PKR {parseFloat(featuredProduct.final_price || featuredProduct.price || 0).toLocaleString()}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>

//       <ToastContainer position="bottom-right" />
//     </div>
//   );
// };

// export default ProductDetailsCom;







'use client';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AxiosInstance from "@/components/AxiosInstance";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCart } from '@/components/CartContext';

const ProductDetailsCom = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '', email: '' });

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productVariants, setProductVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [variantLoading, setVariantLoading] = useState(true);
  const [inventoryData, setInventoryData] = useState({});

  const ProductId = searchParams.get('ProductId');

  /* ---------------- helpers ---------------- */

  const processImageUrl = (url) => {
    if (!url || url.trim() === '') return '/images/default-product.jpg';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const clean = url.startsWith('/') ? url : `/${url}`;
    return `${baseURL}${clean}`;
  };

  const processProductData = (p) => {
    if (!p) return null;
    let imageUrls = [];
    if (Array.isArray(p.image_urls) && p.image_urls.length) imageUrls = p.image_urls;
    else if (typeof p.image_urls === 'string') imageUrls = [p.image_urls];
    else if (p.image) imageUrls = [p.image];

    return {
      ...p,
      id: p.id || p.product_id,
      name: p.name || p.product_name,
      description: p.description || p.product_description,
      price: p.price || p.product_price,
      mainImage: processImageUrl(imageUrls[0] || null),
      processedImageUrls: imageUrls.map(processImageUrl),
      original_price: p.original_price || p.price || p.product_price,
      final_price: p.final_price || p.price || p.product_price,
      discount_percent: p.discount_percent || 0,
      stock: p.stock || p.quantity_available,
      category: p.category || p.product_category,
      sku: p.sku || p.product_sku,
      longDescription: p.long_description || p.full_description,
    };
  };

  /* ---------------- derived colour list ---------------- */
  // Colors come straight from the variant serializer — no /color/ call.
  const availableColors = useMemo(() => {
    if (!selectedVariant || !Array.isArray(selectedVariant.colors_data)) return [];
    return selectedVariant.colors_data;
  }, [selectedVariant]);

  /* ---------------- stock lookup ---------------- */
  const getStockStatus = (variantId) => {
    if (variantId === undefined || variantId === null) return null;
    const inv = inventoryData[String(variantId)];
    if (!inv) return null;                      // no record → render nothing
    const current = Number(inv.current_stock ?? 0);
    if (current === 0) return { status: 'out', text: 'Out of Stock', color: 'red' };
    if (inv.is_low_stock) return { status: 'low', text: `Low Stock (${current} left)`, color: 'orange' };
    return { status: 'available', text: 'In Stock', color: 'green' };
  };

  /* ---------------- fetchers ---------------- */

  const fetchProductVariants = async () => {
    if (!ProductId) return;
    setVariantLoading(true);
    setProductVariants([]);
    setSelectedVariant(null);
    setSelectedColor(null);

    try {
      // Backend now accepts ?product= (alias) — see PublicProductVariantFilter.
      const res = await AxiosInstance.get('/api/myapp/v1/public/product/variant/', {
        params: { product: ProductId, is_active: true }
      });

      const raw  = res?.data?.data;
      const list = Array.isArray(raw) ? raw : raw?.results || raw?.data || [];

      // Client-side safety net: only keep variants truly belonging to this product.
      const filtered = list.filter((v) => {
        const pid = (v && typeof v.product === 'object' && v.product !== null)
          ? v.product.id
          : v.product;
        return pid != null && String(pid) === String(ProductId);
      });

      setProductVariants(filtered);
      if (filtered.length > 0) setSelectedVariant(filtered[0]);
    } catch (err) {
      console.error('Error fetching product variants:', err);
      setProductVariants([]);
    } finally {
      setVariantLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    if (!ProductId) return;
    try {
      // Backend now accepts ?product= (alias) — see PublicInventoryFilter.
      const res = await AxiosInstance.get('/api/myapp/v1/public/inventory/', {
        params: { product: ProductId }
      });
      const raw  = res?.data?.data;
      const list = Array.isArray(raw) ? raw : raw?.results || raw?.data || [];

      const map = {};
      list.forEach((inv) => {
        const vid = (inv && typeof inv.product_variant === 'object' && inv.product_variant !== null)
          ? inv.product_variant.id
          : inv.product_variant;
        if (vid != null) map[String(vid)] = inv;
      });
      setInventoryData(map);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setInventoryData({});
    }
  };

  /* ---------------- main effect ---------------- */

  useEffect(() => {
    if (!ProductId) {
      console.error('No ProductId found in URL');
      toast.error('No product ID found');
      return;
    }

    const fetchProductAndReviews = async () => {
      setLoading(true);
      try {
        const res = await AxiosInstance.get(`/api/myapp/v1/public/product/`, {
          params: { id: ProductId }
        });

        let fetched;
        if (Array.isArray(res.data.data)) fetched = res.data.data[0];
        else if (res.data.data?.data && Array.isArray(res.data.data.data)) fetched = res.data.data.data[0];
        else if (typeof res.data.data === 'object') fetched = res.data.data;
        else throw new Error('Unexpected API response structure');

        const processed = processProductData(fetched);
        setProduct(processed);
        setMainImage(processed.mainImage);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }

      setReviewLoading(true);
      try {
        const response = await AxiosInstance.get(`/api/myapp/v1/public/reviews/`, {
          params: { product: ProductId }
        });
        const rd = response.data?.data;
        setReviews(Array.isArray(rd) ? rd : rd?.reviews || rd?.data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setReviewLoading(false);
      }
    };

    const fetchFeaturedProducts = async () => {
      try {
        const res = await AxiosInstance.get('/api/myapp/v1/public/product/', {
          params: { limit: 8 }
        });
        let dataArr = [];
        if (Array.isArray(res.data.data)) dataArr = res.data.data;
        else if (res.data.data?.data && Array.isArray(res.data.data.data)) dataArr = res.data.data.data;
        setFeaturedProducts(dataArr.slice(0, 8).map(processProductData));
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };

    fetchProductAndReviews();
    fetchFeaturedProducts();
    fetchProductVariants();
    fetchInventoryData();
    // ⛔ fetchColors() removed — global colour catalogue is not product-scoped.
  }, [ProductId]);

  /* ---------------- slider autoplay ---------------- */

  useEffect(() => {
    if (featuredProducts.length <= 1 || isHovered) return;
    const slider = sliderRef.current;
    if (!slider) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const w = slider.firstChild?.offsetWidth || 300;
        const next = (prev + 1) * w;
        const max = slider.scrollWidth - slider.clientWidth;
        if (next >= max && featuredProducts.length > 0) {
          slider.scrollTo({ left: 0, behavior: 'instant' });
          return 0;
        }
        slider.scrollTo({ left: next, behavior: 'smooth' });
        return (prev + 1) % featuredProducts.length;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [featuredProducts.length, isHovered]);

  /* ---------------- handlers ---------------- */

  const handleBackButton = () => router.push('/publicproducts');

  const handleAddToCart = () => {
    if (!product) {
      toast.error('Failed to add product to cart');
      return;
    }
    if (selectedVariant) {
      const stock = getStockStatus(selectedVariant.id);
      if (stock?.status === 'out') {
        toast.error('This variant is out of stock');
        return;
      }
    }

    addToCart({
      ...product,
      id: product.id,
      name: product.name,
      description: product.description,
      image_urls: product.processedImageUrls,
      quantity,
      price: product.final_price || product.price,
      original_price: product.original_price || product.price,
      isSalesProduct: false,
      variant: selectedVariant,
      color: selectedColor,
    }, quantity);

    toast.success('Product added to cart!');
    router.push('/addtocart');
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedColor(null);
  };

  const increaseQuantity = () => setQuantity((q) => q + 1);
  const decreaseQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview((p) => ({ ...p, [name]: value }));
  };
  const handleRatingChange = (rating) => setNewReview((p) => ({ ...p, rating }));

  const submitReview = async () => {
    if (!newReview.name.trim())    { toast.error('Please enter your name'); return; }
    if (!newReview.comment.trim()) { toast.error('Please enter a review comment'); return; }

    try {
      const reviewData = {
        ...newReview,
        product: ProductId,
        rating: parseInt(newReview.rating),
        email: newReview.email.trim() || undefined,
      };
      const res = await AxiosInstance.post('/api/myapp/v1/public/reviews/', reviewData);
      if (res.data?.status === 'SUCCESS' || res.data?.data) {
        toast.success('Review submitted successfully!');
        setReviews((prev) => [
          { ...(res.data.data || reviewData), created_at: new Date().toISOString() },
          ...prev,
        ]);
        setNewReview({ rating: 5, comment: '', name: '', email: '' });
      } else {
        throw new Error(res.data?.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to submit review');
    }
  };

  const averageRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const renderStars = (rating, interactive = false) => (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-6 h-6 ${i < rating ? 'text-amber-400' : 'text-gray-400'} ${
            interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          onClick={() => interactive && handleRatingChange(i + 1)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  const formatDate = (d) =>
    new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

  const scrollToItem = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const w = slider.firstChild?.offsetWidth || 300;
    slider.scrollBy({ left: direction === 'left' ? -w : w, behavior: 'smooth' });
  };

  /* ---------------- loading / not found ---------------- */

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-500" />
      </div>
    );
  }
  if (!product) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-gray-700 bg-gray-50">
        <p className="text-xl mb-4">Product not found.</p>
        <button
          onClick={() => router.push('/publicproducts')}
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Back to Products
        </button>
      </div>
    );
  }

  /* ---------------- render ---------------- */

  return (
  <div className="min-h-screen bg-gray-50">
    <nav className="bg-white shadow-sm py-4 px-8 flex justify-between items-center">
      <button
        onClick={handleBackButton}
        className="flex items-center text-gray-700 hover:text-gold-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Products
      </button>
    </nav>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 -mt-8">
      {/* ============ Product card ============ */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="p-8">
            <div className="relative h-96 w-full mb-6 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="object-contain w-full h-full transition-transform duration-500 hover:scale-105"
                  onError={(e) => { e.target.onerror = null; e.target.src = '/images/default-product.jpg'; }}
                />
              ) : (
                <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">
                  <span>No image available</span>
                </div>
              )}
            </div>

            {product.processedImageUrls?.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto py-2 scrollbar-hide">
                {product.processedImageUrls.map((imgUrl, index) => (
                  <div
                    key={index}
                    onClick={() => setMainImage(imgUrl)}
                    className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      mainImage === imgUrl ? 'border-gold-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="object-cover w-full h-full"
                      onError={(e) => { e.target.onerror = null; e.target.src = '/images/default-product.jpg'; }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-8 flex flex-col justify-center -mt-8">
            <div className="mb-6">
              <span className="text-sm font-medium text-gold-600 uppercase tracking-wider">Premium Product</span>
              <h1 className="text-3xl font-serif font-bold text-gray-900 mt-2">{product.name}</h1>
            </div>

            <div className="flex items-center mb-6">
              <div className="flex items-center">
                {renderStars(Math.round(averageRating))}
                <span className="text-gray-600 ml-2">({reviews.length} reviews)</span>
              </div>
              <span className="ml-4 text-sm text-gray-500">|</span>
              <span className="ml-4 text-sm text-gray-500">SKU: {product.sku || product.id}</span>
              {product.category && (
                <>
                  <span className="ml-4 text-sm text-gray-500">|</span>
                  <span className="ml-4 text-sm text-gray-500">Category: {product.category}</span>
                </>
              )}
            </div>

            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            <div className="mb-8">
              <div className="flex items-center">
                <span className="text-3xl font-serif font-bold text-gray-900">
                  PKR {parseFloat(product.final_price || 0).toLocaleString()}
                </span>
                {product.original_price && parseFloat(product.original_price) > parseFloat(product.final_price) && (
                  <>
                    <span className="ml-3 text-lg text-gray-500 line-through">
                      PKR {parseFloat(product.original_price).toLocaleString()}
                    </span>
                    <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                      SAVE {product.discount_percent || Math.round(((product.original_price - product.final_price) / product.original_price) * 100)}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-xs font-semibold tracking-[0.2em] text-gray-500 uppercase mb-4">Quantity</h3>
              <div className="inline-flex items-center h-10 rounded-full border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-0.5 shadow-sm">
                <button
                  onClick={decreaseQuantity}
                  aria-label="Decrease quantity"
                  className="group w-9 h-9 rounded-full flex items-center justify-center text-gray-600 transition-all hover:bg-amber-600 hover:text-white active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                  </svg>
                </button>
                <div className="min-w-[52px] px-2 text-center">
                  <span className="text-base font-semibold tracking-wide text-gray-900">{quantity}</span>
                </div>
                <button
                  onClick={increaseQuantity}
                  aria-label="Increase quantity"
                  className="group w-9 h-9 rounded-full flex items-center justify-center text-gray-600 transition-all hover:bg-amber-600 hover:text-white active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Variants */}
            {!variantLoading && productVariants.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 uppercase mb-3">Variants</h3>
                <div className="space-y-3">
                  {productVariants.map((variant) => {
                    const stock = getStockStatus(variant.id);
                    const selected = selectedVariant?.id === variant.id;
                    return (
                      <div
                        key={variant.id}
                        onClick={() => handleVariantSelect(variant)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selected ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">
                              {variant.size && <span className="mr-2">Size: {variant.size}</span>}
                              {variant.material && <span>Material: {variant.material}</span>}
                            </div>
                            {variant.additional_price && parseFloat(variant.additional_price) > 0 && (
                              <div className="text-sm text-gray-600">
                                +PKR {parseFloat(variant.additional_price).toLocaleString()}
                              </div>
                            )}
                          </div>
                          {stock && (
                            <div className={`text-sm font-medium ${
                              stock.color === 'red' ? 'text-red-600' :
                              stock.color === 'orange' ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {stock.text}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Colors */}
            {selectedVariant && availableColors.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 uppercase mb-3">Available Colors</h3>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => {
                    const isSel = selectedColor?.id === color.id;
                    return (
                      <div
                        key={color.id}
                        onClick={() => setSelectedColor(color)}
                        className={`relative w-10 h-10 rounded-full cursor-pointer transition-all ${
                          isSel ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex_code || color.code || color.name, border: '1px solid #e5e7eb' }}
                        title={color.name}
                      >
                        {isSel && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {selectedColor && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {selectedColor.name}</p>
                )}
              </div>
            )}

            {/* Selected variant stock badge */}
            {selectedVariant && (() => {
              const stock = getStockStatus(selectedVariant.id);
              if (!stock) return null;
              return (
                <div className="mb-8">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    stock.color === 'red' ? 'bg-red-100 text-red-800' :
                    stock.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {stock.text}
                  </div>
                </div>
              );
            })()}

            <button
              onClick={handleAddToCart}
              className="w-full bg-black text-white py-4 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-6"
            >
              Add to Cart
            </button>

            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-900 uppercase mb-3">Details</h3>
              <ul className="space-y-2 text-gray-700">
                {['Premium quality material', 'Authentic craftsmanship', 'Fast shipping available'].map((t) => (
                  <li key={t} className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ============ Featured products slider (You May Also Like) ============ */}
      {featuredProducts.length > 0 && (
        <div className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900">You May Also Like</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => scrollToItem('left')}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => scrollToItem('right')}
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <div
            ref={sliderRef}
            className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {featuredProducts.map((fp) => (
              <div
                key={fp.id}
                onClick={() => router.push(`/productdetailpage?ProductId=${fp.id}`)}
                className="flex-shrink-0 w-60 bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transform transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="relative h-64 w-full">
                  <img
                    src={fp.mainImage}
                    alt={fp.name}
                    className="object-cover w-full h-full"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/default-product.jpg'; }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 mb-2 truncate">{fp.name}</h3>
                  <p className="text-gold-600 font-bold">
                    PKR {parseFloat(fp.final_price || fp.price || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ Reviews (LAST) ============ */}
      <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Customer Reviews</h2>

        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <div className="flex">{renderStars(newReview.rating, true)}</div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text" name="name" value={newReview.name} onChange={handleReviewChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="Your name"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
            <input
              type="email" name="email" value={newReview.email} onChange={handleReviewChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
            <textarea
              name="comment" value={newReview.comment} onChange={handleReviewChange} rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-transparent"
              placeholder="Share your thoughts about this product..."
            />
          </div>
          <button
            onClick={submitReview}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Submit Review
          </button>
        </div>

        {reviewLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-center mb-2">
                  {renderStars(review.rating)}
                  <span className="ml-2 text-sm text-gray-500">{formatDate(review.created_at)}</span>
                </div>
                <p className="font-medium text-gray-900 mb-1">{review.name}</p>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>

    <ToastContainer position="bottom-right" />
  </div>
);




};

export default ProductDetailsCom;