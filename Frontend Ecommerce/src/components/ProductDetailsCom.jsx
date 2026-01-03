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
//         isSalesProduct: false // This is regular product, not sales
//       };

//       addToCart(cartProduct, quantity);
//       toast.success('Product added to cart!');
//       router.push('/addtocart');
//     } else {
//       console.error('No product to add to cart');
//       toast.error('Failed to add product to cart');
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
//                 <h3 className="text-sm font-medium text-gray-900 uppercase mb-3">Product Details</h3>
//                 <ul className="space-y-2 text-gray-700">
//                   <li className="flex items-center">
//                     <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                     </svg>
//                     Premium quality materials
//                   </li>
//                   <li className="flex items-center">
//                     <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                     </svg>
//                     Expert craftsmanship
//                   </li>
//                   <li className="flex items-center">
//                     <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                     </svg>
//                     Fast shipping & easy returns
//                   </li>
//                   {product.stock && (
//                     <li className="flex items-center">
//                       <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                       </svg>
//                       {product.stock} items in stock
//                     </li>
//                   )}
//                 </ul>
//               </div>

//               <div className="flex items-center mb-8">
//                 <div className="flex items-center border border-gray-300 rounded-md">
//                   <button
//                     className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
//                     onClick={decreaseQuantity}
//                   >
//                     -
//                   </button>
//                   <span className="px-4 py-2 border-x border-gray-300 text-gray-900">{quantity}</span>
//                   <button
//                     className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
//                     onClick={increaseQuantity}
//                   >
//                     +
//                   </button>
//                 </div>
//                 {product.stock && (
//                   <span className="ml-4 text-sm text-gray-500">{product.stock} items available</span>
//                 )}
//               </div>

//               <div className="space-y-4">
//                 <button
//                   onClick={handleAddToCart}
//                   className="w-full bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-md transition-colors flex items-center justify-center font-medium uppercase tracking-wide"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
//                   </svg>
//                   Add to Cart
//                 </button>
//                 <button className="w-full border border-black text-black hover:bg-gray-100 py-3 px-6 rounded-md transition-colors font-medium uppercase tracking-wide">
//                   Buy Now
//                 </button>
//               </div>

//               <div className="mt-8 pt-6 border-t border-gray-200">
//                 <div className="flex items-center space-x-4">
//                   <div className="p-3 bg-gray-100 rounded-full">
//                     <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                     </svg>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-900">Premium Quality Guaranteed</h4>
//                     <p className="text-sm text-gray-500">30-day return policy</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Product Tabs */}
//           <div className="border-t border-gray-200 px-8 py-12">
//             <div className="border-b border-gray-200">
//               <nav className="-mb-px flex space-x-8">
//                 <button className="whitespace-nowrap py-4 px-1 border-b-2 border-black text-sm font-medium text-black">
//                   Description
//                 </button>
//                 <button className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
//                   Additional Information
//                 </button>
//                 <button className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
//                   Reviews ({reviews.length})
//                 </button>
//               </nav>
//             </div>

//             <div className="mt-8">
//               <h3 className="text-lg font-medium text-gray-900 mb-4">Product Description</h3>
//               <p className="text-gray-700 leading-relaxed">
//                 {product.longDescription || product.description || "This premium product is crafted with attention to detail and made from the highest quality materials. Designed to provide exceptional value and performance, it represents the perfect combination of style and functionality."}
//               </p>
//             </div>
//           </div>

//           {/* Featured Products Slider */}
//           {featuredProducts.length > 0 && (
//             <div className="px-8 py-12 bg-gray-50">
//               <div className="text-center mb-12">
//                 <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Related Products</h2>
//                 <p className="text-gray-600 max-w-2xl mx-auto">Discover more products from our collection</p>
//               </div>

//               <div
//                 className="relative overflow-hidden group"
//                 onMouseEnter={() => setIsHovered(true)}
//                 onMouseLeave={() => setIsHovered(false)}
//               >
//                 <button
//                   onClick={() => scrollToItem('left')}
//                   className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
//                   aria-label="Scroll left"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                   </svg>
//                 </button>

