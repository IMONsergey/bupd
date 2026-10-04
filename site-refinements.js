(() => {
  const path=location.pathname.replace(/\/$/,'')||'/'
  const titles={'/work':'Проекты BAEV - презентации, брендинг и события','/about':'Об агентстве BAEV - публичная коммуникация для бизнеса','/contact':'Обсудить проект - BAEV','/blog':'Журнал BAEV - презентации и публичная коммуникация'}
  function refine(){
    document.title=titles[path]||document.title.replace(/FreeLab/g,'BAEV')
    document.querySelectorAll('meta[property="og:title"],meta[name="twitter:title"]').forEach(meta=>meta.content=document.title)
    document.querySelectorAll('a').forEach(link=>{
      const text=link.textContent.trim()
      if(/^\+7\s*\(999\)\s*000[-\s]*00[-\s]*00$/.test(text)){link.hidden=true;link.style.display='none'}
      if(path!=='/'||!link.getAttribute('href')?.includes('/work/'))return
      const known=[['Haval Dealer Conference','linear-identity'],['Альфа Конфа','future-archive'],['Спортмастер','studio-atlas']].find(([name])=>text.includes(name))
      if(known){link.href='/work/'+known[1];link.dataset.baevProjectLink='true'}
    })
    if(path==='/blog'){document.querySelectorAll('h2').forEach(heading=>{if(/^\(\d+\)$/.test(heading.textContent.trim()))heading.textContent='(3)'})}
    if(path.startsWith('/blog/')){
      document.querySelectorAll('p').forEach(p=>{if(/^Ключевые запросы:/.test(p.textContent.trim()))p.remove()})
      document.querySelectorAll('p,h2,h3,h4,span').forEach(el=>{if(el.textContent.trim()==='Next Blog')el.textContent='Следующая статья'})
    }
  }
  // The exported Framer router retains old target props. Corrected project links use full navigation.
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[data-baev-project-link]')
    if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return
    event.preventDefault();event.stopImmediatePropagation();location.assign(link.href)
  },true)
  if(document.readyState==='complete')refine();else addEventListener('load',refine,{once:true})
})()
