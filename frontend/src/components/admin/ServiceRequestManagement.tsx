import { useEffect, useMemo, useState } from 'react';
import type { ServiceRequest, ServiceRequestStatus } from '@shared/types';
import { RefreshCw } from 'lucide-react';
import { buildApiUrl } from '../../utils/siteConfig';

interface ServiceRequestManagementProps {
  onUnauthorized: () => void;
}

type AdminServiceRequestStatus = 'pending' | 'confirmed' | 'cancelled';

const STATUS_OPTIONS: Array<AdminServiceRequestStatus | 'all'> = ['all', 'pending', 'confirmed', 'cancelled'];

const ADMIN_STATUS_LABELS: Record<AdminServiceRequestStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Canceled',
};

function normalizeServiceRequestStatus(status: ServiceRequestStatus): AdminServiceRequestStatus {
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

function toStoredServiceRequestStatus(status: AdminServiceRequestStatus): ServiceRequestStatus {
  switch (status) {
    case 'confirmed':
      return 'contacted';
    case 'cancelled':
      return 'cancelled';
    case 'pending':
    default:
      return 'pending';
  }
}

function formatServiceRequestStatus(status: ServiceRequestStatus): string {
  return ADMIN_STATUS_LABELS[normalizeServiceRequestStatus(status)];
}

function formatRequestId(id: string) {
  const parts = id?.split('-');
  const randomPart = parts?.[parts.length - 1] || id || '000000';
  return `SRQ-${randomPart.toUpperCase()}`;
}

function formatServiceType(serviceType: string) {
  return serviceType
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatLabel(value: string) {
  return value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatDateTime(value?: string) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function statusBadgeClass(status: ServiceRequestStatus) {
  switch (normalizeServiceRequestStatus(status)) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-emerald-100 text-emerald-800';
    case 'cancelled':
      return 'bg-rose-100 text-rose-800';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function StatCard(props: { label: string; value: number; className: string; note: string }) {
  return (
    <div className={`rounded-[24px] border border-brandBorder p-5 shadow-sm ${props.className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brandTextMedium">{props.label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-950">{props.value}</p>
      <p className="mt-2 text-xs text-brandTextMedium">{props.note}</p>
    </div>
  );
}

export default function ServiceRequestManagement({ onUnauthorized }: ServiceRequestManagementProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AdminServiceRequestStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [draftStatus, setDraftStatus] = useState<AdminServiceRequestStatus>('pending');
  const [savingStatus, setSavingStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 10;

  const loadRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('adminToken');
      if (!authToken) {
        setError('Not authenticated');
        onUnauthorized();
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
          onUnauthorized();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to load service requests');
      }

      const responseData = await response.json();
      setRequests(responseData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, nextStatus: ServiceRequestStatus) => {
    setSavingStatus(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('adminToken');
      if (!authToken) {
        setError('Not authenticated');
        onUnauthorized();
        return;
      }

      const response = await fetch(buildApiUrl(`/service-requests/${requestId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          onUnauthorized();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to update service request');
      }

      const responseData = await response.json();
      const updatedRequest = responseData.data as ServiceRequest;

      setRequests((prev) =>
        prev.map((request) => (request.id === requestId ? updatedRequest : request))
      );
      setSelectedRequest(updatedRequest);
      setDraftStatus(normalizeServiceRequestStatus(updatedRequest.status));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service request');
    } finally {
      setSavingStatus(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    setDraftStatus(selectedRequest ? normalizeServiceRequestStatus(selectedRequest.status) : 'pending');
  }, [selectedRequest]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter((request) => normalizeServiceRequestStatus(request.status) === statusFilter);
  }, [requests, statusFilter]);

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage) || 1;
  const startIndex = (currentPage - 1) * requestsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + requestsPerPage);

  const stats = {
    total: requests.length,
    pending: requests.filter((request) => normalizeServiceRequestStatus(request.status) === 'pending').length,
    confirmed: requests.filter((request) => normalizeServiceRequestStatus(request.status) === 'confirmed').length,
    cancelled: requests.filter((request) => request.status === 'cancelled').length,
  };

  return (
    <div className="admin-portal space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total" value={stats.total} note="All requests" className="admin-glass-soft bg-white/68" />
        <StatCard label="Pending" value={stats.pending} note="Need confirmation" className="admin-glass-soft bg-white/68" />
        <StatCard label="Confirmed" value={stats.confirmed} note="Approved service work" className="admin-glass-soft bg-white/68" />
        <StatCard label="Canceled" value={stats.cancelled} note="No longer active" className="admin-glass-soft bg-white/68" />
      </div>

      <section className="admin-glass rounded-[28px] bg-[rgba(255,255,255,0.64)] p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Service Requests</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Current request pipeline</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-brandTextMedium">
              Keep the service flow simple: pending, confirmed, or canceled. Older detailed stages are grouped into confirmed.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as AdminServiceRequestStatus | 'all')}
              className="rounded-full border border-white/60 bg-white/82 px-4 py-3 text-sm font-medium text-brandTextDark focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : ADMIN_STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            <button
              onClick={loadRequests}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#7adf38_0%,#00A76F_100%)] px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="admin-glass-soft rounded-[28px] bg-white/68 p-10 text-center">
          <p className="text-lg font-semibold text-slate-950">Loading service requests...</p>
          <p className="mt-2 text-sm text-brandTextMedium">Fetching the latest requests from the admin API.</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="admin-glass-soft rounded-[28px] bg-white/68 p-10 text-center">
          <p className="text-lg font-semibold text-slate-950">No service requests found</p>
          <p className="mt-2 text-sm text-brandTextMedium">Try switching the filter or wait for new requests to come in.</p>
        </div>
      ) : (
        <div className="admin-glass-soft overflow-hidden rounded-[28px] bg-white/68">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Reference</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Service</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Request Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Created</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRequests.map((request) => (
                <tr key={request.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-mono text-slate-700">{formatRequestId(request.id)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="text-left font-semibold text-primary transition-colors hover:text-brandGreenDark"
                    >
                      {request.customer_name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-brandTextDark">{formatServiceType(request.service_type)}</td>
                  <td className="px-6 py-4 text-sm text-brandTextMedium">{formatLabel(request.request_kind)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(request.status)}`}>
                      {formatServiceRequestStatus(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-brandTextMedium">{formatDateTime(request.created_at)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setSelectedRequest(request)}
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
                Showing {startIndex + 1} to {Math.min(startIndex + requestsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl border border-brandBorder bg-white px-4 py-2 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
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
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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

      {selectedRequest && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSelectedRequest(null)}
          />

          <div className="admin-glass fixed top-0 right-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l border-white/40 bg-[rgba(255,255,255,0.74)] shadow-[var(--shadow-xl)]">
            <div className="p-8">
              <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Service Request</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-950">{selectedRequest.customer_name}</h2>
                  <p className="mt-1 font-mono text-base text-brandTextMedium">{formatRequestId(selectedRequest.id)}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="rounded-full border border-white/60 bg-white/82 p-2 text-brandTextMedium transition-colors hover:border-primary hover:text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold text-slate-950">Customer Information</h3>
                <div className="admin-glass-soft space-y-4 rounded-[24px] bg-white/68 p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Full Name</p>
                      <p className="text-lg font-semibold text-slate-950">{selectedRequest.customer_name}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Phone</p>
                      <a href={`tel:${selectedRequest.customer_phone}`} className="text-lg font-semibold text-primary transition-colors hover:text-brandGreenDark">
                        {selectedRequest.customer_phone}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brandTextMedium">Email</p>
                    {selectedRequest.customer_email ? (
                      <a href={`mailto:${selectedRequest.customer_email}`} className="break-all text-lg font-semibold text-primary transition-colors hover:text-brandGreenDark">
                        {selectedRequest.customer_email}
                      </a>
                    ) : (
                      <p className="text-lg text-brandTextDark">Not provided</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brandTextMedium">Address / Area</p>
                    <p className="text-lg leading-relaxed text-brandTextDark">{selectedRequest.customer_address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold text-slate-950">Request Details</h3>
                <div className="admin-glass-soft space-y-4 rounded-[24px] bg-white/68 p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Service</p>
                      <p className="text-lg text-slate-950">{formatServiceType(selectedRequest.service_type)}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Request Type</p>
                      <p className="text-lg text-slate-950">{formatLabel(selectedRequest.request_kind)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Preferred Contact</p>
                      <p className="text-lg text-slate-950">{selectedRequest.preferred_contact_method ? formatLabel(selectedRequest.preferred_contact_method) : 'Phone'}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Preferred Time</p>
                      <p className="text-lg text-slate-950">
                        {selectedRequest.preferred_date ? `${selectedRequest.preferred_date} ${selectedRequest.preferred_time_period ? `(${formatLabel(selectedRequest.preferred_time_period)})` : ''}` : 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brandTextMedium">Source Page</p>
                    <p className="text-lg text-slate-950">{selectedRequest.source_page || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brandTextMedium">Submitted</p>
                    <p className="text-lg text-slate-950">{formatDateTime(selectedRequest.created_at)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brandTextMedium">Last Updated</p>
                    <p className="text-lg text-slate-950">{formatDateTime(selectedRequest.updated_at)}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold text-slate-950">Customer Notes</h3>
                <div className="admin-glass-soft rounded-[24px] bg-white/68 p-6">
                  <p className="whitespace-pre-wrap leading-relaxed text-brandTextDark">{selectedRequest.details}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold text-slate-950">Update Status</h3>
                <div className="admin-glass-soft space-y-4 rounded-[24px] bg-white/68 p-6">
                  <div>
                    <p className="mb-2 text-sm font-medium text-brandTextMedium">Current Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeClass(selectedRequest.status)}`}>
                      {formatServiceRequestStatus(selectedRequest.status)}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <select
                      value={draftStatus}
                      onChange={(event) => setDraftStatus(event.target.value as AdminServiceRequestStatus)}
                      className="flex-1 rounded-full border border-white/60 bg-white/82 px-4 py-3 text-brandTextDark focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {STATUS_OPTIONS.filter((status) => status !== 'all').map((status) => (
                        <option key={status} value={status}>
                          {ADMIN_STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, toStoredServiceRequestStatus(draftStatus))}
                      disabled={savingStatus || draftStatus === normalizeServiceRequestStatus(selectedRequest.status)}
                      className="rounded-full bg-[linear-gradient(135deg,#7adf38_0%,#00A76F_100%)] px-5 py-3 font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {savingStatus ? 'Saving...' : 'Save Status'}
                    </button>
                  </div>

                  <p className="text-xs text-brandTextMedium">
                    Confirmed groups older detailed states such as contacted, quoted, scheduled, and completed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}