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
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

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
                            <td className="px-6 py-4 text-sm text-slate-300">{order.customer_name}</td>
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
          </div>
        </div>
      </div>

      {/* Modal for managing order */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg shadow-xl p-8 w-full max-w-lg border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Manage Order {formatOrderId(selectedOrder.id)}</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-slate-400 text-sm">Customer</p>
                <p className="text-white font-medium">{selectedOrder.customer_name}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Current Status</p>
                <p className="text-white font-medium capitalize">{selectedOrder.status.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Amount</p>
                <p className="text-green-400 font-bold text-lg">AED {selectedOrder.total_price.toFixed(2)}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Update Status</label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleUpdateOrderStatus(selectedOrder.id, e.target.value);
                  }
                }}
                value=""
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A76F]"
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
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
