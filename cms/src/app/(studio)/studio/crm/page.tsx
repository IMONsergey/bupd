import React from 'react'
import { requireSalesUser } from '@/studio/lib/auth'
import CrmWorkspace from '@/studio/crm/CrmWorkspace'

export default async function CRMPage(){
  const {payload}=await requireSalesUser()
  const [leads,deals,activities]=await Promise.all([
    payload.find({collection:'leads',limit:200,sort:'-createdAt',depth:1,overrideAccess:true}),
    payload.find({collection:'deals',limit:200,sort:'-updatedAt',depth:1,overrideAccess:true}),
    payload.find({collection:'activities',limit:200,sort:'dueAt',depth:1,overrideAccess:true}),
  ])
  return <>
    <section className="studio-page-head"><div className="studio-page-head__copy"><span className="studio-eyebrow">BAEV / CRM</span><h1>Клиенты</h1><p>Контакты, сделки и ближайшие задачи.</p></div></section>
    <CrmWorkspace leads={leads.docs as any} deals={deals.docs as any} activities={activities.docs as any}/>
  </>
}