//                 <div
//                   ref={sliderRef}
//                   className="flex space-x-8 overflow-x-auto py-4 px-2 scrollbar-hide scroll-smooth"
//                   style={{ scrollbarWidth: 'none' }}
//                 >
//                   {featuredProducts.map((featuredProduct) => (
//                     <div
//                       key={featuredProduct.id}
//                       onClick={() => router.push(`/productdetailpage?ProductId=${featuredProduct.id}`)}
//                       className="flex-shrink-0 w-60 bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transform transition-all hover:shadow-lg hover:-translate-y-1"
//                     >
//                       <div className="relative h-64 w-full">
//                         <img
//                           src={featuredProduct.mainImage}
//                           alt={featuredProduct.name}
//                           className="w-full h-full object-cover"
//                           onError={(e) => {
//                             console.error('Featured product image failed to load:', featuredProduct.mainImage);
//                             e.target.onerror = null;
//                             e.target.src = '/images/default-product.jpg';
//                           }}
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-4">
//                           <div>
//                             <h4 className="text-lg font-medium text-white">{featuredProduct.name}</h4>
//                             <p className="text-sm text-white">PKR {parseFloat(featuredProduct.final_price || 0).toLocaleString()}</p>
//                             <button className="mt-2 text-sm text-white hover:text-amber-300 transition-colors">
//                               View Details →
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <button
//                   onClick={() => scrollToItem('right')}
//                   className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
//                   aria-label="Scroll right"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Reviews Section */}
//           <div className="px-8 py-12">
//             <div className="max-w-4xl mx-auto">
//               <div className="text-center mb-12">
//                 <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Customer Reviews</h2>
//                 <div className="flex items-center justify-center">
//                   {renderStars(Math.round(averageRating))}
//                   <span className="ml-2 text-gray-600">Based on {reviews.length} reviews</span>
//                 </div>
//               </div>

//               {/* Review Form */}
//               <div className="bg-gray-50 p-8 rounded-xl mb-12">
//                 <h3 className="text-lg font-medium text-gray-900 mb-6">Write a Review</h3>

//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-3">Your Rating</label>
//                   {renderStars(newReview.rating, true)}
//                 </div>

//                 <div className="mb-6">
//                   <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-3">
//                     Your Review
//                   </label>
//                   <textarea
//                     id="comment"
//                     name="comment"
//                     rows="4"
//                     className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
//                     value={newReview.comment}
//                     onChange={handleReviewChange}
//                     placeholder="Share your thoughts about this product..."
//                     required
//                   ></textarea>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                   <div>
//                     <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
//                       Name *
//                     </label>
//                     <input
//                       type="text"
//                       id="name"
//                       name="name"
//                       className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
//                       value={newReview.name}
//                       onChange={handleReviewChange}
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
//                       Email (optional)
//                     </label>
//                     <input
//                       type="email"
//                       id="email"
//                       name="email"
//                       className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
//                       value={newReview.email}
//                       onChange={handleReviewChange}
//                       placeholder="your@email.com"
//                     />
//                   </div>
//                 </div>

//                 <button
//                   onClick={submitReview}
//                   className="w-full bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-lg transition-colors font-medium"
//                 >
//                   Submit Review
//                 </button>
//               </div>

//               {/* Existing Reviews List */}
//               {reviewLoading ? (
//                 <div className="flex justify-center">
//                   <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
//                 </div>
//               ) : reviews.length > 0 ? (
//                 <div className="space-y-8">
//                   {reviews.map((review) => (
//                     <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
//                       <div className="flex items-start">
//                         <div className="flex-shrink-0">
//                           <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
//                             {review.name?.charAt(0).toUpperCase() || 'U'}
//                           </div>
//                         </div>
//                         <div className="ml-4 flex-1">
//                           <div className="flex items-center justify-between">
//                             <h4 className="text-sm font-medium text-gray-900">{review.name || 'Anonymous'}</h4>
//                             <span className="text-xs text-gray-500">{formatDate(review.created_at || new Date().toISOString())}</span>
//                           </div>
//                           <div className="mt-1">
//                             {renderStars(review.rating)}
//                           </div>
//                           <p className="mt-2 text-gray-700">{review.comment}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className="text-center py-12">
//                   <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
//                   </svg>
//                   <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
//                   <p className="mt-1 text-sm text-gray-500">Be the first to review this product!</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <ToastContainer 
//         position="bottom-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         toastClassName="bg-white text-gray-800 shadow-lg rounded-lg"
//         progressClassName="bg-gold-500"
//       />
//     </div>
//   );
// };

// export default ProductDetailsCom;






