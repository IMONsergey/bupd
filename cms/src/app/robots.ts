import type {MetadataRoute} from 'next'
import {comparison,siteOrigin} from '@/lib/publicSite'
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',...(comparison?{disallow:'/'}:{allow:'/',disallow:['/studio','/admin','/api','/preview','/preview-blog']})},sitemap:comparison?undefined:siteOrigin()+'/sitemap.xml'}}
