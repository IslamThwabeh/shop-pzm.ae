import { useEffect, useMemo, useState } from 'react';
import type { WhatsAppLead, WhatsAppLeadStatus } from '@shared/types';
import { RefreshCw } from 'lucide-react';
import { buildApiUrl } from '../../utils/siteConfig';

interface WhatsAppLeadManagementProps {
  onUnauthorized: () => void;
}

const STATUS_OPTIONS: Array<WhatsAppLeadStatus | 'all'> = ['all', 'pending', 'confirmed', 'cancelled'];

const STATUS_LABELS: Record<WhatsAppLeadStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Canceled',
};

function formatLeadId(id: string) {
  const parts = id?.split('-');
  const randomPart = parts?.[parts.length - 1] || id || '000000';
  return `WAL-${randomPart.toUpperCase()}`;
}

function formatLeadType(leadType: string) {
  return leadType.charAt(0).toUpperCase() + leadType.slice(1);
}

function formatDateTime(value?: string) {
  if (!value) return '—';
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

function statusBadgeClass(status: WhatsAppLeadStatus) {
  switch (status) {
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

export default function WhatsAppLeadManagement({ onUnauthorized }: WhatsAppLeadManagementProps) {
  const [leads, setLeads] = useState<WhatsAppLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<WhatsAppLeadStatus | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<WhatsAppLead | null>(null);
  const [draftStatus, setDraftStatus] = useState<WhatsAppLeadStatus>('pending');
  const [draftNotes, setDraftNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  const loadLeads = async () => {
    setLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('adminToken');
      if (!authToken) {
        setError('Not authenticated');
        onUnauthorized();
        return;
      }

      const response = await fetch(buildApiUrl('/whatsapp-leads'), {
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
        throw new Error('Failed to load WhatsApp leads');
      }

      const responseData = await response.json();
      setLeads(responseData.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load WhatsApp leads');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;
    setSavingStatus(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('adminToken');
      if (!authToken) {
        setError('Not authenticated');
        onUnauthorized();
        return;
      }

      const response = await fetch(buildApiUrl(`/whatsapp-leads/${selectedLead.id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: draftStatus, notes: draftNotes }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          onUnauthorized();
          throw new Error('Session expired. Please login again.');
        }
        throw new Error('Failed to update WhatsApp lead');
      }

      const responseData = await response.json();
      const updatedLead = responseData.data as WhatsAppLead;

      setLeads((prev) => prev.map((lead) => (lead.id === selectedLead.id ? updatedLead : lead)));
      setSelectedLead(updatedLead);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update WhatsApp lead');
    } finally {
      setSavingStatus(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    if (selectedLead) {
      setDraftStatus(selectedLead.status);
      setDraftNotes(selectedLead.notes || '');
    }
  }, [selectedLead]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const filteredLeads = useMemo(() => {
    if (statusFilter === 'all') return leads;
    return leads.filter((lead) => lead.status === statusFilter);
  }, [leads, statusFilter]);

  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage) || 1;
  const startIndex = (currentPage - 1) * leadsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + leadsPerPage);

  const stats = {
    total: leads.length,
    pending: leads.filter((lead) => lead.status === 'pending').length,
    confirmed: leads.filter((lead) => lead.status === 'confirmed').length,
    cancelled: leads.filter((lead) => lead.status === 'cancelled').length,
  };

  return (
    <div className="admin-portal space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total" value={stats.total} note="All leads" className="admin-glass-soft bg-white/68" />
        <StatCard label="Pending" value={stats.pending} note="Awaiting follow-up" className="admin-glass-soft bg-white/68" />
        <StatCard label="Confirmed" value={stats.confirmed} note="Dealt with" className="admin-glass-soft bg-white/68" />
        <StatCard label="Canceled" value={stats.cancelled} note="No longer active" className="admin-glass-soft bg-white/68" />
      </div>

      <section className="admin-glass rounded-[28px] bg-[rgba(255,255,255,0.64)] p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#25D366]">WhatsApp Leads</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Incoming WhatsApp enquiries</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-brandTextMedium">
              Every time a visitor taps "WhatsApp Us" on a product or service page, a lead is logged here automatically.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as WhatsAppLeadStatus | 'all')}
              className="rounded-full border border-white/60 bg-white/82 px-4 py-3 text-sm font-medium text-brandTextDark focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            <button
              onClick={loadLeads}
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
          <p className="text-lg font-semibold text-slate-950">Loading WhatsApp leads...</p>
          <p className="mt-2 text-sm text-brandTextMedium">Fetching the latest leads from the admin API.</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="admin-glass-soft rounded-[28px] bg-white/68 p-10 text-center">
          <p className="text-lg font-semibold text-slate-950">No WhatsApp leads found</p>
          <p className="mt-2 text-sm text-brandTextMedium">Try switching the filter or wait for new leads to come in.</p>
        </div>
      ) : (
        <div className="admin-glass-soft overflow-hidden rounded-[28px] bg-white/68">
          <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Reference</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Item</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Price</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Created</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.map((lead) => (
                <tr key={lead.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-mono text-slate-700">{formatLeadId(lead.id)}</td>
                  <td className="px-6 py-4 text-sm text-brandTextDark">{formatLeadType(lead.lead_type)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="text-left font-semibold text-primary transition-colors hover:text-brandGreenDark"
                    >
                      {lead.reference_label}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-brandTextDark">
                    {lead.reference_price != null ? `AED ${lead.reference_price.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(lead.status)}`}>
                      {STATUS_LABELS[lead.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-brandTextMedium">{formatDateTime(lead.created_at)}</td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => setSelectedLead(lead)}
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
                Showing {startIndex + 1} to {Math.min(startIndex + leadsPerPage, filteredLeads.length)} of {filteredLeads.length} leads
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

      {selectedLead && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSelectedLead(null)}
          />

          <div className="admin-glass fixed top-0 right-0 z-50 h-full w-full max-w-2xl overflow-y-auto border-l border-white/40 bg-[rgba(255,255,255,0.74)] shadow-[var(--shadow-xl)]">
            <div className="p-8">
              <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#25D366]">WhatsApp Lead</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-950">{selectedLead.reference_label}</h2>
                  <p className="mt-1 font-mono text-base text-brandTextMedium">{formatLeadId(selectedLead.id)}</p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="rounded-full border border-white/60 bg-white/82 p-2 text-brandTextMedium transition-colors hover:border-primary hover:text-primary"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold text-slate-950">Lead Details</h3>
                <div className="admin-glass-soft space-y-4 rounded-[24px] bg-white/68 p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Lead Type</p>
                      <p className="text-lg font-semibold text-slate-950">{formatLeadType(selectedLead.lead_type)}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-sm font-medium text-brandTextMedium">Price</p>
                      <p className="text-lg font-semibold text-slate-950">
                        {selectedLead.reference_price != null ? `AED ${selectedLead.reference_price.toLocaleString()}` : '—'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brandTextMedium">Source Page</p>
                    <p className="text-lg text-slate-950">{selectedLead.source_page || '—'}</p>
                  </div>
                  {(selectedLead.city || selectedLead.country || selectedLead.ip_address) && (
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="mb-1 text-sm font-medium text-brandTextMedium">City</p>
                        <p className="text-lg text-slate-950">{selectedLead.city || '—'}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-medium text-brandTextMedium">Country</p>
                        <p className="text-lg text-slate-950">{selectedLead.country || '—'}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-sm font-medium text-brandTextMedium">IP Address</p>
                        <p className="text-sm font-mono text-slate-950">{selectedLead.ip_address || '—'}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="mb-1 text-sm font-medium text-brandTextMedium">Submitted</p>
                    <p className="text-lg text-slate-950">{formatDateTime(selectedLead.created_at)}</p>
                  </div>
                  <div>
                    <p className="mb-1 text-sm font-medium text-brandTextMedium">Last Updated</p>
                    <p className="text-lg text-slate-950">{formatDateTime(selectedLead.updated_at)}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold text-slate-950">WhatsApp Message</h3>
                <div className="admin-glass-soft rounded-[24px] bg-white/68 p-6">
                  <p className="whitespace-pre-wrap leading-relaxed text-brandTextDark">{selectedLead.whatsapp_message}</p>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold text-slate-950">Update Lead</h3>
                <div className="admin-glass-soft space-y-4 rounded-[24px] bg-white/68 p-6">
                  <div>
                    <p className="mb-2 text-sm font-medium text-brandTextMedium">Current Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadgeClass(selectedLead.status)}`}>
                      {STATUS_LABELS[selectedLead.status]}
                    </span>
                  </div>

                  <div>
                    <label htmlFor="lead-status" className="mb-2 block text-sm font-medium text-brandTextMedium">New Status</label>
                    <select
                      id="lead-status"
                      value={draftStatus}
                      onChange={(event) => setDraftStatus(event.target.value as WhatsAppLeadStatus)}
                      className="w-full rounded-full border border-white/60 bg-white/82 px-4 py-3 text-brandTextDark focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {STATUS_OPTIONS.filter((status) => status !== 'all').map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status as WhatsAppLeadStatus]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="lead-notes" className="mb-2 block text-sm font-medium text-brandTextMedium">Notes</label>
                    <textarea
                      id="lead-notes"
                      value={draftNotes}
                      onChange={(event) => setDraftNotes(event.target.value)}
                      rows={3}
                      placeholder="Add internal notes about this lead..."
                      className="w-full rounded-2xl border border-white/60 bg-white/82 px-4 py-3 text-brandTextDark focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <button
                    onClick={handleUpdateLead}
                    disabled={savingStatus || (draftStatus === selectedLead.status && draftNotes === (selectedLead.notes || ''))}
                    className="rounded-full bg-[linear-gradient(135deg,#7adf38_0%,#00A76F_100%)] px-5 py-3 font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingStatus ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
