import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@/payload.config'
import '../preview/[slug]/preview.css'

export const metadata = { title: 'Журнал — BAEV', description: 'Идеи, процессы и новости студии BAEV.' }

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams
  const page = Math.max(1, Math.min(10000, Number.parseInt(params.page || '1', 10) || 1))
  const payload = await getPayload({ config })
  const articles = await payload.find({ collection: 'articles', draft: false, depth: 1, limit: 12, page, sort: '-publishedAt', overrideAccess: false, select: { title: true, slug: true, cover: true, summary: true, publishedAt: true, categories: true, author: true } })
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://baev-case-lab.vercel.app'
  return <div className="journal-page">
    <header className="journal-nav"><a href={site} className="case-logo">BAEV</a><nav><a href={site + '/work'}>Проекты</a><Link href="/blog" aria-current="page">Журнал</Link><a href={site + '/contact'}>Связь ↗</a></nav></header>
    <main><div className="journal-heading"><span>BAEV / Заметки студии</span><h1>Журнал.</h1><p>Делимся тем, как думаем,<br/>работаем и создаём новое.</p></div>
      {articles.docs.length ? <div className="journal-grid">{articles.docs.map(article => <Link href={'/blog/' + article.slug} className="journal-card" key={article.id}>
        {typeof article.cover === 'object' && article.cover?.url ? <img src={article.cover.sizes?.card?.url || article.cover.url} alt={article.cover.alt || ''}/> : <div className="journal-card__type"><span>BAEV / Журнал</span><strong>{article.title}</strong></div>}
        <small>{article.categories?.map(item => item.label).join(' / ') || 'Студия'}{article.publishedAt ? ' · ' + new Date(article.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }) : ''}</small><h2>{article.title} <span>↗</span></h2>{article.summary && <p>{article.summary}</p>}
      </Link>)}</div> : <div className="journal-empty"><h2>Скоро здесь появятся новые истории.</h2><p>А пока посмотрите наши проекты.</p><a href={site + '/work'}>Открыть портфолио ↗</a></div>}
      {articles.totalPages > 1 && <nav className="journal-pagination" aria-label="Страницы журнала">{articles.hasPrevPage && <Link href={'/blog?page=' + (page - 1)}>← Назад</Link>}<span>{page} / {articles.totalPages}</span>{articles.hasNextPage && <Link href={'/blog?page=' + (page + 1)}>Далее →</Link>}</nav>}
    </main><footer className="journal-footer"><a href={site + '/contact'}>Обсудить проект ↗</a><span>BAEV® · {new Date().getFullYear()}</span></footer>
  </div>
}
