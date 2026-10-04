import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { publicArticle } from '@/lib/publicArticles'
import LiveCase from '../../preview/[slug]/LiveCase'
import '../../preview/[slug]/preview.css'

type Props = { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params, article = await publicArticle(slug)
  if (!article) return { title: 'Статья не найдена — BAEV', robots: { index: false } }
  const title = article.seoTitle || article.title + ' — BAEV'
  const description = article.seoDescription || article.summary || undefined
  const image = typeof article.ogImage === 'object' && article.ogImage?.url || typeof article.cover === 'object' && article.cover?.url
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'https://baev-cms.vercel.app'
  return { title, description, robots: { index: !article.noIndex, follow: !article.noIndex }, alternates: { canonical: article.canonicalURL?.startsWith('https://') ? article.canonicalURL : base + '/blog/' + slug }, openGraph: { type: 'article', title, description, publishedTime: article.publishedAt || undefined, authors: article.author ? [article.author] : [], images: image ? [image] : [] } }
}
export default async function ArticlePage({ params }: Props) {
  const { slug } = await params, article = await publicArticle(slug)
  if (!article) notFound()
  return <LiveCase initialData={{ ...article, kind: 'article' }} serverURL={process.env.NEXT_PUBLIC_SERVER_URL || 'https://baev-cms.vercel.app'} siteURL={process.env.NEXT_PUBLIC_SITE_URL || 'https://baev-case-lab.vercel.app'} preview={false}/>
}
