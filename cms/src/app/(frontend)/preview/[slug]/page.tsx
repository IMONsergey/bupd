import {siteOrigin} from '@/lib/environment'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import LiveCase from './LiveCase'
import './preview.css'

export default async function CasePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const requestHeaders = await headers()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: requestHeaders })

  const role = user && 'role' in user ? user.role : undefined
  if (!user || !['admin', 'editor'].includes(String(role))) notFound()

  const result = slug === 'new'
    ? { docs: [] as any[] }
    : await payload.find({
        collection: 'projects',
        depth: 2,
        draft: true,
        limit: 1,
        overrideAccess: true,
        where: { slug: { equals: slug } },
      })

  const initialData = result.docs[0] || {
    id: 'new',
    title: 'Новый кейс',
    slug: 'new',
    client: 'BAEV',
    year: new Date().getFullYear(),
    categories: [],
    summary: 'Начните добавлять сцены в Case Builder — превью будет обновляться здесь.',
    pageTheme: 'dark',
    blocks: [],
  }

  const serverURL = siteOrigin()

  return <LiveCase initialData={initialData as any} serverURL={serverURL} siteURL={''} />
}
