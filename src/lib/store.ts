import type { Booking, BookingDraft, BookingStatus, DB, Notification, Review, Tour } from '../types'
import { categories } from './seed/categories'
import { destinations } from './seed/destinations'
import { tours } from './seed/tours'
import { reviews as seedReviews } from './seed/reviews'
import { gallery, news } from './seed/galleryNews'
import { supabase } from './supabase'

const DB_KEY = 'turshohin_db_v2'

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function differenceInDays(a: string, b: string) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

function seed(): DB {
  const id = 'demo-user'
  return {
    tours,
    categories,
    destinations,
    gallery,
    news,
    reviews: seedReviews,
    bookings: [],
    favorites: { [id]: ['tour-fann-15-lakes', 'tour-turkey'] },
    users: [],
    notifications: [],
  }
}

function load(): DB {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as DB
      if (parsed.tours && parsed.tours.length) return parsed
    }
  } catch {
    /* corrupted storage — reseed */
  }
  const fresh = seed()
  persist(fresh)
  return fresh
}

function persist(db: DB) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {
    /* storage full / private mode */
  }
}

let db: DB = load()
const listeners = new Set<() => void>()

function commit() {
  persist(db)
  listeners.forEach((l) => l())
}

// Реактивный доступ к данным — заменяем стор на новую копию после каждой мутации.
export function getDB(): DB {
  return db
}

