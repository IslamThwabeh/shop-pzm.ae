import { useEffect, useState } from 'react'
import { Clock3 } from 'lucide-react'
import { getStoreHoursSnapshot, weeklyHoursText } from '../utils/storeHours'

export default function StoreHoursPanel() {
  const [snapshot, setSnapshot] = useState(() => getStoreHoursSnapshot())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSnapshot(getStoreHoursSnapshot())
    }, 60000)

    return () => window.clearInterval(intervalId)
  }, [])

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
        {weeklyHoursText.map((row) => {
          const [day, hours] = row.split(': ')
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
        })}
      </div>
    </div>
  )
}