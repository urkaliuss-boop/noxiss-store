import {NextResponse} from 'next/server'
import {db} from '@/lib/db'
import {getAuth} from '@/lib/telegram'
export async function GET(req:Request){try{const {user,isAdmin}=getAuth(req),sql=db();const rows=await sql`INSERT INTO users(telegram_id,first_name,username) VALUES(${user.id},${user.first_name},${user.username||null}) ON CONFLICT(telegram_id) DO UPDATE SET first_name=EXCLUDED.first_name,username=EXCLUDED.username RETURNING balance`;return NextResponse.json({user,balance:Number(rows[0].balance),isAdmin})}catch(e:any){return NextResponse.json({error:e.message},{status:401})}}
