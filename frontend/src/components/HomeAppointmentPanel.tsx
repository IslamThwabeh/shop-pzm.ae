import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Clock3, MapPinned, MessageCircle, Store, Truck } from 'lucide-react'
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
  density?: 'default' | 'compact'
  quickContactHref?: string
  quickContactLabel?: string
}

export default function HomeAppointmentPanel({
  sourcePage = '/#appointment',
  defaultServiceType,
  density = 'default',
  quickContactHref,
  quickContactLabel = 'Message us on WhatsApp',
}: HomeAppointmentPanelProps) {
  const isCompact = density === 'compact'
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

  const formPaddingClass = isCompact ? 'p-4 md:p-5' : 'p-5 md:p-6'
  const headerMarginClass = isCompact ? 'mb-4' : 'mb-5'
  const sectionSpacingClass = isCompact ? 'mt-4' : 'mt-5'
  const subsectionSpacingClass = isCompact ? 'mt-3' : 'mt-4'
  const labelSpacingClass = isCompact ? 'mb-1.5' : 'mb-2'
  const inputPaddingClass = isCompact ? 'px-3 py-2' : 'px-3 py-2.5'
  const pickupInputPaddingClass = isCompact ? 'py-2 pl-10 pr-3' : 'py-2.5 pl-10 pr-3'
  const modeCardPaddingClass = isCompact ? 'p-3.5' : 'p-4'
  const modeDescriptionSpacingClass = isCompact ? 'mt-0.5' : 'mt-1'
  const timePeriodButtonPaddingClass = isCompact ? 'px-3 py-1.5' : 'px-3 py-2'
  const slotButtonPaddingClass = isCompact ? 'px-2.5 py-2' : 'px-2.5 py-2.5'
  const slotGridClass = isCompact
    ? 'grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6'
    : 'grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4'
  const submitMarginClass = isCompact ? 'mt-4' : 'mt-5'

  return (
    <form onSubmit={handleSubmit} className={`rounded-2xl border border-white/70 bg-white/90 shadow-2xl backdrop-blur ${formPaddingClass}`}>
      <div className={`${headerMarginClass} flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between`}>
        <div className="flex items-start gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brandLight text-primary ring-1 ring-brandBorder">
            <CalendarDays size={18} />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Book now</p>
            <h3 className="mt-1.5 text-xl font-bold text-slate-900">Book drop-off or pickup</h3>
          </div>
        </div>

        {quickContactHref && (
          <a
            href={quickContactHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2.5 self-start rounded-full border border-brandBorder bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:border-primary hover:text-primary sm:w-auto"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brandLight ring-1 ring-brandBorder">
              <MessageCircle size={16} className="text-[#25D366]" />
            </span>
            {quickContactLabel}
          </a>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode('store')}
          className={`rounded-2xl border ${modeCardPaddingClass} text-left transition-colors ${
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
              <p className={`${modeDescriptionSpacingClass} text-sm text-brandTextMedium`}>Same-day drop-off at the Al Barsha store.</p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setMode('pickup')}
          className={`rounded-2xl border ${modeCardPaddingClass} text-left transition-colors ${
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
              <p className={`${modeDescriptionSpacingClass} text-sm text-brandTextMedium`}>We collect it from you and return it after service.</p>
            </div>
          </div>
        </button>
      </div>

      {error && (
        <div className={`${subsectionSpacingClass} rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700`}>
          {error}
        </div>
      )}

      <div className={`${sectionSpacingClass} grid gap-3 md:grid-cols-2`}>
        <label className="block">
          <span className={`${labelSpacingClass} block text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium`}>Required service</span>
          <select
            value={serviceType}
            onChange={(event) => setServiceType(event.target.value)}
            className={`w-full rounded-xl border border-brandBorder text-sm text-slate-900 outline-none transition-colors focus:border-primary ${inputPaddingClass}`}
          >
            {SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Book now</p>
          <span className={`${labelSpacingClass} block text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium`}>Your name</span>
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Enter your name"
            className={`w-full rounded-xl border border-brandBorder text-sm text-slate-900 outline-none transition-colors focus:border-primary ${inputPaddingClass}`}
          />
        </label>
      </div>

      <div className={`${subsectionSpacingClass} grid gap-3 md:grid-cols-2`}>
        <label className="block">
          <span className={`${labelSpacingClass} block text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium`}>Phone</span>
          <input
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="+971 5X XXX XXXX"
            className={`w-full rounded-xl border border-brandBorder text-sm text-slate-900 outline-none transition-colors focus:border-primary ${inputPaddingClass}`}
          />
        </label>

        <label className="block">
          <span className={`${labelSpacingClass} block text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium`}>Preferred date</span>
          <input
            type="date"
            min={mode === 'pickup' ? pickupMinDate : today}
            value={preferredDate}
            onChange={(event) => setPreferredDate(event.target.value)}
            className={`ios-date-input w-full rounded-xl border border-brandBorder text-sm text-slate-900 outline-none transition-colors focus:border-primary ${inputPaddingClass}`}
          />
        </label>
      </div>

      {mode === 'pickup' && (
        <label className={`${subsectionSpacingClass} block`}>
          <span className={`${labelSpacingClass} block text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium`}>Pickup area or address</span>
          <div className="relative">
            <MapPinned size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-brandTextMedium" />
            <input
              value={pickupAddress}
              onChange={(event) => setPickupAddress(event.target.value)}
              placeholder="Dubai, Al Barsha"
              className={`w-full rounded-xl border border-brandBorder text-sm text-slate-900 outline-none transition-colors focus:border-primary ${pickupInputPaddingClass}`}
            />
          </div>
        </label>
      )}

      <div className={sectionSpacingClass}>
        <div className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">
          <Clock3 size={14} />
          Time period
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['morning', 'afternoon', 'evening'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setTimePeriod(period)}
              className={`rounded-full text-sm font-semibold capitalize transition-colors ${timePeriodButtonPaddingClass} ${
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

      <div className={subsectionSpacingClass}>
        <div className="mb-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium">Select a time slot</div>
        <div className={slotGridClass}>
          {availableSlots.length > 0 ? (
            availableSlots.map((slot) => (
              <button
                key={slot.label}
                type="button"
                onClick={() => setSelectedSlot(slot.label)}
                className={`rounded-xl border text-sm font-medium transition-colors ${slotButtonPaddingClass} ${
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

      <label className={`${subsectionSpacingClass} block`}>
        <span className={`${labelSpacingClass} block text-xs font-semibold uppercase tracking-[0.16em] text-brandTextMedium`}>Device or service summary</span>
        <textarea
          rows={isCompact ? 2 : 3}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Tell us the device model, issue, or what you want collected or repaired."
          className={`w-full rounded-xl border border-brandBorder text-sm text-slate-900 outline-none transition-colors focus:border-primary ${inputPaddingClass}`}
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className={`${submitMarginClass} inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-primary px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {submitting ? 'Submitting tracked booking...' : 'Submit Tracked Booking'}
      </button>
    </form>
  )
}