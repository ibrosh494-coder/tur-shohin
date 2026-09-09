import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Users, CalendarDays, MapPin, ChevronDown } from 'lucide-react'
import { useApp } from '../../lib/AppContext'
import { useDB } from '../../lib/hooks'
import { cn } from '../ui'
import { IMG } from '../../lib/seed/images'
import { formatPrice } from '../../lib/AppContext'

export function Hero() {
  const { t } = useApp()
  const db = useDB()
  const navigate = useNavigate()

  const [dest, setDest] = useState('')
  const [date, setDate] = useState('')
  const [travelers, setTravelers] = useState(2)
  const [type, setType] = useState('')

  const allDates = useMemo(() => {
    const set = new Set<string>()
    db.tours.forEach((tr) => tr.startDates.forEach((d) => set.add(d)))
    return Array.from(set).sort()
  }, [db.tours])

  const types = db.categories
  const destinations = db.destinations

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (dest) params.set('dest', dest)
    if (date) params.set('date', date)
    if (travelers > 1) params.set('pax', String(travelers))
    if (type) params.set('type', type)
    navigate(`/tours?${params.toString()}`)
  }

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-graphite-950">
      <motion.div
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <img
          src={IMG.range}
          alt=""
          className="h-full w-full object-cover opacity-90"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-graphite-950/60 via-graphite-950/40 to-graphite-950/85" />

      <div className="container-x relative z-10 pb-16 pt-32 text-center md:pb-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}>
          <span className="chip border-white/25 bg-white/10 text-white backdrop-blur-md">{t('hero.badge')}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mx-auto mt-6 max-w-4xl font-display text-4xl font-semibold leading-[1.08] text-white text-balance sm:text-5xl md:text-7xl"
        >
          {t('hero.title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
          className="mx-auto mt-5 max-w-2xl text-lg text-white/85 md:text-xl"
        >
          {t('hero.subtitle')}
        </motion.p>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-10 max-w-5xl rounded-3xl bg-white/95 p-3 shadow-lift backdrop-blur-xl md:rounded-[28px]"
        >
          <div className="grid gap-2 md:grid-cols-4">
            <label className="relative flex flex-col rounded-2xl px-4 py-3 text-left transition-colors hover:bg-graphite-50 md:border-r md:border-graphite-100">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-graphite-400">
                <MapPin className="h-3.5 w-3.5" /> {t('search.where')}
              </span>
              <div className="relative mt-1 flex items-center">
                <select
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                  className="w-full appearance-none bg-transparent pr-6 text-sm font-semibold text-graphite-900 focus:outline-none"
                >
                  <option value="">{t('search.any')}</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name.ru}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-graphite-400" />
              </div>
            </label>

            <label className="relative flex flex-col rounded-2xl px-4 py-3 text-left transition-colors hover:bg-graphite-50 md:border-r md:border-graphite-100">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-graphite-400">
                <CalendarDays className="h-3.5 w-3.5" /> {t('search.date')}
              </span>
              <div className="relative mt-1 flex items-center">
                <select value={date} onChange={(e) => setDate(e.target.value)} className="w-full appearance-none bg-transparent pr-6 text-sm font-semibold text-graphite-900 focus:outline-none">
                  <option value="">{t('common.all')}</option>
                  {allDates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-graphite-400" />
              </div>
            </label>

            <label className="relative flex flex-col rounded-2xl px-4 py-3 text-left transition-colors hover:bg-graphite-50 md:border-r md:border-graphite-100">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-graphite-400">
                <Users className="h-3.5 w-3.5" /> {t('search.travelers')}
              </span>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTravelers((v) => Math.max(1, v - 1))}
                  className="grid h-6 w-6 place-items-center rounded-full bg-graphite-100 font-bold text-graphite-700 transition-colors hover:bg-graphite-200"
                >
                  −
                </button>
                <span className="min-w-8 text-center text-sm font-bold text-graphite-900">{travelers}</span>
                <button
                  type="button"
                  onClick={() => setTravelers((v) => Math.min(24, v + 1))}
                  className="grid h-6 w-6 place-items-center rounded-full bg-graphite-100 font-bold text-graphite-700 transition-colors hover:bg-graphite-200"
                >
                  +
                </button>
              </div>
            </label>

            <label className="relative flex flex-col rounded-2xl px-4 py-3 text-left transition-colors hover:bg-graphite-50">
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-graphite-400">
                <Search className="h-3.5 w-3.5" /> {t('search.type')}
              </span>
              <div className="relative mt-1 flex items-center">
                <select value={type} onChange={(e) => setType(e.target.value)} className="w-full appearance-none bg-transparent pr-6 text-sm font-semibold text-graphite-900 focus:outline-none">
                  <option value="">{t('search.typePh')}</option>
                  {types.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name.ru}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-graphite-400" />
              </div>
            </label>
          </div>

          <button type="submit" className={cn('btn-primary mt-2 w-full py-4 text-base md:ml-2 md:w-auto md:px-10', 'md:mt-0')}>
            <Search className="h-5 w-5" />
            {t('search.find')}
          </button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 text-xs font-medium text-white/60"
        >
          4.9/5 по 1 200+ отзывам · Без предоплаты до подтверждения
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1.4 }, y: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/70 md:block"
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  )
}

export { formatPrice }