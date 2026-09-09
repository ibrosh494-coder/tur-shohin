import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { tours } from '../src/lib/seed/tours'
import { categories } from '../src/lib/seed/categories'
import { destinations } from '../src/lib/seed/destinations'
import { gallery, news } from '../src/lib/seed/galleryNews'
import { reviews as seedReviews } from '../src/lib/seed/reviews'

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const url = env.match(/^VITE_SUPABASE_URL=(\S+)/m)?.[1]?.trim()
const anon = env.match(/^VITE_SUPABASE_ANON_KEY=(\S+)/m)?.[1]?.trim()

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, anon, { auth: { persistSession: false } })

const catalog = [
  ['tours', tours],
  ['categories', categories],
  ['destinations', destinations],
  ['gallery', gallery],
  ['news', news],
  ['reviews', seedReviews],
] as const

let ok = 0
let fail = 0
for (const [table, rows] of catalog) {
  for (const row of rows) {
    const rec = { ...(row as Record<string, unknown>) }
    if (table === 'tours') {
      // Поля-происхождения не имеют колонок в tours — убираем из тела вставки.
      delete rec.sourceUrl
      delete rec.priceNote
    }
    const { error } = await supabase.from(table).upsert(rec)
    if (error) {
      fail++
      console.error(`  ${table} :: ${row.id} :: ${error.message}`)
    } else {
      ok++
    }
  }
  console.log(`${table}: ${rows.length} rows pushed`)
}

// Каталог туров в облаке должен строго соответствовать сиду:
// удаляем старые строки, которых больше нет в tours.ts (иначе останутся выдуманные демо-туры).
// Если на тур ссылаются внешние ключи (bookings/favorites) — каскадно снимаем их и удаляем.
const tourIds = new Set(tours.map((t) => t.id))
const { data: existingTours, error: existingErr } = await supabase.from('tours').select('id')
if (existingErr) console.error(`tours: select existing failed :: ${existingErr.message}`)
let removed = 0
for (const r of existingTours ?? []) {
  if (tourIds.has(r.id)) continue
  const { error } = await supabase.from('tours').delete().eq('id', r.id)
  if (!error) {
    removed++
    continue
  }
  await supabase.from('bookings').delete().eq('tourId', r.id)
  await supabase.from('favorites').delete().eq('tourId', r.id)
  await supabase.from('reviews').delete().eq('tourId', r.id)
  const retry = await supabase.from('tours').delete().eq('id', r.id)
  if (!retry.error) {
    removed++
    console.log(`  tours :: stale ${r.id} removed (cascaded deps)`)
  } else {
    fail++
    console.error(`  tours :: stale ${r.id} :: ${retry.error.message}`)
  }
}
console.log(`tours: ${removed} stale rows removed`)
console.log(`Done. ok=${ok} fail=${fail}`)
process.exit(fail ? 1 : 0)