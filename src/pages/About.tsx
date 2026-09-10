import { motion } from 'framer-motion'
import { Compass, Shield, Users, Heart, Phone, Mail, MapPin, Clock } from 'lucide-react'
import { Seo } from '../lib/seo'
import { useApp } from '../lib/AppContext'
import { SectionHeader, Reveal, SmartImage } from '../components/ui'
import { SITE } from '../config/site'

const TEAM = [
  { name: 'Шохин Азизов', role: 'Основатель и директор', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d' },
  { name: 'Махбуба Рахмонова', role: 'PR-менеджер', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330' },
  { name: 'Фаррух Саидов', role: 'Гид-инструктор', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e' },
  { name: 'Лола Худойбердиева', role: 'Координатор туров', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb' },
]

const STATS = [
  { value: '14', label: 'туров в каталоге' },
  { value: '5 000+', label: 'путешественников' },
  { value: '11', label: 'регионов и городов' },
  { value: '4.9/5', label: 'средняя оценка' },
]

const VALUES = [
  { icon: Compass, title: 'Авторские маршруты', text: 'Каждый тур разработан с нуля нашими гидами после десятков экспедиций.' },
  { icon: Shield, title: 'Надёжность', text: 'Полная страховка, транспорт по безопасности и связь со штабом 24/7.' },
  { icon: Users, title: 'Малые группы', text: 'Максимум 12-16 человек — никаких толп и очередей на маршруте.' },
  { icon: Heart, title: 'По-домашнему', text: 'Гостеприимство, домашняя еда и истории местных жителей — в каждом туре.' },
]

export default function About() {
  const { t } = useApp()

  return (
    <>
      <Seo title="О компании — Тур Шохин" description="Профессиональное travel-агентство полного цикла: туры по Таджикистану и миру с 2014 года." />
      <section className="relative overflow-hidden bg-graphite-950 py-28 text-white md:py-36">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1516091877740-fde016699f2c)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-graphite-950/70 via-transparent to-graphite-950" />
        <div className="container-x relative text-center">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-display text-lg tracking-widest text-sand-300">
            {t('about.tagline')}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mx-auto mt-4 max-w-3xl font-display text-4xl font-semibold leading-tight md:text-6xl">
            {t('about.title')}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            {SITE.name} — сервис полного цикла: от идеи путешествия до возвращения домой
          </motion.p>
        </div>
      </section>

      <section className="section">
        <div className="container-x max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <Reveal key={s.label}>
                <div className="card grid place-items-center p-8 text-center">
                  <p className="font-display text-5xl font-bold text-pine-700">{s.value}</p>
                  <p className="mt-2 text-sm font-semibold text-graphite-500">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-24 grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <div>
                <SectionHeader title={t('about.storyTitle')} subtitle={t('about.storySubtitle')} />
                <div className="space-y-5 text-lg leading-relaxed text-graphite-600">
                  <p>{t('about.story1')}</p>
                  <p>{t('about.story2')}</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="grid grid-cols-2 gap-4">
                <SmartImage src="https://images.unsplash.com/photo-1576043203646-6e6b4c995441" alt="" className="aspect-[3/4] w-full rounded-[2rem]" />
                <SmartImage src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5" alt="" className="mt-10 aspect-[3/4] w-full rounded-[2rem]" />
              </div>
            </Reveal>
          </div>

          <div className="mt-24">
            <SectionHeader title={t('about.valuesTitle')} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {VALUES.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.08}>
                  <div className="card p-6 transition-all hover:-translate-y-1 hover:shadow-lift">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pine-50 text-pine-700">
                      <v.icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-semibold text-graphite-900">{v.title}</h3>
                    <p className="mt-2 text-sm text-graphite-500">{v.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-24">
            <SectionHeader title={t('about.teamTitle')} />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.08}>
                  <div className="group relative overflow-hidden rounded-[2rem]">
                    <img src={`${p.img}?q=80&w=800&auto=format&fit=crop`} alt={p.name} loading="lazy" className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-graphite-950/85 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="font-display text-lg font-semibold">{p.name}</p>
                      <p className="text-sm text-white/70">{p.role}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="mt-24">
            <SectionHeader title={t('ft.contacts')} subtitle="Работаем для вас по будням и субботам" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Reveal>
                <a href={`tel:${SITE.phone.replace(/[^\d+]/g, '')}`} className="card block p-6 transition-all hover:-translate-y-1 hover:shadow-lift">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pine-50 text-pine-700">
                    <Phone className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-graphite-900">Телефон</h3>
                  <p className="mt-2 text-sm text-graphite-500">{SITE.phone}</p>
                </a>
              </Reveal>
              <Reveal delay={0.08}>
                <a href={`mailto:${SITE.email}`} className="card block p-6 transition-all hover:-translate-y-1 hover:shadow-lift">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pine-50 text-pine-700">
                    <Mail className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-graphite-900">Email</h3>
                  <p className="mt-2 text-sm text-graphite-500">{SITE.email}</p>
                </a>
              </Reveal>
              <Reveal delay={0.16}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SITE.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="card block p-6 transition-all hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pine-50 text-pine-700">
                    <MapPin className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-graphite-900">Адрес</h3>
                  <p className="mt-2 text-sm text-graphite-500">{SITE.address}</p>
                </a>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="card p-6">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pine-50 text-pine-700">
                    <Clock className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-graphite-900">Часы работы</h3>
                  <p className="mt-2 text-sm text-graphite-500">{SITE.hours}</p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}