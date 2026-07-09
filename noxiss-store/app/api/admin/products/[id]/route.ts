import {NextResponse} from 'next/server'
import {db} from '@/lib/db'
import {getAuth} from '@/lib/telegram'
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){try{const {isAdmin}=getAuth(req);if(!isAdmin)return NextResponse.json({error:'forbidden'},{status:403});const {id}=await params;const p=await req.json();if(!['auto','manual','paused'].includes(p.mode))throw new Error('Invalid mode');await db()`UPDATE products SET title=${p.title},description=${p.description},price=${p.price},mode=${p.mode},active=${p.active},delivery_content=${p.delivery_content||null} WHERE id=${id}`;return NextResponse.json({ok:true})}catch(e:any){return NextResponse.json({error:e.message},{status:400})}}
