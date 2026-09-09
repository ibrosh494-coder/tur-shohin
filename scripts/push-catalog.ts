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
    const { error } = await supabase.from(table).upsert(row)
    if (error) {
      fail++
      console.error(`  ${table} :: ${row.id} :: ${error.message}`)
    } else {
      ok++
    }
  }
  console.log(`${table}: ${rows.length} rows pushed`)
}
console.log(`Done. ok=${ok} fail=${fail}`)
process.exit(fail ? 1 : 0)