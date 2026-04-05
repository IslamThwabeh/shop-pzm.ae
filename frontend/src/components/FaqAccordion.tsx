import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { HomeFaqItem } from '../content/homePageContent'

interface FaqAccordionProps {
  items: HomeFaqItem[]
}

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-3xl divide-y divide-brandBorder rounded-[28px] border border-brandBorder bg-white shadow-sm">
      {items.map((item, index) => {
        const isOpen = openIndex === index

        return (
          <div key={index}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-slate-50"
            >
              <span className="text-base font-semibold text-slate-900">{item.question}</span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-brandTextMedium transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-5 text-sm leading-7 text-brandTextMedium">
                {item.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
