import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Users, Minus, Plus, ShieldCheck, Clock3 } from 'lucide-react'
import type { Tour } from '../../types'
import { useApp } from '../../lib/AppContext'
import { useAuth } from '../../lib/auth'
import { cn, Price, Button } from '../ui'
import { formatDate } from '../../lib/hooks'
import { tourPrice, tourFullPrice } from '../../lib/store'

export function BookingCard({ tour }: { tour: Tour }) {
  const { t, lang } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const unit = tourPrice(tour)
  const maxTravelers = Math.max(1, tour.groupSizeMax || 1)

  const [date, setDate] = useState(tour.startDates[0] ?? '')
  const [travelers, setTravelers] = useState(1)
  const [extras, setExtras] = useState<Record<string, number>>({})

  const changeTravelers = (delta: number) => {
    setTravelers((prev) => Math.min(maxTravelers, Math.max(1, prev + delta)))
  }

  const toggleExtra = (id: string) => {
    setExtras((prev) => {
      const next = { ...prev }
      next[id] = next[id] ? 0 : 1
      return next
    })
  }

  const total = useMemo(() => {
    const extrasSum = tour.extras.reduce((sum, e) => sum + e.price * (extras[e.id] ?? 0), 0)
    return Math.round(unit * travelers + extrasSum)
  }, [unit, travelers, extras, tour.extras])

  const book = () => {
    if (!date) {
      alert(t('bk.dateReq'))
      return
    }
    const params = new URLSearchParams({ tour: tour.id, date, pax: String(travelers) })
    Object.entries(extras).forEach(([id, qty]) => {
      if (qty) params.append('extra', `${id}:${qty}`)
    })
    navigate(`/booking?${params.toString()}`)
  }

  return (
    <div className="relative card overflow-hidden">
      <div className="bg-gradient-to-br from-pine-700 to-pine-900 px-6 py-5 text-white">
        <div className="flex items-end justify-between">
          <div>
            {tour.discountPercent && (
              <p className="text-sm text-white/60 line-through">
                <Price tjs={tourFullPrice(tour)} bold={false} />
              </p>
            )}
            <p className="font-display text-3xl font-bold">
              <Price tjs={unit} />
            </p>
          </div>
          <p className="text-xs text-white/70">{t('td.perPerson')}</p>
        </div>
        {tour.discountPercent && (
          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-sand-500 px-3 py-1 text-xs font-bold">
            {t('offers.save')} {tour.discountPercent}%
          </p>
        )}
        {tour.priceNote && (
          <p className="mt-2 text-xs leading-relaxed text-white/70">{tour.priceNote[lang] || tour.priceNote.ru}</p>
        )}
      </div>

      <div className="space-y-5 p-6">
        <div>
          <label className="label flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" /> {t('td.date')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {tour.startDates.slice(0, 6).map((d) => (
              <button
                key={d}
                onClick={() => setDate(d)}
                className={cn(
                  'rounded-xl border px-2 py-2.5 text-xs font-bold transition-colors',
                  date === d ? 'border-pine-600 bg-pine-50 text-pine-700' : 'border-graphite-200 text-graphite-600 hover:border-pine-300',
                )}
              >
                {formatDate(d, lang)}
              </button>
            ))}
          </div>
          {tour.startDates.length === 0 && (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-base mt-2 w-full"
            />
          )}
        </div>

        <div>
          <label className="label flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {t('td.travelers')}
          </label>
          <div className="isolate relative z-10 flex items-center gap-3 rounded-2xl border border-graphite-200 px-4 py-3 select-none">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                changeTravelers(-1)
              }}
              disabled={travelers <= 1}
              aria-label="Меньше"
              aria-disabled={travelers <= 1}
              className="grid h-11 w-11 touch-manipulation place-items-center rounded-full bg-graphite-100 font-bold text-graphite-700 transition-colors hover:bg-graphite-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus className="h-4 w-4 pointer-events-none" />
            </button>
            <span className="flex-1 text-center text-lg font-extrabold text-graphite-900">{travelers}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                changeTravelers(1)
              }}
              disabled={travelers >= maxTravelers}
              aria-label="Больше"
              aria-disabled={travelers >= maxTravelers}
              className="grid h-11 w-11 touch-manipulation place-items-center rounded-full bg-graphite-100 font-bold text-graphite-700 transition-colors hover:bg-graphite-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus className="h-4 w-4 pointer-events-none" />
            </button>
          </div>
          <p className="mt-1.5 text-xs text-graphite-400">
            {t('td.groupOf')}: 1–{maxTravelers}
          </p>
        </div>

        {tour.extras.length > 0 && (
          <div>
            <label className="label">{t('td.addExtra')}</label>
            <div className="space-y-2">
              {tour.extras.map((e) => (
                <label key={e.id} className="flex cursor-pointer items-center justify-between rounded-2xl border border-graphite-200 px-4 py-3 transition-colors has-[:checked]:border-pine-500 has-[:checked]:bg-pine-50">
                  <span className="flex items-center gap-2.5 text-sm font-semibold text-graphite-700">
                    <input
                      type="checkbox"
                      checked={!!extras[e.id]}
                      onChange={() => toggleExtra(e.id)}
                      className="h-4 w-4 accent-pine-600"
                    />
                    {e.name[lang] || e.name.ru}
                  </span>
                  <Price tjs={e.price} bold={false} className="text-xs text-graphite-500" />
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-2xl bg-graphite-50 px-4 py-3">
          <span className="text-sm font-semibold text-graphite-600">{t('td.total')}</span>
          <span className="font-display text-xl font-bold text-graphite-900">
            <Price tjs={total} />
          </span>
        </div>

        <Button onClick={book} className="h-14 w-full text-base">
          {t('bk.submit')}
        </Button>
        {!user && (
          <p className="text-center text-xs text-graphite-400">Можно без регистрации. Если войти — статус появится в кабинете.</p>
        )}
        <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-graphite-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-pine-500" /> Безопасная оплата
          </span>
          <span className="flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5 text-pine-500" /> Отмена до 7 дней
          </span>
        </div>
        {tour.sourceUrl && (
          <a
            href={tour.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-[11px] font-semibold text-pine-700 underline-offset-2 hover:underline"
          >
            Источник: shohintour.com
          </a>
        )}
      </div>
    </div>
  )
}