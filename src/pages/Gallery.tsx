import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft } from 'lucide-react'
import { Seo } from '../lib/seo'
import { useApp } from '../lib/AppContext'
import { useDB } from '../lib/hooks'
import { cn, SectionHeader } from '../components/ui'

export default function Gallery() {
  const { t } = useApp()
  const db = useDB()
  const [lightbox, setLightbox] = useState<number | null>(null)

  const items = db.gallery

  return (
    <>
      <Seo title="Галерея — Тур Шохин" description="Фотогалерея путешествий: Памир, Фанские горы, Душанбе, культура и люди." />
      <section className="bg-graphite-50/60 pb-8 pt-28 md:pt-32">
        <div className="container-x">
          <SectionHeader title={t('gal.title')} subtitle={t('gal.subtitle')} />
        </div>
      </section>

      <section className="section pt-8 cv-auto">
        <div className="container-x">
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
            {items.map((g, i) => (
              <motion.button
                key={g.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 8) * 0.05 }}
                onClick={() => setLightbox(i)}
                className="group relative block w-full overflow-hidden rounded-3xl"
              >
                <img
                  src={g.image}
                  alt=""
                  loading="lazy"
                  className={cn('w-full object-cover transition-transform duration-700 group-hover:scale-105', i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/5]')}
                />
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {lightbox !== null && items[lightbox] && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center bg-graphite-950/95 p-4">
            <button onClick={() => setLightbox(null)} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={() => setLightbox((lightbox - 1 + items.length) % items.length)}
              className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => setLightbox((lightbox + 1) % items.length)}
              className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6 rotate-180" />
            </button>
            <motion.img
              key={items[lightbox].id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={items[lightbox].image}
              alt=""
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            />
            <div className="absolute inset-x-0 bottom-6 flex justify-center gap-4 text-sm font-semibold text-white/80">
              <span className="text-white/50">{lightbox + 1} / {items.length}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}