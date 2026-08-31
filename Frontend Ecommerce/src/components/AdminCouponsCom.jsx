'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

const AdminCoupon = () => {
  const router = useRouter();
  const { permissions = {
    create_coupon: false,
    read_coupon: false,
    update_coupon: false,
    delete_coupon: false,
  } } = useContext(AuthContext);

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [pagination, setPagination] = useState({
    currentPage: 1, limit: 12, totalPages: 1, totalCount: 0, hasNext: false, hasPrevious: false
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState({
    code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0',
    max_uses: '', valid_from: '', valid_to: '', is_active: true, applicable_products: [],
  });
  const [saving, setSaving] = useState(false);

  const [productOptions, setProductOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  useEffect(() => {
    const fetchCoupons = async () => {
      if (!permissions.read_coupon) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const res = await AxiosInstance.get('/api/myapp/v1/coupon/', {
          params: { page: pagination.currentPage, limit: pagination.limit }
        });
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
        console.error('Error fetching coupons:', error);
        toast.error(error.response?.data?.message || 'Failed to load coupons');
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, pagination.currentPage, pagination.limit, permissions.read_coupon]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingOptions(true);
      try {
        const res = await AxiosInstance.get('/api/myapp/v1/dropdown/product/');
        const arr = res?.data?.data;
        setProductOptions(Array.isArray(arr?.data) ? arr.data : Array.isArray(arr) ? arr : []);
      } catch (error) {
        console.error('Error fetching products for dropdown:', error);
        setProductOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchProducts();
  }, []);

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
    setFilteredRecords(records.filter(r => r.code?.toLowerCase().includes(value)));
  };

  const resetForm = () => {
    setForm({ code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_uses: '', valid_from: '', valid_to: '', is_active: true, applicable_products: [] });
    setEditingRecord(null);
  };

  const handleAdd = () => {
    if (!permissions.create_coupon) { toast.error('You do not have permission to add coupons'); return; }
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    if (!permissions.update_coupon) { toast.error('You do not have permission to update coupons'); return; }
    setEditingRecord(record);
    setForm({
      code: record.code || '',
      discount_type: record.discount_type || 'percentage',
      discount_value: record.discount_value != null ? String(record.discount_value) : '',
      min_order_amount: record.min_order_amount != null ? String(record.min_order_amount) : '0',
      max_uses: record.max_uses != null ? String(record.max_uses) : '',
      valid_from: record.valid_from ? record.valid_from.slice(0, 16) : '',
      valid_to: record.valid_to ? record.valid_to.slice(0, 16) : '',
      is_active: record.is_active !== undefined ? record.is_active : true,
      applicable_products: Array.isArray(record.applicable_products) ? record.applicable_products : [],
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleProductsChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(o => parseInt(o.value));
    setForm(prev => ({ ...prev, applicable_products: selected }));
  };

  const handleDelete = async (id) => {
    if (!permissions.delete_coupon) { toast.error('You do not have permission to delete coupons'); return; }
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await AxiosInstance.delete('/api/myapp/v1/coupon/', { params: { id } });
      toast.success('Coupon deleted successfully');
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast.error(error.response?.data?.error || 'Error deleting coupon');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error('Please enter a coupon code'); return; }
    if (!String(form.discount_value).trim()) { toast.error('Please enter a discount value'); return; }
    if (!form.valid_from || !form.valid_to) { toast.error('Please set both valid-from and valid-to dates'); return; }

    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: form.discount_value,
        min_order_amount: form.min_order_amount || '0',
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        valid_from: new Date(form.valid_from).toISOString(),
        valid_to: new Date(form.valid_to).toISOString(),
        is_active: form.is_active,
        applicable_products: form.applicable_products,
      };

      if (editingRecord) {
        await AxiosInstance.patch('/api/myapp/v1/coupon/', { id: editingRecord.id, ...payload }, {
          params: { id: editingRecord.id },
        });
        toast.success('Coupon updated successfully');
      } else {
        await AxiosInstance.post('/api/myapp/v1/coupon/', payload);
        toast.success('Coupon added successfully');
      }
      setModalOpen(false);
      resetForm();
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error saving coupon:', error);
      const data = error.response?.data;
      const msg = data?.error || data?.detail || (typeof data === 'object' ? JSON.stringify(data) : 'Error saving coupon');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!permissions.read_coupon) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">You don't have permission to view coupons.</p>
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                {editingRecord ? 'Edit Coupon' : 'Add New Coupon'}
              </h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Coupon Code *</label>
                  <input type="text" name="code" placeholder="e.g. SAVE10" value={form.code} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-slate-500 uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Discount Type</label>
                  <select name="discount_type" value={form.discount_type} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                    <option value="percentage" className="bg-slate-900">Percentage</option>
                    <option value="flat" className="bg-slate-900">Flat Amount</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">
                    Discount Value * {form.discount_type === 'percentage' ? '(%)' : '(PKR)'}
                  </label>
                  <input type="number" name="discount_value" min="0" max={form.discount_type === 'percentage' ? 100 : undefined} step="0.01"
                    value={form.discount_value} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Min Order Amount</label>
                  <input type="number" name="min_order_amount" min="0" step="0.01" value={form.min_order_amount} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Valid From *</label>
                  <input type="datetime-local" name="valid_from" value={form.valid_from} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Valid To *</label>
                  <input type="datetime-local" name="valid_to" value={form.valid_to} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Max Uses (blank = unlimited)</label>
                <input type="number" name="max_uses" min="1" value={form.max_uses} onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>

              <div className="space-y-2">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Applicable Products (blank = all products)</label>
                <select name="applicable_products" value={form.applicable_products} onChange={handleProductsChange} multiple size={4} disabled={loadingOptions}
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                  {productOptions.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900">{p.name}</option>
                  ))}
                </select>
                <p className="text-slate-500 text-xs">Hold Ctrl/Cmd to select multiple products</p>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" name="is_active" id="is_active" checked={form.is_active} onChange={handleFormChange}
                  className="w-5 h-5 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-gray-700" />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-300">Active</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                  className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-semibold border-2 border-slate-700/50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 disabled:opacity-50">
                  {saving ? 'Saving...' : (editingRecord ? 'Update Coupon' : 'Add Coupon')}
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
                        d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* Heading */}
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-2">
                    COUPONS
                  </h1>

                  {/* Underline */}
                  <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mb-2"></div>

                  {/* Description */}
                  <p className="text-slate-400 text-sm">
                    Manage discount coupons and promotional offers
                  </p>

                </div>

                {/* Add Coupon Button */}
                {permissions.create_coupon && (
                  <button
                    onClick={handleAdd}
                    className="group relative px-6 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-full shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all duration-300 mt-4 md:mt-0"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-400 opacity-0 group-hover:opacity-100 rounded-full transition-opacity duration-300"></div>

                    <div className="relative flex items-center space-x-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                          clipRule="evenodd"
                        />
                      </svg>

                      <span>Add Coupon</span>
                    </div>
                  </button>
                )}

              </div>
            </div>
          </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-800/50 rounded-xl mb-8 gap-4">
          <div className="text-amber-400">Showing {filteredRecords.length} of {pagination.totalCount} items</div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
            <input type="text" value={searchTerm} onChange={handleSearch} placeholder="Search by code..."
              className="w-full px-4 py-3 bg-gray-700 rounded-full text-white focus:ring-amber-500 focus:outline-none" />
            <select value={pagination.limit} onChange={handleLimitChange} disabled={isLoading}
              className="bg-gray-700 text-white rounded-full px-3 py-2 focus:outline-none focus:ring-amber-500">
              <option value="12">12 per page</option>
              <option value="24">24 per page</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-amber-400">Loading coupons...</div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-800 text-amber-400 text-sm uppercase">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min Order</th>
                  <th className="p-4">Usage</th>
                  <th className="p-4">Valid Period</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(item => (
                  <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 font-mono font-semibold text-white">{item.code}</td>
                    <td className="p-4">{item.discount_type === 'percentage' ? `${item.discount_value}%` : `PKR ${item.discount_value}`}</td>
                    <td className="p-4">PKR {parseFloat(item.min_order_amount || 0).toLocaleString()}</td>
                    <td className="p-4">{item.used_count}{item.max_uses ? ` / ${item.max_uses}` : ' / ∞'}</td>
                    <td className="p-4 text-sm">
                      {item.valid_from ? new Date(item.valid_from).toLocaleDateString() : '—'} → {item.valid_to ? new Date(item.valid_to).toLocaleDateString() : '—'}
                    </td>
                    <td className="p-4 space-x-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${item.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {item.is_exhausted && <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">Exhausted</span>}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {permissions.update_coupon && (
                        <button onClick={() => handleEdit(item)} className="p-2 bg-amber-600/90 rounded-lg hover:bg-amber-600 transition-colors" aria-label="Edit coupon">✏️</button>
                      )}
                      {permissions.delete_coupon && (
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600/90 rounded-lg hover:bg-red-600 transition-colors" aria-label="Delete coupon">🗑️</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-300">
            <p>No coupons found.</p>
            {permissions.create_coupon && (
              <button onClick={handleAdd} className="mt-6 px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors">
                Add Coupon
              </button>
            )}
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

export default AdminCoupon;