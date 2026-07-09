const token=process.env.TELEGRAM_BOT_TOKEN,app=process.env.NEXT_PUBLIC_APP_URL
if(!token||!app)throw new Error('Set TELEGRAM_BOT_TOKEN and NEXT_PUBLIC_APP_URL')
const api='https:'+'//api.telegram.org/bot'+token
const call=async(method,body)=>{const r=await fetch(`${api}/${method}`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});console.log(method,await r.json())}
await call('setWebhook',{url:`${app}/api/bot/webhook`})
await call('setChatMenuButton',{menu_button:{type:'web_app',text:'Открыть Noxiss Store',web_app:{url:app}}})
await call('setMyCommands',{commands:[{command:'start',description:'Открыть магазин'}]})
