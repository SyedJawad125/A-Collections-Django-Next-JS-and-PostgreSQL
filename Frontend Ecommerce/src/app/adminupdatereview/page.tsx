// 'use client';
// import React, { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import AxiosInstance from '@/components/AxiosInstance';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// interface Review {
//   id: number;
//   name: string;
//   email: string;
//   comment: string;
//   rating: number;
//   item_name: string;
//   item_type: string;
//   item_data?: {
//     id: number;
//     name: string;
//     discount_percent?: number;
//   };
// }

// const UpdateReview = () => {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const reviewId = searchParams.get('reviewid');

//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     comment: '',
//     rating: 0,
//     productType: '',
//     productName: '',
//     discountPercent: 0
//   });

//   const [isLoading, setIsLoading] = useState(false);
//   const [isFetching, setIsFetching] = useState(true);
//   const [hoverRating, setHoverRating] = useState(0);

//   // Fetch review data
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         if (!reviewId) {
//           toast.error('No review ID provided', {
//             position: "top-center",
//             autoClose: 2000,
//             theme: "dark",
//           });
//           setIsFetching(false);
//           return;
//         }

//         // Updated API endpoint
//         const res = await AxiosInstance.get(`/api/myapp/v1/review/?id=${reviewId}`);
//         const responseData = res?.data;

//         if (responseData?.message === 'Successful' && responseData.data && responseData.data.length > 0) {
//           const reviewData = responseData.data[0];

//           setFormData({
//             name: reviewData.name || reviewData.author_name || '',
//             email: reviewData.email || reviewData.author_email || '',
//             comment: reviewData.comment || '',
//             rating: reviewData.rating || 0,
//             productType: reviewData.item_type || '',
//             productName: reviewData.item_name || reviewData.item_data?.name || '',
//             discountPercent: reviewData.item_data?.discount_percent || 0
//           });
//         } else {
//           toast.error('Review not found', {
//             position: "top-center",
//             autoClose: 2000,
//             theme: "dark",
//           });
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         toast.error('Failed to load review data', {
//           position: "top-center",
//           autoClose: 2000,
//           theme: "dark",
//         });
//       } finally {
//         setIsFetching(false);
//       }
//     };

//     fetchData();
//   }, [reviewId]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

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
//       const payload = {
//         id: parseInt(reviewId || '0'),
//         name: formData.name.trim(),
//         email: formData.email.trim(),
//         comment: formData.comment.trim(),
//         rating: formData.rating
//       };

//       // Updated API endpoint
//       const response = await AxiosInstance.patch('/api/myapp/v1/review/', payload);

//       if (response) {
//         toast.success('Review updated successfully!', {
//           position: "top-center",
//           autoClose: 2000,
//           theme: "dark",
//         });
//         setTimeout(() => {
//           router.push('/Reviews');
//         }, 2000);
//       }
//     } catch (error: any) {
//       console.error('Error:', error);
//       const errorMessage = error?.response?.data?.message || 'Failed to update review. Please try again.';
//       toast.error(errorMessage, {
//         position: "top-center",
//         autoClose: 2000,
//         theme: "dark",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isFetching) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
//         <div className="text-center">
//           <div className="relative">
//             <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full opacity-20 animate-pulse"></div>
//             </div>
//           </div>
//           <p className="mt-6 text-gray-300 font-light">Loading review data...</p>
//         </div>
//       </div>
//     );
//   }

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
//             <h2 className="text-3xl font-light text-white">Edit Review</h2>
//             <p className="mt-2 text-amber-100">Update your product feedback</p>
//           </div>

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

//               {/* Product Info (readonly) */}
//               <div className="md:col-span-2">
//                 <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-6 space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-lg font-medium text-white">Product Information</h3>
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${
//                       formData.productType === 'product' 
//                         ? 'bg-blue-500/20 text-blue-400' 
//                         : 'bg-purple-500/20 text-purple-400'
//                     }`}>
//                       {formData.productType === 'product' ? 'Product' : 'Sale'}
//                     </span>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-400 mb-2">
//                         Product Name
//                       </label>
//                       <div className="flex items-center space-x-2">
//                         <div className="bg-amber-500/20 p-2 rounded-lg">
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
//                           </svg>
//                         </div>
//                         <div>
//                           <p className="text-white font-medium">{formData.productName}</p>
//                           <p className="text-gray-400 text-xs">Cannot be changed</p>
//                         </div>
//                       </div>
//                     </div>

//                     {formData.discountPercent > 0 && (
//                       <div>
//                         <label className="block text-sm font-medium text-gray-400 mb-2">
//                           Discount
//                         </label>
//                         <div className="flex items-center space-x-2">
//                           <div className="bg-purple-500/20 p-2 rounded-lg">
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
//                             </svg>
//                           </div>
//                           <div>
//                             <p className="text-white font-medium">{formData.discountPercent}% OFF</p>
//                             <p className="text-gray-400 text-xs">Special discount</p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
//                     <div className="flex items-start">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       <p className="text-sm text-amber-300">
//                         Product selection cannot be changed after review creation
//                       </p>
//                     </div>
//                   </div>
//                 </div>
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

//             {/* Buttons */}
//             <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
//               <button
//                 type="button"
//                 onClick={() => router.push('/Reviews')}
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
//                     Updating...
//                   </div>
//                 ) : (
//                   <div className="flex items-center">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                     </svg>
//                     Update Review
//                   </div>
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

// export default UpdateReview;





'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AxiosInstance from '@/components/AxiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Review {
  id: number;
  name: string;
  email: string;
  comment: string;
  rating: number;
  item_name: string;
  item_type: string;
  item_data?: {
    id: number;
    name: string;
    discount_percent?: number;
  };
}

const UpdateReview = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewId = searchParams.get('reviewid');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    comment: '',
    rating: 0,
    productType: '',
    productName: '',
    discountPercent: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!reviewId) {
          toast.error('No review ID provided', {
            position: "top-center",
            autoClose: 2000,
            theme: "dark",
          });
          setIsFetching(false);
          return;
        }

        // Backend GET expects ID in query params
        const res = await AxiosInstance.get(`/api/myapp/v1/review/?id=${reviewId}`);
        const responseData = res?.data;

        if (responseData?.message === 'Successful' && responseData.data && responseData.data.length > 0) {
          const reviewData = responseData.data[0];

          setFormData({
            name: reviewData.name || reviewData.author_name || '',
            email: reviewData.email || reviewData.author_email || '',
            comment: reviewData.comment || '',
            rating: reviewData.rating || 0,
            productType: reviewData.item_type || '',
            productName: reviewData.item_name || reviewData.item_data?.name || '',
            discountPercent: reviewData.item_data?.discount_percent || 0
          });
        } else {
          toast.error('Review not found', {
            position: "top-center",
            autoClose: 2000,
            theme: "dark",
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load review data', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [reviewId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
      // Backend PATCH expects ID in query params + data in body
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        comment: formData.comment.trim(),
        rating: formData.rating
      };

      const response = await AxiosInstance.patch(`/api/myapp/v1/review/?id=${reviewId}`, payload);

      // Backend returns status: 'SUCCESS' or 'ERROR'
      if (response?.data?.status === 'SUCCESS') {
        toast.success(response.data.message || 'Review updated successfully!', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
        setTimeout(() => {
          router.push('/adminreview');
        }, 2000);
      } else {
        toast.error(response?.data?.message || 'Failed to update review', {
          position: "top-center",
          autoClose: 2000,
          theme: "dark",
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      // Backend returns specific error message for ownership check
      const errorMessage = error?.response?.data?.message || 'Failed to update review. Please try again.';
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 2000,
        theme: "dark",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full opacity-20 animate-pulse"></div>
            </div>
          </div>
          <p className="mt-6 text-gray-300 font-light">Loading review data...</p>
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
        <div className="bg-gray-800/50 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-6">
            <h2 className="text-3xl font-light text-white">Edit Review</h2>
            <p className="mt-2 text-amber-100">Update your product feedback</p>
          </div>

          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Product Info (readonly) - Backend doesn't allow changing product */}
              <div className="md:col-span-2">
                <div className="bg-gray-700/50 border border-gray-600 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Product Information</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      formData.productType === 'product' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {formData.productType === 'product' ? 'Product' : 'Sale'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        Product Name
                      </label>
                      <div className="flex items-center space-x-2">
                        <div className="bg-amber-500/20 p-2 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-white font-medium">{formData.productName}</p>
                          <p className="text-gray-400 text-xs">Cannot be changed</p>
                        </div>
                      </div>
                    </div>

                    {formData.discountPercent > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Discount
                        </label>
                        <div className="flex items-center space-x-2">
                          <div className="bg-purple-500/20 p-2 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-medium">{formData.discountPercent}% OFF</p>
                            <p className="text-gray-400 text-xs">Special discount</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-400 mt-0.5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-amber-300">
                        Product selection cannot be changed after review creation
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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

            <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => router.push('/adminreview')}
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
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Update Review
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>All fields marked with <span className="text-amber-400">*</span> are required</p>
        </div>
      </div>
    </div>
  );
};

export default UpdateReview;