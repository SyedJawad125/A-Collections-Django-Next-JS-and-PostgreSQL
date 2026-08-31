'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

// NOTE: the backend ReturnRequestView only exposes POST (customer-only,
// order-ownership checked server-side), GET, and PATCH — there is no admin
// DELETE route. This component is therefore list + approve/reject only.

const STATUS_CHOICES = ['requested', 'approved', 'rejected', 'completed'];

const AdminReturnRequest = () => {
  const router = useRouter();
  const { permissions = {
    read_return: false,
    update_return: false,
  } } = useContext(AuthContext);

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [pagination, setPagination] = useState({
    currentPage: 1, limit: 12, totalPages: 1, totalCount: 0, hasNext: false, hasPrevious: false
  });

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingRecord, setReviewingRecord] = useState(null);
  const [reviewForm, setReviewForm] = useState({ status: 'approved', refund_amount: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchReturns = async () => {
      if (!permissions.read_return) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const params = { page: pagination.currentPage, limit: pagination.limit };
        if (statusFilter) params.status = statusFilter;
        const res = await AxiosInstance.get('/api/myapp/v1/return/', { params });
        const responseData = res?.data;
        const dataArr = Array.isArray(responseData?.data) ? responseData.data : [];
        setRecords(dataArr);
        setFilteredRecords(dataArr);

        const totalCount = responseData?.count ?? dataArr.length;
        const totalPages = Math.ceil(totalCount / pagination.limit) || 1;
        setPagination(prev => ({
          ...prev, totalPages, totalCount,
          hasNext: pagination.currentPage < totalPages,
          hasPrevious: pagination.currentPage > 1,
        }));
      } catch (error) {
        console.error('Error fetching return requests:', error);
        toast.error(error.response?.data?.message || 'Failed to load return requests');
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReturns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, pagination.currentPage, pagination.limit, statusFilter, permissions.read_return]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages && newPage !== pagination.currentPage) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const handleLimitChange = (e) => {
    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), currentPage: 1 }));
  };

  const getPageNumbers = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredRecords(records.filter(r =>
      r.order_number?.toString().includes(value) ||
      r.product_name?.toLowerCase().includes(value) ||
      r.reason?.toLowerCase().includes(value)
    ));
  };

  const openReviewModal = (record) => {
    if (!permissions.update_return) { toast.error('You do not have permission to review return requests'); return; }
    setReviewingRecord(record);
    setReviewForm({
      status: record.status === 'requested' ? 'approved' : record.status,
      refund_amount: record.refund_amount != null ? String(record.refund_amount) : '',
    });
    setReviewModalOpen(true);
  };

  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({ ...prev, [name]: value }));
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { status: reviewForm.status };
      if (reviewForm.refund_amount !== '') payload.refund_amount = reviewForm.refund_amount;

      await AxiosInstance.patch('/api/myapp/v1/return/', payload, {
        params: { id: reviewingRecord.id },
      });
      toast.success('Return request updated successfully');
      setReviewModalOpen(false);
      setReviewingRecord(null);
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error updating return request:', error);
      const data = error.response?.data;
      const msg = data?.error || data?.detail || (typeof data === 'object' ? JSON.stringify(data) : 'Error updating return request');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case 'approved':  return 'bg-green-500/20 text-green-400';
      case 'rejected':  return 'bg-red-500/20 text-red-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      default:          return 'bg-yellow-500/20 text-yellow-400'; // requested
    }
  };

  if (!permissions.read_return) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">You don't have permission to view return requests.</p>
          <button onClick={() => router.push('/admin/admindashboard')} className="px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors">
            Return to Dashboard
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    );
  }

  return (
    <div className="min-h-screen ml-2 bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
      <ToastContainer position="top-right" autoClose={4000} theme="light" />

      {/* Review Modal */}
      {reviewModalOpen && reviewingRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                Review Return #{reviewingRecord.id}
              </h2>
              <button onClick={() => { setReviewModalOpen(false); setReviewingRecord(null); }} className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 text-slate-300 text-sm border-b border-slate-700/50">
              <p><span className="text-amber-300 font-semibold">Order:</span> #{reviewingRecord.order_number}</p>
              <p><span className="text-amber-300 font-semibold">Item:</span> {reviewingRecord.product_name || 'Deleted Product'}</p>
              <p><span className="text-amber-300 font-semibold">Reason:</span> {reviewingRecord.reason}</p>
              {reviewingRecord.description && (
                <p><span className="text-amber-300 font-semibold">Description:</span> {reviewingRecord.description}</p>
              )}
            </div>

            <form onSubmit={submitReview} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Decision</label>
                <select name="status" value={reviewForm.status} onChange={handleReviewFormChange}
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                  {STATUS_CHOICES.map(s => (
                    <option key={s} value={s} className="bg-slate-900">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Refund Amount (PKR)</label>
                <input type="number" name="refund_amount" min="0" step="0.01" value={reviewForm.refund_amount} onChange={handleReviewFormChange}
                  placeholder="Leave blank if not applicable"
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-slate-500" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setReviewModalOpen(false); setReviewingRecord(null); }}
                  className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-semibold border-2 border-slate-700/50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Submit Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-4 relative overflow-hidden mb-4 -mt-12">

          {/* Glow Background */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>

            {/* Inner Glass Layer */}
            <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>

                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">

                      {/* Left Content */}
                      <div>

                        {/* Icon */}
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-2xl shadow-amber-500/50 mb-1">
                          <svg
                            className="w-6 h-6 text-slate-900"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 4a1 1 0 10-2 0v4a1 1 0 00.293.707l2 2a1 1 0 001.414-1.414L11 9.586V6zm-1 12a10 10 0 110-20 10 10 0 010 20z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>

                        {/* Heading */}
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-2">
                          RETURN REQUESTS
                        </h1>

                        {/* Underline */}
                        <div className="w-70 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mb-2"></div>

                        {/* Description */}
                        <p className="text-slate-400 text-sm">
                          Manage and review customer return requests
                        </p>

                      </div>

                    </div>
                  </div>
                </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-800/50 rounded-xl mb-8 gap-4">
          <div className="text-amber-400">Showing {filteredRecords.length} of {pagination.totalCount} items</div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
            <input type="text" value={searchTerm} onChange={handleSearch} placeholder="Search by order #, item, or reason..."
              className="w-full px-4 py-3 bg-gray-700 rounded-full text-white focus:ring-amber-500 focus:outline-none" />
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, currentPage: 1 })); }}
              className="bg-gray-700 text-white rounded-full px-3 py-2 focus:outline-none focus:ring-amber-500">
              <option value="">All statuses</option>
              {STATUS_CHOICES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <select value={pagination.limit} onChange={handleLimitChange} disabled={isLoading}
              className="bg-gray-700 text-white rounded-full px-3 py-2 focus:outline-none focus:ring-amber-500">
              <option value="12">12 per page</option>
              <option value="24">24 per page</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-amber-400">Loading return requests...</div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-800 text-amber-400 text-sm uppercase">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Item</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Refund</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Requested</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(item => (
                  <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4">#{item.order_number}</td>
                    <td className="p-4">{item.product_name || 'Deleted Product'}</td>
                    <td className="p-4 capitalize">{item.reason?.replace('_', ' ')}</td>
                    <td className="p-4">{item.refund_amount != null ? `PKR ${item.refund_amount}` : '—'}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${statusBadgeClass(item.status)}`}>{item.status}</span>
                    </td>
                    <td className="p-4 text-sm">{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                    <td className="p-4 text-right">
                      {permissions.update_return && (
                        <button onClick={() => openReviewModal(item)} className="px-3 py-2 bg-amber-600/90 rounded-lg hover:bg-amber-600 transition-colors text-sm text-white">
                          Review
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-300">
            <p>No return requests found.</p>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center mt-12 gap-4">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button onClick={() => handlePageChange(pagination.currentPage - 1)} disabled={!pagination.hasPrevious || isLoading}
                className={`px-4 py-2 rounded-lg transition-colors ${!pagination.hasPrevious || isLoading ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}>
                Previous
              </button>
              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, index) =>
                  pageNum === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500">...</span>
                  ) : (
                    <button key={pageNum} onClick={() => handlePageChange(pageNum)} disabled={isLoading}
                      className={`px-3 py-2 rounded-lg transition-colors min-w-[40px] ${pagination.currentPage === pageNum ? 'bg-amber-600 text-white font-semibold' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                      {pageNum}
                    </button>
                  )
                )}
              </div>
              <button onClick={() => handlePageChange(pagination.currentPage + 1)} disabled={!pagination.hasNext || isLoading}
                className={`px-4 py-2 rounded-lg transition-colors ${!pagination.hasNext || isLoading ? 'bg-gray-700 cursor-not-allowed text-gray-400' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}>
                Next
              </button>
            </div>
            <div className="text-gray-400 text-sm">Page {pagination.currentPage} of {pagination.totalPages}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReturnRequest;