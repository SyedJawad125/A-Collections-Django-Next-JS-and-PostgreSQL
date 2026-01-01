// 'use client';
// import React, { useContext } from 'react';
// import { CartContext } from "@/components/CartContext";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useRouter } from 'next/navigation';
// import { FaTimes, FaPlus, FaMinus } from 'react-icons/fa';
// import { FiShoppingBag } from 'react-icons/fi';

// const formatPrice = (price) => {
//   if (price === null || price === undefined) return '0.00';
//   const num = typeof price === 'number' ? price : parseFloat(price);
//   return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// };

// const AddToCartPage = () => {
//     const { cartItems, removeFromCart, updateQuantity, getRegularProducts, getSalesProducts } = useContext(CartContext);
//     const router = useRouter();
//     const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

//     const regularProducts = getRegularProducts();
//     const salesProducts = getSalesProducts();

//     // Debug: Log cart items to see structure
//     console.log('Cart Items:', cartItems);
//     console.log('Regular Products:', regularProducts);
//     console.log('Sales Products:', salesProducts);

//     const handleRemoveFromCart = (product) => {
//         removeFromCart(product);
//         toast.success('Item removed from your cart', {
//             position: "top-right",
//             autoClose: 2000,
//             hideProgressBar: false,
//             closeOnClick: true,
//             pauseOnHover: true,
//             draggable: true,
//             progress: undefined,
//             theme: "dark",
//         });
//     };

//     const handleQuantityChange = (item, newQuantity) => {
//         if (newQuantity < 1) {
//             handleRemoveFromCart(item);
//         } else {
//             updateQuantity(item, newQuantity);
//         }
//     };

//     const calculateTotal = () => {
//         return cartItems.reduce((total, item) => {
//             const price = item.final_price !== undefined ? item.final_price : item.price;
//             return total + (parseFloat(price) * item.quantity);
//         }, 0);
//     };

//     const calculateSectionTotal = (items) => {
//         return items.reduce((total, item) => {
//             const price = item.final_price !== undefined ? item.final_price : item.price;
//             return total + (parseFloat(price) * item.quantity);
//         }, 0);
//     };

//     const handleProceedToCheckout = () => {
//         if (cartItems.length === 0) {
//             toast.error('Your cart is empty');
//             return;
//         }
//         router.push('/checkoutpage');
//     };

//     const handleContinueShopping = () => {
//         router.push('/publicproducts');
//     };

//     const getDisplayPrice = (item) => {
//         const price = item.final_price !== undefined ? item.final_price : item.price;
//         return formatPrice(price);
//     };

//     const getDisplayTotal = (item) => {
//         const price = item.final_price !== undefined ? item.final_price : item.price;
//         return formatPrice(parseFloat(price) * item.quantity);
//     };

//     const getMainImage = (item) => {
//         if (item.image_urls && item.image_urls.length > 0) {
//             return `${baseURL}${item.image_urls[0].startsWith('/') ? '' : '/'}${item.image_urls[0]}`;
//         }
//         if (item.image) {
//             return `${baseURL}${item.image.startsWith('/') ? '' : '/'}${item.image}`;
//         }
//         return '/default-product-image.jpg';
//     };

//     // Helper function to determine if item is a sales product
//     const isSalesProduct = (item) => {
//         // Check multiple possible indicators for sales products
//         return (
//             item.productType === 'sales_product' || 
//             item.productType === 'sale' || 
//             item.type === 'sales_product' || 
//             item.type === 'sale' ||
//             (item.final_price !== undefined && item.original_price !== undefined && item.final_price < item.original_price) ||
//             item.discount_percent > 0
//         );
//     };

//     // Helper function to get product type display text
//     const getProductTypeDisplay = (item) => {
//         return isSalesProduct(item) ? 'Sale' : 'Regular';
//     };

//     // Create unique key for cart items
//     const createUniqueKey = (item) => {
//         // Always use the actual productType from the item to ensure products from different tables
//         // with the same ID are treated as completely separate items
//         // This prevents conflicts between regular_product ID:1 and sales_product ID:1
//         const productType = item.productType || 'unknown';
//         const tablePrefix = productType === 'sales_product' ? 'SALES' : 'REGULAR';
//         return `${tablePrefix}_${productType}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;
//     };

