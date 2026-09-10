import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Role, User } from '../types'
import { mutate, getDB, pushUser, isUserBlocked } from './store'
import { supabase } from './supabase'

export const ROLE_RANK: Record<Role, number> = { user: 0, manager: 1, admin: 2, superadmin: 3 }

export function canAccess(role: Role, min: number): boolean {
  return (ROLE_RANK[role] ?? 0) >= min
}

/** Уровень доступа в админке: 1+ любые сотрудники (все разделы), 2+ пользователи (админ и суперадмин). */
export const ACCESS = { staff: 1, users: 2 } as const

const SESSION_KEY = 'turshohin_session'

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
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
        role: 'superadmin',
        passwordHash: '',
        createdAt: '2026-01-01',
      })
    })
  }
  // хэши паролей вычисляем один раз и храним в сессии базы
  void hashSeedPasswords()
}

async function hashSeedPasswords() {
  const db = getDB()
  const seedHashes = db.users.filter((u) => !u.passwordHash && ['user-demo', 'admin-demo'].includes(u.id))
  if (!seedHashes.length) return
  const withHash = seedHashes.map((u) => ({
    id: u.id,
    hash: u.id === 'admin-demo' ? 'admin123' : 'user123',
  }))
  for (const w of withHash) {
    // Если аккаунт уже есть в облаке (email/пароль могли поменять) — не затираем демо-данными.
    if (supabase) {
      const { data } = await supabase.from('users').select('email').eq('id', w.id).maybeSingle()
      if (data?.email) continue
    }
    const hash = await sha256(w.hash)
    mutate((d) => {
      const u = d.users.find((x) => x.id === w.id)
      if (u) u.passwordHash = hash
    })
    // Синхронизируем демо-аккаунты в облако (если Supabase включён),
    // чтобы вход admin@turshohin.tj / user@turshohin.tj работал и в «не демо».
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
  updateProfile: (patch: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthState>(null as unknown as AuthState)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  })

  useMemo(() => {
    ensureSeedUsers()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const target = email.trim().toLowerCase()
    let found: User | undefined
    if (supabase) {
      try {
        const { data } = await supabase.from('users').select('*').eq('email', target).maybeSingle()
        found = (data as User) ?? getDB().users.find((u) => u.email.toLowerCase() === target)
      } catch {
        // Сеть недоступна — вход по локальному кэшу.
        found = getDB().users.find((u) => u.email.toLowerCase() === target)
      }
    } else {
      found = getDB().users.find((u) => u.email.toLowerCase() === target)
    }
    const hash = await sha256(password)
    if (!found || found.passwordHash !== hash) {
      return { ok: false, error: 'Неверный email или пароль' }
    }
    if (isUserBlocked(found)) {
      return { ok: false, error: 'Аккаунт заблокирован администратором' }
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(found))
    setUser(found)
    return { ok: true }
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
    const hash = await sha256(input.password)
    const created: User = {
      id: `user-${Date.now().toString(36)}`,
      email,
      name: input.name.trim(),
      phone: input.phone?.trim() || undefined,
      role: 'user',
      passwordHash: hash,
      createdAt: new Date().toISOString().slice(0, 10),
    }
    mutate((d) => {
      d.users.push(created)
      d.favorites[created.id] = []
    })
    pushUser(created)
    localStorage.setItem(SESSION_KEY, JSON.stringify(created))
    setUser(created)
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const target = email.trim().toLowerCase()
    let found: boolean
    if (supabase) {
      try {
        const { data } = await supabase.from('users').select('id').eq('email', target).maybeSingle()
        found = !!data
      } catch {
        found = false
      }
    } else {
      found = !!getDB().users.find((u) => u.email.toLowerCase() === target)
    }
    if (!found) return { ok: false, error: 'Пользователь не найден' }
    const token = Math.random().toString(36).slice(2, 8).toUpperCase()
    return { ok: true, token }
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
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
    setUser(updated)
  }, [user])

  const value = useMemo(
    () => ({ user, login, register, logout, resetPassword, updateProfile }),
    [user, login, register, logout, resetPassword, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}