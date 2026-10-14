import * as THREE from '../faithful/vendor/three.module.js';
import {Reflector} from '../faithful/vendor/Reflector.js';

// The BAEV venue is modelled in 3D. All projection images are actual BAEV case assets.
const root=document.querySelector('[data-world="conference"]');
if(root){
  const canvas=root.querySelector('canvas');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const touch=matchMedia('(pointer: coarse)');
  const stops=[
    {label:'Вход',pos:[0,3.5,22],look:[0,4,-20]},
    {label:'Зал',pos:[0,4.1,10],look:[0,4.1,-22]},
    {label:'Сцена',pos:[1.8,3.4,-2.5],look:[0,5.7,-24]}
  ];
  const cases=[
    {title:'Авито Авто',note:'Высшая передача',path:'avito-auto-2024',image:'/front/media/baev-stage.jpg',color:'#10e59c'},
    {title:'Haval',note:'Dealer Conference',path:'linear-identity',image:'/front/media/linear-identity.jpg',color:'#96e8d9'},
    {title:'Альфа Конфа',note:'Для своих',path:'future-archive',image:'/front/media/future-archive.png',color:'#fc555b'}
  ];
  let renderer,scene,camera,clock,panel,poster,texture,ledLight,frame=0,ready=false,caseId=0,stop=0,from,started=0,duration=0;
  let worldVisible=true,dragging=false,lastX=0,lastY=0,rotX=0,targetRot=0;
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const ease=x=>1-Math.pow(1-clamp(x,0,1),4);
  const pose={pos:new THREE.Vector3(...stops[0].pos),look:new THREE.Vector3(...stops[0].look)};
  const ambientBars=[];
  const volumetrics=[];
  let to=stops[0];
  const cardName=document.getElementById('case-name'),cardNote=document.getElementById('case-type'),cardLink=document.getElementById('case-open');
  const create=(geometry,material,x,y,z)=>{
    const object=new THREE.Mesh(geometry,material);
    object.position.set(x,y,z);scene.add(object);return object;
  };
  const box=(w,h,d,m,x,y,z)=>create(new THREE.BoxGeometry(w,h,d),m,x,y,z);
  const basic=(color)=>new THREE.MeshBasicMaterial({color,toneMapped:false});
  const metal=(color,roughness=.48)=>new THREE.MeshStandardMaterial({color,metalness:.55,roughness});
  const bar=(w,h,d,x,y,z,color)=>{
    const object=box(w,h,d,basic(color),x,y,z);ambientBars.push(object);return object;
  };
  const rod=(a,b,r,material)=>{
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);
    const tube=create(new THREE.CylinderGeometry(r,r,start.distanceTo(end),6),material,...start.clone().add(end).multiplyScalar(.5).toArray());
    tube.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());
  };
  function graphic(text,color='#f5f9f6',bg='#0b2025'){
    const c=document.createElement('canvas');c.width=1024;c.height=512;
    const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='600 115px Arial,sans-serif';ctx.fillText(text,512,256,970);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
  }
  function build(){
    scene.background=new THREE.Color('#090e17');scene.fog=new THREE.FogExp2('#090e17',.009);
    scene.add(new THREE.HemisphereLight(0x9db5d0,0x080b11,2.2));
    const fill=new THREE.DirectionalLight(0xb6d5ef,2.4);fill.position.set(5,13,12);scene.add(fill);
    const atmosphere=new THREE.PointLight(0x85ffcc,30,43);atmosphere.position.set(1,9,-19);ledLight=atmosphere;scene.add(atmosphere);
    const warm=new THREE.PointLight(0xf5b7aa,10,25);warm.position.set(-12,9,-6);scene.add(warm);
    const steel=metal('#19222d'),concrete=metal('#252d38',.88),black=metal('#090e18',.32);
    const chairMat=metal('#25343e',.72),chairBack=metal('#33444d',.75);
    box(49,.25,84,concrete,0,-.3,-3);box(49,.2,84,black,0,14,-3);
    box(.6,17,80,concrete,-24,7,-5);box(.6,17,80,concrete,24,7,-5);
    box(49,17,.9,concrete,0,7,-28);
    // Long axial floor and 3D audience seating, with an unobstructed central aisle.
    box(46,.08,74,black,0,-.08,-4);
    for(const x of [-1.92,1.92])bar(.06,.04,43,x,-.02,4,0x7bdfc2);
    for(let row=0;row<10;row++)for(const side of [-1,1])for(let col=0;col<6;col++){
      const x=side*(3.3+col*2.55),z=-9.3+row*2.5;
      box(1.65,.22,1,chairMat,x,.52,z);
      box(1.65,1.12,.21,chairBack,x,1.09,z+.41);
    }
    // Real conference stage: elevated platform, illuminated runway and LED wings.
    box(28,.9,10,black,0,.36,-21.4);
    box(27,.09,9.6,metal('#778a89',.32),0,.86,-21.4);
    box(27,.07,9.5,black,0,.93,-21.4);
    bar(28,.095,.12,0,.82,-16.4,0x6cf2bc);
    box(4.4,.34,12,black,0,.2,-12);
    for(const x of [-2.15,2.15])bar(.07,.06,12,x,.4,-12,0x64e4ac);
    box(20.8,10.15,.43,steel,0,6.75,-26.25);
    for(const x of [-10.25,10.25])bar(.13,10,.15,x,6.75,-25.96,0x9affdd);
    bar(20.65,.1,.14,0,11.82,-25.93,0x9af8df);
    // Big slightly curved projection screen. Curvature bends TOWARD the audience.
    poster=document.createElement('canvas');poster.width=1920;poster.height=940;
    texture=new THREE.CanvasTexture(poster);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;
    const geometry=new THREE.PlaneGeometry(19.6,9.2,28,1);
    const positions=geometry.attributes.position;
    for(let i=0;i<positions.count;i++){
      const x=positions.getX(i);positions.setZ(i,.13*(x/9.8)**2);
    }
    geometry.computeVertexNormals();
    panel=create(geometry,new THREE.MeshBasicMaterial({map:texture,toneMapped:false,side:THREE.DoubleSide}),0,6.77,-25.95);
    // Two vertical, freestanding LED towers.
    const wings=[{x:-14.2,text:'BAEV / LIVE'},{x:14.2,text:'EVENT / LAB'}];
    wings.forEach(({x,text})=>{
      box(3.85,9.15,.27,steel,x,6.7,-24.6);
      const screen=create(new THREE.PlaneGeometry(3.58,8.8),new THREE.MeshBasicMaterial({
        map:graphic(text),toneMapped:false,side:THREE.DoubleSide
      }),x,6.7,-24.43);
      screen.rotation.y=(x<0?.11:-.11);
      for(const edge of [-1,1])bar(.065,9,.1,x+edge*1.94,6.7,-24.32,0x78e5bc);
    });
    // Physically shaped speaker lectern with projection insignia.
    box(1.4,.93,.9,metal('#d2dbd9',.45),-6.9,1.48,-19.0);
    box(1.72,.1,1,metal('#c8dbd6',.32),-6.9,2.02,-19);
    const label=create(new THREE.PlaneGeometry(1.2,.52),new THREE.MeshBasicMaterial({
      map:graphic('BAEV'),toneMapped:false
    }),-6.9,1.52,-18.5);
    // Flying trusses, light rig, hanging fixtures.
    for(const z of [20,12,4,-4,-12,-19,-24]){
      for(const y of [12.0,13.1])rod([-20,y,z],[20,y,z],.08,steel);
      for(let x=-20;x<19;x+=2.6){
        rod([x,12.0,z],[x+1.3,13.1,z],.05,steel);
        rod([x+1.3,13.1,z],[x+2.6,12,z],.05,steel);
      }
      bar(34,.07,.15,0,12.85,z,0x628d95);
      for(const x of [-16,-9,0,9,16]){
        box(.6,.6,.68,steel,x,11.5,z);
        bar(.4,.07,.34,x,11.16,z,0x8acacc);
      }
    }
    // Real theatrical light beams and animated haze, not decorative floating shapes.
    const tones=[0x88ffe3,0x92cafa,0xb0c2ff,0x7affe4,0xc6a8ff,0x6eddbf];
    for(let i=0;i<8;i++){
      const x=-14+i*4,z=i%2?-9.5:-15;
      const beam=create(new THREE.ConeGeometry(2.7,13,26,1,true),new THREE.MeshBasicMaterial({
        color:tones[i%tones.length],transparent:true,opacity:.046,depthWrite:false,
        side:THREE.DoubleSide,blending:THREE.AdditiveBlending
      }),x,5.2,z);
      beam.rotation.z=(i%2?-.1:.1);beam.userData.angle=beam.rotation.z;volumetrics.push(beam);
    }
    // High-level sightline portals define the actual travel through the hall.
    for(const z of [18,9]){
      for(const x of [-19,19]){
        box(.6,12,.6,steel,x,6,z);
        bar(.09,10,.12,x,6,z+.35,0x6bafae);
      }
      rod([-19,11.9,z],[19,11.9,z],.18,steel);
      bar(37,.10,.12,0,12.1,z+.1,0x76d2b6);
    }
    // Reflective auditorium floor on capable desktop devices.
    if(!touch.matches && innerWidth>=900){
      try{
        const mirror=new Reflector(new THREE.PlaneGeometry(46,77),{
          textureWidth:384,textureHeight:256,color:0x1a252d,clipBias:.005
        });
        mirror.position.set(0,-.01,-4);mirror.rotation.x=-Math.PI/2;scene.add(mirror);
      }catch{}
    }
  }
  const loaded=new Map();
  for(const entry of cases){
    const img=new Image();img.onload=()=>{loaded.set(entry.image,img);if(entry===cases[caseId])draw(entry)};
    img.src=entry.image;
  }
  function draw(entry){
    if(!poster)return;
    const c=poster.getContext('2d'),W=poster.width,H=poster.height;
    c.fillStyle='#0a1a20';c.fillRect(0,0,W,H);
    const image=loaded.get(entry.image);
    if(image){
      const scale=Math.max(W/image.width,H/image.height),w=image.width*scale,h=image.height*scale;
      c.drawImage(image,(W-w)/2,(H-h)/2,w,h);
    }
    const g=c.createLinearGradient(0,0,W,0);
    g.addColorStop(0,'rgba(1,9,15,.86)');g.addColorStop(.58,'rgba(1,9,15,.16)');g.addColorStop(1,'rgba(1,9,15,.07)');
    c.fillStyle=g;c.fillRect(0,0,W,H);
    c.strokeStyle=entry.color;c.lineWidth=8;c.strokeRect(18,18,W-36,H-36);
    c.fillStyle=entry.color;c.fillRect(90,134,92,7);
    c.fillStyle='#f7f9f5';c.font='500 30px Arial';c.fillText('BAEV® / EVENT DESIGN',95,98);
    c.font='700 128px Arial';c.fillText(entry.title,95,540,W-200);
    c.font='500 34px Arial';c.fillText(entry.note,98,612);
    c.font='500 27px Arial';c.fillText('STAGE CONTENT / REAL BAEV WORK',100,H-87);
    texture.needsUpdate=true;
  }
  function changeCase(index){
    caseId=(index+cases.length)%cases.length;
    const c=cases[caseId];if(cardName)cardName.textContent=c.title;
    if(cardNote)cardNote.textContent=c.note;
    if(cardLink)cardLink.href='/work/'+c.path;
    draw(c);
    if(ledLight)ledLight.color.set(c.color);
    root.style.setProperty('--conference-accent',c.color);
  }
  document.getElementById('case-prev')?.addEventListener('click',()=>changeCase(caseId-1));
  document.getElementById('case-next')?.addEventListener('click',()=>changeCase(caseId+1));
  function choose(index){
    index=clamp(index,0,2);
    from={pos:pose.pos.clone(),look:pose.look.clone()};
    stop=index;to=stops[index];started=performance.now();duration=reduce.matches?0:3000;
    root.classList.toggle('is-in-hall',index>0);root.classList.toggle('is-at-stage',index===2);
    document.querySelectorAll('[data-stop]').forEach(el=>{
      const active=Number(el.dataset.stop)===index;
      el.classList.toggle('is-active',active);el.setAttribute('aria-pressed',String(active));
    });
    const title=document.querySelector('#experience-scene-info strong');
    if(title)title.textContent=['Точка входа','Зрительный зал','Главная сцена'][index];
    const marker=document.querySelector('.experience-scene-info__index');
    if(marker)marker.textContent='0'+(index+1)+' / 03';
    document.getElementById('experience-progress')?.style.setProperty('transform','scaleX('+((index+1)/3)+')');
  }
  document.getElementById('tour-enter')?.addEventListener('click',()=>choose(1));
  document.querySelectorAll('[data-stop]').forEach(el=>el.addEventListener('click',()=>choose(Number(el.dataset.stop))));
  document.getElementById('enter')?.addEventListener('click',()=>setTimeout(()=>choose(1),500));
  document.getElementById('enter-muted')?.addEventListener('click',()=>setTimeout(()=>choose(1),500));
  try{if(sessionStorage.getItem('baev-immersive-entered'))setTimeout(()=>choose(1),700)}catch{}
  function resize(){
    if(!renderer)return;
    const w=Math.max(1,root.clientWidth),h=Math.max(1,root.clientHeight);
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  }
  function render(){
    if(!worldVisible)return;
    const elapsed=clock.getElapsedTime();
    const t=duration?ease((performance.now()-started)/duration):1;
    pose.pos.copy(from.pos).lerp(new THREE.Vector3(...to.pos),t);
    pose.look.copy(from.look).lerp(new THREE.Vector3(...to.look),t);
    rotX+=(targetRot-rotX)*.055;
    camera.position.copy(pose.pos);camera.position.x+=rotX*1.6;
    camera.lookAt(pose.look.clone().add(new THREE.Vector3(rotX*2,0,0)));
    camera.fov=innerWidth<700?67:55;camera.updateProjectionMatrix();
    volumetrics.forEach((v,i)=>{
      v.rotation.z=v.userData.angle+Math.sin(elapsed*.28+i)*.028;
      v.material.opacity=.042+Math.sin(elapsed*.45+i)*.008;
    });
    renderer.render(scene,camera);
  }
  try{
    renderer=new THREE.WebGLRenderer({canvas,antialias:!touch.matches,powerPreference:touch.matches?'low-power':'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,touch.matches?1.1:1.5));
    renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.55;
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(55,1,.1,160);
    clock=new THREE.Clock();build();resize();changeCase(0);
    root.classList.add('is-rendered');ready=true;
    renderer.setAnimationLoop(render);
  }catch(err){
    root.classList.add('is-fallback');console.warn('Conference WebGL fallback',err);
  }
  let lx=0;
  canvas.addEventListener('pointerdown',e=>{
    if(e.button!==0||reduce.matches)return;
    dragging=true;lx=e.clientX;lastY=e.clientY;
    try{canvas.setPointerCapture(e.pointerId)}catch{}
  });
  canvas.addEventListener('pointermove',e=>{
    if(dragging){
      targetRot=clamp(targetRot+(e.clientX-lx)*.003,-.5,.5);lx=e.clientX;lastY=e.clientY;
    }else if(!touch.matches&&!reduce.matches){
      const r=canvas.getBoundingClientRect();
      targetRot=((e.clientX-r.left)/r.width-.5)*.28;
    }
  },{passive:true});
  canvas.addEventListener('pointerup',()=>dragging=false);
  canvas.addEventListener('pointercancel',()=>dragging=false);
  canvas.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'||e.key==='ArrowDown')choose(stop+1);
    else if(e.key==='ArrowLeft'||e.key==='ArrowUp')choose(stop-1);
    else if(e.key==='Home')choose(0);
    else if(e.key==='End')choose(2);
    else return;
    e.preventDefault();
  });
  let lastWheel=0;
  root.addEventListener('wheel',e=>{
    if(reduce.matches||e.target.closest('button,a')||Math.abs(e.deltaY)<28)return;
    const dir=Math.sign(e.deltaY);
    if((dir>0&&stop===2)||(dir<0&&stop===0))return;
    e.preventDefault();
    if(performance.now()-lastWheel<1100)return;
    lastWheel=performance.now();choose(stop+dir);
  },{passive:false});
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>{worldVisible=!document.hidden;if(worldVisible)clock.getDelta()});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{
    worldVisible=entries.some(e=>e.isIntersecting)&&!document.hidden;
    if(worldVisible)clock.getDelta();
  },{threshold:.01}).observe(root);
}