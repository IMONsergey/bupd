import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import { getPayload } from 'payload'

import config from './payload.config'

const payload = await getPayload({ config })

const assets = [
  ['avito-hero', 'https://framerusercontent.com/images/hcbL0ljxHd8FCixzynoW8sZo0c.jpg?width=2616&height=1717'],
  ['avito-scene-01', 'https://framerusercontent.com/images/0QiA6QpV4cUmfqp7z6tTGeKnNaA.png?width=2400&height=2045'],
  ['avito-scene-02', 'https://framerusercontent.com/images/kmlwbvJjwpPh0TfzxbzGEphPLSo.png?width=2400&height=1601'],
  ['avito-scene-03', 'https://framerusercontent.com/images/hwBVZD7yLoZrEKjvrurUxLohQ.png?width=2400&height=1601'],
  ['avito-scene-04', 'https://framerusercontent.com/images/4uNnl0GLQmUPINmiLWwLMclzFA.png?width=2400&height=1601'],
  ['avito-scene-05', 'https://framerusercontent.com/images/3UX6jbJVL5Ln3RR6DAi2LcdhjlE.png?width=1920&height=1080'],
  ['avito-scene-06', 'https://framerusercontent.com/images/eIScR9KgzgQWGwbH8oUcy4QCpo.png?width=1920&height=1080'],
  ['avito-scene-07', 'https://framerusercontent.com/images/8LOx1gZHum2GuI4eATsEE4NCZwc.png?width=1920&height=1080'],
] as const

const findOne = async (collection: any, where: any) => {
  const result = await payload.find({ collection, limit: 1, where, overrideAccess: true })
  return result.docs[0] as any
}

const ensureAdmin = async () => {
  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  if (!email || !password) return

  const existing = await findOne('users', { email: { equals: email } })
  if (existing) return

  await payload.create({
    collection: 'users',
    overrideAccess: true,
    data: { email, password, role: 'admin', name: 'BAEV Admin' },
  })
  payload.logger.info(`Seeded admin user: ${email}`)
}

const ensureMedia = async (key: string, url: string) => {
  const existing = await findOne('media', { alt: { equals: `BAEV seed / ${key}` } })
  if (existing) return existing

  const response = await fetch(url)
  if (!response.ok) throw new Error(`Unable to download ${url}: ${response.status}`)

  const mime = response.headers.get('content-type') || 'image/jpeg'
  const extension = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg'
  const tempPath = path.join(os.tmpdir(), `${key}.${extension}`)
  await fs.writeFile(tempPath, Buffer.from(await response.arrayBuffer()))

  const media = await payload.create({
    collection: 'media',
    overrideAccess: true,
    filePath: tempPath,
    data: {
      alt: `BAEV seed / ${key}`,
      kind: key === 'avito-hero' ? 'cover' : 'project',
      tags: [{ label: 'Avito Auto' }, { label: 'seed' }],
    },
  })

  await fs.rm(tempPath, { force: true })
  return media
}

