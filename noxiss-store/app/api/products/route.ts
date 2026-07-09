import {NextResponse} from 'next/server'
import {db} from '@/lib/db'
export async function GET(){try{const rows=await db()`SELECT id,title,description,price,icon,mode,active FROM products WHERE active=true ORDER BY sort_order,id`;return NextResponse.json(rows.map(x=>({...x,price:Number(x.price)})))}catch(e:any){return NextResponse.json({error:e.message},{status:500})}}
