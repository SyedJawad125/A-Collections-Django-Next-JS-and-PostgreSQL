// 'use client'
// import { useEffect, useState } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import Link from 'next/link'
// import AxiosInstance from '@/components/AxiosInstance'
// import { FiArrowLeft, FiHeart, FiShare2, FiFilter } from 'react-icons/fi'
// import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa'

// const CategoryWiseProductCom = () => {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const [products, setProducts] = useState([])
//   const [category, setCategory] = useState(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [sortOption, setSortOption] = useState('featured')
//   const [priceRange, setPriceRange] = useState([0, 1000])
//   const [isFilterOpen, setIsFilterOpen] = useState(false)
  
//   const categoryId = searchParams.get('categoryId')
//   const categoryName = searchParams.get('categoryName')
//   const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

//   useEffect(() => {
//     if (!categoryId) {
//       router.push('/publiccategories')
//       return
//     }

//     const fetchData = async () => {
//       try {
//         setIsLoading(true)
        
//         // Fetch category details if name isn't provided. It display the name of category and description in Header.
//         if (!categoryName) {
//           try {
//             // const categoryRes = await AxiosInstance.get(`/ecommerce/publiccategory?id=${categoryId}`)
//             const categoryRes = await AxiosInstance.get(`v1/public/category/wise/${categoryId}`) 

//             setCategory(categoryRes.data.data)
//           } catch (error) {
//             console.error('Error fetching category:', error)
//             setCategory({
//               id: categoryId,
//               name: 'Collection',
//               description: 'Premium items collection'
//             })
//           }
//         } else {
//           setCategory({
//             id: categoryId,
//             name: decodeURIComponent(categoryName),
//             description: 'Discover our exquisite selection'
//           })
//         }
        
//         // Fetch products with proper error handling
//         try {
//           // const productsRes = await AxiosInstance.get(`/ecommerce/publicproduct`, {
//           //   params: { category: categoryId }
//           // })
//             const productsRes = await AxiosInstance.get(`/api/myapp/v1/public/product/?category=${categoryId}`)

          
//           // Handle different response structures
//           const productsData = productsRes.data.data || productsRes.data || []
          
//           const processedProducts = productsData.map(product => ({
//             ...product,
//             mainImage: product.image_urls?.[0] 
//               ? `${baseURL}${product.image_urls[0].startsWith('/') ? '' : '/'}${product.image_urls[0]}`
//               : '/default-product.jpg',
//             rating: Math.min(5, Math.max(0, product.rating || 0))
//           }))
          
//           setProducts(processedProducts)
//         } catch (error) {
//           console.error('Error fetching products:', error)
//           setProducts([])
//         }
        
//       } catch (error) {
//         console.error('Error in fetchData:', error)
//       } finally {
//         setIsLoading(false)
//       }
//     }
    
//     fetchData()
//   }, [categoryId, categoryName, router])

//   const handleSortChange = (e) => {
//     const value = e.target.value
//     setSortOption(value)
    
//     let sortedProducts = [...products]
//     switch(value) {
//       case 'price-low':
//         sortedProducts.sort((a, b) => a.price - b.price)
//         break
//       case 'price-high':
//         sortedProducts.sort((a, b) => b.price - a.price)
//         break
//       case 'rating':
//         sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0))
//         break
//       case 'newest':
//         sortedProducts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
//         break
//       default:
//         // Default sorting (featured)
//         break
//     }
//     setProducts(sortedProducts)
//   }

//   const handleProductClick = (product) => {
//         const query = new URLSearchParams({
//             ProductId: product.id.toString(),
//             productData: JSON.stringify(product)
//         }).toString();

//         router.push(`/productdetailpage?${query}`);
//     };

//   const renderStars = (rating) => {
//     const stars = []
//     const fullStars = Math.floor(rating)
//     const hasHalfStar = rating % 1 >= 0.5
    
//     for (let i = 1; i <= 5; i++) {
//       if (i <= fullStars) {
//         stars.push(<FaStar key={i} className="text-amber-500" />)
//       } else if (i === fullStars + 1 && hasHalfStar) {
//         stars.push(<FaStarHalfAlt key={i} className="text-amber-500" />)
//       } else {
//         stars.push(<FaRegStar key={i} className="text-amber-500" />)
//       }
//     }
    
//     return stars
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading luxury collection...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero Section */}
//       <div className="relative bg-gradient-to-r bg-gray-500 py-4 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto text-center">
//           <button
//             onClick={() => router.back()}
//             className="absolute left-4 top-4 flex items-center text-amber-100 hover:text-white transition-colors"
//           >
//             <FiArrowLeft className="mr-2" />
//             Back
//           </button>
          
