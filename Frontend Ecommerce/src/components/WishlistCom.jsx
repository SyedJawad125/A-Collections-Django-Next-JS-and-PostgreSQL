'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const WishlistCom = () => {
    const router = useRouter();
    const [wishlist, setWishlist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [removing, setRemoving] = useState(false);
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const res = await AxiosInstance.get('/api/myapp/v1/wishlist/');
            setWishlist(res.data.data);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            if (error.response?.status === 404) {
                setWishlist({ items: [] });
            } else {
                toast.error('Failed to load wishlist');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemoveItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to remove this item from your wishlist?')) return;
        
        setRemoving(true);
        try {
            await AxiosInstance.delete(`/api/myapp/v1/wishlist/item/?id=${itemId}`);
            toast.success('Item removed from wishlist');
            await fetchWishlist();
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
        } finally {
            setRemoving(false);
        }
    };

    const handleAddToCart = async (item) => {
        try {
            const cartData = {
                product_variant: item.product ? null : item.product_variant?.id,
                sales_product: item.sales_product ? item.sales_product.id : null,
                quantity: 1
            };

            await AxiosInstance.post('/api/myapp/v1/cart/item/', cartData);
            toast.success('Added to cart');
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add to cart');
        }
    };

    const handleProductClick = (item) => {
        const productId = item.product?.id || item.sales_product?.id;
        const productType = item.product ? 'product' : 'sales_product';
        
        if (productId) {
            router.push(`/productdetailpage?ProductId=${productId}&type=${productType}`);
        }
    };

    const getImageUrl = (item) => {
        if (item.product?.images?.length > 0) {
            const image = item.product.images[0];
            const imageUrl = image.image_url || image.images;
            if (imageUrl && imageUrl.startsWith('http')) {
                return imageUrl;
            }
            return `${baseURL}${imageUrl || ''}`;
        }
        if (item.sales_product?.images?.length > 0) {
            const image = item.sales_product.images[0];
            const imageUrl = image.image_url || image.images;
            if (imageUrl && imageUrl.startsWith('http')) {
                return imageUrl;
            }
            return `${baseURL}${imageUrl || ''}`;
        }
        return '/default-product-image.jpg';
    };

    const getItemName = (item) => {
        if (item.product) return item.product.name;
        if (item.sales_product) return item.sales_product.name;
        return 'Unknown Product';
    };

    const getItemPrice = (item) => {
        if (item.product) return item.product.price;
        if (item.sales_product) return item.sales_product.final_price;
        return 0;
    };

    const getOriginalPrice = (item) => {
        if (item.sales_product) return item.sales_product.original_price;
        return null;
    };

    const getDiscountPercent = (item) => {
        if (item.sales_product) return item.sales_product.discount_percent;
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Loading wishlist...</p>
                </div>
            </div>
        );
    }

    const wishlistItems = wishlist?.items || [];

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">My Wishlist</h1>

                {wishlistItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
                        <p className="mt-1 text-gray-600">Save items you love to your wishlist</p>
                        <button
                            onClick={() => router.push('/publicproducts')}
                            className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {wishlistItems.map((item) => (
                            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="relative">
                                    <img
                                        src={getImageUrl(item)}
                                        alt={getItemName(item)}
                                        className="w-full h-48 object-cover cursor-pointer"
                                        onClick={() => handleProductClick(item)}
                                        onError={(e) => {
                                            e.target.src = '/default-product-image.jpg';
                                            e.target.onerror = null;
                                        }}
                                    />
                                    <button
                                        onClick={() => handleRemoveItem(item.id)}
                                        disabled={removing}
                                        className="absolute top-2 right-2 bg-white rounded-full p-2 shadow hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    {getDiscountPercent(item) && (
                                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                            {getDiscountPercent(item)}% OFF
                                        </div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 
                                        className="font-semibold text-gray-900 truncate cursor-pointer hover:text-gray-700"
                                        onClick={() => handleProductClick(item)}
                                    >
                                        {getItemName(item)}
                                    </h3>
                                    <div className="mt-2">
                                        {getOriginalPrice(item) && (
                                            <p className="text-sm text-gray-500 line-through">
                                                Rs {parseFloat(getOriginalPrice(item)).toLocaleString()}
                                            </p>
                                        )}
                                        <p className="text-lg font-bold text-gray-900">
                                            Rs {parseFloat(getItemPrice(item)).toLocaleString()}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="w-full mt-3 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ToastContainer />
        </div>
    );
};

export default WishlistCom;
