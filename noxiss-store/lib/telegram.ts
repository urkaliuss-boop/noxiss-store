import crypto from 'node:crypto'

export type TelegramUser = { id:number; first_name:string; last_name?:string; username?:string; photo_url?:string }

export function verifyTelegramInitData(initData:string): TelegramUser {
  if (!initData) throw new Error('Telegram authorization required')
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  const authDate = Number(params.get('auth_date'))
  if (!hash || !authDate) throw new Error('Invalid Telegram data')
  if (Date.now()/1000 - authDate > 86400) throw new Error('Telegram session expired')
  params.delete('hash')
  const dataCheckString = [...params.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>`${k}=${v}`).join('\n')
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) throw new Error('Bot token is not configured')
  const secret = crypto.createHmac('sha256','WebAppData').update(token).digest()
  const calculated = crypto.createHmac('sha256',secret).update(dataCheckString).digest('hex')
  if (hash.length !== calculated.length || !crypto.timingSafeEqual(Buffer.from(hash),Buffer.from(calculated))) throw new Error('Invalid Telegram signature')
  const raw = params.get('user')
  if (!raw) throw new Error('Telegram user missing')
  return JSON.parse(raw)
}

export function getAuth(request:Request) {
  const user = verifyTelegramInitData(request.headers.get('x-telegram-init-data') || '')
  const admins = (process.env.ADMIN_TELEGRAM_IDS || '').split(',').map(x=>x.trim()).filter(Boolean)
  return { user, isAdmin: admins.includes(String(user.id)) }
}
