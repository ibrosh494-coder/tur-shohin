import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const url = env.match(/^VITE_SUPABASE_URL=(\S+)/m)?.[1]?.trim()
const anon = env.match(/^VITE_SUPABASE_ANON_KEY=(\S+)/m)?.[1]?.trim()

const sb = createClient(url ?? '', anon ?? '', { auth: { persistSession: false } })

const { data, error } = await sb.from('users').select('id,email,role').order('createdAt')
console.log(error ? 'ERR ' + error.message : JSON.stringify(data, null, 1))