'use client'
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import AxiosInstance from "@/components/AxiosInstance";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '@/components/AuthContext';

interface Category {
  id: number;
  name: string;
}

const AddSalesProduct = () => {
  const router = useRouter();
  const { permissions = {} } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    original_price: '',
    discount_percent: '',
    salesprod_has_category: '' // Changed to match backend field name
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [categoryRecords, setCategoryRecords] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check permissions
    if (!permissions.create_sales_product) {
      toast.error('You do not have permission to add sale products', {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      router.push('/adminsales');
      return;
    }

    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        // Updated API endpoint to match your list view
        const res = await AxiosInstance.get('/api/myapp/v1/category/');
        const responseData = res?.data?.data;
        const categoriesArr = Array.isArray(responseData?.data) ? responseData.data : 
                             Array.isArray(responseData) ? responseData : [];
        setCategoryRecords(categoriesArr);
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        toast.error(
          error.response?.data?.message || 'Failed to load categories',
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
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategories();
  }, [permissions, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      
      // Check if total images exceed 5
      if (images.length + newImages.length > 5) {
        toast.error('You can upload a maximum of 5 images', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
        return;
      }
      
      // Validate file types and sizes
      const validImages = newImages.filter(file => {
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (!validTypes.includes(file.type)) {
          toast.error(`Invalid file type: ${file.name}. Please upload JPG, PNG or WebP images.`, {
            position: "top-center",
            autoClose: 3000,
            theme: "dark",
          });
          return false;
        }
        
        if (file.size > maxSize) {
          toast.error(`File too large: ${file.name}. Maximum size is 5MB.`, {
            position: "top-center",
            autoClose: 3000,
            theme: "dark",
          });
          return false;
        }
        
        return true;
      });
      
      setImages(prev => [...prev, ...validImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const calculateFinalPrice = () => {
    const originalPrice = parseFloat(formData.original_price) || 0;
    const discountPercent = parseFloat(formData.discount_percent) || 0;
    
    if (originalPrice > 0 && discountPercent > 0) {
      const discountAmount = (originalPrice * discountPercent) / 100;
      return (originalPrice - discountAmount).toFixed(2);
    }
    return originalPrice.toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter product name', {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    
    if (!formData.original_price || parseFloat(formData.original_price) <= 0) {
      toast.error('Please enter a valid original price', {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    
    if (!formData.salesprod_has_category) {
      toast.error('Please select a category', {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }
    
    if (images.length === 0) {
      toast.error('Please upload at least one product image', {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      // Append text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Append images
      images.forEach((img, index) => {
        formDataToSend.append('images', img);
      });

      // Updated API endpoint to match your list view
      const response = await AxiosInstance.post('/api/myapp/v1/sales/product/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.status === 201 || response.status === 200) {
        toast.success('Sale product added successfully!', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        });
        
        // Redirect after success
        setTimeout(() => {
          router.push('/adminsales');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error adding sale product:', error);
      
      let errorMessage = 'Failed to add sale product';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          // Handle validation errors
          const errors = error.response.data;
          if (errors.name) errorMessage = errors.name[0];
          else if (errors.original_price) errorMessage = errors.original_price[0];
          else if (errors.salesprod_has_category) errorMessage = errors.salesprod_has_category[0];
          else if (errors.images) errorMessage = errors.images[0];
          else errorMessage = JSON.stringify(errors);
        } else {
          errorMessage = error.response.data;
        }
      }
      
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!permissions.create_sales_product) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Luxury Header */}
        <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-8 mb-10 relative overflow-hidden">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-2xl shadow-amber-500/50 mb-4">
              <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-2">
              CREATE SALE PRODUCT
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mb-3"></div>
            <p className="text-slate-400">Add a new exclusive offer to your collection</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-8 relative overflow-hidden">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-20"></div>
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
          
          <div className="relative z-10">
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Product Name & Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-amber-400 font-semibold mb-2 text-lg">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 rounded-xl focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                    placeholder="Enter product name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-amber-400 font-semibold mb-2 text-lg">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="salesprod_has_category"
                    value={formData.salesprod_has_category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 rounded-xl focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                    required
                    disabled={isLoading || isSubmitting}
                  >
                    <option value="" className="bg-slate-900">Select a category</option>
                    {isLoading ? (
                      <option className="bg-slate-900" disabled>Loading categories...</option>
                    ) : (
                      categoryRecords?.map((item) => (
                        <option key={item.id} value={item.id} className="bg-slate-900">
                          {item.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-amber-400 font-semibold mb-2 text-lg">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 rounded-xl focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                  placeholder="Enter product description"
                  disabled={isSubmitting}
                />
              </div>

              {/* Price & Discount Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-amber-400 font-semibold mb-2 text-lg">
                    Original Price (PKR) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-400">
                      PKR
                    </div>
                    <input
                      type="number"
                      name="original_price"
                      min="0"
                      step="0.01"
                      value={formData.original_price}
                      onChange={handleChange}
                      className="w-full pl-16 pr-4 py-3 bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 rounded-xl focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                      placeholder="0.00"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-amber-400 font-semibold mb-2 text-lg">
                    Discount Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="discount_percent"
                      min="0"
                      max="100"
                      value={formData.discount_percent}
                      onChange={handleChange}
                      className="w-full pl-4 pr-12 py-3 bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 rounded-xl focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-400">
                      %
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-amber-400 font-semibold mb-2 text-lg">
                    Final Price (PKR)
                  </label>
                  <div className="px-4 py-3 bg-slate-900/60 border-2 border-slate-700/50 text-amber-300 font-bold rounded-xl backdrop-blur-sm">
                    {calculateFinalPrice()}
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-amber-400 font-semibold mb-2 text-lg">
                  Product Images <span className="text-red-500">*</span>
                  <span className="text-sm text-slate-400 ml-2">(Max 5 images)</span>
                </label>
                
                <div className="mb-4">
                  <label className="cursor-pointer inline-block">
                    <span className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all">
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      Upload Images
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="sr-only"
                      disabled={isSubmitting || images.length >= 5}
                    />
                  </label>
                  <p className="mt-2 text-slate-400">
                    {images.length} of 5 images selected • Max size: 5MB each • Supported: JPG, PNG, WebP
                  </p>
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(img)}
                          alt={`Preview ${index + 1}`}
                          className="h-32 w-full object-cover rounded-xl border-2 border-slate-700/50 group-hover:border-amber-400 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          disabled={isSubmitting}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          title="Remove image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <div className="text-xs text-slate-400 mt-1 truncate">
                          {(img.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end pt-6 space-x-4">
                <button
                  type="button"
                  onClick={() => router.push('/adminsales')}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || images.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-xl shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    'Create Sale Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSalesProduct;