import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, MapPinned, Store, Truck } from 'lucide-react'
import { apiService } from '../services/api'

type BookingMode = 'store' | 'pickup'
type TimePeriod = 'morning' | 'afternoon' | 'evening'

type SlotOption = {
  label: string
  minutes: number
}

const SERVICE_OPTIONS = [
  { value: 'repair-macbook', label: 'MacBook Repair' },
  { value: 'repair-mobile', label: 'iPhone / Android Repair' },
  { value: 'maintenance', label: 'Device Cleaning / Maintenance' },
  { value: 'gaming-pc', label: 'Custom Gaming PC Build' },
  { value: 'sell-gadgets', label: 'Sell My Device' },
  { value: 'other-inquiry', label: 'Other Inquiry' },
]

const TIME_SLOTS: Record<TimePeriod, SlotOption[]> = {
  morning: [
    { label: '10:00 AM', minutes: 10 * 60 },
    { label: '10:30 AM', minutes: 10 * 60 + 30 },
    { label: '11:00 AM', minutes: 11 * 60 },
    { label: '11:30 AM', minutes: 11 * 60 + 30 },
    { label: '12:00 PM', minutes: 12 * 60 },
    { label: '12:30 PM', minutes: 12 * 60 + 30 },
  ],
  afternoon: [
    { label: '01:00 PM', minutes: 13 * 60 },
    { label: '01:30 PM', minutes: 13 * 60 + 30 },
    { label: '02:00 PM', minutes: 14 * 60 },
    { label: '02:30 PM', minutes: 14 * 60 + 30 },
    { label: '03:00 PM', minutes: 15 * 60 },
    { label: '03:30 PM', minutes: 15 * 60 + 30 },
    { label: '04:00 PM', minutes: 16 * 60 },
    { label: '04:30 PM', minutes: 16 * 60 + 30 },
  ],
  evening: [
    { label: '05:00 PM', minutes: 17 * 60 },
    { label: '05:30 PM', minutes: 17 * 60 + 30 },
    { label: '06:00 PM', minutes: 18 * 60 },
    { label: '06:30 PM', minutes: 18 * 60 + 30 },
    { label: '07:00 PM', minutes: 19 * 60 },
    { label: '07:30 PM', minutes: 19 * 60 + 30 },
    { label: '08:00 PM', minutes: 20 * 60 },
    { label: '08:30 PM', minutes: 20 * 60 + 30 },
    { label: '09:00 PM', minutes: 21 * 60 },
    { label: '09:30 PM', minutes: 21 * 60 + 30 },
    { label: '10:00 PM', minutes: 22 * 60 },
    { label: '10:30 PM', minutes: 22 * 60 + 30 },
  ],
}

function getDubaiNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }))
}

function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type HomeAppointmentPanelProps = {
  sourcePage?: string
  defaultServiceType?: string
}

export default function HomeAppointmentPanel({
  sourcePage = '/#appointment',
  defaultServiceType,
}: HomeAppointmentPanelProps) {
  const today = useMemo(() => formatDateInput(getDubaiNow()), [])
  const pickupMinDate = useMemo(() => {
    const nextDay = getDubaiNow()
    nextDay.setDate(nextDay.getDate() + 1)
    return formatDateInput(nextDay)
  }, [])

  const [mode, setMode] = useState<BookingMode>('store')
  const [serviceType, setServiceType] = useState(() => {
    if (defaultServiceType && SERVICE_OPTIONS.some((option) => option.value === defaultServiceType)) {
      return defaultServiceType
    }

    return SERVICE_OPTIONS[0].value
  })
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [preferredDate, setPreferredDate] = useState(today)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('morning')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [pickupAddress, setPickupAddress] = useState('Dubai, ')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successId, setSuccessId] = useState<string | null>(null)

  const availableSlots = useMemo(() => {
    const baseSlots = TIME_SLOTS[timePeriod]
    if (preferredDate !== today) return baseSlots

    const now = getDubaiNow()
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + 30
    return baseSlots.filter((slot) => slot.minutes >= currentMinutes)
  }, [preferredDate, timePeriod, today])

  useEffect(() => {
    if (mode === 'pickup' && preferredDate < pickupMinDate) {
      setPreferredDate(pickupMinDate)
    }
    if (mode === 'store' && preferredDate < today) {
      setPreferredDate(today)
    }
  }, [mode, pickupMinDate, preferredDate, today])

  useEffect(() => {
    if (!availableSlots.length) {
      setSelectedSlot('')
      return
    }

    if (!availableSlots.some((slot) => slot.label === selectedSlot)) {
      setSelectedSlot(availableSlots[0].label)
    }
  }, [availableSlots, selectedSlot])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!customerName.trim()) {
      setError('Name is required.')
      return
    }

    if (!customerPhone.trim() || !/^\+?[\d\s\-()]{7,}$/.test(customerPhone)) {
      setError('Enter a valid phone number.')
      return
    }

    if (!preferredDate) {
      setError('Choose a preferred date.')
      return
    }

    if (mode === 'pickup' && preferredDate < pickupMinDate) {
      setError('Pickup and return requires at least 24 hours notice.')
      return
    }

    if (!selectedSlot) {
      setError('Choose a time slot for this booking.')
      return
    }

    if (!details.trim()) {
      setError('Add a short summary of the device or service needed.')
      return
    }

    setSubmitting(true)

    try {
      const selectedService = SERVICE_OPTIONS.find((option) => option.value === serviceType)
      const request = await apiService.createServiceRequest({
        service_type: serviceType,
        request_kind: 'booking',
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim(),
        customer_address: mode === 'pickup' ? pickupAddress.trim() || undefined : undefined,
        details: [
          `Booking method: ${mode === 'store' ? 'Store drop-off' : 'Pick up and return'}`,
          `Requested service: ${selectedService?.label ?? serviceType}`,
          `Preferred time: ${timePeriod} / ${selectedSlot}`,
          `Summary: ${details.trim()}`,
        ].join('\n'),
        preferred_date: preferredDate,
        preferred_time_period: timePeriod,
        preferred_contact_method: 'phone',
        source_page: sourcePage,
      })

      if (!request) {
        throw new Error('We could not submit the booking right now.')
      }

      setSuccessId(request.id)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'We could not submit the booking right now.')
    } finally {
      setSubmitting(false)
    }
  }

  if (successId) {
    return (
      <div className="rounded-2xl border border-brandBorder bg-white p-6 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Request submitted</p>
        <h3 className="mt-3 text-2xl font-bold text-slate-900">Your booking request is now in the system</h3>
        <p className="mt-4 text-brandTextMedium">
          We saved your request under reference <span className="font-semibold text-primary">{successId}</span>. The team can now follow it up as a first-party lead instead of relying on WhatsApp history.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-2xl backdrop-blur md:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Book now</p>
          <h3 className="mt-2 text-xl font-bold text-slate-900">Book drop-off or pickup</h3>
        </div>
        <CalendarDays className="text-primary" size={22} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode('store')}
          className={`rounded-2xl border p-4 text-left transition-colors ${
            mode === 'store'
              ? 'border-sky-200 bg-gradient-to-br from-sky-50 to-emerald-50 shadow-sm'
              : 'border-brandBorder bg-white hover:border-primary'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-primary ring-1 ring-brandBorder">
              <Store size={16} />
            </span>
            <div>
              <p className="font-semibold text-slate-900">I will bring my device</p>
              <p className="mt-1 text-sm text-brandTextMedium">Same-day drop-off at the Al Barsha store.</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode('pickup')}
          className={`rounded-2xl border p-4 text-left transition-colors ${
            mode === 'pickup'
              ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-sky-50 shadow-sm'
              : 'border-brandBorder bg-white hover:border-primary'
          }`}
        >
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-primary ring-1 ring-brandBorder">
              <Truck size={16} />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Pick up and return</p>
              <p className="mt-1 text-sm text-brandTextMedium">We collect it from you and return it after service.</p>
            </div>
          </div>
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">Required service</span>
          <select
            value={serviceType}
            onChange={(event) => setServiceType(event.target.value)}
            className="w-full rounded-xl border border-brandBorder px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary"
          >
            {SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">Your name</span>
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-xl border border-brandBorder px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary"
          />
        </label>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">Phone</span>
          <input
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="+971 5X XXX XXXX"
            className="w-full rounded-xl border border-brandBorder px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">Preferred date</span>
          <input
            type="date"
            min={mode === 'pickup' ? pickupMinDate : today}
            value={preferredDate}
            onChange={(event) => setPreferredDate(event.target.value)}
            className="ios-date-input w-full rounded-xl border border-brandBorder px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary"
          />
        </label>
      </div>

      {mode === 'pickup' && (
        <label className="mt-4 block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">Pickup area or address</span>
          <div className="relative">
            <MapPinned size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brandTextMedium" />
            <input
              value={pickupAddress}
              onChange={(event) => setPickupAddress(event.target.value)}
              placeholder="Dubai, Al Barsha"
              className="w-full rounded-xl border border-brandBorder py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-primary"
            />
          </div>
        </label>
      )}

      <div className="mt-5">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">
          <Clock3 size={14} />
          Time period
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['morning', 'afternoon', 'evening'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setTimePeriod(period)}
              className={`rounded-full px-3 py-2 text-sm font-semibold capitalize transition-colors ${
                timePeriod === period
                  ? 'bg-primary text-white'
                  : 'border border-brandBorder bg-white text-brandTextDark hover:border-primary hover:text-primary'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">Select a time slot</div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {availableSlots.length > 0 ? (
            availableSlots.map((slot) => (
              <button
                key={slot.label}
                type="button"
                onClick={() => setSelectedSlot(slot.label)}
                className={`rounded-xl border px-2.5 py-2.5 text-sm font-medium transition-colors ${
                  selectedSlot === slot.label
                    ? 'border-primary bg-brandLight text-primary'
                    : 'border-brandBorder bg-white text-brandTextDark hover:border-primary hover:text-primary'
                }`}
              >
                {slot.label}
              </button>
            ))
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-brandBorder px-4 py-6 text-sm text-brandTextMedium">
              There are no more slots left in this period for the selected date. Choose another period or move the booking to another day.
            </div>
          )}
        </div>
      </div>

      <label className="mt-4 block">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">Device or service summary</span>
        <textarea
          rows={3}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Tell us the device model, issue, or what you want collected or repaired."
          className="w-full rounded-xl border border-brandBorder px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-primary"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-primary px-6 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Submitting tracked booking...' : 'Submit Tracked Booking'}
      </button>
    </form>
  )
}