//     const renderCartItems = (items, sectionTitle, sectionColor = 'gray') => {
//         if (items.length === 0) return null;

//         const sectionTotal = calculateSectionTotal(items);

//         return (
//             <div className="mb-8">
//                 <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
//                     <h2 className="text-xl font-serif font-medium text-gray-900">
//                         {sectionTitle} ({items.length} {items.length === 1 ? 'Item' : 'Items'})
//                     </h2>
//                     <span className="text-lg font-medium text-gray-700">
//                         Total: ${formatPrice(sectionTotal)}
//                     </span>
//                 </div>
                
//                 <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-100">
//                     {/* Table Header */}
//                     <div className="hidden md:grid grid-cols-12 bg-gray-50 p-4 border-b border-gray-100">
//                         <div className="col-span-5 font-medium text-gray-500 uppercase text-xs tracking-wider">Product</div>
//                         <div className="col-span-2 font-medium text-gray-500 uppercase text-xs tracking-wider">Price</div>
//                         <div className="col-span-3 font-medium text-gray-500 uppercase text-xs tracking-wider">Quantity</div>
//                         <div className="col-span-2 font-medium text-gray-500 uppercase text-xs tracking-wider">Total</div>
//                     </div>

//                     {/* Cart Items */}
//                     {items.map((item) => {
//                         const uniqueKey = createUniqueKey(item);
//                         const isOnSale = isSalesProduct(item);
//                         const productTypeDisplay = getProductTypeDisplay(item);
                        
//                         return (
//                             <div key={uniqueKey} className="p-4 border-b border-gray-100 last:border-b-0">
//                                 <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
//                                     {/* Product Info */}
//                                     <div className="col-span-5 flex items-center">
//                                         <div className="relative h-32 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
//                                             <img
//                                                 src={getMainImage(item)}
//                                                 alt={item.name}
//                                                 className="h-full w-full object-cover object-center"
//                                             />
//                                             <button
//                                                 onClick={() => handleRemoveFromCart(item)}
//                                                 className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70 transition-all"
//                                             >
//                                                 <FaTimes className="h-3 w-3" />
//                                             </button>
//                                             {/* Product Type Badge */}
//                                             {isOnSale && (
//                                                 <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
//                                                     SALE
//                                                 </div>
//                                             )}
//                                         </div>
//                                         <div className="ml-4">
//                                             <h3 className="font-serif text-lg text-gray-900">{item.name}</h3>
//                                             <p className="text-gray-500 text-sm">
//                                                 {item.color || 'One Color'} / {item.size || 'One Size'}
//                                             </p>
//                                             {isOnSale && (
//                                                 <p className="text-red-600 text-sm mt-1">
//                                                     {item.discount_percent && `${item.discount_percent}% OFF`}
//                                                     {item.original_price && ` (Was $${formatPrice(item.original_price)})`}
//                                                 </p>
//                                             )}
//                                             <p className="text-xs text-gray-400 mt-1">
//                                                 Product ID: {item.id} | Type: {productTypeDisplay}
//                                             </p>
//                                         </div>
//                                     </div>

//                                     {/* Price */}
//                                     <div className="col-span-2">
//                                         <div className="flex flex-col">
//                                             {isOnSale && item.original_price ? (
//                                                 <>
//                                                     <p className="text-gray-400 line-through text-sm">${formatPrice(item.original_price)}</p>
//                                                     <p className="text-red-600 font-medium">${getDisplayPrice(item)}</p>
//                                                 </>
//                                             ) : (
//                                                 <p className="text-gray-900 font-medium">${getDisplayPrice(item)}</p>
//                                             )}
//                                         </div>
//                                     </div>

//                                     {/* Quantity */}
//                                     <div className="col-span-3">
//                                         <div className="flex items-center border border-gray-200 rounded-md w-fit">
//                                             <button
//                                                 onClick={() => handleQuantityChange(item, item.quantity - 1)}
//                                                 className="px-3 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
//                                             >
//                                                 <FaMinus className="h-3 w-3" />
//                                             </button>
//                                             <span className="px-4 py-1 text-center w-12">{item.quantity}</span>
//                                             <button
//                                                 onClick={() => handleQuantityChange(item, item.quantity + 1)}
//                                                 className="px-3 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
//                                             >
//                                                 <FaPlus className="h-3 w-3" />
//                                             </button>
//                                         </div>
//                                     </div>

