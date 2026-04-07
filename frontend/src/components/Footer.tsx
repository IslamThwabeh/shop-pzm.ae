import { MessageCircle, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { footerQuickLinks, siteContact, siteIdentity } from '../content/siteData'

export default function Footer() {
  return (
    <footer className="border-t border-[#eee] bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        {/* Left: copyright */}
        <p className="order-2 sm:order-none">&copy; {new Date().getFullYear()} {siteIdentity.name}</p>

        {/* Center: links */}
        <nav className="order-1 flex flex-wrap justify-center gap-x-5 gap-y-2 sm:order-none">
          {footerQuickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="transition-colors hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right: contact icons */}
        <div className="order-3 flex items-center gap-3 sm:order-none">
          <a
            href={siteContact.phoneHref}
            aria-label="Call us"
            className="transition-colors hover:text-slate-900"
          >
            <Phone size={16} />
          </a>
          <a
            href={siteContact.whatsappSupportHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="transition-colors hover:text-[#25D366]"
          >
            <MessageCircle size={16} />
          </a>
        </div>
      </div>
    </footer>
  )
}
