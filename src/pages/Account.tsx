import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Users, MapPin, Bell, Heart, User as UserIcon, Sparkles, CheckCheck, LogOut } from 'lucide-react'
import { Seo } from '../lib/seo'
import { useApp } from '../lib/AppContext'
import { useAuth } from '../lib/auth'
import { useDB, formatDate } from '../lib/hooks'
import { updateBookingStatus, getNotifications, markNotificationsRead, getFavorites, tourPrice } from '../lib/store'
import { cn, Button, StatusBadge, Price, SmartImage, Rating } from '../components/ui'
import { useToast } from '../lib/toast'
import { FavoriteHeart } from '../components/tour/TourCard'

type Tab = 'bookings' | 'favorites' | 'profile' | 'notifications'

export default function Account() {
  const { t, lang } = useApp()
  const { user, logout, updateProfile } = useAuth()
  const db = useDB()
  const navigate = useNavigate()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const tab = (params.get('tab') as Tab) || 'bookings'

  const myBookings = user ? db.bookings.filter((b) => b.userId === user.id) : []
  const favorites = user ? getFavorites(user.id) : []
  const notifications = user ? getNotifications(user.id) : []
  const history = myBookings.filter((b) => b.status === 'completed' || b.status === 'cancelled')

  if (!user) return null

  const setName = (name: string | undefined, phone: string | undefined) => {
    void updateProfile({ name: name ?? user.name, phone: phone ?? user.phone })
  }

  return (
    <>
      <Seo title="Личный кабинет — Тур Шохин" />
      <section className="bg-graphite-50/60 pb-16 pt-28 md:pt-32">
        <div className="container-x max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-pine-600 font-display text-xl font-bold text-white shadow-glow">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div>
                <h1 className="font-display text-2xl font-semibold text-graphite-900">
                  {t('ac.hello')}, {user.name}!
                </h1>
                <p className="text-sm text-graphite-500">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {user.role !== 'user' && (
                <Link to="/admin" className="btn-outline h-10 px-5">
                  <Sparkles className="h-4 w-4" /> {t('nav.admin')}
                </Link>
              )}
              <Button
                variant="outline"
                className="h-10 px-5"
                onClick={() => {
                  logout()
                  navigate('/')
                  toast.toast('Вы вышли из аккаунта', 'info')
                }}
              >
                <LogOut className="h-4 w-4" /> {t('ac.signOut')}
              </Button>
            </div>
          </div>

          <div className="mt-8 flex gap-2 overflow-x-auto no-scrollbar">
            {(
              [
                ['bookings', 'ac.tabs.bookings', CalendarDays],
                ['favorites', 'ac.tabs.favorites', Heart],
                ['profile', 'ac.tabs.profile', UserIcon],
                ['notifications', 'ac.tabs.notifications', Bell],
              ] as const
            ).map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => setParams(new URLSearchParams({ tab: key }))}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-colors',
                  tab === key ? 'bg-graphite-900 text-white shadow-soft' : 'bg-white text-graphite-600 hover:bg-graphite-100',
                )}
              >
                <Icon className="h-4 w-4" />
                {t(label)}
                {key === 'notifications' && notifications.some((n) => !n.read) && <span className="h-2 w-2 rounded-full bg-red-500" />}
                {key === 'bookings' && myBookings.length > 0 && <span className="rounded-full bg-pine-100 px-2 py-0.5 text-[10px] text-pine-700">{myBookings.length}</span>}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'bookings' && (
              <motion.div key="b" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-8 space-y-4">
                {myBookings.length === 0 && (
                  <div className="card grid place-items-center p-16 text-center">
                    <p className="font-display text-xl text-graphite-700">{t('ac.noBookings')}</p>
                    <Link to="/tours" className="btn-primary mt-6">К турам</Link>
                  </div>
                )}
                {myBookings.map((b) => {
                  const tour = db.tours.find((tr) => tr.id === b.tourId)
                  return (
                    <div key={b.id} className="card flex flex-col gap-4 p-5 md:flex-row md:items-center">
                      {tour && <SmartImage src={tour.images[0]} alt="" className="h-24 w-full shrink-0 rounded-2xl md:w-36" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-pine-600">{b.bookingNumber}</p>
                        <h3 className="truncate font-display text-lg font-semibold text-graphite-900">{tour?.title.ru ?? 'Тур'}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-graphite-500">
                          <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(b.date, lang)}</span>
                          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {b.travelers} {t('td.traveler')}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {tour?.city}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 md:flex-col md:items-end">
                        <StatusBadge status={b.status} />
                        <span className="font-display text-lg font-bold text-graphite-900"><Price tjs={b.totalPrice} /></span>
                      </div>
                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          onClick={() => {
                            updateBookingStatus(b.id, 'cancelled')
                            toast.toast(t('ac.cancelled'), 'info')
                          }}
                          className="btn-outline h-10 px-4"
                        >
                          {t('ac.cancel')}
                        </button>
                      )}
                    </div>
                  )
                })}
              </motion.div>
            )}

            {tab === 'favorites' && (
              <motion.div key="f" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favorites.length ? (
                  favorites.map((tour) => (
                    <div key={tour.id} className="card group overflow-hidden">
                      <Link to={`/tour/${tour.slug}`} className="relative block">
                        <SmartImage src={tour.images[0]} alt="" className="aspect-[4/3] w-full transition-transform duration-700 group-hover:scale-105" />
                        <span className="absolute right-3 top-3">
                          <FavoriteHeart tourId={tour.id} />
                        </span>
                      </Link>
                      <div className="p-4">
                        <Link to={`/tour/${tour.slug}`}>
                          <h3 className="line-clamp-1 font-display font-semibold text-graphite-900">{tour.title[lang] || tour.title.ru}</h3>
                        </Link>
                        <div className="mt-2 flex items-center justify-between">
                          <Rating value={tour.rating} size="sm" />
                          <Price tjs={tourPrice(tour)} />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card col-span-full grid place-items-center p-16 text-center">
                    <Heart className="h-10 w-10 text-graphite-300" />
                    <p className="mt-3 font-display text-xl text-graphite-700">{t('ac.noFav')}</p>
                    <Link to="/tours" className="btn-primary mt-6">К турам</Link>
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'profile' && (
              <motion.div key="p" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-8 max-w-lg">
                <div className="card space-y-5 p-6">
                  <div>
                    <label className="label">{t('auth.name')}</label>
                    <input defaultValue={user.name} id="profile-name" className="input-base" />
                  </div>
                  <div>
                    <label className="label">{t('auth.phone')}</label>
                    <input defaultValue={user.phone ?? ''} id="profile-phone" className="input-base" placeholder="+992 …" />
                  </div>
                  <div>
                    <label className="label">{t('auth.email')}</label>
                    <input defaultValue={user.email} disabled className="input-base opacity-60" />
                  </div>
                  <Button
                    onClick={() => {
                      const name = (document.getElementById('profile-name') as HTMLInputElement).value
                      const phone = (document.getElementById('profile-phone') as HTMLInputElement).value
                      setName(name, phone)
                      toast.toast(t('ac.saved'))
                    }}
                  >
                    {t('ac.saveProfile')}
                  </Button>
                </div>

                {history.length > 0 && (
                  <div className="card mt-6 p-6">
                    <h3 className="mb-4 font-display text-lg font-semibold">{t('ac.history')}</h3>
                    <ul className="space-y-3">
                      {history.map((b) => {
                        const tour = db.tours.find((tr) => tr.id === b.tourId)
                        return (
                          <li key={b.id} className="flex items-center justify-between text-sm">
                            <span className="truncate font-semibold text-graphite-700">{tour?.title.ru}</span>
                            <span className="shrink-0 text-xs text-graphite-400">{formatDate(b.date, lang)}</span>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'notifications' && (
              <motion.div key="n" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-8 max-w-2xl">
                {notifications.length > 0 && (
                  <div className="mb-4 flex justify-end">
                    <Button
                      variant="outline"
                      className="h-10"
                      onClick={() => {
                        markNotificationsRead(user.id)
                        toast.toast('Все прочитаны', 'info')
                      }}
                    >
                      <CheckCheck className="h-4 w-4" /> Прочитать все
                    </Button>
                  </div>
                )}
                <div className="space-y-3">
                  {notifications.length === 0 && <div className="card grid place-items-center p-12 text-graphite-400">Уведомлений пока нет</div>}
                  {notifications.map((n) => (
                    <div key={n.id} className={cn('card flex items-start gap-3 p-5', !n.read && 'border-pine-200 bg-pine-50/40')}>
                      <span className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', n.read ? 'bg-graphite-200' : 'bg-pine-600')} />
                      <div>
                        <p className="font-bold text-graphite-900">{n.title}</p>
                        <p className="mt-1 text-sm text-graphite-600">{n.body}</p>
                        <p className="mt-1 text-xs text-graphite-400">{formatDate(n.createdAt, lang)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}