export function subscribe(fn: () => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function mutate(fn: (draft: DB) => void) {
  const next = structuredClone(db)
  fn(next)
  db = next
  commit()
}

export function getTour(idOrSlug: string): Tour | undefined {
  const t = db.tours.find((x) => x.id === idOrSlug || x.slug === idOrSlug)
  if (!t) return t
  // Поля происхождения не хранятся в БД — подмешиваем из сида (сид всегда зеркало каталога).
  const s = tours.find((x) => x.id === t.id)
  if (s) return { ...t, sourceUrl: s.sourceUrl, priceNote: s.priceNote }
  return t
}

export function getActiveTours(): Tour[] {
  return db.tours.filter((t) => t.active !== false)
}

// ---------------------------------------------------------------------------
// Supabase-синхронизация
// Локальное хранилище остаётся мгновенным «кэшем»: каждая мутация пишется в
// облако в фоне, а изменения с других устройств подтягиваются по realtime.
// ---------------------------------------------------------------------------

const CORE_TABLES = ['tours', 'categories', 'destinations', 'gallery', 'news', 'reviews', 'bookings', 'users', 'notifications'] as const

type TableName = (typeof CORE_TABLES)[number] | 'favorites'

/** Проверяем, что строка пришла из облака в правильном (новом) формате. */
function looksValid(name: string, row: Record<string, unknown>): boolean {
  switch (name) {
    case 'tours':
      return !!row && typeof row.title === 'object' && !!row.shortDescription
    case 'categories':
      return !!row && typeof row.name === 'object'
    case 'destinations':
      return !!row && typeof row.name === 'object'
    case 'gallery':
      return !!row && !!row.image && !!row.title
    case 'news':
      return !!row && !!row.title && !!row.excerpt
    case 'reviews':
      return !!row && !!row.author
    case 'bookings':
      return !!row && !!row.bookingNumber
    case 'users':
      return !!row && !!row.email
    case 'notifications':
      return !!row && !!row.title
    case 'favorites':
      return !!row && !!row.tourId
    default:
      return true
  }
}

function rowsEqual(prev: unknown, nextRows: unknown[]): boolean {
  try {
    if (JSON.stringify(prev) === JSON.stringify(nextRows)) return true
    // Порядок строк из облака может отличаться от локального — сравниваем как наборы.
    const sig = (arr: unknown[]) =>
      (arr as { id?: string }[])
        .map((r) => JSON.stringify(r))
        .sort()
        .join('|')
    return sig(prev as unknown[]) === sig(nextRows)
  } catch {
    return false
  }
}

function applyTransport(name: string, rows: unknown[]) {
  const valid = rows.filter((r) => r && looksValid(name, r as Record<string, unknown>))
  const field = name as keyof DB
  let next: unknown = valid
  if (name === 'favorites') {
    next = (valid as { userId: string; tourId: string }[]).reduce<Record<string, string[]>>((acc, r) => {
      ;(acc[r.userId] ??= []).push(r.tourId)
      return acc
    }, {})
    try {
      if (JSON.stringify(db.favorites) === JSON.stringify(next)) return
    } catch {
      /* fallthrough */
    }
  } else if (rowsEqual(db[field], valid)) {
    // Ничего не изменилось — не трогаем стор, чтобы не перерисовывать всё приложение.
    return
  }
  mutate((d) => {
    switch (name) {
      case 'tours':
        d.tours = valid as Tour[]
        break
      case 'categories':
        d.categories = valid as DB['categories']
        break
      case 'destinations':
        d.destinations = valid as DB['destinations']
        break
      case 'gallery':
        d.gallery = valid as DB['gallery']
        break
      case 'news':
        d.news = valid as DB['news']
        break
      case 'reviews':
        d.reviews = valid as DB['reviews']
        break
      case 'bookings':
        d.bookings = valid as DB['bookings']
        break
      case 'users':
        d.users = (valid as DB['users']).map((u) => ({ ...u, blocked: u.avatar === BLOCK_AVATAR }))
        break
      case 'notifications':
        d.notifications = valid as DB['notifications']
        break
      case 'favorites':
        d.favorites = next as DB['favorites']
        break
    }
  })
}

async function fetchTable(name: TableName) {
  if (!supabase) return 0
  const { data, error } = await supabase.from(name).select('*')
  if (error) return 0
  applyTransport(name, data ?? [])
  const field = name as keyof DB
  return (db[field] as unknown[]).length
}

export async function syncFromSupabase() {
  if (!supabase) return
  const counts: Record<string, number> = {}
  for (const t of CORE_TABLES) {
    counts[t] = await fetchTable(t)
  }
  await fetchTable('favorites')
  // Первичное наполнение: если каталог в облаке пуст — заливаем демо-данные.
  const catalog: [TableName, unknown[]][] = [
    ['tours', tours],
    ['categories', categories],
    ['destinations', destinations],
    ['gallery', gallery],
    ['news', news],
  ]
  for (const [name, rows] of catalog) {
    if (counts[name] === 0) rows.forEach((r) => pushRow(name, r as object))
  }
}

let realtimeStarted = false
function startRealtime() {
  if (!supabase || realtimeStarted) return
  realtimeStarted = true
  try {
    const channel = supabase.channel('turshohin-db')
    for (const t of CORE_TABLES) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: t }, () => {
        void fetchTable(t)
      })
    }
    channel.on('postgres_changes', { event: '*', schema: 'public', table: 'favorites' }, () => {
      void fetchTable('favorites')
    })
    channel.subscribe()
  } catch {
    /* realtime недоступен — работает фолбэк-пуллинг ниже */
  }
  // Резервный опрос каждые 20 секунд — подстраховка, если realtime отключён.
  window.setInterval(() => {
    if (document.visibilityState === 'visible') void syncFromSupabase()
  }, 20000)
}

let bootstrapped = false
function bootstrapSupabase() {
  if (!supabase || bootstrapped) return
  bootstrapped = true
  void syncFromSupabase()
  startRealtime()
}
bootstrapSupabase()

/** Глушим ошибки фоновой синхронизации с облаком. */
function settle(p: PromiseLike<unknown>) {
  void Promise.resolve(p).catch(() => {})
}

/** Прямая запись строки в облако (upsert). Ошибки игнорируем — локально всё работает. */
export function pushRow(table: TableName, row: object) {
  if (!supabase) return
  const rec = { ...(row as Record<string, unknown>) }
  if (table === 'tours') {
    // Поля-происхождения не имеют колонок в tours — не отправляем их в БД.
    delete rec.sourceUrl
    delete rec.priceNote
  }
  settle(supabase.from(table).upsert(rec).select().single())
}

/** Прямое удаление строки из облака. */
export function pushDelete(table: TableName, id: string) {
  if (!supabase) return
  settle(supabase.from(table).delete().eq('id', id))
}

