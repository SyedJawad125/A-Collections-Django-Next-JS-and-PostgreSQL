'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Calendar, User, Clock, Tag, ArrowLeft, Share2, Bookmark, Eye, MessageCircle, Facebook, Twitter, Linkedin, Link2, Loader } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  // Get blog ID from both URL params and query params for better compatibility
  const getBlogId = () => {
    const blogId = params.blogId || searchParams.get('blogId') || searchParams.get('id');
    console.log('Blog ID from URL:', { params: params.blogId, query: searchParams.get('blogId'), final: blogId });
    return blogId;
  };

  useEffect(() => {
    const blogId = getBlogId();
    
    if (blogId) {
      fetchBlogDetail(blogId);
      fetchRelatedBlogs(blogId);
    } else {
      setError('Blog ID not found in URL');
      setLoading(false);
      toast.error('Invalid blog URL');
    }
  }, [params.blogId, searchParams]);

  const fetchBlogDetail = async (blogId) => {
    try {
      setLoading(true);
      setError(null);
      
      // Using AxiosInstance with query parameter
      const res = await AxiosInstance.get(`/api/myapp/v1/public/blog/post/?id=${blogId}`);
      
      if (res?.data?.message === "Successful" && res.data.data) {
        // Handle if API returns array or single object
        const blogData = Array.isArray(res.data.data) ? res.data.data[0] : res.data.data;
        
        if (!blogData) {
          throw new Error('Blog not found');
        }
        
        const transformedBlog = {
          id: blogData.id,
          title: blogData.title,
          subtitle: blogData.subtitle || '',
          content: blogData.content || '',
          excerpt: blogData.excerpt || blogData.subtitle || '',
          image: blogData.featured_image || 'https://images.unsplash.com/photo-1499750810403-62c5b5975f5e?w=1200&q=80',
          category: blogData.category?.name || 'Uncategorized',
          author: blogData.author || blogData.created_by || 'Unknown',
          authorImage: blogData.author_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(blogData.author || 'Unknown')}&background=d4af37&color=fff`,
          date: blogData.published_at || blogData.created_at,
          readTime: `${blogData.reading_time || 5} min read`,
          tags: blogData.tags_list || [],
          views: blogData.view_count || 0,
          commentsCount: blogData.comments_count || 0,
          status: blogData.status || 'published',
          featured: blogData.is_featured || false
        };
        
        setBlog(transformedBlog);
        
        // Update page title
        if (typeof document !== 'undefined') {
          document.title = `${transformedBlog.title} | Luxury Blogs`;
        }
        
        toast.success('Blog loaded successfully!');
      } else {
        throw new Error('Blog not found in response');
      }
    } catch (err) {
      console.error('Error fetching blog:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error loading blog post';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogs = async (currentBlogId) => {
    try {
      const res = await AxiosInstance.get('/api/myapp/v1/public/blog/post/?limit=4');
      
      if (res?.data?.message === "Successful" && Array.isArray(res.data.data)) {
        const transformedBlogs = res.data.data
          .filter(b => b.id !== parseInt(currentBlogId)) // Exclude current blog
          .slice(0, 3)
          .map(blog => ({
            id: blog.id,
            title: blog.title,
            excerpt: blog.excerpt || blog.subtitle || '',
            image: blog.featured_image || 'https://images.unsplash.com/photo-1499750810403-62c5b5975f5e?w=400&q=80',
            category: blog.category?.name || 'Uncategorized',
            date: blog.published_at || blog.created_at,
            readTime: `${blog.reading_time || 5} min read`,
            featured: blog.is_featured || false
          }));
        
        setRelatedBlogs(transformedBlogs);
      }
    } catch (err) {
      console.error('Error fetching related blogs:', err);
      // Don't show toast for related blogs error as it's secondary
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(!isBookmarked ? 'Blog bookmarked!' : 'Bookmark removed');
  };

  const handleShare = (platform = '') => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = blog?.title || '';
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      default:
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(url);
          toast.success('Link copied to clipboard!');
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = url;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast.success('Link copied to clipboard!');
        }
    }
    
    setShowShareMenu(false);
  };

  const handleRelatedBlogClick = (blogId) => {
    // Navigate to the same page with new blog ID
    router.push(`/blog/?blogId=${blogId}`);
    // Scroll to top for better UX
    window.scrollTo(0, 0);
  };

  const handleBackToBlogs = () => {
    // Use router.back() to go to previous page, or fallback to /blogs
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/blogs');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Recent';
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdfaf6] via-[#f9f6f1] to-[#f7f3ec] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-[#d4af37] animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-600">Loading blog post...</p>
        </div>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme="light"
        />
      </div>
    );
  }

  // Error State
  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fdfaf6] via-[#f9f6f1] to-[#f7f3ec] flex items-center justify-center p-6">
        <div className="max-w-md text-center bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-red-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-2xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
            Blog Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error || 'The blog post you are looking for does not exist.'}</p>
          <button 
            onClick={handleBackToBlogs}
            className="px-6 py-3 bg-gradient-to-r from-[#d4af37] to-[#e8c547] text-black font-semibold rounded-full hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </button>
        </div>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme="light"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdfaf6] via-[#f9f6f1] to-[#f7f3ec]">
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme="light"
      />
      
      {/* Decorative background elements */}
      <div className="fixed top-20 left-10 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
      <div className="fixed bottom-20 right-10 w-80 h-80 bg-[#e8c547]/5 rounded-full blur-3xl"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[#e6d5b8]/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleBackToBlogs}
              className="group flex items-center gap-3 text-gray-700 hover:text-[#2a1f0f] transition-all duration-300"
            >
              <div className="w-10 h-10 bg-gradient-to-r from-[#d4af37] to-[#e8c547] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <ArrowLeft className="w-5 h-5 text-black" />
              </div>
              <span className="font-semibold">Back to Blogs</span>
            </button>

            <div className="flex items-center gap-3">
              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="w-10 h-10 bg-white border border-[#e6d5b8] rounded-full flex items-center justify-center hover:border-[#d4af37] hover:shadow-md transition-all duration-300"
                >
                  <Share2 className="w-4 h-4 text-gray-600" />
                </button>

                {showShareMenu && (
                  <div className="absolute top-12 right-0 bg-white/95 backdrop-blur-xl rounded-2xl p-4 border border-[#e6d5b8] shadow-2xl min-w-[200px] z-50">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleShare('facebook')}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors duration-200"
                      >
                        <Facebook className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Share on Facebook</span>
                      </button>
                      <button
                        onClick={() => handleShare('twitter')}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors duration-200"
                      >
                        <Twitter className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-medium">Share on Twitter</span>
                      </button>
                      <button
                        onClick={() => handleShare('linkedin')}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 transition-colors duration-200"
                      >
                        <Linkedin className="w-4 h-4 text-blue-700" />
                        <span className="text-sm font-medium">Share on LinkedIn</span>
                      </button>
                      <button
                        onClick={() => handleShare()}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                      >
                        <Link2 className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium">Copy Link</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bookmark Button */}
              <button
                onClick={handleBookmark}
                className={`w-10 h-10 border rounded-full flex items-center justify-center transition-all duration-300 ${
                  isBookmarked 
                    ? 'bg-[#d4af37] border-[#d4af37] text-black' 
                    : 'bg-white border-[#e6d5b8] text-gray-600 hover:border-[#d4af37] hover:shadow-md'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Category and Meta */}
          <div className="flex flex-wrap items-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#d4af37]/10 rounded-full">
              <Tag className="w-4 h-4 text-[#d4af37]" />
              <span className="font-semibold text-[#d4af37]">{blog.category}</span>
            </div>
            
            {blog.featured && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#e8c547] rounded-full">
                <span className="font-semibold text-black text-xs">FEATURED</span>
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#d4af37]" />
                <span>By {blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#d4af37]" />
                <span>{formatDate(blog.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d4af37]" />
                <span>{blog.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#d4af37]" />
                <span>{blog.views} views</span>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-[#2a1f0f] mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Subtitle */}
          {blog.subtitle && (
            <p className="text-2xl md:text-3xl text-gray-600 mb-8 font-light leading-relaxed">
              {blog.subtitle}
            </p>
          )}

          {/* Excerpt */}
          {blog.excerpt && (
            <div className="relative pl-6 border-l-4 border-[#d4af37] mb-8">
              <p className="text-lg md:text-xl text-gray-700 italic leading-relaxed">
                {blog.excerpt}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Featured Image */}
      <div className="relative px-6 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-[600px] object-cover"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1499750810403-62c5b5975f5e?w=1200&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
            
            {/* Decorative corners */}
            <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-white/50 rounded-tl-2xl"></div>
            <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-white/50 rounded-tr-2xl"></div>
            <div className="absolute bottom-6 left-6 w-12 h-12 border-b-2 border-l-2 border-white/50 rounded-bl-2xl"></div>
            <div className="absolute bottom-6 right-6 w-12 h-12 border-b-2 border-r-2 border-white/50 rounded-br-2xl"></div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative px-6 mb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <article className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed text-lg space-y-6"
                  dangerouslySetInnerHTML={{ 
                    __html: blog.content || `<p>No content available for this blog post.</p>` 
                  }}
                />
              </article>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-[#e6d5b8]/50">
                  <h3 className="text-xl font-serif font-bold text-[#2a1f0f] mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-3">
                    {blog.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-[#e8c547] text-black font-semibold rounded-full text-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                      >
                        {tag.name || tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              {/* Author Card */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-[#e6d5b8]/50 shadow-lg sticky top-24">
                <div className="text-center">
                  <img
                    src={blog.authorImage}
                    alt={blog.author}
                    className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-[#d4af37]/20"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(blog.author || 'Unknown')}&background=d4af37&color=fff`;
                    }}
                  />
                  <h3 className="font-serif font-bold text-xl text-[#2a1f0f] mb-2">
                    {blog.author}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Published on {formatDate(blog.date)}
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{blog.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{blog.commentsCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Blogs */}
      {relatedBlogs.length > 0 && (
        <div className="relative px-6 mb-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-serif font-bold text-[#2a1f0f] mb-4">
                Related Articles
              </h2>
              <p className="text-gray-600 text-lg">
                Discover more insightful content
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedBlogs.map((relatedBlog) => (
                <div
                  key={relatedBlog.id}
                  onClick={() => handleRelatedBlogClick(relatedBlog.id)}
                  className="group bg-white/90 backdrop-blur-xl rounded-2xl border border-[#e6d5b8]/50 overflow-hidden hover:shadow-[0_15px_60px_rgba(212,175,55,0.2)] transition-all duration-500 cursor-pointer hover:-translate-y-2"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={relatedBlog.image}
                      alt={relatedBlog.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1499750810403-62c5b5975f5e?w=400&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#d4af37]/90 text-white text-xs font-bold rounded-full">
                      {relatedBlog.category}
                    </div>
                    {relatedBlog.featured && (
                      <div className="absolute top-4 right-4 px-2 py-1 bg-gradient-to-r from-[#d4af37] to-[#e8c547] text-black text-xs font-bold rounded-full">
                        FEATURED
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="font-serif font-bold text-xl text-[#2a1f0f] mb-3 line-clamp-2 group-hover:text-[#d4af37] transition-colors duration-300">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {relatedBlog.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatDate(relatedBlog.date)}</span>
                      <span>{relatedBlog.readTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="relative px-6 mb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[#d4af37] to-[#e8c547] rounded-3xl p-12 text-black relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/30"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/30"></div>
            
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Enjoyed This Article?
            </h2>
            <p className="text-black/80 text-lg mb-8 max-w-2xl mx-auto">
              Explore more insightful content and stay updated with our latest publications.
            </p>
            <button
              onClick={() => router.push('/blogs')}
              className="px-8 py-4 bg-black text-white font-semibold rounded-full hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Explore More Blogs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}