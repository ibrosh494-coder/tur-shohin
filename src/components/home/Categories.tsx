import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useApp } from '../../lib/AppContext'
import { useDB, loc } from '../../lib/hooks'
import { SectionHeader, Reveal, CategoryIcon } from '../ui'

export function CategoriesSection() {
  const { t } = useApp()
  const db = useDB()

  return (
    <section className="section">
      <div className="container-x">
        <SectionHeader title={t('cats.title')} subtitle={t('cats.subtitle')} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {db.categories.map((c, i) => {
            const count = db.tours.filter((tr) => tr.active !== false && tr.categoryIds.includes(c.id)).length
            return (
              <Reveal key={c.id} delay={Math.min(i * 0.05, 0.3)}>
                <Link
                  to={`/tours?type=${c.slug}`}
                  className="group relative block overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {c.image && (
                      <img
                        src={c.image}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-graphite-950/80 via-graphite-950/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/20 text-white backdrop-blur-md transition-colors group-hover:bg-pine-600">
                        <CategoryIcon icon={c.icon} />
                      </div>
                      <h3 className="mt-2 font-display text-base font-semibold text-white md:text-lg">{loc(c.name, 'ru')}</h3>
                      <p className="text-xs font-medium text-white/70">{count} {t('dests.tours')}</p>
                    </div>
                  </div>
                </Link>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export function DestinationsSection() {
  const { t, lang } = useApp()
  const db = useDB()

  const withCount = db.destinations.map((d) => {
    const count = db.tours.filter(
      (tr) => tr.active !== false && (tr.destinationIds.includes(d.id) || tr.country.toLowerCase().includes(d.name.en.toLowerCase())),
    ).length
    return { ...d, count }
  })

  return (
    <section className="section bg-graphite-50/60">
      <div className="container-x">
        <SectionHeader
          title={t('dests.title')}
          subtitle={t('dests.subtitle')}
          action={
            <Link to="/tours" className="btn-outline h-11 px-6">
              {t('tours.viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
          {withCount.map((d) => (
            <Link
              key={d.id}
              to={`/tours?dest=${d.id}`}
              className="group relative block w-64 shrink-0 snap-start overflow-hidden rounded-3xl md:w-72"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={d.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-graphite-950/80 via-graphite-950/20 to-transparent transition-opacity" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <h3 className="font-display text-xl font-semibold text-white">{loc(d.name, lang)}</h3>
                  <p className="mt-0.5 text-sm text-white/70">
                    {d.count} {t('dests.tours')}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md transition-colors group-hover:bg-pine-600">
                    {t('dests.explore')} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}