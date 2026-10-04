import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'

export const publicArticle = cache(async (slug: string) => {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'articles', depth: 2, draft: false, limit: 1, overrideAccess: false, where: { slug: { equals: slug } }, select: { title: true, slug: true, author: true, publishedAt: true, summary: true, categories: true, blocks: true, cover: true, ogImage: true, pageBackground: true, mediaRadius: true, pageTheme: true, seoTitle: true, seoDescription: true, noIndex: true, canonicalURL: true } })
  return result.docs[0] || null
})
