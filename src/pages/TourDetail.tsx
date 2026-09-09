import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock3, Users, ChevronDown, ChevronLeft, Check, X, Backpack, Mountain } from 'lucide-react'
import { Seo } from '../lib/seo'
import { useApp } from '../lib/AppContext'
import { useDB } from '../lib/hooks'
import { cn, Rating, DifficultyBadge, DifficultyLabel, SectionHeader, Chip } from '../components/ui'
import { TourGallery } from '../components/tour/TourGallery'
import { BookingCard } from '../components/tour/BookingCard'
import { RouteMap } from '../components/tour/RouteMap'
import { ReviewsBlock, FaqBlock, RelatedTours } from '../components/tour/TourExtras'
import type { Tour } from '../types'

function InfoStrip({ tour }: { tour: Tour }) {
  const { t } = useApp()
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-graphite-600">
      <span className="flex items-center gap-1.5">
        <MapPin className="h-4 w-4 text-pine-600" /> {tour.city}, {tour.country}
      </span>
      <span className="flex items-center gap-1.5">
        <Clock3 className="h-4 w-4 text-pine-600" /> {tour.durationDays} {t('tours.days')}
      </span>
      <span className="flex items-center gap-1.5">
        <Users className="h-4 w-4 text-pine-600" /> {tour.groupSizeMin}–{tour.groupSizeMax} {t('td.groupOf')}
      </span>
      <DifficultyBadge d={tour.difficulty} />
    </div>
  )
}

function DayProgram({ tour }: { tour: Tour }) {
  const { t, lang } = useApp()
  const [open, setOpen] = useState<number | null>(0)
  const [allOpen, setAllOpen] = useState(false)

  const isOpen = (i: number) => allOpen || open === i

  return (
    <div className="relative space-y-3 pl-2">
      <div className="absolute bottom-4 left-[22px] top-4 w-px bg-pine-100" />
      {tour.days.map((d, i) => (
        <motion.div
          key={d.id}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ delay: Math.min(i * 0.06, 0.4) }}
          className="relative flex gap-4 rounded-3xl border border-graphite-100 bg-white p-5 shadow-soft"
        >
          <div className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-pine-600 font-display text-sm font-bold text-white shadow-glow">
            {d.day}
          </div>
          <div className="min-w-0 flex-1">
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-3 text-left">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-pine-600">{t('td.day')} {d.day} · {tour.durationDays}</p>
                <h3 className="font-display text-lg font-semibold text-graphite-900">{d.title[lang] || d.title.ru}</h3>
              </div>
              <ChevronDown className={cn('h-5 w-5 shrink-0 text-graphite-400 transition-transform', isOpen(i) && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {isOpen(i) && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                  <p className="pt-3 text-sm leading-relaxed text-graphite-600">{d.description[lang] || d.description.ru}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
      <button onClick={() => setAllOpen((v) => !v)} className="ml-16 text-sm font-bold text-pine-600 hover:text-pine-700">
        {allOpen ? 'Свернуть программу' : 'Развернуть все дни'}
      </button>
    </div>
  )
}

function ListCard({ title, items, positive }: { title: string; items: string[]; positive: boolean }) {
  return (
    <div className="card p-6">
      <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-graphite-900">
        <span className={cn('grid h-8 w-8 place-items-center rounded-xl', positive ? 'bg-pine-50 text-pine-700' : 'bg-red-50 text-red-500')}>
          {positive ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </span>
        {title}
      </h3>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-graphite-600">
            <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', positive ? 'bg-pine-500' : 'bg-red-400')} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function TourDetail() {
  const { slug } = useParams()
  const { t, lang } = useApp()
  const db = useDB()
  const tour = db.tours.find((tr) => tr.slug === slug || tr.id === slug) || (slug ? db.tours.find((tr) => tr.slug === slug) : undefined)

  if (!tour) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
          <p className="font-display text-2xl text-graphite-700">Тур не найден</p>
          <Link to="/tours" className="btn-primary mt-6">К каталогу</Link>
        </div>
      </div>
    )
  }

  const description = tour.description[lang] || tour.description.ru

  return (
    <>
      <Seo title={`${tour.title.ru} — Тур Шохин`} description={tour.shortDescription.ru} />

      <section className="bg-graphite-50/50 pb-6 pt-24 md:pt-28">
        <div className="container-x">
          <nav className="mb-4 flex items-center gap-2 text-sm text-graphite-400">
            <Link to="/" className="hover:text-pine-600">Главная</Link>
            <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
            <Link to="/tours" className="hover:text-pine-600">Туры</Link>
            <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
            <span className="font-semibold text-graphite-600">{tour.title[lang] || tour.title.ru}</span>
          </nav>
        </div>
      </section>

      <section className="pt-6">
        <div className="container-x">
          <TourGallery images={tour.images} title={tour.title[lang] || tour.title.ru} />
        </div>
      </section>

      <section className="section pt-8 md:pt-10">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-display text-3xl font-semibold text-graphite-900 md:text-4xl">{tour.title[lang] || tour.title.ru}</h1>
              <Rating value={tour.rating} count={tour.reviewsCount} size="md" />
            </div>
            <div className="mt-4">
              <InfoStrip tour={tour} />
            </div>

            <div className="mt-8 space-y-14">
              <section id="overview">
                <h2 className="mb-4 font-display text-2xl font-semibold text-graphite-900">{t('td.overview')}</h2>
                <p className="leading-relaxed text-graphite-600">{description}</p>
              </section>

              <section id="program">
                <h2 className="mb-6 font-display text-2xl font-semibold text-graphite-900">{t('td.program')}</h2>
                <DayProgram tour={tour} />
              </section>

              {tour.locations.length > 0 && (
                <section id="route">
                  <h2 className="mb-4 font-display text-2xl font-semibold text-graphite-900">{t('td.route')}</h2>
                  <RouteMap locations={tour.locations} />
                </section>
              )}

              <section id="includes" className="grid gap-6 md:grid-cols-2">
                <ListCard
                  title={t('td.includes')}
                  positive
                  items={tour.includes.map((x) => x[lang] || x.ru)}
                />
                <div className="space-y-6">
                  <ListCard
                    title={t('td.excludes')}
                    positive={false}
                    items={tour.excludes.map((x) => x[lang] || x.ru)}
                  />
                  <div className="card p-6">
                    <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-graphite-900">
                      <span className="grid h-8 w-8 place-items-center rounded-xl bg-sand-50 text-sand-600">
                        <Backpack className="h-4 w-4" />
                      </span>
                      {t('td.bring')}
                    </h3>
                    <ul className="space-y-2.5">
                      {tour.whatToBring.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-graphite-600">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sand-500" />
                          {item[lang] || item.ru}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </section>

              <section className="grid gap-6 sm:grid-cols-2">
                <div className="card p-6">
                  <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-graphite-900">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-pine-50 text-pine-700">
                      <Mountain className="h-4 w-4" />
                    </span>
                    {t('td.difficulty')}
                  </h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(['easy', 'moderate', 'hard', 'extreme'] as const).map((d) => (
                      <span key={d} className={cn('chip border', d === tour.difficulty ? 'bg-pine-600 text-white border-pine-600' : 'border-graphite-200 text-graphite-400')}>
                        {t(`flt.${d}`)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs font-semibold text-graphite-500">
                      <span>Лёгкий</span>
                      <span>Экстрим</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-graphite-100">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${([['easy', 25], ['moderate', 50], ['hard', 75], ['extreme', 100]] as const).find((x) => x[0] === tour.difficulty)?.[1]}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                        className="h-full rounded-full bg-gradient-to-r from-pine-400 to-pine-700"
                      />
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-graphite-400">Текущий уровень: <DifficultyLabel d={tour.difficulty} /></p>
                </div>

                <div className="card p-6">
                  <h3 className="mb-3 font-display text-lg font-semibold text-graphite-900">{t('td.from')}</h3>
                  <div className="flex flex-wrap gap-2">
                    {tour.startDates.length ? (
                      tour.startDates.map((d) => <Chip key={d}>{d}</Chip>)
                    ) : (
                      <Chip>{t('common.soon')}</Chip>
                    )}
                  </div>
                  {tour.city !== 'null' && (
                    <p className="mt-4 text-sm text-graphite-500">
                      <MapPin className="mr-1 inline h-4 w-4 text-pine-600" />
                      {tour.city}, {tour.region}
                    </p>
                  )}
                </div>
              </section>

              <section id="reviews">
                <SectionHeader title={t('td.reviews')} />
                <ReviewsBlock tour={tour} />
              </section>

              <section id="faq">
                <SectionHeader title={t('td.faq')} />
                <FaqBlock items={tour.faq} />
              </section>

              <RelatedTours tour={tour} />
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <BookingCard tour={tour} />
          </aside>
        </div>
      </section>
    </>
  )
}