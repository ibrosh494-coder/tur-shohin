import type { Booking, Tour } from '../types'
import { SITE } from '../config/site'

/**
 * Отправка уведомления менеджеру в Telegram.
 * Приоритет: VITE_TELEGRAM_WEBHOOK (рекомендуется — через Supabase Edge Function),
 * затем прямой вызов bot API (VITE_TELEGRAM_BOT_TOKEN + VITE_TELEGRAM_CHAT_ID).
 * Если переменные не заданы — безопасно пропускает (демо-режим).
 */

interface TelegramPayload {
  text: string
  buttons?: { text: string; url: string }[]
}

function buildMessage(booking: Booking, tour: Tour): TelegramPayload {
  const text = [
    '🆕 НОВАЯ ЗАЯВКА',
    '',
    `🏕 Тур: <b>${tour.title.ru}</b>`,
    `📅 Дата: ${booking.date}`,
    `👥 Людей: ${booking.travelers}`,
    `👤 Имя: ${booking.name}`,
    `📞 Телефон: ${booking.phone}`,
    `📧 Email: ${booking.email}`,
    booking.comment ? `💬 Комментарий: ${booking.comment}` : '',
    booking.extras.length
      ? `➕ Доп. услуги: ${booking.extras.map((e) => `${e.name} ×${e.qty}`).join(', ')}`
      : '',
    '',
    `💰 Итоговая стоимость: ${booking.totalPrice.toLocaleString('ru-RU')} сомони`,
    `🆔 № ${booking.bookingNumber}`,
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
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN as string | undefined
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID as string | undefined

  try {
    if (webhook) {
      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      return res.ok
    }
    if (token && chatId) {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: payload.text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: payload.buttons?.map((b) => [{ text: b.text, url: b.url }]),
          },
        }),
      })
      return res.ok
    }
  } catch {
    /* не блокируем бронирование при сбое уведомления */
  }
  return false
}