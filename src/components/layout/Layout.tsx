import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { BottomNav } from './BottomNav'
import { MobileMenu } from './MobileMenu'

export function Layout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const isAuth = location.pathname.startsWith('/auth')

  return (
    <div className="min-h-screen">
      <Header menuOpen={menuOpen} onMenuToggle={() => setMenuOpen((v) => !v)} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
      {!isAuth && <Footer />}
      {!isAuth && <BottomNav />}
    </div>
  )
}