//           <h1 className="text-4xl md:text-5xl font-serif font-light text-white mb-4">
//             {category?.name || decodeURIComponent(categoryName) || 'Luxury Collection'}
//           </h1>
//           <p className="text-xl text-amber-100 max-w-3xl mx-auto">
//             {category?.description || 'Discover our exquisite selection of premium items'}
//           </p>
//         </div>
//       </div>

//       {/* Filter and Sort Bar */}
//       <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
//           <div className="flex items-center space-x-4">
//             <button 
//               onClick={() => setIsFilterOpen(!isFilterOpen)}
//               className="flex items-center text-gray-600 hover:text-amber-700"
//             >
//               <FiFilter className="mr-2" />
//               Filters
//             </button>
            
//             <span className="text-sm text-gray-500">
//               {products.length} {products.length === 1 ? 'item' : 'items'}
//             </span>
//           </div>
          
//           <div className="flex items-center">
//             <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort by:</label>
//             <select
//               id="sort"
//               value={sortOption}
//               onChange={handleSortChange}
//               className="border border-gray-300 text-black rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
//             >
//               <option value="featured">Featured</option>
//               <option value="price-low">Price: Low to High</option>
//               <option value="price-high">Price: High to Low</option>
//               <option value="rating">Customer Rating</option>
//               <option value="newest">Newest Arrivals</option>
//             </select>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
//         <div className="flex flex-col md:flex-row">
//           {/* Sidebar Filters (Desktop) */}
//           <div className="hidden md:block w-60 pr-8 -ml-10">
//             <div className="space-y-6">
//               <div>
//                 <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
//                 <div className="space-y-2">
//                   <input
//                     type="range"
//                     min="0"
//                     max="1000"
//                     step="50"
//                     value={priceRange[1]}
//                     onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
//                     className="w-full"
//                   />
//                   <div className="flex justify-between text-sm text-gray-600">
//                     <span>${priceRange[0]}</span>
//                     <span>${priceRange[1]}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Product Grid */}
//           <div className="flex-1">
//             {products.length > 0 ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//                 {products.map((product) => (
//                   <div 
//                     key={product.id}
//                     className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
//                   >
//                     {/* Product Image */}
//                     <div 
//                       className="aspect-square bg-gray-100 relative overflow-hidden cursor-pointer"
//                       onClick={() => handleProductClick(product)}
//                     >
//                       <img
//                         src={product.mainImage}
//                         alt={product.name}
//                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//                         onError={(e) => {
//                           e.target.onerror = null
//                           e.target.src = '/default-product.jpg'
//                         }}
//                       />
                      
//                       {/* Quick Actions */}
//                       <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                         <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
//                           <FiHeart className="text-gray-600" />
//                         </button>
//                         <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
//                           <FiShare2 className="text-gray-600" />
//                         </button>
//                       </div>
                      
//                       {/* Sale Badge */}
//                       {product.original_price > product.price && (
//                         <div className="absolute top-3 left-3 bg-amber-600 text-white text-xs font-medium px-2 py-1 rounded">
//                           SALE
//                         </div>
//                       )}
//                     </div>
                    
//                     {/* Product Info */}
//                     <div className="p-4">
//                       <h3 
//                         className="text-lg font-medium text-gray-900 mb-1 cursor-pointer hover:text-amber-700 transition-colors"
//                         onClick={() => handleProductClick(product)}
//                       >
//                         {product.name}
//                       </h3>
                      
//                       {/* Rating */}
//                       {product.rating > 0 && (
//                         <div className="flex items-center mb-2">
//                           <div className="flex mr-2">
//                             {renderStars(product.rating)}
//                           </div>
//                           <span className="text-xs text-gray-500">({product.review_count || 0})</span>
//                         </div>
//                       )}
                      
//                       {/* Price */}
//                       <div className="flex items-center">
//                         <span className="text-lg font-medium text-amber-700">
//                           Rs. {product.price?.toFixed(2) || '0.00'}
//                         </span>
//                         {product.original_price > product.price && (
//                           <span className="ml-2 text-sm text-gray-500 line-through">
//                             Rs. {product.original_price?.toFixed(2)}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-16">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 <h3 className="text-xl font-light text-gray-600 mb-2">No products found</h3>
//                 <p className="text-gray-500 mb-6">We couldn't find any products in this collection</p>
//                 <button
//                   onClick={() => router.push('/publiccategories')}
//                   className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
//                 >
//                   Browse Collections
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CategoryWiseProductCom




