/* BAEV spatial portfolio: direct manipulation with inertial easing and keyboard access. */
(()=>{'use strict';
 const stage=document.getElementById('world-stage');
 if(!stage)return;
 const objects=[...stage.querySelectorAll('.world__object')];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const coarse=matchMedia('(pointer: coarse)');
 let currentX=0,currentY=0,targetX=0,targetY=0,dragging=false,lastX=0,lastY=0,travel=0,frame=0;
 const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
 const render=()=>{
   const easing=reduce.matches?1:.075;
   currentX+=(targetX-currentX)*easing;currentY+=(targetY-currentY)*easing;
   for(const object of objects){
     const depth=Number(object.dataset.depth)||1;
     object.style.translate=(currentX*depth).toFixed(1)+'px '+(currentY*depth).toFixed(1)+'px';
   }
   if(Math.abs(currentX-targetX)+Math.abs(currentY-targetY)>.4)frame=requestAnimationFrame(render);
   else frame=0;
 };
 const schedule=()=>{if(!frame)frame=requestAnimationFrame(render)};
 stage.addEventListener('pointerdown',event=>{
   if(event.button!==0 || event.target.closest('a') || reduce.matches)return;
   dragging=true;travel=0;lastX=event.clientX;lastY=event.clientY;
   stage.setPointerCapture(event.pointerId);
 });
 stage.addEventListener('pointermove',event=>{
   if(!dragging)return;
   const dx=event.clientX-lastX,dy=event.clientY-lastY;
   travel+=Math.abs(dx)+Math.abs(dy);lastX=event.clientX;lastY=event.clientY;
   targetX=clamp(targetX+dx*.65,-185,185);
   targetY=clamp(targetY+dy*.35,-95,95);schedule();
 });
 const finish=()=>{dragging=false};
 stage.addEventListener('pointerup',finish);
 stage.addEventListener('pointercancel',finish);
 stage.addEventListener('lostpointercapture',finish);
 stage.addEventListener('keydown',event=>{
   const amount=event.shiftKey?65:30;
   if(event.key==='ArrowLeft')targetX=clamp(targetX+amount,-185,185);
   else if(event.key==='ArrowRight')targetX=clamp(targetX-amount,-185,185);
   else if(event.key==='ArrowUp')targetY=clamp(targetY+amount,-95,95);
   else if(event.key==='ArrowDown')targetY=clamp(targetY-amount,-95,95);
   else if(event.key==='Home'){targetX=0;targetY=0}
   else return;
   event.preventDefault();schedule();
 });
 // Prevent users accidentally clicking a work card after a drag.
 for(const link of objects)link.addEventListener('click',event=>{
   if(travel>12){event.preventDefault();travel=0}
 });
 // Pointer parallax while hovering; movement always clamped and zero on exit.
 if(!reduce.matches&&!coarse.matches){
   stage.addEventListener('pointermove',event=>{
     if(dragging||event.target.closest('a'))return;
     const rect=stage.getBoundingClientRect();
     targetX=clamp((event.clientX/rect.width-.5)*48,-185,185);
     targetY=clamp((event.clientY/rect.height-.5)*25,-95,95);schedule();
   },{passive:true});
 }
})();
