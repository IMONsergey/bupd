import { notFound } from 'next/navigation'
import React from 'react'

import { articleCatalog } from '@/blocks/catalog'
import { requireContentUser } from '@/studio/lib/auth'
import VisualCaseBuilder from '@/studio/builder/VisualCaseBuilder'
import { articleSchemas } from '@/studio/builder/editorSchema'
import { projectContentSignature } from '@/studio/builder/publication'

export default async function CaseBuilderPage({params}:{params:Promise<{id:string}>}){
  const {id}=await params
  const {payload}=await requireContentUser()
  const [project,projects,publicState]=await Promise.all([
    payload.findByID({
      collection:'articles',
      id,
      depth:2,
      draft:true,
      overrideAccess:true,
    }).catch(()=>null),
    payload.find({collection:'projects',depth:1,draft:true,limit:200,overrideAccess:true,select:{title:true,slug:true,cover:true}}),
    payload.findByID({collection:'articles',id,depth:0,draft:false,overrideAccess:true}).catch(()=>null),
  ])

  if(!project)notFound()

  return <VisualCaseBuilder initialPublished={publicState?._status==='published'} initialPublishedSignature={publicState?._status==='published'?projectContentSignature(publicState):undefined} project={{...project,kind:"article"} as any} kind="article" catalog={articleCatalog as any} blobEnabled={Boolean(process.env.BLOB_READ_WRITE_TOKEN)} schemas={articleSchemas} projects={projects.docs.filter(p=>String(p.id)!==id)}/>
}
