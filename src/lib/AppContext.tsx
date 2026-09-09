import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Lang } from '../types'
import { dictionaries } from './i18n'
import { CURRENCY_RATES, type CurrencyCode } from '../config/site'

const LANG_KEY = 'turshohin_lang'
const CURRENCY_KEY = 'turshohin_currency'

interface AppState {
  lang: Lang
  setLang: (l: Lang) => void
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  t: (key: string) => string
}

const AppContext = createContext<AppState>(null as unknown as AppState)

function getInitialLang(): Lang {
  const saved = localStorage.getItem(LANG_KEY) as Lang | null
  if (saved && ['ru', 'tj', 'en'].includes(saved)) return saved
  return 'ru'
}

function getInitialCurrency(): CurrencyCode {
  const saved = localStorage.getItem(CURRENCY_KEY) as CurrencyCode | null
  if (saved && ['TJS', 'USD', 'EUR'].includes(saved)) return saved
  return 'TJS'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)
  const [currency, setCurrencyState] = useState<CurrencyCode>(getInitialCurrency)

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(LANG_KEY, l)
    setLangState(l)
  }, [])

  const setCurrency = useCallback((c: CurrencyCode) => {
    localStorage.setItem(CURRENCY_KEY, c)
    setCurrencyState(c)
  }, [])

  const t = useCallback(
    (key: string) => {
      const dict = dictionaries[lang]
      return dict[key] ?? dictionaries.ru[key] ?? key
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLang, currency, setCurrency, t }), [lang, currency, setLang, setCurrency, t])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}

export function convertPrice(tjs: number, currency: CurrencyCode): number {
  return tjs / CURRENCY_RATES[currency]
}

export function formatPrice(tjs: number, currency: CurrencyCode): string {
  const value = convertPrice(tjs, currency)
  if (currency === 'TJS') {
    return `${Math.round(value).toLocaleString('ru-RU')} сомони`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: value >= 100 ? 0 : 1,
  }).format(value)
}