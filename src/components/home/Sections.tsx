import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Users, ShieldCheck, Ticket, UsersRound, HeartHandshake } from 'lucide-react'
import { useApp } from '../../lib/AppContext'
import { useDB } from '../../lib/hooks'
import { SectionHeader, Reveal, SmartImage, cn } from '../ui'
import { TourCard } from '../tour/TourCard'
import { IMG } from '../../lib/seed/images'

export function ToursSection() {
  const { t } = useApp()
  const db = useDB()
  const best = [...db.tours]
    .filter((tr) => tr.active !== false)
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.reviewsCount - a.reviewsCount)
    .slice(0, 8)

  return (
    <section className="section cv-auto">
      <div className="container-x">
        <SectionHeader
          title={t('tours.popular')}
          subtitle={t('tours.popularSub')}
          action={
            <Link to="/tours" className="btn-outline h-11 px-6">
              {t('tours.viewAll')} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {best.map((tour, i) => (
            <TourCard key={tour.id} tour={tour} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

const WHY = [
  { icon: ShieldCheck, key: 'why.guides', desc: 'why.guidesDesc', color: 'bg-pine-50 text-pine-700' },
  { icon: Users, key: 'why.safety', desc: 'why.safetyDesc', color: 'bg-sand-50 text-sand-600' },
  { icon: Ticket, key: 'why.flex', desc: 'why.flexDesc', color: 'bg-graphite-100 text-graphite-700' },
  { icon: UsersRound, key: 'why.small', desc: 'why.smallDesc', color: 'bg-pine-50 text-pine-700' },
  { icon: HeartHandshake, key: 'why.locals', desc: 'why.localsDesc', color: 'bg-sand-50 text-sand-600' },
]

export function WhyUs() {
  const { t } = useApp()
  return (
    <section className="section cv-auto bg-graphite-950 text-white">
      <div className="container-x">
        <SectionHeader title={t('why.title')} subtitle={t('why.subtitle')} className="text-white [&_h2]:text-white [&_p]:text-graphite-400" />
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <Relive />
          </div>
          <div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {WHY.map((item, i) => (
                <Reveal key={item.key} delay={i * 0.06}>
                  <li className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
                    <span className={cn('grid h-12 w-12 place-items-center rounded-2xl transition-transform group-hover:scale-110', item.color)}>
                      <item.icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold">{t(item.key)}</h3>
                    <p className="mt-1.5 text-sm text-graphite-400">{t(item.desc)}</p>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

function Relive() {
  return (
    <div className="relative">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
        <SmartImage src={IMG.fog} alt="" className="aspect-[4/5] w-full rounded-[2.5rem]" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="glass absolute -bottom-6 -right-4 w-44 rounded-3xl p-4 shadow-lift md:-right-10"
      >
        <p className="font-display text-4xl font-bold text-pine-700">12+</p>
        <p className="text-xs font-semibold text-graphite-500">лет в горах Таджикистана</p>
      </motion.div>
    </div>
  )
}

export function Experience() {
  const { t } = useApp()
  const stats = [
    { n: '14', label: 'лет опыта' },
    { n: '1 200+', label: 'путешественников' },
    { n: '98%', label: 'возвращаются' },
    { n: '7 495 м', label: 'рекорд высоты' },
  ]
  return (
    <section
      className="section relative overflow-hidden cv-auto"
      style={{
        backgroundImage: `url(${IMG.valley})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-graphite-950/75" />
      <div className="container-x relative grid gap-10 py-10 md:grid-cols-2 md:items-center">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold text-white md:text-5xl text-balance">{t('exp.title')}</h2>
          <p className="mt-4 max-w-md text-white/75">{t('exp.subtitle')} — Памир и Фанские горы, гостеприимство памирцев и вкус настоящего плова, дороги через перевалы и ночи под Млечным Путём.</p>
          <Link to="/tours" className="btn-sand mt-8 h-12 px-8">
            {t('tours.all')} <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-3xl border border-white/15 bg-white/10 p-6 text-center backdrop-blur-md"
            >
              <p className="font-display text-3xl font-bold text-sand-400">{s.n}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/70">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function OffersSection() {
  const { t } = useApp()
  const db = useDB()
  const offers = db.tours.filter((tr) => tr.active !== false && tr.discountPercent)
  if (offers.length === 0) return null
  return (
    <section className="section cv-auto">
      <div className="container-x">
        <SectionHeader title={t('offers.title')} subtitle={t('offers.subtitle')} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((tour, i) => (
            <TourCard key={tour.id} tour={tour} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function HowItWorks() {
  const { t } = useApp()
  const steps = ['how.1', 'how.2', 'how.3']
  const desc = ['how.1d', 'how.2d', 'how.3d']
  return (
    <section className="section bg-graphite-50/60 cv-auto">
      <div className="container-x">
        <SectionHeader title={t('how.title')} subtitle={t('how.subtitle')} />
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s} delay={i * 0.1}>
              <div className={cn('relative rounded-3xl bg-white p-8 shadow-soft', i === 1 && 'md:-translate-y-3')}>
                <span className="font-display text-6xl font-bold text-pine-100">{i + 1}</span>
                <h3 className="-mt-4 font-display text-xl font-semibold text-graphite-900">{t(s)}</h3>
                <p className="mt-2 text-sm text-graphite-500">{t(desc[i])}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}