import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Project } from '@/payload-types'

export {comparison,siteOrigin} from './environment'
export const siteSettings = cache(async () => (await getPayload({ config })).findGlobal({ slug: 'site-settings', depth: 1, overrideAccess: false }))
export const portfolio = cache(async () => {
  const payload = await getPayload({ config })
  return (await payload.find({ collection: 'projects', draft: false, depth: 1, limit: 200, overrideAccess: false, sort: ['portfolioOrder', '-year'], select: { title:true, slug:true, client:true, summary:true, cover:true, categories:true, year:true, featured:true, portfolioOrder:true, role:true, noIndex:true, updatedAt:true } })).docs
})
export const journal = cache(async () => (await (await getPayload({ config })).find({ collection:'articles', draft:false, depth:1, limit:200, overrideAccess:false, sort:'-publishedAt', select:{title:true,slug:true,summary:true,cover:true,author:true,publishedAt:true,categories:true,featured:true,noIndex:true,updatedAt:true} })).docs)
export const categories = (project: Pick<Project,'categories'>) => (project.categories || []).map(item => item.label).filter(Boolean)
export function relatedProjects<T extends Pick<Project,'id'|'categories'>>(project: Pick<Project,'id'|'categories'>, projects: T[]) {
  const labels = new Set(categories(project))
  return projects.filter(item=>item.id!==project.id).map(item=>({item,score:categories(item).filter(label=>labels.has(label)).length})).sort((a,b)=>b.score-a.score).slice(0,3).map(({item})=>item)
}
export {publicDefaults,publicContent} from './publicCopy'
