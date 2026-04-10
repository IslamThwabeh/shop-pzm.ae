import { useEffect, useRef, useState } from 'react'
import { Lock } from 'lucide-react'
import { hashPassword } from '../utils/crypto'

interface AdminLoginProps {
  onSuccess: () => void
  onCancel: () => void
}

const CABLE_BASE_HEIGHT = 56
const CABLE_MAX_PULL = 66
const CABLE_THRESHOLD = 34

export default function AdminLogin({ onSuccess, onCancel }: AdminLoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [challengeId, setChallengeId] = useState<string | null>(null)
  const [verificationDestination, setVerificationDestination] = useState<string | null>(null)
  const [loginStep, setLoginStep] = useState<'credentials' | 'verification'>('credentials')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [lampOn, setLampOn] = useState(false)
  const [isDraggingCable, setIsDraggingCable] = useState(false)
  const [cablePull, setCablePull] = useState(0)
  const dragStartYRef = useRef<number | null>(null)
  const usernameInputRef = useRef<HTMLInputElement | null>(null)
  const verificationInputRef = useRef<HTMLInputElement | null>(null)
  const suppressCableClickRef = useRef(false)
  const isVerificationStep = loginStep === 'verification'

  const toggleLamp = () => {
    if (loading) {
      return
    }

    setLampOn((current) => !current)
    setError(null)
  }

  useEffect(() => {
    if (lampOn) {
      if (isVerificationStep) {
        verificationInputRef.current?.focus()
      } else {
        usernameInputRef.current?.focus()
      }
    }
  }, [isVerificationStep, lampOn])

  useEffect(() => {
    if (!isDraggingCable) {
      return undefined
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (dragStartYRef.current === null) {
        return
      }

      const nextPull = Math.max(0, Math.min(CABLE_MAX_PULL, event.clientY - dragStartYRef.current))
      setCablePull(nextPull)
    }

    const handlePointerRelease = () => {
      if (dragStartYRef.current === null) {
        return
      }

      if (cablePull >= CABLE_THRESHOLD && !loading) {
        setLampOn((current) => !current)
        setError(null)
        suppressCableClickRef.current = true
      }

      dragStartYRef.current = null
      setIsDraggingCable(false)
      setCablePull(0)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerRelease)
    window.addEventListener('pointercancel', handlePointerRelease)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerRelease)
      window.removeEventListener('pointercancel', handlePointerRelease)
    }
  }, [cablePull, isDraggingCable, loading])

  const beginCableDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (loading) {
      return
    }

    suppressCableClickRef.current = false
    dragStartYRef.current = event.clientY - cablePull
    setIsDraggingCable(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleCableClick = () => {
    if (loading) {
      return
    }

    if (suppressCableClickRef.current) {
      suppressCableClickRef.current = false
      return
    }

    toggleLamp()
  }

  const handleCableKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return
    }

    event.preventDefault()
    toggleLamp()
  }

  const completeLogin = (data: { token: string; user: unknown }) => {
    localStorage.setItem('adminToken', data.token)
    localStorage.setItem('adminUser', JSON.stringify(data.user))
    onSuccess()
  }

  const resetVerificationStep = () => {
    setLoginStep('credentials')
    setChallengeId(null)
    setVerificationCode('')
    setVerificationDestination(null)
  }

  const handleBack = () => {
    setError(null)

    if (isVerificationStep) {
      resetVerificationStep()
      return
    }

    onCancel()
  }

  const requestVerificationCode = async () => {
    const passwordHash = await hashPassword(password)

    const response = await fetch('/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: passwordHash }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Invalid credentials')
    }

    if (data.data?.requiresTwoFactor && data.data?.challengeId) {
      setChallengeId(data.data.challengeId)
      setVerificationDestination(data.data.destination || null)
      setVerificationCode('')
      setLoginStep('verification')
      return
    }

    if (data.data?.token && data.data?.user) {
      completeLogin(data.data)
      return
    }

    throw new Error('Unexpected login response')
  }

  const verifyLoginCode = async () => {
    if (!challengeId) {
      throw new Error('Verification expired. Please login again.')
    }

    const normalizedCode = verificationCode.replace(/\s+/g, '').trim()

    const response = await fetch('/api/auth/admin/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ challengeId, code: normalizedCode }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Verification failed')
    }

    if (data.data?.token && data.data?.user) {
      completeLogin(data.data)
      return
    }

    throw new Error('Unexpected verification response')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isVerificationStep) {
        await verifyLoginCode()
      } else {
        await requestVerificationCode()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'

      if (message.toLowerCase().includes('login again')) {
        resetVerificationStep()
      }

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const sceneActive = lampOn || isDraggingCable

  return (
    <div className="admin-portal relative min-h-screen overflow-hidden bg-[#111015] px-4 py-4 text-white sm:px-6 lg:px-8 lg:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_34%),linear-gradient(180deg,#17161c_0%,#111015_100%)]" />
      <div className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${sceneActive ? 'opacity-100' : 'opacity-55'}`}>
        <div className="absolute left-1/2 top-12 h-[18rem] w-[18rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(244,211,94,0.1),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-amber-200/80">PZM Admin</p>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-semibold text-white/80 transition-colors hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
          >
            Exit
          </button>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#18171d_0%,#111015_100%)] shadow-[0_22px_56px_rgba(0,0,0,0.38)]">
          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-stretch">
            <div className="relative overflow-hidden rounded-[24px] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.03),transparent_42%),linear-gradient(180deg,#15141a_0%,#101015_100%)] px-4 py-4 sm:px-5 sm:py-5">
              <p className="relative text-[11px] font-semibold uppercase tracking-[0.22em] text-white/42">Lamp</p>

              <div className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${sceneActive ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute left-1/2 top-[22%] h-44 w-44 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(248,226,145,0.32),transparent_70%)] blur-2xl" />
              </div>

              <div className="relative flex min-h-[16rem] items-end justify-center sm:min-h-[17.5rem]">
                <div className="relative flex w-full max-w-[11rem] shrink-0 flex-col items-center pb-1">
                  <div className={`absolute left-1/2 top-[1.8rem] h-[8rem] w-[10.5rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(251,228,148,0.44),transparent_72%)] blur-2xl transition-all duration-300 ${sceneActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
                  <div className="relative h-[12rem] w-full">
                    <div className={`absolute left-1/2 top-0 h-[4rem] w-[7.8rem] -translate-x-1/2 rounded-t-[999px] rounded-b-[1.8rem] border border-[#f3ead9]/30 bg-[#f7f0e1] shadow-[0_10px_20px_rgba(255,245,210,0.08)] transition-all duration-300 ${sceneActive ? 'brightness-100' : 'brightness-90'}`} />
                    <div className={`absolute left-1/2 top-[2.7rem] h-2 w-[5.7rem] -translate-x-1/2 rounded-full bg-white/30 blur-sm transition-opacity duration-300 ${sceneActive ? 'opacity-100' : 'opacity-0'}`} />
                    <div className="absolute left-1/2 top-[3.7rem] h-[5.8rem] w-3 -translate-x-1/2 rounded-full bg-[#ece4d6] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)]" />
                    <div className="absolute left-1/2 top-[9.1rem] h-2.5 w-[4.6rem] -translate-x-1/2 rounded-full bg-[#ece4d6] shadow-[0_12px_24px_rgba(0,0,0,0.2)]" />

                    <div className="absolute left-[67%] top-[1.1rem] flex flex-col items-center">
                      <div className="w-px bg-white/25 transition-[height] duration-75" style={{ height: `${CABLE_BASE_HEIGHT + cablePull}px` }} />
                      <button
                        type="button"
                        aria-label="Pull lamp cable"
                        onPointerDown={beginCableDrag}
                        onClick={handleCableClick}
                        onKeyDown={handleCableKeyDown}
                        className={`relative mt-[-1px] inline-flex h-5 w-5 touch-none select-none items-center justify-center rounded-full border border-[#d6b078]/60 bg-[radial-gradient(circle,#f6d29a_0%,#c98f4a_100%)] shadow-[0_8px_16px_rgba(0,0,0,0.24)] transition-transform duration-150 ${isDraggingCable ? 'scale-110' : 'hover:scale-105'}`}
                        style={{ transform: `translateY(${cablePull}px)` }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white/85" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside className="flex min-h-[20rem]">
              {lampOn ? (
                <section className="relative w-full self-stretch overflow-hidden rounded-[24px] border border-white/12 bg-[linear-gradient(180deg,rgba(40,38,45,0.92)_0%,rgba(21,20,27,0.96)_100%)] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.34)] backdrop-blur-xl sm:p-5">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,228,148,0.12),transparent_42%)]" />

                  <div className="relative text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-amber-100 shadow-sm">
                      <Lock size={18} />
                    </div>
                    <h2 className="mt-3 text-[1.35rem] font-bold text-white">{isVerificationStep ? 'Verify Login' : 'Admin Login'}</h2>
                    {isVerificationStep && verificationDestination && (
                      <p className="mt-2 text-sm text-white/62">Enter the 6-digit code sent to {verificationDestination}.</p>
                    )}
                  </div>

                  {error && (
                    <div className="relative mt-4 rounded-[16px] border border-red-400/30 bg-red-400/10 px-4 py-3">
                      <p className="text-sm font-medium text-red-100">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="relative mt-5 space-y-3.5">
                    {isVerificationStep ? (
                      <div>
                        <label htmlFor="verification-code" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/62">
                          Verification Code
                        </label>
                        <input
                          ref={verificationInputRef}
                          id="verification-code"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          value={verificationCode}
                          onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full rounded-[14px] border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-center text-lg tracking-[0.28em] text-white focus:outline-none focus:ring-2 focus:ring-amber-300/70"
                          required
                        />
                      </div>
                    ) : (
                      <>
                        <div>
                          <label htmlFor="username" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/62">
                            Username
                          </label>
                          <input
                            ref={usernameInputRef}
                            id="username"
                            type="text"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            className="w-full rounded-[14px] border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-300/70"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="password" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/62">
                            Password
                          </label>
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            className="w-full rounded-[14px] border border-white/10 bg-white/[0.06] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-300/70"
                            required
                          />
                        </div>
                      </>
                    )}

                    <div className="pt-1 space-y-2.5">
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex w-full items-center justify-center rounded-[14px] bg-[linear-gradient(135deg,#f7d66c_0%,#fff1b0_38%,#c88d32_100%)] px-4 py-2.5 text-sm font-semibold text-slate-950 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(225,181,73,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {loading ? (isVerificationStep ? 'Verifying...' : 'Sending code...') : (isVerificationStep ? 'Verify' : 'Continue')}
                      </button>
                      <button
                        type="button"
                        onClick={handleBack}
                        className="w-full rounded-[14px] border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:border-white/20 hover:bg-white/[0.1] hover:text-white"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                </section>
              ) : (
                <section className="flex w-full flex-col justify-between rounded-[24px] border border-dashed border-white/12 bg-white/[0.04] p-4 backdrop-blur-sm sm:p-5">
                  <div className="text-center">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.06] text-white/80">
                      <Lock size={18} />
                    </div>
                    <h2 className="mt-3 text-[1.2rem] font-bold text-white">Locked</h2>
                  </div>

                  <div className="mt-4 rounded-[18px] border border-white/10 bg-black/10 p-4 text-center">
                    <button
                      type="button"
                      onClick={toggleLamp}
                      className="inline-flex items-center justify-center rounded-[14px] border border-white/12 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/20 hover:bg-white/[0.12]"
                    >
                      Turn On
                    </button>
                  </div>
                </section>
              )}
            </aside>
          </div>
        </section>
      </div>
    </div>
  )
}
