import { useState } from 'react'
import { useDB, formatDate } from '../../lib/hooks'
import { useApp } from '../../lib/AppContext'
import { updateBookingStatus } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { StatusBadge, cn } from '../../components/ui'
import { CardChunk, th, td, EmptyRow } from './adminUi'
import type { BookingStatus } from '../../types'

const TABS: { key: 'all' | BookingStatus; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'pending', label: 'Ожидают' },
  { key: 'confirmed', label: 'Подтверждены' },
  { key: 'completed', label: 'Завершены' },
  { key: 'cancelled', label: 'Отменены' },
]

export default function ManageBookings() {
  const { lang } = useApp()
  const db = useDB()
  const toast = useToast()
  const [tab, setTab] = useState<'all' | BookingStatus>('all')

  const list = db.bookings.filter((b) => tab === 'all' || b.status === tab)

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-graphite-900">Бронирования</h1>
      <div className="flex flex-wrap gap-2">
        {TABS.map((tb) => {
          const count = tb.key === 'all' ? db.bookings.length : db.bookings.filter((b) => b.status === tb.key).length
          return (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors',
                tab === tb.key ? 'bg-graphite-900 text-white shadow-soft' : 'bg-white text-graphite-600 hover:bg-graphite-100',
              )}
            >
              {tb.label}
              <span className={cn('rounded-full px-2 py-0.5 text-[10px]', tab === tb.key ? 'bg-white/20' : 'bg-graphite-100')}>{count}</span>
            </button>
          )
        })}
      </div>

      <CardChunk>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="border-b border-graphite-100">
              <tr>
                <th className={th}>№</th>
                <th className={th}>Тур</th>
                <th className={th}>Клиент</th>
                <th className={th}>Контакты</th>
                <th className={th}>Дата тура</th>
                <th className={th}>Сумма</th>
                <th className={th}>Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100">
              {list.length === 0 && <EmptyRow colSpan={7} />}
              {list.map((b) => {
                const tour = db.tours.find((tr) => tr.id === b.tourId)
                return (
                  <tr key={b.id} className="align-top hover:bg-graphite-50/60">
                    <td className={cn(td, 'font-bold text-pine-700')}>{b.bookingNumber}</td>
                    <td className={td}>
                      <span className="font-semibold text-graphite-900">{tour?.title.ru ?? 'Тур'}</span>
                      <p className="text-xs text-graphite-400">Создана: {formatDate(b.createdAt, lang)}</p>
                    </td>
                    <td className={cn(td, 'font-bold')}>{b.name}</td>
                    <td className={td}>
                      <p>{b.phone}</p>
                      <p className="text-xs text-graphite-500">{b.email}</p>
                      {b.comment && <p className="mt-1 max-w-[200px] truncate text-xs italic text-graphite-400" title={b.comment}>{b.comment}</p>}
                      {b.travelers > 1 && <p className="mt-1 text-xs text-graphite-400">+ доп: {b.travelers} чел.</p>}
                    </td>
                    <td className={td}>
                      {formatDate(b.date, lang)}
                      {b.extras.length > 0 && <p className="text-xs text-graphite-400">{b.extras.map((e) => `${e.name} ×${e.qty}`).join(', ')}</p>}
                    </td>
                    <td className={cn(td, 'font-display font-bold')}>{b.totalPrice.toLocaleString('ru-RU')} TJS</td>
                    <td className={td}>
                      <select
                        value={b.status}
                        onChange={(e) => {
                          updateBookingStatus(b.id, e.target.value as BookingStatus)
                          toast.toast(`Статус → ${e.target.value}`)
                        }}
                        className={cn(
                          'rounded-full border-0 px-3 py-1.5 text-xs font-bold outline-none',
                          b.status === 'pending' && 'bg-orange-50 text-orange-700',
                          b.status === 'confirmed' && 'bg-pine-50 text-pine-700',
                          b.status === 'completed' && 'bg-emerald-50 text-emerald-700',
                          b.status === 'cancelled' && 'bg-red-50 text-red-600',
                        )}
                      >
                        <option value="pending">pending</option>
                        <option value="confirmed">confirmed</option>
                        <option value="completed">completed</option>
                        <option value="cancelled">cancelled</option>
                      </select>
                      <div className="mt-2"><StatusBadge status={b.status} /></div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardChunk>
    </div>
  )
}