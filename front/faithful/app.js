/* BAEV concept navigation, entry sequence, portfolio filtering, CRM-preserving markup. */
(() => {
  'use strict';
  document.documentElement.classList.remove('js-pending');
  const intro=document.getElementById('intro');
  const body=document.body;
  const main=document.getElementById('main');
  const header=document.getElementById('header');
  const toggle=document.getElementById('menu-toggle');
  const menu=document.getElementById('menu');
  const controls=document.getElementById('scene-controls');
  const scene=document.querySelector('[data-world]');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let audioContext,source,lowpass,volume,drone;
  let soundEnabled=false;
  const safeStorage=(action)=>{
    try{return action()}catch(_){return null}
  };
  function audioOn(){
    if(soundEnabled)return;
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio)return;
    try{
      audioContext=audioContext||new Audio();
      if(audioContext.state==='suspended')audioContext.resume();
      volume=audioContext.createGain();volume.gain.setValueAtTime(0,audioContext.currentTime);
      volume.gain.linearRampToValueAtTime(.025,audioContext.currentTime+1.8);
      volume.connect(audioContext.destination);
      lowpass=audioContext.createBiquadFilter();lowpass.type='lowpass';
      lowpass.frequency.value=330;lowpass.connect(volume);
      const rate=audioContext.sampleRate;
      const buffer=audioContext.createBuffer(1,rate*3,rate);
      const data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*.42;
      source=audioContext.createBufferSource();source.buffer=buffer;source.loop=true;
      source.connect(lowpass);source.start();
      drone=audioContext.createOscillator();drone.type='sine';drone.frequency.value=72;
      const droneGain=audioContext.createGain();droneGain.gain.value=.10;
      drone.connect(droneGain);droneGain.connect(lowpass);drone.start();
      soundEnabled=true;
    }catch(e){soundEnabled=false;console.warn('Sound unavailable',e)}
    syncSoundButton();
  }
  function audioOff(){
    if(!soundEnabled)return;
    if(volume&&audioContext){
      volume.gain.cancelScheduledValues(audioContext.currentTime);
      volume.gain.setTargetAtTime(0,audioContext.currentTime,.12);
    }
    const currentSource=source,currentDrone=drone;
    setTimeout(()=>{
      try{currentSource?.stop();currentDrone?.stop()}catch(_){}
    },500);
    source=null;drone=null;soundEnabled=false;syncSoundButton();
  }
  function syncSoundButton(){
    const b=document.getElementById('sound-toggle');
    if(!b)return;
    b.setAttribute('aria-pressed',String(soundEnabled));
    b.setAttribute('aria-label',soundEnabled?'Выключить звук':'Включить звук');
    b.innerHTML=soundEnabled?'<span aria-hidden="true">▥</span>':'<span aria-hidden="true">◖▏</span>';
  }
  document.getElementById('sound-toggle')?.addEventListener('click',()=>{
    if(soundEnabled)audioOff();else audioOn();
  });
  let closed=false;
  function enter(muted=false){
    if(!intro||closed)return;
    closed=true;
    if(!muted&&!reduced.matches)audioOn();
    intro.classList.add('is-leaving');
    main.inert=false;
    header.inert=false;
    body.classList.remove('intro-open');
    safeStorage(()=>sessionStorage.setItem('baev-immersive-entered','yes'));
    const finish=()=>{intro.hidden=true;intro.inert=true};
    if(reduced.matches)finish();else setTimeout(finish,980);
    setTimeout(()=>document.querySelector('.world__cta')?.focus({preventScroll:true}),300);
  }
  if(intro){
    const known=safeStorage(()=>sessionStorage.getItem('baev-immersive-entered'));
    if(known==='yes'){
      intro.hidden=true;intro.inert=true;closed=true;
    }else{
      body.classList.add('intro-open');
      main.inert=true;header.inert=true;
      document.getElementById('enter')?.focus({preventScroll:true});
    }
    document.getElementById('enter')?.addEventListener('click',()=>enter(false));
    document.getElementById('enter-muted')?.addEventListener('click',()=>enter(true));
  }
  function setMenu(open){
    if(!toggle||!menu)return;
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню');
    menu.hidden=!open;menu.inert=!open;
    body.classList.toggle('menu-open',open);
    if(open)menu.querySelector('a')?.focus({preventScroll:true});
    else toggle.focus({preventScroll:true});
  }
  toggle?.addEventListener('click',()=>setMenu(toggle.getAttribute('aria-expanded')!=='true'));
  menu?.addEventListener('click',e=>{if(e.target.closest('a'))setMenu(false)});
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true')setMenu(false);
    if(e.key!=='Tab'||toggle?.getAttribute('aria-expanded')!=='true')return;
    const focusables=[toggle,...menu.querySelectorAll('a[href]')];
    const index=focusables.indexOf(document.activeElement);
    if(e.shiftKey&&index===0){e.preventDefault();focusables.at(-1).focus()}
    else if(!e.shiftKey&&index===focusables.length-1){e.preventDefault();focusables[0].focus()}
  });
  function updateHeader(){
    header?.classList.toggle('is-scrolled',scrollY>60);
    if(controls&&scene){
      const bottom=scene.getBoundingClientRect().bottom;
      controls.classList.toggle('is-hidden',bottom<window.innerHeight*.32);
    }
  }
  addEventListener('scroll',updateHeader,{passive:true});
  addEventListener('resize',updateHeader,{passive:true});
  updateHeader();
  const filters=[...document.querySelectorAll('[data-filter]')];
  const projectGrid=document.getElementById('projects-grid');
  function applyFilter(name){
    if(!projectGrid)return;
    let visible=0;
    const cards=[...projectGrid.querySelectorAll('.project-card')];
    for(const card of cards){
      const match=name==='all'||card.dataset.category?.split(' ').includes(name);
      card.hidden=!match;
      if(match)visible++;
    }
    filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.filter===name)));
    document.getElementById('projects-empty')?.toggleAttribute('hidden',visible!==0);
    const total=document.querySelector('[data-filter="all"] small');
    if(total)total.textContent=String(cards.length).padStart(2,'0');
  }
  filters.forEach(button=>button.addEventListener('click',()=>applyFilter(button.dataset.filter)));
  applyFilter('all');
  const CMS='https://baev-cms.vercel.app';
  async function syncPublishedProjects(){
    if(!projectGrid)return;
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),5500);
    try{
      const response=await fetch(CMS+'/api/baev/projects',{signal:controller.signal,cache:'no-store'});
      if(!response.ok)return;
      const payload=await response.json();
      if(!Array.isArray(payload.docs))return;
      const published=new Map(payload.docs.map(item=>[item.slug,item]));
      // Only enrich existing, verified local cases. New data cannot accidentally show another client's image.
      for(const card of projectGrid.querySelectorAll('.project-card')){
        const item=published.get(card.dataset.slug);
        if(!item)continue;
        const title=card.querySelector('.project-card__meta strong');
        if(title&&typeof item.title==='string')title.textContent=item.title;
        if(typeof item.cover==='string'&&item.cover.startsWith('https://')){
          const img=card.querySelector('img');
          if(img&&img.src!==item.cover)img.src=item.cover;
        }
      }
    }catch(_){/* Local work stays visible without CMS. */}
    finally{clearTimeout(timeout)}
  }
  syncPublishedProjects();
})();
