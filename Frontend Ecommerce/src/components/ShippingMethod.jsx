'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

const AdminShippingMethod = () => {
  const router = useRouter();
  const { permissions = {
    create_shipping: false,
    read_shipping: false,
    update_shipping: false,
    delete_shipping: false,
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
  const [form, setForm] = useState({ name: '', estimated_days: '', cost: '', is_active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchShippingMethods = async () => {
      if (!permissions.read_shipping) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const res = await AxiosInstance.get('/api/myapp/v1/shipping/', {
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
        console.error('Error fetching shipping methods:', error);
        toast.error(error.response?.data?.message || 'Failed to load shipping methods');
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShippingMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, pagination.currentPage, pagination.limit, permissions.read_shipping]);

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
    setFilteredRecords(records.filter(r => r.name?.toLowerCase().includes(value)));
  };

  const resetForm = () => {
    setForm({ name: '', estimated_days: '', cost: '', is_active: true });
    setEditingRecord(null);
  };

  const handleAdd = () => {
    if (!permissions.create_shipping) { toast.error('You do not have permission to add shipping methods'); return; }
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    if (!permissions.update_shipping) { toast.error('You do not have permission to update shipping methods'); return; }
    setEditingRecord(record);
    setForm({
      name: record.name || '',
      estimated_days: record.estimated_days != null ? String(record.estimated_days) : '',
      cost: record.cost != null ? String(record.cost) : '',
      is_active: record.is_active !== undefined ? record.is_active : true,
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleDelete = async (id) => {
    if (!permissions.delete_shipping) { toast.error('You do not have permission to delete shipping methods'); return; }
    if (!window.confirm('Are you sure you want to delete this shipping method?')) return;
    try {
      await AxiosInstance.delete('/api/myapp/v1/shipping/', { params: { id } });
      toast.success('Shipping method deleted successfully');
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error deleting shipping method:', error);
      toast.error(error.response?.data?.error || 'Error deleting shipping method');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Please enter a name'); return; }
    if (!String(form.estimated_days).trim()) { toast.error('Please enter estimated delivery days'); return; }
    if (!String(form.cost).trim()) { toast.error('Please enter a cost'); return; }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        estimated_days: parseInt(form.estimated_days),
        cost: form.cost,
        is_active: form.is_active,
      };

      if (editingRecord) {
        await AxiosInstance.patch('/api/myapp/v1/shipping/', { id: editingRecord.id, ...payload }, {
          params: { id: editingRecord.id },
        });
        toast.success('Shipping method updated successfully');
      } else {
        await AxiosInstance.post('/api/myapp/v1/shipping/', payload);
        toast.success('Shipping method added successfully');
      }
      setModalOpen(false);
      resetForm();
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error saving shipping method:', error);
      const data = error.response?.data;
      const msg = data?.error || data?.detail || (typeof data === 'object' ? JSON.stringify(data) : 'Error saving shipping method');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!permissions.read_shipping) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">You don't have permission to view shipping methods.</p>
          <button onClick={() => router.push('/admin/admindashboard')} className="px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors">
            Return to Dashboard
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4">
      <ToastContainer position="top-right" autoClose={4000} theme="light" />

      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                {editingRecord ? 'Edit Shipping Method' : 'Add Shipping Method'}
              </h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Name *</label>
                <input type="text" name="name" placeholder="e.g. Express Delivery" value={form.name} onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-slate-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Estimated Days *</label>
                  <input type="number" name="estimated_days" min="1" value={form.estimated_days} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Cost (PKR) *</label>
                  <input type="number" name="cost" min="0" step="0.01" value={form.cost} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" name="is_active" id="is_active" checked={form.is_active} onChange={handleFormChange}
                  className="w-5 h-5 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-gray-700" />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-300">Active (visible at checkout)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                  className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-semibold border-2 border-slate-700/50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 disabled:opacity-50">
                  {saving ? 'Saving...' : (editingRecord ? 'Update Method' : 'Add Method')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-light text-white">SHIPPING METHODS</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mt-1"></div>
          </div>
          {permissions.create_shipping && (
            <button onClick={handleAdd} className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform">
              Add Shipping Method
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-800/50 rounded-xl mb-8 gap-4">
          <div className="text-amber-400">Showing {filteredRecords.length} of {pagination.totalCount} items</div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
            <input type="text" value={searchTerm} onChange={handleSearch} placeholder="Search by name..."
              className="w-full px-4 py-3 bg-gray-700 rounded-full text-white focus:ring-amber-500 focus:outline-none" />
            <select value={pagination.limit} onChange={handleLimitChange} disabled={isLoading}
              className="bg-gray-700 text-white rounded-full px-3 py-2 focus:outline-none focus:ring-amber-500">
              <option value="12">12 per page</option>
              <option value="24">24 per page</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-amber-400">Loading shipping methods...</div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-800 text-amber-400 text-sm uppercase">
                <tr>
                  <th className="p-4">Name</th>
                  <th className="p-4">Estimated Days</th>
                  <th className="p-4">Cost</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(item => (
                  <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 font-medium text-white">{item.name}</td>
                    <td className="p-4">{item.estimated_days} day(s)</td>
                    <td className="p-4 text-amber-400 font-semibold">PKR {parseFloat(item.cost || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${item.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {permissions.update_shipping && (
                        <button onClick={() => handleEdit(item)} className="p-2 bg-amber-600/90 rounded-lg hover:bg-amber-600 transition-colors" aria-label="Edit shipping method">✏️</button>
                      )}
                      {permissions.delete_shipping && (
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600/90 rounded-lg hover:bg-red-600 transition-colors" aria-label="Delete shipping method">🗑️</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-300">
            <p>No shipping methods found.</p>
            {permissions.create_shipping && (
              <button onClick={handleAdd} className="mt-6 px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors">
                Add Shipping Method
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

export default AdminShippingMethod;