import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { getStoreHoursSnapshot, weeklyHoursText } from '../utils/storeHours'
import { buildApiUrl } from '../utils/siteConfig'

const CACHE_KEY = 'pzm_biz_hours'
const CACHE_TTL_MS = 60 * 60 * 1000 // 60 minutes

function getCachedHours(): string[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { hours, ts } = JSON.parse(raw) as { hours?: unknown; ts?: unknown }
    if (!Array.isArray(hours) || !hours.every((row): row is string => typeof row === 'string')) {
      return null
    }
    if (typeof ts !== 'number' || !Number.isFinite(ts)) {
      return null
    }
    if (Date.now() - ts > CACHE_TTL_MS) return null
    return hours
  } catch {
    return null
  }
}

function setCachedHours(hours: string[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ hours, ts: Date.now() }))
  } catch {
    // sessionStorage unavailable — ignore
  }
}

export default function StoreHoursPanel() {
  const [snapshot, setSnapshot] = useState(() => getStoreHoursSnapshot())
  const [apiHours, setApiHours] = useState<string[] | null>(() => getCachedHours())
  const [hoursLoading, setHoursLoading] = useState(apiHours === null)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSnapshot(getStoreHoursSnapshot())
    }, 60000)
    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (apiHours !== null) return // already have cached hours
    let cancelled = false
    fetch(buildApiUrl('/business-hours'))
      .then((response) => {
        if (!response.ok) {
          throw new Error(`business-hours request failed: ${response.status}`)
        }
        return response.json()
      })
      .then((data: unknown) => {
        if (cancelled) return
        const rows = (data as { result?: { opening_hours?: { weekday_text?: string[] } } })
          ?.result?.opening_hours?.weekday_text
        if (Array.isArray(rows) && rows.length > 0) {
          setApiHours(rows)
          setCachedHours(rows)
        }
      })
      .catch(() => { /* use fallback */ })
      .finally(() => { if (!cancelled) setHoursLoading(false) })
    return () => { cancelled = true }
  }, [])

  const displayHours = apiHours ?? weeklyHoursText

  return (
    <div className="rounded-2xl border border-brandBorder bg-gray-50 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Store Hours</p>
          <h3 className="mt-2 text-xl font-bold text-brandTextDark">Dubai working hours</h3>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
            snapshot.isOpen ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-700'
          }`}
        >
          <Clock3 size={14} className="mr-2" />
          {snapshot.badge}
        </span>
      </div>

      <p className="mt-3 text-sm text-brandTextMedium">{snapshot.note}</p>

      <div className="mt-5 space-y-2 text-sm">
        {hoursLoading ? (
          <>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </>
        ) : (
          displayHours.map((row) => {
            const colonIdx = row.indexOf(':')
            const day = colonIdx !== -1 ? row.slice(0, colonIdx) : row
            const hours = colonIdx !== -1 ? row.slice(colonIdx + 1).trim() : ''
            const isToday = day === snapshot.todayName

            return (
              <div
                key={row}
                className={`flex items-center justify-between rounded-xl px-3 py-2 ${
                  isToday ? 'bg-white shadow-sm ring-1 ring-primary/20' : ''
                }`}
              >
                <span className={`font-medium ${isToday ? 'text-primary' : 'text-brandTextDark'}`}>
                  {day}
                  {isToday ? ' (Today)' : ''}
                </span>
                <span className="text-brandTextMedium">{hours}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}