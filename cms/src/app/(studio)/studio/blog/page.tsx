import React from 'react'

import { requireContentUser } from '@/studio/lib/auth'
import CasesClient from '@/studio/cases/CasesClient'
import { publicationIssues, projectContentSignature } from '@/studio/builder/publication'
import { articleSchemas } from '@/studio/builder/editorSchema'

export default async function CasesPage(){
  const {payload}=await requireContentUser()
  const [projects,templates,published]=await Promise.all([
    payload.find({collection:'articles',limit:200,sort:'-updatedAt',depth:1,draft:true,overrideAccess:true}),
    Promise.resolve({docs:[]}),
    payload.find({collection:'articles',limit:200,depth:0,draft:false,overrideAccess:true,where:{_status:{equals:'published'}}}),
  ])
  const publishedByID=new Map(published.docs.map(project=>[String(project.id),projectContentSignature(project)]))
  const items=projects.docs.map(project=>({
    id:project.id,title:project.title,slug:project.slug,cover:project.cover,client:project.author,year:undefined,
    workflowStatus:project.workflowStatus,_status:project._status,updatedAt:project.updatedAt,
    isPublished:publishedByID.has(String(project.id)),
    hasUnpublishedChanges:publishedByID.has(String(project.id))&&publishedByID.get(String(project.id))!==projectContentSignature(project),
    issueCount:publicationIssues({...project,kind:"article"},articleSchemas).filter(issue=>issue.severity==='error').length,
  }))
  return <>
    <section className="studio-page-head">
      <div className="studio-page-head__copy"><span className="studio-eyebrow">BAEV / журнал</span><h1>Блог</h1><p>Мысли, процессы и новости BAEV. Собирайте статьи прямо на странице.</p></div>
    </section>
    <CasesClient kind="article" items={items as any} templates={templates.docs as any}/>
  </>
}
