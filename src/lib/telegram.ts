import type { Booking, Tour } from '../types'
import { SITE } from '../config/site'

/**
 * Отправка уведомления менеджеру в Telegram.
 * Все запросы идут через серверный прокси (Vercel /api/telegram),
 * чтобы токен бота никогда не попадал в клиентский бандл.
 * Если переменные не заданы — безопасно пропускает (демо-режим).
 */

interface TelegramPayload {
  text: string
  buttons?: { text: string; url: string }[]
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildMessage(booking: Booking, tour: Tour): TelegramPayload {
  const text = [
    '🆕 НОВАЯ ЗАЯВКА',
    '',
    `🏕 Тур: <b>${escapeHtml(tour.title.ru)}</b>`,
    `📅 Дата: ${escapeHtml(booking.date)}`,
    `👥 Людей: ${booking.travelers}`,
    `👤 Имя: ${escapeHtml(booking.name)}`,
    `📞 Телефон: ${escapeHtml(booking.phone)}`,
    `📧 Email: ${escapeHtml(booking.email)}`,
    booking.comment ? `💬 Комментарий: ${escapeHtml(booking.comment)}` : '',
    booking.extras.length
      ? `➕ Доп. услуги: ${booking.extras.map((e) => `${escapeHtml(e.name)} ×${e.qty}`).join(', ')}`
      : '',
    '',
    `💰 Итоговая стоимость: ${booking.totalPrice.toLocaleString('ru-RU')} сомони`,
    `🆔 № ${escapeHtml(booking.bookingNumber)}`,
  ]
    .filter(Boolean)
    .join('\n')

  return {
    text,
    buttons: [{ text: '🗂 Открыть заявку', url: `${SITE.url}/admin/bookings` }],
  }
}

export async function sendTelegramNotification(booking: Booking, tour: Tour): Promise<boolean> {
  const payload = buildMessage(booking, tour)
  const webhook = import.meta.env.VITE_TELEGRAM_WEBHOOK as string | undefined

  if (!webhook) return false

  try {
    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return res.ok
  } catch {
    /* не блокируем бронирование при сбое уведомления */
  }
  return false
}
