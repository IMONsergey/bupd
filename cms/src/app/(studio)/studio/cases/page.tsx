import React from 'react'

import { requireContentUser } from '@/studio/lib/auth'
import CasesClient from '@/studio/cases/CasesClient'
import { publicationIssues, projectContentSignature } from '@/studio/builder/publication'
import { editorSchemas } from '@/studio/builder/editorSchema'

export default async function CasesPage(){
  const {payload}=await requireContentUser()
  const [projects,templates,published]=await Promise.all([
    payload.find({collection:'projects',pagination:false,sort:'-updatedAt',depth:1,draft:true,overrideAccess:true}),
    payload.find({collection:'case-templates',limit:20,sort:'title',depth:0,draft:true,overrideAccess:true}),
    payload.find({collection:'projects',pagination:false,depth:0,draft:false,overrideAccess:true,where:{_status:{equals:'published'}}}),
  ])
  const publishedByID=new Map(published.docs.map(project=>[String(project.id),projectContentSignature(project)]))
  const items=projects.docs.map(project=>({
    id:project.id,title:project.title,slug:project.slug,cover:project.cover,client:project.client,year:project.year,
    workflowStatus:project.workflowStatus,_status:project._status,deadline:project.deadline,updatedAt:project.updatedAt,
    isPublished:publishedByID.has(String(project.id)),
    hasUnpublishedChanges:publishedByID.has(String(project.id))&&publishedByID.get(String(project.id))!==projectContentSignature(project),
    issueCount:publicationIssues(project,editorSchemas).filter(issue=>issue.severity==='error').length,
  }))
  return <>
    <section className="studio-page-head">
      <div className="studio-page-head__copy"><span className="studio-eyebrow">BAEV / кейсы</span><h1>Кейсы</h1><p>Редактируйте кейсы и управляйте публикациями.</p></div>
    </section>
    <CasesClient items={items as any} templates={templates.docs as any}/>
  </>
}
