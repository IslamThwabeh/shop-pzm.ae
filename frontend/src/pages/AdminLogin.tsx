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
    <div className="min-h-screen overflow-hidden bg-[#f0f7ff] px-4 py-10 text-slate-900 sm:px-6 lg:px-8 lg:py-16">
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.16),transparent_70%)]" />
      <div className="pointer-events-none absolute left-0 bottom-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(0,167,111,0.14),transparent_70%)]" />

      <div className="relative mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.02fr,0.82fr] lg:items-center">
        <section className="overflow-hidden rounded-[32px] border border-brandBorder bg-[linear-gradient(180deg,#f0f7ff_0%,#e8f4fd_100%)] p-8 shadow-sm md:p-12">
          <span className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-sky-700 shadow-sm">
            PZM Admin
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl">
            One clean place for orders, service follow-up, and monthly reporting
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-brandTextMedium">
            The admin side now stays lean on purpose. Track customer orders, follow service requests, and review monthly performance without turning this into a heavy back-office system.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm">
              <ClipboardList className="text-primary" size={22} />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">Orders</p>
              <p className="mt-2 text-sm leading-7 text-brandTextMedium">Keep the order workflow limited to the key business states the shop actually uses.</p>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm">
              <Wrench className="text-primary" size={22} />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">Service</p>
              <p className="mt-2 text-sm leading-7 text-brandTextMedium">Handle repair and callback requests with the same simplified status model.</p>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm">
              <BarChart3 className="text-primary" size={22} />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-primary">Reports</p>
              <p className="mt-2 text-sm leading-7 text-brandTextMedium">Review monthly revenue, open pipeline, cancellations, and service-request demand.</p>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-primary">
                <ShieldCheck size={22} />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Built for a small-shop workflow</h2>
                <p className="mt-2 text-sm leading-7 text-brandTextMedium">
                  Product data stays code-managed, while the admin stays focused on customer communication, delivery progress, and monthly business visibility.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-brandBorder bg-white/90 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur md:p-10">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brandLight text-primary shadow-sm">
              <Lock size={30} />
            </div>
            <h2 className="mt-5 text-3xl font-bold text-slate-950">Admin Login</h2>
            <p className="mt-3 text-brandTextMedium">Sign in to access order follow-up, service requests, and monthly reporting.</p>
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
                  className="w-full rounded-2xl border border-brandBorder bg-white px-12 py-3 text-brandTextDark placeholder:text-brandTextMedium focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full rounded-2xl border border-brandBorder bg-white px-12 py-3 text-brandTextDark placeholder:text-brandTextMedium focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="pt-3 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brandGreenDark disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Open Admin'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-2xl border border-brandBorder bg-slate-50 px-5 py-3 text-sm font-semibold text-brandTextDark transition-colors hover:border-primary hover:text-primary"
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