'use client';
import React, { useEffect, useState, useRef } from 'react';
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
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    name: '',
    email: ''
  });

  const [featuredProducts, setFeaturedProducts] = useState([]);

  const ProductId = searchParams.get('ProductId');

  // Helper function to process image URL
  const processImageUrl = (url) => {
    // First, check if it's an empty URL
    if (!url || url.trim() === '') {
      // Return a reliable fallback - either a local file or external URL
      return '/images/default-product.jpg';
    }
    
    // If URL already starts with http:// or https://, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Otherwise, it's a relative path, so add the base URL
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${baseURL}${cleanUrl}`;
  };

  // Helper function to process product data
  const processProductData = (productData) => {
    if (!productData) return null;

    // Handle single image or image array
    let imageUrls = [];
    if (Array.isArray(productData.image_urls) && productData.image_urls.length > 0) {
      imageUrls = productData.image_urls;
    } else if (productData.image_urls && typeof productData.image_urls === 'string') {
      imageUrls = [productData.image_urls];
    } else if (productData.image) {
      imageUrls = [productData.image];
    }

    const firstImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

    return {
      ...productData,
      id: productData.id || productData.product_id,
      name: productData.name || productData.product_name,
      description: productData.description || productData.product_description,
      price: productData.price || productData.product_price,
      mainImage: processImageUrl(firstImageUrl),
      processedImageUrls: imageUrls.map(url => processImageUrl(url)),
      original_price: productData.original_price || productData.price || productData.product_price,
      final_price: productData.final_price || productData.price || productData.product_price,
      discount_percent: productData.discount_percent || 0,
      stock: productData.stock || productData.quantity_available,
      category: productData.category || productData.product_category,
      sku: productData.sku || productData.product_sku,
      longDescription: productData.long_description || productData.full_description
    };
  };

  useEffect(() => {
    if (!ProductId) {
      console.error('No ProductId found in URL');
      toast.error('No product ID found');
      return;
    }

    const fetchProductAndReviews = async () => {
      setLoading(true);

      try {
        console.log('Fetching product with ID:', ProductId);
        
        // Fetch product from API
        const res = await AxiosInstance.get(`/api/myapp/v1/public/product/`, {
          params: {
            id: ProductId
          }
        });

        console.log('Product API Response:', res.data);

        if (res?.data?.data) {
          // Handle different response structures
          let fetchedProduct;
          
          if (Array.isArray(res.data.data)) {
            fetchedProduct = res.data.data[0];
          } else if (res.data.data.data && Array.isArray(res.data.data.data)) {
            fetchedProduct = res.data.data.data[0];
          } else if (typeof res.data.data === 'object') {
            fetchedProduct = res.data.data;
          } else {
            throw new Error('Unexpected API response structure');
          }
          
          console.log('Fetched Product:', fetchedProduct);
          
          const processedProduct = processProductData(fetchedProduct);
          
          setProduct(processedProduct);
          setMainImage(processedProduct.mainImage);
          
          console.log('Processed Product:', processedProduct);
        } else {
          throw new Error('No product data found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        console.error('Error details:', error.response?.data);
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }

      // Fetch reviews for this product
      if (ProductId) {
        setReviewLoading(true);
        try {
          console.log('Fetching reviews for product ID:', ProductId);
          
          const response = await AxiosInstance.get(`/api/myapp/v1/public/review/`, {
            params: {
              product_id: ProductId
            }
          });
          
          console.log('Reviews API Response:', response.data);
          
          if (response.data?.status === 'SUCCESS' && response.data?.data) {
            const reviewsData = response.data.data.reviews || [];
            console.log('Reviews Data:', reviewsData);
            setReviews(reviewsData);
          } else {
            console.log('No reviews found in response');
            setReviews([]);
          }
        } catch (error) {
          console.error('Error fetching reviews:', error);
          console.error('Error response:', error.response?.data);
          setReviews([]);
        } finally {
          setReviewLoading(false);
        }
      }
    };

    const fetchFeaturedProducts = async () => {
      try {
        const res = await AxiosInstance.get('/api/myapp/v1/public/product/', {
          params: {
            limit: 8
          }
        });
        
        console.log('Featured Products Response:', res.data);
        
        if (res?.data?.data) {
          let dataArr = [];
          
          if (Array.isArray(res.data.data)) {
            dataArr = res.data.data;
          } else if (res.data.data.data && Array.isArray(res.data.data.data)) {
            dataArr = res.data.data.data;
          }
          
          setFeaturedProducts(
            dataArr.slice(0, 8).map(product => processProductData(product))
          );
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };

    fetchProductAndReviews();
    fetchFeaturedProducts();
  }, [ProductId]);

  useEffect(() => {
    if (featuredProducts.length <= 1 || isHovered) return;

    const slider = sliderRef.current;
    if (!slider) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const itemWidth = slider.firstChild?.offsetWidth || 300;
        const newScrollPos = (prev + 1) * itemWidth;
        const maxScrollLeft = slider.scrollWidth - slider.clientWidth;

        if (newScrollPos >= maxScrollLeft && featuredProducts.length > 0) {
          slider.scrollTo({ left: 0, behavior: 'instant' });
          return 0;
        } else {
          slider.scrollTo({ left: newScrollPos, behavior: 'smooth' });
          return (prev + 1) % featuredProducts.length;
        }
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [featuredProducts.length, isHovered]);

  const handleBackButton = () => {
    router.push('/publicproducts');
  };

  const handleAddToCart = () => {
    if (product) {
      const cartProduct = {
        ...product,
        id: product.id,
        name: product.name,
        description: product.description,
        image_urls: product.processedImageUrls,
        quantity: quantity,
        price: product.final_price || product.price,
        original_price: product.original_price || product.price,
        isSalesProduct: false // This is regular product, not sales
      };

      addToCart(cartProduct, quantity);
      toast.success('Product added to cart!');
      router.push('/addtocart');
    } else {
      console.error('No product to add to cart');
      toast.error('Failed to add product to cart');
    }
  };

  const increaseQuantity = () => {
    setQuantity((prevQuantity) => prevQuantity + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prevQuantity) => (prevQuantity > 1 ? prevQuantity - 1 : 1));
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setNewReview(prev => ({
      ...prev,
      rating
    }));
  };

  const submitReview = async () => {
    if (!newReview.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }

    try {
      const reviewData = {
        name: newReview.name.trim(),
        comment: newReview.comment.trim(),
        rating: parseInt(newReview.rating),
        product: ProductId
      };

      // Only add email if it's provided
      if (newReview.email.trim()) {
        reviewData.email = newReview.email.trim();
      }

      console.log('Submitting review:', reviewData);

      const res = await AxiosInstance.post('/api/myapp/v1/public/review/', reviewData);
      
      console.log('Submit review response:', res.data);
      
      if (res.data?.status === 'SUCCESS') {
        toast.success('Review submitted successfully!');
        
        // Add the new review to the list
        const newReviewData = res.data.data || {
          ...reviewData,
          id: Date.now(),
          created_at: new Date().toISOString()
        };
        
        setReviews(prev => [newReviewData, ...prev]);
        
        // Reset form
        setNewReview({
          rating: 5,
          comment: '',
          name: '',
          email: ''
        });
      } else {
        throw new Error(res.data?.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.errors?.comment?.[0]
        || error.response?.data?.errors?.name?.[0]
        || error.response?.data?.errors?.rating?.[0]
        || error.message 
        || 'Failed to submit review';
      
      toast.error(errorMessage);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const renderStars = (rating, interactive = false) => {
    return (
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
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const scrollToItem = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    const itemWidth = slider.firstChild?.offsetWidth || 300;
    const scrollAmount = direction === 'left' ? -itemWidth : itemWidth;

    slider.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold-500"></div>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
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
        <div className="flex items-center space-x-6">
          <button className="text-gray-700 hover:text-gold-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button className="text-gray-700 hover:text-gold-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-12 -mt-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Images */}
            <div className="p-8">
              <div className="relative h-96 w-full mb-6 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="object-contain w-full h-full transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      console.error('Image failed to load:', mainImage);
                      e.target.onerror = null;
                      e.target.src = '/images/default-product.jpg';
                    }}
                  />
                ) : (
                  <div className="bg-gray-200 w-full h-full flex items-center justify-center text-gray-500">
                    <span>No image available</span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {product.processedImageUrls && product.processedImageUrls.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto py-2 scrollbar-hide">
                  {product.processedImageUrls.map((imgUrl, index) => (
                    <div
                      key={index}
                      className={`flex-shrink-0 w-20 h-20 border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${
                        mainImage === imgUrl 
                          ? 'border-gold-500 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setMainImage(imgUrl)}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${index + 1}`}
                        className="object-cover w-full h-full"
                        onError={(e) => { 
                          console.error('Thumbnail failed to load:', imgUrl);
                          e.target.onerror = null; 
                          e.target.src = '/images/default-product.jpg'; 
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
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
                <span className="ml-4 text-sm text-gray-500">|</span>
                <span className="ml-4 text-sm text-gray-500">Category: {product.category}</span>
              </div>

              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-center">
                  <span className="text-3xl font-serif font-bold text-gray-900">PKR {parseFloat(product.final_price || 0).toLocaleString()}</span>
                  {product.original_price && parseFloat(product.original_price) > parseFloat(product.final_price) && (
                    <>
                      <span className="ml-3 text-lg text-gray-500 line-through">PKR {parseFloat(product.original_price || 0).toLocaleString()}</span>
                      <span className="ml-3 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                        SAVE {product.discount_percent || Math.round(((product.original_price - product.final_price) / product.original_price * 100))}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-900 uppercase mb-3">Product Details</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Premium quality materials
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Expert craftsmanship
                  </li>
                  <li className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Fast shipping & easy returns
                  </li>
                  {product.stock && (
                    <li className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {product.stock} items in stock
                    </li>
                  )}
                </ul>
              </div>

              <div className="flex items-center mb-8">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={decreaseQuantity}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 text-gray-900">{quantity}</span>
                  <button
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={increaseQuantity}
                  >
                    +
                  </button>
                </div>
                {product.stock && (
                  <span className="ml-4 text-sm text-gray-500">{product.stock} items available</span>
                )}
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-md transition-colors flex items-center justify-center font-medium uppercase tracking-wide"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Add to Cart
                </button>
                <button className="w-full border border-black text-black hover:bg-gray-100 py-3 px-6 rounded-md transition-colors font-medium uppercase tracking-wide">
                  Buy Now
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Premium Quality Guaranteed</h4>
                    <p className="text-sm text-gray-500">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Tabs */}
          <div className="border-t border-gray-200 px-8 py-12">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button className="whitespace-nowrap py-4 px-1 border-b-2 border-black text-sm font-medium text-black">
                  Description
                </button>
                <button className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Additional Information
                </button>
                <button className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                  Reviews ({reviews.length})
                </button>
              </nav>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Product Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.longDescription || product.description || "This premium product is crafted with attention to detail and made from the highest quality materials. Designed to provide exceptional value and performance, it represents the perfect combination of style and functionality."}
              </p>
            </div>
          </div>

          {/* Featured Products Slider */}
          {featuredProducts.length > 0 && (
            <div className="px-8 py-12 bg-gray-50">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Related Products</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">Discover more products from our collection</p>
              </div>

              <div
                className="relative overflow-hidden group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <button
                  onClick={() => scrollToItem('left')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Scroll left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div
                  ref={sliderRef}
                  className="flex space-x-8 overflow-x-auto py-4 px-2 scrollbar-hide scroll-smooth"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {featuredProducts.map((featuredProduct) => (
                    <div
                      key={featuredProduct.id}
                      onClick={() => router.push(`/productdetailpage?ProductId=${featuredProduct.id}`)}
                      className="flex-shrink-0 w-60 bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transform transition-all hover:shadow-lg hover:-translate-y-1"
                    >
                      <div className="relative h-64 w-full">
                        <img
                          src={featuredProduct.mainImage}
                          alt={featuredProduct.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Featured product image failed to load:', featuredProduct.mainImage);
                            e.target.onerror = null;
                            e.target.src = '/images/default-product.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent flex items-end p-4">
                          <div>
                            <h4 className="text-lg font-medium text-white">{featuredProduct.name}</h4>
                            <p className="text-sm text-white">PKR {parseFloat(featuredProduct.final_price || 0).toLocaleString()}</p>
                            <button className="mt-2 text-sm text-white hover:text-amber-300 transition-colors">
                              View Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollToItem('right')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                  aria-label="Scroll right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="px-8 py-12">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Customer Reviews</h2>
                <div className="flex items-center justify-center">
                  {renderStars(Math.round(averageRating))}
                  <span className="ml-2 text-gray-600">Based on {reviews.length} reviews</span>
                </div>
              </div>

              {/* Review Form */}
              <div className="bg-gray-50 p-8 rounded-xl mb-12">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Write a Review</h3>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Your Rating</label>
                  {renderStars(newReview.rating, true)}
                </div>

                <div className="mb-6">
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-3">
                    Your Review
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                    value={newReview.comment}
                    onChange={handleReviewChange}
                    placeholder="Share your thoughts about this product..."
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-3">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                      value={newReview.name}
                      onChange={handleReviewChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-3">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-gold-500 focus:border-gold-500"
                      value={newReview.email}
                      onChange={handleReviewChange}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <button
                  onClick={submitReview}
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 px-6 rounded-lg transition-colors font-medium"
                >
                  Submit Review
                </button>
              </div>

              {/* Existing Reviews List */}
              {reviewLoading ? (
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold-500"></div>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-8">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                            {review.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{review.name || 'Anonymous'}</h4>
                            <span className="text-xs text-gray-500">{formatDate(review.created_at || new Date().toISOString())}</span>
                          </div>
                          <div className="mt-1">
                            {renderStars(review.rating)}
                          </div>
                          <p className="mt-2 text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews yet</h3>
                  <p className="mt-1 text-sm text-gray-500">Be the first to review this product!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="bg-white text-gray-800 shadow-lg rounded-lg"
        progressClassName="bg-gold-500"
      />
    </div>
  );
};

export default ProductDetailsCom