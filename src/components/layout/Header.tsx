import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, Search, Heart, Bell, ChevronDown, Check, Ticket } from 'lucide-react'
import { useApp } from '../../lib/AppContext'
import { useAuth } from '../../lib/auth'
import { cn } from '../ui'
import { getDB, getNotifications } from '../../lib/store'

const NAV = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.tours', to: '/tours' },
  { key: 'nav.destinations', to: '/tours?tab=dest' },
  { key: 'nav.about', to: '/about' },
  { key: 'nav.gallery', to: '/gallery' },
  { key: 'nav.contact', to: '/contact' },
]

const LANG_LABEL = { ru: '🇷🇺 RU', tj: '🇹🇯 TJ', en: '🇬🇧 EN' } as const

function useScrolled() {
  const [scrolled, setScrolled] = useState(false)
  const [onDark, setOnDark] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 32)
      if (pathname === '/') {
        setOnDark(window.scrollY < 720)
      } else {
        setOnDark(false)
      }
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  return { scrolled, onDark }
}

function SearchPopover({ dark }: { dark: boolean }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const db = getDB()
  const { t, lang } = useApp()

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return { tours: [], dests: [] }
    const tours = db.tours
      .filter((t) => t.active !== false)
      .filter((t) => t.title.ru.toLowerCase().includes(s) || t.city.toLowerCase().includes(s) || t.country.toLowerCase().includes(s))
      .slice(0, 5)
    const dests = db.destinations.filter((d) => d.name.ru.toLowerCase().includes(s) || d.name.en.toLowerCase().includes(s)).slice(0, 3)
    return { tours, dests }
  }, [q, db.tours, db.destinations])

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label="Поиск"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'grid h-10 w-10 place-items-center rounded-full transition-colors',
          dark ? 'text-white hover:bg-white/15' : 'text-graphite-700 hover:bg-graphite-100',
        )}
      >
        <Search className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-[340px] overflow-hidden rounded-3xl border border-graphite-100 bg-white shadow-lift"
          >
            <div className="border-b border-graphite-100 p-3">
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('search.wherePh')}
                className="input-base"
              />
            </div>
            <div className="max-h-72 overflow-y-auto p-2">
              {q.trim().length >= 2 && results.tours.length === 0 && results.dests.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-graphite-400">Ничего не найдено</p>
              )}
              {results.dests.map((d) => (
                <button
                  key={d.id}
                  onClick={() => {
                    setOpen(false)
                    navigate(`/tours?dest=${d.id}`)
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-graphite-50"
                >
                  <img src={d.image} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  <div>
                    <p className="text-sm font-bold text-graphite-900">{d.name[lang] || d.name.ru}</p>
                    <p className="text-xs text-graphite-400">{d.country}</p>
                  </div>
                </button>
              ))}
              {results.tours.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setOpen(false)
                    navigate(`/tour/${t.slug}`)
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left hover:bg-graphite-50"
                >
                  <img src={t.images[0]} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-graphite-900">{t.title[lang] || t.title.ru}</p>
                    <p className="text-xs text-graphite-400">
                      {t.city} · {t.durationDays} дн.
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SettingsDropdown({ dark }: { dark: boolean }) {
  const { lang, setLang, currency, setCurrency, t } = useApp()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors',
          dark ? 'text-white hover:bg-white/15' : 'text-graphite-700 hover:bg-graphite-100',
        )}
      >
        <span>{LANG_LABEL[lang]}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-56 rounded-3xl border border-graphite-100 bg-white p-3 shadow-lift"
          >
            <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-graphite-400">{t('common.toggle')}</p>
            {(['ru', 'tj', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-graphite-700 hover:bg-graphite-50"
              >
                <span>{LANG_LABEL[l]}</span>
                {lang === l && <Check className="h-4 w-4 text-pine-600" />}
              </button>
            ))}
            <div className="my-2 border-t border-graphite-100" />
            <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-graphite-400">Валюта</p>
            {(['TJS', 'USD', 'EUR'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-graphite-700 hover:bg-graphite-50"
              >
                <span>{c === 'TJS' ? 'TJS · сомони' : c}</span>
                {currency === c && <Check className="h-4 w-4 text-pine-600" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function Header({ menuOpen, onMenuToggle }: { menuOpen: boolean; onMenuToggle: () => void }) {
  const { scrolled } = useScrolled()
  const { t } = useApp()
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)
  const db = getDB()

  useEffect(() => {
    setUnread(user ? getNotifications(user.id).filter((n) => !n.read).length : 0)
  }, [db.notifications, user])

  const active = useLocation().pathname
  const solid = scrolled || menuOpen || active !== '/'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        solid ? 'glass border-b border-graphite-100 shadow-soft' : 'bg-transparent',
      )}
    >
      <div className="container-x flex h-16 items-center gap-2 md:h-[72px] md:gap-6">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span
            className={cn(
              'grid h-9 w-9 place-items-center rounded-xl bg-pine-600 font-display text-lg font-bold text-white shadow-glow md:h-10 md:w-10',
            )}
          >
            ТШ
          </span>
          <span className={cn('hidden font-display text-lg font-bold tracking-wide lg:block', solid ? 'text-graphite-900' : 'text-white')}>
            ТУР ШОХИН
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const isActive = item.to === '/' ? active === '/' : active.startsWith(item.to.split('?')[0])
            return (
              <Link
                key={item.key}
                to={item.to}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  solid ? 'text-graphite-700 hover:bg-graphite-100 hover:text-pine-700' : 'text-white/90 hover:bg-white/15 hover:text-white',
                  isActive && (solid ? 'bg-pine-50 text-pine-700' : 'bg-white/15 text-white'),
                )}
              >
                {t(item.key)}
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          <SearchPopover dark={!solid} />

          <Link
            to={user ? '/account?tab=notifications' : '/account'}
            aria-label="Уведомления"
            className={cn(
              'relative grid h-10 w-10 place-items-center rounded-full transition-colors',
              solid ? 'text-graphite-700 hover:bg-graphite-100' : 'text-white hover:bg-white/15',
            )}
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </Link>

          <Link
            to="/favorites"
            aria-label="Избранное"
            className={cn(
              'relative grid h-10 w-10 place-items-center rounded-full transition-colors',
              solid ? 'text-graphite-700 hover:bg-graphite-100' : 'text-white hover:bg-white/15',
            )}
          >
            <Heart className="h-5 w-5" />
            {(user && (getDB().favorites[user.id]?.length ?? 0) > 0) && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-sand-500" />
            )}
          </Link>

          <div className="hidden md:block">
            <SettingsDropdown dark={!solid} />
          </div>

          <Link to="/tours" className={cn('hidden xl:inline-flex', solid ? 'btn-primary h-10 px-5' : 'btn bg-white text-graphite-900 h-10 px-5 hover:bg-white/90 shadow-soft')}>
            <Ticket className="h-4 w-4" />
            {t('nav.book')}
          </Link>

          <button
            onClick={onMenuToggle}
            aria-label="Меню"
            className={cn(
              'grid h-10 w-10 place-items-center rounded-full transition-colors lg:hidden',
              solid ? 'text-graphite-700 hover:bg-graphite-100' : 'text-white hover:bg-white/15',
            )}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}