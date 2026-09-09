import { NavLink, Outlet, Link } from 'react-router-dom'
import { LayoutDashboard, Route, ClipboardList, Star, Newspaper, ArrowLeft, Users } from 'lucide-react'
import { useApp } from '../../lib/AppContext'
import { cn } from '../../components/ui'

const NAV = [
  { to: '/admin', label: 'Дашборд', icon: LayoutDashboard, end: true },
  { to: '/admin/tours', label: 'Туры', icon: Route },
  { to: '/admin/bookings', label: 'Бронирования', icon: ClipboardList },
  { to: '/admin/reviews', label: 'Отзывы', icon: Star },
  { to: '/admin/news', label: 'Новости', icon: Newspaper },
  { to: '/admin/users', label: 'Пользователи', icon: Users },
]

export default function AdminLayout() {
  const { t } = useApp()

  return (
    <div className="grid min-h-[100svh] bg-graphite-50/70 pt-20 lg:grid-cols-[240px_1fr]">
      <aside className="sticky top-20 hidden h-[calc(100svh-80px)] flex-col border-r border-graphite-200/70 bg-white p-4 lg:flex">
        <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-graphite-400">Админ-панель</p>
        <nav className="mt-2 flex flex-1 flex-col gap-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors',
                  isActive ? 'bg-pine-600 text-white shadow-soft' : 'text-graphite-600 hover:bg-graphite-100',
                )
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2">
          <Link to="/" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold text-graphite-500 hover:bg-graphite-100">
            <ArrowLeft className="h-4 w-4" /> {t('bk.back')} на сайт
          </Link>
        </div>
      </aside>

      <div className="pb-16">
        <div className="border-b border-graphite-200/70 bg-white/80 px-4 py-2 backdrop-blur lg:hidden">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold',
                    isActive ? 'bg-pine-600 text-white' : 'bg-graphite-100 text-graphite-600',
                  )
                }
              >
                <n.icon className="h-3.5 w-3.5" />
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}