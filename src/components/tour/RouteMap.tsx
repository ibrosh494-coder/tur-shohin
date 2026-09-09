import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import type { TourLocation } from '../../types'
import { useApp } from '../../lib/AppContext'
import { loc } from '../../lib/hooks'

const W = 780
const H = 460
const PAD = 64

export function RouteMap({ locations }: { locations: TourLocation[] }) {
  const { lang } = useApp()

  const geo = useMemo(() => {
    if (!locations.length) return null
    const lats = locations.map((l) => l.lat)
    const lngs = locations.map((l) => l.lng)
    let minLat = Math.min(...lats)
    let maxLat = Math.max(...lats)
    let minLng = Math.min(...lngs)
    let maxLng = Math.max(...lngs)
    if (maxLat - minLat < 0.08) {
      minLat -= 0.05
      maxLat += 0.05
    }
    if (maxLng - minLng < 0.08) {
      minLng -= 0.05
      maxLng += 0.05
    }
    const toX = (lng: number) => PAD + ((lng - minLng) / (maxLng - minLng)) * (W - PAD * 2)
    const toY = (lat: number) => H - PAD - ((lat - minLat) / (maxLat - minLat)) * (H - PAD * 2)
    const pts = locations
      .slice()
      .sort((a, b) => a.stop - b.stop)
      .map((l) => ({ l, x: toX(l.lng), y: toY(l.lat) }))
    const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
    return { pts, d }
  }, [locations])

  if (!geo) return null
  const first = geo.pts[0]
  const last = geo.pts[geo.pts.length - 1]

  return (
    <div className="relative overflow-hidden rounded-3xl border border-graphite-100 bg-[#f4f7f5]">
      <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: 'radial-gradient(circle, #cfe3d6 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
      <svg viewBox={`0 0 ${W} ${H}`} className="relative block h-auto w-full" role="img" aria-label="Карта маршрута">
        <motion.path
          d={geo.d}
          fill="none"
          stroke="#2f6f4d"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray="6 10"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
        />
        {geo.pts.map((p, i) => (
          <motion.g
            key={p.l.id}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.18, type: 'spring', stiffness: 260, damping: 16 }}
          >
            <circle cx={p.x} cy={p.y} r={16} fill="white" stroke="#2f6f4d" strokeWidth={3} />
            <text x={p.x} y={p.y + 1} textAnchor="middle" fontSize={12} fontWeight={700} fill="#143a2a">
              {i + 1}
            </text>
            <text x={p.x} y={p.y + 30} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="#34343c">
              {loc(p.l.name, lang)}
            </text>
          </motion.g>
        ))}
        {/* конфетти-точки фона */}
        <g opacity={0.7}>
          <circle cx={130} cy={120} r={3} fill="#c99745" />
          <circle cx={W - 140} cy={110} r={2.5} fill="#90c6a7" />
          <circle cx={240} cy={H - 130} r={3.5} fill="#e1c58d" />
          <circle cx={W - 180} cy={H - 100} r={3} fill="#61a87f" />
        </g>
      </svg>
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-2">
        <span className="chip bg-white/90 text-graphite-700 shadow-soft">
          <MapPin className="h-3.5 w-3.5 text-pine-600" /> {first ? loc(first.l.name, lang) : ''} → {last ? loc(last.l.name, lang) : ''}
        </span>
      </div>
    </div>
  )
}