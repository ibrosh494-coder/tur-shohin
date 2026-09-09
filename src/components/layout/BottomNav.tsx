import { Link, useLocation } from 'react-router-dom'
import { Home, Heart, User, Compass } from 'lucide-react'
import { cn } from '../ui'

const ITEMS = [
  { to: '/', icon: Home, label: 'Главная' },
  { to: '/tours', icon: Compass, label: 'Туры' },
  { to: '/favorites', icon: Heart, label: 'Избранное' },
  { to: '/account', icon: User, label: 'Кабинет' },
]

export function BottomNav() {
  const { pathname } = useLocation()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-graphite-100 bg-white/95 pb-safe backdrop-blur-lg md:hidden">
      <div className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const active = pathname === item.to || (item.to === '/tours' && pathname.startsWith('/tour'))
          return (
            <Link key={item.to} to={item.to} className="flex flex-col items-center gap-1 py-2.5">
              <span
                className={cn(
                  'grid h-8 w-14 place-items-center rounded-full transition-colors',
                  active ? 'bg-pine-50 text-pine-700' : 'text-graphite-400',
                )}
              >
                <item.icon className={cn('h-5 w-5', active && 'fill-pine-100')} />
              </span>
              <span className={cn('text-[10px] font-bold', active ? 'text-pine-700' : 'text-graphite-400')}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}