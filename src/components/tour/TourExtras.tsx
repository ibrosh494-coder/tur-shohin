import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Send, Star } from 'lucide-react'
import type { Tour } from '../../types'
import { useApp } from '../../lib/AppContext'
import { useAuth } from '../../lib/auth'
import { useDB, formatDate } from '../../lib/hooks'
import { addReview } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { cn, Button, Rating, SmartImage, Price } from '../ui'

export function ReviewsBlock({ tour }: { tour: Tour }) {
  const { t, lang } = useApp()
  const db = useDB()
  const { user } = useAuth()
  const toast = useToast()

  const reviews = db.reviews.filter((r) => r.tourId === tour.id && r.approved)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [author, setAuthor] = useState(user?.name ?? '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) {
      toast.toast('Напишите текст отзыва', 'error')
      return
    }
    addReview({
      tourId: tour.id,
      userId: user?.id,
      author: author.trim() || 'Гость',
      rating,
      text: text.trim(),
    })
    setText('')
    setAuthor(user?.name ?? '')
    toast.toast(t('reviews.thanks'))
  }

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : tour.rating

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        {reviews.length ? (
          reviews.map((r) => (
            <div key={r.id} className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-pine-50 font-bold text-pine-700">
                    {r.author.charAt(0)}
                  </span>
                  <div>
                    <p className="font-bold text-graphite-900">{r.author}</p>
                    <p className="text-xs text-graphite-400">{formatDate(r.createdAt, lang)}</p>
                  </div>
                </div>
                <Rating value={r.rating} size="sm" />
              </div>
              {r.title && <h4 className="mt-3 font-display text-lg font-semibold text-graphite-900">{r.title}</h4>}
              <p className="mt-2 text-sm leading-relaxed text-graphite-600">{r.text}</p>
              {r.image && <SmartImage src={r.image} alt="" className="mt-3 aspect-video w-48 rounded-2xl" />}
            </div>
          ))
        ) : (
          <div className="card grid place-items-center p-12 text-graphite-400">Пока нет опубликованных отзывов.</div>
        )}
      </div>

      <div>
        <div className="card sticky top-24 p-6 text-center">
          <p className="font-display text-5xl font-bold text-pine-700">{avg.toFixed(1)}</p>
          <div className="mt-2 flex justify-center">
            <Rating value={avg} size="md" />
          </div>
          <p className="mt-2 text-sm text-graphite-500">{reviews.length} {t('tours.reviews')}</p>

          <form onSubmit={submit} className="mt-6 space-y-4 text-left">
            <p className="label">{t('reviews.leave')}</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button type="button" key={s} onClick={() => setRating(s)} aria-label={`${s} звёзд`} className="transition-transform hover:scale-110 active:scale-95">
                  <Star className={cn('h-8 w-8', rating >= s ? 'fill-sand-500 text-sand-500' : 'text-graphite-200 fill-graphite-200')} />
                </button>
              ))}
            </div>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder={t('reviews.yourName')} className="input-base" />
            <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder={t('reviews.write')} rows={4} className="input-base resize-none" />
            <Button variant="sand" type="submit" className="w-full">
              <Send className="h-4 w-4" /> {t('reviews.send')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export function FaqBlock({ items }: { items: Tour['faq'] }) {
  const { lang } = useApp()
  const [open, setOpen] = useState<number | null>(0)
  if (!items.length) return null

  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <div key={i} className="card overflow-hidden">
          <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left">
            <span className="font-semibold text-graphite-900">{f.q[lang] || f.q.ru}</span>
            <ChevronDown className={cn('h-5 w-5 shrink-0 text-pine-600 transition-transform', open === i && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                <p className="border-t border-graphite-100 px-6 py-5 text-sm leading-relaxed text-graphite-600">{f.a[lang] || f.a.ru}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

export function RelatedTours({ tour }: { tour: Tour }) {
  const { t } = useApp()
  const db = useDB()
  const related = db.tours
    .filter((tr) => tr.active !== false && tr.id !== tour.id && tr.categoryIds.some((c) => tour.categoryIds.includes(c)))
    .slice(0, 4)
  if (!related.length) return null
  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-semibold text-graphite-900 md:text-3xl">{t('td.similar')}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{related.map((tr, i) => <TourCardMini key={tr.id} tour={tr} index={i} />)}</div>
    </div>
  )
}

function TourCardMini({ tour, index }: { tour: Tour; index: number }) {
  const { lang } = useApp()
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.06 }}>
      <a href={`/tour/${tour.slug}`} className="group card block overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lift">
        <SmartImage src={tour.images[0]} alt="" className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-105" />
        <div className="p-4">
          <h3 className="line-clamp-1 font-display font-semibold text-graphite-900">{tour.title[lang] || tour.title.ru}</h3>
          <div className="mt-2 flex items-center justify-between">
            <Rating value={tour.rating} size="sm" />
            <span className="text-sm font-bold text-pine-700">
              <Price tjs={tour.discountPercent ? tour.basePrice * (1 - tour.discountPercent / 100) : tour.basePrice} />
            </span>
          </div>
        </div>
      </a>
    </motion.div>
  )
}