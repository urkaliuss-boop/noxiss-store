import type { Metadata } from 'next'
import './globals.css'
export const metadata:Metadata={title:'Noxiss Store',description:'Digital services inside Telegram'}
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>}