'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AxiosInstance from '@/components/AxiosInstance'
import { FiArrowLeft, FiHeart, FiShare2, FiFilter } from 'react-icons/fi'
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa'

const CategoryWiseProductCom = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sortOption, setSortOption] = useState('featured')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  const categoryId = searchParams.get('categoryId')
  const categoryName = searchParams.get('categoryName')

  useEffect(() => {
    if (!categoryId) {
      router.push('/publiccategories')
      return
    }

    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch category details if name isn't provided
        if (!categoryName) {
          try {
            const categoryRes = await AxiosInstance.get(`v1/public/category/wise/${categoryId}`)
            setCategory(categoryRes.data.data)
          } catch (error) {
            console.error('Error fetching category:', error)
            setCategory({
              id: categoryId,
              name: 'Collection',
              description: 'Premium items collection'
            })
          }
        } else {
          setCategory({
            id: categoryId,
            name: decodeURIComponent(categoryName),
            description: 'Discover our exquisite selection'
          })
        }
        
        // Fetch products with proper error handling
        try {
          const productsRes = await AxiosInstance.get(`/api/myapp/v1/public/product/?category=${categoryId}`)
          
          // Handle the response structure from your API
          const productsData = productsRes.data.data || []
          
          // Process products to ensure proper image URLs
          const processedProducts = productsData.map(product => {
            // Get the first image URL from either image_urls or images array
            let mainImage = '/default-product.jpg';
            
            if (product.image_urls && product.image_urls.length > 0) {
              // Use image_urls array (already contains full URLs)
              mainImage = product.image_urls[0];
            } else if (product.images && product.images.length > 0) {
              // Use images array (contains objects with image_url property)
              mainImage = product.images[0].image_url;
            }
            
            // Ensure the image URL is valid
            if (mainImage && !mainImage.startsWith('http') && !mainImage.startsWith('/')) {
              mainImage = `/${mainImage}`;
            }
            
            // Check if product has sale tag (you can customize this based on your tags)
            const hasSaleTag = product.tag_names?.includes('Sale') || 
                              product.tag_names?.includes('On Sale') ||
                              product.tags_data?.some(tag => 
                                tag.name.toLowerCase().includes('sale') || 
                                tag.name.toLowerCase().includes('discount')
                              );
            
            // Generate sale price only for sale items (for demo, 20% off)
            // In real app, you would get this from your API
            const isOnSale = hasSaleTag; // Only show sale if product has sale tag
            
            return {
              ...product,
              mainImage: mainImage,
              // Get all image URLs for product detail page
              allImages: product.image_urls || 
                        (product.images ? product.images.map(img => img.image_url) : []),
              rating: 4.5, // Default rating since your API doesn't provide it
              review_count: Math.floor(Math.random() * 100) + 10, // Random reviews for demo
              // Only set original_price if product is on sale
              ...(isOnSale && {
                original_price: Math.round(product.price * 1.2), // Add 20% as original price
                isOnSale: true
              })
            }
          });
          
          setProducts(processedProducts)
        } catch (error) {
          console.error('Error fetching products:', error)
          setProducts([])
        }
        
      } catch (error) {
        console.error('Error in fetchData:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [categoryId, categoryName, router])

  const handleSortChange = (e) => {
    const value = e.target.value
    setSortOption(value)
    
    let sortedProducts = [...products]
    switch(value) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        sortedProducts.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'newest':
        sortedProducts.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        break
      default:
        // Default sorting (featured)
        break
    }
    setProducts(sortedProducts)
  }

  const handleProductClick = (product) => {
    const query = new URLSearchParams({
      ProductId: product.id.toString(),
      productData: JSON.stringify(product)
    }).toString();

    router.push(`/productdetailpage?${query}`);
  };

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-amber-500" />)
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-amber-500" />)
      } else {
        stars.push(<FaRegStar key={i} className="text-amber-500" />)
      }
    }
    
    return stars
  }

  // Filter products by price range
  const filteredProducts = products.filter(product => 
    product.price >= priceRange[0] && product.price <= priceRange[1]
  );

  // Update price range based on actual products
  useEffect(() => {
    if (products.length > 0) {
      const minPrice = Math.min(...products.map(p => p.price));
      const maxPrice = Math.max(...products.map(p => p.price));
      setPriceRange([Math.floor(minPrice / 100) * 100, Math.ceil(maxPrice / 100) * 100]);
    }
  }, [products]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading luxury collection...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r bg-gray-500 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 flex items-center text-amber-100 hover:text-white transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            Back
          </button>
          
          <h1 className="text-4xl md:text-5xl font-serif font-light text-white mb-4">
            {category?.name || decodeURIComponent(categoryName) || 'Luxury Collection'}
          </h1>
          <p className="text-xl text-amber-100 max-w-3xl mx-auto">
            {category?.description || 'Discover our exquisite selection of premium items'}
          </p>
          
          {/* Category info if available */}
          {category && category.image && (
            <div className="mt-4">
              <img 
                src={category.image} 
                alt={category.name}
                className="h-32 w-32 object-cover rounded-full mx-auto border-4 border-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center text-gray-600 hover:text-amber-700 md:hidden"
            >
              <FiFilter className="mr-2" />
              Filters
            </button>
            
            <span className="text-sm text-gray-500">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          
          <div className="flex items-center">
            <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Sort by:</label>
            <select
              id="sort"
              value={sortOption}
              onChange={handleSortChange}
              className="border border-gray-300 text-black rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Filter Panel */}
      {isFilterOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 p-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Rs. {priceRange[0]}</span>
                  <span>Rs. {priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden md:block w-60 pr-8 -ml-10">
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Rs. {priceRange[0]}</span>
                    <span>Rs. {priceRange[1]}</span>
                  </div>
                </div>
              </div>
              
              {/* Tags filter - optional */}
              {products.some(p => p.tags_data?.length > 0) && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Tags</h3>
                  <div className="space-y-2">
                    {Array.from(new Set(products.flatMap(p => 
                      p.tags_data?.map(tag => tag.name) || []
                    ))).map(tag => (
                      <label key={tag} className="flex items-center">
                        <input type="checkbox" className="rounded text-amber-600" />
                        <span className="ml-2 text-sm text-gray-600">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Product Image */}
                    <div 
                      className="aspect-square bg-gray-100 relative overflow-hidden cursor-pointer"
                      onClick={() => handleProductClick(product)}
                    >
                      <img
                        src={product.mainImage}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = '/default-product.jpg'
                        }}
                      />
                      
                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                          <FiHeart className="text-gray-600" />
                        </button>
                        <button className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100">
                          <FiShare2 className="text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Sale Badge - ONLY for sale items */}
                      {product.isOnSale && (
                        <div className="absolute top-3 left-3 bg-amber-600 text-white text-xs font-medium px-2 py-1 rounded">
                          SALE
                        </div>
                      )}
                      
                      {/* New In Badge */}
                      {product.tag_names?.includes('New In') && (
                        <div className="absolute top-3 left-3 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded">
                          NEW
                        </div>
                      )}
                      
                      {/* Tags */}
                      {product.tags_data && product.tags_data.length > 0 && (
                        <div className="absolute bottom-3 left-3">
                          {product.tags_data.slice(0, 2).map(tag => (
                            <span 
                              key={tag.id}
                              className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded mr-1"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-4">
                      <h3 
                        className="text-lg font-medium text-gray-900 mb-1 cursor-pointer hover:text-amber-700 transition-colors"
                        onClick={() => handleProductClick(product)}
                      >
                        {product.name}
                      </h3>
                      
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      
                      {/* Rating */}
                      {product.rating > 0 && (
                        <div className="flex items-center mb-2">
                          <div className="flex mr-2">
                            {renderStars(product.rating)}
                          </div>
                          <span className="text-xs text-gray-500">({product.review_count || 0})</span>
                        </div>
                      )}
                      
                      {/* Price - Only show crossed price if product is on sale */}
                      <div className="flex items-center">
                        <span className="text-lg font-medium text-amber-700">
                          Rs. {product.price?.toFixed(2) || '0.00'}
                        </span>
                        {product.isOnSale && product.original_price && (
                          <span className="ml-2 text-sm text-gray-500 line-through">
                            Rs. {product.original_price?.toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      {/* Category */}
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">
                          Category: {product.category_name}
                        </span>
                      </div>
                      
                      {/* Tags */}
                      {product.tag_names && product.tag_names.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {product.tag_names.map((tagName, index) => (
                            <span 
                              key={index}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              {tagName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-light text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">We couldn't find any products in this collection</p>
                <button
                  onClick={() => router.push('/publiccategories')}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                >
                  Browse Collections
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategoryWiseProductCom