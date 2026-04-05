import { useState, useEffect, useMemo } from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import ServiceRequestManagement from '../components/admin/ServiceRequestManagement';
import { buildApiUrl } from '../utils/siteConfig';

interface AdminDashboardProps {
  onLogout: () => void;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  notes?: string;
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

interface ReportServiceRequest {
  id: string;
  status: string;
  created_at: string;
}

type AdminOrderStatus = 'pending' | 'confirmed' | 'cancelled';
type AdminReportServiceStatus = 'pending' | 'confirmed' | 'cancelled';

const ADMIN_ORDER_STATUS_OPTIONS: Array<{ value: AdminOrderStatus; label: string }> = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Canceled' },
];

function normalizeOrderStatus(status: string): AdminOrderStatus {
  switch (status) {
    case 'confirmed':
    case 'in_progress':
    case 'ready_for_delivery':
    case 'shipped':
    case 'delivered':
      return 'confirmed';
    case 'cancelled':
      return 'cancelled';
    case 'pending':
    default:
      return 'pending';
  }
}

function formatAdminOrderStatus(status: string): string {
  const normalizedStatus = normalizeOrderStatus(status);

  switch (normalizedStatus) {
    case 'confirmed':
      return 'Confirmed';
    case 'cancelled':
      return 'Canceled';
    case 'pending':
    default:
      return 'Pending';
  }
}

