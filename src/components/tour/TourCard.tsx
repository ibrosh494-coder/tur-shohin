import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, Heart, ArrowRight, BadgePercent } from 'lucide-react'
import type { Tour } from '../../types'
import { useApp } from '../../lib/AppContext'
import { useAuth } from '../../lib/auth'
import { useToast } from '../../lib/toast'
import { toggleFavorite } from '../../lib/store'
import { cn, Rating, Price, SmartImage, useDBState } from './helpers'

export function FavoriteHeart({ tourId, className }: { tourId: string; className?: string }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()
  const db = useDBState()
  const active = user ? (db.favorites[user.id] ?? []).includes(tourId) : false

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) {
      toast.toast('Войдите, чтобы добавить в избранное', 'info')
      navigate('/auth', { state: { from: location.pathname } })
      return
    }
    const added = toggleFavorite(user.id, tourId)
    toast.toast(added ? 'Добавлено в избранное' : 'Убрано из избранного', added ? 'success' : 'info')
  }

  return (
    <button
      onClick={onClick}
      aria-label="Избранное"
      className={cn(
        'grid h-10 w-10 place-items-center rounded-full backdrop-blur-md transition-all active:scale-90',
        active ? 'bg-red-500 text-white shadow-glow' : 'bg-white/85 text-graphite-600 hover:bg-white hover:text-red-500',
        className,
      )}
    >
      <Heart className={cn('h-5 w-5', active && 'fill-white')} />
    </button>
  )
}

export function TourCard({ tour, index = 0 }: { tour: Tour; index?: number }) {
  const { t, lang } = useApp()
  const price = tour.discountPercent ? tour.basePrice * (1 - tour.discountPercent / 100) : tour.basePrice

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
      className="group card relative overflow-hidden transition-shadow duration-300 hover:shadow-lift"
    >
      <Link to={`/tour/${tour.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <SmartImage
            src={tour.images[0]}
            alt={tour.title.ru}
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-108"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-graphite-950/70 via-transparent to-transparent opacity-90" />
          <FavoriteHeart tourId={tour.id} className="absolute right-3 top-3" />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {tour.discountPercent ? (
              <span className="chip bg-red-500 text-white border-transparent shadow-soft">
                <BadgePercent className="h-3.5 w-3.5" /> -{tour.discountPercent}%
              </span>
            ) : null}
            {tour.isNew && <span className="chip bg-pine-600 text-white border-transparent">new</span>}
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="text-white">
              <p className="flex items-center gap-1.5 text-xs font-medium text-white/85">
                <MapPin className="h-3.5 w-3.5" /> {tour.city}, {tour.country}
              </p>
              <h3 className="mt-1 font-display text-lg font-semibold leading-tight">{tour.title[lang] || tour.title.ru}</h3>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <Rating value={tour.rating} count={tour.reviewsCount} size="sm" />
            <span className="flex items-center gap-1 text-xs font-semibold text-graphite-500">
              <Clock className="h-3.5 w-3.5" /> {tour.durationDays} {t('tours.days')}
            </span>
          </div>

          <div className="mt-3 flex items-end justify-between border-t border-graphite-100 pt-3">
            <div>
              {tour.discountPercent ? (
                <p className="text-xs text-graphite-400 line-through">
                  <Price tjs={tour.basePrice} bold={false} />
                </p>
              ) : null}
              <p className="text-sm font-semibold text-graphite-500">
                {t('tours.from')} <Price tjs={price} className="text-lg" />
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-pine-600 transition-colors group-hover:text-pine-700">
              {t('tours.details')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}