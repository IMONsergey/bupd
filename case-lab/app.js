const IMG = {
  hero: 'https://framerusercontent.com/images/hcbL0ljxHd8FCixzynoW8sZo0c.jpg?width=2616&height=1717',
  a: 'https://framerusercontent.com/images/0QiA6QpV4cUmfqp7z6tTGeKnNaA.png?width=2400&height=2045',
  b: 'https://framerusercontent.com/images/kmlwbvJjwpPh0TfzxbzGEphPLSo.png?width=2400&height=1601',
  c: 'https://framerusercontent.com/images/hwBVZD7yLoZrEKjvrurUxLohQ.png?width=2400&height=1601',
  d: 'https://framerusercontent.com/images/4uNnl0GLQmUPINmiLWwLMclzFA.png?width=2400&height=1601',
  e: 'https://framerusercontent.com/images/3UX6jbJVL5Ln3RR6DAi2LcdhjlE.png?width=1920&height=1080',
  f: 'https://framerusercontent.com/images/eIScR9KgzgQWGwbH8oUcy4QCpo.png?width=1920&height=1080',
  g: 'https://framerusercontent.com/images/8LOx1gZHum2GuI4eATsEE4NCZwc.png?width=1920&height=1080',
}

const fallback = {
  title: 'Авито Авто — Высшая передача',
  client: 'Авито',
  year: '2024',
  categories: 'Презентация, Брендинг',
  summary: 'Кейс как последовательность режиссируемых сцен, а не длинная CMS-лента. Каждый блок имеет собственную роль и несколько режимов.',
  blocks: [
    { type:'caseHero', label:'Case hero' },
    { type:'manifesto', label:'Manifesto', text:'Не складываем картинки в кейс. Собираем историю, где каждый экран меняет темп, масштаб или способ чтения.' },
    { type:'fullBleedMedia', label:'Full-bleed media', media:IMG.a },
    { type:'splitMedia', label:'Split media', left:IMG.b, right:IMG.c },
    { type:'stickyStory', label:'Sticky narrative', frames:[IMG.d,IMG.e], title:'Смысл держим на месте. Визуальный материал движется вокруг него.', body:'Sticky-сцена подходит для сложных этапов проекта: логика остаётся читаемой, а справа меняются артефакты, версии и детали.' },
    { type:'metrics', label:'Metrics / outcomes', items:[['71%','MAP 2024','рост доли'],['1 200+','участников','в одном пространстве'],['42','экрана','единая визуальная система']] },
    { type:'mediaMosaic', label:'Media mosaic', items:[IMG.e,IMG.f,IMG.g] },
    { type:'beforeAfter', label:'Before / after', before:IMG.b, after:IMG.d },
    { type:'quote', label:'Quote / insight', text:'Сильный кейс — это не архив проекта. Это самостоятельное произведение с драматургией.', author:'BAEV / case system principle' },
    { type:'process', label:'Process / chapters', steps:[['01','Разобрать','Отделяем задачу, ограничения и контекст от декоративных деталей.'],['02','Собрать','Выстраиваем сценарий кейса и выбираем нужные типы блоков.'],['03','Режиссировать','Меняем ритм: текст, full-bleed, sticky, галерея, данные.'],['04','Опубликовать','CMS хранит данные; фронт отвечает только за качество показа.']] },
    { type:'gallery', label:'Interactive gallery', items:[IMG.a,IMG.c,IMG.e,IMG.f] },
    { type:'deviceShowcase', label:'Device / artifact', media:IMG.g },
    { type:'credits', label:'Credits', items:[['Стратегия','BAEV'],['Арт-дирекшн','BAEV'],['Дизайн','Команда проекта'],['Development','BAEV / CMS runtime']] },
    { type:'nextProject', label:'Next project', title:'Haval Dealer Conference' },
  ],
}

async function getCase(){
  const params=new URLSearchParams(location.search)
  const cms=params.get('cms')
  if(!cms) return fallback
  try{
    const url=new URL('/api/projects',cms)
    url.searchParams.set('where[slug][equals]',params.get('slug')||'avito-auto-2024')
    url.searchParams.set('depth','2')
    const r=await fetch(url)
    if(!r.ok) throw new Error('CMS '+r.status)
    const data=await r.json()
    return data.docs?.[0] || fallback
  }catch(e){
    console.warn('Payload unavailable, using demo dataset',e)
    return fallback
  }
}

const label = (n,t) => `<div class="section-label">${String(n).padStart(2,'0')} / ${t}</div>`
const section = (n,b,html,cls='') => `<section id="block-${n}" data-block="${b.label}" class="case-section ${cls}">${label(n,b.label)}${html}</section>`

