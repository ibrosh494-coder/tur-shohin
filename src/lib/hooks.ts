import { useSyncExternalStore } from 'react'
import { getDB, subscribe } from './store'
import type { Lang, Localized } from '../types'

export function useDB() {
  return useSyncExternalStore(subscribe, getDB)
}

export function loc(value: Localized | undefined, lang: Lang): string {
  if (!value) return ''
  return value[lang] ?? value.ru ?? value.tj ?? ''
}

export function plural(n: number, one: string, few: string, many: string): string {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return `${n} ${one}`
  if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) return `${n} ${few}`
  return `${n} ${many}`
}

export function formatDate(date: string, lang: Lang): string {
  const d = new Date(`${date}T00:00:00`)
  if (isNaN(d.getTime())) return date
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'tj' ? 'ru-RU' : 'en-GB'
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
}