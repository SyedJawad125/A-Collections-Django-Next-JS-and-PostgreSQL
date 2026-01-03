'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AxiosInstance from "@/components/AxiosInstance";

interface Product {
  id: number;
  name: string;
  price: number;
  has_discount?: boolean;
}

interface SalesProduct {
  id: number;
  name: string;
  final_price: number;
  has_discount?: boolean;
}

interface OrderItem {
  id?: number;
  product_type: 'product' | 'sales_product';
  product_id: number | null;
  quantity: number;
  unit_price?: number;
  total_price?: number;
  is_discounted?: boolean;
}

interface OrderData {
  order_id: number;
  customer_info: {
    name: string;
    email: string;
    phone: string;
  };
  delivery_info: {
    address: string;
    city: string;
    estimated_date: string;
  };
  order_summary: {
    items: OrderItem[];
    subtotal: number;
    total: number;
  };
  payment_method: string;
  status: string;
}

const UpdateOrder = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('orderid');
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    delivery_address: '',
    city: '',
    payment_method: 'cash_on_delivery',
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [salesProducts, setSalesProducts] = useState<SalesProduct[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [itemsToDelete, setItemsToDelete] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');

  // Fetch order data and products
  useEffect(() => {
  const fetchData = async () => {
    try {
      setIsFetching(true);

      const [productsRes, salesProductsRes, orderRes] = await Promise.all([
        AxiosInstance.get('/ecommerce/dropdownlistproduct'),
        AxiosInstance.get('/ecommerce/dropdownlistsalesproduct'),
        AxiosInstance.get(`/ecommerce/textbox_order?id=${id}`)
      ]);

      // ✅ Set Products
      if (productsRes.data?.data?.data) {
        setProducts(productsRes.data.data.data);
      }

      // ✅ Set Sales Products
      if (salesProductsRes.data?.data?.data) {
        const salesProductsData = salesProductsRes.data.data.data.map((product: any) => ({
          ...product,
          final_price: Number(product.final_price)
        }));
        setSalesProducts(salesProductsData);
      }

      // ✅ Set Order Data
      if (orderRes.data?.data) {
        const orderData = orderRes.data.data;

        // 🟢 Corrected Form Fields based on backend response
        setFormData({
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          delivery_address: orderData.delivery_address,
          city: orderData.city || '',
          payment_method: orderData.payment_method,
        });

        // 🟢 Map order_details into expected format
        const items = orderData.order_details.map((item: any) => ({
          id: item.id,
          product_type: item.sales_product ? 'sales_product' : 'product',
          product_id: item.sales_product ?? item.product,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          is_discounted: item.sales_product !== null
        }));

        setOrderItems(items);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load order data');
    } finally {
      setIsFetching(false);
    }
  };

  if (id) {
    fetchData(); // 🔁 Only fetch if id exists
  }
}, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' ? parseInt(value) || 1 : value
    };
    
    // Recalculate price if product or quantity changed
    if (field === 'product_id' || field === 'quantity' || field === 'product_type') {
      const productId = updatedItems[index].product_id;
      const quantity = updatedItems[index].quantity;
      const productType = updatedItems[index].product_type;
      
      if (productId) {
        let product;
        if (productType === 'product') {
          product = products.find(p => p.id === productId);
          if (product) {
            updatedItems[index].unit_price = product.price;
            updatedItems[index].total_price = product.price * quantity;
            updatedItems[index].is_discounted = product.has_discount;
          }
        } else {
          product = salesProducts.find(p => p.id === productId);
          if (product) {
            updatedItems[index].unit_price = product.final_price;
            updatedItems[index].total_price = product.final_price * quantity;
            updatedItems[index].is_discounted = product.has_discount;
          }
        }
      }
    }
    
    setOrderItems(updatedItems);
  };

  const addItem = () => {
    setOrderItems([...orderItems, { 
      product_type: 'product', 
      product_id: null, 
      quantity: 1 
    }]);
  };

  const removeItem = (index: number) => {
    const itemToRemove = orderItems[index];
    const updatedItems = [...orderItems];
    
    if (itemToRemove.id) {
      setItemsToDelete([...itemsToDelete, itemToRemove.id]);
    }
    
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const payload = {
        id: Number(id),
        ...formData,
        items: orderItems
          .filter(item => item.product_id !== null)
          .map(item => ({
            id: item.id,
            product_type: item.product_type,
            product_id: item.product_id,
            quantity: item.quantity
          })),
        delete_items: itemsToDelete,
        full_update: false
      };

      const response = await AxiosInstance.patch('/ecommerce/order', payload);
      
      if (response.data) {
        router.push('/orderspage');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      setError('Failed to update order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Loading order data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-md p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/orderspage')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-indigo-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Update Order #{id}</h2>
            <p className="mt-1 text-indigo-100">Update customer details and order items</p>
          </div>
          
          {/* Form */}
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Name */}
              <div className="md:col-span-2">
                <label htmlFor="customer_name" className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Customer Email */}
              <div>
                <label htmlFor="customer_email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="customer_email"
                  name="customer_email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={formData.customer_email}
                  onChange={handleChange}
                />
              </div>

              {/* Customer Phone */}
              <div>
                <label htmlFor="customer_phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Delivery Address */}
              <div className="md:col-span-2">
                <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="delivery_address"
                  name="delivery_address"
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={formData.delivery_address}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={formData.city}
                  onChange={handleChange}
                />
              </div>

              {/* Payment Method */}
              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  id="payment_method"
                  name="payment_method"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  value={formData.payment_method}
                  onChange={handleChange}
                  required
                >
                  <option value="cash_on_delivery">Cash ON Delivery</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="paypal">Paypal</option>
                </select>
              </div>
            </div>

            {/* Order Items */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
              
              {orderItems.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  {/* Product Type */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      value={item.product_type}
                      onChange={(e) => handleItemChange(index, 'product_type', e.target.value)}
                    >
                      <option value="product">Regular Product</option>
                      <option value="sales_product">Sales Product</option>
                    </select>
                  </div>

                  {/* Product Selection */}
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <select
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      value={item.product_id || ''}
                      onChange={(e) => handleItemChange(index, 'product_id', parseInt(e.target.value) || null)}
                      required
                    >
                      <option value="">Select a product</option>
                      {item.product_type === 'product' 
                        ? products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ${product.price.toFixed(2)}
                              {product.has_discount && ' (Discounted)'}
                            </option>
                          ))
                        : salesProducts.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.name} - ${product.final_price.toFixed(2)}
                              {product.has_discount && ' (Discounted)'}
                            </option>
                          ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                  </div>

                  {/* Remove Button */}
                  <div className="md:col-span-2 flex items-end">
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={addItem}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-2">
                {orderItems
                  .filter(item => item.product_id !== null)
                  .map((item, index) => {
                    const product = item.product_type === 'product' 
                      ? products.find(p => p.id === item.product_id)
                      : salesProducts.find(p => p.id === item.product_id);
                    
                    return (
                      <div key={index} className="flex justify-between border-b border-gray-100 pb-2">
                        <div>
                          <p className="font-medium">
                            {product?.name || 'Unknown Product'}
                            {item.is_discounted && (
                              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                Discounted
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × ${item.unit_price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${item.total_price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    );
                  })}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>
                    ${
                      orderItems
                        .reduce((sum, item) => sum + (item.total_price || 0), 0)
                        .toFixed(2)
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => router.push('/orderspage')}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : 'Update Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateOrder;