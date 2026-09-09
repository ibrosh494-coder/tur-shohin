import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react'
import { useApp } from '../../lib/AppContext'
import { SITE } from '../../config/site'
import { cn } from '../ui'

const LINKS = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.tours', to: '/tours' },
  { key: 'nav.destinations', to: '/tours?tab=dest' },
  { key: 'nav.gallery', to: '/gallery' },
  { key: 'nav.contact', to: '/contact' },
  { key: 'news.title', to: '/news' },
]

const TYPES = [
  { to: '/tours?type=trekking', label: 'Треккинг' },
  { to: '/tours?type=pamir-highway', label: 'Памирский тракт' },
  { to: '/tours?type=culture', label: 'Культурные туры' },
  { to: '/tours?type=winter', label: 'Зимний отдых' },
  { to: '/tours?type=family', label: 'Семейные туры' },
  { to: '/tours?type=international', label: 'Международные' },
]

export function Footer() {
  const { t } = useApp()
  return (
    <footer className="border-t border-graphite-100 bg-graphite-950 pb-24 text-graphite-300 md:pb-0">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-pine-600 font-display text-lg font-bold text-white">ТШ</span>
            <span className="font-display text-xl font-bold text-white">ТУР ШОХИН</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-graphite-400">{t('ft.desc')}</p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{t('ft.links')}</h4>
          <ul className="space-y-2.5">
            {LINKS.map((l) => (
              <li key={l.key + l.to}>
                <Link to={l.to} className="text-sm text-graphite-400 transition-colors hover:text-sand-400">
                  {t(l.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Типы туров</h4>
          <ul className="space-y-2.5">
            {TYPES.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-sm text-graphite-400 transition-colors hover:text-sand-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{t('ft.contacts')}</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-pine-400" />
              <a href={`tel:${SITE.phone}`} className="text-graphite-400 hover:text-white">{SITE.phone}</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-pine-400" />
              <a href={`mailto:${SITE.email}`} className="text-graphite-400 hover:text-white">{SITE.email}</a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-pine-400" />
              <span className="text-graphite-400">{SITE.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Send className="h-4 w-4 text-pine-400" />
              <a href={`https://t.me/${SITE.telegram.slice(1)}`} className="text-graphite-400 hover:text-white">Telegram {SITE.telegram}</a>
            </li>
            <li className="flex items-center gap-3">
              <MessageCircle className="h-4 w-4 text-pine-400" />
              <a href={`https://wa.me/${SITE.whatsapp.replace(/[^0-9]/g, '')}`} className="text-graphite-400 hover:text-white">WhatsApp</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-graphite-800">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-6 text-xs text-graphite-500 md:flex-row">
          <span>© {new Date().getFullYear()} «Тур Шохин». {t('ft.rights')}.</span>
          <div className={cn('flex items-center gap-1.5 text-graphite-500')}>
            <span>RU</span>·<span>TJ</span>·<span>EN</span>
          </div>
        </div>
      </div>
    </footer>
  )
}