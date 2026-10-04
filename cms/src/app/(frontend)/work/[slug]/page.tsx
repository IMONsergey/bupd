import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import LiveCase from '../../preview/[slug]/LiveCase'
import '../../preview/[slug]/preview.css'

export default async function PublicCasePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'projects',
    depth: 2,
    draft: false,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { slug: { equals: slug } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  const project = result.docs[0]
  if (!project) notFound()

  const serverURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001'
  const related=await payload.find({collection:'projects',depth:1,draft:false,limit:4,overrideAccess:true,where:{and:[{_status:{equals:'published'}},{id:{not_equals:project.id}}]}})
  return <LiveCase initialData={project as any} serverURL={serverURL} siteURL={process.env.NEXT_PUBLIC_SITE_URL||'https://baev-case-lab.vercel.app'} related={related.docs} preview={false} />
}
