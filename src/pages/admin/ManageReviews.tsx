import { Check, Trash2, Star } from 'lucide-react'
import { useDB, formatDate } from '../../lib/hooks'
import { useApp } from '../../lib/AppContext'
import { setReviewApproved, deleteReview } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { cn } from '../../components/ui'
import { CardChunk, th, td, EmptyRow } from './adminUi'

export default function ManageReviews() {
  const { lang } = useApp()
  const db = useDB()
  const toast = useToast()

  const pending = db.reviews.filter((r) => !r.approved)
  const all = db.reviews.filter((r) => r.approved)

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-semibold text-graphite-900">Отзывы</h1>

      <CardChunk title={`На модерации (${pending.length})`}>
        {pending.length === 0 ? (
          <p className="text-sm text-graphite-400">Всё одобрено 🎉</p>
        ) : (
          <ul className="space-y-4">
            {pending.map((r) => {
              const tour = db.tours.find((tr) => tr.id === r.tourId)
              return (
                <li key={r.id} className="flex flex-col gap-3 rounded-2xl border border-sand-200 bg-sand-50/50 p-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-graphite-900">{r.author}</span>
                      <span className="flex items-center gap-0.5 text-xs font-bold text-sand-600">
                        <Star className="h-3.5 w-3.5 fill-current" /> {r.rating}
                      </span>
                      <span className="text-xs text-graphite-400">{tour?.title.ru}</span>
                    </div>
                    <p className="mt-1 text-sm text-graphite-600">{r.text}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => { setReviewApproved(r.id, true); toast.toast('Отзыв опубликован') }}
                      className="grid h-9 w-9 place-items-center rounded-xl bg-pine-600 text-white hover:bg-pine-700"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { deleteReview(r.id); toast.toast('Отзыв удалён', 'info') }}
                      className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardChunk>

      <CardChunk title={`Опубликовано (${all.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead className="border-b border-graphite-100">
              <tr>
                <th className={th}>Автор</th>
                <th className={th}>Тур</th>
                <th className={th}>Рейтинг</th>
                <th className={th}>Отзыв</th>
                <th className={th}>Дата</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100">
              {all.length === 0 && <EmptyRow colSpan={6} />}
              {all.map((r) => {
                const tour = db.tours.find((tr) => tr.id === r.tourId)
                return (
                  <tr key={r.id} className="hover:bg-graphite-50/60">
                    <td className={cn(td, 'font-bold')}>{r.author}</td>
                    <td className={td}>{tour?.title.ru ?? '—'}</td>
                    <td className={td}>
                      <span className="flex items-center gap-1 font-bold text-sand-600">
                        <Star className="h-3.5 w-3.5 fill-current" /> {r.rating}
                      </span>
                    </td>
                    <td className={cn(td, 'max-w-[320px]')}>
                      <p className="line-clamp-2 text-graphite-500">{r.text}</p>
                    </td>
                    <td className={td}>{formatDate(r.createdAt, lang)}</td>
                    <td className={cn(td, 'text-right')}>
                      <button
                        onClick={() => { deleteReview(r.id); toast.toast('Отзыв удалён', 'info') }}
                        className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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