import type {MetadataRoute} from 'next'
import {portfolio,journal,siteOrigin,comparison} from '@/lib/publicSite'
export const dynamic='force-dynamic'
export default async function sitemap():Promise<MetadataRoute.Sitemap>{if(comparison)return [];const [projects,articles]=await Promise.all([portfolio(),journal()]);const base=siteOrigin();return [...['','/work','/about','/contact','/blog'].map(path=>({url:base+path})),...projects.filter(p=>!p.noIndex).map(p=>({url:base+'/work/'+p.slug,lastModified:p.updatedAt})),...articles.filter(a=>!a.noIndex).map(a=>({url:base+'/blog/'+a.slug,lastModified:a.updatedAt}))]}
