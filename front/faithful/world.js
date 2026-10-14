import * as THREE from './vendor/three.module.js';
import { Reflector } from './vendor/Reflector.js';

const root = document.querySelector('[data-world]');
if (root) {
  const canvas = root.querySelector('canvas');
  const mode = root.dataset.world;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(pointer: coarse)');
  let renderer, scene, camera, clock, mirror, wave, sphere;
  let visible = true;
  const state = {yaw:0, pitch:0, targetYaw:0, targetPitch:0, dragging:false, x:0, y:0};
  const clamp = (n,a,b) => Math.max(a,Math.min(n,b));
  const loader = new THREE.TextureLoader();
  const tex = (name,x=1,y=1) => {
    const map=loader.load('/front/faithful/textures/'+name);
    map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;
    map.repeat.set(x,y);return map;
  };
  const plaster = new THREE.MeshStandardMaterial({
    color:0xffe6df,map:tex('plaster.jpg',2,2),roughness:.96,side:THREE.DoubleSide
  });
  const wall = new THREE.MeshStandardMaterial({
    color:0xf7e0d8,map:tex('plaster.jpg',2,1),roughness:1,side:THREE.DoubleSide
  });
  const limestone = new THREE.MeshStandardMaterial({
    color:0xffede2,map:tex('stone.jpg'),roughness:.79
  });
  const marble = new THREE.MeshPhysicalMaterial({
    color:0xfff2ea,map:tex('marble.jpg'),roughness:.51,clearcoat:.3
  });
  const pearl = new THREE.MeshPhysicalMaterial({
    color:0xf9f8f8,roughness:.18,metalness:.04,clearcoat:1,
    iridescence:1,iridescenceIOR:1.48,iridescenceThicknessRange:[100,680]
  });
  const windowTexture = tex('window.jpg');
  const add = (geom,material,x,y,z) => {
    const mesh=new THREE.Mesh(geom,material);
    mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;
    scene.add(mesh);return mesh;
  };
  const box=(w,h,d,material,x,y,z) =>
    add(new THREE.BoxGeometry(w,h,d),material,x,y,z);

  function softShadow(x,y,z,size=1,alpha=.27) {
    const cv=document.createElement('canvas');cv.width=cv.height=128;
    const ctx=cv.getContext('2d');
    const grad=ctx.createRadialGradient(64,64,0,64,64,64);
    grad.addColorStop(0,'rgba(71,45,62,'+alpha+')');
    grad.addColorStop(1,'rgba(71,45,62,0)');
    ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
    const mesh=add(new THREE.PlaneGeometry(size*2,size*2),
      new THREE.MeshBasicMaterial({
        map:new THREE.CanvasTexture(cv),transparent:true,
        side:THREE.DoubleSide,depthWrite:false
      }),x,y,z);
    mesh.rotation.x=-Math.PI/2;
  }
  function archWall() {
    const shape=new THREE.Shape();
    shape.moveTo(-10,-1);shape.lineTo(-1.6,-1);
    shape.lineTo(-1.6,8);shape.lineTo(-10,8);shape.closePath();
    for(const a of [{x:-7.8,r:1.34,h:3.25},{x:-4.5,r:1.02,h:3.5}]){
      const hole=new THREE.Path();
      hole.moveTo(a.x-a.r,-1.5);
      hole.lineTo(a.x+a.r,-1.5);
      hole.lineTo(a.x+a.r,a.h);
      hole.absarc(a.x,a.h,a.r,0,Math.PI,false);
      hole.lineTo(a.x-a.r,-1.5);hole.closePath();
      shape.holes.push(hole);
      const window=add(
        new THREE.PlaneGeometry(a.r*2.05,a.h+a.r+1),
        new THREE.MeshBasicMaterial({
          map:windowTexture,color:0xedd7f3,side:THREE.DoubleSide
        }),a.x,(a.h+a.r-1)*.5,-5.56
      );
      window.castShadow=false;
    }
    add(new THREE.ExtrudeGeometry(shape,{
      depth:.62,steps:1,bevelEnabled:true,
      bevelThickness:.055,bevelSize:.05,bevelSegments:2,curveSegments:32
    }),plaster,0,0,-3.2);
  }
  function highlightPortals(){
    // Explicit lit arch geometry remains legible even without real-time shadows.
    for(const a of [{x:-7.8,r:1.34,h:3.25},{x:-4.5,r:1.02,h:3.5}]){
      const r=a.r-.14;
      const opening=new THREE.Shape();
      opening.moveTo(a.x-r,-.8);opening.lineTo(a.x+r,-.8);
      opening.lineTo(a.x+r,a.h);opening.absarc(a.x,a.h,r,0,Math.PI,false);
      opening.lineTo(a.x-r,-.8);opening.closePath();
      const fill=add(new THREE.ShapeGeometry(opening,32),
        new THREE.MeshBasicMaterial({color:0xebdfed,side:THREE.DoubleSide}),0,0,-2.554);
      fill.castShadow=false;fill.receiveShadow=false;
      const lintel=new THREE.Mesh(new THREE.TorusGeometry(a.r,.15,12,54,Math.PI),limestone);
      lintel.position.set(a.x,a.h,-2.40);lintel.castShadow=true;scene.add(lintel);
      box(.24,a.h+1,.36,limestone,a.x-a.r,a.h/2-.5,-2.40);
      box(.24,a.h+1,.36,limestone,a.x+a.r,a.h/2-.5,-2.40);
      const soft=new THREE.PointLight(0xd8c7ed,1.5,6);
      soft.position.set(a.x,a.h*.7,-2.35);scene.add(soft);
    }
  }
  function windows() {
    for(const w of [
      {x:2.25,y:3.05,width:.84,height:3.1},
      {x:4.55,y:3.83,width:1.16,height:4.74}
    ]){
      box(w.width+.3,w.height+.3,.12,wall,w.x,w.y,-5.6);
      const pane=add(new THREE.PlaneGeometry(w.width,w.height),
        new THREE.MeshBasicMaterial({map:windowTexture,toneMapped:false}),
        w.x,w.y,-5.43);pane.castShadow=false;
      box(.17,w.height+.22,.3,limestone,w.x-w.width/2-.085,w.y,-5.3);
      box(.17,w.height+.22,.3,limestone,w.x+w.width/2+.085,w.y,-5.3);
      box(w.width+.22,.14,.3,limestone,w.x,w.y-w.height/2-.075,-5.3);
      box(w.width+.22,.18,.3,limestone,w.x,w.y+w.height/2+.075,-5.3);
      const glow=new THREE.PointLight(0xd9dbff,4.2,7);
      glow.position.set(w.x,w.y,-5.02);scene.add(glow);
    }
  }
  function stairs() {
    const rise=.253,run=.47;
    for(let i=0;i<7;i++){
      const height=rise*(i+1);
      box(4.9,height,run+.012,limestone,-1.2,height*.5-.34,1.25-run*i);
    }
    box(10,1.88,4.6,limestone,3.7,.72,-3.56);
    box(10,.12,.19,wall,3.7,1.72,-1.2);
  }
  function sculptures() {
    sphere=add(new THREE.SphereGeometry(.83,64,48),
      pearl,2.63,2.56,-2.76);
    softShadow(2.63,1.80,-2.76,1.23,.35);
    const geom=new THREE.IcosahedronGeometry(1.13,5);
    const attr=geom.attributes.position;
    for(let i=0;i<attr.count;i++){
      const x=attr.getX(i),y=attr.getY(i),z=attr.getZ(i);
      const f=1+.045*Math.sin(x*11+z*13)*Math.cos(y*9)
        +.03*Math.sin(z*26+y*11);
      attr.setXYZ(i,x*f,y*f,z*f);
    }
    geom.computeVertexNormals();
    const rock=add(geom,marble,5.1,-.22,2.46);
    rock.scale.set(1.25,.67,.81);rock.rotation.set(.12,.3,-.12);
    const far=add(new THREE.SphereGeometry(1.76,48,28),
      marble,10.5,-.35,3.1);
    far.scale.set(1.4,.4,1.0);
  }
  function homeRoom() {
    box(25,12,.4,wall,0,4.4,-6.35);
    box(.5,12,16,wall,-10.65,4,0);
    box(.5,12,16,wall,10.7,4,0);
    archWall();highlightPortals();windows();stairs();sculptures();
    const veil=add(new THREE.PlaneGeometry(6,8),
      new THREE.MeshBasicMaterial({
        color:0xecd3ef,transparent:true,opacity:.07,
        side:THREE.DoubleSide,depthWrite:false
      }),-6,3,-2.9);
    veil.rotation.y=.12;veil.castShadow=false;
  }
  function contactRoom() {
    box(25,12,.5,wall,0,4,-6.4);
    for(let i=0;i<40;i++){
      const cyl=add(new THREE.CylinderGeometry(.095,.095,10,10),
        plaster,-10+i*.29,3.7,-5.75);
      cyl.castShadow=i%2===0;
    }
    box(8.2,.8,4.8,limestone,0,.08,-2.6);
    const seat=new THREE.MeshPhysicalMaterial({
      color:0xe2abb2,roughness:.78
    });
    for(let i=0;i<9;i++){
      const a=(i/8-.5)*1.6;
      const petal=add(new THREE.SphereGeometry(.48,30,24),
        seat,2.1+Math.sin(a)*.86,1.18,-3+Math.cos(a)*.28);
      petal.scale.set(.69,1.35,.41);petal.rotation.z=a*.82;
    }
    box(1.25,.19,.83,seat,2.1,.53,-2.76);
    for(let i=0;i<4;i++){
      box(.06,.52,.06,limestone,1.63+i%2*.97,
        .21,-2.98+Math.floor(i/2)*.41);
    }
    add(new THREE.CylinderGeometry(.44,.44,.07,48),marble,
      .12,1.06,-2.1);
    add(new THREE.CylinderGeometry(.055,.055,.81,20),limestone,
      .12,.65,-2.1);
    softShadow(1,.48,-2.7,2.4,.23);
  }

  const wavesVertex='varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}';
  const wavesFragment='uniform float time;varying vec2 vUv;void main(){vec2 p=vUv*vec2(16.0,14.0);float a=sin(p.x*8.0+p.y*2.0+time*.8)*sin(p.y*13.0-p.x*3.0-time*.8);float b=sin(p.x*23.0-p.y*8.0+time*.57);float l=pow(max(0.,a*.6+b*.28),6.);vec3 c=mix(vec3(.86,.70,.72),vec3(.75,.80,.92),.5+.5*sin(vUv.x*14.0));c+=vec3(.26,.21,.22)*l;gl_FragColor=vec4(c,.18+l*.14);}';
  function addWater() {
    try{
      const w=Math.min(Math.ceil(root.clientWidth*devicePixelRatio*.7),1024);
      const h=Math.min(Math.ceil(root.clientHeight*devicePixelRatio*.7),700);
      mirror=new Reflector(new THREE.PlaneGeometry(80,80),{
        textureWidth:w,textureHeight:h,
        color:0xb39fad,clipBias:0.002
      });
      mirror.rotation.x=-Math.PI/2;mirror.position.y=-.37;
      // Distorted chromatic reflection: subtle water movement and prism-like edges.
      const shader=mirror.material;
      shader.uniforms.uTime={value:0};
      shader.fragmentShader=shader.fragmentShader
        .replace('uniform sampler2D tDiffuse;', 'uniform sampler2D tDiffuse; uniform float uTime;')
        .replace('vec4 base = texture2DProj( tDiffuse, vUv );',
          'vec4 uv=vUv; vec2 p=vUv.xy/vUv.w; '+
          'float dx=sin(p.y*73.0+uTime*.7)*.0028+sin(p.x*41.0-p.y*23.0+uTime*.4)*.0015; '+
          'float dy=sin(p.x*62.0+uTime*.8)*.0013; '+
          'uv.xy+=vec2(dx,dy)*uv.w; '+
          'vec4 base=texture2DProj(tDiffuse,uv); '+
          'base.rgb=vec3(texture2DProj(tDiffuse,uv+vec4(.0035*uv.w,0.,0.,0.)).r, '+
          'base.g,texture2DProj(tDiffuse,uv-vec4(.0035*uv.w,0.,0.,0.)).b);');
      shader.needsUpdate=true;
      scene.add(mirror);
    }catch(e){console.warn('Reflection disabled',e);}
    wave=new THREE.Mesh(new THREE.PlaneGeometry(80,80),
      new THREE.ShaderMaterial({
        vertexShader:wavesVertex,fragmentShader:wavesFragment,
        uniforms:{time:{value:0}},transparent:true,
        depthWrite:false,side:THREE.DoubleSide
      }));
    wave.rotation.x=-Math.PI/2;wave.position.y=-.36;
    wave.renderOrder=4;scene.add(wave);
  }
  function resize() {
    if(!renderer)return;
    const w=Math.max(1,root.clientWidth),h=Math.max(1,root.clientHeight);
    camera.aspect=w/h;
    camera.fov=w<640?52:49;
    camera.updateProjectionMatrix();
    renderer.setSize(w,h,false);
  }
  function animate() {
    if(!visible)return;
    const dt=Math.min(clock.getDelta(),.05);
    const t=clock.elapsedTime;
    const ease=reduced.matches?1:Math.min(1,dt*4.0);
    state.yaw+=(state.targetYaw-state.yaw)*ease;
    state.pitch+=(state.targetPitch-state.pitch)*ease;
    const mobile=root.clientWidth<700;
    const radius=mobile?13.0:12.5;
    camera.position.set(
      (mobile?-.7:0)+Math.sin(state.yaw)*radius,
      (mobile?3.05:3.65)+state.pitch*3,
      -2.75+Math.cos(state.yaw)*radius
    );
    camera.lookAt(mobile?-.12:0,1.58+state.pitch*.5,-2.85);
    if(wave)wave.material.uniforms.time.value=t;
    if(mirror)mirror.material.uniforms.uTime.value=t;
    if(sphere)sphere.position.y=2.56+Math.sin(t*.4)*.025;
    renderer.render(scene,camera);
  }
  function init() {
    try {
      renderer=new THREE.WebGLRenderer({
        canvas,antialias:!touch.matches,alpha:false,
        powerPreference:touch.matches?'low-power':'high-performance'
      });
      renderer.setPixelRatio(Math.min(devicePixelRatio,touch.matches?1.4:2));
      renderer.outputColorSpace=THREE.SRGBColorSpace;
      renderer.toneMapping=THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure=1.02;
      renderer.shadowMap.enabled=!touch.matches;
      renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      scene=new THREE.Scene();
      scene.background=new THREE.Color(0xe3c8c8);
      scene.fog=new THREE.Fog(0xe3c8c8,14,46);
      camera=new THREE.PerspectiveCamera(49,1,.1,100);
      scene.add(new THREE.HemisphereLight(0xf9f6ff,0xcfb8be,1.8));
      const sun=new THREE.DirectionalLight(0xffece2,3.15);
      sun.position.set(-3,11,6);sun.castShadow=!touch.matches;
      sun.shadow.mapSize.set(2048,2048);
      sun.shadow.camera.left=-18;sun.shadow.camera.right=18;
      sun.shadow.camera.top=18;sun.shadow.camera.bottom=-18;
      sun.shadow.normalBias=.04;sun.shadow.radius=4;scene.add(sun);
      const cool=new THREE.PointLight(0xe9ceff,3,15);
      cool.position.set(-6,4,0);scene.add(cool);
      const fill=new THREE.DirectionalLight(0xffd6c7,1.5);
      fill.position.set(8,6,-1);scene.add(fill);
      if(mode==='contact')contactRoom();else homeRoom();
      addWater();
      clock=new THREE.Clock();
      resize();root.classList.add('is-rendered');
      renderer.setAnimationLoop(animate);
    }catch(e) {
      console.error('BAEV world failed:',e);
      root.classList.add('is-fallback');
    }
  }
  let activePointer=null;
  canvas.addEventListener('pointerdown',e=>{
    if(reduced.matches||e.button!==0)return;
    activePointer=e.pointerId;state.dragging=true;
    state.x=e.clientX;state.y=e.clientY;
    try{canvas.setPointerCapture(e.pointerId)}catch(_){}
    root.classList.add('is-dragging');
  });
  canvas.addEventListener('pointermove',e=>{
    if(state.dragging&&activePointer===e.pointerId){
      state.targetYaw=clamp(
        state.targetYaw-(e.clientX-state.x)*.0035,-.38,.38
      );
      state.targetPitch=clamp(
        state.targetPitch+(e.clientY-state.y)*.0016,-.1,.1
      );
      state.x=e.clientX;state.y=e.clientY;
    }else if(!reduced.matches&&!touch.matches){
      const r=root.getBoundingClientRect();
      state.targetYaw=clamp(
        ((e.clientX-r.left)/r.width-.5)*.13,-.16,.16
      );
      state.targetPitch=clamp(
        ((e.clientY-r.top)/r.height-.5)*.04,-.1,.1
      );
    }
  },{passive:true});
  const release=()=>{
    state.dragging=false;activePointer=null;
    root.classList.remove('is-dragging');
  };
  canvas.addEventListener('pointerup',release);
  canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('lostpointercapture',release);
  canvas.addEventListener('pointerleave',()=>{
    if(!state.dragging){state.targetYaw=0;state.targetPitch=0;}
  });
  canvas.addEventListener('keydown',e=>{
    if(e.key==='ArrowLeft')
      state.targetYaw=clamp(state.targetYaw+.12,-.38,.38);
    else if(e.key==='ArrowRight')
      state.targetYaw=clamp(state.targetYaw-.12,-.38,.38);
    else if(e.key==='ArrowUp')
      state.targetPitch=clamp(state.targetPitch-.05,-.1,.1);
    else if(e.key==='ArrowDown')
      state.targetPitch=clamp(state.targetPitch+.05,-.1,.1);
    else if(e.key==='Home'){
      state.targetYaw=0;state.targetPitch=0;
    }else return;
    e.preventDefault();
  });
  window.addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',()=>{
    visible=!document.hidden;
    if(visible&&clock)clock.getDelta();
  });
  init();
}
