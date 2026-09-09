import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CalendarDays, ArrowLeft } from 'lucide-react'
import { Seo } from '../lib/seo'
import { useApp } from '../lib/AppContext'
import { useDB, formatDate } from '../lib/hooks'
import { SmartImage } from '../components/ui'

export default function NewsDetail() {
  const { id } = useParams()
  const { t, lang } = useApp()
  const db = useDB()
  const item = [...db.news].sort((a, b) => b.date.localeCompare(a.date)).find((n) => n.slug === id || n.id === id)

  if (!item) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="text-center">
          <p className="font-display text-2xl">Запись не найдена</p>
          <Link to="/news" className="btn-primary mt-6">К новостям</Link>
        </div>
      </div>
    )
  }

  const paragraphs = (item.body?.[lang] ?? item.body?.ru ?? item.excerpt.ru).split(/\n{2,}/)

  return (
    <>
      <Seo title={`${item.title.ru} — Тур Шохин`} description={item.excerpt.ru} />
      <article className="section pt-28 md:pt-36">
        <div className="container-x max-w-3xl">
          <Link to="/news" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-pine-600 hover:text-pine-700">
            <ArrowLeft className="h-4 w-4" /> {t('news.title')}
          </Link>
          <p className="flex items-center gap-1.5 text-sm font-bold text-pine-600">
            <CalendarDays className="h-4 w-4" /> {formatDate(item.date, lang)}
          </p>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-3 font-display text-3xl font-semibold leading-tight text-graphite-900 md:text-5xl">
            {item.title[lang] || item.title.ru}
          </motion.h1>
        </div>
        <div className="container-x mt-10 max-w-4xl">
          <SmartImage src={item.image} alt="" className="aspect-[16/9] w-full rounded-[2rem] shadow-lift" />
          <div className="prose-ts mt-10 max-w-3xl space-y-6">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-lg leading-relaxed text-graphite-700">
                {p}
              </p>
            ))}
          </div>
        </div>
      </article>
    </>
  )
}