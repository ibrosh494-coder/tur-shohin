export const SITE = {
  name: 'Шохин Тур',
  url: 'https://shohintour.com',
  email: 'info@shohintour.com',
  phone: '+992 93 470 0096',
  whatsapp: '+992 93 470 0096',
  telegram: '@shohintour',
  address: 'г. Худжанд, ул. Исмоили Сомони, д. 14',
  hours: 'Пн-Сб с 9:00 до 18:00',
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