// 'use client'
// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import AxiosInstance from "@/components/AxiosInstance";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// interface Product {
//   id: number;
//   name: string;
// }

// interface SalesProduct {
//   id: number;
//   name: string;
//   discount_percent: number;
// }

// const AddReview = () => {
//   const router = useRouter();
  
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     rating: 0,
//     comment: '',
//     product: '',
//     sales_product: ''
//   });
  
//   const [products, setProducts] = useState<Product[]>([]);
//   const [salesProducts, setSalesProducts] = useState<SalesProduct[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [hoverRating, setHoverRating] = useState(0);
//   const [productType, setProductType] = useState<'regular' | 'sales'>('sales');

//   React.useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         // Updated API endpoints
//         const [regularRes, salesRes] = await Promise.all([
//           AxiosInstance.get('/api/myapp/v1/dropdownlistproduct/'),
//           AxiosInstance.get('/api/myapp/v1/dropdownlistsalesproduct/')
//         ]);
        
//         if (regularRes?.data) {
//           // Handle different possible response structures
//           const regularData = regularRes.data.data?.data || regularRes.data.data || regularRes.data || [];
//           setProducts(regularData);
//         }
//         if (salesRes?.data) {
//           const salesData = salesRes.data.data?.data || salesRes.data.data || salesRes.data || [];
//           setSalesProducts(salesData);
//         }
//       } catch (error) {
//         console.error('Error fetching products:', error);
//         toast.error('Failed to load products', {
//           position: "top-center",
//           autoClose: 2000,
//           theme: "dark",
//         });
//       }
//     };
//     fetchProducts();
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleRatingChange = (rating: number) => {
//     setFormData(prev => ({
//       ...prev,
//       rating
//     }));
//   };

//   const handleProductTypeChange = (type: 'regular' | 'sales') => {
//     setProductType(type);
//     // Clear the other product type when switching
//     setFormData(prev => ({
//       ...prev,
//       product: type === 'regular' ? prev.product : '',
//       sales_product: type === 'sales' ? prev.sales_product : ''
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
    
//     // Validate at least one product is selected
//     if (!formData.product && !formData.sales_product) {
//       toast.error('Please select either a product or sales product', {
//         position: "top-center",
//         autoClose: 2000,
//         theme: "dark",
//       });
//       setIsLoading(false);
//       return;
//     }

//     // Validate rating
//     if (formData.rating === 0) {
//       toast.error('Please select a rating', {
//         position: "top-center",
//         autoClose: 2000,
//         theme: "dark",
//       });
//       setIsLoading(false);
//       return;
//     }

//     try {
//       // Build payload matching Postman structure
//       const payload: any = {
//         rating: parseInt(formData.rating as unknown as string),
//         comment: formData.comment.trim(),
//         name: formData.name.trim(),
//         email: formData.email.trim()
//       };

//       // Add only the selected product type
//       if (formData.product) {
//         payload.product = parseInt(formData.product);
//       } else if (formData.sales_product) {
//         payload.sales_product = parseInt(formData.sales_product);
//       }

//       // Updated API endpoint
//       const response = await AxiosInstance.post('/api/myapp/v1/review/', payload);
      
//       if (response) {
//         toast.success('Review submitted successfully!', {
//           position: "top-center",
//           autoClose: 2000,
//           theme: "dark",
//         });
//         setTimeout(() => {
//           router.push('/adminreviews');
//         }, 2000);
//       }
//     } catch (error: any) {
//       console.error('Error:', error);
//       const errorMessage = error?.response?.data?.message || 'Failed to submit review. Please try again.';
//       toast.error(errorMessage, {
//         position: "top-center",
//         autoClose: 2000,
//         theme: "dark",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
//       <ToastContainer 
//         position="top-center"
//         autoClose={2000}
//         hideProgressBar
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="dark"
//       />
      
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
//           {/* Header */}
//           <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-6">
//             <h2 className="text-3xl font-light text-white">Add New Review</h2>
//             <p className="mt-2 text-amber-100">Share your feedback about a product</p>
//           </div>
          
//           {/* Form */}
//           <form className="p-8 space-y-6" onSubmit={handleSubmit}>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               {/* Reviewer Name */}
//               <div>
//                 <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
//                   Your Name <span className="text-amber-400">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   name="name"
//                   className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
//                   placeholder="Enter your name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>

//               {/* Email */}
//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
//                   Email Address <span className="text-amber-400">*</span>
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
//                   placeholder="your.email@example.com"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                 />
//               </div>

//               {/* Product Type Selection */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-300 mb-3">
//                   Product Type <span className="text-amber-400">*</span>
//                 </label>
//                 <div className="flex space-x-4">
//                   <button
//                     type="button"
//                     onClick={() => handleProductTypeChange('regular')}
//                     className={`flex-1 px-6 py-3 rounded-lg border transition-all duration-200 ${
//                       productType === 'regular' 
//                         ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/20' 
//                         : 'border-gray-600 text-gray-400 hover:border-gray-500 bg-gray-700/50'
//                     }`}
//                   >
//                     <div className="flex items-center justify-center">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//                       </svg>
//                       Regular Product
//                     </div>
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => handleProductTypeChange('sales')}
//                     className={`flex-1 px-6 py-3 rounded-lg border transition-all duration-200 ${
//                       productType === 'sales' 
//                         ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/20' 
//                         : 'border-gray-600 text-gray-400 hover:border-gray-500 bg-gray-700/50'
//                     }`}
//                   >
//                     <div className="flex items-center justify-center">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//                       </svg>
//                       Sales Product
//                     </div>
//                   </button>
//                 </div>
//               </div>

