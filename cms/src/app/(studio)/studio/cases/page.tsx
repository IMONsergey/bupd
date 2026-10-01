import React from 'react'

import { requireContentUser } from '@/studio/lib/auth'
import CasesClient from '@/studio/cases/CasesClient'

export default async function CasesPage(){
  const {payload}=await requireContentUser()
  const [projects,templates]=await Promise.all([
    payload.find({collection:'projects',limit:200,sort:'-updatedAt',depth:0,draft:true,overrideAccess:true}),
    payload.find({collection:'case-templates',limit:20,sort:'title',depth:0,draft:true,overrideAccess:true}),
  ])
  return <>
    <section className="studio-page-head">
      <div className="studio-page-head__copy"><span className="studio-eyebrow">BAEV / кейсы</span><h1>Истории, а не записи.</h1><p>Создание, поиск, проверка и публикация кейсов — в одном визуальном пространстве.</p></div>
    </section>
    <CasesClient items={projects.docs as any} templates={templates.docs as any}/>
  </>
}
