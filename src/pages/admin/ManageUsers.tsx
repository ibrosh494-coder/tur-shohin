import { useState } from 'react'
import { ShieldOff, ShieldCheck, Trash2, Search } from 'lucide-react'
import { useDB } from '../../lib/hooks'
import { useAuth } from '../../lib/auth'
import { toggleUserBlock, deleteUser } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { CardChunk, th, td, EmptyRow } from './adminUi'
import { cn } from '../../components/ui'

export default function ManageUsers() {
  const db = useDB()
  const { user: me } = useAuth()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const bookingCount = (userId: string) => db.bookings.filter((b) => b.userId === userId).length

  const list = db.users.filter((u) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase()))

  const onToggle = (id: string) => {
    if (id === me?.id) {
      toast.toast('Нельзя заблокировать самого себя', 'error')
      return
    }
    const blocked = toggleUserBlock(id)
    toast.toast(blocked ? 'Пользователь заблокирован' : 'Пользователь разблокирован', blocked ? 'info' : 'success')
  }

  const onDelete = async (id: string) => {
    if (id === me?.id) {
      toast.toast('Нельзя удалить самого себя', 'error')
      return
    }
    if (!window.confirm('Удалить пользователя навсегда? Его брони и отзывы останутся, но будут отвязаны.')) return
    setBusy(id)
    await deleteUser(id)
    setBusy(null)
    toast.toast('Пользователь удалён')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-graphite-900">Пользователи</h1>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} className="input-base h-11 w-64 pl-11" placeholder="Поиск по имени или email…" />
        </div>
      </div>

      <CardChunk>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead className="border-b border-graphite-100">
              <tr>
                <th className={th}>Пользователь</th>
                <th className={th}>Роль</th>
                <th className={th}>Регистрация</th>
                <th className={th}>Брони</th>
                <th className={th}>Статус</th>
                <th className={`${th} text-right`}>Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100">
              {list.length === 0 && <EmptyRow colSpan={6} />}
              {list.map((u) => (
                <tr key={u.id} className="hover:bg-graphite-50/60">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-pine-50 font-bold text-pine-700">{u.name.charAt(0).toUpperCase()}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-graphite-900">
                          {u.name} {u.id === me?.id && <span className="ml-1 text-xs font-semibold text-graphite-400">(вы)</span>}
                        </p>
                        <p className="truncate text-xs text-graphite-500">{u.email}</p>
                        {u.phone && <p className="truncate text-xs text-graphite-400">{u.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className={td}>
                    <span className={cn('rounded-full px-3 py-1 text-xs font-bold', u.role === 'admin' ? 'bg-graphite-900 text-white' : 'bg-graphite-100 text-graphite-600')}>
                      {u.role === 'admin' ? 'Админ' : 'Пользователь'}
                    </span>
                  </td>
                  <td className={td}>{u.createdAt}</td>
                  <td className={td}>
                    <span className="rounded-full bg-pine-50 px-2.5 py-1 text-xs font-bold text-pine-700">{bookingCount(u.id)}</span>
                  </td>
                  <td className={td}>
                    {u.blocked ? (
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">Заблокирован</span>
                    ) : (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Активен</span>
                    )}
                  </td>
                  <td className={cn(td, 'text-right')}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onToggle(u.id)}
                        disabled={u.id === me?.id}
                        title={u.blocked ? 'Разблокировать' : 'Заблокировать'}
                        className={cn(
                          'grid h-9 w-9 place-items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40',
                          u.blocked ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-500 hover:bg-red-100',
                        )}
                      >
                        {u.blocked ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => onDelete(u.id)}
                        disabled={u.id === me?.id || busy === u.id}
                        title="Удалить"
                        className="grid h-9 w-9 place-items-center rounded-full bg-graphite-100 text-graphite-500 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
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
    </div>
  )
}