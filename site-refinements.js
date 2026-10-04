(() => {
  const titles={'/work':'Проекты BAEV - презентации, брендинг и события','/about':'Об агентстве BAEV - публичная коммуникация для бизнеса','/contact':'Обсудить проект - BAEV','/blog':'Журнал BAEV - презентации и публичная коммуникация'}
  function refine(){
    const path=location.pathname.replace(/\/$/,'')||'/'
    const title=titles[path]||document.title.replace(/FreeLab/g,'BAEV')
    if(document.title!==title)document.title=title
    document.querySelectorAll('meta[property="og:title"],meta[name="twitter:title"]').forEach(meta=>{if(meta.content!==title)meta.content=title})
    document.querySelectorAll('a').forEach(link=>{
      const text=link.textContent.trim()
      if(/^\+7\s*\(999\)\s*000[-\s]*00[-\s]*00$/.test(text)){link.hidden=true;link.style.display='none'}
      if(path!=='/'||!link.getAttribute('href')?.includes('/work/'))return
      const known=[['Haval Dealer Conference','linear-identity'],['Альфа Конфа','future-archive'],['Спортмастер','studio-atlas']].find(([name])=>text.includes(name))
      if(known&&link.getAttribute('href')!=='/work/'+known[1]){link.href='/work/'+known[1];link.dataset.baevProjectLink='true'}
    })
    if(path==='/blog'){document.querySelectorAll('h2').forEach(heading=>{if(/^\(\d+\)$/.test(heading.textContent.trim())&&heading.textContent!=='(3)')heading.textContent='(3)'})}
    if(path.startsWith('/blog/')){
      document.querySelectorAll('p').forEach(p=>{if(/^Ключевые запросы:/.test(p.textContent.trim()))p.remove()})
      document.querySelectorAll('p,h2,h3,h4,span').forEach(el=>{if(el.textContent.trim()==='Next Blog')el.textContent='Следующая статья'})
    }
  }
  // Each exported page has its own contact/content integration. Use full page navigation
  // so stale Framer route props cannot bypass the current HTML and page scripts.
  document.addEventListener('click',event=>{
    const link=event.target.closest?.('a[href]')
    if(!link||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||link.target&&link.target!=='_self')return
    const url=new URL(link.href,location.href)
    if(url.origin!==location.origin||url.pathname===location.pathname&&url.search===location.search)return
    event.preventDefault();event.stopImmediatePropagation();location.assign(url.href)
  },true)
  let scheduled=false
  const observer=new MutationObserver(()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;refine()})})
  const start=()=>{refine();observer.observe(document.documentElement,{subtree:true,childList:true,characterData:true})}
  if(document.readyState==='complete')start();else addEventListener('load',start,{once:true})
})()
