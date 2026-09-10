import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User as UserIcon, Phone, KeyRound } from 'lucide-react'
import { Seo } from '../lib/seo'
import { useApp } from '../lib/AppContext'
import { useAuth } from '../lib/auth'
import { useToast } from '../lib/toast'
import { cn, Button } from '../components/ui'

export default function Auth() {
  const { t } = useApp()
  const { login, register, resetPassword, confirmResetPassword } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from || '/'

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', code: '' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      toast.toast(t('bk.emailReq'), 'error')
      setLoading(false)
      return
    }
    if (mode !== 'forgot' && form.password.length < 6) {
      toast.toast('Пароль минимум 6 символов', 'error')
      setLoading(false)
      return
    }
    if (mode === 'login') {
      const res = await login(form.email, form.password)
      if (res.ok) {
        toast.toast(t('auth.welcome'))
        navigate(from, { replace: true })
      } else {
        toast.toast(res.error ?? 'Ошибка', 'error')
      }
    } else if (mode === 'register') {
      if (!form.name.trim()) {
        toast.toast(t('bk.nameReq'), 'error')
        setLoading(false)
        return
      }
      const res = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password })
      if (res.ok) {
        toast.toast('Аккаунт создан!')
        navigate(from, { replace: true })
      } else {
        toast.toast(res.error ?? 'Ошибка', 'error')
      }
    } else if (!sent) {
      const res = await resetPassword(form.email)
      if (res.ok && res.token) {
        setSent(true)
        toast.toast(`Код сброса: ${res.token} — введите его ниже вместе с новым паролем`, 'info')
      } else {
        toast.toast(res.error ?? 'Ошибка', 'error')
      }
    } else {
      const res = await confirmResetPassword(form.email, form.code, form.password)
      if (res.ok) {
        toast.toast('Пароль обновлён — войдите с новым паролем')
        setSent(false)
        setMode('login')
        setForm((f) => ({ ...f, code: '', password: '' }))
      } else {
        toast.toast(res.error ?? 'Ошибка', 'error')
      }
    }
    setLoading(false)
  }

  return (
    <>
      <Seo title="Вход и регистрация — Тур Шохин" />
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-graphite-950 py-24">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-graphite-950/80 to-graphite-950" />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md px-4">
          <div className="rounded-[2rem] border border-white/10 bg-white/95 p-8 shadow-lift backdrop-blur-xl md:p-10">
            <div className="mb-8 text-center">
              <h1 className="font-display text-3xl font-semibold text-graphite-900">
                {mode === 'login' ? t('auth.welcome') : mode === 'register' ? t('auth.greeting') : t('auth.forgot')}
              </h1>
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-full bg-graphite-100 p-1">
              <button
                onClick={() => { setMode('login'); setSent(false) }}
                className={cn('rounded-full py-2 text-sm font-bold transition-colors', mode === 'login' ? 'bg-white text-graphite-900 shadow-soft' : 'text-graphite-500')}
              >
                {t('auth.login')}
              </button>
              <button
                onClick={() => { setMode('register'); setSent(false) }}
                className={cn('rounded-full py-2 text-sm font-bold transition-colors', mode === 'register' ? 'bg-white text-graphite-900 shadow-soft' : 'text-graphite-500')}
              >
                {t('auth.register')}
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="label text-graphite-500">{t('auth.name')}</label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" />
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base pl-11" placeholder="Иван Петров" />
                  </div>
                </div>
              )}

              <div>
                <label className="label text-graphite-500">{t('auth.email')}</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" />
                  <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-base pl-11" placeholder="you@mail.com" type="email" />
                </div>
              </div>

              {mode === 'register' && (
                <div>
                  <label className="label text-graphite-500">{t('auth.phone')}</label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" />
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-base pl-11" placeholder="+992 90 000 00 00" />
                  </div>
                </div>
              )}

              {mode === 'forgot' && sent && (
                <>
                  <div>
                    <label className="label text-graphite-500">Код из уведомления</label>
                    <div className="relative">
                      <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" />
                      <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-base pl-11" placeholder="AB12CD" />
                    </div>
                  </div>
                  <div>
                    <label className="label text-graphite-500">Новый пароль</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" />
                      <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-base pl-11" type="password" placeholder="минимум 6 символов" />
                    </div>
                  </div>
                </>
              )}

              {mode !== 'forgot' && (
                <div>
                  <label className="label text-graphite-500">{t('auth.password')}</label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite-400" />
                    <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-base pl-11" type="password" placeholder="••••••••" />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <button type="button" onClick={() => setMode('forgot')} className="text-xs font-bold text-pine-600 hover:text-pine-700">
                  {t('auth.forgot')}
                </button>
              )}

              <Button type="submit" className="h-12 w-full" disabled={loading}>
                {loading ? t('auth.sending') : mode === 'forgot' ? t('auth.sending') : mode === 'login' ? t('auth.signIn') : t('auth.signUp')}
              </Button>
            </form>
          </div>
        </motion.div>
      </section>
    </>
  )
}