import { useState } from 'react'
import { MapPin, Phone, Mail, Send, MessageCircle } from 'lucide-react'
import { Seo } from '../lib/seo'
import { useApp } from '../lib/AppContext'
import { useToast } from '../lib/toast'
import { Button, SectionHeader, Reveal } from '../components/ui'
import { SITE } from '../config/site'

export default function Contact() {
  const { t } = useApp()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.message.trim()) {
      toast.toast('Заполните имя и сообщение', 'error')
      return
    }
    const messages: { name: string; email: string; phone: string; message: string; date: string }[] = JSON.parse(localStorage.getItem('ts_messages') || '[]')
    localStorage.setItem('ts_messages', JSON.stringify([...messages, { ...form, date: new Date().toISOString() }]))
    setSent(true)
    setForm({ name: '', email: '', phone: '', message: '' })
    toast.toast(t('contact.sent'))
  }

  return (
    <>
      <Seo title="Контакты — Тур Шохин" description="Свяжитесь с нами: телефон, email, WhatsApp и Telegram. Душанбе, ул. Рудаки 14." />
      <section className="bg-graphite-50/60 pb-16 pt-28 md:pt-32">
        <div className="container-x">
          <SectionHeader title={t('contact.title')} subtitle={t('contact.subtitle')} />

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <Reveal>
              <form onSubmit={submit} className="card space-y-5 p-6 md:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label">{t('contact.name')} *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-base" />
                  </div>
                  <div>
                    <label className="label">{t('auth.email')}</label>
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="input-base" />
                  </div>
                </div>
                <div>
                  <label className="label">{t('bk.phone')}</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-base" placeholder="+992 …" />
                </div>
                <div>
                  <label className="label">{t('contact.message')} *</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="input-base resize-none" />
                </div>
                <Button type="submit" className="h-12 px-10">
                  <Send className="h-4 w-4" /> {t('contact.send')}
                </Button>
                {sent && <p className="text-sm font-semibold text-pine-700">{t('contact.sent')}</p>}
              </form>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-4">
                <div className="card p-6">
                  <h3 className="mb-5 font-display text-xl font-semibold">{t('ft.contacts')}</h3>
                  <ul className="space-y-5">
                    <li className="flex items-center gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pine-50 text-pine-700"><Phone className="h-5 w-5" /></span>
                      <div>
                        <p className="text-xs text-graphite-400">{t('contact.phone')}</p>
                        <a href={`tel:${SITE.phone}`} className="font-bold text-graphite-900">{SITE.phone}</a>
                      </div>
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pine-50 text-pine-700"><Mail className="h-5 w-5" /></span>
                      <div>
                        <p className="text-xs text-graphite-400">Email</p>
                        <a href={`mailto:${SITE.email}`} className="font-bold text-graphite-900">{SITE.email}</a>
                      </div>
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sand-50 text-sand-600"><Send className="h-5 w-5" /></span>
                      <div>
                        <p className="text-xs text-graphite-400">Telegram</p>
                        <a href={`https://t.me/${SITE.telegram.slice(1)}`} className="font-bold text-graphite-900">{SITE.telegram}</a>
                      </div>
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sand-50 text-sand-600"><MessageCircle className="h-5 w-5" /></span>
                      <div>
                        <p className="text-xs text-graphite-400">WhatsApp</p>
                        <a href={`https://wa.me/${SITE.whatsapp.replace(/[^0-9]/g, '')}`} className="font-bold text-graphite-900">{SITE.whatsapp}</a>
                      </div>
                    </li>
                    <li className="flex items-center gap-4">
                      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-graphite-100 text-graphite-700"><MapPin className="h-5 w-5" /></span>
                      <div>
                        <p className="text-xs text-graphite-400">{t('contact.address')}</p>
                        <p className="font-bold text-graphite-900">{SITE.address}</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="card overflow-hidden p-0">
                  <iframe
                    title="Карта"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=68.70%2C38.54%2C68.83%2C38.59&layer=mapnik&marker=38.5598%2C68.787"
                    className="h-52 w-full border-0"
                    loading="lazy"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}