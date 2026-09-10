import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, PartyPopper, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import { Seo } from '../lib/seo'
import { useApp } from '../lib/AppContext'
import { useAuth } from '../lib/auth'
import { useDB, formatDate } from '../lib/hooks'
import { createBooking, tourPrice } from '../lib/store'
import { sendTelegramNotification } from '../lib/telegram'
import { useToast } from '../lib/toast'
import { cn, Button, Price, SmartImage } from '../components/ui'
import type { Booking } from '../types'

const STEPS = ['bk.step1', 'bk.step2', 'bk.step3']

export default function Booking() {
  const { t, lang } = useApp()
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const db = useDB()
  const [params] = useSearchParams()

  const tour = db.tours.find((tr) => tr.id === params.get('tour') || tr.slug === params.get('tour'))

  const [step, setStep] = useState(0)
  const [created, setCreated] = useState<Booking | null>(null)
  const [sending, setSending] = useState(false)

  const [date, setDate] = useState(params.get('date') || tour?.startDates[0] || '')
  const [travelers, setTravelers] = useState(() => {
    const p = Number(params.get('pax'))
    const max = Math.max(1, tour?.groupSizeMax || 1)
    return !isNaN(p) ? Math.min(max, Math.max(1, p)) : 1
  })
  const [extras, setExtras] = useState<Record<string, number>>(() => {
    const out: Record<string, number> = {}
    params.getAll('extra').forEach((e) => {
      const [id, qty] = e.split(':')
      if (id) out[id] = Number(qty) || 1
    })
    return out
  })
  const [form, setForm] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    email: user?.email ?? '',
    comment: '',
  })

  const unit = useMemo(() => (tour ? tourPrice(tour) : 0), [tour])

  if (!tour) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
          <p className="font-display text-2xl text-graphite-700">Выберите тур перед бронированием</p>
          <Link to="/tours" className="btn-primary mt-6">К каталогу</Link>
        </div>
      </div>
    )
  }

  const total = Math.round(unit * travelers + tour.extras.reduce((s, e) => s + e.price * (extras[e.id] ?? 0), 0))

  const validateStep1 = () => {
    if (!date) {
      toast.toast(t('bk.dateReq'), 'error')
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (!form.name.trim()) {
      toast.toast(t('bk.nameReq'), 'error')
      return false
    }
    if (form.phone.trim().replace(/[^0-9+]/g, '').length < 6) {
      toast.toast(t('bk.phoneReq'), 'error')
      return false
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      toast.toast(t('bk.emailReq'), 'error')
      return false
    }
    return true
  }

  const submit = async () => {
    if (!validateStep2()) return
    setSending(true)
    const booking = createBooking({
      tourId: tour.id,
      userId: user?.id,
      date,
      travelers,
      extras: Object.entries(extras)
        .filter(([, q]) => q)
        .map(([id, q]) => ({ id, qty: q })),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      comment: form.comment.trim() || undefined,
    })
    if (booking) {
      setCreated(booking)
      setStep(2)
      await sendTelegramNotification(booking, tour)
      if (user) toast.toast('Заявка отправлена менеджеру', 'success')
    } else {
      toast.toast('Ошибка при создании бронирования', 'error')
    }
    setSending(false)
  }

  return (
    <>
      <Seo title="Бронирование тура — Тур Шохин" description="Онлайн-бронирование туров по Таджикистану и миру за 2 минуты." />
      <section className="bg-graphite-50/50 pb-16 pt-28 md:pt-32">
        <div className="container-x max-w-5xl">
          <h1 className="font-display text-3xl font-semibold text-graphite-900 md:text-4xl">{t('bk.title')}</h1>
          <p className="mt-1 text-graphite-500">
            {t('bk.tour')}: <Link to={`/tour/${tour.slug}`} className="font-bold text-pine-600 hover:text-pine-700">{tour.title.ru}</Link>
          </p>

          <div className="mt-8 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center gap-2">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition-colors',
                    i === step ? 'bg-pine-600 text-white' : i < step ? 'bg-pine-100 text-pine-700' : 'bg-graphite-100 text-graphite-400',
                  )}
                >
                  <span className={cn('grid h-5 w-5 place-items-center rounded-full text-[10px]', i === step ? 'bg-white/25' : 'bg-white/60')}>
                    {i + 1}
                  </span>
                  <span className="hidden sm:inline">{t(s)}</span>
                </button>
                {i < STEPS.length - 1 && <div className={cn('h-0.5 flex-1 rounded-full', i < step ? 'bg-pine-500' : 'bg-graphite-100')} />}
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="card min-h-[420px] p-6 md:p-8">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="s0" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                    <label className="label">{t('td.date')}</label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {tour.startDates.map((d) => (
                        <button
                          key={d}
                          onClick={() => setDate(d)}
                          className={cn(
                            'rounded-xl border px-3 py-3 text-xs font-bold transition-colors',
                            date === d ? 'border-pine-600 bg-pine-50 text-pine-700' : 'border-graphite-200 text-graphite-600 hover:border-pine-300',
                          )}
                        >
                          {formatDate(d, lang)}
                        </button>
                      ))}
                    </div>

                    <label className="label mt-8">{t('td.travelers')}</label>
                    <div className="isolate relative z-10 flex w-fit items-center gap-4 rounded-2xl border border-graphite-200 px-4 py-3 select-none">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setTravelers((v) => Math.min(Math.max(1, tour.groupSizeMax || 1), Math.max(1, v - 1)))
                        }}
                        disabled={travelers <= 1}
                        aria-label="Меньше"
                        className="grid h-11 w-11 touch-manipulation place-items-center rounded-full bg-graphite-100 font-bold hover:bg-graphite-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4 pointer-events-none" />
                      </button>
                      <span className="min-w-10 text-center text-xl font-extrabold text-graphite-900">{travelers}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setTravelers((v) => Math.min(Math.max(1, tour.groupSizeMax || 1), v + 1))
                        }}
                        disabled={travelers >= Math.max(1, tour.groupSizeMax || 1)}
                        aria-label="Больше"
                        className="grid h-11 w-11 touch-manipulation place-items-center rounded-full bg-graphite-100 font-bold hover:bg-graphite-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Plus className="h-4 w-4 pointer-events-none" />
                      </button>
                      <span className="text-xs text-graphite-400">мин. 1</span>
                    </div>

                    {tour.extras.length > 0 && (
                      <>
                        <label className="label mt-8">{t('td.addExtra')}</label>
                        <div className="space-y-2">
                          {tour.extras.map((e) => (
                            <label key={e.id} className="flex cursor-pointer items-center justify-between rounded-2xl border border-graphite-200 px-4 py-3 transition-colors has-[:checked]:border-pine-500 has-[:checked]:bg-pine-50">
                              <span className="flex items-center gap-2.5 text-sm font-semibold text-graphite-700">
                                <input
                                  type="checkbox"
                                  checked={!!extras[e.id]}
                                  onChange={() => setExtras((prev) => ({ ...prev, [e.id]: prev[e.id] ? 0 : 1 }))}
                                  className="h-4 w-4 accent-pine-600"
                                />
                                {e.name[lang] || e.name.ru}
                              </span>
                              <Price tjs={e.price} bold={false} className="text-xs text-graphite-500" />
                            </label>
                          ))}
                        </div>
                      </>
                    )}

                    <Button className="mt-8 h-12 px-8" onClick={() => validateStep1() && setStep(1)}>
                      {t('bk.next')} <ChevronRight className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-5">
                    <div>
                      <label className="label">{t('bk.name')} *</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base" placeholder="Иван Петров" />
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="label">{t('bk.phone')} *</label>
                        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-base" placeholder="+992 90 000 00 00" type="tel" />
                      </div>
                      <div>
                        <label className="label">Email *</label>
                        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-base" placeholder="you@mail.com" type="email" />
                      </div>
                    </div>
                    <div>
                      <label className="label">{t('bk.comment')}</label>
                      <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} rows={4} className="input-base resize-none" placeholder="Пожелания, вопросы, особые потребности…" />
                    </div>
                    <div className="flex items-center gap-3 pt-2">
                      <Button variant="outline" className="h-12 px-6" onClick={() => setStep(0)}>
                        <ChevronLeft className="h-4 w-4" /> {t('bk.back')}
                      </Button>
                      <Button className="h-12 flex-1" onClick={submit} disabled={sending}>
                        {sending ? t('auth.sending') : t('bk.submit')}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && created && (
                  <motion.div key="s2" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="grid place-items-center py-6 text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}>
                      <CheckCircle2 className="h-20 w-20 text-pine-600" />
                    </motion.div>
                    <h2 className="mt-6 font-display text-3xl font-semibold text-graphite-900">{t('bk.successTitle')}</h2>
                    <p className="mt-2 max-w-md text-graphite-500">{t('bk.successText')}</p>
                    <div className="mt-8 rounded-3xl border-2 border-dashed border-pine-300 bg-pine-50 px-10 py-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-pine-600">{t('bk.number')}</p>
                      <p className="mt-1 font-display text-3xl font-bold tracking-wider text-pine-800">{created.bookingNumber}</p>
                    </div>
                    <p className="mt-4 text-sm text-graphite-500">{t('bk.track')}</p>
                    <p className="mt-2 rounded-full bg-sand-100 px-4 py-1.5 text-xs font-semibold text-sand-800">{t('bk.notifyInfo')}</p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                      <Button onClick={() => navigate('/tours')} variant="outline">
                        {t('tours.all')}
                      </Button>
                      {user && (
                        <Button onClick={() => navigate('/account?tab=bookings')}>
                          <PartyPopper className="h-4 w-4" /> {t('bk.check')}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <aside>
              <div className="card sticky top-24 overflow-hidden">
                <SmartImage src={tour.images[0]} alt="" className="aspect-video w-full" />
                <div className="space-y-3 p-5">
                  <h3 className="line-clamp-1 font-display font-semibold text-graphite-900">{tour.title.ru}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-graphite-500">{t('td.date')}</span>
                    <span className="font-bold text-graphite-900">{date ? formatDate(date, lang) : '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-graphite-500">{t('td.travelers')}</span>
                    <span className="font-bold text-graphite-900">{travelers} {t('td.traveler')}</span>
                  </div>
                  {Object.entries(extras).filter(([, q]) => q).map(([id, q]) => {
                    const e = tour.extras.find((x) => x.id === id)
                    return e ? (
                      <div key={id} className="flex items-center justify-between text-sm">
                        <span className="text-graphite-500">{e.name.ru} ×{q}</span>
                        <span className="font-semibold text-graphite-800">
                          <Price tjs={e.price * q} bold={false} />
                        </span>
                      </div>
                    ) : null
                  })}
                  <div className="flex items-center justify-between rounded-2xl bg-graphite-50 px-4 py-3">
                    <span className="text-sm font-semibold text-graphite-600">{t('td.total')}</span>
                    <span className="font-display text-xl font-bold text-graphite-900">
                      <Price tjs={total} />
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}