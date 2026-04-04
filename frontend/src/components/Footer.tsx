import { Link } from 'react-router-dom'
import { areaNavigationLinks, policyNavigationLinks, serviceNavigationLinks, siteContact, siteIdentity } from '../content/siteData'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-10">
          <div className="xl:pr-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-300">PZM</p>
            <h3 className="mt-3 text-2xl font-bold text-white">{siteIdentity.name}</h3>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">{siteIdentity.tagline}</p>
            <p className="mt-4 text-sm leading-7 text-slate-300">{siteIdentity.summary}</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white">Services</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {serviceNavigationLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white">Areas</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {areaNavigationLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white">Support and Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>
                <a href={siteContact.phoneHref} className="hover:text-white transition-colors">
                  {siteContact.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={siteContact.whatsappSupportHref} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp Support
                </a>
              </li>
              <li>
                <a href={siteContact.mapsHref} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Google Maps
                </a>
              </li>
              <li>
                <Link to={siteContact.blogHref} className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              {policyNavigationLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-sm text-slate-400">
          <p>{siteIdentity.name} - {siteIdentity.tagline}</p>
          <p>&copy; {currentYear} All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
