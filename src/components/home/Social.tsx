import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Send, Quote, Star } from 'lucide-react'
import { useRef, useState } from 'react'
import { useApp } from '../../lib/AppContext'
import { useDB } from '../../lib/hooks'
import { SectionHeader, Reveal, SmartImage, cn } from '../ui'
import { useToast } from '../../lib/toast'
import { formatDate } from '../../lib/hooks'

export function ReviewsCarousel() {
  const { t } = useApp()
  const db = useDB()
  const reviews = db.reviews.filter((r) => r.approved).slice(0, 8)
  const [idx, setIdx] = useState(0)
  const timer = useRef<number | null>(null)

  const go = (dir: number) => {
    if (timer.current) window.clearTimeout(timer.current)
    setIdx((i) => (i + dir + reviews.length) % reviews.length)
  }

  return (
    <section className="section cv-auto">
      <div className="container-x">
        <SectionHeader
          title={t('reviews.title')}
          subtitle={t('reviews.subtitle')}
          action={
            <Link to="/tours" className="btn-outline h-11 px-6">
              {t('tours.all')} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        {reviews.length ? (
          <div className="relative mx-auto max-w-3xl">
            <Quote className="absolute -top-8 left-0 h-20 w-20 text-pine-100" />
            <motion.div key={reviews[idx].id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="card p-8 md:p-10">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={cn('h-5 w-5', reviews[idx].rating >= s ? 'fill-sand-500 text-sand-500' : 'text-graphite-200 fill-graphite-200')} />
                ))}
              </div>
              {reviews[idx].title && <h3 className="mt-4 font-display text-xl font-semibold text-graphite-900">{reviews[idx].title}</h3>}
              <p className="mt-3 text-lg leading-relaxed text-graphite-600">«{reviews[idx].text}»</p>
              <div className="mt-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-pine-50 font-bold text-pine-700">
                  {reviews[idx].author.charAt(0)}
                </span>
                <div>
                  <p className="font-bold text-graphite-900">{reviews[idx].author}</p>
                  <p className="text-xs text-graphite-400">{formatDate(reviews[idx].createdAt, 'ru')}</p>
                </div>
              </div>
            </motion.div>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => go(-1)} aria-label="Назад" className="btn-outline h-11 w-11">
                ←
              </button>
              <div className="flex gap-1.5">
                {reviews.map((r, i) => (
                  <button
                    key={r.id}
                    onClick={() => setIdx(i)}
                    aria-label={`Отзыв ${i + 1}`}
                    className={cn('h-2 rounded-full transition-all', i === idx ? 'w-6 bg-pine-600' : 'w-2 bg-graphite-200')}
                  />
                ))}
              </div>
              <button onClick={() => go(1)} aria-label="Вперёд" className="btn-outline h-11 w-11">
                →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export function GalleryPreview() {
  const { t } = useApp()
  const db = useDB()
  const items = db.gallery.slice(0, 6)
  return (
    <section className="section cv-auto bg-graphite-950">
      <div className="container-x">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold text-white md:text-4xl">{t('gal.title')}</h2>
            <p className="mt-2 text-graphite-400">{t('gal.subtitle')}</p>
          </div>
          <Link to="/gallery" className="btn-white h-11 px-6">
            {t('tours.viewAll')} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 columns-2 gap-4 md:columns-3 [&>*]:mb-4">
          {items.map((g, i) => (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="group relative overflow-hidden rounded-3xl"
            >
              <Link to="/gallery">
                <SmartImage
                  src={g.image}
                  alt=""
                  className={cn('w-full transition-transform duration-700 group-hover:scale-105', i % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/5]')}
                />
                <div className="absolute inset-0 bg-graphite-950/30 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function StoriesSection() {
  const { t, lang } = useApp()
  const db = useDB()
  const items = db.news.slice(0, 3)
  if (!items.length) return null
  return (
    <section className="section cv-auto">
      <div className="container-x">
        <SectionHeader
          title={t('stories.title')}
          subtitle={t('stories.subtitle')}
          action={
            <Link to="/news" className="btn-outline h-11 px-6">
              {t('stories.all')} <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((n, i) => (
            <Reveal key={n.id} delay={i * 0.08}>
              <Link to={`/news/${n.slug}`} className="group card block overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lift">
                <SmartImage src={n.image} alt="" className="aspect-[16/10] w-full transition-transform duration-700 group-hover:scale-105" />
                <div className="p-5">
                  <p className="text-xs font-bold text-pine-600">{formatDate(n.date, lang)}</p>
                  <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-graphite-900">{n.title[lang] || n.title.ru}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-graphite-500">{n.excerpt[lang] || n.excerpt.ru}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export function NewsletterSection() {
  const toast = useToast()
  const [email, setEmail] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.toast('Введите корректный email', 'error')
      return
    }
    const existing: string[] = JSON.parse(localStorage.getItem('ts_newsletter') || '[]')
    localStorage.setItem('ts_newsletter', JSON.stringify([...existing, email]))
    setEmail('')
    toast.toast('Вы подписаны на свежие акции!', 'success')
  }

  return (
    <section className="section cv-auto" id="newsletter">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-pine-700 to-pine-900 p-10 text-center md:p-16">
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-sand-400/20 blur-3xl" />
            <h2 className="relative font-display text-3xl font-semibold text-white md:text-5xl text-balance">Хотите в путешествие?</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-white/80">Подпишитесь — будем присылать новые маршруты и личные скидки.</p>
            <form onSubmit={submit} className="relative mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ваш email"
                className="h-12 flex-1 rounded-full border-0 bg-white px-6 text-sm text-graphite-900 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button type="submit" className="btn-sand h-12 px-8">
                <Send className="h-4 w-4" /> Подписаться
              </button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  )
}