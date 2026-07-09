import crypto from 'node:crypto'

const API='https://pay.crypt.bot/api'
export async function createInvoice(amount:number, payload:string) {
  const token=process.env.CRYPTOPAY_TOKEN
  if(!token) throw new Error('Crypto Pay is not configured')
  const r=await fetch(`${API}/createInvoice`,{method:'POST',headers:{'Content-Type':'application/json','Crypto-Pay-API-Token':token},body:JSON.stringify({asset:'USDT',amount:amount.toFixed(2),payload,description:'Пополнение Noxiss Store',expires_in:3600})})
  const data=await r.json()
  if(!data.ok) throw new Error(data.error?.name || 'Crypto Pay error')
  return data.result as {invoice_id:number;bot_invoice_url:string;status:string}
}
export function verifyCryptoWebhook(body:string, signature:string|null){
  const token=process.env.CRYPTOPAY_TOKEN || ''
  const secret=crypto.createHash('sha256').update(token).digest()
  const expected=crypto.createHmac('sha256',secret).update(body).digest('hex')
  return !!signature && signature.length===expected.length && crypto.timingSafeEqual(Buffer.from(signature),Buffer.from(expected))
}
