'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

const CommentsPage = () => {
  const router = useRouter();
  const { permissions = {} } = useContext(AuthContext);
  const [comments, setComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all'); // all, top-level, replies
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    offset: 0,
    totalPages: 1,
    count: 0,
    hasNext: false,
    hasPrevious: false
  });

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        const { currentPage, limit, offset } = pagination;
        
        // Build query params
        let queryParams = `page=${currentPage}&limit=${limit}&offset=${offset}`;
        
        // Add status filter
        if (statusFilter !== 'all') {
          queryParams += `&status=${statusFilter}`;
        }
        
        // Add type filter
        if (typeFilter === 'top-level') {
          queryParams += `&is_top_level=true`;
        } else if (typeFilter === 'replies') {
          queryParams += `&is_reply=true`;
        }
        
        const res = await AxiosInstance.get(`/api/myapp/v1/comment?${queryParams}`);
        
        const responseData = res?.data;
        
        if (responseData?.status === 'SUCCESS') {
          setComments(responseData.data || []);
          setFilteredComments(responseData.data || []);
          setPagination(prev => ({
            ...prev,
            count: responseData?.meta?.total || 0,
            totalPages: responseData?.meta?.pages || 1,
            hasNext: responseData?.meta?.has_next || false,
            hasPrevious: responseData?.meta?.has_previous || false
          }));
        } else {
          toast.error(responseData?.message || 'Failed to load comments', {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast.error('Failed to load comments', {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [refreshKey, pagination.currentPage, pagination.limit, pagination.offset, statusFilter, typeFilter]);

  const deleteComment = async (id) => {
    try {
      await AxiosInstance.delete(`/api/myapp/v1/comment?id=${id}`);
      setRefreshKey(prev => !prev);
      toast.success('Comment deleted successfully', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (error) {
      toast.error('Error deleting comment', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const moderateComment = async (id, action) => {
    try {
      await AxiosInstance.post(`/api/myapp/v1/comment${id}/moderate/`, {
        action: action, // approve, reject, spam
        note: `${action.charAt(0).toUpperCase() + action.slice(1)} via admin panel`
      });
      
      setRefreshKey(prev => !prev);
      toast.success(`Comment ${action}d successfully`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (error) {
      toast.error(`Error ${action}ing comment`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    const filtered = comments.filter((comment) => {
      const idMatch = comment.id.toString() === value;
      const authorMatch = comment.author_name?.toLowerCase().includes(value);
      const contentMatch = comment.content?.toLowerCase().includes(value);
      const statusMatch = comment.status?.toLowerCase().includes(value);
      const postMatch = comment.post?.title?.toLowerCase().includes(value);
      const emailMatch = comment.author_email?.toLowerCase().includes(value);
      
      return idMatch || authorMatch || contentMatch || statusMatch || postMatch || emailMatch;
    });

    setFilteredComments(filtered);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit,
      currentPage: 1,
      offset: 0
    }));
  };

  const handleOffsetChange = (e) => {
    const newOffset = Math.max(0, parseInt(e.target.value)) || 0;
    setPagination(prev => ({ 
      ...prev, 
      offset: newOffset,
      currentPage: 1
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const updateRecord = async (commentId) => {
    router.push(`/updatecommentpage?commentid=${commentId}`);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Pending' },
      'approved': { color: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Approved' },
      'rejected': { color: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Rejected' },
      'spam': { color: 'bg-gray-500/20 text-gray-400 border-gray-500/30', label: 'Spam' }
    };
    
    const statusInfo = statusMap[status] || { color: 'bg-gray-500/20 text-gray-400', label: status };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getCommentTypeBadge = (comment) => {
    if (comment.parent) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
          Reply
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
        Comment
      </span>
    );
  };

  if (!permissions.read_comment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">
            You don't have permission to view Comments. Please contact your administrator.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
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
      
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h1 className="text-4xl font-light text-white mb-2">Blog Comments</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mb-1"></div>
            <p className="text-gray-400 text-sm">Manage comments and feedback from your readers</p>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="bg-gray-800/50 p-6 rounded-xl mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Left side - Add button and stats */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {permissions.create_comment && (
                <button
                  className="px-6 py-3 bg-transparent border border-amber-500 text-amber-500 font-medium text-sm leading-tight uppercase rounded-full hover:bg-amber-500 hover:text-black focus:outline-none focus:ring-0 transition duration-150 ease-in-out transform hover:scale-105 flex items-center"
                  onClick={() => router.push('/addcommentpage')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Comment
                </button>
              )}

              <div className="text-amber-400 font-light">
                Showing {filteredComments.length} of {pagination.count} comments
                {pagination.offset > 0 && ` (offset: ${pagination.offset})`}
              </div>
            </div>

            {/* Right side - Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-700 text-white rounded-full px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="spam">Spam</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-gray-700 text-white rounded-full px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              >
                <option value="all">All Types</option>
                <option value="top-level">Comments Only</option>
                <option value="replies">Replies Only</option>
              </select>

              {/* Limit */}
              <select 
                value={pagination.limit}
                onChange={handleLimitChange}
                className="bg-gray-700 text-white rounded-full px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="30">30 per page</option>
                <option value="50">50 per page</option>
              </select>
              
              {/* Offset */}
              <input
                type="number"
                value={pagination.offset}
                onChange={handleOffsetChange}
                min="0"
                max={pagination.count}
                placeholder="Offset"
                className="bg-gray-700 text-white rounded-full px-3 py-2 w-20 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by author, content, post title, email, or status..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 transition duration-300"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[...Array(pagination.limit)].map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comments List */}
        {!isLoading && (
          <>
            {filteredComments.length > 0 ? (
              <div className="space-y-6">
                {filteredComments.map((comment) => (
                  <div 
                    key={comment.id} 
                    className={`bg-gray-800/50 rounded-xl p-6 shadow-lg hover:shadow-amber-500/10 transition-shadow duration-300 ${
                      comment.parent ? 'ml-8 border-l-4 border-purple-500/30' : ''
                    }`}
                  >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                      {/* Author Info */}
                      <div className="flex items-start space-x-4">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-medium ${
                          comment.is_guest 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {comment.author_name?.charAt(0)?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-white font-medium">
                              {comment.author_name || 'Anonymous'}
                            </h3>
                            {comment.is_guest && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
                                Guest
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{formatDate(comment.created_at)}</p>
                          {comment.author_email && permissions.update_comment && (
                            <p className="text-gray-400 text-sm">
                              <a href={`mailto:${comment.author_email}`} className="hover:text-amber-400 transition-colors">
                                {comment.author_email}
                              </a>
                            </p>
                          )}
                          {comment.is_edited && (
                            <p className="text-gray-500 text-xs italic mt-1">
                              Edited {formatDate(comment.edited_at)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Status and Type Badges */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {getCommentTypeBadge(comment)}
                        {getStatusBadge(comment.status)}
                        {comment.reply_count > 0 && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                            {comment.reply_count} {comment.reply_count === 1 ? 'Reply' : 'Replies'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Post Info */}
                    {comment.post && (
                      <div className="mb-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                        <div className="text-sm">
                          <span className="text-gray-400">Post: </span>
                          <span className="text-amber-400 font-medium">{comment.post.title}</span>
                          <span className="text-gray-500 ml-2">({comment.post.slug})</span>
                        </div>
                      </div>
                    )}

                    {/* Parent Comment Info (for replies) */}
                    {comment.parent_author && (
                      <div className="mb-3 p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                        <div className="text-sm text-purple-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Replying to <span className="font-medium">{comment.parent_author}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Comment Content */}
                    <p className="text-gray-300 mb-4 leading-relaxed">{comment.content}</p>

                    {/* Moderation Info (for staff) */}
                    {permissions.update_comment && comment.moderated_by && (
                      <div className="mb-4 p-3 bg-gray-700/20 rounded-lg border border-gray-600/20">
                        <div className="text-xs text-gray-400">
                          <span className="font-medium">Moderated by:</span> {comment.moderated_by}
                          {comment.moderated_at && (
                            <span className="ml-2">on {formatDate(comment.moderated_at)}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-end gap-2">
                      {/* Moderation Buttons (Staff Only) */}
                      {permissions.update_comment && comment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => moderateComment(comment.id, 'approve')}
                            className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-green-600/30 to-green-700/20 border border-green-500/30 text-green-300 rounded-lg hover:from-green-600/40 hover:to-green-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-green-500/10 hover:shadow-green-500/20"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="relative z-10 font-medium">Approve</span>
                          </button>

                          <button
                            onClick={() => moderateComment(comment.id, 'reject')}
                            className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-orange-600/30 to-orange-700/20 border border-orange-500/30 text-orange-300 rounded-lg hover:from-orange-600/40 hover:to-orange-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="relative z-10 font-medium">Reject</span>
                          </button>

                          <button
                            onClick={() => moderateComment(comment.id, 'spam')}
                            className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-gray-600/30 to-gray-700/20 border border-gray-500/30 text-gray-300 rounded-lg hover:from-gray-600/40 hover:to-gray-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-gray-500/10 hover:shadow-gray-500/20"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <span className="relative z-10 font-medium">Spam</span>
                          </button>
                        </>
                      )}

                      {/* Delete Button */}
                      {permissions.delete_comment && (comment.can_delete || permissions.update_comment) && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-red-600/30 to-red-700/20 border border-red-500/30 text-red-300 rounded-lg hover:from-red-600/40 hover:to-red-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="relative z-10 font-medium">Delete</span>
                        </button>
                      )}

                      {/* Edit Button */}
                      {permissions.update_comment && (comment.can_edit || permissions.update_comment) && (
                        <button
                          onClick={() => updateRecord(comment.id)}
                          className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-amber-600/30 to-amber-700/20 border border-amber-500/30 text-amber-300 rounded-lg hover:from-amber-600/40 hover:to-amber-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span className="relative z-10 font-medium">Edit</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-12 w-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-white mb-2">No comments found</h3>
                <p className="text-gray-400 max-w-md mx-auto">We couldn't find any comments matching your filters.</p>
              </div>
            )}
          </>
        )}

        {/* Enhanced Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-16 gap-4">
            <div className="text-gray-400 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages} • Total {pagination.count} comments
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                aria-label="First page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevious}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-full text-sm transition-colors ${
                        pagination.currentPage === pageNum
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                      aria-label={`Page ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                aria-label="Last page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentsPage;