import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Role, User } from '../types'
import { mutate, getDB, pushUser, isUserBlocked, hashPassword, verifyPassword, setUserPassword } from './store'
import { supabase } from './supabase'

export const ROLE_RANK: Record<Role, number> = { user: 0, manager: 1, admin: 2 }

export function canAccess(role: Role, min: number): boolean {
  return (ROLE_RANK[role] ?? 0) >= min
}

export const ACCESS = { staff: 1, users: 2 } as const

const SESSION_KEY = 'turshohin_session'
const RESET_KEY = 'turshohin_reset'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 дней

/** Тип сессии — хранит только безопасные поля, НЕ пароль. */
interface SessionData {
  id: string
  email: string
  name: string
  phone?: string
  role: Role
  avatar?: string
  expiresAt: number
}

function toSession(u: User): SessionData {
  const { passwordHash, salt, blocked, ...safe } = u
  return { ...safe, expiresAt: Date.now() + SESSION_TTL_MS }
}

function isSessionValid(s: SessionData | null): s is SessionData {
  return !!s && typeof s === 'object' && typeof s.id === 'string' && (!s.expiresAt || Date.now() < s.expiresAt)
}

function ensureSeedUsers() {
  if (getDB().users.length === 0) {
    mutate((d) => {
      d.users.push({
        id: 'user-demo',
        email: 'user@turshohin.tj',
        name: 'Демо Путешественник',
        phone: '+992 90 000 00 01',
        role: 'user',
        passwordHash: '',
        createdAt: '2026-01-01',
      })
      d.users.push({
        id: 'admin-demo',
        email: 'admin@turshohin.tj',
        name: 'Администратор',
        phone: '+992 90 000 00 00',
        role: 'admin',
        passwordHash: '',
        createdAt: '2026-01-01',
      })
    })
  }
  void hashSeedPasswords()
}

async function hashSeedPasswords() {
  const db = getDB()
  const seedHashes = db.users.filter((u) => !u.passwordHash && ['user-demo', 'admin-demo'].includes(u.id))
  if (!seedHashes.length) return
  const withHash = seedHashes.map((u) => ({
    id: u.id,
    pw: u.id === 'admin-demo' ? 'admin123' : 'user123',
  }))
  for (const w of withHash) {
    if (supabase) {
      const { data } = await supabase.from('users').select('email').eq('id', w.id).maybeSingle()
      if (data?.email) continue
    }
    const { hash, salt } = await hashPassword(w.pw)
    mutate((d) => {
      const u = d.users.find((x) => x.id === w.id)
      if (u) {
        u.passwordHash = hash
        u.salt = salt
      }
    })
    const updated = getDB().users.find((x) => x.id === w.id)
    if (updated) pushUser(updated)
  }
}

