import { useState } from 'react'
import type { ServiceContactMethod, ServiceRequestKind, ServiceTimePeriod } from '@shared/types'
import { apiService, type ServiceRequest } from '../services/api'
import type { ServiceRequestOption } from '../content/serviceCatalog'

interface ServiceRequestFormProps {
  serviceSlug: string
  serviceTitle: string
  sourcePath: string
  requestKinds: ServiceRequestOption[]
}

export default function ServiceRequestForm({
  serviceSlug,
  serviceTitle,
  sourcePath,
  requestKinds,
}: ServiceRequestFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdRequest, setCreatedRequest] = useState<ServiceRequest | null>(null)
  const [formData, setFormData] = useState({
    requestKind: requestKinds[0]?.value ?? ('quote' as ServiceRequestKind),
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: 'Dubai, ',
    details: '',
    preferredContactMethod: 'phone' as ServiceContactMethod,
    preferredDate: '',
    preferredTimePeriod: 'afternoon' as ServiceTimePeriod,
  })

  const selectedRequestKind = requestKinds.find((option) => option.value === formData.requestKind)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    if (!formData.customerName.trim()) return 'Name is required'
    if (!formData.customerPhone.trim()) return 'Phone number is required'
    if (!/^\+?[\d\s\-()]{7,}$/.test(formData.customerPhone)) return 'Invalid phone format'
    if (formData.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) return 'Invalid email format'
    if (formData.preferredContactMethod === 'email' && !formData.customerEmail.trim()) {
      return 'Email is required if you prefer email contact'
    }
    if (!formData.details.trim()) return 'Please describe what you need'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const created = await apiService.createServiceRequest({
        service_type: serviceSlug,
        request_kind: formData.requestKind,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail || undefined,
        customer_phone: formData.customerPhone,
        customer_address: formData.customerAddress.trim() || undefined,
        details: formData.details,
        preferred_contact_method: formData.preferredContactMethod,
        preferred_date: formData.preferredDate || undefined,
        preferred_time_period: formData.preferredTimePeriod || undefined,
        source_page: sourcePath,
      })

      if (!created) {
        throw new Error('Failed to submit your request')
      }

      setCreatedRequest(created)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit your request')
    } finally {
      setLoading(false)
    }
  }

  if (createdRequest) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-brandBorder p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">Request submitted</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your request is now inside the system</h2>
        <p className="text-brandTextMedium mb-6">
          We have saved your {serviceTitle.toLowerCase()} request with reference <span className="font-semibold text-primary">{createdRequest.id}</span>.
          You can now track this lead internally instead of relying on WhatsApp history.
        </p>
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-900 space-y-2">
          <p><span className="font-semibold">Reference:</span> {createdRequest.id}</p>
          <p><span className="font-semibold">Type:</span> {createdRequest.request_kind.replace('_', ' ')}</p>
          <p><span className="font-semibold">Status:</span> {createdRequest.status}</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-brandBorder p-8 space-y-5">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">Tracked request</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start a {serviceTitle.toLowerCase()} request</h2>
        <p className="text-brandTextMedium">
          This form replaces the old WhatsApp-first funnel for this page.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-primary mb-2">Request Type</label>
        <select
          name="requestKind"
          value={formData.requestKind}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-brandBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-brandTextDark"
        >
          {requestKinds.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {selectedRequestKind && (
          <p className="text-xs text-brandTextMedium mt-2">{selectedRequestKind.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Full Name *</label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 border border-brandBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-brandTextDark"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Phone *</label>
          <input
            type="tel"
            name="customerPhone"
            value={formData.customerPhone}
            onChange={handleChange}
            placeholder="+971 50 123 4567"
            className="w-full px-4 py-3 border border-brandBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-brandTextDark"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Email</label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleChange}
            placeholder="your@email.com"
            className="w-full px-4 py-3 border border-brandBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-brandTextDark"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Preferred Contact</label>
          <select
            name="preferredContactMethod"
            value={formData.preferredContactMethod}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-brandBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-brandTextDark"
          >
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-primary mb-2">Area or Address</label>
        <input
          type="text"
          name="customerAddress"
          value={formData.customerAddress}
          onChange={handleChange}
          placeholder="Dubai, Al Barsha"
          className="w-full px-4 py-3 border border-brandBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-brandTextDark"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-primary mb-2">What do you need? *</label>
        <textarea
          name="details"
          value={formData.details}
          onChange={handleChange}
          rows={5}
          placeholder={`Tell us about your ${serviceTitle.toLowerCase()} request, device model, issue, budget, or any other relevant detail.`}
          className="w-full px-4 py-3 border border-brandBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-brandTextDark"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Preferred Date</label>
          <input
            type="date"
            name="preferredDate"
            value={formData.preferredDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-brandBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-brandTextDark"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-primary mb-2">Preferred Time</label>
          <select
            name="preferredTimePeriod"
            value={formData.preferredTimePeriod}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-brandBorder rounded-xl focus:outline-none focus:ring-2 focus:ring-primary text-brandTextDark"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-brandGreenDark transition-colors disabled:bg-gray-300 disabled:text-gray-600"
      >
        {loading ? 'Submitting request...' : 'Submit Tracked Request'}
      </button>
    </form>
  )
}