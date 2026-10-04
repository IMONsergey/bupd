'use client'

import { Check, ChevronRight, Plus, Search, Sparkles } from '@/studio/ui/icons'
import { AnimatePresence, motion } from 'motion/react'
import React,{useState} from 'react'

export default function DesignSystemLab(){
  const [tab,setTab]=useState('components')
  const [toggle,setToggle]=useState(true)
  const [modal,setModal]=useState(false)
  return <div className="ds-lab">
    <div className="ds-tabs">{[['components','Компоненты'],['motion','Motion'],['tokens','Токены']].map(([id,label])=><button key={id} onClick={()=>setTab(id)}>{tab===id&&<motion.i layoutId="ds-tab" transition={{type:'spring',stiffness:420,damping:34}}/>}<span>{label}</span></button>)}</div>
    <AnimatePresence mode="wait">
      <motion.div key={tab} initial={{opacity:0,y:7}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-5}} transition={{duration:.18}}>
        {tab==='components'&&<div className="ds-grid">
          <section className="studio-card ds-panel"><span className="studio-eyebrow">Buttons</span><div className="ds-row"><button className="studio-button"><Plus size={14}/> Primary</button><button className="studio-button studio-button--soft">Secondary</button><button className="studio-button studio-button--ghost">Ghost</button></div></section>
          <section className="studio-card ds-panel"><span className="studio-eyebrow">Inputs</span><div className="ds-stack"><input className="studio-input" placeholder="Обычное поле"/><div style={{position:'relative'}}><Search size={14} style={{position:'absolute',left:10,top:12,color:'#a1a1aa'}}/><input className="studio-input" style={{width:'100%',paddingLeft:32}} placeholder="Поиск"/></div></div></section>
          <section className="studio-card ds-panel"><span className="studio-eyebrow">Status</span><div className="ds-row"><span className="studio-chip studio-chip--green">Готово</span><span className="studio-chip studio-chip--amber">Проверка</span><span className="studio-chip studio-chip--blue">Новый</span><span className="studio-chip">Черновик</span></div></section>
          <section className="studio-card ds-panel"><span className="studio-eyebrow">Controls</span><div className="ds-control-row"><span>Live preview</span><button className={['ds-switch',toggle?'is-on':''].join(' ')} onClick={()=>setToggle((v)=>!v)}><i/></button></div><div className="ds-control-row"><span>Morph dialog</span><button className="studio-button studio-button--soft" onClick={()=>setModal(true)}>Открыть <ChevronRight size={13}/></button></div></section>
        </div>}
        {tab==='motion'&&<div className="ds-motion-grid">
          {[['Shared layout','Активные состояния мягко перетекают между табами и фильтрами.'],['Morph surfaces','Модалки и панели появляются из контекста, а не “прыгают” поверх интерфейса.'],['Stagger','Списки и карточки входят короткой последовательностью, сохраняя ощущение скорости.'],['Reduced motion','Все ключевые действия остаются понятными без анимации.']].map(([title,body],i)=><motion.article className="studio-card ds-motion-card" key={title} whileHover={{y:-4,scale:1.01}} transition={{type:'spring',stiffness:380,damping:28}}><motion.div animate={{rotate:[0,4,-3,0],scale:[1,1.06,1]}} transition={{duration:4+i*.4,repeat:Infinity,repeatDelay:1}}><Sparkles size={18}/></motion.div><strong>{title}</strong><p>{body}</p></motion.article>)}
        </div>}
        {tab==='tokens'&&<div className="ds-token-grid">{[
          ['Surface','#171819','--s-panel'],['Canvas','#101112','--s-bg'],['Text','#f2f2ef','--s-text'],['Muted','#b1b4b4','--s-muted'],['Line','#2c2f30','--s-line'],['Success','#a6d8b1','--s-green'],['Accent','#aebfda','--s-blue'],['Radius','14px','--s-radius']
        ].map(([name,value,token])=><article className="studio-card ds-token" key={token}><i style={{background:value.startsWith('#')?value:'#fff'}}/><div><strong>{name}</strong><span>{value}</span><code>{token}</code></div></article>)}</div>}
      </motion.div>
    </AnimatePresence>
    <AnimatePresence>{modal&&<motion.div className="ds-modal-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onMouseDown={(e)=>e.target===e.currentTarget&&setModal(false)}><motion.section className="ds-modal" layoutId="demo-dialog" initial={{scale:.92,y:18}} animate={{scale:1,y:0}} exit={{scale:.95,y:8}} transition={{type:'spring',stiffness:380,damping:30}}><span className="studio-eyebrow">Motion surface</span><h3>Интерфейс должен ощущаться живым, но не мешать работать.</h3><p>Анимация объясняет переход между состояниями и добавляет качество. Она не должна становиться отдельным шоу.</p><button className="studio-button" onClick={()=>setModal(false)}><Check size={14}/> Понятно</button></motion.section></motion.div>}</AnimatePresence>
  </div>
}
