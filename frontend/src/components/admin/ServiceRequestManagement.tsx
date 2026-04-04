import { useEffect, useMemo, useState } from 'react';
import type { ServiceRequest, ServiceRequestStatus } from '@shared/types';
import { RefreshCw } from 'lucide-react';
import { buildApiUrl } from '../../utils/siteConfig';

interface ServiceRequestManagementProps {
  onUnauthorized: () => void;
}

const STATUS_OPTIONS: Array<ServiceRequestStatus | 'all'> = [
  'all',
  'pending',
  'contacted',
  'quoted',
  'scheduled',
  'completed',
  'cancelled',
];

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
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-300';
    case 'contacted':
      return 'bg-blue-500/20 text-blue-300';
    case 'quoted':
      return 'bg-purple-500/20 text-purple-300';
    case 'scheduled':
      return 'bg-orange-500/20 text-orange-300';
    case 'completed':
      return 'bg-green-500/20 text-green-300';
    case 'cancelled':
      return 'bg-red-500/20 text-red-300';
    default:
      return 'bg-slate-500/20 text-slate-300';
  }
}

function StatCard(props: { label: string; value: number; className: string; note: string }) {
  return (
    <div className={`rounded-lg shadow-lg p-4 text-white ${props.className}`}>
      <p className="text-xs opacity-80">{props.label}</p>
      <p className="text-3xl font-bold mt-2">{props.value}</p>
      <p className="text-xs opacity-80 mt-2">{props.note}</p>
    </div>
  );
}

