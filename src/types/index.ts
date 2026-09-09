export type Lang = 'ru' | 'tj' | 'en'
export type Role = 'user' | 'admin'

export type Localized = Record<Lang, string>

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: Role
  avatar?: string
  passwordHash?: string
  blocked?: boolean
  createdAt: string
}

export interface Category {
  id: string
  slug: string
  name: Localized
  icon: string
  image?: string
}

export interface Destination {
  id: string
  slug: string
  name: Localized
  country: string
  image: string
  description?: Localized
  keywords: string[]
}

export interface TourDay {
  id: string
  day: number
  title: Localized
  description: Localized
}

export interface TourLocation {
  id: string
  name: Localized
  lat: number
  lng: number
  stop: number
}

export interface TourExtras {
  id: string
  name: Localized
  price: number
}

export type Difficulty = 'easy' | 'moderate' | 'hard' | 'extreme'

export interface Tour {
  id: string
  slug: string
  title: Localized
  shortDescription: Localized
  description: Localized
  images: string[]
  destinationIds: string[]
  categoryIds: string[]
  country: string
  city: string
  region: string
  durationDays: number
  difficulty: Difficulty
  rating: number
  reviewsCount: number
  basePrice: number
  discountPercent?: number
  groupSizeMin: number
  groupSizeMax: number
  includes: Localized[]
  excludes: Localized[]
  whatToBring: Localized[]
  faq: { q: Localized; a: Localized }[]
  days: TourDay[]
  locations: TourLocation[]
  extras: TourExtras[]
  startDates: string[]
  featured?: boolean
  isNew?: boolean
  active?: boolean
  createdAt: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface BookingExtra {
  id: string
  name: string
  price: number
  qty: number
}

export interface Booking {
  id: string
  bookingNumber: string
  tourId: string
  userId?: string
  date: string
  travelers: number
  name: string
  phone: string
  email: string
  comment?: string
  extras: BookingExtra[]
  totalPrice: number
  currency: string
  status: BookingStatus
  createdAt: string
}

export interface Review {
  id: string
  tourId: string
  userId?: string
  author: string
  rating: number
  title?: string
  text: string
  image?: string
  approved: boolean
  createdAt: string
}

export interface GalleryItem {
  id: string
  image: string
  title: Localized
  category: 'pamir' | 'fann' | 'dushanbe' | 'culture' | 'people' | 'adventure'
}

export interface NewsItem {
  id: string
  slug: string
  title: Localized
  excerpt: Localized
  body?: Localized
  image: string
  date: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  read: boolean
  createdAt: string
}

export interface DB {
  tours: Tour[]
  categories: Category[]
  destinations: Destination[]
  gallery: GalleryItem[]
  news: NewsItem[]
  reviews: Review[]
  bookings: Booking[]
  favorites: Record<string, string[]>
  users: User[]
  notifications: Notification[]
}

export interface BookingDraft {
  tourId: string
  userId?: string
  date: string
  travelers: number
  extras: { id: string; qty: number }[]
  name: string
  phone: string
  email: string
  comment?: string
}