const ensureAvitoCase = async (media: Record<string, any>) => {
  const existing = await findOne('projects', { slug: { equals: 'avito-auto-2024' } })
  if (existing) return existing

  return payload.create({
    collection: 'projects',
    overrideAccess: true,
    draft: true,
    data: {
      kind: 'project',
      title: 'Авито Авто — Высшая передача',
      slug: 'avito-auto-2024',
      client: 'Авито',
      year: 2024,
      featured: true,
      categories: [{ label: 'Презентация' }, { label: 'Брендинг' }, { label: 'Мероприятие' }],
      summary: 'Презентационная и визуальная система для Авито Авто. Кейс собран как последовательность сцен, а не как длинная галерея артефактов.',
      cover: media['avito-hero'].id,
      pageTheme: 'dark',
      accent: '#19F59B',
      seoTitle: 'Авито Авто — Высшая передача / BAEV',
      seoDescription: 'Презентационная и визуальная система BAEV для Авито Авто.',
      blocks: [
        {
          blockType: 'caseHero',
          eyebrow: 'Авито Авто / 2024',
          title: 'Высшая передача',
          dek: 'Коммуникационная система для события и презентации, где данные становятся частью сценографии.',
          media: media['avito-hero'].id,
          layout: 'editorial',
          theme: 'dark',
        },
        {
          blockType: 'manifesto',
          kicker: 'Контекст',
          text: 'Каждый второй автомобиль в стране продаётся через Авито. Масштаб бренда должен был ощущаться не в обещаниях, а в самой подаче.',
          size: 'xl',
          align: 'left',
          theme: 'dark',
        },
        {
          blockType: 'fullBleedMedia',
          media: media['avito-scene-01'].id,
          height: 'screen',
          fit: 'cover',
          theme: 'media',
        },
        {
          blockType: 'splitMedia',
          left: media['avito-scene-02'].id,
          right: media['avito-scene-03'].id,
          ratio: '1-1',
          gap: 's',
          theme: 'dark',
        },
        {
          blockType: 'stickyStory',
          chapter: 'Система',
          title: 'Данные работают как визуальный материал',
          body: 'Мы не выносили цифры в отдельные служебные слайды. Метрики стали частью композиции, ритма и сценографии.',
          frames: [
            { media: media['avito-scene-04'].id, caption: 'Система графики' },
            { media: media['avito-scene-05'].id, caption: 'Экранная композиция' },
          ],
          pin: 'copy',
          theme: 'dark',
        },
        {
          blockType: 'metrics',
          items: [
            { value: '71%', label: 'MAP 2024', note: 'ключевая метрика' },
            { value: '1 200+', label: 'участников', note: 'единый опыт' },
            { value: '42', label: 'экрана', note: 'одна визуальная система' },
          ],
          style: 'oversized',
          theme: 'dark',
        },
        {
          blockType: 'mediaMosaic',
          items: [
            { media: media['avito-scene-05'].id, span: '2' },
            { media: media['avito-scene-06'].id, span: '1' },
            { media: media['avito-scene-07'].id, span: '1' },
          ],
          layout: 'editorial',
          theme: 'dark',
        },
        {
          blockType: 'quote',
          text: 'Сильный кейс — не архив проекта. Это самостоятельная история с собственным ритмом.',
          author: 'BAEV',
          role: 'Case system principle',
          size: 'display',
          theme: 'light',
        },
        {
          blockType: 'process',
          title: 'От данных к сцене',
          steps: [
            { number: '01', title: 'Структура', body: 'Разбираем содержание и собираем иерархию.' },
            { number: '02', title: 'Система', body: 'Определяем визуальные правила и логику данных.' },
            { number: '03', title: 'Ритм', body: 'Чередуем масштабы, плотность и паузы.' },
            { number: '04', title: 'Сцена', body: 'Проверяем материал в реальном пространстве.' },
          ],
          mode: 'timeline',
          theme: 'dark',
        },
        {
          blockType: 'gallery',
          items: [
            { media: media['avito-scene-01'].id },
            { media: media['avito-scene-03'].id },
            { media: media['avito-scene-06'].id },
            { media: media['avito-scene-07'].id },
          ],
          mode: 'drag',
          theme: 'dark',
        },
        {
          blockType: 'deviceShowcase',
          media: media['avito-scene-07'].id,
          device: 'screen',
          float: true,
          theme: 'dark',
        },
        {
          blockType: 'credits',
          title: 'Команда',
          items: [
            { role: 'Strategy', name: 'BAEV' },
            { role: 'Art direction', name: 'BAEV' },
            { role: 'Design', name: 'Команда проекта' },
            { role: 'Development', name: 'BAEV' },
          ],
          theme: 'dark',
        },
        {
          blockType: 'cta',
          title: 'Соберём следующую историю?',
          body: 'Презентации, брендинг, digital и события — как одна система.',
          buttonLabel: 'Обсудить проект',
          buttonURL: '/contact',
          mode: 'statement',
          theme: 'light',
        },
      ],
    } as any,
  })
}

