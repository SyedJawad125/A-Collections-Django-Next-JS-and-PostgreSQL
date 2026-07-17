'use client'
import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

const CouponCom = ({ onCouponApplied, cartTotal }) => {
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const handleValidateCoupon = async () => {
        if (!couponCode.trim()) {
            toast.error('Please enter a coupon code');
            return;
        }

        setLoading(true);
        try {
            const res = await AxiosInstance.post('/api/myapp/v1/public/coupon/validate/', {
                code: couponCode,
                order_amount: cartTotal
            });

            const couponData = res.data.data;
            setAppliedCoupon(couponData);
            setDiscountAmount(couponData.discount_amount || 0);
            
            toast.success(`Coupon applied! You saved Rs ${parseFloat(couponData.discount_amount || 0).toLocaleString()}`);
            
            if (onCouponApplied) {
                onCouponApplied({
                    couponId: couponData.id,
                    code: couponData.code,
                    discountAmount: couponData.discount_amount || 0,
                    discountType: couponData.discount_type
                });
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Invalid coupon code';
            toast.error(errorMessage);
            setAppliedCoupon(null);
            setDiscountAmount(0);
            if (onCouponApplied) {
                onCouponApplied(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setDiscountAmount(0);
        setCouponCode('');
        if (onCouponApplied) {
            onCouponApplied(null);
        }
        toast.info('Coupon removed');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleValidateCoupon();
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Apply Coupon</h3>
            
            {appliedCoupon ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                            <p className="text-sm text-green-600">
                                {appliedCoupon.discount_type === 'percentage' 
                                    ? `${appliedCoupon.discount_value}% off` 
                                    : `Rs ${parseFloat(appliedCoupon.discount_value).toLocaleString()} off`}
                            </p>
                            <p className="text-sm font-semibold text-green-800 mt-1">
                                You save: Rs {parseFloat(discountAmount).toLocaleString()}
                            </p>
                        </div>
                        <button
                            onClick={handleRemoveCoupon}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter coupon code"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black uppercase"
                        disabled={loading}
                    />
                    <button
                        onClick={handleValidateCoupon}
                        disabled={loading || !couponCode.trim()}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Applying...' : 'Apply'}
                    </button>
                </div>
            )}

            <div className="mt-3 text-xs text-gray-500">
                <p>• Coupon codes are case-sensitive</p>
                <p>• Only one coupon can be applied per order</p>
                <p>• Minimum order amount may apply</p>
            </div>

            <ToastContainer />
        </div>
    );
};

export default CouponCom;
