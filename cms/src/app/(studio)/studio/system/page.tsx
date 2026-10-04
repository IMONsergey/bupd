import React from 'react'
import { requireAdminUser } from '@/studio/lib/auth'
import DesignSystemLab from '@/studio/system/DesignSystemLab'
import SiteSettingsEditor from '@/studio/system/SiteSettingsEditor'

export default async function SystemPage(){
  const {payload}=await requireAdminUser()
  const [settings,users]=await Promise.all([
    payload.findGlobal({slug:'site-settings',overrideAccess:true}),
    payload.find({collection:'users',limit:50,sort:'name',depth:0,overrideAccess:true}),
  ])
  return <>
    <section className="studio-page-head"><div className="studio-page-head__copy"><span className="studio-eyebrow">BAEV / system</span><h1>Одна визуальная логика.</h1><p>Настройки и дизайн-система Studio. Payload остаётся внутри и не определяет внешний интерфейс.</p></div></section>
    <SiteSettingsEditor settings={settings}/>
    <section className="studio-grid studio-grid--2">
      <article className="studio-card"><header className="studio-card__head"><strong>Проект</strong></header><div className="system-summary"><div><span>Название</span><strong>{settings.siteName||'BAEV'}</strong></div><div><span>Production URL</span><strong>{settings.siteURL||'—'}</strong></div><div><span>Email</span><strong>{settings.email||'—'}</strong></div><div><span>Analytics</span><strong>{settings.analyticsId||'—'}</strong></div></div></article>
      <article className="studio-card"><header className="studio-card__head"><strong>Команда и роли</strong><span>{users.totalDocs}</span></header><div className="studio-list">{users.docs.map((user:any)=><div className="system-user" key={user.id}><div className="studio-user__avatar">{String(user.name||user.email||'B').slice(0,1).toUpperCase()}</div><div><strong>{user.name||user.email}</strong><span>{user.email}</span></div><i className="studio-chip">{user.role}</i></div>)}</div></article>
    </section>
    <section className="studio-section"><div className="studio-page-head" style={{marginBottom:14}}><div className="studio-page-head__copy"><span className="studio-eyebrow">Studio Design System / v1</span><h1 style={{fontSize:'34px'}}>Примитивы и поведение.</h1><p>Основа: спокойная плотность SmoothUI, рабочие patterns Spectrum UI и motion-поведение в духе Motion Primitives.</p></div></div><DesignSystemLab/></section>
  </>
}