//               {/* Product Selection */}
//               <div className="md:col-span-2">
//                 <label htmlFor={productType === 'regular' ? 'product' : 'sales_product'} className="block text-sm font-medium text-gray-300 mb-2">
//                   {productType === 'regular' ? 'Select Product' : 'Select Sales Product'} <span className="text-amber-400">*</span>
//                 </label>
//                 <select
//                   id={productType === 'regular' ? 'product' : 'sales_product'}
//                   name={productType === 'regular' ? 'product' : 'sales_product'}
//                   className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
//                   value={productType === 'regular' ? formData.product : formData.sales_product}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">Choose a {productType === 'regular' ? 'product' : 'sales product'}</option>
//                   {(productType === 'regular' ? products : salesProducts)?.map((item) => (
//                     <option value={item.id} key={item.id}>
//                       {item.name}
//                       {productType === 'sales' && ` (${(item as SalesProduct).discount_percent}% off)`}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Rating */}
//               <div className="md:col-span-2">
//                 <label className="block text-sm font-medium text-gray-300 mb-3">
//                   Rating <span className="text-amber-400">*</span>
//                 </label>
//                 <div className="flex items-center space-x-2">
//                   {[1, 2, 3, 4, 5].map((star) => (
//                     <button
//                       key={star}
//                       type="button"
//                       className={`text-4xl focus:outline-none transition-all duration-200 transform hover:scale-110 ${
//                         (hoverRating || formData.rating) >= star 
//                           ? 'text-amber-400 drop-shadow-lg' 
//                           : 'text-gray-600 hover:text-gray-500'
//                       }`}
//                       onClick={() => handleRatingChange(star)}
//                       onMouseEnter={() => setHoverRating(star)}
//                       onMouseLeave={() => setHoverRating(0)}
//                     >
//                       ★
//                     </button>
//                   ))}
//                   <span className="ml-4 text-gray-400">
//                     {formData.rating > 0 
//                       ? `${formData.rating} star${formData.rating !== 1 ? 's' : ''}` 
//                       : 'Click to rate'}
//                   </span>
//                 </div>
//               </div>

//               {/* Comment */}
//               <div className="md:col-span-2">
//                 <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
//                   Review Comment <span className="text-amber-400">*</span>
//                 </label>
//                 <textarea
//                   id="comment"
//                   name="comment"
//                   rows={5}
//                   className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-none"
//                   placeholder="Share your experience with this product..."
//                   value={formData.comment}
//                   onChange={handleChange}
//                   required
//                 />
//                 <p className="mt-1 text-sm text-gray-400">
//                   {formData.comment.length} characters
//                 </p>
//               </div>
//             </div>

