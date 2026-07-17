'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const CartCom = () => {
    const router = useRouter();
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await AxiosInstance.get('/api/myapp/v1/cart/');
            setCart(res.data.data);
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (error.response?.status === 404) {
                setCart({ items: [], total_items: 0, subtotal: 0 });
            } else {
                toast.error('Failed to load cart');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleQuantityChange = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        
        setUpdating(true);
        try {
            await AxiosInstance.patch(`/api/myapp/v1/cart/item/?id=${itemId}`, { quantity: newQuantity });
            await fetchCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Failed to update quantity');
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveItem = async (itemId) => {
        if (!window.confirm('Are you sure you want to remove this item?')) return;
        
        setUpdating(true);
        try {
            await AxiosInstance.delete(`/api/myapp/v1/cart/item/?id=${itemId}`);
            toast.success('Item removed from cart');
            await fetchCart();
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Failed to remove item');
        } finally {
            setUpdating(false);
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm('Are you sure you want to clear your cart?')) return;
        
        setLoading(true);
        try {
            await AxiosInstance.delete('/api/myapp/v1/cart/');
            toast.success('Cart cleared');
            await fetchCart();
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Failed to clear cart');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = () => {
        router.push('/checkout');
    };

    const getImageUrl = (item) => {
        if (item.product_variant?.product?.images?.length > 0) {
            const image = item.product_variant.product.images[0];
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
        if (item.product_variant) {
            return item.product_variant.product.name;
        }
        if (item.sales_product) {
            return item.sales_product.name;
        }
        return 'Unknown Product';
    };

    const getItemPrice = (item) => {
        if (item.product_variant) {
            return item.product_variant.total_price;
        }
        if (item.sales_product) {
            return item.sales_product.final_price;
        }
        return 0;
    };

    const getItemAttributes = (item) => {
        const attributes = [];
        if (item.product_variant) {
            if (item.product_variant.size) attributes.push(`Size: ${item.product_variant.size}`);
            if (item.product_variant.material) attributes.push(`Material: ${item.product_variant.material}`);
            if (item.product_variant.colors?.length > 0) {
                attributes.push(`Color: ${item.product_variant.colors.map(c => c.name).join(', ')}`);
            }
        }
        return attributes.join(' | ');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    <p className="mt-4 text-gray-600">Loading cart...</p>
                </div>
            </div>
        );
    }

    const cartItems = cart?.items || [];
    const totalItems = cart?.total_items || 0;
    const subtotal = cart?.subtotal || 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

                {cartItems.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
                        <p className="mt-1 text-gray-600">Add some products to get started</p>
                        <button
                            onClick={() => router.push('/publicproducts')}
                            className="mt-4 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                                    <img
                                        src={getImageUrl(item)}
                                        alt={getItemName(item)}
                                        className="w-24 h-24 object-cover rounded"
                                        onError={(e) => {
                                            e.target.src = '/default-product-image.jpg';
                                            e.target.onerror = null;
                                        }}
                                    />
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900">{getItemName(item)}</h3>
                                        {getItemAttributes(item) && (
                                            <p className="text-sm text-gray-600 mt-1">{getItemAttributes(item)}</p>
                                        )}
                                        <p className="text-lg font-bold text-gray-900 mt-2">
                                            Rs {parseFloat(getItemPrice(item)).toLocaleString()}
                                        </p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                disabled={updating || item.quantity <= 1}
                                                className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                                            >
                                                -
                                            </button>
                                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                disabled={updating}
                                                className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col justify-between items-end">
                                        <p className="text-lg font-bold text-gray-900">
                                            Rs {parseFloat(item.line_total || getItemPrice(item) * item.quantity).toLocaleString()}
                                        </p>
                                        <button
                                            onClick={() => handleRemoveItem(item.id)}
                                            disabled={updating}
                                            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                                
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Items</span>
                                        <span className="font-medium">{totalItems}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">Rs {parseFloat(subtotal).toLocaleString()}</span>
                                    </div>
                                    <div className="border-t pt-3">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span>Rs {parseFloat(subtotal).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                                >
                                    Proceed to Checkout
                                </button>

                                <button
                                    onClick={handleClearCart}
                                    disabled={updating}
                                    className="w-full mt-3 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                                >
                                    Clear Cart
                                </button>

                                <button
                                    onClick={() => router.push('/publicproducts')}
                                    className="w-full mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <ToastContainer />
        </div>
    );
};

export default CartCom;
