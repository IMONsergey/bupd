(() => {
  const CMS='https://baev-cms.vercel.app'
  async function refreshProjects(){
    const grid=document.querySelector('.framer-vfpnmw')
    if(!grid)return
    try {
      const response=await fetch(CMS+'/api/baev/projects',{cache:'no-store'})
      if(!response.ok)return
      const {docs}=await response.json()
      if(!Array.isArray(docs))return
      const template=grid.querySelector('a.framer-m7m9in')
      if(!template)return
      const cards=docs.map(project=>{
        const card=template.cloneNode(true)
        card.href='/work/'+encodeURIComponent(project.slug)
        card.setAttribute('aria-label',project.title)
        card.querySelectorAll('img').forEach(image=>{
          image.removeAttribute('srcset');image.removeAttribute('sizes')
          image.src=project.cover||'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="960" height="720"%3E%3Crect width="960" height="720" fill="%23202020"/%3E%3C/svg%3E'
          image.alt=project.alt||project.title
          image.loading='lazy'
        })
        card.querySelectorAll('.framer-1olvnrf p').forEach(p=>p.textContent=project.title)
        card.querySelectorAll('.framer-18h1pl2 p').forEach(p=>p.textContent=project.categories.join(', '))
        card.querySelectorAll('[style]').forEach(element=>{
          if(element.style.opacity==='0')element.style.opacity='1'
          if(element.style.transform.includes('translateY'))element.style.transform='none'
        })
        card.querySelectorAll('[id]').forEach(element=>element.removeAttribute('id'))
        card.classList.add('baev-live-project')
        return card
      })
      grid.replaceChildren(...cards)
      const style=document.createElement('style')
      style.textContent='.baev-live-project img{transition:transform .5s cubic-bezier(.22,1,.36,1)}.baev-live-project:hover img{transform:scale(1.02)}.baev-live-project:focus-visible{outline:2px solid white;outline-offset:4px}@media(prefers-reduced-motion:reduce){.baev-live-project img{transition:none}}'
      document.head.append(style)
    } catch { /* Preserve the checked-in source layout when the CMS is unavailable. */ }
  }
  // Framer hydrates the source document first; CMS records then populate its original card layout.
  async function refreshContacts(){
    try {
      const response=await fetch(CMS+'/api/globals/site-settings',{cache:'no-store'})
      if(!response.ok)return
      const settings=await response.json()
      if(settings.email)document.querySelectorAll('a[href^="mailto:"]').forEach(link=>{
        link.href='mailto:'+settings.email
        if(link.textContent.includes('@'))(link.querySelector('p')||link).textContent=settings.email
      })
      if(settings.phone)document.querySelectorAll('a').forEach(link=>{
        if(/^\+\d[\d()\-\s]+$/.test(link.textContent.trim())){
          link.href='tel:'+settings.phone.replace(/[^\d+]/g,'')
          ;(link.querySelector('p')||link).textContent=settings.phone
        }
      })
      if(settings.defaultDescription)document.querySelector('meta[name="description"]')?.setAttribute('content',settings.defaultDescription)
    } catch { /* Existing source contacts remain available offline. */ }
  }
  function refresh(){refreshProjects();refreshContacts()}
  if(document.readyState==='complete')refresh()
  else window.addEventListener('load',refresh,{once:true})
})()