const ensureTemplates = async () => {
  const templates = [
    {
      slug: '_template-editorial',
      title: 'Editorial',
      description: 'Универсальный редакционный кейс: спокойно, структурно, с сильной типографикой.',
      blocks: [
        { blockType: 'caseHero', title: 'Название кейса', layout: 'editorial', theme: 'dark' },
        { blockType: 'manifesto', text: 'Ключевая мысль проекта', size: 'xl', align: 'left', theme: 'dark' },
        { blockType: 'textMedia', title: 'Контекст', layout: 'text-left', theme: 'dark' },
        { blockType: 'metrics', items: [{ value: '01', label: 'Ключевой результат' }], style: 'rail', theme: 'dark' },
        { blockType: 'credits', title: 'Команда', items: [{ role: 'Role', name: 'Name' }], theme: 'dark' },
        { blockType: 'cta', title: 'Обсудить проект', buttonLabel: 'Связаться', buttonURL: '/contact', mode: 'statement', theme: 'light' },
      ],
    },
    {
      slug: '_template-immersive',
      title: 'Immersive',
      description: 'Погружающий кейс для сильного визуального материала и интерактивных сцен.',
      blocks: [
        { blockType: 'caseHero', title: 'Название кейса', layout: 'fullscreen', theme: 'dark' },
        { blockType: 'typographyTakeover', text: 'Большая идея', mode: 'center', align: 'left', theme: 'dark' },
        { blockType: 'stickyStory', title: 'Глава', body: 'История', frames: [], pin: 'copy', theme: 'dark' },
        { blockType: 'horizontalStory', title: 'Последовательность', scenes: [], mode: 'snap', theme: 'dark' },
        { blockType: 'gallery', items: [], mode: 'drag', theme: 'dark' },
        { blockType: 'cta', title: 'Следующий шаг', buttonLabel: 'Связаться', buttonURL: '/contact', mode: 'statement', theme: 'light' },
      ],
    },
    {
      slug: '_template-proof',
      title: 'Proof',
      description: 'Кейс вокруг результата: было / стало, процесс, цифры и доказательства.',
      blocks: [
        { blockType: 'caseHero', title: 'Название кейса', layout: 'editorial', theme: 'dark' },
        { blockType: 'manifesto', text: 'Задача и ставка проекта', size: 'l', align: 'left', theme: 'dark' },
        { blockType: 'beforeAfter', beforeLabel: 'До', afterLabel: 'После', mode: 'drag', theme: 'dark' },
        { blockType: 'process', title: 'Что сделали', steps: [{ number: '01', title: 'Этап', body: 'Описание' }], mode: 'timeline', theme: 'dark' },
        { blockType: 'metrics', items: [{ value: '+00%', label: 'Результат' }], style: 'oversized', theme: 'dark' },
        { blockType: 'quote', text: 'Цитата клиента', size: 'xl', theme: 'light' },
      ],
    },
  ]

  for (const template of templates) {
    const existing = await findOne('case-templates', { slug: { equals: template.slug } })
    if (!existing) {
      await payload.create({
        collection: 'case-templates',
        overrideAccess: true,
        draft: true,
        data: {
          ...template,
          pageTheme: 'dark',
          accent: '#ffffff',
        } as any,
      })
    }
  }
}

const ensureCRM = async () => {
  let company = await findOne('companies', { name: { equals: 'Demo / Northstar' } })
  if (!company) {
    company = await payload.create({
      collection: 'companies',
      overrideAccess: true,
      data: { name: 'Demo / Northstar', industry: 'Technology', domain: 'northstar.example' },
    })
  }

  let lead = await findOne('leads', { email: { equals: 'demo@northstar.example' } })
  if (!lead) {
    lead = await payload.create({
      collection: 'leads',
      overrideAccess: true,
      data: {
        name: 'Demo Lead',
        email: 'demo@northstar.example',
        companyName: 'Demo / Northstar',
        company: company.id,
        source: 'site',
        service: 'branding',
        budget: 1800000,
        status: 'qualified',
      },
    })
  }

  const sampleDeals = [
    ['Demo / Brand platform', 'discovery', 900000],
    ['Demo / Annual presentation', 'brief', 650000],
    ['Demo / Digital launch', 'proposal', 1400000],
    ['Demo / Event system', 'negotiation', 2200000],
  ] as const

  for (const [title, stage, value] of sampleDeals) {
    const existing = await findOne('deals', { title: { equals: title } })
    if (!existing) {
      await payload.create({
        collection: 'deals',
        overrideAccess: true,
        data: {
          title,
          company: company.id,
          lead: lead.id,
          stage,
          value,
          currency: 'RUB',
          probability: stage === 'negotiation' ? 80 : stage === 'proposal' ? 60 : 35,
        },
      })
    }
  }

  const eventDeal = await findOne('deals', { title: { equals: 'Demo / Event system' } })
  const existingActivity = await findOne('activities', { title: { equals: 'Demo / отправить финальное КП' } })
  if (!existingActivity && eventDeal) {
    await payload.create({
      collection: 'activities',
      overrideAccess: true,
      data: {
        type: 'task',
        title: 'Demo / отправить финальное КП',
        body: 'Проверить состав работ и отправить финальную версию предложения.',
        company: company.id,
        deal: eventDeal.id,
        dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    })
  }
}

await ensureAdmin()

const media: Record<string, any> = {}
for (const [key, url] of assets) media[key] = await ensureMedia(key, url)

await ensureAvitoCase(media)
await ensureTemplates()
await ensureCRM()

payload.logger.info('BAEV seed completed')
process.exit(0)

