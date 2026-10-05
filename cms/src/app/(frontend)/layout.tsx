import type {Metadata} from 'next'
import type {ReactNode} from 'react'
import {comparison,siteOrigin} from '@/lib/publicSite'
import PublicTelemetry from '@/public/PublicTelemetry'
import './styles.css'
import './public.css'
export const metadata:Metadata={metadataBase:new URL(siteOrigin()),title:'BAEV — содержание и дизайн',description:'Стратегия, сценарий и визуальная система для презентаций, выступлений и событий.',robots:comparison?{index:false,follow:false}:undefined,openGraph:{siteName:'BAEV',locale:'ru_RU',type:'website'}}
export default function RootLayout({children}:{children:ReactNode}){return <html lang="ru"><body>{children}<PublicTelemetry/>{comparison&&<aside className="comparison-badge" aria-label="Версия для сравнения">BAEV / новая версия<a href="https://baev-case-lab.vercel.app" target="_blank" rel="noopener noreferrer">Текущая ↗</a><a href="/studio">Studio ↗</a></aside>}</body></html>}