function renderBlock(b,n,project){
  switch(b.type || b.blockType){
    case 'caseHero':
      return section(n,b,`<div class="case-hero"><aside class="hero-meta"><div><h1>${project.title}</h1></div><div><p class="hero-copy">${project.summary||fallback.summary}</p><div class="meta-table"><div class="meta-row"><span>Категории</span><span>${project.categories||fallback.categories}</span></div><div class="meta-row"><span>Клиент</span><span>${project.client||fallback.client}</span></div><div class="meta-row"><span>Год</span><span>${project.year||fallback.year}</span></div></div></div></aside><div class="hero-media"><img src="${IMG.hero}" alt=""></div></div>`)
    case 'manifesto':
      return section(n,b,`<div class="manifesto"><p>${b.text}</p></div>`)
    case 'fullBleedMedia':
      return section(n,b,`<div class="full-media"><img src="${b.media||IMG.a}" alt=""></div>`)
    case 'splitMedia':
      return section(n,b,`<div class="split"><figure><img src="${b.left||IMG.b}" alt=""></figure><figure><img src="${b.right||IMG.c}" alt=""></figure></div>`)
    case 'stickyStory':
      return section(n,b,`<div class="sticky-story"><div class="sticky-copy"><small>06 / narrative</small><h2>${b.title}</h2><p>${b.body}</p></div><div class="sticky-frames">${(b.frames||[]).map(x=>`<figure><img src="${typeof x==='string'?x:x.media?.url||IMG.d}" alt=""></figure>`).join('')}</div></div>`)
    case 'metrics':
      return section(n,b,`<div class="metrics"><div class="metrics-head"><span>Результат</span><span>Outcome layer</span></div><div class="metrics-grid">${(b.items||[]).map(x=>{const v=Array.isArray(x)?x:[x.value,x.label,x.note];return `<div class="metric"><div class="metric-value">${v[0]}</div><div class="metric-label">${v[1]}</div><div class="metric-note">${v[2]||''}</div></div>`}).join('')}</div></div>`)
    case 'mediaMosaic':
      return section(n,b,`<div class="mosaic">${(b.items||[]).slice(0,3).map(x=>`<figure><img src="${typeof x==='string'?x:x.media?.url||IMG.e}" alt=""></figure>`).join('')}</div>`)
    case 'beforeAfter':
      return section(n,b,`<div class="before-after" style="--split:50%"><div class="ba-layer"><img src="${b.before||IMG.b}" alt=""></div><div class="ba-layer after"><img src="${b.after||IMG.d}" alt=""></div><input class="ba-range" type="range" min="5" max="95" value="50" aria-label="До и после"><div class="ba-line"></div></div>`)
    case 'quote':
      return section(n,b,`<div class="quote"><blockquote>“${b.text}”<cite>${b.author||''}</cite></blockquote></div>`)
    case 'process':
      return section(n,b,`<div class="process"><h2>Как собирается кейс</h2><div class="process-grid">${(b.steps||[]).map(s=>`<article class="process-card"><div class="process-num">${s[0]||s.number}</div><h3>${s[1]||s.title}</h3><p>${s[2]||s.body||''}</p></article>`).join('')}</div></div>`)
    case 'gallery':
      return section(n,b,`<div class="gallery"><div class="gallery-track">${(b.items||[]).map(x=>`<div class="gallery-card"><img src="${typeof x==='string'?x:x.media?.url||IMG.a}" alt=""></div>`).join('')}</div></div>`)
    case 'deviceShowcase':
      return section(n,b,`<div class="device-stage"><div class="browser"><img src="${b.media||IMG.g}" alt=""></div></div>`)
    case 'credits':
      return section(n,b,`<div class="credits"><h2>Команда</h2><div class="credit-list">${(b.items||[]).map(x=>`<div class="credit-row"><span>${x[0]||x.role}</span><span>${x[1]||x.name}</span></div>`).join('')}</div></div>`)
    case 'nextProject':
      return section(n,b,`<div class="next-project"><small>Следующий проект</small><h2>${b.title||'Next project'}</h2></div>`)
    default:return ''
  }
}

function wireUI(blocks){
  const panel=document.querySelector('#block-panel')
  const nav=document.querySelector('#block-nav')
  nav.innerHTML=blocks.map((b,i)=>`<a href="#block-${i+1}" data-target="block-${i+1}"><span>${String(i+1).padStart(2,'0')}</span><span>${b.label||b.blockType}</span></a>`).join('')
  const toggle=()=>{panel.classList.toggle('is-hidden');document.querySelector('.blocks-toggle').setAttribute('aria-expanded',String(!panel.classList.contains('is-hidden')))}
  document.querySelector('.blocks-toggle').onclick=toggle
  addEventListener('keydown',e=>{if(e.key.toLowerCase()==='b'&&!/input|textarea/i.test(e.target.tagName))toggle()})
  document.querySelectorAll('.ba-range').forEach(r=>r.addEventListener('input',e=>e.currentTarget.parentElement.style.setProperty('--split',e.currentTarget.value+'%')))
  const links=[...nav.querySelectorAll('a')]
  const obs=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){links.forEach(a=>a.classList.toggle('is-active',a.dataset.target===e.target.id))}},{rootMargin:'-35% 0px -55% 0px'})
  document.querySelectorAll('[data-block]').forEach(s=>obs.observe(s))
}

const project=await getCase()
const blocks=(project.blocks?.length?project.blocks:fallback.blocks).map(b=>({...b,label:b.label||b.blockType}))
document.querySelector('#case-root').innerHTML=blocks.map((b,i)=>renderBlock(b,i+1,project)).join('')
wireUI(blocks)

