import * as THREE from './vendor/three.module.js';

const gate=document.getElementById('unseen-gate'),enter=document.getElementById('unseen-enter'),skip=document.getElementById('unseen-skip');
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.body.classList.add('unseen-locked');
function openWorld(quiet=false){
 gate.classList.add('is-leaving');
 gate.setAttribute('aria-hidden','true');
 document.body.classList.remove('unseen-locked');
 if(quiet) document.documentElement.style.scrollBehavior='auto';
 setTimeout(()=>{gate.hidden=true;document.querySelector('.site-logo')?.focus({preventScroll:true})},reduce?0:1050);
}
enter?.addEventListener('click',()=>openWorld(false));
skip?.addEventListener('click',()=>openWorld(true));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('unseen-locked'))openWorld(true)});
if(reduce) openWorld(true);

const canvas=document.getElementById('unseen-canvas');
if(canvas && !reduce){
  try{
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.55;
    const scene=new THREE.Scene();scene.background=new THREE.Color('#d3b4b3');
    scene.fog=new THREE.FogExp2('#d3b4b3',.011);
    const camera=new THREE.PerspectiveCamera(39,1,.1,150);
    const cameraOrigin=new THREE.Vector3(0,5.1,19.7);
    camera.position.copy(cameraOrigin);camera.lookAt(0,2.4,0);
    const hemisphere=new THREE.HemisphereLight(0xffe8de,0x76676f,3.2);scene.add(hemisphere);
    const sun=new THREE.DirectionalLight(0xffd8bd,4.7);sun.position.set(4,12,7);scene.add(sun);
    const warm=new THREE.PointLight(0xffcaac,80,30);warm.position.set(-5,5,-1);scene.add(warm);
    const mat=(color,rough=.88,metal=0)=>new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,side:THREE.DoubleSide});
    const plaster=mat('#e6bcb7');const shadowPlaster=mat('#c99d9d');const ivory=mat('#f3d9d2');const stairMat=mat('#edcac2');
    const granite=mat('#bca09e',.95);
    const palace=new THREE.Group();scene.add(palace);
    function box(x,y,z,w,h,d,m=plaster){
      let mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
      mesh.position.set(x,y,z);mesh.castShadow=false;mesh.receiveShadow=true;palace.add(mesh);return mesh;
    }
    // Monolithic architectural gallery: back wall, side wings, tiled floor and recessed portals.
    box(-8.5,4.0,-5.4,6.2,11,1,plaster);
    box(1.1,8.2,-5.4,11,2.8,1,plaster);
    box(1.1,.8,-5.4,11,1.9,1,plaster);
    box(-9,3,-3.9,1.5,9,4,plaster);
    box(10,3,-3.9,1.4,9,4,shadowPlaster);
    box(0,-.42,0,25,.5,24,shadowPlaster);
    // Arch silhouettes are actual architectural openings, not a painted picture.
    function archPanel(x,width,height,z){
      const shape=new THREE.Shape();
      shape.moveTo(-width/2,0);shape.lineTo(-width/2,height);shape.lineTo(width/2,height);shape.lineTo(width/2,0);shape.closePath();
      const hole=new THREE.Path(),r=width*.32,cy=height*.56;
      hole.moveTo(-r,-1);hole.lineTo(-r,cy);hole.absarc(0,cy,r,Math.PI,0,true);
      hole.lineTo(r,-1);hole.closePath();shape.holes.push(hole);
      const geo=new THREE.ExtrudeGeometry(shape,{depth:.5,bevelEnabled:false,curveSegments:32});
      const mesh=new THREE.Mesh(geo,plaster);mesh.position.set(x,.3,z);palace.add(mesh);
      const glow=new THREE.Mesh(new THREE.PlaneGeometry(r*2,cy+r+1),new THREE.MeshBasicMaterial({color:'#bfbed6',side:THREE.DoubleSide}));
      glow.position.set(x,cy*.5+.9,z-.35);palace.add(glow);
    }
    // Left-side deep arched gallery
    archPanel(-6.0,5.0,9,-4.1);
    archPanel(-1.1,3.2,9,-4.0);
    const portal=mat('#d8d3eb');box(6.2,5.3,-5.0,2.2,7.3,.13,portal);
    box(6.2,9.3,-4.2,3.05,.8,.9,plaster);
    box(5.05,5.0,-4.1,.67,8.4,1,plaster);
    box(7.35,5.0,-4.1,.67,8.4,1,plaster);
    // Spatial staircase, ascending toward the brighter rear gallery.
    for(let i=0;i<9;i++){
      const d=6-i*.52;box(.4, .16+i*.185, -1.5-i*.42, 6.1-i*.22,.3,d,stairMat);
    }
    box(.35,1.8,-5.5,4.35,.5,1.2,ivory);
    // Water: slow waves and rippling reflections, deliberately subtle.
    const waterGeo=new THREE.PlaneGeometry(70,70,140,140);waterGeo.rotateX(-Math.PI/2);
    const waterMaterial=new THREE.ShaderMaterial({
      uniforms:{time:{value:0},tint:{value:new THREE.Color('#a2a1bb')}},
      vertexShader:`uniform float time;varying vec3 vPos;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.y+=sin(p.x*1.2+time*.6)*.062+cos(p.z*1.7+time*.52)*.058+sin((p.x+p.z)*2.3+time*.95)*.022;vPos=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
      fragmentShader:`uniform float time;uniform vec3 tint;varying vec3 vPos;varying vec2 vUv;void main(){float a=sin(vPos.x*3.4+time*.9)*sin(vPos.z*3.8-time*.68);float w=sin(vPos.x*7.1+vPos.z*5.6+time*.7);float reflections=smoothstep(.5,1.,a*.35+w*.35+.5);vec3 col=mix(tint,vec3(.92,.78,.76),.24+reflections*.24);col+=vec3(.026,.021,.03)*pow(max(0.,sin(vPos.x*2.4+vPos.z*3.1+time)),16.);gl_FragColor=vec4(col,.94);}`,
      transparent:true,side:THREE.DoubleSide,depthWrite:false
    });
    const water=new THREE.Mesh(waterGeo,waterMaterial);water.position.y=.12;scene.add(water);
    function sphere(x,y,z,r,m){let mesh=new THREE.Mesh(new THREE.SphereGeometry(r,48,32),m);mesh.position.set(x,y,z);scene.add(mesh);return mesh}
    sphere(3,.53,3.7,.9,granite);
    const pearl=new THREE.MeshPhysicalMaterial({color:'#f8dfd8',metalness:.6,roughness:.18,clearcoat:1,clearcoatRoughness:.16,iridescence:1,iridescenceIOR:1.33,iridescenceThicknessRange:[140,520]});
    const orb=sphere(3.8,4.6,-2.4,.89,pearl);
    sphere(-7,.1,7.2,2.1,mat('#d8b2aa'));
    // Fine atmospheric points (not a stock video overlay).
    const particlePositions=new Float32Array(150*3);
    for(let i=0;i<150;i++){particlePositions[i*3]=(Math.sin(i*127.1)*43758.5453%1)*27;particlePositions[i*3+1]=1+(i*37%100)/10;particlePositions[i*3+2]=-4+(Math.cos(i*78.5)*12312.1%1)*14}
    const pointsGeometry=new THREE.BufferGeometry();pointsGeometry.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));
    scene.add(new THREE.Points(pointsGeometry,new THREE.PointsMaterial({size:.018,color:0xffffff,transparent:true,opacity:.4})));
    let targetX=0,targetY=0,pointerX=0,pointerY=0,dragging=false,lastX=0;
    const stage=document.querySelector('.unseen-stage');
    stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointerX=(e.clientX/r.width-.5);pointerY=(e.clientY/r.height-.5);if(dragging){targetX=Math.max(-.8,Math.min(.8,targetX+(e.clientX-lastX)*.003));lastX=e.clientX}},{passive:true});
    stage.addEventListener('pointerdown',e=>{if(e.target.closest('a,button'))return;dragging=true;lastX=e.clientX});
    window.addEventListener('pointerup',()=>dragging=false);
    const clock=new THREE.Clock();
    function resize(){const w=stage.clientWidth,h=stage.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w<700?52:39;camera.updateProjectionMatrix()}
    new ResizeObserver(resize).observe(stage);resize();
    let tick=0,paused=false;
    document.addEventListener('visibilitychange',()=>{paused=document.hidden});
    function animate(){
      requestAnimationFrame(animate);
      if(paused||document.body.classList.contains('unseen-locked'))return;
      const t=clock.getElapsedTime();waterMaterial.uniforms.time.value=t;orb.position.y=4.6+Math.sin(t*.55)*.15;
      targetX+=(pointerX*.5-targetX)*.009;
      camera.position.x+=(cameraOrigin.x+targetX*1.2-camera.position.x)*.026;
      camera.position.y+=(cameraOrigin.y-pointerY*.55-camera.position.y)*.026;
      camera.lookAt(0,2.5,-1);
      renderer.render(scene,camera);tick++;
    }
    animate();
  }catch(err){console.warn('BAEV 3D unavailable; fallback remains visible.',err)}
}
