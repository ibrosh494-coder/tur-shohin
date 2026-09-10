import { Link } from 'react-router-dom'
import { Heart, ArrowRight } from 'lucide-react'
import { Seo } from '../lib/seo'
import { useApp } from '../lib/AppContext'
import { useAuth } from '../lib/auth'
import { getFavorites } from '../lib/store'
import { Price, Rating, SmartImage, SectionHeader } from '../components/ui'
import { tourPrice } from '../lib/store'
import { FavoriteHeart } from '../components/tour/TourCard'

export default function Favorites() {
  const { t, lang } = useApp()
  const { user } = useAuth()

  if (!user) return null
  const favorites = getFavorites(user.id)

  return (
    <>
      <Seo title="Избранное — Тур Шохин" description="Сохранённые туры" />
      <section className="bg-graphite-50/60 pb-16 pt-28 md:pt-32">
        <div className="container-x max-w-6xl">
          <SectionHeader title={t('ac.tabs.favorites')} subtitle={`${favorites.length} ${t('tours.days')}`} />
          {favorites.length === 0 ? (
            <div className="card grid place-items-center p-20 text-center">
              <span className="grid h-20 w-20 place-items-center rounded-full bg-pine-50 text-pine-600">
                <Heart className="h-9 w-9" />
              </span>
              <p className="mt-5 font-display text-2xl text-graphite-700">{t('ac.noFav')}</p>
              <Link to="/tours" className="btn-primary mt-8 h-12 px-8">
                {t('tours.all')} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {favorites.map((tour) => (
                <Link key={tour.id} to={`/tour/${tour.slug}`} className="group card block overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative">
                    <SmartImage src={tour.images[0]} alt="" className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute right-3 top-3">
                      <FavoriteHeart tourId={tour.id} />
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 font-display font-semibold text-graphite-900">{tour.title[lang] || tour.title.ru}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <Rating value={tour.rating} count={tour.reviewsCount} size="sm" />
                      <Price tjs={tourPrice(tour)} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}