//                                     {/* Total */}
//                                     <div className="col-span-2">
//                                         <p className="text-gray-900 font-medium">${getDisplayTotal(item)}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         );
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
//             <ToastContainer 
//                 position="top-right"
//                 autoClose={2000}
//                 hideProgressBar={false}
//                 newestOnTop={false}
//                 closeOnClick
//                 rtl={false}
//                 pauseOnFocusLoss
//                 draggable
//                 pauseOnHover
//                 theme="dark"
//             />
            
//             <div className="max-w-7xl mx-auto">
//                 <div className="text-center mb-12">
//                     <h1 className="text-4xl font-serif font-light tracking-wider text-gray-900 mb-2">Your Shopping Bag</h1>
//                     <p className="text-gray-500">
//                         {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} 
//                         {regularProducts.length > 0 && salesProducts.length > 0 && 
//                             ` (${regularProducts.length} Regular, ${salesProducts.length} Sale)`
//                         }
//                     </p>
//                 </div>

//                 {cartItems.length > 0 ? (
//                     <div className="flex flex-col lg:flex-row gap-12">
//                         {/* Cart Items */}
//                         <div className="lg:w-2/3">
//                             {/* Regular Products Section */}
//                             {renderCartItems(regularProducts, "Regular Products", "blue")}
                            
//                             {/* Sales Products Section */}
//                             {renderCartItems(salesProducts, "Sale Products", "red")}
//                         </div>

//                         {/* Order Summary */}
//                         <div className="lg:w-1/3">
//                             <div className="bg-white shadow-sm rounded-lg border border-gray-100 p-6">
//                                 <h2 className="text-xl font-serif font-light text-gray-900 mb-6">Order Summary</h2>
                                
//                                 <div className="space-y-4">
//                                     {/* Show breakdown by product type if both exist */}
//                                     {regularProducts.length > 0 && salesProducts.length > 0 && (
//                                         <>
//                                             <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
//                                                 <span className="text-gray-500">Regular Products ({regularProducts.length})</span>
//                                                 <span className="text-gray-700">
//                                                     ${formatPrice(calculateSectionTotal(regularProducts))}
//                                                 </span>
//                                             </div>
//                                             <div className="flex justify-between text-sm border-b border-gray-100 pb-2">
//                                                 <span className="text-gray-500">Sale Products ({salesProducts.length})</span>
//                                                 <span className="text-gray-700">
//                                                     ${formatPrice(calculateSectionTotal(salesProducts))}
//                                                 </span>
//                                             </div>
//                                         </>
//                                     )}
                                    
//                                     <div className="flex justify-between border-b border-gray-100 pb-4">
//                                         <span className="text-gray-500">Subtotal</span>
//                                         <span className="text-gray-900 font-medium">${formatPrice(calculateTotal())}</span>
//                                     </div>
//                                     <div className="flex justify-between border-b border-gray-100 pb-4">
//                                         <span className="text-gray-500">Shipping</span>
//                                         <span className="text-gray-900 font-medium">Free</span>
//                                     </div>
//                                     <div className="flex justify-between border-b border-gray-100 pb-4">
//                                         <span className="text-gray-500">Tax</span>
//                                         <span className="text-gray-900 font-medium">Calculated at checkout</span>
//                                     </div>
//                                     <div className="flex justify-between pt-4">
//                                         <span className="text-lg font-medium">Total</span>
//                                         <span className="text-lg font-medium">${formatPrice(calculateTotal())}</span>
//                                     </div>
//                                 </div>

//                                 <button
//                                     onClick={handleProceedToCheckout}
//                                     className="mt-2 w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center"
//                                 >
//                                     Proceed to Checkout
//                                 </button>

//                                 <button
//                                     onClick={handleContinueShopping}
//                                     className="mt-4 w-full bg-white text-black py-3 px-4 rounded-md border border-black hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center"
//                                 >
//                                     <FiShoppingBag className="mr-2" />
//                                     Continue Shopping
//                                 </button>

