import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Route, ClipboardList, Star, TrendingUp, Users, BadgeDollarSign, Clock } from 'lucide-react'
import { useDB, formatDate } from '../../lib/hooks'
import { useApp } from '../../lib/AppContext'
import { CardChunk } from './adminUi'
import { StatusBadge } from '../../components/ui'

export default function Dashboard() {
  const { lang } = useApp()
  const db = useDB()

  const pending = db.bookings.filter((b) => b.status === 'pending')
  const confirmed = db.bookings.filter((b) => b.status === 'confirmed')
  const completed = db.bookings.filter((b) => b.status === 'completed')
  const revenue = confirmed.reduce((s, b) => s + b.totalPrice, 0) + completed.reduce((s, b) => s + b.totalPrice, 0)
  const unapproved = db.reviews.filter((r) => !r.approved)
  const activeTours = db.tours.filter((tours) => tours.active !== false)

  const stats = [
    { icon: Route, label: 'Активных туров', value: activeTours.length, to: '/admin/tours' },
    { icon: ClipboardList, label: 'Всего заявок', value: db.bookings.length, to: '/admin/bookings' },
    { icon: Clock, label: 'Ожидают подтверждения', value: pending.length, accent: 'text-orange-500', to: '/admin/bookings' },
    { icon: BadgeDollarSign, label: 'Выручка (TJS)', value: revenue.toLocaleString('ru-RU'), to: '/admin/bookings' },
    { icon: Star, label: 'На модерации отзывов', value: unapproved.length, to: '/admin/reviews' },
    { icon: Users, label: 'Пользователей', value: db.users.length },
  ]

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-graphite-900">Дашборд</h1>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <CardChunk>
              <Link to={s.to ?? '#'} className="flex items-center gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-pine-50 text-pine-700">
                  <s.icon className={`h-6 w-6 ${s.accent ?? ''}`} />
                </span>
                <div>
                  <p className={`font-display text-3xl font-bold text-graphite-900 ${s.accent ?? ''}`}>{s.value}</p>
                  <p className="text-xs font-semibold text-graphite-500">{s.label}</p>
                </div>
              </Link>
            </CardChunk>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <CardChunk title="Последние заявки">
          {db.bookings.length === 0 && <p className="text-sm text-graphite-400">Заявок пока нет</p>}
          <ul className="divide-y divide-graphite-100">
            {db.bookings.slice(0, 6).map((b) => {
              const tour = db.tours.find((tr) => tr.id === b.tourId)
              return (
                <li key={b.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-graphite-800">{tour?.title.ru ?? 'Тур'}</p>
                    <p className="text-xs text-graphite-400">
                      {b.bookingNumber} · {b.name} · {formatDate(b.date, lang)}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </li>
              )
            })}
          </ul>
        </CardChunk>

        <CardChunk title="Лучшие туры">
          <ul className="divide-y divide-graphite-100">
            {[...db.tours]
              .sort((a, b) => b.reviewsCount - a.reviewsCount || b.rating - a.rating)
              .slice(0, 5)
              .map((tour) => (
                <li key={tour.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <img src={tour.images[0]} alt="" className="h-10 w-14 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-graphite-800">{tour.title.ru}</p>
                      <p className="text-xs text-graphite-400">
                        {tour.durationDays} дн · {tour.destinationIds.length} напр.
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1 text-sm font-bold text-sand-600">
                    <TrendingUp className="h-4 w-4" /> {tour.rating} · {tour.reviewsCount}
                  </div>
                </li>
              ))}
          </ul>
        </CardChunk>
      </div>
    </div>
  )
}