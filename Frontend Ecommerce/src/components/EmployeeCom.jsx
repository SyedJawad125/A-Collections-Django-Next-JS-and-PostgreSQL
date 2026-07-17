'use client';
import React, { useEffect, useState, useContext, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { AuthContext } from '@/components/AuthContext';
import { Search, Plus, Trash2, X, Users2, Mail, Phone, ShieldCheck, Download, ChevronLeft, ChevronRight, UserRound, Power, ImagePlus, MoreVertical, Edit3, UserX, UserCheck } from 'lucide-react';

const EmployeeCom = () => {
  const { permissions = {} } = useContext(AuthContext);

  const canCreate = permissions?.create_employee || permissions?.CREATE_USER || true;
  const canUpdate = permissions?.update_employee || permissions?.UPDATE_USER || true;
  const canToggle = permissions?.toggle_employee || permissions?.TOGGLE_USER || true;
  const canDelete = permissions?.delete_employee || permissions?.DELETE_USER || true;

  const [records, setRecords] = useState([]);
  const [count, setCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const recordsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(count / recordsPerPage));

  const [roles, setRoles] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionDropdown, setActionDropdown] = useState(null);

  const emptyForm = {
    first_name: '', last_name: '', username: '', email: '', mobile: '', role: '',
  };
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, [currentPage]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await AxiosInstance.get('/api/user/v1/employee/', {
        params: {
          limit: recordsPerPage,
          offset: (currentPage - 1) * recordsPerPage,
        },
      });

      const payload = res?.data;
      const list = payload?.data;
      const total = payload?.count;

      if (Array.isArray(list)) {
        setRecords(list);
        setCount(total ?? list.length);
      } else {
        console.error('Unexpected response structure:', payload);
        toast.error('Could not load employees');
      }
    } catch (error) {
      console.error('Error occurred:', error);
      toast.error('Error fetching employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await AxiosInstance.get('/api/user/v1/role/', { 
        params: { limit: 100, offset: 0 } 
      });
      const payload = res?.data;
      const list = payload?.data;
      if (Array.isArray(list)) setRoles(list);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!Array.isArray(records)) return [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return records;
    return records.filter((e) => {
      const idMatch = e.id?.toString() === q;
      const nameMatch = (e.full_name || `${e.first_name || ''} ${e.last_name || ''}`).toLowerCase().includes(q);
      const emailMatch = (e.email || e.username || '').toLowerCase().includes(q);
      const mobileMatch = (e.mobile || '').toLowerCase().includes(q);
      const roleMatch = (e.role?.name || '').toLowerCase().includes(q);
      return idMatch || nameMatch || emailMatch || mobileMatch || roleMatch;
    });
  }, [records, searchTerm]);

  const totalEmployees = count;
  const activeCount = records.filter((e) => (e.status || '').toLowerCase() === 'active').length;
  const invitedCount = records.filter((e) => (e.status || '').toLowerCase() === 'invited').length;
  const deactivatedCount = records.filter((e) => (e.status || '').toLowerCase() === 'deactivated').length;

  const openCreate = () => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setModalOpen(true);
  };

  const openEdit = (employee) => {
    setEditingEmployee(employee);
    setForm({
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      username: employee.username || '',
      email: employee.email || '',
      mobile: employee.mobile || '',
      role: employee.role?.id || employee.role || '',
    });
    setImageFile(null);
    setImagePreview(employee.profile_image || null);
    setModalOpen(true);
    setActionDropdown(null);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const saveEmployee = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim() || !form.username.trim()) {
      toast.error('First name, last name, and username are required');
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('first_name', form.first_name.trim());
      formData.append('last_name', form.last_name.trim());
      formData.append('username', form.username.trim());
      if (form.email) formData.append('email', form.email.trim());
      if (form.mobile) formData.append('mobile', form.mobile.trim());
      if (form.role) formData.append('role', form.role);
      if (imageFile) formData.append('profile_image', imageFile);

      if (editingEmployee) {
        await AxiosInstance.patch(`/api/user/v1/employee/?id=${editingEmployee.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Employee updated successfully');
      } else {
        await AxiosInstance.post('/api/user/v1/employee/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Employee invited successfully');
      }

      setModalOpen(false);
      setCurrentPage(1);
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      const msg = error?.response?.data?.message || error?.response?.data?.data || 'Error saving employee';
      toast.error(typeof msg === 'string' ? msg : 'Error saving employee');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (employee) => {
    const action = (employee.status || '').toLowerCase() === 'deactivated' ? 'reactivate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${action} "${employee.full_name}"?`)) return;

    setTogglingId(employee.id);
    try {
      await AxiosInstance.delete(`/api/user/v1/toggle/?id=${employee.id}`);
      toast.success(`Employee ${action}d successfully`);
      fetchEmployees();
    } catch (error) {
      const msg = error?.response?.data?.message || `Error trying to ${action} employee`;
      toast.error(typeof msg === 'string' ? msg : `Error trying to ${action} employee`);
    } finally {
      setTogglingId(null);
      setActionDropdown(null);
    }
  };

  const deleteEmployee = async (employee) => {
    if (!window.confirm(`Permanently remove "${employee.full_name}"? This cannot be undone.`)) return;
    
    setDeletingId(employee.id);
    try {
      await AxiosInstance.delete(`/api/user/v1/employee/?id=${employee.id}`);
      toast.success('Employee deleted successfully');
      setCurrentPage(1);
      fetchEmployees();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Error deleting employee';
      toast.error(typeof msg === 'string' ? msg : 'Error deleting employee');
    } finally {
      setDeletingId(null);
      setActionDropdown(null);
    }
  };

  const exportCSV = () => {
    if (!filteredRecords.length) {
      toast.error('No employees to export');
      return;
    }
    const headers = ['ID', 'Full Name', 'Email', 'Mobile', 'Role', 'Status'];
    const escape = (val) => {
      const s = val === null || val === undefined ? '' : String(val);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows = filteredRecords.map((e) => [
      e.id, 
      e.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim(),
      e.email || e.username || '',
      e.mobile || '',
      e.role?.name || '', 
      e.status || (e.deactivated ? 'Deactivated' : 'Active'),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `employees-export-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('CSV exported');
  };

  const ActionDropdown = ({ employee, onClose }) => {
    const isDeactivated = (employee.status || '').toLowerCase() === 'deactivated';
    const isInvited = (employee.status || '').toLowerCase() === 'invited';
    
    return (
      <div className="absolute right-0 top-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 min-w-[160px] overflow-hidden">
        {canUpdate && (
          <button
            onClick={() => openEdit(employee)}
            className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-2 transition-colors"
          >
            <Edit3 size={14} className="text-blue-400" />
            Edit Employee
          </button>
        )}
        
        {canToggle && (
          <button
            onClick={() => toggleStatus(employee)}
            disabled={togglingId === employee.id}
            className={`w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-2 transition-colors ${
              togglingId === employee.id ? 'text-slate-500 cursor-not-allowed' : 'text-white'
            }`}
          >
            {isDeactivated ? (
              <>
                <UserCheck size={14} className="text-emerald-400" />
                Reactivate
              </>
            ) : (
              <>
                <UserX size={14} className="text-red-400" />
                {isInvited ? 'Cancel Invitation' : 'Deactivate'}
              </>
            )}
          </button>
        )}
        
        {canDelete && (
          <button
            onClick={() => deleteEmployee(employee)}
            disabled={deletingId === employee.id}
            className={`w-full px-4 py-2 text-left border-t border-slate-700 hover:bg-slate-700 flex items-center gap-2 transition-colors ${
              deletingId === employee.id ? 'text-slate-500 cursor-not-allowed' : 'text-red-400'
            }`}
          >
            <Trash2 size={14} />
            Delete Permanently
          </button>
        )}
      </div>
    );
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (s === 'invited') return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    if (s === 'deactivated') return 'bg-red-500/10 text-red-400 border-red-500/30';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 overflow-auto">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" className="mt-16" />
      
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              Employee Management
            </h1>
            <p className="text-slate-400 text-sm">Manage and organize your team members</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700/50 text-white px-4 py-2 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-all"
            >
              <Download size={15} className="text-blue-400" />
              Export CSV
            </button>

            {canCreate && (
              <button
                onClick={openCreate}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
              >
                <Plus size={16} />
                New Employee
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 hover:border-slate-600/50 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Employees</span>
              <Users2 className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">{totalEmployees}</p>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-900/20 to-emerald-950/30 backdrop-blur-sm border border-emerald-700/30 rounded-xl p-5 hover:border-emerald-600/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Active</span>
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-3xl font-bold text-emerald-400">{activeCount}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-900/20 to-amber-950/30 backdrop-blur-sm border border-amber-700/30 rounded-xl p-5 hover:border-amber-600/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Invited</span>
              <Mail className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-3xl font-bold text-amber-400">{invitedCount}</p>
          </div>

          <div className="bg-gradient-to-br from-red-900/20 to-red-950/30 backdrop-blur-sm border border-red-700/30 rounded-xl p-5 hover:border-red-600/40 transition-all">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Deactivated</span>
              <Power className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-3xl font-bold text-red-400">{deactivatedCount}</p>
          </div>
        </div>

        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, mobile, or role…"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 text-white border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-500"
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
          <p className="mt-6 text-slate-400 font-medium">Loading employees...</p>
        </div>
      )}

      {!loading && (
        <>
          {filteredRecords.length > 0 ? (
            <>
              <div className="space-y-4">
                {filteredRecords.map((e) => (
                  <div
                    key={e.id}
                    className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/60 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                            <UserRound className="w-7 h-7 text-white" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-3 py-1 bg-slate-700/50 text-slate-400 text-xs font-mono rounded-md border border-slate-600/30">
                                #{e.id}
                              </span>
                              <h3 className="text-xl font-bold text-white">
                                {e.full_name || `${e.first_name || ''} ${e.last_name || ''}`.trim()}
                              </h3>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="flex items-center gap-2 text-slate-400">
                                <Mail size={14} />
                                <span>{e.email || e.username || '—'}</span>
                              </div>

                              <div className="flex items-center gap-2 text-slate-400">
                                <Phone size={14} />
                                <span>{e.mobile || '—'}</span>
                              </div>

                              {e.role?.name && (
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/30">
                                  {e.role.name}
                                </span>
                              )}

                              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(e.status)}`}>
                                {e.status || 'Active'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
                          <button
                            onClick={() => setActionDropdown(actionDropdown === e.id ? null : e.id)}
                            className="p-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white border border-slate-600/30 rounded-lg transition-all"
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {actionDropdown === e.id && (
                            <ActionDropdown 
                              employee={e} 
                              onClose={() => setActionDropdown(null)} 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {actionDropdown && (
                <div
                  className="fixed inset-0 z-40 bg-transparent"
                  onClick={() => setActionDropdown(null)}
                />
              )}

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-13 mt-8 pb-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === 1 
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            currentPage === pageNum 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === totalPages 
                        ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed border border-slate-700/30' 
                        : 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <UserRound size={32} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No employees found</h3>
              <p className="text-slate-400 mb-6">
                {searchTerm ? 'Try a different search term' : 'Invite your first employee to get started'}
              </p>
              {canCreate && !searchTerm && (
                <button
                  onClick={openCreate}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105"
                >
                  <Plus size={16} />
                  New Employee
                </button>
              )}
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingEmployee ? 'Edit Employee' : 'New Employee'}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    {editingEmployee
                      ? `Editing "${editingEmployee.full_name}"`
                      : 'An invitation email will be sent so they can set their password'}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={saveEmployee} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    placeholder="Sarah"
                    className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    placeholder="Al-Faisal"
                    className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  placeholder="sarah123"
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Used for login (unique identifier)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="sarah@hotel.com"
                  className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Mobile
                  </label>
                  <input
                    type="text"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="+966501234567"
                    className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Role
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 text-white border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  >
                    <option value="">No role assigned</option>
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Profile Image
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <ImagePlus size={20} className="text-slate-600" />
                    )}
                  </div>
                  <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors">
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving
                  ? (editingEmployee ? 'Saving…' : 'Sending Invite…')
                  : (editingEmployee ? 'Save Changes' : 'Send Invitation')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeCom;