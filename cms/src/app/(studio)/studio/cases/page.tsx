import React from 'react'

import { requireContentUser } from '@/studio/lib/auth'
import CasesClient from '@/studio/cases/CasesClient'

export default async function CasesPage(){
  const {payload}=await requireContentUser()
  const [projects,templates,published]=await Promise.all([
    payload.find({collection:'projects',limit:200,sort:'-updatedAt',depth:1,draft:true,overrideAccess:true}),
    payload.find({collection:'case-templates',limit:20,sort:'title',depth:0,draft:true,overrideAccess:true}),
    payload.find({collection:'projects',limit:200,depth:0,draft:false,overrideAccess:true,where:{_status:{equals:'published'}},select:{slug:true}}),
  ])
  const publishedIDs=new Set(published.docs.map(project=>String(project.id)))
  const items=projects.docs.map(project=>({...project,isPublished:publishedIDs.has(String(project.id))}))
  return <>
    <section className="studio-page-head">
      <div className="studio-page-head__copy"><span className="studio-eyebrow">BAEV / кейсы</span><h1>Истории, а не записи.</h1><p>Создание, поиск, проверка и публикация кейсов — в одном визуальном пространстве.</p></div>
    </section>
    <CasesClient items={items as any} templates={templates.docs as any}/>
  </>
}
