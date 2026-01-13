import { useState, useEffect } from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import ProductManagement from '../components/admin/ProductManagement';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  product_id: string;
  quantity: number;
  total_price: number;
  payment_method: string;
  status: string;
  created_at: string;
  updated_at: string;
  items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product?: {
      model: string;
      storage: string;
      color: string;
      condition: string;
      image_url?: string;
    };
  }>;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'reports'>('orders');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const formatOrderId = (id: string) => {
    // Full ID format: ord-[timestamp]-[random 6 chars]
    // Extract the random part (last segment after the final hyphen)
    const parts = id?.split('-');
    const randomPart = parts?.[parts.length - 1] || id || '000000';
    return `PZM-${randomPart}`;
  };

  const loadOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('adminToken');
      if (!authToken) {
        setError('Not authenticated');
        onLogout();
        return;
      }

      const response = await fetch('https://test.pzm.ae/api/orders', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          onLogout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to load orders');
      }

      const responseData = await response.json();
      setOrders(responseData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Not authenticated');
        onLogout();
        return;
      }

      const response = await fetch(`https://test.pzm.ae/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      await response.json();
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      setSelectedOrder(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    onLogout();
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    confirmed: orders.filter((o) => o.status === 'confirmed').length,
    inProgress: orders.filter((o) => o.status === 'in_progress').length,
    readyForDelivery: orders.filter((o) => o.status === 'ready_for_delivery').length,
    shipped: orders.filter((o) => o.status === 'shipped').length,
    delivered: orders.filter((o) => o.status === 'delivered').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  };

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#00A76F] to-[#16a34a] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/images/Header/logo.svg" alt="PZM Logo" className="h-12" />
            <div>
              <h1 className="text-3xl font-bold">PZM Admin Panel</h1>
              <p className="text-green-100 text-sm mt-1">Manage your store efficiently</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#00A76F] to-[#16a34a] rounded-lg shadow-lg p-4 text-white">
            <p className="text-green-100 text-xs">Total Orders</p>
            <p className="text-3xl font-bold mt-2">{stats.total}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-yellow-100 text-xs">Pending</p>
            <p className="text-3xl font-bold mt-2">{stats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-blue-100 text-xs">Confirmed</p>
            <p className="text-3xl font-bold mt-2">{stats.confirmed}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-purple-100 text-xs">In Progress</p>
            <p className="text-3xl font-bold mt-2">{stats.inProgress}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-orange-100 text-xs">Ready</p>
            <p className="text-3xl font-bold mt-2">{stats.readyForDelivery}</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-indigo-100 text-xs">Shipped</p>
            <p className="text-3xl font-bold mt-2">{stats.shipped}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-green-100 text-xs">Delivered</p>
            <p className="text-3xl font-bold mt-2">{stats.delivered}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-4 text-white">
            <p className="text-red-100 text-xs">Cancelled</p>
            <p className="text-3xl font-bold mt-2">{stats.cancelled}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-slate-700">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[#00A76F] text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              📋 Orders Management
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'products'
                  ? 'bg-[#00A76F] text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              📱 Products Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'reports'
                  ? 'bg-[#00A76F] text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              📊 Monthly Reports
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'orders' && (
              <div>
                {/* Order Controls */}
                <div className="flex gap-4 mb-6">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Orders</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="ready_for_delivery">Ready for Delivery</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={loadOrders}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A76F] hover:bg-[#16a34a] text-white rounded-lg transition-colors font-medium"
                  >
                    <RefreshCw size={20} />
                    Refresh
                  </button>
                </div>

                {/* Orders Table */}
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">Loading orders...</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-slate-400">No orders found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Order ID</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Customer</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Amount</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Status</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Date</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {paginatedOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-slate-300">{formatOrderId(order.id)}</td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-[#00A76F] hover:text-[#16a34a] font-medium transition-colors text-left"
                              >
                                {order.customer_name}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-green-400">
                              AED {order.total_price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  order.status === 'pending'
                                    ? 'bg-yellow-500/20 text-yellow-300'
                                    : order.status === 'confirmed'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : order.status === 'in_progress'
                                    ? 'bg-purple-500/20 text-purple-300'
                                    : order.status === 'ready_for_delivery'
                                    ? 'bg-orange-500/20 text-orange-300'
                                    : order.status === 'shipped'
                                    ? 'bg-indigo-500/20 text-indigo-300'
                                    : order.status === 'delivered'
                                    ? 'bg-green-500/20 text-green-300'
                                    : 'bg-red-500/20 text-red-300'
                                }`}
                              >
                                {order.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="text-[#00A76F] hover:text-[#16a34a] font-medium transition-colors"
                              >
                                Manage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-6 flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                          Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                          >
                            Previous
                          </button>
                          <div className="flex gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-2 rounded-lg transition-colors ${
                                  currentPage === page
                                    ? 'bg-[#00A76F] text-white'
                                    : 'bg-slate-700 text-white hover:bg-slate-600'
                                }`}
                              >
                                {page}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'products' && (
              <ProductManagement token={localStorage.getItem('adminToken') || ''} />
            )}

            {activeTab === 'reports' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Monthly Reports</h2>
                
                {/* Month Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-300 mb-3">Select Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A76F]"
                  />
                </div>

                {/* Monthly Report Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {(() => {
                    const [year, month] = selectedMonth.split('-');
                    const monthOrders = orders.filter(order => {
                      const orderDate = new Date(order.created_at);
                      return orderDate.getFullYear() === parseInt(year) && 
                             (orderDate.getMonth() + 1).toString().padStart(2, '0') === month;
                    });

                    const totalRevenue = monthOrders.reduce((sum, order) => sum + order.total_price, 0);
                    const deliveredOrders = monthOrders.filter(o => o.status === 'delivered').length;
                    const pendingOrders = monthOrders.filter(o => o.status === 'pending').length;
                    const averageOrderValue = monthOrders.length > 0 ? totalRevenue / monthOrders.length : 0;

                    return (
                      <>
                        <div className="bg-gradient-to-br from-[#00A76F] to-[#16a34a] rounded-lg shadow-lg p-6 text-white">
                          <p className="text-green-100 text-sm font-medium mb-2">Total Orders</p>
                          <p className="text-4xl font-bold">{monthOrders.length}</p>
                          <p className="text-xs text-green-100 mt-2">In {new Date(selectedMonth + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' })}</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                          <p className="text-blue-100 text-sm font-medium mb-2">Total Revenue</p>
                          <p className="text-4xl font-bold">AED {totalRevenue.toFixed(2)}</p>
                          <p className="text-xs text-blue-100 mt-2">Monthly earnings</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                          <p className="text-green-100 text-sm font-medium mb-2">Delivered Orders</p>
                          <p className="text-4xl font-bold">{deliveredOrders}</p>
                          <p className="text-xs text-green-100 mt-2">{monthOrders.length > 0 ? ((deliveredOrders / monthOrders.length) * 100).toFixed(1) : 0}% completion</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                          <p className="text-purple-100 text-sm font-medium mb-2">Average Order Value</p>
                          <p className="text-4xl font-bold">AED {averageOrderValue.toFixed(2)}</p>
                          <p className="text-xs text-purple-100 mt-2">Per order</p>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Detailed Monthly Orders Table */}
                <div className="bg-slate-700 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-slate-600">
                    <h3 className="text-xl font-bold text-white">Orders in {new Date(selectedMonth + '-01').toLocaleString('en-US', { month: 'long', year: 'numeric' })}</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-600">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Order ID</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Customer</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Amount</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Status</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Date</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-slate-200">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-600">
                        {(() => {
                          const [year, month] = selectedMonth.split('-');
                          const monthOrders = orders.filter(order => {
                            const orderDate = new Date(order.created_at);
                            return orderDate.getFullYear() === parseInt(year) && 
                                   (orderDate.getMonth() + 1).toString().padStart(2, '0') === month;
                          });

                          return monthOrders.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                No orders found for this month
                              </td>
                            </tr>
                          ) : (
                            monthOrders.map((order) => (
                              <tr key={order.id} className="hover:bg-slate-700/50 transition-colors">
                                <td className="px-6 py-4 text-sm font-mono text-slate-300">{formatOrderId(order.id)}</td>
                                <td className="px-6 py-4 text-sm">
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="text-[#00A76F] hover:text-[#16a34a] font-medium transition-colors"
                                  >
                                    {order.customer_name}
                                  </button>
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-green-400">
                                  AED {order.total_price.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                      order.status === 'pending'
                                        ? 'bg-yellow-500/20 text-yellow-300'
                                        : order.status === 'confirmed'
                                        ? 'bg-blue-500/20 text-blue-300'
                                        : order.status === 'in_progress'
                                        ? 'bg-purple-500/20 text-purple-300'
                                        : order.status === 'ready_for_delivery'
                                        ? 'bg-orange-500/20 text-orange-300'
                                        : order.status === 'shipped'
                                        ? 'bg-indigo-500/20 text-indigo-300'
                                        : order.status === 'delivered'
                                        ? 'bg-green-500/20 text-green-300'
                                        : 'bg-red-500/20 text-red-300'
                                    }`}
                                  >
                                    {order.status.replace(/_/g, ' ')}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-400">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="text-[#00A76F] hover:text-[#16a34a] font-medium transition-colors"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sliding Side Panel for Order Details */}
      {selectedOrder && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />
          
          {/* Side Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-slate-800 shadow-2xl z-50 overflow-y-auto transform transition-transform">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">Order Details</h2>
                  <p className="text-[#00A76F] font-mono text-lg">{formatOrderId(selectedOrder.id)}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-white transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Client Information Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#00A76F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Client Information
                </h3>
                <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-slate-400 text-sm mb-1 font-medium">Full Name</p>
                      <p className="text-white text-lg font-semibold">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1 font-medium">Phone Number</p>
                      <p className="text-white text-lg font-semibold">{selectedOrder.customer_phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1 font-medium">Email Address</p>
                    <p className="text-white text-lg font-semibold break-all">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1 font-medium">Delivery Address</p>
                    <p className="text-white text-lg leading-relaxed">{selectedOrder.customer_address}</p>
                  </div>
                </div>
              </div>

              {/* Order Information Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#00A76F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Information
                </h3>
                <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-slate-400 text-sm mb-1 font-medium">Order Date</p>
                      <p className="text-white text-lg">{new Date(selectedOrder.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1 font-medium">Payment Method</p>
                      <p className="text-white text-lg capitalize">{selectedOrder.payment_method}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-slate-400 text-sm mb-1 font-medium">Current Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          selectedOrder.status === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : selectedOrder.status === 'confirmed'
                            ? 'bg-blue-500/20 text-blue-300'
                            : selectedOrder.status === 'in_progress'
                            ? 'bg-purple-500/20 text-purple-300'
                            : selectedOrder.status === 'ready_for_delivery'
                            ? 'bg-orange-500/20 text-orange-300'
                            : selectedOrder.status === 'shipped'
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : selectedOrder.status === 'delivered'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {selectedOrder.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1 font-medium">Total Amount</p>
                      <p className="text-[#00A76F] font-bold text-2xl">AED {selectedOrder.total_price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Section */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#00A76F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Order Items ({selectedOrder.items.length})
                  </h3>
                  <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
                    {selectedOrder.items.map((item, index) => (
                      <div key={item.id} className="border-b border-slate-700 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            {item.product && (
                              <>
                                <h4 className="text-white font-semibold text-lg">{item.product.model}</h4>
                                <div className="grid grid-cols-2 gap-3 mt-2 text-sm">
                                  <div>
                                    <span className="text-slate-400">Storage:</span>
                                    <span className="ml-2 text-white font-medium">{item.product.storage}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Color:</span>
                                    <span className="ml-2 text-white font-medium">{item.product.color}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Condition:</span>
                                    <span className="ml-2 text-white font-medium">{item.product.condition === 'new' ? '✨ Brand New' : '📱 Used'}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Quantity:</span>
                                    <span className="ml-2 text-white font-medium">{item.quantity}</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-slate-400 text-sm">Unit Price</p>
                            <p className="text-[#00A76F] font-bold text-lg">AED {item.unit_price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-slate-600/50">
                          <span className="text-slate-400">Subtotal ({item.quantity} item{item.quantity > 1 ? 's' : ''}):</span>
                          <span className="text-white font-semibold text-lg">AED {item.subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update Status Section */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#00A76F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Update Order Status
                </h3>
                <div className="bg-slate-900/50 rounded-lg p-6">
                  <label className="block text-sm font-medium text-slate-300 mb-3">Select New Status</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleUpdateOrderStatus(selectedOrder.id, e.target.value);
                      }
                    }}
                    value=""
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A76F] text-base"
                  >
                    <option value="">Select new status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="ready_for_delivery">Ready for Delivery</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <p className="text-slate-400 text-sm mt-3">Selecting a status will automatically update the order and send notifications.</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition-colors text-lg"
              >
                Close Panel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