export default function ServiceRequestManagement({ onUnauthorized }: ServiceRequestManagementProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ServiceRequestStatus | 'all'>('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [draftStatus, setDraftStatus] = useState<ServiceRequestStatus>('pending');
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
      setDraftStatus(updatedRequest.status);
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
    setDraftStatus(selectedRequest?.status || 'pending');
  }, [selectedRequest]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests;
    return requests.filter((request) => request.status === statusFilter);
  }, [requests, statusFilter]);

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage) || 1;
  const startIndex = (currentPage - 1) * requestsPerPage;
  const paginatedRequests = filteredRequests.slice(startIndex, startIndex + requestsPerPage);

  const stats = {
    total: requests.length,
    pending: requests.filter((request) => request.status === 'pending').length,
    contacted: requests.filter((request) => request.status === 'contacted').length,
    quoted: requests.filter((request) => request.status === 'quoted').length,
    scheduled: requests.filter((request) => request.status === 'scheduled').length,
    completed: requests.filter((request) => request.status === 'completed').length,
    cancelled: requests.filter((request) => request.status === 'cancelled').length,
  };

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
        <StatCard label="Total" value={stats.total} note="All requests" className="bg-gradient-to-br from-[#00A76F] to-[#16a34a]" />
        <StatCard label="Pending" value={stats.pending} note="Need first response" className="bg-gradient-to-br from-yellow-500 to-yellow-600" />
        <StatCard label="Contacted" value={stats.contacted} note="Initial follow-up made" className="bg-gradient-to-br from-blue-500 to-blue-600" />
        <StatCard label="Quoted" value={stats.quoted} note="Estimate sent" className="bg-gradient-to-br from-purple-500 to-purple-600" />
        <StatCard label="Scheduled" value={stats.scheduled} note="Visit or pickup booked" className="bg-gradient-to-br from-orange-500 to-orange-600" />
        <StatCard label="Completed" value={stats.completed} note="Closed successfully" className="bg-gradient-to-br from-green-500 to-green-600" />
        <StatCard label="Cancelled" value={stats.cancelled} note="No longer active" className="bg-gradient-to-br from-red-500 to-red-600" />
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as ServiceRequestStatus | 'all')}
          className="px-4 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A76F]"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Statuses' : formatLabel(status)}
            </option>
          ))}
        </select>

        <button
          onClick={loadRequests}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A76F] hover:bg-[#16a34a] text-white rounded-lg transition-colors font-medium"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-400">Loading service requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-400">No service requests found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Reference</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Service</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Request Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-200">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {paginatedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-300">{formatRequestId(request.id)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="text-[#00A76F] hover:text-[#16a34a] font-medium transition-colors text-left"
                    >
                      {request.customer_name}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{formatServiceType(request.service_type)}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{formatLabel(request.request_kind)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(request.status)}`}>
                      {formatLabel(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400">{formatDateTime(request.created_at)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="text-[#00A76F] hover:text-[#16a34a] font-medium transition-colors"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Showing {startIndex + 1} to {Math.min(startIndex + requestsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
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
                          ? 'bg-[#00A76F] text-white'
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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

      {selectedRequest && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSelectedRequest(null)}
          />

          <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-slate-800 shadow-2xl z-50 overflow-y-auto transform transition-transform">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">Service Request</h2>
                  <p className="text-[#00A76F] font-mono text-lg">{formatRequestId(selectedRequest.id)}</p>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-slate-400 hover:text-white transition-colors p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Customer Information</h3>
                <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-slate-400 text-sm mb-1 font-medium">Full Name</p>
                      <p className="text-white text-lg font-semibold">{selectedRequest.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1 font-medium">Phone</p>
                      <a href={`tel:${selectedRequest.customer_phone}`} className="text-[#00A76F] text-lg font-semibold hover:text-[#16a34a] transition-colors">
                        {selectedRequest.customer_phone}
                      </a>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1 font-medium">Email</p>
                    {selectedRequest.customer_email ? (
                      <a href={`mailto:${selectedRequest.customer_email}`} className="text-[#00A76F] text-lg font-semibold hover:text-[#16a34a] transition-colors break-all">
                        {selectedRequest.customer_email}
                      </a>
                    ) : (
                      <p className="text-white text-lg">Not provided</p>
                    )}
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1 font-medium">Address / Area</p>
                    <p className="text-white text-lg leading-relaxed">{selectedRequest.customer_address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Request Details</h3>
                <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-slate-400 text-sm mb-1 font-medium">Service</p>
                      <p className="text-white text-lg">{formatServiceType(selectedRequest.service_type)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1 font-medium">Request Type</p>
                      <p className="text-white text-lg">{formatLabel(selectedRequest.request_kind)}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-slate-400 text-sm mb-1 font-medium">Preferred Contact</p>
                      <p className="text-white text-lg">{selectedRequest.preferred_contact_method ? formatLabel(selectedRequest.preferred_contact_method) : 'Phone'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1 font-medium">Preferred Time</p>
                      <p className="text-white text-lg">
                        {selectedRequest.preferred_date ? `${selectedRequest.preferred_date} ${selectedRequest.preferred_time_period ? `(${formatLabel(selectedRequest.preferred_time_period)})` : ''}` : 'Not provided'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1 font-medium">Source Page</p>
                    <p className="text-white text-lg">{selectedRequest.source_page || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1 font-medium">Submitted</p>
                    <p className="text-white text-lg">{formatDateTime(selectedRequest.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm mb-1 font-medium">Last Updated</p>
                    <p className="text-white text-lg">{formatDateTime(selectedRequest.updated_at)}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Customer Notes</h3>
                <div className="bg-slate-900/50 rounded-lg p-6">
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedRequest.details}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-white mb-4">Update Status</h3>
                <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-slate-400 text-sm mb-2 font-medium">Current Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeClass(selectedRequest.status)}`}>
                      {formatLabel(selectedRequest.status)}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    <select
                      value={draftStatus}
                      onChange={(event) => setDraftStatus(event.target.value as ServiceRequestStatus)}
                      className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A76F]"
                    >
                      {STATUS_OPTIONS.filter((status) => status !== 'all').map((status) => (
                        <option key={status} value={status}>
                          {formatLabel(status)}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, draftStatus)}
                      disabled={savingStatus || draftStatus === selectedRequest.status}
                      className="px-5 py-3 bg-[#00A76F] hover:bg-[#16a34a] text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingStatus ? 'Saving...' : 'Save Status'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}