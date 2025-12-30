'use client'
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import AxiosInstance from "@/components/AxiosInstance";
import { ToastContainer, toast } from 'react-toastify';
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
    prod_has_category: '' // Backend expects this field name
  });
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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
        const res = await AxiosInstance.get('/api/myapp/v1/dropdown/category/');
        const responseData = res?.data?.data;
        
        if (!responseData) {
          console.error('Invalid response structure:', res?.data);
          return;
        }
        
        const dataArr = Array.isArray(responseData.data) ? responseData.data : 
                       Array.isArray(responseData) ? responseData : [];
        
        setCategoryRecords(dataArr);
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
    const files = Array.from(e.target.files || []);
    
    // Check if total images exceed 5
    if (images.length + files.length > 5) {
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
    const validImages = files.filter(file => {
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
    
    // Add new files to state
    setImages(prev => [...prev, ...validImages]);
    
    // Create previews for new images
    validImages.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    
    if (!formData.prod_has_category) {
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
      
      // Append text fields (matching backend expectations)
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('original_price', formData.original_price);
      formDataToSend.append('prod_has_category', formData.prod_has_category);
      
      // Only append discount_percent if it has a value
      if (formData.discount_percent) {
        formDataToSend.append('discount_percent', formData.discount_percent);
      }
      
      // Append all images with key 'images' (matching backend)
      images.forEach((img) => {
        formDataToSend.append('images', img);
      });

      const response = await AxiosInstance.post('/api/myapp/v1/sales/product/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Response:', response.data);
      
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
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to add sale product';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          // Handle validation errors
          const errors = error.response.data;
          if (errors.error) errorMessage = errors.error;
          else if (errors.name) errorMessage = errors.name[0];
          else if (errors.original_price) errorMessage = errors.original_price[0];
          else if (errors.prod_has_category) errorMessage = errors.prod_has_category[0];
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

      <ToastContainer 
        position="top-right"
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

      <div className="relative max-w-5xl mx-auto">
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
            <p className="text-slate-400">Add a new exclusive offer to your collection • Upload up to 5 images</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-8 relative overflow-hidden">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-20"></div>
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
          
          <div className="relative z-10">
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Product Images Upload - First for better UX */}
              <div>
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    Product Images *
                  </div>
                  <span className="text-slate-400 text-xs font-normal">
                    {images.length}/5 images
                  </span>
                </label>
                
                {/* Images Preview Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden border-2 border-amber-400/50 bg-slate-900/60">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={isSubmitting}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-amber-500 text-slate-900 text-xs px-2 py-1 rounded font-semibold">
                          Main
                        </div>
                      )}
                      <div className="text-xs text-slate-400 mt-1 truncate text-center">
                        {(images[index].size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ))}
                  
                  {/* Upload Placeholder */}
                  {images.length < 5 && (
                    <label className="cursor-pointer">
                      <div className={`aspect-square rounded-xl border-2 border-dashed ${
                        images.length > 0 
                          ? 'border-amber-400/50 bg-slate-900/40' 
                          : 'border-slate-700/50 bg-slate-900/40 hover:border-amber-400/50 transition-colors'
                      } flex flex-col items-center justify-center p-4 text-center`}>
                        <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-slate-400 text-sm">Add Image</p>
                        <p className="text-slate-500 text-xs mt-1">{images.length}/5</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                        multiple
                        disabled={isSubmitting}
                      />
                    </label>
                  )}
                </div>
                
                {/* Upload Button */}
                <label className="group relative cursor-pointer inline-block">
                  <div className="px-6 py-3 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors text-sm font-medium flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {images.length === 0 ? 'Upload Images' : 'Add More Images'}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                    multiple
                    disabled={isSubmitting || images.length >= 5}
                  />
                </label>
                
                <p className="text-slate-500 text-sm mt-2">
                  Upload up to 5 images (PNG, JPG, JPEG, WebP). Max 5MB each. First image will be the main display.
                </p>
              </div>

              {/* Product Name & Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Product Name *
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Category *
                  </label>
                  <div className="relative group">
                    <select
                      name="prod_has_category"
                      value={formData.prod_has_category}
                      onChange={handleChange}
                      required
                      disabled={isLoading || isSubmitting}
                      className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm appearance-none"
                    >
                      <option value="" className="bg-slate-900">Select Category</option>
                      {isLoading ? (
                        <option value="" className="bg-slate-900" disabled>Loading categories...</option>
                      ) : categoryRecords.length > 0 ? (
                        categoryRecords.map((category) => (
                          <option 
                            key={category.id} 
                            value={category.id}
                            className="bg-slate-900"
                          >
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="" className="bg-slate-900" disabled>No categories available</option>
                      )}
                    </select>
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Description
                </label>
                <div className="relative group">
                  <textarea
                    name="description"
                    placeholder="Enter product description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    disabled={isSubmitting}
                    className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm resize-none"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Price & Discount Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                    </svg>
                    Original Price (PKR) *
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      name="original_price"
                      placeholder="0.00"
                      value={formData.original_price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                    </svg>
                    Discount %
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      name="discount_percent"
                      placeholder="0"
                      value={formData.discount_percent}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      disabled={isSubmitting}
                      className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Final Price (PKR)
                  </label>
                  <div className="px-6 py-4 bg-amber-500/10 border-2 border-amber-400/50 text-amber-300 font-bold text-lg rounded-xl backdrop-blur-sm">
                    PKR {calculateFinalPrice()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center pt-8 gap-4">
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
                  className="group relative px-12 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-slate-900 font-bold text-lg rounded-full shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative flex items-center space-x-3">
                    {isSubmitting ? (
                      <>
                        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating Sale Product...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Create Sale Product</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/adminsales')}
            className="inline-flex items-center space-x-2 px-6 py-2 bg-slate-900/50 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to Sale Products</span>
          </button>
          <p className="text-slate-500 mt-6 flex items-center justify-center space-x-2">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Upload up to 5 images per sale product</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddSalesProduct;