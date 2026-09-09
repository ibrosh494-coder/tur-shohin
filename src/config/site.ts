export const SITE = {
  name: 'ТУР ШОХИН',
  url: 'https://turshohin.tj',
  email: 'hello@turshohin.tj',
  phone: '+992 90 000 00 00',
  whatsapp: '+992 90 000 00 00',
  telegram: '@turshohin',
  address: 'г. Душанбе, ул. Рудаки 14',
}

export const CURRENCY_RATES = {
  TJS: 1,
  USD: 10.85,
  EUR: 12.1,
} as const

export type CurrencyCode = keyof typeof CURRENCY_RATES

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  TJS: 'сомони',
  USD: '$',
  EUR: '€',
}