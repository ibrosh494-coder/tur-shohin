import { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDB, formatDate } from '../../lib/hooks'
import { useApp } from '../../lib/AppContext'
import { saveNews, deleteNews } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { Button, cn } from '../../components/ui'
import { CardChunk, th, td, EmptyRow } from './adminUi'
import type { NewsItem } from '../../types'

const emptyNews = (): NewsItem => ({
  id: `news_${Date.now()}`,
  slug: '',
  title: { ru: '', tj: '', en: '' },
  excerpt: { ru: '', tj: '', en: '' },
  body: { ru: '', tj: '', en: '' },
  image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1200&auto=format&fit=crop',
  date: new Date().toISOString().slice(0, 10),
})

export default function ManageNews() {
  const { lang } = useApp()
  const db = useDB()
  const toast = useToast()
  const [editing, setEditing] = useState<NewsItem | null>(null)
  const [isNew, setIsNew] = useState(false)

  const list = [...db.news].sort((a, b) => b.date.localeCompare(a.date))

  const save = (n: NewsItem) => {
    const final: NewsItem = {
      ...n,
      body: {
        ru: (n.body?.ru || '').split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean).join('\n\n'),
        tj: n.body?.tj || '',
        en: n.body?.en || '',
      },
      slug: n.slug || n.title.ru.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '-').replace(/(^-|-$)/g, ''),
    }
    saveNews(final, isNew)
    toast.toast(isNew ? 'Новость добавлена' : 'Новость сохранена')
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-graphite-900">Новости</h1>
        <Button
          onClick={() => {
            setEditing(emptyNews())
            setIsNew(true)
          }}
          className="h-11"
        >
          <Plus className="h-4 w-4" /> Добавить
        </Button>
      </div>

      <CardChunk>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="border-b border-graphite-100">
              <tr>
                <th className={th}>Новость</th>
                <th className={th}>Дата</th>
                <th className={th}>Slug</th>
                <th className={`${th} text-right`} />
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100">
              {list.length === 0 && <EmptyRow colSpan={4} />}
              {list.map((n) => (
                <tr key={n.id} className="hover:bg-graphite-50/60">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <img src={n.image} alt="" className="h-11 w-16 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold text-graphite-900">{n.title.ru}</p>
                        <p className="line-clamp-1 text-xs text-graphite-400">{n.excerpt.ru}</p>
                      </div>
                    </div>
                  </td>
                  <td className={td}>{formatDate(n.date, lang)}</td>
                  <td className={cn(td, 'font-mono text-xs text-graphite-400')}>/news/{n.slug}</td>
                  <td className={cn(td, 'text-right')}>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditing({ ...n }); setIsNew(false) }} className="grid h-9 w-9 place-items-center rounded-xl bg-graphite-100 text-graphite-600 hover:bg-graphite-200">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Удалить новость?')) {
                            deleteNews(n.id)
                            toast.toast('Удалено', 'info')
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
              <h2 className="font-display text-xl font-semibold">{isNew ? 'Новая новость' : 'Редактировать новость'}</h2>
              <div className="mt-5 grid gap-4">
                <label>
                  <span className="label">Заголовок (RU) *</span>
                  <input value={editing.title.ru} onChange={(e) => setEditing({ ...editing, title: { ...editing.title, ru: e.target.value } })} className="input-base" />
                </label>
                <label>
                  <span className="label">Анонс (RU)</span>
                  <textarea rows={2} value={editing.excerpt.ru} onChange={(e) => setEditing({ ...editing, excerpt: { ...editing.excerpt, ru: e.target.value } })} className="input-base resize-none" />
                </label>
                <label>
                  <span className="label">Текст (RU). Абзацы — через пустую строку</span>
                  <textarea
                    rows={7}
                    value={editing.body?.ru ?? ''}
                    onChange={(e) => setEditing({ ...editing, body: { ...editing.body!, ru: e.target.value } })}
                    className="input-base resize-none"
                  />
                </label>
                <label>
                  <span className="label">Изображение (URL)</span>
                  <input value={editing.image} onChange={(e) => setEditing({ ...editing, image: e.target.value })} className="input-base" />
                </label>
                <label>
                  <span className="label">Дата</span>
                  <input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className="input-base" />
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