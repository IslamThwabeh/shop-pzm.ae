import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Smartphone, Laptop, Tablet, Gamepad2, LayoutGrid } from 'lucide-react'
import {
  deviceFinderOptions,
  getDeviceFinderDestination,
  type DeviceFinderCondition,
  type DeviceFinderKey,
} from '../utils/deviceFinder'
import { useLanguage } from '../context/LanguageContext'

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
  const { lang, toSupportedLocalizedPath } = useLanguage()
  const isAr = lang === 'ar'

  const conditionLabels = {
    brandNew: isAr ? 'أجهزة جديدة' : 'Brand New',
    preOwned: isAr ? 'مستعمل معتمد' : 'Certified Pre-Owned',
  }

  const deviceLabelsAr: Partial<Record<DeviceFinderKey, string>> = {
    iphone: 'آيفون',
    macbook: 'ماك بوك',
    ipad: 'آيباد',
    samsung: 'سامسونج',
    gaming: 'ألعاب',
    all: 'الكل',
  }

  const handleDeviceSelect = (deviceKey: DeviceFinderKey) => {
    if (!condition) return
    const destination = getDeviceFinderDestination(condition, deviceKey)
    navigate(toSupportedLocalizedPath(destination))
  }

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-[#eee] bg-white px-6 py-8 shadow-sm">
      <p className="text-center text-[13px] font-semibold uppercase tracking-widest text-slate-400">
        {isAr ? 'ابحث عن جهازك' : 'Find Your Device'}
      </p>
      <h2 className="mt-2 text-center text-xl font-bold text-slate-900">
        {isAr ? 'ما الذي تبحث عنه؟' : 'What are you looking for?'}
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
          {conditionLabels.brandNew}
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
          {conditionLabels.preOwned}
        </button>
      </div>

      {/* Step 2 — Device type (revealed once condition is set) */}
      {condition && (
        <div className="mt-5">
          <p className="mb-3 text-center text-xs text-slate-400">{isAr ? 'اختر نوع الجهاز' : 'Select a device type'}</p>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
            {deviceFinderOptions.map((device) => {
              const Icon = deviceIcons[device.key]
              const deviceLabel = isAr ? (deviceLabelsAr[device.key] || device.label) : device.label
              return (
                <button
                  key={device.key}
                  type="button"
                  onClick={() => handleDeviceSelect(device.key)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-[#eee] px-2 py-3 text-[12px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Icon size={20} className="text-slate-400" />
                  {deviceLabel}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {!condition && (
        <p className="mt-4 text-center text-[11px] text-slate-400">
          {isAr ? 'اختر حالة الجهاز أولاً لعرض الخيارات' : 'Choose a condition above to see device options'}
        </p>
      )}
    </div>
  )
}
