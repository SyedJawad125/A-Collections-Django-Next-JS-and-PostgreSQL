'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

const SalesProductVariant = () => {
  const router = useRouter();
  const { permissions = {
    create_sales_productvariant: false,
    read_sales_productvariant: false,
    update_sales_productvariant: false,
    delete_sales_productvariant: false,
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
    salesproduct: '', size: '', colors: [], material: '',
    stock_quantity: '', additional_price: '0', is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const [salesProductOptions, setSalesProductOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // ---------- Fetch variants ----------
  useEffect(() => {
    const fetchVariants = async () => {
      if (!permissions.read_sales_productvariant) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const res = await AxiosInstance.get('/api/myapp/v1/sales/product/variant/', {
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
        console.error('Error fetching sales variants:', error);
        toast.error(error.response?.data?.message || 'Failed to load sales product variants');
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVariants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, pagination.currentPage, pagination.limit, permissions.read_sales_productvariant]);

  // ---------- Fetch dropdown options ----------
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [salesProductsRes, colorsRes] = await Promise.allSettled([
          AxiosInstance.get('/api/myapp/v1/dropdown/sales/product/'),
          AxiosInstance.get('/api/myapp/v1/color/'),
        ]);

        if (salesProductsRes.status === 'fulfilled') {
          const arr = salesProductsRes.value?.data?.data;
          setSalesProductOptions(Array.isArray(arr?.data) ? arr.data : Array.isArray(arr) ? arr : []);
        }
        if (colorsRes.status === 'fulfilled') {
          const arr = colorsRes.value?.data?.data;
          setColorOptions(Array.isArray(arr?.data) ? arr.data : Array.isArray(arr) ? arr : []);
        }
      } catch (error) {
        console.error('Error fetching dropdown options:', error);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // ---------- Pagination ----------
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

  // ---------- Search ----------
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = records.filter(r =>
      r.sku?.toLowerCase().includes(value) ||
      r.salesproduct_name?.toLowerCase().includes(value) ||
      r.size?.toLowerCase().includes(value) ||
      r.material?.toLowerCase().includes(value)
    );
    setFilteredRecords(filtered);
  };

  // ---------- Modal helpers ----------
  const resetForm = () => {
    setForm({ salesproduct: '', size: '', colors: [], material: '', stock_quantity: '', additional_price: '0', is_active: true });
    setEditingRecord(null);
  };

  const handleAdd = () => {
    if (!permissions.create_sales_productvariant) { toast.error('You do not have permission to add sales variants'); return; }
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    if (!permissions.update_sales_productvariant) { toast.error('You do not have permission to update sales variants'); return; }
    setEditingRecord(record);
    setForm({
      salesproduct: record.salesproduct ? String(record.salesproduct) : '',
      size: record.size || '',
      colors: Array.isArray(record.colors) ? record.colors : [],
      material: record.material || '',
      stock_quantity: record.stock_quantity != null ? String(record.stock_quantity) : '',
      additional_price: record.additional_price != null ? String(record.additional_price) : '0',
      is_active: record.is_active !== undefined ? record.is_active : true,
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleColorChange = (e) => {
    const selected = Array.from(e.target.selectedOptions).map(o => parseInt(o.value));
    setForm(prev => ({ ...prev, colors: selected }));
  };

  const handleDelete = async (id) => {
    if (!permissions.delete_sales_productvariant) { toast.error('You do not have permission to delete sales variants'); return; }
    if (!window.confirm('Are you sure you want to delete this sales variant?')) return;
    try {
      await AxiosInstance.delete('/api/myapp/v1/sales/product/variant/', { params: { id } });
      toast.success('Sales variant deleted successfully');
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error deleting sales variant:', error);
      toast.error(error.response?.data?.error || 'Error deleting sales variant');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.salesproduct) { toast.error('Please select a sales product'); return; }
    if (!String(form.stock_quantity).trim()) { toast.error('Please enter a stock quantity'); return; }

    setSaving(true);
    try {
      const payload = {
        salesproduct: parseInt(form.salesproduct),
        size: form.size || null,
        colors: form.colors,
        material: form.material || null,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        additional_price: form.additional_price || '0',
        is_active: form.is_active,
      };

      if (editingRecord) {
        await AxiosInstance.patch('/api/myapp/v1/sales/product/variant/', { id: editingRecord.id, ...payload }, {
          params: { id: editingRecord.id },
        });
        toast.success('Sales variant updated successfully');
      } else {
        await AxiosInstance.post('/api/myapp/v1/sales/product/variant/', payload);
        toast.success('Sales variant added successfully');
      }
      setModalOpen(false);
      resetForm();
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error saving sales variant:', error);
      const data = error.response?.data;
      const msg = data?.error || data?.detail ||
        (typeof data === 'object' ? JSON.stringify(data) : 'Error saving sales variant');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!permissions.read_sales_productvariant) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">You don't have permission to view sales product variants.</p>
          <button onClick={() => router.push('/admin/admindashboard')} className="px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors">
            Return to Dashboard
          </button>
        </div>
        <ToastContainer position="top-right" autoClose={2000} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
      <ToastContainer position="top-right" autoClose={4000} theme="light" />

      {/* Add / Update Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                {editingRecord ? 'Edit Sales Variant' : 'Add New Sales Variant'}
              </h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Sales Product *</label>
                <select name="salesproduct" value={form.salesproduct} onChange={handleFormChange} disabled={loadingOptions}
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                  <option value="" className="bg-slate-900">Select Sales Product</option>
                  {salesProductOptions.map(p => (
                    <option key={p.id} value={p.id} className="bg-slate-900">{p.name} — Rs {p.final_price ?? p.original_price}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Size</label>
                  <input type="text" name="size" placeholder="e.g. M, L, XL" value={form.size} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-slate-500" />
                </div>
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Material</label>
                  <input type="text" name="material" placeholder="e.g. Cotton" value={form.material} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-slate-500" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Colors</label>
                <select name="colors" value={form.colors} onChange={handleColorChange} multiple size={3} disabled={loadingOptions}
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50">
                  {colorOptions.map(c => (
                    <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                  ))}
                </select>
                <p className="text-slate-500 text-xs">Hold Ctrl/Cmd to select multiple colors</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Stock Quantity *</label>
                  <input type="number" name="stock_quantity" min="0" value={form.stock_quantity} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Additional Price</label>
                  <input type="number" name="additional_price" min="0" step="0.01" value={form.additional_price} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
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
                  {saving ? 'Saving...' : (editingRecord ? 'Update Variant' : 'Add Variant')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="w-full max-w-none backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-4 relative overflow-hidden mb-4 -mt-16">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
            <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-2xl shadow-amber-500/50 mb-1">
                    <svg
                      className="w-6 h-6 text-slate-900"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 2a1 1 0 012 0v1h2a1 1 0 110 2h-2v2h3a1 1 0 110 2h-3v2h2a1 1 0 110 2h-2v1a1 1 0 11-2 0v-1H7a1 1 0 110-2h2V9H6a1 1 0 110-2h3V5H7a1 1 0 110-2h2V2z" />
                    </svg>
                  </div>

                  <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-2">
                    SALES PRODUCT VARIANTS
                  </h1>

                  <div className="w-90 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 mb-2"></div>

                  <p className="text-slate-400 text-sm">
                    Manage sales product variants and options
                  </p>
                </div>

                <div className="flex gap-3 flex-wrap mt-4 md:mt-0">
                  {permissions.create_sales_productvariant && (
                    <button
                      onClick={handleAdd}
                      className="group relative px-6 py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold rounded-full shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative z-10">Add Variant</span>
                    </button>
                  )}

                  <button
                    onClick={() => router.push('/admin/adminsales')}
                    className="group relative px-6 py-2.5 bg-gradient-to-r from-slate-700 to-slate-600 text-white font-semibold rounded-full border border-slate-600/50 shadow-xl hover:border-amber-400/50 hover:shadow-amber-500/30 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                    <span className="relative z-10">Back to Sales Products</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-800/50 rounded-xl mb-8 gap-4">
          <div className="text-amber-400">Showing {filteredRecords.length} of {pagination.totalCount} items</div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
            <input type="text" value={searchTerm} onChange={handleSearch} placeholder="Search by SKU, product, size, or material..."
              className="w-full px-4 py-3 bg-gray-700 rounded-full text-white focus:ring-amber-500 focus:outline-none" />
            <select value={pagination.limit} onChange={handleLimitChange} disabled={isLoading}
              className="bg-gray-700 text-white rounded-full px-3 py-2 focus:outline-none focus:ring-amber-500">
              <option value="12">12 per page</option>
              <option value="24">24 per page</option>
              <option value="36">36 per page</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-20 text-amber-400">Loading sales variants...</div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-800 text-amber-400 text-sm uppercase">
                <tr>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Sales Product</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Material</th>
                  <th className="p-4">Colors</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Total Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(item => (
                  <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 font-mono text-sm">{item.sku}</td>
                    <td className="p-4">{item.salesproduct_name}</td>
                    <td className="p-4">{item.size || '—'}</td>
                    <td className="p-4">{item.material || '—'}</td>
                    <td className="p-4">{item.color_names?.join(', ') || '—'}</td>
                    <td className="p-4">
                      <span className={item.is_low_stock ? 'text-red-400 font-semibold' : ''}>{item.stock_quantity}</span>
                    </td>
                    <td className="p-4 text-amber-400 font-semibold">PKR {item.total_price?.toLocaleString?.() ?? item.total_price}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${item.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {permissions.update_sales_productvariant && (
                        <button onClick={() => handleEdit(item)} className="p-2 bg-amber-600/90 rounded-lg hover:bg-amber-600 transition-colors" aria-label="Edit sales variant">✏️</button>
                      )}
                      {permissions.delete_sales_productvariant && (
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600/90 rounded-lg hover:bg-red-600 transition-colors" aria-label="Delete sales variant">🗑️</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-300">
            <p>No sales variants found.</p>
            {permissions.create_sales_productvariant && (
              <button onClick={handleAdd} className="mt-6 px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors">
                Add Variant
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

export default SalesProductVariant; 