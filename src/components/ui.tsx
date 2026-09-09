import { useState, type ButtonHTMLAttributes, type ImgHTMLAttributes, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import clsx from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { BookingStatus, Difficulty } from '../types'
import { useApp, formatPrice } from '../lib/AppContext'
import { useDB, loc } from '../lib/hooks'

export function cn(...inputs: (string | false | null | undefined)[]) {
  return twMerge(clsx(inputs))
}

export function Button({
  variant = 'primary',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'sand' | 'dark' | 'outline' | 'ghost' | 'white' | 'danger' }) {
  const variants: Record<string, string> = {
    primary: 'btn-primary',
    sand: 'btn-sand',
    dark: 'btn-dark',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    white: 'btn-white',
    danger: 'btn bg-red-600 text-white hover:bg-red-700 shadow-soft',
  }
  return (
    <button className={cn(variants[variant], className)} {...props}>
      {children}
    </button>
  )
}

const FALLBACK = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b'

export function SmartImage({ src, alt = '', className, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [current, setCurrent] = useState(src)
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={cn('relative overflow-hidden bg-graphite-100', className)}>
      {!loaded && <div className="absolute inset-0 animate-pulse bg-graphite-100" />}
      <img
        src={current}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (current !== FALLBACK) setCurrent(FALLBACK)
        }}
        className={cn('h-full w-full object-cover transition-all duration-500', loaded ? 'opacity-100' : 'opacity-0', props.onClick && 'cursor-pointer')}
        {...props}
      />
    </div>
  )
}

export function Rating({ value, count, size = 'md' }: { value: number; count?: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = value >= i + 1
          const half = value > i && value < i + 1
          return (
            <span key={i} className="relative">
              <Star className={cn(cls, 'text-graphite-200 fill-graphite-200')} />
              {(filled || half) && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: half ? '50%' : '100%' }}>
                  <Star className={cn(cls, 'text-sand-500 fill-sand-500')} />
                </span>
              )}
            </span>
          )
        })}
      </div>
      <span className={cn('font-bold text-graphite-900', size === 'lg' ? 'text-lg' : 'text-sm')}>{value.toFixed(1)}</span>
      {typeof count === 'number' && <span className="text-sm text-graphite-400">({count})</span>}
    </div>
  )
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function SectionHeader({ title, subtitle, action, className }: { title: string; subtitle?: string; action?: ReactNode; className?: string }) {
  return (
    <Reveal className={cn('mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div>
        <h2 className="font-display text-3xl font-semibold text-graphite-900 md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 text-graphite-500">{subtitle}</p>}
      </div>
      {action}
    </Reveal>
  )
}

export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('chip border border-graphite-200 bg-white text-graphite-600', className)}>{children}</span>
}

export function Price({ tjs, className, bold = true }: { tjs: number; className?: string; bold?: boolean }) {
  const { currency } = useApp()
  return <span className={cn(bold ? 'font-extrabold text-graphite-900' : 'font-semibold', className)}>{formatPrice(tjs, currency)}</span>
}

const DIFF_META: Record<Difficulty, [string, string]> = {
  easy: ['flt.easy', 'bg-pine-50 text-pine-700 border-pine-200'],
  moderate: ['flt.moderate', 'bg-sand-50 text-sand-700 border-sand-200'],
  hard: ['flt.hard', 'bg-orange-50 text-orange-700 border-orange-200'],
  extreme: ['flt.extreme', 'bg-red-50 text-red-700 border-red-200'],
}

export function DifficultyBadge({ d }: { d: Difficulty }) {
  const { t } = useApp()
  const [label, cls] = DIFF_META[d]
  return <span className={cn('chip border', cls)}>{t(label)}</span>
}

export function DifficultyLabel({ d }: { d: Difficulty }) {
  const { t } = useApp()
  const [label] = DIFF_META[d]
  return t(label)
}

const STATUS_META: Record<BookingStatus, string> = {
  pending: 'bg-sand-100 text-sand-800 border-sand-300',
  confirmed: 'bg-pine-100 text-pine-800 border-pine-300',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-graphite-100 text-graphite-700 border-graphite-300',
}

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useApp()
  const label = t(`status.${status}`)
  return <span className={cn('chip border', STATUS_META[status])}>{label}</span>
}

export function CategoryIcon({ icon }: { icon: string }) {
  const map: Record<string, string> = {
    Mountain: 'M9 3l6 6v8a2 2 0 01-2 2h-8a2 2 0 01-2-2V9l6-6z',
    Compass: 'M16 8l-3 5-5 3 3-5 5-3zM10 14l-8-4 20-8-8 20-4-8z',
    Landmark: 'M3 21h18M5 21V10m7 11V10m7 11V10M4 10h16M12 3L2 8h20l-10-5z',
    Route: 'M3 17a6 6 0 0112 0 6 6 0 0112 0M3 17a6 6 0 0112 0',
    Snowflake: 'M12 2v20M4.9 5l14.2 14M4.9 19L19.1 5M2 12h20M12 5l-3-3M12 5l3-3M12 19l-3 3M12 19l3 3',
    MountainSnow: 'M3 18l7-12 3 5 3-2 5 9H3zM3 21h18',
    Users: 'M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM20 21v-2a4 4 0 00-3-3.87M15 3.13A4 4 0 0115 11',
    Globe: 'M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.5 2.5 2.5 15 0 18-2.5-3-2.5-15.5 0-18z',
  }
  const d = map[icon] ?? map.Mountain
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-full w-full">
      <path d={d} />
    </svg>
  )
}

export function DestinationName({ id }: { id: string }) {
  const db = useDB()
  const { lang } = useApp()
  const dest = db.destinations.find((d) => d.id === id)
  if (!dest) return <span className="text-graphite-400">—</span>
  return <span>{loc(dest.name, lang)}</span>
}

export function TourInfoLine({ items }: { items: string[] }) {
  if (!items.length) return null
  return (
    <ul className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm text-graphite-600">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pine-50 text-[10px] font-bold text-pine-700">✓</span>
          {item}
        </li>
      ))}
    </ul>
  )
}