interface AuthState {
  user: User | null
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  register: (input: { name: string; email: string; phone?: string; password: string }) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string; token?: string }>
  confirmResetPassword: (email: string, token: string, password: string) => Promise<{ ok: boolean; error?: string }>
  updateProfile: (patch: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthState>(null as unknown as AuthState)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionUser, setSessionUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as SessionData | User
      // Миграция: старый формат хранил весь User (с passwordHash).
      if ('passwordHash' in parsed) {
        const session = toSession(parsed as User)
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        return parsed as User
      }
      if (!isSessionValid(parsed as SessionData)) {
        localStorage.removeItem(SESSION_KEY)
        return null
      }
      // Восстанавливаем User из БД по id сессии (чтобы получить актуальные данные).
      const dbUser = getDB().users.find((u) => u.id === (parsed as SessionData).id)
      return dbUser ?? null
    } catch {
      return null
    }
  })

  // Обновляем user при изменении sessionUser
  const user = sessionUser

  useEffect(() => {
    ensureSeedUsers()
  }, [])

  // Проверка блокировки/удаления + истечения сессии
  useEffect(() => {
    const check = () => {
      if (!user) return
      const cur = getDB().users.find((u) => u.id === user.id)
      if (!cur || isUserBlocked(cur)) {
        localStorage.removeItem(SESSION_KEY)
        setSessionUser(null)
      }
    }
    check()
    const timer = window.setInterval(check, 8000)
    return () => window.clearInterval(timer)
  }, [user])

  const login = useCallback(async (email: string, password: string) => {
    const target = email.trim().toLowerCase()
    let supBase: User | undefined
    if (supabase) {
      try {
        const { data } = await supabase.from('users').select('*').eq('email', target).maybeSingle()
        if (data) supBase = data as User
      } catch { /* */ }
    }
    const local = getDB().users.find((u) => u.email.toLowerCase() === target)

    // Supabase — источник истины, но сразу после сброса пароля локальная копия
    // может быть новее (если запись в Supabase ещё не прошла или упала молча).
    // Поэтому проверяем оба источника пароля.
    for (const cand of [supBase, local].filter(Boolean) as User[]) {
      if (!cand.passwordHash) continue
      if (await verifyPassword(password, cand.passwordHash, cand.salt)) {
        if (isUserBlocked(cand)) {
          return { ok: false, error: 'Аккаунт заблокирован администратором' }
        }
        const session = toSession(cand)
        localStorage.setItem(SESSION_KEY, JSON.stringify(session))
        setSessionUser(cand)
        return { ok: true }
      }
    }
    return { ok: false, error: 'Неверный email или пароль' }
  }, [])

  const register = useCallback(async (input: { name: string; email: string; phone?: string; password: string }) => {
    const email = input.email.trim().toLowerCase()
    let exists = null
    if (supabase) {
      try {
        exists = await supabase.from('users').select('id').eq('email', email).maybeSingle()
      } catch {
        exists = null
      }
    }
    if (exists?.data || getDB().users.some((u) => u.email.toLowerCase() === email)) {
      return { ok: false, error: 'Пользователь с таким email уже существует' }
    }
    const { hash, salt } = await hashPassword(input.password)
    const created: User = {
      id: `user-${Date.now().toString(36)}`,
      email,
      name: input.name.trim(),
      phone: input.phone?.trim() || undefined,
      role: 'user',
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    mutate((d) => {
      d.users.push(created)
      d.favorites[created.id] = []
    })
    pushUser(created)
    const session = toSession(created)
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setSessionUser(created)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setSessionUser(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const target = email.trim().toLowerCase()
    let found: User | undefined
    if (supabase) {
      try {
        const { data } = await supabase.from('users').select('*').eq('email', target).maybeSingle()
        found = (data as User) ?? getDB().users.find((u) => u.email.toLowerCase() === target)
      } catch {
        found = getDB().users.find((u) => u.email.toLowerCase() === target)
      }
    } else {
      found = getDB().users.find((u) => u.email.toLowerCase() === target)
    }
    if (!found) return { ok: false, error: 'Пользователь не найден' }
    const token = Math.random().toString(36).slice(2, 8).toUpperCase()
    localStorage.setItem(RESET_KEY, JSON.stringify({ email: target, token, expires: Date.now() + 15 * 60 * 1000 }))
    return { ok: true, token }
  }, [])

  const confirmResetPassword = useCallback(async (email: string, token: string, password: string) => {
    const target = email.trim().toLowerCase()
    const pw = password.trim()
    if (pw.length < 6) return { ok: false, error: 'Пароль минимум 6 символов' }
    let rec: { email?: string; token?: string; expires?: number } | null = null
    try {
      rec = JSON.parse(localStorage.getItem(RESET_KEY) ?? 'null') as { email?: string; token?: string; expires?: number } | null
    } catch {
      rec = null
    }
    if (!rec) return { ok: false, error: 'Код не запрашивался' }
    if (rec.email !== target || rec.token !== token.trim().toUpperCase()) {
      return { ok: false, error: 'Неверный код' }
    }
    if (!rec.expires || Date.now() > rec.expires) {
      localStorage.removeItem(RESET_KEY)
      return { ok: false, error: 'Код истёк — запросите заново' }
    }
    let targetId: string | undefined
    const loc = getDB().users.find((x) => x.email.toLowerCase() === target)
    if (loc) targetId = loc.id
    if (!targetId && supabase) {
      try {
        const { data } = await supabase.from('users').select('id').eq('email', target).maybeSingle()
        targetId = (data as { id?: string } | null)?.id
      } catch { /* */ }
    }
    if (!targetId) return { ok: false, error: 'Пользователь не найден' }
    const changed = await setUserPassword(targetId, pw)
    if (!changed) return { ok: false, error: 'Не удалось изменить пароль' }
    localStorage.removeItem(RESET_KEY)
    return { ok: true }
  }, [])

  const updateProfile = useCallback(async (patch: Partial<User>) => {
    const current = getDB().users.find((u) => u.id === user?.id)
    if (!current) return
    const updated = { ...current, ...patch, id: current.id, role: current.role }
    mutate((d) => {
      const idx = d.users.findIndex((u) => u.id === current.id)
      if (idx >= 0) d.users[idx] = updated
    })
    pushUser(updated)
    const session = toSession(updated)
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setSessionUser(updated)
  }, [user])

  const value = useMemo(
    () => ({ user, login, register, logout, resetPassword, confirmResetPassword, updateProfile }),
    [user, login, register, logout, resetPassword, confirmResetPassword, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
