import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Smartphone, Laptop, Tablet, Gamepad2, LayoutGrid } from 'lucide-react'
import {
  deviceFinderOptions,
  getDeviceFinderDestination,
  type DeviceFinderCondition,
  type DeviceFinderKey,
} from '../utils/deviceFinder'

const deviceIcons: Record<DeviceFinderKey, React.ElementType> = {
  iphone: Smartphone,
  macbook: Laptop,
  ipad: Tablet,
  samsung: Smartphone,
  gaming: Gamepad2,
  all: LayoutGrid,
}

export default function DeviceFinder() {
  const [condition, setCondition] = useState<DeviceFinderCondition | null>(null)
  const navigate = useNavigate()

  const handleDeviceSelect = (deviceKey: DeviceFinderKey) => {
    if (!condition) return
    navigate(getDeviceFinderDestination(condition, deviceKey))
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[#eee] bg-white px-6 py-8 shadow-sm">
      <p className="text-center text-[13px] font-semibold uppercase tracking-widest text-slate-400">
        Find Your Device
      </p>
      <h2 className="mt-2 text-center text-xl font-bold text-slate-900">
        What are you looking for?
      </h2>

      {/* Step 1 — Condition */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => setCondition('brand-new')}
          className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-colors ${
            condition === 'brand-new'
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-[#eee] text-slate-700 hover:border-slate-300 hover:text-slate-900'
          }`}
        >
          Brand New
        </button>
        <button
          type="button"
          onClick={() => setCondition('pre-owned')}
          className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition-colors ${
            condition === 'pre-owned'
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-[#eee] text-slate-700 hover:border-slate-300 hover:text-slate-900'
          }`}
        >
          Certified Pre-Owned
        </button>
      </div>

      {/* Step 2 — Device type (revealed once condition is set) */}
      {condition && (
        <div className="mt-5">
          <p className="mb-3 text-center text-xs text-slate-400">Select a device type</p>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {deviceFinderOptions.map((device) => {
              const Icon = deviceIcons[device.key]
              return (
                <button
                  key={device.key}
                  type="button"
                  onClick={() => handleDeviceSelect(device.key)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-[#eee] px-2 py-3 text-[12px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Icon size={20} className="text-slate-400" />
                  {device.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {!condition && (
        <p className="mt-4 text-center text-[11px] text-slate-400">
          Choose a condition above to see device options
        </p>
      )}
    </div>
  )
}
