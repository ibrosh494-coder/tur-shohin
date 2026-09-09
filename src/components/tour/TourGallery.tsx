import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react'
import { cn } from '../ui'

export function TourGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  const rest = images.map((src, idx) => ({ src, idx })).filter((x) => x.idx !== active)
  const shown = [{ src: images[active], idx: active }, ...rest].slice(0, 4)

  const move = (dir: number) => {
    setLightbox((cur) => (cur === null ? cur : (cur + dir + images.length) % images.length))
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <button onClick={() => setLightbox(active)} className={cn('group relative col-span-1 overflow-hidden rounded-3xl md:col-span-2 md:row-span-2')}>
          <img
            src={shown[0].src}
            alt={title}
            loading="eager"
            className="aspect-[4/3] h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 md:aspect-auto"
          />
          <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/85 text-graphite-700 backdrop-blur-md transition-colors group-hover:bg-white">
            <ZoomIn className="h-4 w-4" />
          </span>
        </button>
        {shown.slice(1).map((img) => (
          <button
            key={img.src + img.idx}
            onClick={() => setLightbox(img.idx)}
            className="group relative hidden overflow-hidden rounded-2xl md:block"
          >
            <img src={img.src} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </button>
        ))}
      </div>
      {/* навигация по превью на мобильном */}
      <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar md:hidden">
        {images.map((img, i) => (
          <button
            key={img + i}
            onClick={() => setActive(i)}
            className={cn('h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors', i === active ? 'border-pine-600' : 'border-transparent')}
          >
            <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-center justify-center bg-graphite-950/95 p-4">
            <button onClick={() => setLightbox(null)} className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X className="h-6 w-6" />
            </button>
            <button onClick={() => move(-1)} className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button onClick={() => move(1)} className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <ChevronRight className="h-6 w-6" />
            </button>
            <motion.img
              key={lightbox}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              src={images[lightbox]}
              alt=""
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            />
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-semibold text-white/70">
              {lightbox + 1} / {images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}