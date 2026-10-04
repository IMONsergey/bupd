'use client'
import {useState,type FormEvent} from 'react'
import {Save,Check} from '@/studio/ui/icons'
const fields=[['siteName','Название','text'],['siteURL','Адрес сайта','url'],['email','Email','email'],['telegram','Telegram','text'],['phone','Телефон','tel'],['defaultDescription','Описание сайта','textarea'],['analyticsId','ID Метрики','text']] as const
export default function SiteSettingsEditor({settings}:{settings:any}){
  const [values,setValues]=useState<Record<string,string>>(()=>Object.fromEntries(fields.map(([name])=>[name,settings[name]||''])))
  const [busy,setBusy]=useState(false),[dirty,setDirty]=useState(false),[notice,setNotice]=useState(''),[failed,setFailed]=useState(false)
  async function save(event:FormEvent){
    event.preventDefault();setBusy(true);setNotice('');setFailed(false)
    try {
      const response=await fetch('/api/globals/site-settings',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)})
      if(!response.ok)throw new Error('Проверьте заполненные поля и повторите попытку.')
      setDirty(false);setNotice('Настройки сохранены')
    } catch(error){setFailed(true);setNotice(error instanceof Error?error.message:'Не удалось сохранить настройки.')} finally {setBusy(false)}
  }
  return <form className="studio-card site-settings-editor" onSubmit={save}><header className="studio-card__head"><strong>Сайт и контакты</strong></header><div className="site-settings-fields">{fields.map(([name,label,type])=><label key={name}><span>{label}</span>{type==='textarea'?<textarea className="studio-input" rows={3} value={values[name]} onChange={e=>{setValues({...values,[name]:e.target.value});setDirty(true)}}/>:<input className="studio-input" type={type} value={values[name]} onChange={e=>{setValues({...values,[name]:e.target.value});setDirty(true)}}/>}</label>)}</div><footer><button className="studio-button" disabled={busy||!dirty}><Save size={15}/>{busy?'Сохраняем…':'Сохранить'}</button>{notice&&<span role={failed?'alert':'status'} style={{color:failed?'var(--s-red)':undefined}}>{!failed&&<Check size={14}/>} {notice}</span>}</footer></form>
}
