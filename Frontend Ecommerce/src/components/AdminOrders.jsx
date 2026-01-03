'use client';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AxiosInstance from "@/components/AxiosInstance";
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/components/AuthContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Orders = () => {
  const router = useRouter();
  const { permissions = {} } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const pdfRefs = useRef({});
  const [refreshKey, setRefreshKey] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    limit: 10,
    total_pages: 1,
    count: 0,
    next: false,
    previous: false
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const { current_page, limit } = pagination;
        const res = await AxiosInstance.get('/api/myapp/v1/order/', {
          params: {
            page: current_page,
            limit: limit,
            search: searchTerm
          }
        });
        
        if (res?.data?.data) {
          // Backend returns orders directly in data array
          setOrders(res.data.data || []);
          
          // Update pagination based on response
          const totalCount = res.data.count || 0;
          const calculatedTotalPages = Math.ceil(totalCount / limit);
          
          setPagination(prev => ({
            ...prev,
            count: totalCount,
            total_pages: calculatedTotalPages,
            next: current_page < calculatedTotalPages,
            previous: current_page > 1,
            current_page: current_page,
            limit: limit
          }));
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders', {
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

    fetchOrders();
  }, [pagination.current_page, pagination.limit, searchTerm, refreshKey]);


  const deleteOrder = async (id) => {
    try {
      await AxiosInstance.delete(`/api/myapp/v1/order/?id=${id}`);
      setRefreshKey(prev => !prev);
      toast.success('Order deleted successfully', {
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
      toast.error('Error deleting order', {
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

  const updateOrder = (orderId) => {
    router.push(`/adminupdateorder?orderid=${orderId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.total_pages) {
      setPagination(prev => ({ ...prev, current_page: newPage }));
    }
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({ 
      ...prev, 
      limit: newLimit,
      current_page: 1
    }));
  };

  const handleDownloadPdf = async (orderId) => {
    const element = pdfRefs.current[orderId];
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`order_${orderId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF', {
        position: "top-center",
        autoClose: 2000,
      });
    }
  };

  const handlePrint = (orderId) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Order #${orderId}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          ${pdfRefs.current[orderId].innerHTML}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!permissions.read_order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl text-amber-400 mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">
            You don't have permission to view Orders. Please contact your administrator.
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
            <h1 className="text-4xl font-light text-white mb-2">Orders Management</h1>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-400 to-amber-600 mb-1"></div>
            <p className="text-gray-400 text-sm">Manage and track customer orders</p>
          </div>
        </div>
        
        {/* Stats and Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-gray-800/50 p-4 rounded-xl gap-4">
          {permissions.create_order && (     
            <button
              className="px-6 py-3 bg-transparent border border-amber-500 text-amber-500 font-medium text-sm leading-tight uppercase rounded-full hover:bg-amber-500 hover:text-black focus:outline-none focus:ring-0 transition duration-150 ease-in-out transform hover:scale-105 flex items-center"
              onClick={() => router.push('/adminaddorder')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Order
            </button>
          )}

          <div className="text-amber-400 font-light">
            Showing {orders.length} of {pagination.count} orders
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder-gray-400 transition duration-300"
              />
            </div>
            
            <div className="flex gap-2 items-center">
              <select 
                value={pagination.limit}
                onChange={handleLimitChange}
                className="bg-gray-700 text-white rounded-full px-3 py-2 border border-gray-600 focus:outline-none focus:ring-amber-500"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="30">30 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            {[...Array(pagination.limit)].map((_, index) => (
              <div key={index} className="animate-pulse bg-gray-800 rounded-xl p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-700 rounded w-32"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-700 rounded w-16 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Orders List */}
        {!isLoading && (
          <>
            {orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-gray-800/50 rounded-xl shadow-lg overflow-hidden">
                    {/* Hidden PDF content */}
                    <div style={{ position: 'absolute', left: '-9999px' }}>
                      <div
                        ref={(el) => (pdfRefs.current[order.id] = el)}
                        className="bg-white p-6 text-black"
                        style={{ width: '210mm', minHeight: '297mm' }}
                      >
                        <h1 className="text-2xl font-bold mb-4">Order #{order.id}</h1>
                        <div className="mb-6">
                          <h2 className="text-xl font-semibold border-b pb-2 mb-2">Customer Details</h2>
                          <p>Name: {order.customer_name || 'N/A'}</p>
                          <p>Email: {order.customer_email || 'N/A'}</p>
                          <p>Phone: {order.customer_phone || 'N/A'}</p>
                        </div>
                        <div className="mb-6">
                          <h2 className="text-xl font-semibold border-b pb-2 mb-2">Delivery Info</h2>
                          <p>Address: {order.delivery_address || 'N/A'}</p>
                          <p>City: {order.city || 'N/A'}</p>
                          <p>Delivery Date: {formatDate(order.delivery_date)}</p>
                        </div>
                        <div className="mb-6">
                          <h2 className="text-xl font-semibold border-b pb-2 mb-2">Payment Info</h2>
                          <p>Method: {order.payment_method || 'N/A'}</p>
                          <p>Total Bill: PKR {order.bill || order.total_amount || '0'}</p>
                          <p>Payment Status: {order.payment_status ? 'Paid' : 'Unpaid'}</p>
                          <p>Order Status: {order.status}</p>
                        </div>
                        <div className="mb-6">
                          <h2 className="text-xl font-semibold border-b pb-2 mb-2">Order Items ({order.items_count || 0})</h2>
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-200">
                                <th className="border p-2">Item ID</th>
                                <th className="border p-2">Product</th>
                                <th className="border p-2">Type</th>
                                <th className="border p-2">Unit Price</th>
                                <th className="border p-2">Quantity</th>
                                <th className="border p-2">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.order_details?.map((item, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                                  <td className="border p-2">{item.id}</td>
                                  <td className="border p-2">{item.product_name}</td>
                                  <td className="border p-2">{item.product_type}</td>
                                  <td className="border p-2">PKR {item.unit_price}</td>
                                  <td className="border p-2">{item.quantity}</td>
                                  <td className="border p-2">PKR {item.total_price}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-8 text-right">
                          <p className="font-bold text-lg">Total Amount: PKR {order.total_amount || order.bill}</p>
                          <p className="mt-4">Generated on: {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Visible Order Card */}
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-semibold text-white">Order #{order.id}</h2>
                          <p className="text-gray-400 text-sm">
                            Created: {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.status === 'pending' ? 'bg-yellow-500 text-black' :
                            order.status === 'completed' ? 'bg-green-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {order.status}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.payment_status ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          }`}>
                            {order.payment_status ? 'Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-2">Customer Details</h3>
                          <p className="text-gray-300">Name: {order.customer_name || order.customer_name_display || 'N/A'}</p>
                          <p className="text-gray-300">Email: {order.customer_email || 'N/A'}</p>
                          <p className="text-gray-300">Phone: {order.customer_phone || 'N/A'}</p>
                        </div>

                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-2">Delivery Info</h3>
                          <p className="text-gray-300">Address: {order.delivery_address || 'N/A'}</p>
                          <p className="text-gray-300">City: {order.city || 'N/A'}</p>
                          <p className="text-gray-300">Delivery Date: {formatDate(order.delivery_date)}</p>
                          {order.rider_name && <p className="text-gray-300">Rider: {order.rider_name}</p>}
                        </div>

                        <div className="bg-gray-700 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-white mb-2">Payment Info</h3>
                          <p className="text-gray-300">Method: {order.payment_method || 'N/A'}</p>
                          <p className="text-gray-300">Bill Amount: PKR {order.bill || '0'}</p>
                          <p className="text-gray-300">Total Amount: PKR {order.total_amount || '0'}</p>
                          <p className="text-gray-300">Items: {order.items_count || 0}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-white mb-3">Order Items</h3>
                        <div className="overflow-x-auto">
                          <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
                            <thead className="bg-gray-600">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Item ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Product</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Unit Price</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Quantity</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-600">
                              {order.order_details?.map((item, index) => (
                                <tr key={index}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{item.id}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{item.product_name}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      item.product_type === 'product' ? 'bg-blue-500' : 'bg-purple-500'
                                    }`}>
                                      {item.product_type}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">PKR {item.unit_price}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{item.quantity}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">PKR {item.total_price}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-3">
                        <button
                          onClick={() => handleDownloadPdf(order.id)}
                          className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-blue-600/30 to-blue-700/20 border border-blue-500/30 text-blue-300 rounded-lg hover:from-blue-600/40 hover:to-blue-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="relative z-10 font-medium">Download PDF</span>
                          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        </button>

                        <button
                          onClick={() => handlePrint(order.id)}
                          className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-purple-600/30 to-purple-700/20 border border-purple-500/30 text-purple-300 rounded-lg hover:from-purple-600/40 hover:to-purple-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20"
                        >
                          <span className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          <span className="relative z-10 font-medium">Print</span>
                          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                        </button>

                        {permissions.update_order && (
                          <button
                            onClick={() => updateOrder(order.id)}
                            className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-amber-600/30 to-amber-700/20 border border-amber-500/30 text-amber-300 rounded-lg hover:from-amber-600/40 hover:to-amber-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="relative z-10 font-medium">Edit Order</span>
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          </button>
                        )}

                        {permissions.delete_order && (
                          <button
                            onClick={() => deleteOrder(order.id)}
                            className="relative overflow-hidden px-4 py-2 bg-gradient-to-r from-red-600/30 to-red-700/20 border border-red-500/30 text-red-300 rounded-lg hover:from-red-600/40 hover:to-red-700/30 transition-all duration-300 group flex items-center shadow-lg shadow-red-500/10 hover:shadow-red-500/20"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="relative z-10 font-medium">Delete</span>
                            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-400 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-12 w-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-white mb-2">No orders found</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  {searchTerm ? "No orders match your search." : "There are no orders to display."}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Enhanced Pagination */}
        {pagination.total_pages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center mt-16 gap-4">
            <div className="text-gray-400 text-sm">
              Page {pagination.current_page} of {pagination.total_pages} • Total {pagination.count} orders
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.current_page === 1}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                aria-label="First page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.previous}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                  let pageNum;
                  if (pagination.total_pages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.current_page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.current_page >= pagination.total_pages - 2) {
                    pageNum = pagination.total_pages - 4 + i;
                  } else {
                    pageNum = pagination.current_page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-full text-sm transition-colors ${
                        pagination.current_page === pageNum
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
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.next}
                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.total_pages)}
                disabled={pagination.current_page === pagination.total_pages}
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

export default Orders;






// 'use client';
// import React, { useEffect, useState, useContext, useRef } from 'react';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import AxiosInstance from "@/components/AxiosInstance";
// import { useRouter } from 'next/navigation';
// import { AuthContext } from '@/components/AuthContext';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

// const Orders = () => {
//   const router = useRouter();
//   const { permissions = {} } = useContext(AuthContext);
//   const [orders, setOrders] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const pdfRefs = useRef({});
//   const [refreshKey, setRefreshKey] = useState(false);
//   const [pagination, setPagination] = useState({
//     current_page: 1,
//     limit: 10,
//     total_pages: 1,
//     count: 0,
//     next: false,
//     previous: false
//   });

//   useEffect(() => {
//     const fetchOrders = async () => {
//       try {
//         setIsLoading(true);
//         const { current_page, limit } = pagination;
//         const res = await AxiosInstance.get('/api/myapp/v1/order/', {
//           params: {
//             page: current_page,
//             limit: limit,
//             search: searchTerm
//           }
//         });
        
//         if (res?.data?.data) {
//           setOrders(res.data.data || []);
          
//           const totalCount = res.data.count || 0;
//           const calculatedTotalPages = Math.ceil(totalCount / limit);
          
//           setPagination(prev => ({
//             ...prev,
//             count: totalCount,
//             total_pages: calculatedTotalPages,
//             next: current_page < calculatedTotalPages,
//             previous: current_page > 1,
//             current_page: current_page,
//             limit: limit
//           }));
//         }
//       } catch (error) {
//         console.error('Error fetching orders:', error);
//         toast.error('Failed to load orders', {
//           position: "top-center",
//           autoClose: 2000,
//           hideProgressBar: true,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           progress: undefined,
//           theme: "dark",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchOrders();
//   }, [pagination.current_page, pagination.limit, searchTerm, refreshKey]);

//   const deleteOrder = async (id) => {
//     try {
//       await AxiosInstance.delete(`/api/myapp/v1/order/?id=${id}`);
//       setRefreshKey(prev => !prev);
//       toast.success('Order deleted successfully', {
//         position: "top-center",
//         autoClose: 2000,
//         hideProgressBar: true,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "dark",
//       });
//     } catch (error) {
//       toast.error('Error deleting order', {
//         position: "top-center",
//         autoClose: 2000,
//         hideProgressBar: true,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//         theme: "dark",
//       });
//     }
//   };

//   const updateOrder = (orderId) => {
//     router.push(`/updateorderpage?orderid=${orderId}`);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const options = { year: 'numeric', month: 'short', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString(undefined, options);
//   };

//   const handleSearch = (e) => {
//     const value = e.target.value.toLowerCase();
//     setSearchTerm(value);
//     setPagination(prev => ({ ...prev, current_page: 1 }));
//   };

//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= pagination.total_pages) {
//       setPagination(prev => ({ ...prev, current_page: newPage }));
//     }
//   };

//   const handleLimitChange = (e) => {
//     const newLimit = parseInt(e.target.value);
//     setPagination(prev => ({ 
//       ...prev, 
//       limit: newLimit,
//       current_page: 1
//     }));
//   };

//   const handleDownloadPdf = async (orderId) => {
//     const element = pdfRefs.current[orderId];
//     if (!element) return;

//     try {
//       const canvas = await html2canvas(element, { scale: 2 });
//       const imgData = canvas.toDataURL('image/png');
//       const pdf = new jsPDF('p', 'mm', 'a4');
//       const imgProps = pdf.getImageProperties(imgData);
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

//       pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
//       pdf.save(`order_${orderId}.pdf`);
//     } catch (error) {
//       console.error('Error generating PDF:', error);
//       toast.error('Failed to generate PDF', {
//         position: "top-center",
//         autoClose: 2000,
//       });
//     }
//   };

//   const handlePrint = (orderId) => {
//     const printWindow = window.open('', '_blank');
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Order #${orderId}</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 20px; }
//             h1 { color: #333; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//             th { background-color: #f2f2f2; }
//             .section { margin-bottom: 30px; }
//             .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
//           </style>
//         </head>
//         <body>
//           ${pdfRefs.current[orderId].innerHTML}
//           <script>
//             window.onload = function() {
//               window.print();
//               setTimeout(function() {
//                 window.close();
//               }, 1000);
//             };
//           </script>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   if (!permissions.read_order) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
//         <div className="text-center p-10 max-w-md backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl">
//           <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/20 flex items-center justify-center">
//             <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//             </svg>
//           </div>
//           <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-4">
//             Access Denied
//           </h2>
//           <p className="text-gray-400 mb-8 leading-relaxed">
//             You don't have permission to view Orders. Please contact your administrator.
//           </p>
//           <button 
//             onClick={() => router.push('/')}
//             className="group relative px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-semibold text-white shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300 hover:scale-105"
//           >
//             <span className="relative z-10">Return to Dashboard</span>
//             <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//           </button>
//         </div>
//         <ToastContainer position="top-right" autoClose={2000} />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
//       <ToastContainer 
//         position="top-center"
//         autoClose={2000}
//         hideProgressBar
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="dark"
//       />
      
//       <div className="max-w-7xl mx-auto">
//         {/* Luxury Header Section */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
//           <div className="relative">
//             <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-amber-600/20 blur-2xl rounded-full"></div>
//             <h1 className="relative text-5xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent mb-3">
//               Orders Management
//             </h1>
//             <div className="flex items-center gap-3 mb-2">
//               <div className="w-24 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-transparent rounded-full"></div>
//               <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
//             </div>
//             <p className="relative text-gray-400 text-sm font-light tracking-wide">
//               Manage and track premium customer orders
//             </p>
//           </div>
//         </div>
        
//         {/* Premium Stats and Search Bar */}
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 shadow-2xl gap-6">
//           {permissions.create_order && (     
//             <button
//               className="group relative px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-semibold text-white shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300 hover:scale-105 flex items-center overflow-hidden"
//               onClick={() => router.push('/addorderpage')}
//             >
//               <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 relative z-10 group-hover:rotate-90 transition-transform duration-300" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
//               </svg>
//               <span className="relative z-10">Add Order</span>
//             </button>
//           )}

//           <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-xl border border-amber-500/20">
//             <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
//             <span className="text-amber-400 font-semibold text-sm">
//               {orders.length} of {pagination.count} orders
//             </span>
//           </div>
          
//           <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/3">
//             <div className="relative w-full group">
//               <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-300"></div>
//               <div className="relative flex items-center">
//                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//                   <svg className="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
//                   </svg>
//                 </div>
//                 <input
//                   type="text"
//                   placeholder="Search orders..."
//                   value={searchTerm}
//                   onChange={handleSearch}
//                   className="w-full pl-12 pr-4 py-3.5 backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-white placeholder-gray-500 transition duration-300"
//                 />
//               </div>
//             </div>
            
//             <div className="flex gap-2 items-center">
//               <div className="relative">
//                 <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl opacity-20 blur"></div>
//                 <select 
//                   value={pagination.limit}
//                   onChange={handleLimitChange}
//                   className="relative backdrop-blur-xl bg-white/5 text-white rounded-xl px-4 py-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
//                 >
//                   <option value="10" className="bg-slate-900">10 per page</option>
//                   <option value="20" className="bg-slate-900">20 per page</option>
//                   <option value="30" className="bg-slate-900">30 per page</option>
//                   <option value="50" className="bg-slate-900">50 per page</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Loading State */}
//         {isLoading && (
//           <div className="space-y-6">
//             {[...Array(pagination.limit)].map((_, index) => (
//               <div key={index} className="animate-pulse backdrop-blur-xl bg-white/5 rounded-2xl p-6 border border-white/10">
//                 <div className="flex items-center space-x-4 mb-4">
//                   <div className="h-12 w-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full"></div>
//                   <div className="space-y-2 flex-1">
//                     <div className="h-4 bg-white/10 rounded-full w-1/3"></div>
//                     <div className="h-3 bg-white/5 rounded-full w-1/4"></div>
//                   </div>
//                 </div>
//                 <div className="h-4 bg-white/10 rounded-full w-20 mb-4"></div>
//                 <div className="space-y-2">
//                   <div className="h-3 bg-white/5 rounded-full w-full"></div>
//                   <div className="h-3 bg-white/5 rounded-full w-5/6"></div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Orders List */}
//         {!isLoading && (
//           <>
//             {orders.length > 0 ? (
//               <div className="space-y-8">
//                 {orders.map((order) => (
//                   <div key={order.id} className="group relative">
//                     {/* Luxury glow effect */}
//                     <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-amber-600/20 to-amber-500/20 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition duration-500"></div>
                    
//                     <div className="relative backdrop-blur-xl bg-white/5 rounded-3xl shadow-2xl overflow-hidden border border-white/10 group-hover:border-amber-500/30 transition-all duration-500">
//                       {/* Hidden PDF content */}
//                       <div style={{ position: 'absolute', left: '-9999px' }}>
//                         <div
//                           ref={(el) => (pdfRefs.current[order.id] = el)}
//                           className="bg-white p-6 text-black"
//                           style={{ width: '210mm', minHeight: '297mm' }}
//                         >
//                           <h1 className="text-2xl font-bold mb-4">Order #{order.id}</h1>
//                           <div className="mb-6">
//                             <h2 className="text-xl font-semibold border-b pb-2 mb-2">Customer Details</h2>
//                             <p>Name: {order.customer_name || 'N/A'}</p>
//                             <p>Email: {order.customer_email || 'N/A'}</p>
//                             <p>Phone: {order.customer_phone || 'N/A'}</p>
//                           </div>
//                           <div className="mb-6">
//                             <h2 className="text-xl font-semibold border-b pb-2 mb-2">Delivery Info</h2>
//                             <p>Address: {order.delivery_address || 'N/A'}</p>
//                             <p>City: {order.city || 'N/A'}</p>
//                             <p>Delivery Date: {formatDate(order.delivery_date)}</p>
//                           </div>
//                           <div className="mb-6">
//                             <h2 className="text-xl font-semibold border-b pb-2 mb-2">Payment Info</h2>
//                             <p>Method: {order.payment_method || 'N/A'}</p>
//                             <p>Total Bill: PKR {order.bill || order.total_amount || '0'}</p>
//                             <p>Payment Status: {order.payment_status ? 'Paid' : 'Unpaid'}</p>
//                             <p>Order Status: {order.status}</p>
//                           </div>
//                           <div className="mb-6">
//                             <h2 className="text-xl font-semibold border-b pb-2 mb-2">Order Items ({order.items_count || 0})</h2>
//                             <table className="w-full border-collapse">
//                               <thead>
//                                 <tr className="bg-gray-200">
//                                   <th className="border p-2">Item ID</th>
//                                   <th className="border p-2">Product</th>
//                                   <th className="border p-2">Type</th>
//                                   <th className="border p-2">Unit Price</th>
//                                   <th className="border p-2">Quantity</th>
//                                   <th className="border p-2">Total</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {order.order_details?.map((item, index) => (
//                                   <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
//                                     <td className="border p-2">{item.id}</td>
//                                     <td className="border p-2">{item.product_name}</td>
//                                     <td className="border p-2">{item.product_type}</td>
//                                     <td className="border p-2">PKR {item.unit_price}</td>
//                                     <td className="border p-2">{item.quantity}</td>
//                                     <td className="border p-2">PKR {item.total_price}</td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                           <div className="mt-8 text-right">
//                             <p className="font-bold text-lg">Total Amount: PKR {order.total_amount || order.bill}</p>
//                             <p className="mt-4">Generated on: {new Date().toLocaleDateString()}</p>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Visible Order Card */}
//                       <div className="p-8">
//                         <div className="flex flex-col md:flex-row justify-between mb-6">
//                           <div>
//                             <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
//                               Order #{order.id}
//                             </h2>
//                             <p className="text-gray-400 text-sm flex items-center gap-2">
//                               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                               </svg>
//                               Created: {formatDate(order.created_at)}
//                             </p>
//                           </div>
//                           <div className="mt-4 md:mt-0 flex gap-3">
//                             {/* Luxury Status Badges */}
//                             <div className="relative group/badge">
//                               <div className={`absolute -inset-0.5 rounded-xl blur opacity-50 ${
//                                 order.status === 'pending' ? 'bg-yellow-500' :
//                                 order.status === 'completed' ? 'bg-green-500' :
//                                 'bg-gray-500'
//                               }`}></div>
//                               <span className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all duration-300 ${
//                                 order.status === 'pending' 
//                                   ? 'bg-yellow-500 text-black' :
//                                 order.status === 'completed' 
//                                   ? 'bg-green-500 text-white' :
//                                   'bg-gray-500 text-white'
//                               }`}>
//                                 <span className={`w-2 h-2 rounded-full animate-pulse ${
//                                   order.status === 'pending' ? 'bg-yellow-900' :
//                                   order.status === 'completed' ? 'bg-green-200' :
//                                   'bg-slate-200'
//                                 }`}></span>
//                                 {order.status}
//                               </span>
//                             </div>
                            
//                             <div className="relative group/badge">
//                               <div className={`absolute -inset-0.5 rounded-xl blur opacity-50 ${
//                                 order.payment_status 
//                                   ? 'bg-green-500' 
//                                   : 'bg-red-500'
//                               }`}></div>
//                               <span className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all duration-300 ${
//                                 order.payment_status 
//                                   ? 'bg-green-500 text-white' 
//                                   : 'bg-red-500 text-white'
//                               }`}>
//                                 {order.payment_status ? (
//                                   <>
//                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
//                                     </svg>
//                                     Paid
//                                   </>
//                                 ) : (
//                                   <>
//                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                                     </svg>
//                                     Unpaid
//                                   </>
//                                 )}
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//                           <div className="relative group/card">
//                             <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-hover/card:opacity-100 transition duration-300"></div>
//                             <div className="relative backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all duration-300">
//                               <div className="flex items-center gap-3 mb-4">
//                                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
//                                   <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                                   </svg>
//                                 </div>
//                                 <h3 className="text-lg font-semibold text-white">Customer Details</h3>
//                               </div>
//                               <div className="space-y-2 text-sm">
//                                 <p className="text-gray-300 flex items-center gap-2">
//                                   <span className="text-gray-500">Name:</span>
//                                   <span className="font-medium">{order.customer_name || order.customer_name_display || 'N/A'}</span>
//                                 </p>
//                                 <p className="text-gray-300 flex items-center gap-2">
//                                   <span className="text-gray-500">Email:</span>
//                                   <span className="font-medium">{order.customer_email || 'N/A'}</span>
//                                 </p>
//                                 <p className="text-gray-300 flex items-center gap-2">
//                                   <span className="text-gray-500">Phone:</span>
//                                   <span className="font-medium">{order.customer_phone || 'N/A'}</span>
//                                 </p>
//                               </div>
//                             </div>
//                           </div>

//                           <div className="relative group/card">
//                             <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover/card:opacity-100 transition duration-300"></div>
//                             <div className="relative backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all duration-300">
//                               <div className="flex items-center gap-3 mb-4">
//                                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
//                                   <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                                   </svg>
//                                 </div>
//                                 <h3 className="text-lg font-semibold text-white">Delivery Info</h3>
//                               </div>
//                               <div className="space-y-2 text-sm">
//                                 <p className="text-gray-300 flex items-center gap-2">
//                                   <span className="text-gray-500">Address:</span>
//                                   <span className="font-medium">{order.delivery_address || 'N/A'}</span>
//                                 </p>
//                                 <p className="text-gray-300 flex items-center gap-2">
//                                   <span className="text-gray-500">City:</span>
//                                   <span className="font-medium">{order.city || 'N/A'}</span>
//                                 </p>
//                                 <p className="text-gray-300 flex items-center gap-2">
//                                   <span className="text-gray-500">Date:</span>
//                                   <span className="font-medium">{formatDate(order.delivery_date)}</span>
//                                 </p>
//                                 {order.rider_name && (
//                                   <p className="text-gray-300 flex items-center gap-2">
//                                     <span className="text-gray-500">Rider:</span>
//                                     <span className="font-medium">{order.rider_name}</span>
//                                   </p>
//                                 )}
//                               </div>
//                             </div>
//                           </div>

//                           <div className="relative group/card">
//                             <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur opacity-0 group-hover/card:opacity-100 transition duration-300"></div>
//                             <div className="relative backdrop-blur-xl bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all duration-300">
//                               <div className="flex items-center gap-3 mb-4">
//                                 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
//                                   <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//                                   </svg>
//                                 </div>
//                                 <h3 className="text-lg font-semibold text-white">Payment Info</h3>
//                               </div>
//                               <div className="space-y-2 text-sm">
//                                 <p className="text-gray-300 flex items-center gap-2">
//                                   <span className="text-gray-500">Method:</span>
//                                   <span className="font-medium">{order.payment_method || 'N/A'}</span>
//                                 </p>
//                                 <p className="text-gray-300 flex items-center gap-2">
//                                   <span className="text-gray-500">Bill:</span>
//                                   <span className="font-bold text-amber-400">PKR {order.bill || '0'}</span>
//                                 </p>
//                                 <p className="text-gray-300 flex items-center gap-2">
//                                   <span className="text-gray-500">Total:</span>
//                                   <span className="font-bold text-amber-400">PKR {order.total_amount || '0'}</span>
//                                 </p>
//                                 <p className="text-gray-300 flex items-center gap-2">
//                                   <span className="text-gray-500">Items:</span>
//                                   <span className="font-medium">{order.items_count || 0}</span>
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="mb-8">
//                           <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
//                             <div className="w-1 h-6 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
//                             Order Items
//                           </h3>
//                           <div className="overflow-x-auto">
//                             <div className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
//                               <table className="min-w-full">
//                                 <thead>
//                                   <tr className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-b border-white/10">
//                                     <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Item ID</th>
//                                     <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Product</th>
//                                     <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Type</th>
//                                     <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Unit Price</th>
//                                     <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Quantity</th>
//                                     <th className="px-6 py-4 text-left text-xs font-bold text-amber-400 uppercase tracking-wider">Total</th>
//                                   </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-white/5">
//                                   {order.order_details?.map((item, index) => (
//                                     <tr key={index} className="hover:bg-white/5 transition-colors duration-200">
//                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">{item.id}</td>
//                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">{item.product_name}</td>
//                                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                                         <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                                           item.product_type === 'product' 
//                                             ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/30' 
//                                             : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'
//                                         }`}>
//                                           {item.product_type}
//                                         </span>
//                                       </td>
//                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-semibold">PKR {item.unit_price}</td>
//                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-semibold">{item.quantity}</td>
//                                       <td className="px-6 py-4 whitespace-nowrap text-sm text-amber-400 font-bold">PKR {item.total_price}</td>
//                                     </tr>
//                                   ))}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Luxury Action Buttons */}
//                         <div className="flex flex-wrap justify-end gap-4">
//                           <button
//                             onClick={() => handleDownloadPdf(order.id)}
//                             className="group relative px-6 py-3 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 backdrop-blur-xl border border-blue-500/30 text-blue-300 rounded-xl hover:from-blue-600/30 hover:to-cyan-600/30 transition-all duration-300 hover:scale-105 flex items-center shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 overflow-hidden"
//                           >
//                             <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 relative z-10 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                             </svg>
//                             <span className="relative z-10 font-semibold">Download PDF</span>
//                           </button>

//                           <button
//                             onClick={() => handlePrint(order.id)}
//                             className="group relative px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30 text-purple-300 rounded-xl hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 hover:scale-105 flex items-center shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 overflow-hidden"
//                           >
//                             <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 relative z-10 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
//                             </svg>
//                             <span className="relative z-10 font-semibold">Print</span>
//                           </button>

//                           {permissions.update_order && (
//                             <button
//                               onClick={() => updateOrder(order.id)}
//                               className="group relative px-6 py-3 bg-gradient-to-r from-amber-600/20 to-orange-600/20 backdrop-blur-xl border border-amber-500/30 text-amber-300 rounded-xl hover:from-amber-600/30 hover:to-orange-600/30 transition-all duration-300 hover:scale-105 flex items-center shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 overflow-hidden"
//                             >
//                               <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 relative z-10 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                               </svg>
//                               <span className="relative z-10 font-semibold">Edit Order</span>
//                             </button>
//                           )}

//                           {permissions.delete_order && (
//                             <button
//                               onClick={() => deleteOrder(order.id)}
//                               className="group relative px-6 py-3 bg-gradient-to-r from-rose-600/20 to-red-600/20 backdrop-blur-xl border border-rose-500/30 text-rose-300 rounded-xl hover:from-rose-600/30 hover:to-red-600/30 transition-all duration-300 hover:scale-105 flex items-center shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 overflow-hidden"
//                             >
//                               <div className="absolute inset-0 bg-gradient-to-r from-rose-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 relative z-10 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                               </svg>
//                               <span className="relative z-10 font-semibold">Delete</span>
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-24">
//                 <div className="relative mx-auto w-32 h-32 mb-8">
//                   <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-full blur-2xl"></div>
//                   <div className="relative w-full h-full backdrop-blur-xl bg-white/5 rounded-full flex items-center justify-center border border-white/10">
//                     <svg className="h-16 w-16 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
//                     </svg>
//                   </div>
//                 </div>
//                 <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-3">
//                   No orders found
//                 </h3>
//                 <p className="text-gray-400 max-w-md mx-auto mb-8">
//                   {searchTerm ? "No orders match your search criteria." : "There are no orders to display at the moment."}
//                 </p>
//                 {searchTerm && (
//                   <button
//                     onClick={() => setSearchTerm('')}
//                     className="group relative px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl font-semibold text-white shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300 hover:scale-105"
//                   >
//                     <span className="relative z-10">Clear search</span>
//                     <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                   </button>
//                 )}
//               </div>
//             )}
//           </>
//         )}

//         {/* Premium Pagination */}
//         {pagination.total_pages > 1 && (
//           <div className="flex flex-col md:flex-row justify-between items-center mt-16 gap-6">
//             <div className="text-gray-400 text-sm backdrop-blur-xl bg-white/5 px-6 py-3 rounded-xl border border-white/10">
//               <span className="font-semibold text-amber-400">Page {pagination.current_page}</span> of {pagination.total_pages} • 
//               <span className="font-semibold text-amber-400"> {pagination.count}</span> total orders
//             </div>
            
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => handlePageChange(1)}
//                 disabled={pagination.current_page === 1}
//                 className="p-3 rounded-xl backdrop-blur-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-white border border-white/10 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/20 group"
//                 aria-label="First page"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-amber-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
//                 </svg>
//               </button>
              
//               <button
//                 onClick={() => handlePageChange(pagination.current_page - 1)}
//                 disabled={!pagination.previous}
//                 className="p-3 rounded-xl backdrop-blur-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-white border border-white/10 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/20 group"
//                 aria-label="Previous page"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-amber-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
//                 </svg>
//               </button>
              
//               <div className="flex items-center gap-2">
//                 {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
//                   let pageNum;
//                   if (pagination.total_pages <= 5) {
//                     pageNum = i + 1;
//                   } else if (pagination.current_page <= 3) {
//                     pageNum = i + 1;
//                   } else if (pagination.current_page >= pagination.total_pages - 2) {
//                     pageNum = pagination.total_pages - 4 + i;
//                   } else {
//                     pageNum = pagination.current_page - 2 + i;
//                   }
                  
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => handlePageChange(pageNum)}
//                       className={`relative w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden ${
//                         pagination.current_page === pageNum
//                           ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/50 scale-110'
//                           : 'backdrop-blur-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-amber-400 border border-white/10 hover:border-amber-500/30'
//                       }`}
//                       aria-label={`Page ${pageNum}`}
//                     >
//                       {pagination.current_page === pageNum && (
//                         <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 animate-pulse"></div>
//                       )}
//                       <span className="relative z-10">{pageNum}</span>
//                     </button>
//                   );
//                 })}
//               </div>
              
//               <button
//                 onClick={() => handlePageChange(pagination.current_page + 1)}
//                 disabled={!pagination.next}
//                 className="p-3 rounded-xl backdrop-blur-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-white border border-white/10 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/20 group"
//                 aria-label="Next page"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-amber-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                 </svg>
//               </button>
              
//               <button
//                 onClick={() => handlePageChange(pagination.total_pages)}
//                 disabled={pagination.current_page === pagination.total_pages}
//                 className="p-3 rounded-xl backdrop-blur-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 text-white border border-white/10 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/20 group"
//                 aria-label="Last page"
//               >
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:text-amber-400 transition-colors" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                   <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                 </svg>
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Orders;