function genBookingNumber() {
  const year = new Date().getFullYear()
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `TS-${year}-${rand}`
}

export function createBooking(draft: BookingDraft): Booking | null {
  const tour = getTour(draft.tourId)
  if (!tour) return null

  const price = tour.discountPercent ? tour.basePrice * (1 - tour.discountPercent / 100) : tour.basePrice
  const extras = (draft.extras || [])
    .filter((e) => e.qty > 0)
    .map((e) => {
      const meta = tour.extras.find((x) => x.id === e.id)
      return {
        id: e.id,
        name: meta ? meta.name.ru : e.id,
        price: meta ? meta.price : 0,
        qty: e.qty,
      }
    })
  const extrasSum = extras.reduce((sum, e) => sum + e.price * e.qty, 0)
  const totalPrice = Math.round(price * draft.travelers + extrasSum)

  const booking: Booking = {
    id: uid('bk'),
    bookingNumber: genBookingNumber(),
    tourId: tour.id,
    userId: draft.userId,
    date: draft.date,
    travelers: draft.travelers,
    name: draft.name,
    phone: draft.phone,
    email: draft.email,
    comment: draft.comment,
    extras,
    totalPrice,
    currency: 'TJS',
    status: 'pending',
    createdAt: new Date().toISOString().slice(0, 10),
  }

  mutate((d) => {
    d.bookings.unshift(booking)
    if (draft.userId) {
      const notif = {
        id: uid('nt'),
        userId: draft.userId!,
        title: 'Заявка создана',
        body: `Бронирование ${booking.bookingNumber} отправлено менеджеру. Ждём подтверждения.`,
        read: false,
        createdAt: booking.createdAt,
      }
      if (!d.notifications.some((n) => n.userId === draft.userId && n.body === notif.body)) {
        d.notifications.unshift(notif)
        pushRow('notifications', notif)
      }
    }
  })
  pushRow('bookings', booking)
  return booking
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  let updated: Booking | undefined
  mutate((d) => {
    const b = d.bookings.find((x) => x.id === id)
    if (!b) return
    b.status = status
    updated = { ...b }
    if (b.userId) {
      const notif = {
        id: uid('nt'),
        userId: b.userId!,
        title: status === 'confirmed' ? 'Бронирование подтверждено' : `Статус изменён: ${status}`,
        body: `Заказ ${b.bookingNumber} — ${status === 'confirmed' ? 'добро пожаловать в путешествие!' : `текущий статус «${status}»`}`,
        read: false,
        createdAt: new Date().toISOString().slice(0, 10),
      }
      d.notifications.unshift(notif)
      pushRow('notifications', notif)
    }
  })
  if (updated) pushRow('bookings', updated)
  return updated
}

export function addReview(input: Omit<Review, 'id' | 'approved' | 'createdAt'>): Review {
  const review: Review = {
    ...input,
    id: uid('rev'),
    approved: false,
    createdAt: new Date().toISOString().slice(0, 10),
  }
  mutate((d) => {
    d.reviews.unshift(review)
  })
  pushRow('reviews', review)
  return review
}

export function setReviewApproved(id: string, approved: boolean) {
  mutate((d) => {
    const r = d.reviews.find((x) => x.id === id)
    if (r) r.approved = approved
  })
  pushRow('reviews', { id, approved })
}

export function deleteReview(id: string) {
  mutate((d) => {
    d.reviews = d.reviews.filter((r) => r.id !== id)
  })
  pushDelete('reviews', id)
}

export function toggleFavorite(userId: string, tourId: string): boolean {
  let added = false
  mutate((d) => {
    const list = d.favorites[userId] ?? (d.favorites[userId] = [])
    const idx = list.indexOf(tourId)
    if (idx >= 0) {
      list.splice(idx, 1)
    } else {
      list.push(tourId)
      added = true
    }
  })
  if (supabase) {
    if (added) {
      settle(supabase.from('favorites').upsert({ userId, tourId }))
    } else {
      settle(supabase.from('favorites').delete().eq('userId', userId).eq('tourId', tourId))
    }
  }
  return added
}

