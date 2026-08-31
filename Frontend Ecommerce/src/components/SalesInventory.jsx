'use client';
import React, { useEffect, useState, useContext } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';

const SalesInventory = () => {
  const router = useRouter();
  const { permissions = {
    create_sales_inventory: false,
    read_sales_inventory: false,
    update_sales_inventory: false,
    delete_sales_inventory: false,
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
    sales_product_variant: '', current_stock: '', minimum_stock_level: '5',
    maximum_stock_level: '1000', reorder_point: '10', cost_price: '', last_restocked: '',
  });
  const [saving, setSaving] = useState(false);

  const [variantOptions, setVariantOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // ---------- Fetch sales inventory ----------
  useEffect(() => {
    const fetchInventory = async () => {
      if (!permissions.read_sales_inventory) { setIsLoading(false); return; }
      setIsLoading(true);
      try {
        const res = await AxiosInstance.get('/api/myapp/v1/sales/inventory/', {
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
        console.error('Error fetching sales inventory:', error);
        toast.error(error.response?.data?.message || 'Failed to load sales inventory');
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, pagination.currentPage, pagination.limit, permissions.read_sales_inventory]);

  // ---------- Fetch variant options ----------
  useEffect(() => {
    const fetchVariants = async () => {
      setLoadingOptions(true);
      try {
        const res = await AxiosInstance.get('/api/myapp/v1/sales/product/variant/', { params: { limit: 500 } });
        const arr = res?.data?.data;
        setVariantOptions(Array.isArray(arr) ? arr : []);
      } catch (error) {
        console.error('Error fetching sales variants for dropdown:', error);
        setVariantOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchVariants();
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
      r.variant_sku?.toLowerCase().includes(value) ||
      r.salesproduct_name?.toLowerCase().includes(value)
    );
    setFilteredRecords(filtered);
  };

  // ---------- Modal helpers ----------
  const resetForm = () => {
    setForm({ sales_product_variant: '', current_stock: '', minimum_stock_level: '5', maximum_stock_level: '1000', reorder_point: '10', cost_price: '', last_restocked: '' });
    setEditingRecord(null);
  };

  const handleAdd = () => {
    if (!permissions.create_sales_inventory) { toast.error('You do not have permission to add sales inventory records'); return; }
    resetForm();
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    if (!permissions.update_sales_inventory) { toast.error('You do not have permission to update sales inventory'); return; }
    setEditingRecord(record);
    setForm({
      sales_product_variant: record.sales_product_variant ? String(record.sales_product_variant) : '',
      current_stock: record.current_stock != null ? String(record.current_stock) : '',
      minimum_stock_level: record.minimum_stock_level != null ? String(record.minimum_stock_level) : '5',
      maximum_stock_level: record.maximum_stock_level != null ? String(record.maximum_stock_level) : '1000',
      reorder_point: record.reorder_point != null ? String(record.reorder_point) : '10',
      cost_price: record.cost_price != null ? String(record.cost_price) : '',
      last_restocked: record.last_restocked ? record.last_restocked.slice(0, 16) : '',
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDelete = async (id) => {
    if (!permissions.delete_sales_inventory) { toast.error('You do not have permission to delete sales inventory records'); return; }
    if (!window.confirm('Are you sure you want to delete this sales inventory record?')) return;
    try {
      await AxiosInstance.delete('/api/myapp/v1/sales/inventory/', { params: { id } });
      toast.success('Sales inventory record deleted successfully');
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error deleting sales inventory record:', error);
      toast.error(error.response?.data?.error || 'Error deleting sales inventory record');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.sales_product_variant) { toast.error('Please select a sales product variant'); return; }
    if (!String(form.current_stock).trim()) { toast.error('Please enter current stock'); return; }
    if (parseInt(form.minimum_stock_level) >= parseInt(form.maximum_stock_level)) {
      toast.error('Minimum stock level must be less than maximum stock level');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        sales_product_variant: parseInt(form.sales_product_variant),
        current_stock: parseInt(form.current_stock) || 0,
        minimum_stock_level: parseInt(form.minimum_stock_level) || 5,
        maximum_stock_level: parseInt(form.maximum_stock_level) || 1000,
        reorder_point: parseInt(form.reorder_point) || 10,
        cost_price: form.cost_price || null,
        last_restocked: form.last_restocked || null,
      };

      if (editingRecord) {
        await AxiosInstance.patch('/api/myapp/v1/sales/inventory/', { id: editingRecord.id, ...payload }, {
          params: { id: editingRecord.id },
        });
        toast.success('Sales inventory updated successfully');
      } else {
        await AxiosInstance.post('/api/myapp/v1/sales/inventory/', payload);
        toast.success('Sales inventory record added successfully');
      }
      setModalOpen(false);
      resetForm();
      setRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error saving sales inventory:', error);
      const data = error.response?.data;
      const msg = data?.error || data?.detail ||
        (typeof data === 'object' ? JSON.stringify(data) : 'Error saving sales inventory record');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (!permissions.read_sales_inventory) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">You don't have permission to view sales inventory.</p>
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

      {/* Add / Update Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-slate-700/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b-2 border-slate-700/50 p-6 rounded-t-3xl flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                {editingRecord ? 'Edit Sales Inventory Record' : 'Add Sales Inventory Record'}
              </h2>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Sales Product Variant *</label>
                <select name="sales_product_variant" value={form.sales_product_variant} onChange={handleFormChange} disabled={loadingOptions || !!editingRecord}
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50">
                  <option value="" className="bg-slate-900">Select Variant</option>
                  {variantOptions.map(v => (
                    <option key={v.id} value={v.id} className="bg-slate-900">{v.sku} — {v.salesproduct_name}</option>
                  ))}
                </select>
                {editingRecord && <p className="text-slate-500 text-xs">Variant can't be changed after creation (one inventory record per variant).</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Current Stock *</label>
                  <input type="number" name="current_stock" min="0" value={form.current_stock} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Cost Price</label>
                  <input type="number" name="cost_price" min="0" step="0.01" value={form.cost_price} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Minimum Level</label>
                  <input type="number" name="minimum_stock_level" min="0" value={form.minimum_stock_level} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Maximum Level</label>
                  <input type="number" name="maximum_stock_level" min="0" value={form.maximum_stock_level} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Reorder Point</label>
                  <input type="number" name="reorder_point" min="0" value={form.reorder_point} onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Last Restocked</label>
                <input type="datetime-local" name="last_restocked" value={form.last_restocked} onChange={handleFormChange}
                  className="w-full px-4 py-3 bg-slate-900/50 text-white border-2 border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); resetForm(); }}
                  className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 text-white rounded-xl font-semibold border-2 border-slate-700/50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all hover:scale-105 disabled:opacity-50">
                  {saving ? 'Saving...' : (editingRecord ? 'Update Record' : 'Add Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12 flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-light text-white">SALES INVENTORY</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mt-1"></div>
          </div>
          <div className="flex gap-3 flex-wrap">
            {permissions.create_sales_inventory && (
              <button onClick={handleAdd} className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform">
                Add Record
              </button>
            )}
            <button onClick={() => router.push('/admin/salesproductvariant')} className="px-6 py-3 border border-amber-500 text-amber-500 rounded-full hover:bg-amber-500 hover:text-black transform hover:scale-105 transition-transform">
              Sales Product Variants
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-gray-800/50 rounded-xl mb-8 gap-4">
          <div className="text-amber-400">Showing {filteredRecords.length} of {pagination.totalCount} items</div>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
            <input type="text" value={searchTerm} onChange={handleSearch} placeholder="Search by SKU or sales product name..."
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
          <div className="text-center py-20 text-amber-400">Loading sales inventory...</div>
        ) : filteredRecords.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-gray-700">
            <table className="w-full text-left text-gray-300">
              <thead className="bg-gray-800 text-amber-400 text-sm uppercase">
                <tr>
                  <th className="p-4">SKU</th>
                  <th className="p-4">Sales Product</th>
                  <th className="p-4">Current Stock</th>
                  <th className="p-4">Min / Max</th>
                  <th className="p-4">Reorder Point</th>
                  <th className="p-4">Cost Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(item => (
                  <tr key={item.id} className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 font-mono text-sm">{item.variant_sku}</td>
                    <td className="p-4">{item.salesproduct_name}</td>
                    <td className="p-4 font-semibold">{item.current_stock}</td>
                    <td className="p-4">{item.minimum_stock_level} / {item.maximum_stock_level}</td>
                    <td className="p-4">{item.reorder_point}</td>
                    <td className="p-4">{item.cost_price ? `PKR ${parseFloat(item.cost_price).toLocaleString()}` : '—'}</td>
                    <td className="p-4 space-x-1">
                      {item.is_low_stock && <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">Low Stock</span>}
                      {item.needs_reorder && <span className="text-xs px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">Reorder</span>}
                      {!item.is_low_stock && !item.needs_reorder && <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">OK</span>}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {permissions.update_sales_inventory && (
                        <button onClick={() => handleEdit(item)} className="p-2 bg-amber-600/90 rounded-lg hover:bg-amber-600 transition-colors" aria-label="Edit sales inventory">✏️</button>
                      )}
                      {permissions.delete_sales_inventory && (
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-600/90 rounded-lg hover:bg-red-600 transition-colors" aria-label="Delete sales inventory">🗑️</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-300">
            <p>No sales inventory records found.</p>
            {permissions.create_sales_inventory && (
              <button onClick={handleAdd} className="mt-6 px-6 py-2 bg-amber-600 rounded-full hover:bg-amber-700 text-white transition-colors">
                Add Record
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

export default SalesInventory;