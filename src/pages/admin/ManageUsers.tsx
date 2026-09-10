import { useState } from 'react'
import { ShieldOff, ShieldCheck, Trash2, Search, KeyRound, Copy } from 'lucide-react'
import { useDB } from '../../lib/hooks'
import { useAuth } from '../../lib/auth'
import { toggleUserBlock, deleteUser, setUserRole, setUserPassword } from '../../lib/store'
import { useToast } from '../../lib/toast'
import { CardChunk, th, td, EmptyRow } from './adminUi'
import { cn } from '../../components/ui'
import type { Role } from '../../types'

const ROLES: { value: Role; label: string }[] = [
  { value: 'user', label: 'Пользователь' },
  { value: 'manager', label: 'Менеджер' },
  { value: 'admin', label: 'Админ' },
]

const ROLE_BADGE: Record<Role, string> = {
  user: 'bg-graphite-100 text-graphite-600',
  manager: 'bg-sand-100 text-sand-700',
  admin: 'bg-graphite-900 text-white',
}

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

  const onChangeRole = (id: string, role: Role) => {
    if (id === me?.id) {
      toast.toast('Нельзя менять собственную роль', 'error')
      return
    }
    setUserRole(id, role)
    toast.toast('Роль обновлена', 'success')
  }

  const onResetPassword = async (u: { id: string; name: string }) => {
    const pw = window.prompt(`Новый пароль для «${u.name}» (мин. 4 символа):`)
    if (pw === null) return
    if (pw.trim().length < 4) {
      toast.toast('Пароль слишком короткий', 'error')
      return
    }
    setBusy(u.id)
    const ok = await setUserPassword(u.id, pw)
    setBusy(null)
    toast.toast(ok ? 'Пароль обновлён — сообщите его пользователю' : 'Пароль не задан', ok ? 'success' : 'error')
  }

  const onCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash)
      toast.toast('Хэш пароля скопирован', 'success')
    } catch {
      toast.toast('Не удалось скопировать', 'error')
    }
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
                <th className={th}>Пароль</th>
                <th className={th}>Регистрация</th>
                <th className={th}>Брони</th>
                <th className={th}>Статус</th>
                <th className={`${th} text-right`}>Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-100">
              {list.length === 0 && <EmptyRow colSpan={7} />}
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
                    {u.id === me?.id ? (
                      <span className={cn('rounded-full px-3 py-1 text-xs font-bold', ROLE_BADGE[u.role])}>
                        {ROLES.find((r) => r.value === u.role)?.label}
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => onChangeRole(u.id, e.target.value as Role)}
                        className="cursor-pointer rounded-full border border-graphite-200 bg-white px-3 py-1 text-xs font-bold text-graphite-700 outline-none transition-colors hover:border-graphite-400"
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className={td}>
                    <span className="flex items-center gap-1.5">
                      <code className="rounded bg-graphite-100 px-2 py-1 font-mono text-xs text-graphite-600" title={u.passwordHash}>
                        {u.passwordHash ? `${u.passwordHash.slice(0, 10)}…` : '—'}
                      </code>
                      {u.passwordHash && (
                        <button onClick={() => onCopyHash(u.passwordHash!)} title="Скопировать хэш" className="grid h-7 w-7 place-items-center rounded-lg text-graphite-400 transition-colors hover:bg-graphite-100 hover:text-graphite-700">
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      )}
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
                        onClick={() => onResetPassword(u)}
                        disabled={busy === u.id}
                        title="Сбросить пароль"
                        className="grid h-9 w-9 place-items-center rounded-full bg-sand-100 text-sand-700 transition-colors hover:bg-sand-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
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