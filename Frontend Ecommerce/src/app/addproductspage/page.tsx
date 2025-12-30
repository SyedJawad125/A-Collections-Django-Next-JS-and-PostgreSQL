'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AxiosInstance from "@/components/AxiosInstance";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
}

const AddProduct = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    prod_has_category: '',
    group: '',
    tags: [] as number[],
  });

  // Group choices matching Django model
  const GROUP_CHOICES = [
    { value: 'Men', label: 'Men' },
    { value: 'Women', label: 'Women' },
    { value: 'Kids', label: 'Kids' },
    { value: 'General', label: 'General' },
  ];
  
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [categoryRecords, setCategoryRecords] = useState<Category[]>([]);
  const [tagRecords, setTagRecords] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingTags, setIsLoadingTags] = useState(true);

  // Fetch categories for the dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const res = await AxiosInstance.get('/api/myapp/v1/dropdown/category/');
        const responseData = res?.data?.data;
        
        if (!responseData) {
          console.error('Invalid response structure:', res?.data);
          return;
        }
        
        const dataArr = Array.isArray(responseData.data) ? responseData.data : 
                       Array.isArray(responseData) ? responseData : [];
        
        setCategoryRecords(dataArr);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories', {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      } finally {
        setIsLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);

  // Fetch tags for the dropdown
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        const res = await AxiosInstance.get('/api/myapp/v1/product/tag/');
        const responseData = res?.data?.data;
        
        if (!responseData) {
          console.error('Invalid response structure:', res?.data);
          return;
        }
        
        const dataArr = Array.isArray(responseData.data) ? responseData.data : 
                       Array.isArray(responseData) ? responseData : [];
        
        setTagRecords(dataArr);
      } catch (error) {
        console.error('Error fetching tags:', error);
        // Tags are optional, so we don't show an error toast
      } finally {
        setIsLoadingTags(false);
      }
    };
    
    fetchTags();
  }, []);

  // Handle text input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle tag selection
  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => parseInt(option.value));
    setFormData({ ...formData, tags: selectedOptions });
  };

  // Handle multiple image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate total number of images (max 5)
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    
    // Validate each file size (max 5MB each)
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    
    // Add new files to state
    setImages(prev => [...prev, ...validFiles]);
    
    // Create previews for new images
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove an image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.description.trim() || !formData.price.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (!formData.prod_has_category) {
      toast.error('Please select a category');
      return;
    }
    
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    
    setIsLoading(true);
    try {
      const submitData = new FormData();
      
      // Add all text fields
      submitData.append('name', formData.name.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('price', formData.price.trim());
      submitData.append('prod_has_category', formData.prod_has_category);
      
      // Add group only if selected
      if (formData.group) {
        submitData.append('group', formData.group);
      }
      
      // Add tags (matching backend format)
      if (formData.tags.length > 0) {
        formData.tags.forEach(tagId => {
          submitData.append('tags', tagId.toString());
        });
      }
      
      // Add all images (matching backend format)
      images.forEach((image) => {
        submitData.append('images', image);
      });

      // Use product API endpoint
      const response = await AxiosInstance.post('/api/myapp/v1/product/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Response:', response.data);
      toast.success('Product added successfully!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        prod_has_category: '',
        group: '',
        tags: [],
      });
      setImages([]);
      setImagePreviews([]);
      
      // Redirect to products page
      setTimeout(() => {
        router.push('/adminproducts');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to add product';
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
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
      
      <div className="relative max-w-6xl mx-auto">
        {/* Luxury Glassmorphism Container */}
        <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-10 relative overflow-hidden">
          
          {/* Animated Border Glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
          
          <div className="relative z-10">
            {/* Premium Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-2xl shadow-amber-500/50 mb-6">
                <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-3 tracking-tight">
                Add Premium Product
              </h2>
              <p className="text-slate-400 text-lg">Upload up to 5 images for your product</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Product Images Upload - MULTIPLE */}
              <div className="space-y-3">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center justify-between">
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
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
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
                  />
                </label>
                
                {/* Helper Text */}
                <p className="text-slate-500 text-sm">
                  Upload up to 5 images (PNG, JPG, JPEG). First image will be used as main display.
                </p>
              </div>

              {/* Input Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Name */}
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
                      className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Product Price */}
                <div className="space-y-3">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                    </svg>
                    Price (PKR) *
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      name="price"
                      placeholder="Enter price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                    />
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
                  Description *
                </label>
                <div className="relative group">
                  <textarea
                    name="description"
                    placeholder="Enter detailed product description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm resize-none"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Category, Group, and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Category Selection */}
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
                      disabled={isLoadingCategories}
                      className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm appearance-none"
                    >
                      <option value="" className="bg-slate-900">Select Category</option>
                      {isLoadingCategories ? (
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

                {/* Group */}
                <div className="space-y-3">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Group
                  </label>
                  <div className="relative group">
                    <select
                      name="group"
                      value={formData.group}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm appearance-none"
                    >
                      <option value="" className="bg-slate-900">Select Group</option>
                      {GROUP_CHOICES.map((choice) => (
                        <option 
                          key={choice.value} 
                          value={choice.value}
                          className="bg-slate-900"
                        >
                          {choice.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Tags Selection */}
                <div className="space-y-3">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    Tags
                  </label>
                  <div className="relative group">
                    <select
                      name="tags"
                      value={formData.tags}
                      onChange={handleTagChange}
                      multiple
                      disabled={isLoadingTags}
                      className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                      size={3}
                    >
                      {isLoadingTags ? (
                        <option value="" className="bg-slate-900" disabled>Loading tags...</option>
                      ) : tagRecords.length > 0 ? (
                        tagRecords.map((tag) => (
                          <option 
                            key={tag.id} 
                            value={tag.id}
                            className="bg-slate-900 py-2"
                          >
                            {tag.name}
                          </option>
                        ))
                      ) : (
                        <option value="" className="bg-slate-900" disabled>No tags available</option>
                      )}
                    </select>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
                  </div>
                  <p className="text-slate-500 text-xs">Hold Ctrl/Cmd to select multiple tags</p>
                </div>
              </div>

              {/* Premium Submit Button */}
              <div className="flex justify-center pt-8">
                <button
                  type="submit"
                  disabled={isLoading || isLoadingCategories || images.length === 0}
                  className="group relative px-12 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-slate-900 font-bold text-lg rounded-full shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all duration-300 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {/* Button Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Button Content */}
                  <div className="relative flex items-center space-x-3">
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span>{isLoading ? 'Creating Product...' : 'Add Premium Product'}</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Elegant Footer */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/adminproducts')}
            className="inline-flex items-center space-x-2 px-6 py-2 bg-slate-900/50 border border-slate-700 text-slate-300 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Back to Products</span>
          </button>
          <p className="text-slate-500 mt-6 flex items-center justify-center space-x-2">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Upload up to 5 images per product</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;