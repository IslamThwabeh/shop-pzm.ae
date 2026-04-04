type StoreWindow = {
  open: [number, number]
  close: [number, number]
}

const STORE_HOURS: Record<number, StoreWindow> = {
  0: { open: [10, 0], close: [25, 0] },
  1: { open: [10, 0], close: [23, 0] },
  2: { open: [10, 0], close: [22, 30] },
  3: { open: [10, 0], close: [23, 0] },
  4: { open: [10, 0], close: [23, 0] },
  5: { open: [10, 0], close: [23, 0] },
  6: { open: [10, 0], close: [24, 0] },
}

export const weeklyHoursText = [
  'Sunday: 10:00 AM - 01:00 AM',
  'Monday: 10:00 AM - 11:00 PM',
  'Tuesday: 10:00 AM - 10:30 PM',
  'Wednesday: 10:00 AM - 11:00 PM',
  'Thursday: 10:00 AM - 11:00 PM',
  'Friday: 10:00 AM - 11:00 PM',
  'Saturday: 10:00 AM - 12:00 AM',
]

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function getDubaiTime() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }))
}

function isOpenAt(now: Date) {
  const day = now.getDay()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const today = STORE_HOURS[day]
  const openMinutes = today.open[0] * 60 + today.open[1]
  const closeMinutes = today.close[0] * 60 + today.close[1]

  if (closeMinutes <= 24 * 60) {
    return currentMinutes >= openMinutes && currentMinutes < closeMinutes
  }

  if (currentMinutes >= openMinutes) return true

  const yesterday = (day + 6) % 7
  const yesterdayClose = STORE_HOURS[yesterday].close[0] * 60 + STORE_HOURS[yesterday].close[1]
  if (yesterdayClose > 24 * 60) {
    const overflowMinutes = yesterdayClose - 24 * 60
    if (currentMinutes < overflowMinutes) return true
  }

  return false
}

export function getStoreHoursSnapshot(now = getDubaiTime()) {
  const isOpen = isOpenAt(now)
  const todayName = dayNames[now.getDay()]

  return {
    isOpen,
    badge: isOpen ? 'Open now' : 'Closed',
    note: isOpen
      ? 'The store is currently open in Dubai time.'
      : 'We still receive calls and messages outside store hours.',
    todayName,
  }
}