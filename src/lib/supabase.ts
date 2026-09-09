import { createClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || ''
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || ''

// Клиент включается ТОЛЬКО когда в .env.local вставлены настоящие ключи.
// Пока их нет (или они пустые/заглушки) — приложение работает в демо-режиме.
export const isSupabaseEnabled = url.length > 10 && url.startsWith('https://') && anonKey.length > 50

// Авторизация самой Supabase нам не нужна (вход — через нашу таблицу users),
// поэтому отключаем хранение токенов: иначе старый сеанс из localStorage
// подставляется в Authorization и ломает анонимные чтения (401).
export const supabase = isSupabaseEnabled
  ? createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  : null