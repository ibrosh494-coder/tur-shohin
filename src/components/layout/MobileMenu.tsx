import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, User, Sparkles, LogOut } from 'lucide-react'
import { useApp } from '../../lib/AppContext'
import { useAuth } from '../../lib/auth'
import { cn } from '../ui'
import { Logo } from './Logo'

const NAV = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.tours', to: '/tours' },
  { key: 'nav.favorites', to: '/favorites' },
]

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang, setLang, currency, setCurrency } = useApp()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-graphite-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-[86%] max-w-sm flex-col bg-white"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-graphite-100 px-5">
              <Logo variant="dark" className="h-8 md:h-8" />
              <button onClick={onClose} aria-label="Закрыть" className="grid h-10 w-10 place-items-center rounded-full hover:bg-graphite-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col justify-between px-3 py-3">
              <nav className="space-y-1">
                {NAV.map((item) => (
                  <Link
                    key={item.key}
                    to={item.to}
                    onClick={onClose}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold text-graphite-800 hover:bg-pine-50 hover:text-pine-700"
                  >
                    {t(item.key)}
                  </Link>
                ))}
                {user?.role && user.role !== 'user' && (
                  <Link
                    to="/admin"
                    onClick={onClose}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-base font-semibold text-graphite-800 hover:bg-pine-50 hover:text-pine-700"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" /> {t('nav.admin')}
                    </span>
                  </Link>
                )}
              </nav>

              <div className="space-y-2.5 pt-2">
                <div className="flex gap-1.5">
                  {(['ru', 'tj', 'en'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={cn(
                        'flex-1 rounded-xl border py-1.5 text-sm font-bold uppercase transition-colors',
                        lang === l ? 'border-pine-600 bg-pine-600 text-white' : 'border-graphite-200 text-graphite-600',
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  {(['TJS', 'USD', 'EUR'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={cn(
                        'flex-1 rounded-xl border py-1.5 text-sm font-bold transition-colors',
                        currency === c ? 'border-pine-600 bg-pine-600 text-white' : 'border-graphite-200 text-graphite-600',
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-graphite-100 p-3 pb-safe">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3 px-1">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pine-100 font-bold text-pine-700">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-graphite-900">{user.name}</p>
                      <p className="truncate text-xs text-graphite-400">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/account" onClick={onClose} aria-label={t('ac.tabs.profile')} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pine-50 text-pine-700 hover:bg-pine-100">
                    <User className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => {
                      logout()
                      onClose()
                      navigate('/')
                    }}
                    aria-label={t('auth.logout')}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-graphite-600 hover:bg-graphite-100"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/auth" onClick={onClose} className="btn-primary w-full py-2.5">
                    {t('auth.signIn')}
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={onClose}
                    className="btn-outline flex w-full items-center justify-center gap-2 py-2.5"
                  >
                    <Heart className="h-4 w-4" />
                    {t('nav.favorites')}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}