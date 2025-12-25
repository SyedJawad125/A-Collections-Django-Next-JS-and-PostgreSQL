// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import AxiosInstance from "@/components/AxiosInstance";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// interface Permission {
//   id: number;
//   name: string;
//   description: string;
//   code: string;
//   module_name?: string;
// }

// interface Role {
//   id: number;
//   name: string;
//   description: string;
//   code: string;
//   permissions: Permission[];
// }

// export default function UpdateRole() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const roleId = searchParams.get('id');

//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     code: '',
//     permission_ids: [] as number[],
//   });

//   const [permissions, setPermissions] = useState<Permission[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [fetchingData, setFetchingData] = useState(true);

//   // Fetch role data and permissions
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!roleId) {
//         toast.error('Role ID not provided');
//         router.push('/RolesPage');
//         return;
//       }

//       setFetchingData(true);
//       try {
//         // Fetch permissions
//         const permissionsResponse = await AxiosInstance.get('/permissions/get_admin_without_paginated');
//         const permissionsData = permissionsResponse.data?.result?.data ?? [];
//         setPermissions(permissionsData);

//         // Fetch role data
//         const roleResponse = await AxiosInstance.get(`/roles/${roleId}`);
//         const roleData = roleResponse.data?.result || roleResponse.data?.data || roleResponse.data;
        
//         if (roleData) {
//           setFormData({
//             name: roleData.name || '',
//             description: roleData.description || '',
//             code: roleData.code || '',
//             permission_ids: roleData.permissions ? roleData.permissions.map((p: Permission) => p.id) : [],
//           });
//         } else {
//           toast.error('Role not found');
//           router.push('/RolesPage');
//         }
//       } catch (error: any) {
//         console.error('Error fetching data:', error);
//         const errorMessage = error.response?.data?.detail || 'Failed to load role data';
//         toast.error(errorMessage);
//         setTimeout(() => router.push('/RolesPage'), 2000);
//       } finally {
//         setFetchingData(false);
//       }
//     };

//     fetchData();
//   }, [roleId, router]);

//   // Handle input change for text fields
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Handle permission checkbox change
//   const handlePermissionToggle = (id: number) => {
//     setFormData((prev) => {
//       const isSelected = prev.permission_ids.includes(id);
//       return {
//         ...prev,
//         permission_ids: isSelected
//           ? prev.permission_ids.filter(pid => pid !== id)
//           : [...prev.permission_ids, id],
//       };
//     });
//   };

//   // Submit form
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name.trim() || !formData.description.trim() || !formData.code.trim()) {
//       toast.error('Please fill in all required fields.');
//       return;
//     }

//     setLoading(true);
//     try {
//       await AxiosInstance.patch(`/roles/${roleId}`, {
//         name: formData.name.trim(),
//         description: formData.description.trim(),
//         code: formData.code.trim(),
//         permission_ids: formData.permission_ids,
//       });

//       toast.success('Role updated successfully!');
//       setTimeout(() => {
//         router.push('/RolesPage');
//       }, 1500);
//     } catch (error: any) {
//       console.error('Error updating role:', error);
//       const errorMessage = error.response?.data?.detail || 'Failed to update role.';
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Loading state
//   if (fetchingData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
//         {/* Animated Background Elements */}
//         <div className="absolute inset-0">
//           <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
//           <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
//           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
//         </div>

//         <ToastContainer />
        
//         <div className="relative max-w-4xl mx-auto">
//           {/* Loading Container */}
//           <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-10 relative overflow-hidden">
//             <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
//             <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
            
//             <div className="relative z-10 animate-pulse space-y-6">
//               <div className="text-center mb-10">
//                 <div className="w-16 h-16 bg-amber-400/20 rounded-full mx-auto mb-6"></div>
//                 <div className="h-8 bg-slate-800 rounded w-64 mx-auto mb-3"></div>
//                 <div className="h-4 bg-slate-800 rounded w-48 mx-auto"></div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="h-20 bg-slate-800/50 rounded-xl"></div>
//                 <div className="h-20 bg-slate-800/50 rounded-xl"></div>
//               </div>
//               <div className="h-32 bg-slate-800/50 rounded-xl"></div>
//               <div className="space-y-4">
//                 <div className="h-6 bg-slate-800/50 rounded w-32"></div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {[...Array(6)].map((_, i) => (
//                     <div key={i} className="h-16 bg-slate-800/50 rounded-xl"></div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0">
//         <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
//       </div>

//       <ToastContainer />
      
//       <div className="relative max-w-4xl mx-auto">
//         {/* Luxury Glassmorphism Container */}
//         <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-10 relative overflow-hidden">
          
//           {/* Animated Border Glow */}
//           <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
//           <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
          
//           <div className="relative z-10">
//             {/* Premium Header */}
//             <div className="text-center mb-10">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-2xl shadow-amber-500/50 mb-6">
//                 <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                 </svg>
//               </div>
//               <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-3 tracking-tight">
//                 Update Role
//               </h2>
//               <p className="text-slate-400 text-lg">Modify existing role permissions and details</p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-8">
              
//               {/* Input Fields Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Role Name */}
//                 <div className="space-y-3">
//                   <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
//                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                     </svg>
//                     Role Name *
//                   </label>
//                   <div className="relative group">
//                     <input
//                       type="text"
//                       name="name"
//                       placeholder="Enter role name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       required
//                       className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
//                     />
//                     <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
//                   </div>
//                 </div>

//                 {/* Role Code */}
//                 <div className="space-y-3">
//                   <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
//                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
//                     </svg>
//                     Role Code *
//                   </label>
//                   <div className="relative group">
//                     <input
//                       type="text"
//                       name="code"
//                       placeholder="Enter role code"
//                       value={formData.code}
//                       onChange={handleChange}
//                       required
//                       className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
//                     />
//                     <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
//                   </div>
//                 </div>
//               </div>

//               {/* Description */}
//               <div className="space-y-3">
//                 <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
//                   <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
//                   </svg>
//                   Description *
//                 </label>
//                 <div className="relative group">
//                   <textarea
//                     name="description"
//                     placeholder="Enter detailed role description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     rows={4}
//                     required
//                     className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm resize-none"
//                   />
//                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
//                 </div>
//               </div>

//               {/* Premium Permissions Section */}
//               <div className="space-y-6">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
//                     <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <h3 className="text-2xl font-bold text-amber-300">Permissions</h3>
//                   <div className="h-px bg-gradient-to-r from-amber-500/50 to-transparent flex-1 ml-4"></div>
//                   <div className="text-sm text-slate-400">
//                     {formData.permission_ids.length} selected
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {permissions.map((perm) => (
//                     <label
//                       key={perm.id}
//                       className="group relative cursor-pointer block"
//                     >
//                       <div className={`p-5 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 ${
//                         formData.permission_ids.includes(perm.id)
//                           ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-400/60 shadow-lg shadow-amber-500/25'
//                           : 'bg-slate-900/40 border-slate-700/40 hover:border-amber-400/40 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-amber-500/10'
//                       }`}>
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="font-semibold text-amber-100 group-hover:text-amber-200 transition-colors">
//                             {perm.name}
//                           </span>
//                           <div className={`relative w-6 h-6 rounded-full border-2 transition-all duration-300 ${
//                             formData.permission_ids.includes(perm.id)
//                               ? 'bg-gradient-to-r from-amber-400 to-yellow-500 border-amber-400 shadow-lg shadow-amber-500/50'
//                               : 'border-slate-500 bg-slate-800/50 group-hover:border-amber-400'
//                           }`}>
//                             {formData.permission_ids.includes(perm.id) && (
//                               <svg className="w-4 h-4 text-slate-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                               </svg>
//                             )}
//                           </div>
//                         </div>
//                         {perm.description && (
//                           <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
//                             {perm.description}
//                           </p>
//                         )}
//                       </div>
//                       <input
//                         type="checkbox"
//                         checked={formData.permission_ids.includes(perm.id)}
//                         onChange={() => handlePermissionToggle(perm.id)}
//                         className="sr-only"
//                       />
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Premium Submit Button Group */}
//               <div className="flex justify-center space-x-6 pt-8">
//                 <button
//                   type="button"
//                   onClick={() => router.push('/RolesPage')}
//                   className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300 shadow-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className={`group relative px-12 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-slate-900 font-bold text-lg rounded-full shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all duration-300 overflow-hidden ${
//                     loading ? 'opacity-50 cursor-not-allowed' : ''
//                   }`}
//                 >
//                   {/* Button Background Animation */}
//                   <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
//                   {/* Button Content */}
//                   <div className="relative flex items-center space-x-3">
//                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//                       <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                     </svg>
//                     <span>{loading ? 'Updating...' : 'Update Role'}</span>
//                   </div>
//                 </button>
//               </div>

//             </form>
//           </div>
//         </div>

//         {/* Elegant Footer */}
//         <div className="text-center mt-8">
//           <p className="text-slate-500 flex items-center justify-center space-x-2">
//             <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//             </svg>
//             <span>Secure Enterprise Role Management</span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }



// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import AxiosInstance from "@/components/AxiosInstance";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// interface Permission {
//   id: number;
//   name: string;
//   code_name: string;
// }

// interface Role {
//   id: number;
//   name: string;
//   description: string;
//   code_name: string; // Changed from 'code'
//   permissions: Permission[];
// }

// export default function UpdateRole() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const roleId = searchParams.get('id');

//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     code_name: '', // Changed from 'code'
//     permissions: [] as number[], // Changed from 'permission_ids'
//   });

//   const [permissions, setPermissions] = useState<Permission[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [fetchingData, setFetchingData] = useState(true);

//   // Fetch role data and permissions
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!roleId) {
//         toast.error('Role ID not provided');
//         router.push('/RolesPage');
//         return;
//       }

//       setFetchingData(true);
//       try {
//         // Fetch permissions
//         const permissionsResponse = await AxiosInstance.get('/api/user/v1/permission/');
//         const permissionsData = permissionsResponse.data?.data ?? [];
//         setPermissions(permissionsData);

//         // Fetch role data
//         const roleResponse = await AxiosInstance.get(`/api/user/v1/role/${roleId}/`);
//         const roleData = roleResponse.data?.data || roleResponse.data;
        
//         if (roleData) {
//           setFormData({
//             name: roleData.name || '',
//             description: roleData.description || '',
//             code_name: roleData.code_name || '', // Changed from 'code'
//             permissions: roleData.permissions ? roleData.permissions.map((p: Permission) => p.id) : [],
//           });
//         } else {
//           toast.error('Role not found');
//           router.push('/RolesPage');
//         }
//       } catch (error: any) {
//         console.error('Error fetching data:', error);
//         const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to load role data';
//         toast.error(errorMessage);
//         setTimeout(() => router.push('/RolesPage'), 2000);
//       } finally {
//         setFetchingData(false);
//       }
//     };

//     fetchData();
//   }, [roleId, router]);

//   // Handle input change for text fields
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Handle permission checkbox change
//   const handlePermissionToggle = (id: number) => {
//     setFormData((prev) => {
//       const isSelected = prev.permissions.includes(id);
//       return {
//         ...prev,
//         permissions: isSelected
//           ? prev.permissions.filter(pid => pid !== id)
//           : [...prev.permissions, id],
//       };
//     });
//   };

//   // Submit form
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name.trim() || !formData.description.trim() || !formData.code_name.trim()) {
//       toast.error('Please fill in all required fields.');
//       return;
//     }

//     setLoading(true);
//     try {
//       await AxiosInstance.patch(`/api/user/v1/role/${roleId}/`, {
//         name: formData.name.trim(),
//         description: formData.description.trim(),
//         code_name: formData.code_name.trim(), // Changed from 'code'
//         permissions: formData.permissions, // Changed from 'permission_ids'
//       });

//       toast.success('Role updated successfully!');
//       setTimeout(() => {
//         router.push('/RolesPage');
//       }, 1500);
//     } catch (error: any) {
//       console.error('Error updating role:', error);
//       const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to update role.';
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Loading state
//   if (fetchingData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
//         {/* Animated Background Elements */}
//         <div className="absolute inset-0">
//           <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
//           <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
//           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
//         </div>

//         <ToastContainer />
        
//         <div className="relative max-w-4xl mx-auto">
//           {/* Loading Container */}
//           <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-10 relative overflow-hidden">
//             <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
//             <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
            
//             <div className="relative z-10 animate-pulse space-y-6">
//               <div className="text-center mb-10">
//                 <div className="w-16 h-16 bg-amber-400/20 rounded-full mx-auto mb-6"></div>
//                 <div className="h-8 bg-slate-800 rounded w-64 mx-auto mb-3"></div>
//                 <div className="h-4 bg-slate-800 rounded w-48 mx-auto"></div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="h-20 bg-slate-800/50 rounded-xl"></div>
//                 <div className="h-20 bg-slate-800/50 rounded-xl"></div>
//               </div>
//               <div className="h-32 bg-slate-800/50 rounded-xl"></div>
//               <div className="space-y-4">
//                 <div className="h-6 bg-slate-800/50 rounded w-32"></div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {[...Array(6)].map((_, i) => (
//                     <div key={i} className="h-16 bg-slate-800/50 rounded-xl"></div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0">
//         <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
//       </div>

//       <ToastContainer />
      
//       <div className="relative max-w-4xl mx-auto">
//         {/* Luxury Glassmorphism Container */}
//         <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-10 relative overflow-hidden">
          
//           {/* Animated Border Glow */}
//           <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
//           <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
          
//           <div className="relative z-10">
//             {/* Premium Header */}
//             <div className="text-center mb-10">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-2xl shadow-amber-500/50 mb-6">
//                 <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                 </svg>
//               </div>
//               <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-3 tracking-tight">
//                 Update Role
//               </h2>
//               <p className="text-slate-400 text-lg">Modify existing role permissions and details</p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-8">
              
//               {/* Input Fields Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Role Name */}
//                 <div className="space-y-3">
//                   <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
//                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                     </svg>
//                     Role Name *
//                   </label>
//                   <div className="relative group">
//                     <input
//                       type="text"
//                       name="name"
//                       placeholder="Enter role name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       required
//                       className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
//                     />
//                     <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
//                   </div>
//                 </div>

//                 {/* Role Code Name */}
//                 <div className="space-y-3">
//                   <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
//                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
//                     </svg>
//                     Role Code Name *
//                   </label>
//                   <div className="relative group">
//                     <input
//                       type="text"
//                       name="code_name"
//                       placeholder="Enter role code (e.g., admin, guest)"
//                       value={formData.code_name}
//                       onChange={handleChange}
//                       required
//                       className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
//                     />
//                     <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
//                   </div>
//                 </div>
//               </div>

//               {/* Description */}
//               <div className="space-y-3">
//                 <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
//                   <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
//                   </svg>
//                   Description *
//                 </label>
//                 <div className="relative group">
//                   <textarea
//                     name="description"
//                     placeholder="Enter detailed role description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     rows={4}
//                     required
//                     className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm resize-none"
//                   />
//                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
//                 </div>
//               </div>

//               {/* Premium Permissions Section */}
//               <div className="space-y-6">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
//                     <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                     </svg>
//                   </div>
//                   <h3 className="text-2xl font-bold text-amber-300">Permissions</h3>
//                   <div className="h-px bg-gradient-to-r from-amber-500/50 to-transparent flex-1 ml-4"></div>
//                   <div className="text-sm text-slate-400">
//                     {formData.permissions.length} selected
//                   </div>
//                 </div>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {permissions.map((perm) => (
//                     <label
//                       key={perm.id}
//                       className="group relative cursor-pointer block"
//                     >
//                       <div className={`p-5 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 ${
//                         formData.permissions.includes(perm.id)
//                           ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-400/60 shadow-lg shadow-amber-500/25'
//                           : 'bg-slate-900/40 border-slate-700/40 hover:border-amber-400/40 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-amber-500/10'
//                       }`}>
//                         <div className="flex items-center justify-between mb-2">
//                           <span className="font-semibold text-amber-100 group-hover:text-amber-200 transition-colors">
//                             {perm.name}
//                           </span>
//                           <div className={`relative w-6 h-6 rounded-full border-2 transition-all duration-300 ${
//                             formData.permissions.includes(perm.id)
//                               ? 'bg-gradient-to-r from-amber-400 to-yellow-500 border-amber-400 shadow-lg shadow-amber-500/50'
//                               : 'border-slate-500 bg-slate-800/50 group-hover:border-amber-400'
//                           }`}>
//                             {formData.permissions.includes(perm.id) && (
//                               <svg className="w-4 h-4 text-slate-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
//                                 <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                               </svg>
//                             )}
//                           </div>
//                         </div>
//                         {perm.code_name && (
//                           <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
//                             {perm.code_name}
//                           </p>
//                         )}
//                       </div>
//                       <input
//                         type="checkbox"
//                         checked={formData.permissions.includes(perm.id)}
//                         onChange={() => handlePermissionToggle(perm.id)}
//                         className="sr-only"
//                       />
//                     </label>
//                   ))}
//                 </div>
//               </div>

//               {/* Premium Submit Button Group */}
//               <div className="flex justify-center space-x-6 pt-8">
//                 <button
//                   type="button"
//                   onClick={() => router.push('/RolesPage')}
//                   className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300 shadow-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className={`group relative px-12 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-slate-900 font-bold text-lg rounded-full shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all duration-300 overflow-hidden ${
//                     loading ? 'opacity-50 cursor-not-allowed' : ''
//                   }`}
//                 >
//                   {/* Button Background Animation */}
//                   <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
//                   {/* Button Content */}
//                   <div className="relative flex items-center space-x-3">
//                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//                       <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                     </svg>
//                     <span>{loading ? 'Updating...' : 'Update Role'}</span>
//                   </div>
//                 </button>
//               </div>

//             </form>
//           </div>
//         </div>

//         {/* Elegant Footer */}
//         <div className="text-center mt-8">
//           <p className="text-slate-500 flex items-center justify-center space-x-2">
//             <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//             </svg>
//             <span>Secure Enterprise Role Management</span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }




// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import AxiosInstance from "@/components/AxiosInstance";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// type Permission = {
//   id: number;
//   name: string;
//   code_name: string;
//   module_name: string;
//   module_label: string;
//   description: string;
// };

// interface Role {
//   id: number;
//   name: string;
//   description: string;
//   code_name: string;
//   permissions: Permission[];
// }

// export default function UpdateRole() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const roleId = searchParams.get('id');

//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     code_name: '',
//     permissions: [] as number[],
//   });

//   const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
//   const [loading, setLoading] = useState(false);
//   const [fetchingData, setFetchingData] = useState(true);

//   // Select all permissions in a module
//   const handleSelectAllInModule = (moduleLabel: string) => {
//     const modulePermissions = groupedPermissions[moduleLabel] || [];
//     const modulePermissionIds = modulePermissions.map(perm => perm.id);
    
//     // Check if all permissions in this module are already selected
//     const allSelected = modulePermissionIds.every(id => 
//       formData.permissions.includes(id)
//     );

//     setFormData((prev) => {
//       if (allSelected) {
//         // Deselect all permissions in this module
//         return {
//           ...prev,
//           permissions: prev.permissions.filter(id => 
//             !modulePermissionIds.includes(id)
//           ),
//         };
//       } else {
//         // Select all permissions in this module
//         const newPermissions = [...prev.permissions];
//         modulePermissionIds.forEach(id => {
//           if (!newPermissions.includes(id)) {
//             newPermissions.push(id);
//           }
//         });
//         return {
//           ...prev,
//           permissions: newPermissions,
//         };
//       }
//     });
//   };

//   // Select all permissions
//   const handleSelectAll = () => {
//     const allPermissionIds = Object.values(groupedPermissions)
//       .flat()
//       .map(perm => perm.id);
    
//     const allSelected = allPermissionIds.length === formData.permissions.length;
    
//     setFormData((prev) => ({
//       ...prev,
//       permissions: allSelected ? [] : allPermissionIds,
//     }));
//   };

//   // Fetch role data and permissions
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!roleId) {
//         toast.error('Role ID not provided');
//         router.push('/RolesPage');
//         return;
//       }

//       setFetchingData(true);
//       try {
//         // Fetch permissions
//         const permissionsResponse = await AxiosInstance.get('/api/user/v1/permission/');
//         const permissionsData = permissionsResponse.data?.data ?? {};
//         setGroupedPermissions(permissionsData);

//         // Fetch role data
//         const roleResponse = await AxiosInstance.get(`/api/user/v1/role/${roleId}/`);
//         const roleData = roleResponse.data?.data || roleResponse.data;
        
//         if (roleData) {
//           setFormData({
//             name: roleData.name || '',
//             description: roleData.description || '',
//             code_name: roleData.code_name || '',
//             permissions: roleData.permissions ? roleData.permissions.map((p: Permission) => p.id) : [],
//           });
//         } else {
//           toast.error('Role not found');
//           router.push('/RolesPage');
//         }
//       } catch (error: any) {
//         console.error('Error fetching data:', error);
//         const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to load role data';
//         toast.error(errorMessage);
//         setTimeout(() => router.push('/RolesPage'), 2000);
//       } finally {
//         setFetchingData(false);
//       }
//     };

//     fetchData();
//   }, [roleId, router]);

//   // Handle input change for text fields
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   // Handle permission checkbox change
//   const handlePermissionToggle = (id: number) => {
//     setFormData((prev) => {
//       const isSelected = prev.permissions.includes(id);
//       return {
//         ...prev,
//         permissions: isSelected
//           ? prev.permissions.filter(pid => pid !== id)
//           : [...prev.permissions, id],
//       };
//     });
//   };

//   // Submit form
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name.trim() || !formData.description.trim() || !formData.code_name.trim()) {
//       toast.error('Please fill in all required fields.');
//       return;
//     }

//     setLoading(true);
//     try {
//       await AxiosInstance.patch(`/api/user/v1/role/${roleId}/`, {
//         name: formData.name.trim(),
//         description: formData.description.trim(),
//         code_name: formData.code_name.trim(),
//         permissions: formData.permissions,
//       });

//       toast.success('Role updated successfully!');
//       setTimeout(() => {
//         router.push('/RolesPage');
//       }, 1500);
//     } catch (error: any) {
//       console.error('Error updating role:', error);
//       const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to update role.';
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Loading state
//   if (fetchingData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
//         {/* Animated Background Elements */}
//         <div className="absolute inset-0">
//           <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
//           <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
//           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
//         </div>

//         <ToastContainer />
        
//         <div className="relative max-w-6xl mx-auto">
//           {/* Loading Container */}
//           <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-10 relative overflow-hidden">
//             <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
//             <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
            
//             <div className="relative z-10 animate-pulse space-y-6">
//               <div className="text-center mb-10">
//                 <div className="w-16 h-16 bg-amber-400/20 rounded-full mx-auto mb-6"></div>
//                 <div className="h-8 bg-slate-800 rounded w-64 mx-auto mb-3"></div>
//                 <div className="h-4 bg-slate-800 rounded w-48 mx-auto"></div>
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="h-20 bg-slate-800/50 rounded-xl"></div>
//                 <div className="h-20 bg-slate-800/50 rounded-xl"></div>
//               </div>
//               <div className="h-32 bg-slate-800/50 rounded-xl"></div>
//               <div className="space-y-4">
//                 <div className="h-6 bg-slate-800/50 rounded w-32"></div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {[...Array(6)].map((_, i) => (
//                     <div key={i} className="h-16 bg-slate-800/50 rounded-xl"></div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
//       {/* Animated Background Elements */}
//       <div className="absolute inset-0">
//         <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
//         <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
//       </div>

//       <ToastContainer />
      
//       <div className="relative max-w-6xl mx-auto">
//         {/* Luxury Glassmorphism Container */}
//         <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-10 relative overflow-hidden">
          
//           {/* Animated Border Glow */}
//           <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
//           <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
          
//           <div className="relative z-10">
//             {/* Premium Header */}
//             <div className="text-center mb-10">
//               <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-2xl shadow-amber-500/50 mb-6">
//                 <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
//                   <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                 </svg>
//               </div>
//               <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-3 tracking-tight">
//                 Update Role
//               </h2>
//               <p className="text-slate-400 text-lg">Modify existing role permissions and details</p>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-8">
              
//               {/* Input Fields Grid */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Role Name */}
//                 <div className="space-y-3">
//                   <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
//                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
//                     </svg>
//                     Role Name *
//                   </label>
//                   <div className="relative group">
//                     <input
//                       type="text"
//                       name="name"
//                       placeholder="Enter role name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       required
//                       className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
//                     />
//                     <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
//                   </div>
//                 </div>

//                 {/* Role Code Name */}
//                 <div className="space-y-3">
//                   <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
//                     <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                       <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
//                     </svg>
//                     Role Code Name *
//                   </label>
//                   <div className="relative group">
//                     <input
//                       type="text"
//                       name="code_name"
//                       placeholder="Enter role code (e.g., admin, manager)"
//                       value={formData.code_name}
//                       onChange={handleChange}
//                       required
//                       className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
//                     />
//                     <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
//                   </div>
//                 </div>
//               </div>

//               {/* Description */}
//               <div className="space-y-3">
//                 <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
//                   <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
//                   </svg>
//                   Description *
//                 </label>
//                 <div className="relative group">
//                   <textarea
//                     name="description"
//                     placeholder="Enter detailed role description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     rows={3}
//                     required
//                     className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm resize-none"
//                   />
//                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/0 to-yellow-500/0 group-focus-within:from-amber-500/10 group-focus-within:to-yellow-500/10 transition-all duration-300 pointer-events-none"></div>
//                 </div>
//               </div>

//               {/* Premium Permissions Section */}
//               <div className="space-y-6">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center space-x-3">
//                     <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
//                       <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
//                         <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                       </svg>
//                     </div>
//                     <div>
//                       <h3 className="text-2xl font-bold text-amber-300">Permissions *</h3>
//                       <p className="text-sm text-slate-400">Select permissions to assign to this role</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center space-x-4">
//                     <div className="text-sm text-slate-300">
//                       <span className="text-amber-300 font-bold">{formData.permissions.length}</span> selected
//                     </div>
//                     <button
//                       type="button"
//                       onClick={handleSelectAll}
//                       className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
//                     >
//                       Select All
//                     </button>
//                   </div>
//                 </div>
                
//                 {/* Render permissions grouped by module */}
//                 {Object.keys(groupedPermissions).length > 0 ? (
//                   <div className="space-y-8">
//                     {(() => {
//                       // Create a normalized version of grouped permissions to handle the space issue
//                       const normalizedGroups: Record<string, Permission[]> = {};
                      
//                       Object.entries(groupedPermissions).forEach(([moduleLabel, permissions]) => {
//                         // Trim whitespace from module label to handle the space issue
//                         const normalizedLabel = moduleLabel.trim();
                        
//                         if (!normalizedGroups[normalizedLabel]) {
//                           normalizedGroups[normalizedLabel] = [];
//                         }
                        
//                         // Merge permissions if same label exists (due to space difference)
//                         normalizedGroups[normalizedLabel] = [
//                           ...normalizedGroups[normalizedLabel],
//                           ...permissions
//                         ];
//                       });
                      
//                       return Object.entries(normalizedGroups).map(([moduleLabel, permissions]) => {
//                         const modulePermissionIds = permissions.map(perm => perm.id);
//                         const selectedCount = modulePermissionIds.filter(id => 
//                           formData.permissions.includes(id)
//                         ).length;
//                         const allSelected = selectedCount === modulePermissionIds.length;
                        
//                         return (
//                           <div key={moduleLabel} className="space-y-4 bg-slate-900/30 rounded-2xl p-6 border border-slate-800/50">
//                             {/* Module Header */}
//                             <div className="flex items-center justify-between">
//                               <div className="flex items-center space-x-3">
//                                 <div className="w-2 h-8 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-full"></div>
//                                 <div>
//                                   <h4 className="text-xl font-semibold text-amber-200">{moduleLabel}</h4>
//                                   <p className="text-sm text-slate-400">
//                                     {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
//                                   </p>
//                                 </div>
//                               </div>
//                               <div className="flex items-center space-x-4">
//                                 <div className="text-sm text-slate-400">
//                                   <span className={selectedCount > 0 ? "text-amber-300 font-bold" : ""}>
//                                     {selectedCount}
//                                   </span> / {permissions.length} selected
//                                 </div>
//                                 <button
//                                   type="button"
//                                   onClick={() => handleSelectAllInModule(moduleLabel)}
//                                   className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
//                                     allSelected
//                                       ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30'
//                                       : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-700'
//                                   }`}
//                                 >
//                                   {allSelected ? 'Deselect All' : 'Select All'}
//                                 </button>
//                               </div>
//                             </div>
                            
//                             {/* Permissions Grid for this module */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                               {permissions.map((perm) => (
//                                 <label
//                                   key={perm.id}
//                                   className="group relative cursor-pointer block"
//                                 >
//                                   <div className={`p-4 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 ${
//                                     formData.permissions.includes(perm.id)
//                                       ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-400/60 shadow-lg shadow-amber-500/25'
//                                       : 'bg-slate-900/40 border-slate-700/40 hover:border-amber-400/40 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-amber-500/10'
//                                   }`}>
//                                     <div className="flex items-start justify-between mb-3">
//                                       <div className="flex-1">
//                                         <div className="flex items-center space-x-2 mb-1">
//                                           <span className="font-semibold text-amber-100 group-hover:text-amber-200 transition-colors">
//                                             {perm.name}
//                                           </span>
//                                           <span className="text-xs px-2 py-1 bg-slate-800/50 rounded text-slate-400">
//                                             {perm.module_name}
//                                           </span>
//                                         </div>
//                                         <p className="text-xs text-slate-400 line-clamp-2">
//                                           {perm.description}
//                                         </p>
//                                       </div>
//                                       <div className={`relative w-5 h-5 rounded-full border-2 transition-all duration-300 flex-shrink-0 ml-2 ${
//                                         formData.permissions.includes(perm.id)
//                                           ? 'bg-gradient-to-r from-amber-400 to-yellow-500 border-amber-400 shadow-lg shadow-amber-500/50'
//                                           : 'border-slate-500 bg-slate-800/50 group-hover:border-amber-400'
//                                       }`}>
//                                         {formData.permissions.includes(perm.id) && (
//                                           <svg className="w-3 h-3 text-slate-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
//                                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                                           </svg>
//                                         )}
//                                       </div>
//                                     </div>
//                                     <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors font-mono bg-slate-900/30 rounded px-2 py-1 truncate">
//                                       {perm.code_name}
//                                     </div>
//                                   </div>
//                                   <input
//                                     type="checkbox"
//                                     checked={formData.permissions.includes(perm.id)}
//                                     onChange={() => handlePermissionToggle(perm.id)}
//                                     className="sr-only"
//                                   />
//                                 </label>
//                               ))}
//                             </div>
//                           </div>
//                         );
//                       });
//                     })()}
//                   </div>
//                 ) : (
//                   <div className="text-center py-8 bg-slate-900/40 rounded-xl border border-slate-800/50">
//                     <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                     </svg>
//                     <p className="text-slate-400">No permissions available</p>
//                     <p className="text-sm text-slate-500 mt-2">Please configure permissions first</p>
//                   </div>
//                 )}
//               </div>

//               {/* Premium Submit Button Group */}
//               <div className="flex justify-center space-x-6 pt-8">
//                 <button
//                   type="button"
//                   onClick={() => router.push('/RolesPage')}
//                   className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300 shadow-lg"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className={`group relative px-12 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-slate-900 font-bold text-lg rounded-full shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all duration-300 overflow-hidden ${
//                     loading ? 'opacity-50 cursor-not-allowed' : ''
//                   }`}
//                 >
//                   {/* Button Background Animation */}
//                   <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
//                   {/* Button Content */}
//                   <div className="relative flex items-center space-x-3">
//                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//                       <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                     </svg>
//                     <span>{loading ? 'Updating...' : 'Update Role'}</span>
//                   </div>
//                 </button>
//               </div>

//             </form>
//           </div>
//         </div>

//         {/* Elegant Footer */}
//         <div className="text-center mt-8">
//           <p className="text-slate-500 flex items-center justify-center space-x-2">
//             <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//             </svg>
//             <span>Secure Enterprise Role Management</span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }





'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AxiosInstance from "@/components/AxiosInstance";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Permission = {
  id: number;
  name: string;
  code_name: string;
  module_name?: string;
  module_label?: string;
  description?: string;
};

interface Role {
  id: number;
  name: string;
  description: string;
  code_name: string;
  permissions: Permission[];
}

export default function UpdateRole() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleId = searchParams.get('id');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    code_name: '',
    permissions: [] as number[],
  });

  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [roleName, setRoleName] = useState('');

  // Normalize module labels to handle space issues (like in AddRole)
  const normalizeGroupedPermissions = (permissions: Permission[]) => {
    const groups: Record<string, Permission[]> = {};
    
    permissions.forEach(permission => {
      // Use module_label if available, otherwise extract from code_name
      let moduleLabel = permission.module_label || 'General';
      
      // Trim whitespace from module label to handle the space issue
      moduleLabel = moduleLabel.trim();
      
      if (!groups[moduleLabel]) {
        groups[moduleLabel] = [];
      }
      groups[moduleLabel].push(permission);
    });
    
    return groups;
  };

  // Fetch role data and permissions
  useEffect(() => {
    const fetchData = async () => {
      if (!roleId) {
        toast.error('Role ID not provided');
        router.push('/RolesPage');
        return;
      }

      setFetchingData(true);
      try {
        // Fetch permissions - CORRECTED ENDPOINT
        console.log('Fetching permissions...');
        const permissionsResponse = await AxiosInstance.get('/api/user/v1/permission/');
        console.log('Permissions API Response:', permissionsResponse.data);
        
        // Extract permissions data based on your API structure
        let permissionsData: Permission[] = [];
        const responseData = permissionsResponse.data;
        
        // Handle different response structures
        if (responseData?.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)) {
          // If data is an object with module groups (like in AddRole)
          const moduleGroups = responseData.data;
          console.log('Module groups received:', moduleGroups);
          
          // Flatten all permissions from all module groups
          Object.values(moduleGroups).forEach((modulePerms: any) => {
            if (Array.isArray(modulePerms)) {
              permissionsData = [...permissionsData, ...modulePerms];
            }
          });
        } else if (Array.isArray(responseData?.data)) {
          // If data is directly an array
          permissionsData = responseData.data;
        } else if (Array.isArray(responseData)) {
          // If response is directly an array
          permissionsData = responseData;
        } else if (responseData?.permissions) {
          // If permissions are in a permissions field
          permissionsData = responseData.permissions;
        }
        
        console.log('Extracted Permissions:', permissionsData);
        
        if (permissionsData.length === 0) {
          toast.warning('No permissions found. Please configure permissions first.');
        }
        
        // Group permissions by module
        const grouped = normalizeGroupedPermissions(permissionsData);
        console.log('Grouped Permissions:', grouped);
        setGroupedPermissions(grouped);

        // Fetch role data - Try different endpoints if one fails
        console.log('Fetching role data for ID:', roleId);
        let roleData: any = null;
        
        try {
          // Try the query parameter format first
          const roleResponse = await AxiosInstance.get(`/api/user/v1/role/?id=${roleId}`);
          console.log('Role API Response (query param):', roleResponse.data);
          roleData = roleResponse.data?.data;
        } catch (roleError: any) {
          console.log('Query param endpoint failed, trying path parameter...');
          
          // Try path parameter format
          try {
            const roleResponse = await AxiosInstance.get(`/api/user/v1/role/${roleId}/`);
            console.log('Role API Response (path param):', roleResponse.data);
            roleData = roleResponse.data?.data || roleResponse.data;
          } catch (pathError: any) {
            console.log('Path param endpoint also failed:', pathError);
            throw new Error('Could not fetch role data');
          }
        }
        
        if (roleData) {
          console.log('Role Data:', roleData);
          console.log('Role Permissions:', roleData.permissions);
          
          // Extract permission IDs from role permissions
          let permissionIds: number[] = [];
          if (roleData.permissions && Array.isArray(roleData.permissions)) {
            permissionIds = roleData.permissions.map((p: Permission) => p.id);
          }
            
          console.log('Extracted Permission IDs:', permissionIds);
          
          setRoleName(roleData.name || '');
          setFormData({
            name: roleData.name || '',
            description: roleData.description || '',
            code_name: roleData.code_name || '',
            permissions: permissionIds,
          });
        } else {
          toast.error('Role not found');
          router.push('/RolesPage');
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        
        let errorMessage = 'Failed to load role data';
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        toast.error(errorMessage);
        setTimeout(() => router.push('/RolesPage'), 2000);
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [roleId, router]);

  // Select all permissions in a module
  const handleSelectAllInModule = (moduleLabel: string) => {
    const modulePermissions = groupedPermissions[moduleLabel] || [];
    const modulePermissionIds = modulePermissions.map(perm => perm.id);
    
    // Check if all permissions in this module are already selected
    const allSelected = modulePermissionIds.every(id => 
      formData.permissions.includes(id)
    );

    setFormData((prev) => {
      if (allSelected) {
        // Deselect all permissions in this module
        return {
          ...prev,
          permissions: prev.permissions.filter(id => 
            !modulePermissionIds.includes(id)
          ),
        };
      } else {
        // Select all permissions in this module
        const newPermissions = [...prev.permissions];
        modulePermissionIds.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return {
          ...prev,
          permissions: newPermissions,
        };
      }
    });
  };

  // Select all permissions
  const handleSelectAll = () => {
    // Get all permission IDs from grouped permissions
    const allPermissionIds = Object.values(groupedPermissions)
      .flat()
      .map(perm => perm.id);
    
    const allSelected = allPermissionIds.length === formData.permissions.length;
    
    setFormData((prev) => ({
      ...prev,
      permissions: allSelected ? [] : allPermissionIds,
    }));
  };

  // Handle input change for text fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle permission checkbox change
  const handlePermissionToggle = (id: number) => {
    setFormData((prev) => {
      const isSelected = prev.permissions.includes(id);
      return {
        ...prev,
        permissions: isSelected
          ? prev.permissions.filter(pid => pid !== id)
          : [...prev.permissions, id],
      };
    });
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim() || !formData.code_name.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        code_name: formData.code_name.trim(),
        permissions: formData.permissions,
      };

      console.log('Submitting PATCH request...');
      console.log('Role ID:', roleId);
      console.log('Payload:', JSON.stringify(payload, null, 2));

      let response;
      
      // Try both PATCH endpoints
      try {
        // Try query parameter format first
        response = await AxiosInstance.patch(`/api/user/v1/role/?id=${roleId}`, payload);
      } catch (queryError: any) {
        console.log('Query param PATCH failed, trying path parameter...');
        // Try path parameter format
        response = await AxiosInstance.patch(`/api/user/v1/role/${roleId}/`, payload);
      }
      
      console.log('Update Response:', response.data);
      toast.success('Role updated successfully!');
      
      setTimeout(() => {
        router.push('/RolesPage');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error updating role:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to update role';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total permissions count
  const totalPermissions = Object.values(groupedPermissions)
    .reduce((total, modulePerms) => total + modulePerms.length, 0);

  // Loading state
  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <ToastContainer />
        
        <div className="relative max-w-6xl mx-auto">
          <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-10 relative overflow-hidden">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
            <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
            
            <div className="relative z-10 animate-pulse space-y-6">
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-amber-400/20 rounded-full mx-auto mb-6"></div>
                <div className="h-8 bg-slate-800 rounded w-64 mx-auto mb-3"></div>
                <div className="h-4 bg-slate-800 rounded w-48 mx-auto"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-20 bg-slate-800/50 rounded-xl"></div>
                <div className="h-20 bg-slate-800/50 rounded-xl"></div>
              </div>
              <div className="h-32 bg-slate-800/50 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-6 bg-slate-800/50 rounded w-32"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-800/50 rounded-xl"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-yellow-500/8 to-amber-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-500/5 to-yellow-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <ToastContainer />
      
      <div className="relative max-w-6xl mx-auto">
        <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 rounded-3xl border border-amber-400/30 shadow-2xl shadow-amber-500/20 p-10 relative overflow-hidden">
          
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 animate-pulse opacity-40"></div>
          <div className="absolute inset-[1px] rounded-3xl bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full shadow-2xl shadow-amber-500/50 mb-6">
                <svg className="w-8 h-8 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-3 tracking-tight">
                Update Role: {roleName}
              </h2>
              <p className="text-slate-400 text-lg">Modify existing role permissions and details</p>
              <div className="mt-2 text-sm text-amber-300">
                Role ID: {roleId} | {formData.permissions.length} of {totalPermissions} permissions selected
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Role Name *
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter role name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Role Code Name *
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      name="code_name"
                      placeholder="Enter role code (e.g., admin, manager)"
                      value={formData.code_name}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-amber-300 font-semibold text-sm uppercase tracking-wider flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  Description *
                </label>
                <div className="relative group">
                  <textarea
                    name="description"
                    placeholder="Enter detailed role description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    required
                    className="w-full px-6 py-4 rounded-xl bg-slate-900/60 border-2 border-slate-700/50 text-amber-100 placeholder-slate-500 focus:border-amber-400 focus:bg-slate-900/80 focus:shadow-lg focus:shadow-amber-500/20 transition-all duration-300 outline-none backdrop-blur-sm resize-none"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-amber-300">Permissions *</h3>
                      <p className="text-sm text-slate-400">Select permissions to assign to this role</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-slate-300">
                      <span className="text-amber-300 font-bold">{formData.permissions.length}</span> of <span className="font-bold">{totalPermissions}</span> selected
                    </div>
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="px-4 py-2 bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors text-sm"
                    >
                      {formData.permissions.length === totalPermissions ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                </div>
                
                {Object.keys(groupedPermissions).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(groupedPermissions).map(([moduleLabel, permissions]) => {
                      const modulePermissionIds = permissions.map(perm => perm.id);
                      const selectedCount = modulePermissionIds.filter(id => 
                        formData.permissions.includes(id)
                      ).length;
                      const allSelected = selectedCount === modulePermissionIds.length;
                      
                      return (
                        <div key={moduleLabel} className="space-y-4 bg-slate-900/30 rounded-2xl p-6 border border-slate-800/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-2 h-8 bg-gradient-to-b from-amber-400 to-yellow-500 rounded-full"></div>
                              <div>
                                <h4 className="text-xl font-semibold text-amber-200">{moduleLabel}</h4>
                                <p className="text-sm text-slate-400">
                                  {permissions.length} permission{permissions.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-sm text-slate-400">
                                <span className={selectedCount > 0 ? "text-amber-300 font-bold" : ""}>
                                  {selectedCount}
                                </span> / {permissions.length} selected
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSelectAllInModule(moduleLabel)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  allSelected
                                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-700'
                                }`}
                              >
                                {allSelected ? 'Deselect All' : 'Select All'}
                              </button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {permissions.map((perm) => (
                              <label
                                key={perm.id}
                                className="group relative cursor-pointer block"
                              >
                                <div className={`p-4 rounded-xl border-2 backdrop-blur-sm transition-all duration-300 ${
                                  formData.permissions.includes(perm.id)
                                    ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border-amber-400/60 shadow-lg shadow-amber-500/25'
                                    : 'bg-slate-900/40 border-slate-700/40 hover:border-amber-400/40 hover:bg-slate-900/60 hover:shadow-lg hover:shadow-amber-500/10'
                                }`}>
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-semibold text-amber-100 group-hover:text-amber-200 transition-colors">
                                          {perm.name}
                                        </span>
                                        <span className="text-xs px-2 py-1 bg-slate-800/50 rounded text-slate-400">
                                          {perm.module_name || moduleLabel}
                                        </span>
                                      </div>
                                      {perm.description && (
                                        <p className="text-xs text-slate-400 line-clamp-2">
                                          {perm.description}
                                        </p>
                                      )}
                                    </div>
                                    <div className={`relative w-5 h-5 rounded-full border-2 transition-all duration-300 flex-shrink-0 ml-2 ${
                                      formData.permissions.includes(perm.id)
                                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 border-amber-400 shadow-lg shadow-amber-500/50'
                                        : 'border-slate-500 bg-slate-800/50 group-hover:border-amber-400'
                                    }`}>
                                      {formData.permissions.includes(perm.id) && (
                                        <svg className="w-3 h-3 text-slate-900 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-xs text-slate-500 group-hover:text-slate-400 transition-colors font-mono bg-slate-900/30 rounded px-2 py-1 truncate">
                                    {perm.code_name}
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={formData.permissions.includes(perm.id)}
                                  onChange={() => handlePermissionToggle(perm.id)}
                                  className="sr-only"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-slate-900/40 rounded-xl border border-slate-800/50">
                    <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-slate-400">No permissions available</p>
                    <p className="text-sm text-slate-500 mt-2">Please configure permissions first</p>
                  </div>
                )}
              </div>

              <div className="flex justify-center space-x-6 pt-8">
                <button
                  type="button"
                  onClick={() => router.push('/RolesPage')}
                  className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300 shadow-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative px-12 py-4 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-slate-900 font-bold text-lg rounded-full shadow-2xl shadow-amber-500/50 hover:shadow-amber-500/70 transform hover:scale-105 transition-all duration-300 overflow-hidden ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative flex items-center space-x-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>{loading ? 'Updating...' : 'Update Role'}</span>
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-500 flex items-center justify-center space-x-2">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure Enterprise Role Management</span>
          </p>
        </div>
      </div>
    </div>
  );
}