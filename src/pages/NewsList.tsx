import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarDays } from 'lucide-react'
import { Seo } from '../lib/seo'
import { useApp } from '../lib/AppContext'
import { useDB } from '../lib/hooks'
import { SectionHeader, SmartImage } from '../components/ui'
import { formatDate } from '../lib/hooks'

export default function NewsList() {
  const { t, lang } = useApp()
  const db = useDB()
  const items = [...db.news].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <>
      <Seo title="Новости и блог — Тур Шохин" />
      <section className="bg-graphite-50/60 pb-16 pt-28 md:pt-32">
        <div className="container-x max-w-5xl">
          <SectionHeader title={t('news.title')} subtitle={t('news.subtitle')} />
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to={`/news/${n.slug}`} className="group card block overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lift">
                  <SmartImage src={n.image} alt="" className="aspect-[16/9] w-full transition-transform duration-700 group-hover:scale-105" />
                  <div className="p-6">
                    <p className="flex items-center gap-1.5 text-xs font-bold text-pine-600">
                      <CalendarDays className="h-3.5 w-3.5" /> {formatDate(n.date, lang)}
                    </p>
                    <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-graphite-900">{n.title[lang] || n.title.ru}</h2>
                    <p className="mt-2 line-clamp-3 text-sm text-graphite-500">{n.excerpt[lang] || n.excerpt.ru}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-pine-600">
                      {t('stories.read')} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}