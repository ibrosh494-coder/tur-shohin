import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { ScrollToTop } from './lib/seo'
import { useAuth, canAccess } from './lib/auth'
import { useDB } from './lib/hooks'
import { useToast } from './lib/toast'
import { isUserBlocked } from './lib/store'
import { useEffect, useRef, type ReactNode } from 'react'

// Pages
import Home from './pages/Home'
import Tours from './pages/Tours'
import TourDetail from './pages/TourDetail'
import Booking from './pages/Booking'
import Account from './pages/Account'
import Favorites from './pages/Favorites'
import Gallery from './pages/Gallery'
import Contact from './pages/Contact'
import NewsList from './pages/NewsList'
import NewsDetail from './pages/NewsDetail'
import Auth from './pages/Auth'
import About from './pages/About'
import NotFound from './pages/NotFound'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import ManageTours from './pages/admin/ManageTours'
import ManageBookings from './pages/admin/ManageBookings'
import ManageReviews from './pages/admin/ManageReviews'
import ManageNews from './pages/admin/ManageNews'
import ManageUsers from './pages/admin/ManageUsers'

function SessionGuard({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const db = useDB()
  const toast = useToast()
  const notified = useRef<string | null>(null)

  const dbUser = user ? db.users.find((u) => u.id === user.id) : undefined
  const deleted = !!user && !dbUser
  const blocked = !!user && !!dbUser && isUserBlocked(dbUser)

  useEffect(() => {
    if (blocked && notified.current !== 'blocked') {
      notified.current = 'blocked'
      toast.toast('Ваш аккаунт заблокирован администратором', 'error')
      logout()
    } else if (deleted && notified.current !== 'deleted') {
      notified.current = 'deleted'
      toast.toast('Аккаунт удалён администратором', 'error')
      logout()
    }
  }, [blocked, deleted, logout, toast])

  if (deleted || blocked) return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  return <>{children}</>
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth" replace state={{ from: location.pathname }} />
  return (
    <SessionGuard>
      <>{children}</>
    </SessionGuard>
  )
}

function RequireRole({ min, children }: { min: number; children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/auth" replace state={{ from: '/admin' }} />
  if (!canAccess(user.role, min)) return <Navigate to="/admin" replace />
  return (
    <SessionGuard>
      <>{children}</>
    </SessionGuard>
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tour/:slug" element={<TourDetail />} />
          <Route
            path="/booking"
            element={
              <SessionGuard>
                <Booking />
              </SessionGuard>
            }
          />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/account"
            element={
              <RequireAuth>
                <Account />
              </RequireAuth>
            }
          />
          <Route
            path="/favorites"
            element={
              <RequireAuth>
                <Favorites />
              </RequireAuth>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole min={1}>
                <AdminLayout />
              </RequireRole>
            }
          >
            <Route index element={<Dashboard />} />
            <Route
              path="tours"
              element={
                <RequireRole min={1}>
                  <ManageTours />
                </RequireRole>
              }
            />
            <Route
              path="bookings"
              element={
                <RequireRole min={1}>
                  <ManageBookings />
                </RequireRole>
              }
            />
            <Route
              path="reviews"
              element={
                <RequireRole min={1}>
                  <ManageReviews />
                </RequireRole>
              }
            />
            <Route
              path="news"
              element={
                <RequireRole min={1}>
                  <ManageNews />
                </RequireRole>
              }
            />
            <Route
              path="users"
              element={
                <RequireRole min={2}>
                  <ManageUsers />
                </RequireRole>
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}