import { useState } from 'react'
import { BarChart3, ClipboardList, Lock, ShieldCheck, User, Wrench } from 'lucide-react'
import { hashPassword } from '../utils/crypto'

interface AdminLoginProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function AdminLogin({ onSuccess, onCancel }: AdminLoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Hash the password before sending
      const passwordHash = await hashPassword(password)

      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: passwordHash }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Invalid credentials')
      }

      const data = await response.json()
      localStorage.setItem('adminToken', data.data.token)
      localStorage.setItem('adminUser', JSON.stringify(data.data.user))
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-portal min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(0,167,111,0.16),transparent_20%),radial-gradient(circle_at_bottom_left,rgba(30,41,59,0.14),transparent_26%),linear-gradient(135deg,#0f172a_0%,#172033_48%,#1a2744_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8 lg:py-16">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.16),transparent_70%)]" />
      <div className="pointer-events-none absolute left-0 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(0,167,111,0.14),transparent_70%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.02fr,0.82fr] lg:items-center">
        <section className="admin-glass overflow-hidden rounded-[32px] bg-[rgba(255,255,255,0.12)] p-8 shadow-[var(--shadow-xl)] md:p-12">
          <span className="inline-flex rounded-full bg-white/18 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-200 shadow-sm">
            PZM Admin
          </span>
          <h1 className="admin-heading-accent mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            One clean place to track pending, confirmed, and canceled work
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
            The portal stays intentionally small. Use it to confirm item orders, confirm service jobs, and review the month without turning it into a heavy operations system.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="admin-glass-soft rounded-[28px] bg-white/14 p-5">
              <ClipboardList className="text-emerald-200" size={22} />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">Orders</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">Track item orders with only the states that matter: pending, confirmed, and canceled.</p>
            </div>
            <div className="admin-glass-soft rounded-[28px] bg-white/14 p-5">
              <Wrench className="text-emerald-200" size={22} />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">Services</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">Handle service jobs with the same simple confirmation flow used for product orders.</p>
            </div>
            <div className="admin-glass-soft rounded-[28px] bg-white/14 p-5">
              <BarChart3 className="text-emerald-200" size={22} />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-200">Reports</p>
              <p className="mt-2 text-sm leading-7 text-slate-200">Review confirmed revenue, pending value, and canceled work for both items and services.</p>
            </div>
          </div>

          <div className="admin-glass-soft mt-8 rounded-[28px] bg-white/14 p-6">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/18 text-emerald-200">
                <ShieldCheck size={22} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-white">Built for a simple shared workflow</h2>
                <p className="mt-2 text-sm leading-7 text-slate-200">
                  Product setup stays out of the portal. The admin is only for checking what is pending, what got confirmed, and what was canceled.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-glass rounded-[32px] bg-white/76 p-8 md:p-10">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(0,167,111,0.12)] text-primary shadow-sm">
              <Lock size={30} />
            </div>
            <h2 className="mt-5 text-3xl font-bold text-slate-950">Admin Login</h2>
            <p className="mt-3 text-brandTextMedium">Sign in to review pending work, confirmed work, and canceled work.</p>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-semibold text-brandTextDark">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brandTextMedium" size={20} />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full rounded-full border border-white/60 bg-white/82 px-12 py-3 text-brandTextDark placeholder:text-brandTextMedium focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-brandTextDark">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brandTextMedium" size={20} />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-full border border-white/60 bg-white/82 px-12 py-3 text-brandTextDark placeholder:text-brandTextMedium focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="pt-3 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-[linear-gradient(135deg,#7adf38_0%,#00A76F_100%)] px-5 py-3 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Open Admin'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-full border border-white/60 bg-white/82 px-5 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
              >
                Back
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}