//             {/* Submit Buttons */}
//             <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
//               <button
//                 type="button"
//                 onClick={() => router.push('/adminreviews')}
//                 className="px-6 py-3 border border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className={`px-8 py-3 border border-transparent shadow-lg text-sm font-medium rounded-lg text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 ${
//                   isLoading ? 'opacity-75 cursor-not-allowed' : 'transform hover:scale-105'
//                 }`}
//               >
//                 {isLoading ? (
//                   <div className="flex items-center">
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Submitting...
//                   </div>
//                 ) : (
//                   'Submit Review'
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>

//         {/* Help Text */}
//         <div className="mt-6 text-center text-gray-400 text-sm">
//           <p>All fields marked with <span className="text-amber-400">*</span> are required</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddReview;



'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AxiosInstance from "@/components/AxiosInstance";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Product {
  id: number;
  name: string;
  price?: number;
  has_discount?: boolean;
}

interface SalesProduct {
  id: number;
  name: string;
  final_price?: number;
  discount_percent?: number;
  has_discount?: boolean;
}

const AddReview = () => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 0,
    comment: '',
    product: '',
    sales_product: ''
  });
  
  const [products, setProducts] = useState<Product[]>([]);
  const [salesProducts, setSalesProducts] = useState<SalesProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);
  const [productType, setProductType] = useState<'regular' | 'sales'>('sales');

  React.useEffect(() => {
    const fetchProducts = async () => {
      setDataLoading(true);
      try {
        console.log('Starting to fetch products...');
        
        // Fetch products - matching AdminAddOrder endpoints
        const productsRes = await AxiosInstance.get('/api/myapp/v1/dropdown/product/');
        console.log('Products Response:', productsRes.data);
        
        if (productsRes.data?.data && Array.isArray(productsRes.data.data)) {
          const productsData = productsRes.data.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: Number(product.price) || 0,
            has_discount: product.has_discount || false
          }));
          setProducts(productsData);
          console.log('Products loaded:', productsData.length, productsData);
        } else {
          console.log('No products data found');
          setProducts([]);
        }
        
        // Fetch sales products - matching AdminAddOrder endpoints
        const salesProductsRes = await AxiosInstance.get('/api/myapp/v1/dropdown/sales/product/');
        console.log('Sales Products Response:', salesProductsRes.data);
        
        if (salesProductsRes.data?.data && Array.isArray(salesProductsRes.data.data)) {
          const salesProductsData = salesProductsRes.data.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            final_price: Number(product.final_price) || 0,
            discount_percent: product.discount_percent || 0,
            has_discount: product.has_discount || false
          }));
          setSalesProducts(salesProductsData);
          console.log('Sales Products loaded:', salesProductsData.length, salesProductsData);
        } else {
          console.log('No sales products data found');
          setSalesProducts([]);
        }
        
      } catch (error: any) {
        console.error('Error fetching products:', error);
        console.error('Error details:', error.response?.data);
        const errorMessage = error.response?.data?.message || 'Failed to load products';
        toast.error(errorMessage, {
          position: "top-center",
          autoClose: 3000,
          theme: "dark",
        });
      } finally {
        setDataLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleProductTypeChange = (type: 'regular' | 'sales') => {
    setProductType(type);
    // Clear the other product type when switching
    setFormData(prev => ({
      ...prev,
      product: type === 'regular' ? prev.product : '',
      sales_product: type === 'sales' ? prev.sales_product : ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Validate at least one product is selected
    if (!formData.product && !formData.sales_product) {
      toast.error('Please select either a product or sales product', {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
      setIsLoading(false);
      return;
    }

    // Validate rating
    if (formData.rating === 0) {
      toast.error('Please select a rating', {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Build payload matching Postman structure
      const payload: any = {
        rating: parseInt(formData.rating as unknown as string),
        comment: formData.comment.trim(),
        name: formData.name.trim(),
        email: formData.email.trim()
      };

      // Add only the selected product type
      if (formData.product) {
        payload.product = parseInt(formData.product);
      } else if (formData.sales_product) {
        payload.sales_product = parseInt(formData.sales_product);
      }

      console.log('Submitting review:', payload);
      
      const response = await AxiosInstance.post('/api/myapp/v1/review/', payload);
      
      if (response.data) {
        toast.success('Review submitted successfully!', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
        setTimeout(() => {
          router.push('/adminreviews');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || 'Failed to submit review. Please try again.';
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        theme: "dark",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mb-4"></div>
          <p className="text-gray-400">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <ToastContainer 
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
      
      <div className="max-w-4xl mx-auto">
        {/* Debug Info - Remove in production */}
        <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <p className="text-sm text-blue-300">
            Products loaded: {products.length} | Sales Products loaded: {salesProducts.length}
          </p>
        </div>

        <div className="bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-6">
            <h2 className="text-3xl font-light text-white">Add New Review</h2>
            <p className="mt-2 text-amber-100">Share your feedback about a product</p>
          </div>
          
          {/* Form */}
          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reviewer Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address <span className="text-amber-400">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Product Type Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Product Type <span className="text-amber-400">*</span>
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleProductTypeChange('regular')}
                    className={`flex-1 px-6 py-3 rounded-lg border transition-all duration-200 ${
                      productType === 'regular' 
                        ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/20' 
                        : 'border-gray-600 text-gray-400 hover:border-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Regular Product
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProductTypeChange('sales')}
                    className={`flex-1 px-6 py-3 rounded-lg border transition-all duration-200 ${
                      productType === 'sales' 
                        ? 'bg-amber-600/20 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/20' 
                        : 'border-gray-600 text-gray-400 hover:border-gray-500 bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Sales Product
                    </div>
                  </button>
                </div>
              </div>

              {/* Product Selection */}
              <div className="md:col-span-2">
                <label htmlFor={productType === 'regular' ? 'product' : 'sales_product'} className="block text-sm font-medium text-gray-300 mb-2">
                  {productType === 'regular' ? 'Select Product' : 'Select Sales Product'} <span className="text-amber-400">*</span>
                  {productType === 'regular' && products.length === 0 && (
                    <span className="ml-2 text-xs text-red-400">(No products available)</span>
                  )}
                  {productType === 'sales' && salesProducts.length === 0 && (
                    <span className="ml-2 text-xs text-red-400">(No sales products available)</span>
                  )}
                </label>
                <select
                  id={productType === 'regular' ? 'product' : 'sales_product'}
                  name={productType === 'regular' ? 'product' : 'sales_product'}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                  value={productType === 'regular' ? formData.product : formData.sales_product}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choose a {productType === 'regular' ? 'product' : 'sales product'}</option>
                  {productType === 'regular' 
                    ? products.map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.name}
                          {item.price !== undefined && ` - PKR ${item.price.toFixed(2)}`}
                        </option>
                      ))
                    : salesProducts.map((item) => (
                        <option value={item.id} key={item.id}>
                          {item.name}
                          {item.final_price !== undefined && ` - PKR ${item.final_price.toFixed(2)}`}
                          {item.discount_percent !== undefined && item.discount_percent > 0 && ` (${item.discount_percent}% off)`}
                        </option>
                      ))
                  }
                </select>
              </div>

              {/* Rating */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Rating <span className="text-amber-400">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`text-4xl focus:outline-none transition-all duration-200 transform hover:scale-110 ${
                        (hoverRating || formData.rating) >= star 
                          ? 'text-amber-400 drop-shadow-lg' 
                          : 'text-gray-600 hover:text-gray-500'
                      }`}
                      onClick={() => handleRatingChange(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-4 text-gray-400">
                    {formData.rating > 0 
                      ? `${formData.rating} star${formData.rating !== 1 ? 's' : ''}` 
                      : 'Click to rate'}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="md:col-span-2">
                <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-2">
                  Review Comment <span className="text-amber-400">*</span>
                </label>
                <textarea
                  id="comment"
                  name="comment"
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition resize-none"
                  placeholder="Share your experience with this product..."
                  value={formData.comment}
                  onChange={handleChange}
                  required
                />
                <p className="mt-1 text-sm text-gray-400">
                  {formData.comment.length} characters
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => router.push('/adminreviews')}
                className="px-6 py-3 border border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-3 border border-transparent shadow-lg text-sm font-medium rounded-lg text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : 'transform hover:scale-105'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </div>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>All fields marked with <span className="text-amber-400">*</span> are required</p>
        </div>
      </div>
    </div>
  );
};

export default AddReview;