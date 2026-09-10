import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDB } from '../../lib/hooks'
import { saveTour, deleteTour, tourPrice } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { Button, cn } from '../../components/ui'
import { CardChunk, th, td, EmptyRow } from './adminUi'
import type { Tour } from '../../types'

const DIFFS = ['easy', 'moderate', 'hard', 'extreme'] as const

const emptyTour = (): Tour => ({
  id: `tour_${Date.now()}`,
  slug: '',
  title: { ru: '', tj: '', en: '' },
  shortDescription: { ru: '', tj: '', en: '' },
  description: { ru: '', tj: '', en: '' },
  images: [],
  destinationIds: [],
  categoryIds: [],
  country: 'Таджикистан',
  city: '',
  region: '',
  durationDays: 3,
  difficulty: 'moderate',
  rating: 4.8,
  reviewsCount: 0,
  basePrice: 79,
  discountPercent: 0,
  groupSizeMin: 1,
  groupSizeMax: 12,
  includes: [],
  excludes: [],
  whatToBring: [],
  faq: [],
  days: [],
  locations: [],
  extras: [],
  startDates: [],
  featured: false,
  isNew: true,
  active: true,
  createdAt: new Date().toISOString().slice(0, 10),
})

export default function ManageTours() {
  const db = useDB()
  const toast = useToast()
  const [editing, setEditing] = useState<Tour | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [q, setQ] = useState('')

  const list = db.tours.filter((t) => t.title.ru.toLowerCase().includes(q.toLowerCase()))

  const openNew = () => {
    setEditing(emptyTour())
    setIsNew(true)
  }

  const save = (t: Tour) => {
    const final: Tour = { ...t, slug: t.slug || t.title.ru.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/(^-|-$)/g, '') }
    saveTour(final, isNew)
    toast.toast(isNew ? 'Тур добавлен' : 'Тур сохранён')
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-graphite-900">Туры</h1>
        <div className="flex items-center gap-3">
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input-base h-11 w-56" placeholder="Поиск…" />
          <Button onClick={openNew} className="h-11">
            <Plus className="h-4 w-4" /> Добавить тур
          </Button>
        </div>
      </div>

      <CardChunk>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="border-b border-graphite-100">
              <tr>
                <th className={th}>Тур</th>
                <th className={th}>Цена</th>
                <th className={th}>Дни</th>
                <th className={th}>Сложность</th>
                <th className={th}>Активен</th>
                <th className={th}>Хит</th>
                <th className={`${th} text-right`}>Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100">
              {list.length === 0 && <EmptyRow colSpan={7} />}
              {list.map((t) => (
                <tr key={t.id} className="hover:bg-graphite-50/60">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      {t.images[0] ? <img src={t.images[0]} alt="" className="h-11 w-16 rounded-xl object-cover" /> : <span className="grid h-11 w-16 place-items-center rounded-xl bg-graphite-100 text-xs text-graphite-400">—</span>}
                      <span className="font-bold text-graphite-900">{t.title.ru}</span>
                    </div>
                  </td>
                  <td className={td}>
                    <span className="font-bold">{tourPrice(t).toLocaleString('ru-RU')} TJS</span>
                    {t.discountPercent ? <span className="ml-2 rounded-full bg-sand-100 px-2 py-0.5 text-xs font-bold text-sand-700">−{t.discountPercent}%</span> : null}
                  </td>
                  <td className={td}>{t.durationDays}</td>
                  <td className={td}>
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-bold',
                        t.difficulty === 'easy' && 'bg-emerald-50 text-emerald-700',
                        t.difficulty === 'moderate' && 'bg-sand-50 text-sand-700',
                        t.difficulty === 'hard' && 'bg-orange-50 text-orange-700',
                        t.difficulty === 'extreme' && 'bg-red-50 text-red-700',
                      )}
                    >
                      {t.difficulty}
                    </span>
                  </td>
                  <td className={td}>
                    <button
                      onClick={() => {
                        saveTour({ ...t, active: !t.active }, false)
                        toast.toast(!t.active ? 'Тур включён' : 'Тур скрыт', 'info')
                      }}
                      className={cn('rounded-full px-3 py-1 text-xs font-bold transition-colors', t.active ? 'bg-emerald-50 text-emerald-700' : 'bg-graphite-100 text-graphite-400')}
                    >
                      {t.active ? 'Да' : 'Нет'}
                    </button>
                  </td>
                  <td className={td}>
                    <button
                      onClick={() => {
                        saveTour({ ...t, featured: !t.featured }, false)
                        toast.toast('Обновлено', 'info')
                      }}
                      className={cn('rounded-full px-3 py-1 text-xs font-bold', t.featured ? 'bg-sand-100 text-sand-700' : 'bg-graphite-100 text-graphite-400')}
                    >
                      {t.featured ? 'Хит' : '—'}
                    </button>
                  </td>
                  <td className={cn(td, 'text-right')}>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditing({ ...t }); setIsNew(false) }} className="grid h-9 w-9 place-items-center rounded-xl bg-graphite-100 text-graphite-600 hover:bg-graphite-200">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Удалить тур «${t.title.ru}»?`)) {
                            deleteTour(t.id)
                            toast.toast('Тур удалён', 'info')
                          }
                        }}
                        className="grid h-9 w-9 place-items-center rounded-xl bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardChunk>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-graphite-950/60 p-4 backdrop-blur-sm"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="my-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-lift md:p-8"
            >
              <h2 className="font-display text-xl font-semibold">{isNew ? 'Новый тур' : 'Редактировать тур'}</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="label">Название (RU) *</span>
                  <input value={editing.title.ru} onChange={(e) => setEditing({ ...editing, title: { ...editing.title, ru: e.target.value } })} className="input-base" />
                </label>
                <label>
                  <span className="label">Город</span>
                  <input value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} className="input-base" />
                </label>
                <label>
                  <span className="label">Регион</span>
                  <input value={editing.region} onChange={(e) => setEditing({ ...editing, region: e.target.value })} className="input-base" />
                </label>
                <label>
                  <span className="label">Цена за день (TJS) *</span>
                  <input type="number" value={editing.basePrice} onChange={(e) => setEditing({ ...editing, basePrice: Number(e.target.value) })} className="input-base" />
                </label>
                <label>
                  <span className="label">Скидка %</span>
                  <input type="number" min={0} max={90} value={editing.discountPercent ?? 0} onChange={(e) => setEditing({ ...editing, discountPercent: Number(e.target.value) })} className="input-base" />
                </label>
                <label>
                  <span className="label">Длительность (дни)</span>
                  <input type="number" min={1} value={editing.durationDays} onChange={(e) => setEditing({ ...editing, durationDays: Number(e.target.value) })} className="input-base" />
                </label>
                <label>
                  <span className="label">Сложность</span>
                  <select value={editing.difficulty} onChange={(e) => setEditing({ ...editing, difficulty: e.target.value as Tour['difficulty'] })} className="input-base">
                    {DIFFS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="label">Мин. группа</span>
                  <input type="number" min={1} value={editing.groupSizeMin} onChange={(e) => setEditing({ ...editing, groupSizeMin: Number(e.target.value) })} className="input-base" />
                </label>
                <label>
                  <span className="label">Макс. группа</span>
                  <input type="number" min={1} value={editing.groupSizeMax} onChange={(e) => setEditing({ ...editing, groupSizeMax: Number(e.target.value) })} className="input-base" />
                </label>
                <label>
                  <span className="label">Рейтинг</span>
                  <input type="number" step={0.1} min={0} max={5} value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} className="input-base" />
                </label>
                <label className="sm:col-span-2">
                  <span className="label">Изображения (URL, по одному на строку)</span>
                  <textarea
                    rows={3}
                    value={editing.images.join('\n')}
                    onChange={(e) => setEditing({ ...editing, images: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
                    className="input-base resize-none"
                  />
                </label>
                <label>
                  <span className="label">Даты старта (YYYY-MM-DD, через запятую)</span>
                  <input value={editing.startDates.join(', ')} onChange={(e) => setEditing({ ...editing, startDates: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} className="input-base" />
                </label>
                <label className="flex items-end gap-6 pb-2">
                  <span className="flex items-center gap-2 text-sm font-bold text-graphite-700">
                    <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} className="h-4 w-4 accent-pine-600" /> Активен
                  </span>
                  <span className="flex items-center gap-2 text-sm font-bold text-graphite-700">
                    <input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} className="h-4 w-4 accent-sand-600" /> Хит продаж
                  </span>
                </label>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditing(null)}>Отмена</Button>
                <Button onClick={() => save(editing)} disabled={!editing.title.ru.trim()}>Сохранить</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}