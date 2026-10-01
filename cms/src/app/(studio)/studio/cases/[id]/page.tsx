import { notFound } from 'next/navigation'
import React from 'react'

import { blockCatalog } from '@/blocks/catalog'
import { requireContentUser } from '@/studio/lib/auth'
import VisualCaseBuilder from '@/studio/builder/VisualCaseBuilder'

export default async function CaseBuilderPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params
  const {payload}=await requireContentUser()
  const [project,media]=await Promise.all([
    payload.findByID({
      collection:'projects',
      id,
      depth:2,
      draft:true,
      overrideAccess:true,
    }).catch(()=>null),
    payload.find({
      collection:'media',
      limit:250,
      sort:'-createdAt',
      depth:0,
      overrideAccess:true,
    }),
  ])

  if(!project)notFound()

  return <VisualCaseBuilder project={project as any} catalog={blockCatalog as any} media={media.docs as any}/>
}
