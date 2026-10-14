import {readFileSync,existsSync,statSync} from 'node:fs';
import {join,resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const htmlPages=[
  'index.html','work/index.html','contact/index.html',
  'about/index.html','blog/index.html'
];
const pages=new Map(htmlPages.map(path=>[path,readFileSync(join(root,path),'utf8')]));
const introduced=['index.html','work/index.html','contact/index.html'];
const home=pages.get('index.html');
const projects=pages.get('work/index.html');
const contact=pages.get('contact/index.html');
const errors=[];
let checks=0;
const verify=(condition,message)=>{
  checks++;
  if(!condition)errors.push(message);
};
const textFile=(path)=>readFileSync(join(root,path),'utf8');
for(const [path,content] of pages){
  verify(/<html lang="ru"/.test(content),path+': Russian language');
  verify(/<meta name="viewport"/.test(content),path+': viewport');
  verify(/<meta name="description"/.test(content),path+': description');
  verify((content.match(/<h1(?:\s|>)/g)||[]).length===1,path+': one h1');
  verify(/href="\/"/.test(content),path+': home link');
  verify(/href="\/contact\/?"/.test(content),path+': contact navigation');
  for(const [,asset] of content.matchAll(/(?:href|src)="(\/front\/[^"]+)"/g)){
    const location=join(root,asset.slice(1));
    verify(existsSync(location),path+': asset '+asset);
    if(existsSync(location))verify(statSync(location).size>0,path+': non-empty asset '+asset);
  }
  for(const match of content.matchAll(/<img\b[^>]*>/g)){
    verify(/\balt="[^"]+"/.test(match[0]),path+': image alt '+match[0].slice(0,65));
    if(introduced.includes(path))verify(/\bloading="lazy"/.test(match[0])||/\bfetchpriority="high"/.test(match[0]),path+': image priority');
  }
  for(const [,url] of content.matchAll(/<a\b[^>]*href="([^"]+)"/g)){
    const target=url.split(/[?#]/)[0];
    if(url.startsWith('#')){
      verify(content.includes('id="'+url.slice(1)+'"'),path+': anchor '+url);
    }else if(target.startsWith('/')&&!target.startsWith('//')){
      const pathname=target.slice(1);
      if(/^work\/[^/]+$/.test(pathname)){
        verify(existsSync(join(root,'work/index.html'))&&/\/work\/:slug/.test(textFile('vercel.json')),path+': CMS case routing '+target);
      }else{
        verify(existsSync(join(root,pathname||'index.html','index.html'))||existsSync(join(root,pathname||'index.html')),path+': internal link '+url);
      }
    }
  }
}
for(const path of introduced){
  const page=pages.get(path);
  verify(page.includes('class="header"'),path+': reference navigation');
  verify(page.includes('class="menu"'),path+': menu drawer');
  verify(page.includes('class="footer"'),path+': footer');
  verify(page.includes('id="main"'),path+': skip target');
  verify(page.includes('/front/faithful/site.css'),path+': scoped stylesheet');
  verify(page.includes('/front/faithful/app.js'),path+': progressive script');
  verify(page.includes('type="importmap"'),path+': three import map');
  verify(page.includes('type="module"'),path+': 3d module');
  verify(!/unseen\.co|UNSEEN STUDIO/.test(page),path+': no unrelated brand');
}
verify(home.includes('id="intro"')&&home.includes('id="enter-muted"'),'home: entry sequence');
verify(home.indexOf('id="intro"') < home.indexOf('<main id="main">'),'home: entry dialog must be outside inert main');
verify(home.includes('data-world="conference"'),'home: 3D conference venue');
verify(home.includes('id="selected"'),'home: work anchor');
verify(home.includes('class="fixed-controls"'),'home: scene controls');
verify(projects.includes('class="projects"'),'work: grid');
verify(!projects.includes('class="projects-hero"'),'work: no duplicate hero');
verify(contact.includes('data-world="contact"'),'contact: dedicated scene');
verify(contact.includes('class="baev-contact-form"'),'contact: CRM form');
verify(contact.includes('/contact/baev-contact.js'),'contact: CRM bridge');
for(const key of ['Name','Email','MessageEmail','website']){
  verify(contact.includes('name="'+key+'"'),'contact: form field '+key);
}
for(const page of [home,projects]){
  const count=(page.match(/class="project-card"/g)||[]).length;
  verify(count===8,'portfolio: eight real fallbacks');
  for(const key of ['all','presentation','event','brand','digital']){
    verify(page.includes('data-filter="'+key+'"'),'portfolio: filter '+key);
  }
}
const css=textFile('front/faithful/site.css');
verify(/prefers-reduced-motion/.test(css),'motion accessibility');
verify(/max-width:700px/.test(css),'mobile');
verify(/focus-visible/.test(css),'keyboard focus');
verify(/\.intro/.test(css),'entry styles');
const js=textFile('front/faithful/app.js');
verify(js.includes('/api/baev/projects'),'published-projects connector');
verify(js.includes('sessionStorage'),'entry state');
verify(js.includes('aria-expanded'),'menu accessible state');
verify(js.includes('aria-pressed'),'filter accessible state');
const scene=textFile('front/conference/scene.js');
verify(scene.includes('Reflector'),'conference floor reflection');
verify(scene.includes('InstancedMesh'),'optimized 3D audience seating');
verify(scene.includes('3D audience seating'),'3D auditorium architecture');
verify(scene.includes('volumetrics'),'animated stage spotlights');
verify(scene.includes('LED')&&scene.includes('CanvasTexture'),'real project LED stage screens');
verify(scene.includes('keydown'),'accessible keyboard camera interaction');
verify(scene.includes('choose(index)'),'3D camera waypoint navigation');
verify(home.includes('id="case-next"'),'interactive stage case carousel');
verify(home.includes('id="tour-enter"'),'guided conference entry');
verify(home.includes('data-stop="2"'),'stage navigation');
verify(existsSync(join(root,'front/faithful/vendor/THREE-LICENSE.txt')),'Three.js license');
verify(!home.includes('framer.com'),'No Framer dependency');
if(errors.length){
  console.error('BAEV visual reference: '+errors.length+' failures / '+checks+' checks');
  for(const error of errors)console.error(' - '+error);
  process.exit(1);
}
console.log('BAEV reference implementation: '+checks+' checks passed across '+htmlPages.length+' routes.');
