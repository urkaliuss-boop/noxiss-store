import {NextResponse} from 'next/server'
import {db} from '@/lib/db'
import {getAuth} from '@/lib/telegram'
import {createInvoice} from '@/lib/crypto-pay'
export async function POST(req:Request){try{const {user}=getAuth(req),{amount}=await req.json();if(!Number.isFinite(amount)||amount<1||amount>1000)throw new Error('Сумма должна быть от 1 до 1000 USDT');const sql=db();await sql`INSERT INTO users(telegram_id,first_name,username) VALUES(${user.id},${user.first_name},${user.username||null}) ON CONFLICT(telegram_id) DO NOTHING`;const inv=await createInvoice(amount,JSON.stringify({telegramId:user.id,amount}));await sql`INSERT INTO invoices(telegram_id,provider_id,amount) VALUES(${user.id},${inv.invoice_id},${amount})`;return NextResponse.json({url:inv.bot_invoice_url})}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