function getOrderStatusBadgeClass(status: string): string {
  switch (normalizeOrderStatus(status)) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-700';
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-700';
    case 'cancelled':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function normalizeReportServiceStatus(status: string): AdminReportServiceStatus {
  switch (status) {
    case 'contacted':
    case 'quoted':
    case 'scheduled':
    case 'completed':
      return 'confirmed';
    case 'cancelled':
      return 'cancelled';
    case 'pending':
    default:
      return 'pending';
  }
}

function isInSelectedMonth(value: string, selectedMonth: string): boolean {
  const [year, month] = selectedMonth.split('-');
  const date = new Date(value);

  return (
    date.getFullYear() === Number.parseInt(year, 10) &&
    String(date.getMonth() + 1).padStart(2, '0') === month
  );
}

function formatMonthLabel(value: string): string {
  const date = new Date(`${value}-01T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

function formatDisplayLabel(value: string): string {
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reportRequests, setReportRequests] = useState<ReportServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'orders' | 'serviceRequests' | 'reports'>('orders');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const formatOrderId = (id: string) => {
    // Full ID format: ord-[timestamp]-[random 6 chars]
    // Extract the random part (last segment after the final hyphen)
    const parts = id?.split('-');
    const randomPart = parts?.[parts.length - 1] || id || '000000';
    return `PZM-${randomPart}`;
  };

  const loadReportRequests = async () => {
    setReportsLoading(true);

    try {
      const authToken = localStorage.getItem('adminToken');
      if (!authToken) {
        onLogout();
        return;
      }

      const response = await fetch(buildApiUrl('/service-requests'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          onLogout();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to load service requests for reports');
      }

      const responseData = await response.json();
      setReportRequests(responseData.data || []);
    } catch (err) {
      console.error(err);
      setReportRequests([]);
    } finally {
      setReportsLoading(false);
    }
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

      const response = await fetch(buildApiUrl('/orders'), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
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

      const response = await fetch(buildApiUrl(`/orders/${orderId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          onLogout();
          throw new Error('Session expired. Please login again.');
        }
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
    localStorage.removeItem('adminUser');
    onLogout();
  };

  useEffect(() => {
    loadOrders();
    loadReportRequests();
  }, []);

  const filteredOrders =
    statusFilter === 'all'
      ? orders
      : orders.filter((order) => normalizeOrderStatus(order.status) === statusFilter);

  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const stats = {
    total: orders.length,
    pending: orders.filter((order) => normalizeOrderStatus(order.status) === 'pending').length,
    confirmed: orders.filter((order) => normalizeOrderStatus(order.status) === 'confirmed').length,
    cancelled: orders.filter((order) => normalizeOrderStatus(order.status) === 'cancelled').length,
  };

  const monthLabel = useMemo(() => formatMonthLabel(selectedMonth), [selectedMonth]);

  const monthOrders = useMemo(
    () => orders.filter((order) => isInSelectedMonth(order.created_at, selectedMonth)),
    [orders, selectedMonth]
  );

  const monthRequests = useMemo(
    () => reportRequests.filter((request) => isInSelectedMonth(request.created_at, selectedMonth)),
    [reportRequests, selectedMonth]
  );

  const monthlyReport = useMemo(() => {
    const confirmedOrders = monthOrders.filter((order) => normalizeOrderStatus(order.status) === 'confirmed');
    const pendingOrders = monthOrders.filter((order) => normalizeOrderStatus(order.status) === 'pending');
    const cancelledOrders = monthOrders.filter((order) => normalizeOrderStatus(order.status) === 'cancelled');

    const confirmedRevenue = confirmedOrders.reduce((sum, order) => sum + order.total_price, 0);
    const pendingValue = pendingOrders.reduce((sum, order) => sum + order.total_price, 0);
    const cancelledValue = cancelledOrders.reduce((sum, order) => sum + order.total_price, 0);
    const averageConfirmedOrderValue = confirmedOrders.length > 0 ? confirmedRevenue / confirmedOrders.length : 0;

    const dailyMap = new Map<string, {
      key: string;
      label: string;
      orders: number;
      confirmed: number;
      revenue: number;
      requests: number;
      cancelled: number;
    }>();

    const ensureDay = (value: string) => {
      const date = new Date(value);
      const key = date.toISOString().slice(0, 10);
      const existing = dailyMap.get(key);

      if (existing) {
        return existing;
      }

      const next = {
        key,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: 0,
        confirmed: 0,
        revenue: 0,
        requests: 0,
        cancelled: 0,
      };
      dailyMap.set(key, next);
      return next;
    };

    monthOrders.forEach((order) => {
      const status = normalizeOrderStatus(order.status);
      const day = ensureDay(order.created_at);
      day.orders += 1;

      if (status === 'confirmed') {
        day.confirmed += 1;
        day.revenue += order.total_price;
      }

      if (status === 'cancelled') {
        day.cancelled += 1;
      }
    });

    monthRequests.forEach((request) => {
      const day = ensureDay(request.created_at);
      day.requests += 1;
    });

    return {
      confirmedRevenue,
      pendingValue,
      cancelledValue,
      averageConfirmedOrderValue,
      pendingOrders,
      confirmedOrders,
      cancelledOrders,
      serviceRequests: monthRequests,
      confirmedRequests: monthRequests.filter((request) => normalizeReportServiceStatus(request.status) === 'confirmed').length,
      dailyRows: Array.from(dailyMap.values()).sort((left, right) => right.key.localeCompare(left.key)),
    };
  }, [monthOrders, monthRequests]);

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
    <div className="admin-portal min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(0,167,111,0.14),transparent_18%),radial-gradient(circle_at_bottom_left,rgba(30,41,59,0.1),transparent_22%),linear-gradient(180deg,#eef5fb_0%,#f7fbff_48%,#ffffff_100%)]">
      <header className="admin-glass sticky top-0 z-[1000] border-b border-white/30 bg-[rgba(255,255,255,0.72)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-[linear-gradient(135deg,#0b8a60_0%,#11a36e_100%)] shadow-[0_18px_35px_rgba(11,138,96,0.18)]">
              <img src="/images/Header/logo.svg" alt="PZM Logo" className="h-9" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Lean Admin</p>
              <h1 className="admin-heading-accent mt-2 text-3xl font-bold text-slate-950">Orders, service, and monthly reports</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-brandTextMedium">
                Keep the back office simple: manage pending, confirmed, and canceled work for both items and services.
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/60 bg-white/82 px-5 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="admin-glass-soft rounded-[24px] bg-white/68 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Total Orders</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{stats.total}</p>
            <p className="mt-2 text-sm text-brandTextMedium">All orders in the system</p>
          </div>
          <div className="admin-glass-soft rounded-[24px] bg-white/68 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Pending</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{stats.pending}</p>
            <p className="mt-2 text-sm text-brandTextMedium">Awaiting confirmation</p>
          </div>
          <div className="admin-glass-soft rounded-[24px] bg-white/68 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Confirmed</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{stats.confirmed}</p>
            <p className="mt-2 text-sm text-brandTextMedium">Paid and confirmed work</p>
          </div>
          <div className="admin-glass-soft rounded-[24px] bg-white/68 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-700">Canceled</p>
            <p className="mt-3 text-3xl font-bold text-slate-950">{stats.cancelled}</p>
            <p className="mt-2 text-sm text-brandTextMedium">Stopped or lost orders</p>
          </div>
        </div>

        <div className="admin-glass overflow-hidden rounded-[28px] bg-[rgba(255,255,255,0.64)] shadow-[var(--shadow-xl)]">
          <div className="border-b border-slate-100 px-6 py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Admin Workspace</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">Minimal operations for a small shop</h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-brandTextMedium">
                  Focus on the only things that matter here: current orders, service follow-up, and clear monthly performance.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-primary text-white'
                      : 'border border-brandBorder bg-white text-brandTextDark hover:border-primary hover:text-primary'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('serviceRequests')}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === 'serviceRequests'
                      ? 'bg-primary text-white'
                      : 'border border-brandBorder bg-white text-brandTextDark hover:border-primary hover:text-primary'
                  }`}
                >
                  Service Requests
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                    activeTab === 'reports'
                      ? 'bg-primary text-white'
                      : 'border border-brandBorder bg-white text-brandTextDark hover:border-primary hover:text-primary'
                  }`}
                >
                  Monthly Reports
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-7">
            {activeTab === 'orders' && (
              <div>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Orders</p>
                    <h3 className="mt-2 text-2xl font-bold text-slate-950">Current order queue</h3>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-brandTextMedium">
                      Work with the simplified business flow only: pending, confirmed, or canceled.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as AdminOrderStatus | 'all')}
                      className="rounded-full border border-white/60 bg-white/82 px-4 py-3 text-sm font-medium text-brandTextDark focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Orders</option>
                      {ADMIN_ORDER_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={loadOrders}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#7adf38_0%,#00A76F_100%)] px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                    >
                      <RefreshCw size={18} />
                      Refresh
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="admin-glass-soft rounded-[24px] bg-white/68 p-10 text-center">
                    <p className="text-lg font-semibold text-slate-950">Loading orders...</p>
                    <p className="mt-2 text-sm text-brandTextMedium">Fetching the latest order activity from the admin API.</p>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="admin-glass-soft rounded-[24px] bg-white/68 p-10 text-center">
                    <p className="text-lg font-semibold text-slate-950">No orders found</p>
                    <p className="mt-2 text-sm text-brandTextMedium">Try another status filter or wait for new orders to come in.</p>
                  </div>
                ) : (
                  <div className="admin-glass-soft overflow-hidden rounded-[24px] bg-white/7">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Order ID</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Customer</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Amount</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {paginatedOrders.map((order) => (
                            <tr key={order.id} className="transition-colors hover:bg-slate-50">
                              <td className="px-6 py-4 text-sm font-mono text-slate-700">{formatOrderId(order.id)}</td>
                              <td className="px-6 py-4 text-sm">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="text-left font-semibold text-primary transition-colors hover:text-brandGreenDark"
                                >
                                  {order.customer_name}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-emerald-700">
                                AED {order.total_price.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getOrderStatusBadgeClass(order.status)}`}
                                >
                                  {formatAdminOrderStatus(order.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-brandTextMedium">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <button
                                  onClick={() => setSelectedOrder(order)}
                                  className="font-semibold text-primary transition-colors hover:text-brandGreenDark"
                                >
                                  Manage
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5">
                          <p className="text-sm text-brandTextMedium">
                            Showing {startIndex + 1} to {Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                              className="rounded-xl border border-brandBorder bg-white px-4 py-2 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <div className="flex gap-1">
                              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                                    currentPage === page
                                      ? 'bg-primary text-white'
                                      : 'border border-brandBorder bg-white text-brandTextDark hover:border-primary hover:text-primary'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                              disabled={currentPage === totalPages}
                              className="rounded-xl border border-brandBorder bg-white px-4 py-2 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'serviceRequests' && (
              <ServiceRequestManagement onUnauthorized={handleLogout} />
            )}

            {activeTab === 'reports' && (
              <div>
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Monthly Reports</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-950">Track the month clearly</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-7 text-brandTextMedium">Track confirmed revenue, pending value, cancellations, and service workload without extra workflow noise.</p>
                  </div>
                  <button
                    onClick={() => {
                      loadOrders();
                      loadReportRequests();
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#7adf38_0%,#00A76F_100%)] px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                  >
                    <RefreshCw size={18} />
                    Refresh report data
                  </button>
                </div>
                
                <div className="admin-glass-soft mb-8 rounded-[24px] bg-white/68 p-5">
                  <label className="mb-3 block text-sm font-medium text-brandTextDark">Select Month</label>
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="rounded-full border border-white/60 bg-white/82 px-4 py-3 text-sm font-medium text-brandTextDark focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {loading || reportsLoading ? (
                  <div className="admin-glass-soft rounded-[24px] bg-white/68 p-10 text-center">
                    <p className="text-lg font-semibold text-slate-950">Loading monthly data...</p>
                    <p className="mt-2 text-sm text-brandTextMedium">Refreshing orders and service requests for {monthLabel}.</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                      <div className="admin-glass-soft rounded-[24px] bg-white/68 p-6">
                        <p className="text-sm font-medium text-primary">Orders Received</p>
                        <p className="mt-3 text-4xl font-bold text-slate-950">{monthOrders.length}</p>
                        <p className="mt-2 text-xs text-brandTextMedium">In {monthLabel}</p>
                      </div>

                      <div className="admin-glass-soft rounded-[24px] bg-white/68 p-6">
                        <p className="text-sm font-medium text-emerald-700">Confirmed Revenue</p>
                        <p className="mt-3 text-4xl font-bold text-slate-950">AED {monthlyReport.confirmedRevenue.toFixed(2)}</p>
                        <p className="mt-2 text-xs text-brandTextMedium">From {monthlyReport.confirmedOrders.length} confirmed orders</p>
                      </div>

                      <div className="admin-glass-soft rounded-[24px] bg-white/68 p-6">
                        <p className="text-sm font-medium text-amber-700">Pending Value</p>
                        <p className="mt-3 text-4xl font-bold text-slate-950">{monthlyReport.pendingOrders.length}</p>
                        <p className="mt-2 text-xs text-brandTextMedium">AED {monthlyReport.pendingValue.toFixed(2)} awaiting confirmation</p>
                      </div>

                      <div className="admin-glass-soft rounded-[24px] bg-white/68 p-6">
                        <p className="text-sm font-medium text-violet-700">Service Requests</p>
                        <p className="mt-3 text-4xl font-bold text-slate-950">{monthlyReport.serviceRequests.length}</p>
                        <p className="mt-2 text-xs text-brandTextMedium">{monthlyReport.confirmedRequests} confirmed this month</p>
                      </div>
                    </div>

                    <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
                      <div className="admin-glass-soft rounded-[24px] bg-white/68 p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-brandTextMedium">Pending</p>
                        <p className="mt-3 text-3xl font-bold text-amber-700">{monthlyReport.pendingOrders.length}</p>
                      </div>
                      <div className="admin-glass-soft rounded-[24px] bg-white/68 p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-brandTextMedium">Confirmed</p>
                        <p className="mt-3 text-3xl font-bold text-emerald-700">{monthlyReport.confirmedOrders.length}</p>
                      </div>
                      <div className="admin-glass-soft rounded-[24px] bg-white/68 p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-brandTextMedium">Canceled</p>
                        <p className="mt-3 text-3xl font-bold text-rose-700">{monthlyReport.cancelledOrders.length}</p>
                        <p className="mt-2 text-xs text-brandTextMedium">AED {monthlyReport.cancelledValue.toFixed(2)} canceled value</p>
                      </div>
                      <div className="admin-glass-soft rounded-[24px] bg-white/68 p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-brandTextMedium">Avg Confirmed Order</p>
                        <p className="mt-3 text-3xl font-bold text-emerald-700">AED {monthlyReport.averageConfirmedOrderValue.toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="admin-glass-soft mb-8 overflow-hidden rounded-[24px] bg-white/68">
                      <div className="border-b border-slate-100 p-6">
                        <h3 className="text-xl font-bold text-slate-950">Daily Activity in {monthLabel}</h3>
                        <p className="mt-2 text-sm text-brandTextMedium">Use this table for a quick day-by-day view of orders, confirmed revenue, cancellations, and service-request volume.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Orders</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Confirmed</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Revenue</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Requests</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Canceled</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {monthlyReport.dailyRows.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-brandTextMedium">
                                  No order or request activity found for this month
                                </td>
                              </tr>
                            ) : (
                              monthlyReport.dailyRows.map((row) => (
                                <tr key={row.key} className="transition-colors hover:bg-slate-50">
                                  <td className="px-6 py-4 text-sm font-medium text-slate-950">{row.label}</td>
                                  <td className="px-6 py-4 text-sm text-brandTextDark">{row.orders}</td>
                                  <td className="px-6 py-4 text-sm text-emerald-700">{row.confirmed}</td>
                                  <td className="px-6 py-4 text-sm font-semibold text-emerald-700">AED {row.revenue.toFixed(2)}</td>
                                  <td className="px-6 py-4 text-sm text-sky-700">{row.requests}</td>
                                  <td className="px-6 py-4 text-sm text-rose-700">{row.cancelled}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="admin-glass-soft overflow-hidden rounded-[24px] bg-white/68">
                      <div className="border-b border-slate-100 p-6">
                        <h3 className="text-xl font-bold text-slate-950">Orders in {monthLabel}</h3>
                        <p className="mt-2 text-sm text-brandTextMedium">Detailed order list for the selected month with the simplified business status view.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Order ID</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Customer</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Amount</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Date</th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {monthOrders.length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-brandTextMedium">
                                  No orders found for this month
                                </td>
                              </tr>
                            ) : (
                              monthOrders.map((order) => (
                                <tr key={order.id} className="transition-colors hover:bg-slate-50">
                                  <td className="px-6 py-4 text-sm font-mono text-slate-700">{formatOrderId(order.id)}</td>
                                  <td className="px-6 py-4 text-sm">
                                    <button
                                      onClick={() => setSelectedOrder(order)}
                                      className="font-semibold text-primary transition-colors hover:text-brandGreenDark"
                                    >
                                      {order.customer_name}
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 text-sm font-semibold text-emerald-700">
                                    AED {order.total_price.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 text-sm">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getOrderStatusBadgeClass(order.status)}`}>
                                      {formatAdminOrderStatus(order.status)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-brandTextMedium">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 text-sm">
                                    <button
                                      onClick={() => setSelectedOrder(order)}
                                      className="font-semibold text-primary transition-colors hover:text-brandGreenDark"
                                    >
                                      View
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
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
          <div className="admin-glass fixed top-0 right-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l border-white/40 bg-[rgba(255,255,255,0.74)] shadow-[var(--shadow-xl)]">
            <div className="p-8">
              <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Order Details</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-950">{selectedOrder.customer_name}</h2>
                  <p className="mt-1 font-mono text-base text-brandTextMedium">{formatOrderId(selectedOrder.id)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.open(`/admin/orders/${selectedOrder.id}/invoice`, '_blank', 'noopener,noreferrer')}
                    className="rounded-full bg-[linear-gradient(135deg,#7adf38_0%,#00A76F_100%)] px-4 py-2 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
                    title="Open printable invoice"
                  >
                    Print Invoice
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="rounded-full border border-white/60 bg-white/82 p-2 text-brandTextMedium transition-colors hover:border-primary hover:text-primary"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Client Information Section */}
              <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-950">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Client Information
                </h3>
                <div className="admin-glass-soft space-y-4 rounded-[24px] bg-white/68 p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Full Name</p>
                      <p className="text-lg font-semibold text-slate-950">{selectedOrder.customer_name}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Phone Number</p>
                      <p className="text-lg font-semibold text-slate-950">{selectedOrder.customer_phone}</p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brandTextMedium">Email Address</p>
                    <p className="break-all text-lg font-semibold text-slate-950">{selectedOrder.customer_email}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brandTextMedium">Delivery Address</p>
                    <p className="text-lg leading-relaxed text-slate-950">{selectedOrder.customer_address}</p>
                  </div>
                </div>
              </div>

              {/* Special Notes Section */}
              {selectedOrder.notes && selectedOrder.notes.trim().length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-950">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h9" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                    Special Notes
                  </h3>
                  <div className="admin-glass-soft rounded-[24px] bg-white/68 p-6">
                    <p className="whitespace-pre-wrap text-brandTextDark">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Order Information Section */}
              <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-950">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Order Information
                </h3>
                <div className="admin-glass-soft space-y-4 rounded-[24px] bg-white/68 p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Order Date</p>
                      <p className="text-lg text-slate-950">{new Date(selectedOrder.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Payment Method</p>
                      <p className="text-lg text-slate-950">{formatDisplayLabel(selectedOrder.payment_method)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Current Status</p>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getOrderStatusBadgeClass(selectedOrder.status)}`}
                      >
                        {formatAdminOrderStatus(selectedOrder.status)}
                      </span>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Total Amount</p>
                      <p className="text-2xl font-bold text-primary">AED {selectedOrder.total_price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Section */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="mb-8">
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-950">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Order Items ({selectedOrder.items.length})
                  </h3>
                  <div className="admin-glass-soft space-y-4 rounded-[24px] bg-white/68 p-6">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="border-b border-slate-100 pb-4 last:border-b-0 last:pb-0">
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex-1">
                            {item.product && (
                              <>
                                <h4 className="text-lg font-semibold text-slate-950">{item.product.model}</h4>
                                <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-brandTextMedium">Storage:</span>
                                    <span className="ml-2 font-medium text-slate-950">{item.product.storage}</span>
                                  </div>
                                  <div>
                                    <span className="text-brandTextMedium">Color:</span>
                                    <span className="ml-2 font-medium text-slate-950">{item.product.color}</span>
                                  </div>
                                  <div>
                                    <span className="text-brandTextMedium">Condition:</span>
                                    <span className="ml-2 font-medium text-slate-950">{item.product.condition === 'new' ? 'Brand New' : 'Used'}</span>
                                  </div>
                                  <div>
                                    <span className="text-brandTextMedium">Quantity:</span>
                                    <span className="ml-2 font-medium text-slate-950">{item.quantity}</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-brandTextMedium">Unit Price</p>
                            <p className="text-lg font-bold text-primary">AED {item.unit_price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                          <span className="text-brandTextMedium">Subtotal ({item.quantity} item{item.quantity > 1 ? 's' : ''}):</span>
                          <span className="text-lg font-semibold text-slate-950">AED {item.subtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Update Status Section */}
              <div className="mb-8">
                <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-slate-950">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Update Order Status
                </h3>
                <div className="admin-glass-soft rounded-[24px] bg-white/68 p-6">
                  <label className="mb-3 block text-sm font-medium text-brandTextDark">Select New Status</label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleUpdateOrderStatus(selectedOrder.id, e.target.value);
                      }
                    }}
                    value=""
                    className="w-full rounded-full border border-white/60 bg-white/82 px-4 py-3 text-base text-brandTextDark focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select new status</option>
                    {ADMIN_ORDER_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-3 text-sm text-brandTextMedium">Selecting a status will automatically update the order and send notifications.</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full rounded-full border border-white/60 bg-white/82 py-3 text-lg font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
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
