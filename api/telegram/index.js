/**
 * Vercel Serverless Function — Telegram proxy.
 *
 * Environment variables (set in Vercel dashboard):
 *   TELEGRAM_BOT_TOKEN  — secret bot token (NEVER exposed to client)
 *   TELEGRAM_CHAT_ID    — target chat/group ID
 *
 * Accepts POST with JSON body { text, buttons? } and forwards to Telegram Bot API.
 * Returns { ok: boolean }.
 */

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set')
    return res.status(500).json({ ok: false, error: 'Telegram not configured' })
  }

  const { text, buttons } = req.body || {}
  if (!text) {
    return res.status(400).json({ ok: false, error: 'Missing text' })
  }

  try {
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }

    if (buttons && Array.isArray(buttons) && buttons.length > 0) {
      payload.reply_markup = {
        inline_keyboard: buttons.map((b) => [{ text: b.text, url: b.url }]),
      }
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await tgRes.json()
    return res.status(tgRes.ok ? 200 : 502).json({ ok: tgRes.ok, detail: data })
  } catch (err) {
    console.error('Telegram send failed:', err)
    return res.status(500).json({ ok: false, error: 'Send failed' })
  }
}
