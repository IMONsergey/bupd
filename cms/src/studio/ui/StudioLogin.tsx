'use client'

import { ArrowRight, StudioIcon } from '@/studio/ui/icons'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

export default function StudioLogin() {
  const router=useRouter()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [show,setShow]=useState(false)
  const [busy,setBusy]=useState(false)
  const [error,setError]=useState('')

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault()
    if(busy)return
    setBusy(true);setError('')
    try {
    const response=await fetch('/api/users/login',{
      method:'POST',
      credentials:'include',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email,password}),
    })
    const data=await response.json().catch(()=>({}))
    if(!response.ok){
      setError(data?.errors?.[0]?.message||'Не удалось войти. Проверьте email и пароль.')
      setBusy(false)
      return
    }
    router.replace('/studio')
    router.refresh()
    } catch {
      setError('Нет связи с сервером. Проверьте интернет и попробуйте ещё раз.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="studio-login">
      <motion.section className="studio-login__card" initial={{opacity:0,y:18,scale:.98}} animate={{opacity:1,y:0,scale:1}} transition={{duration:.45,ease:[.22,1,.36,1]}}>
        <header>
          <motion.div className="studio-login__logo" initial={{rotate:-8,scale:.8}} animate={{rotate:0,scale:1}} transition={{type:'spring',stiffness:380,damping:24}}>B</motion.div>
          <div><strong>BAEV Studio</strong><span>Рабочее пространство</span></div>
        </header>
        <div className="studio-login__intro">
          <span>Вход в систему</span>
          <h1>Войти в Studio</h1>
          <p>Кейсы, материалы и работа с клиентами.</p>
        </div>
        <form onSubmit={submit}>
          <label><span>Email</span><input autoFocus required type="email" autoComplete="username" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="name@baev.agency"/></label>
          <label><span>Пароль</span><div className="studio-password"><input required type={show?'text':'password'} autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="••••••••"/><button type="button" aria-label={show?'Скрыть пароль':'Показать пароль'} aria-pressed={show} onClick={()=>setShow((v)=>!v)}><StudioIcon name={show?'EyeOff':'Eye'} size={16}/></button></div></label>
          <AnimatePresence>{error&&<motion.p role="alert" className="studio-login__error" initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}>{error}</motion.p>}</AnimatePresence>
          <button className="studio-login__submit" disabled={busy||!email||!password}>{busy?'Входим…':<>Войти <ArrowRight size={16}/></>}</button>
        </form>
        <footer><span>BAEV</span><span>Доступ для команды</span></footer>
      </motion.section>
      <div className="studio-login__ambient studio-login__ambient--one"/>
      <div className="studio-login__ambient studio-login__ambient--two"/>
    </main>
  )
}
