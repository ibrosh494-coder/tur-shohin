import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const url = env.match(/^VITE_SUPABASE_URL=(\S+)/m)?.[1]?.trim()
const anon = env.match(/^VITE_SUPABASE_ANON_KEY=(\S+)/m)?.[1]?.trim()

if (!url || !anon) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, anon, { auth: { persistSession: false } })

const roles: Record<string, string> = {
  'admin-demo': 'superadmin',
  'user-demo': 'user',
}

for (const [id, role] of Object.entries(roles)) {
  const { error } = await supabase.from('users').update({ role }).eq('id', id)
  if (error) {
    console.error(`  ${id}: ${error.message}`)
  } else {
    console.log(`  ${id} -> ${role}`)
  }
}