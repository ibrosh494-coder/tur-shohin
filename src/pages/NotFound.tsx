import { Link } from 'react-router-dom'
import { Compass, Home } from 'lucide-react'
import { Seo } from '../lib/seo'
import { useApp } from '../lib/AppContext'

export default function NotFound() {
  const { t } = useApp()
  return (
    <>
      <Seo title="Страница не найдена — Тур Шохин" />
      <section className="grid min-h-[100svh] place-items-center bg-graphite-50/60 px-4">
        <div className="text-center">
          <Compass className="mx-auto h-20 w-20 rotate-45 text-sand-400" />
          <p className="mt-6 font-display text-8xl font-bold text-graphite-900">404</p>
          <p className="mt-2 font-display text-2xl text-graphite-600">{t('nf.title')}</p>
          <p className="mx-auto mt-3 max-w-sm text-graphite-500">{t('nf.subtitle')}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/" className="btn-primary h-12 px-8">
              <Home className="h-4 w-4" /> {t('nf.home')}
            </Link>
            <Link to="/tours" className="btn-outline h-12 px-8">
              <Compass className="h-4 w-4" /> {t('tours.all')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}