//                                 <p className="mt-6 text-center text-sm text-gray-500">
//                                     Free shipping and returns on all orders
//                                 </p>
//                             </div>
//                         </div>
//                     </div>
//                 ) : (
//                     <div className="text-center py-16">
//                         <FiShoppingBag className="mx-auto h-16 w-16 text-gray-400" />
//                         <h3 className="mt-4 text-lg font-medium text-gray-900">Your bag is empty</h3>
//                         <p className="mt-1 text-gray-500">Start adding some items to your bag</p>
//                         <button
//                             onClick={handleContinueShopping}
//                             className="mt-8 bg-black text-white py-3 px-8 rounded-md hover:bg-gray-800 transition-colors duration-300"
//                         >
//                             Continue Shopping
//                         </button>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AddToCartPage;



'use client';
import React, { useContext, useState } from 'react';
import { CartContext } from "@/components/CartContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { FaTimes, FaPlus, FaMinus, FaTag } from 'react-icons/fa';
import { FiShoppingBag, FiTruck, FiShield } from 'react-icons/fi';

const formatPrice = (price) => {
  if (price === null || price === undefined) return '0.00';
  const num = typeof price === 'number' ? price : parseFloat(price);
  return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const AddToCartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, getRegularProducts, getSalesProducts } = useContext(CartContext);
    const router = useRouter();
    const [removingItem, setRemovingItem] = useState(null);

    const regularProducts = getRegularProducts();
    const salesProducts = getSalesProducts();

    // Improved image URL processing that matches the detail pages
    const processImageUrl = (url) => {
        if (!url || url.trim() === '') {
            return '/images/default-product.jpg';
        }
        
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        
        const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${baseURL}${cleanUrl}`;
    };

    const getMainImage = (item) => {
        // Try multiple image sources in order of priority
        if (item.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
            return processImageUrl(item.image_urls[0]);
        }
        if (item.image_urls && typeof item.image_urls === 'string') {
            return processImageUrl(item.image_urls);
        }
        if (item.image) {
            return processImageUrl(item.image);
        }
        if (item.mainImage) {
            return processImageUrl(item.mainImage);
        }
        return '/images/default-product.jpg';
    };

    const handleRemoveFromCart = async (product) => {
        setRemovingItem(createUniqueKey(product));
        
        // Animate out
        setTimeout(() => {
            removeFromCart(product);
            setRemovingItem(null);
            toast.success('Item removed from cart', {
                position: "bottom-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "light",
            });
        }, 300);
    };

    const handleQuantityChange = (item, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveFromCart(item);
        } else {
            updateQuantity(item, newQuantity);
        }
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const price = item.final_price !== undefined ? item.final_price : item.price;
            return total + (parseFloat(price) * item.quantity);
        }, 0);
    };

    const calculateSectionTotal = (items) => {
        return items.reduce((total, item) => {
            const price = item.final_price !== undefined ? item.final_price : item.price;
            return total + (parseFloat(price) * item.quantity);
        }, 0);
    };

    const calculateTotalSavings = () => {
        return cartItems.reduce((savings, item) => {
            if (item.original_price && item.final_price && parseFloat(item.original_price) > parseFloat(item.final_price)) {
                return savings + ((parseFloat(item.original_price) - parseFloat(item.final_price)) * item.quantity);
            }
            return savings;
        }, 0);
    };

    const handleProceedToCheckout = () => {
        if (cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }
        router.push('/checkout');
    };

    const handleContinueShopping = () => {
        router.push('/publicproducts');
    };

    const getDisplayPrice = (item) => {
        const price = item.final_price !== undefined ? item.final_price : item.price;
        return formatPrice(price);
    };

    const getDisplayTotal = (item) => {
        const price = item.final_price !== undefined ? item.final_price : item.price;
        return formatPrice(parseFloat(price) * item.quantity);
    };

    const isSalesProduct = (item) => {
        return (
            item.productType === 'sales_product' || 
            item.productType === 'sale' || 
            item.type === 'sales_product' || 
            item.type === 'sale' ||
            item.isSalesProduct === true ||
            (item.final_price !== undefined && item.original_price !== undefined && parseFloat(item.final_price) < parseFloat(item.original_price)) ||
            (item.discount_percent && item.discount_percent > 0)
        );
    };

    const createUniqueKey = (item) => {
        const productType = item.productType || 'unknown';
        const tablePrefix = productType === 'sales_product' ? 'SALES' : 'REGULAR';
        return `${tablePrefix}_${productType}_${item.id}_${item.size || 'default'}_${item.color || 'default'}`;
    };

    const renderCartItems = (items, sectionTitle, sectionColor = 'gray') => {
        if (items.length === 0) return null;

        const sectionTotal = calculateSectionTotal(items);
        const isOnSale = sectionColor === 'red';

        return (
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                        {isOnSale && (
                            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md">
                                <FaTag className="text-white w-5 h-5" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-2xl font-serif font-medium text-gray-900">
                                {sectionTitle}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {items.length} {items.length === 1 ? 'item' : 'items'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 uppercase tracking-wide">Subtotal</p>
                        <p className="text-2xl font-serif font-medium text-gray-900">
                            PKR {formatPrice(sectionTotal)}
                        </p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    {items.map((item) => {
                        const uniqueKey = createUniqueKey(item);
                        const isItemOnSale = isSalesProduct(item);
                        const isRemoving = removingItem === uniqueKey;
                        
                        return (
                            <div 
                                key={uniqueKey} 
                                className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${
                                    isRemoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                                } hover:shadow-md`}
                            >
                                <div className="p-2">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Product Image */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-full md:w-40 h-48 md:h-40 rounded-xl overflow-hidden bg-gray-100">
                                                <img
                                                    src={getMainImage(item)}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                                    onError={(e) => {
                                                        console.error('Image failed to load:', getMainImage(item));
                                                        e.target.onerror = null;
                                                        e.target.src = '/images/default-product.jpg';
                                                    }}
                                                />
                                            </div>
                                            
                                            {/* Sale Badge */}
                                            {isItemOnSale && (
                                                <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                                    {item.discount_percent ? `${item.discount_percent}% OFF` : 'SALE'}
                                                </div>
                                            )}

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemoveFromCart(item)}
                                                className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full p-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all shadow-md hover:shadow-lg"
                                                aria-label="Remove item"
                                            >
                                                <FaTimes className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-serif font-medium text-gray-900 mb-1">
                                                            {item.name}
                                                        </h3>
                                                        {item.description && (
                                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                                {item.description}
                                                            </p>
                                                        )}
                                                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                                                            {item.color && (
                                                                <span className="flex items-center">
                                                                    <span className="w-4 h-4 rounded-full bg-gray-300 mr-2"></span>
                                                                    {item.color}
                                                                </span>
                                                            )}
                                                            {item.size && (
                                                                <span>Size: {item.size}</span>
                                                            )}
                                                            {/* <span className="text-gray-400">•</span> */}
                                                            {/* <span className="text-xs">ID: {item.id}</span> */}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Price Information */}
                                                <div className="mt-4">
                                                    {isItemOnSale && item.original_price && parseFloat(item.original_price) > parseFloat(item.final_price || item.price) ? (
                                                        <div className="flex items-baseline space-x-3">
                                                            <span className="text-2xl font-serif font-bold text-gray-900">
                                                                PKR {getDisplayPrice(item)}
                                                            </span>
                                                            <span className="text-lg text-gray-400 line-through">
                                                                PKR {formatPrice(item.original_price)}
                                                            </span>
                                                            <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                                                                Save PKR {formatPrice(parseFloat(item.original_price) - parseFloat(item.final_price || item.price))}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-2xl font-serif font-bold text-gray-900">
                                                            PKR {getDisplayPrice(item)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quantity and Total */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 gap-4">
                                                {/* Quantity Controls */}
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-sm text-gray-600 font-medium">Quantity:</span>
                                                    <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                                                        <button
                                                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                                            className="px-4 py-2 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <FaMinus className="w-3 h-3" />
                                                        </button>
                                                        <span className="px-6 py-2 text-lg font-medium border-x-2 border-gray-200 bg-gray-500">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                                            className="px-4 py-2 text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <FaPlus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Item Total */}
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">Item Total</p>
                                                    <p className="text-2xl font-serif font-bold text-gray-900">
                                                        PKR {getDisplayTotal(item)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const totalSavings = calculateTotalSavings();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <ToastContainer 
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                className="mt-16"
            />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-serif font-light tracking-tight text-gray-900 mb-3">
                        Shopping Cart
                    </h1>
                    <div className="flex items-center justify-center space-x-2 text-gray-600">
                        <FiShoppingBag className="w-5 h-5" />
                        <p className="text-lg">
                            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                        </p>
                        {regularProducts.length > 0 && salesProducts.length > 0 && (
                            <>
                                <span className="text-gray-400">•</span>
                                <p className="text-sm">
                                    {regularProducts.length} Regular, {salesProducts.length} Sale
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {cartItems.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            {/* Sales Products Section - Show first if exists */}
                            {salesProducts.length > 0 && renderCartItems(salesProducts, "Sale Items", "red")}
                            
                            {/* Regular Products Section */}
                            {regularProducts.length > 0 && renderCartItems(regularProducts, "Regular Items", "blue")}
                        </div>

                        {/* Order Summary - Sticky Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6">
                                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6">
                                        <h2 className="text-2xl font-serif font-light">Order Summary</h2>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        {/* Breakdown by type */}
                                        {regularProducts.length > 0 && salesProducts.length > 0 && (
                                            <>
                                                <div className="flex justify-between text-sm py-3 border-b border-gray-100">
                                                    <span className="text-gray-600">
                                                        Regular Products ({regularProducts.length})
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                        PKR {formatPrice(calculateSectionTotal(regularProducts))}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-sm py-3 border-b border-gray-100">
                                                    <span className="text-gray-600">
                                                        Sale Products ({salesProducts.length})
                                                    </span>
                                                    <span className="font-medium text-gray-900">
                                                        PKR {formatPrice(calculateSectionTotal(salesProducts))}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                        
                                        <div className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-medium text-gray-900">
                                                PKR {formatPrice(calculateTotal())}
                                            </span>
                                        </div>

                                        {/* Savings Display */}
                                        {totalSavings > 0 && (
                                            <div className="flex justify-between py-3 border-b border-gray-100 bg-green-50 -mx-6 px-6">
                                                <span className="text-green-700 font-medium flex items-center">
                                                    <FaTag className="mr-2" />
                                                    Total Savings
                                                </span>
                                                <span className="font-bold text-green-700">
                                                    - PKR {formatPrice(totalSavings)}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="text-gray-600 flex items-center">
                                                <FiTruck className="mr-2" />
                                                Shipping
                                            </span>
                                            <span className="font-medium text-green-600">Free</span>
                                        </div>

                                        <div className="flex justify-between py-3 border-b border-gray-100">
                                            <span className="text-gray-600">Tax</span>
                                            <span className="text-gray-500 text-sm">Calculated at checkout</span>
                                        </div>

                                        {/* Total */}
                                        <div className="flex justify-between pt-4 pb-2">
                                            <span className="text-xl font-serif font-medium text-gray-900">Total</span>
                                            <span className="text-3xl font-serif font-bold text-gray-900">
                                                PKR {formatPrice(calculateTotal())}
                                            </span>
                                        </div>

                                        {/* Buttons */}
                                        <div className="space-y-3 pt-4">
                                            <button
                                                onClick={handleProceedToCheckout}
                                                className="w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 flex items-center justify-center font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                            >
                                                Proceed to Checkout
                                            </button>

                                            <button
                                                onClick={handleContinueShopping}
                                                className="w-full bg-white text-gray-900 py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-300 flex items-center justify-center font-medium"
                                            >
                                                <FiShoppingBag className="mr-2" />
                                                Continue Shopping
                                            </button>
                                        </div>

                                        {/* Trust Badges */}
                                        <div className="pt-6 space-y-3 border-t border-gray-100">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <FiTruck className="w-5 h-5 mr-3 text-gray-400" />
                                                <span>Free shipping on all orders</span>
                                            </div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <FiShield className="w-5 h-5 mr-3 text-gray-400" />
                                                <span>Secure checkout guaranteed</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Empty Cart State
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-6">
                            <FiShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-3xl font-serif font-light text-gray-900 mb-3">
                            Your cart is empty
                        </h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Looks like you haven't added anything to your cart yet. Start shopping to fill it up!
                        </p>
                        <button
                            onClick={handleContinueShopping}
                            className="inline-flex items-center bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-8 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                            <FiShoppingBag className="mr-2" />
                            Start Shopping
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AddToCartPage;