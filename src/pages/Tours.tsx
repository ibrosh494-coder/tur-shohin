import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, MapPin } from 'lucide-react'
import { Seo } from '../lib/seo'
import { useApp } from '../lib/AppContext'
import { useDB, loc } from '../lib/hooks'
import { cn, Button, Price, CategoryIcon } from '../components/ui'
import { TourCard } from '../components/tour/TourCard'
import { tourPrice } from '../lib/store'

type SortKey = 'popular' | 'cheap' | 'expensive' | 'rating' | 'new'
const SORTS: SortKey[] = ['popular', 'cheap', 'expensive', 'rating', 'new']

export default function Tours() {
  const { t, lang } = useApp()
  const db = useDB()
  const [params, setParams] = useSearchParams()
  const [visible, setVisible] = useState(8)
  const [filterOpen, setFilterOpen] = useState(false)

  const dest = params.get('dest') || ''
  const type = params.get('type') || ''
  const date = params.get('date') || ''
  const pax = params.get('pax') || ''
  const q = params.get('q') || ''
  const country = params.get('country') || ''
  const difficulty = params.get('difficulty') || ''
  const dur = params.get('dur') || ''
  const rating = params.get('rating') || ''
  const sortKey = (params.get('sort') as SortKey) || 'popular'
  const priceMax = params.get('price') || ''

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: false })
    setVisible(8)
  }

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true })
    setFilterOpen(false)
  }

  const countries = useMemo(() => Array.from(new Set(db.tours.map((t) => t.country))).sort(), [db.tours])
  const maxPrice = useMemo(() => Math.max(...db.tours.map((tr) => tourPrice(tr)), 1000), [db.tours])

  const results = useMemo(() => {
    let list = db.tours.filter((tr) => tr.active !== false)

    if (dest) list = list.filter((tr) => tr.destinationIds.includes(dest))
    if (type) list = list.filter((tr) => tr.categoryIds.some((c) => db.categories.find((cat) => cat.slug === type)?.id === c))
    if (date) list = list.filter((tr) => tr.startDates.includes(date))
    if (pax) list = list.filter((tr) => tr.groupSizeMax >= Number(pax))
    if (country) list = list.filter((tr) => tr.country === country)
    if (difficulty) list = list.filter((tr) => tr.difficulty === difficulty)
    if (rating) list = list.filter((tr) => tr.rating >= Number(rating))
    if (dur === 'd1') list = list.filter((tr) => tr.durationDays <= 3)
    if (dur === 'd2') list = list.filter((tr) => tr.durationDays >= 4 && tr.durationDays <= 7)
    if (dur === 'd3') list = list.filter((tr) => tr.durationDays >= 8)
    if (priceMax) list = list.filter((tr) => tourPrice(tr) <= Number(priceMax))
    if (q.trim()) {
      const s = q.trim().toLowerCase()
      list = list.filter(
        (tr) =>
          tr.title.ru.toLowerCase().includes(s) ||
          tr.city.toLowerCase().includes(s) ||
          tr.country.toLowerCase().includes(s) ||
          tr.region.toLowerCase().includes(s),
      )
    }

    const price = (tr?: (typeof db.tours)[number]) => (tr ? tourPrice(tr) : 0)

    switch (sortKey) {
      case 'cheap':
        list = [...list].sort((a, b) => price(a) - price(b))
        break
      case 'expensive':
        list = [...list].sort((a, b) => price(b) - price(a))
        break
      case 'rating':
        list = [...list].sort((a, b) => b.rating - a.rating)
        break
      case 'new':
        list = [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        break
      default:
        list = [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.reviewsCount - a.reviewsCount)
    }
    return list
  }, [db.tours, db.categories, db.destinations, dest, type, date, pax, country, difficulty, dur, rating, priceMax, q, sortKey])

  const activeDest = db.destinations.find((d) => d.id === dest)

  const filterWidgets = (
    <div className="space-y-6">
      <div>
        <label className="label">{t('flt.dest')}</label>
        <select value={dest} onChange={(e) => setParam('dest', e.target.value)} className="input-base">
          <option value="">{t('flt.any')}</option>
          {db.destinations.map((d) => (
            <option key={d.id} value={d.id}>
              {loc(d.name, lang)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">{t('flt.country')}</label>
        <select value={country} onChange={(e) => setParam('country', e.target.value)} className="input-base">
          <option value="">{t('flt.any')}</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label">{t('flt.type')}</label>
        <div className="grid grid-cols-2 gap-2">
          {db.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setParam('type', c.slug === type ? '' : c.slug)}
              className={cn(
                'flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition-colors',
                type === c.slug ? 'border-pine-600 bg-pine-50 text-pine-700' : 'border-graphite-200 text-graphite-600 hover:border-pine-300',
              )}
            >
              <span className="h-4 w-4 text-pine-600">
                <CategoryIcon icon={c.icon} />
              </span>
              {c.name.ru}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">{t('flt.difficulty')}</label>
        <div className="grid grid-cols-2 gap-2">
          {(['easy', 'moderate', 'hard', 'extreme'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setParam('difficulty', d === difficulty ? '' : d)}
              className={cn(
                'rounded-2xl border px-3 py-2 text-xs font-semibold transition-colors',
                difficulty === d ? 'border-pine-600 bg-pine-50 text-pine-700' : 'border-graphite-200 text-graphite-600',
              )}
            >
              {t(`flt.${d}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">{t('flt.duration')}</label>
        <div className="grid grid-cols-3 gap-2">
          {(['d1', 'd2', 'd3'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setParam('dur', d === dur ? '' : d)}
              className={cn(
                'rounded-2xl border px-2 py-2 text-xs font-semibold transition-colors',
                dur === d ? 'border-pine-600 bg-pine-50 text-pine-700' : 'border-graphite-200 text-graphite-600',
              )}
            >
              {t(`flt.${d}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="label">
          {t('flt.price')}: <Price tjs={priceMax ? Number(priceMax) : maxPrice} bold={false} />
        </label>
        <input
          type="range"
          min={200}
          max={maxPrice}
          step={100}
          value={priceMax ? Number(priceMax) : maxPrice}
          onChange={(e) => setParam('price', e.target.value === String(maxPrice) ? '' : e.target.value)}
          className="w-full accent-pine-600"
        />
      </div>

      <div>
        <label className="label">{t('flt.rating')}</label>
        <div className="grid grid-cols-2 gap-2">
          {([4, 4.5, 4.8].map(String) as string[]).map((r) => (
            <button
              key={r}
              onClick={() => setParam('rating', rating === r ? '' : r)}
              className={cn(
                'rounded-2xl border px-3 py-2 text-xs font-semibold transition-colors',
                rating === r ? 'border-pine-600 bg-pine-50 text-pine-700' : 'border-graphite-200 text-graphite-600',
              )}
            >
              ★ {r}+
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" onClick={clearAll} className="w-full">
        {t('flt.reset')}
      </Button>
    </div>
  )

  return (
    <>
      <Seo title="Туры по Таджикистану и миру — Тур Шохин" description="Каталог туров: Памирский тракт, Фанские горы, Самарканд, Турция, Египет. Фильтры по цене, длительности и сложности." />
      <section className="relative bg-graphite-950 pb-16 pt-28 md:pt-36">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1464822759023-fed622ff2c3b)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-graphite-950/70 to-graphite-950" />
        <div className="container-x relative">
          <h1 className="font-display text-4xl font-semibold text-white md:text-6xl">{t('tours.all')}</h1>
          {q && <p className="mt-2 text-white/70">По запросу «{q}»</p>}
          <div className="mt-6 flex flex-wrap gap-2">
            {db.categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setParam('type', c.slug === type ? '' : c.slug)}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-md transition-colors',
                  type === c.slug ? 'border-pine-400 bg-pine-600 text-white' : 'border-white/25 bg-white/10 text-white hover:bg-white/20',
                )}
              >
                {c.name.ru}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-10 cv-auto">
        <div className="container-x grid gap-8 lg:grid-cols-[290px_1fr]">
          <aside className="hidden lg:block">
            <div className="card sticky top-24 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-xl font-semibold">{t('flt.title')}</h2>
                {(dest || country || type || difficulty || dur || rating || priceMax || date) && (
                  <button onClick={clearAll} className="text-xs font-bold text-pine-600 hover:text-pine-700">
                    {t('flt.reset')}
                  </button>
                )}
              </div>
              {filterWidgets}
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-graphite-500">
                <span className="text-lg font-extrabold text-graphite-900">{results.length}</span> {t('flt.results')}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="h-10 lg:hidden" onClick={() => setFilterOpen(true)}>
                  <SlidersHorizontal className="h-4 w-4" /> {t('flt.title')}
                </Button>
                <select value={sortKey} onChange={(e) => setParam('sort', e.target.value)} className="h-10 rounded-full border border-graphite-200 bg-white px-4 text-sm font-semibold text-graphite-700 focus:border-pine-500 focus:outline-none">
                  {SORTS.map((s) => (
                    <option key={s} value={s}>
                      {t(`sort.${s}`)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(activeDest || date || pax) && (
              <div className="mb-6 flex flex-wrap items-center gap-2 rounded-3xl border border-pine-200 bg-pine-50/60 p-4">
                {activeDest && (
                  <span className="chip border-pine-200 bg-white text-pine-800">
                    <MapPin className="h-3.5 w-3.5" /> {loc(activeDest.name, lang)}
                  </span>
                )}
                {date && (
                  <span className="chip border-pine-200 bg-white text-pine-800">📅 {date}</span>
                )}
                {pax && <span className="chip border-pine-200 bg-white text-pine-800">👥 {pax}+</span>}
              </div>
            )}

            {results.length === 0 ? (
              <div className="card grid place-items-center p-16 text-center">
                <p className="font-display text-xl text-graphite-700">{t('flt.no')}</p>
                <Button variant="outline" className="mt-6" onClick={clearAll}>
                  {t('flt.reset')}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {results.slice(0, visible).map((tour, i) => (
                    <TourCard key={tour.id} tour={tour} index={i % 6} />
                  ))}
                </div>
                {visible < results.length && (
                  <div className="mt-10 text-center">
                    <Button variant="outline" className="h-12 px-8" onClick={() => setVisible((v) => v + 8)}>
                      {t('flt.more')} ({results.length - visible})
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {filterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setFilterOpen(false)} className="fixed inset-0 z-[60] bg-graphite-950/60 backdrop-blur-sm lg:hidden" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-[70] w-[88%] max-w-sm overflow-y-auto bg-white p-6 pb-safe lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold">{t('flt.title')}</h2>
                <button onClick={() => setFilterOpen(false)} className="grid h-10 w-10 place-items-center rounded-full hover:bg-graphite-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {filterWidgets}
              <Button className="mt-6 w-full" onClick={() => setFilterOpen(false)}>
                {t('flt.apply')}
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}