export function getFavorites(userId: string): Tour[] {
  const ids = db.favorites[userId] ?? []
  return db.tours.filter((t) => ids.includes(t.id))
}

export function markNotificationsRead(userId: string) {
  mutate((d) => {
    d.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true
    })
  })
  if (supabase) {
    settle(supabase.from('notifications').update({ read: true }).eq('userId', userId))
  }
}

export function getNotifications(userId: string): Notification[] {
  return db.notifications.filter((n) => n.userId === userId)
}

export function saveTour(tour: Tour, isNew: boolean) {
  mutate((d) => {
    if (isNew) {
      d.tours.unshift(tour)
    } else {
      const idx = d.tours.findIndex((t) => t.id === tour.id)
      if (idx >= 0) d.tours[idx] = tour
    }
  })
  pushRow('tours', tour)
}

export function deleteTour(id: string) {
  mutate((d) => {
    d.tours = d.tours.filter((t) => t.id !== id)
  })
  pushDelete('tours', id)
}

export function saveNews(item: (typeof news)[number], isNew: boolean) {
  mutate((d) => {
    if (isNew) {
      d.news.unshift(item)
    } else {
      const idx = d.news.findIndex((n) => n.id === item.id)
      if (idx >= 0) d.news[idx] = item
    }
  })
  pushRow('news', item)
}

export function deleteNews(id: string) {
  mutate((d) => {
    d.news = d.news.filter((n) => n.id !== id)
  })
  pushDelete('news', id)
}

export function pushUser(user: DB['users'][number]) {
  const { blocked, ...rest } = user as DB['users'][number] & { blocked?: boolean }
  pushRow('users', { ...rest, avatar: blocked ? BLOCK_AVATAR : rest.avatar ?? null })
}

export function isUserBlocked(user: { avatar?: string; blocked?: boolean }): boolean {
  return user.blocked === true || user.avatar === BLOCK_AVATAR
}

export function toggleUserBlock(id: string): boolean {
  let blocked = false
  mutate((d) => {
    const u = d.users.find((x) => x.id === id)
    if (!u) return
    u.blocked = !u.blocked
    blocked = Boolean(u.blocked)
  })
  const updated = getDB().users.find((x) => x.id === id)
  if (updated) pushUser(updated)
  return blocked
}

export async function deleteUser(id: string) {
  if (supabase) {
    try {
      await supabase.from('bookings').update({ userId: null } as never).eq('userId', id)
    } catch {
      /* ignore */
    }
    try {
      await supabase.from('reviews').update({ userId: null } as never).eq('userId', id)
    } catch {
      /* ignore */
    }
    try {
      await supabase.from('notifications').delete().eq('userId', id)
    } catch {
      /* ignore */
    }
    try {
      await supabase.from('favorites').delete().eq('userId', id)
    } catch {
      /* ignore */
    }
    try {
      await supabase.from('users').delete().eq('id', id)
    } catch {
      /* ignore */
    }
  }
  mutate((d) => {
    d.users = d.users.filter((x) => x.id !== id)
    delete d.favorites[id]
    d.notifications = d.notifications.filter((n) => n.userId !== id)
  })
}

const BLOCK_AVATAR = 'BLOCKED'

export async function resetDemoData() {
  if (supabase) {
    for (const t of CORE_TABLES) {
      try {
        await supabase.from(t).delete().neq('id', '__none__')
      } catch {
        /* таблицы может ещё не быть */
      }
    }
    try {
      await supabase.from('favorites').delete().neq('userId', 'x')
    } catch {
      /* ignore */
    }
  }
  localStorage.removeItem(DB_KEY)
  db = seed()
  commit()
  if (supabase) {
    // После очистки облака заливаем заново каталог демо-данных.
    tours.forEach((tr) => pushRow('tours', tr))
    categories.forEach((c) => pushRow('categories', c))
    destinations.forEach((d) => pushRow('destinations', d))
    gallery.forEach((g) => pushRow('gallery', g))
    news.forEach((n) => pushRow('news', n))
  }
}

export type { DB }
export { differenceInDays as daysBetween }