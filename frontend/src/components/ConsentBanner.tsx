import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const CONSENT_KEY = 'pzm_consent_accepted'

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, new Date().toISOString())
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 bg-white px-4 py-3 shadow-lg sm:flex sm:items-center sm:justify-between sm:px-6">
      <p className="text-sm text-brandTextMedium">
        We collect minimal technical data (city, country) to serve you better.{' '}
        <Link to="/terms#privacy" className="text-primary underline">Privacy Policy</Link>
      </p>
      <button
        onClick={accept}
        className="mt-2 sm:mt-0 sm:ml-4 shrink-0 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Got it
      </button>
    </div>
  )
}
