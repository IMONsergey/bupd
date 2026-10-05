// One-time, reproducible import from the three existing Framer exports. No generated authors or dates.
import fs from 'node:fs'
import path from 'node:path'
import {JSDOM} from 'jsdom'
const root={type:'root',version:1,direction:null,format:'',indent:0}
function inline(node,format=0){
 if(node.nodeType===3)return [{type:'text',version:1,text:node.textContent,format,detail:0,mode:'normal',style:''}]
 if(node.nodeType!==1)return []
 if(node.tagName==='BR')return [{type:'linebreak',version:1}]
 const next=format|(node.tagName==='STRONG'||node.tagName==='B'?1:node.tagName==='EM'||node.tagName==='I'?2:0)
 const children=[...node.childNodes].flatMap(n=>inline(n,next))
 if(node.tagName==='A'&&/^(https?:\/\/|mailto:|\/)/.test(node.getAttribute('href')||''))return [{type:'link',version:3,direction:null,format:'',indent:0,fields:{linkType:'custom',url:node.getAttribute('href'),newTab:true},children}]
 return children
}
function node(el){if(['UL','OL'].includes(el.tagName))return {type:'list',version:1,direction:null,format:'',indent:0,listType:el.tagName==='OL'?'number':'bullet',start:1,tag:el.tagName.toLowerCase(),children:[...el.children].map((li,i)=>({type:'listitem',version:1,direction:null,format:'',indent:0,value:i+1,children:[...li.childNodes].flatMap(n=>inline(n))}))};return {type:'paragraph',version:1,direction:null,format:'',indent:0,textFormat:0,textStyle:'',children:[...el.childNodes].flatMap(n=>inline(n))}}
const articles=[]
for(const slug of fs.readdirSync('../blog').filter(s=>fs.statSync('../blog/'+s).isDirectory())){
 const d=new JSDOM(fs.readFileSync('../blog/'+slug+'/index.html','utf8')).window.document
 const title=d.querySelector('h1')?.textContent?.trim(),content=d.querySelector('.framer-fgvene')
 if(!title||!content)throw Error('Missing source '+slug)
 const elements=[...content.children].filter(e=>e.textContent.trim()&&!e.textContent.includes('Ключевые запросы:'))
 const summary=elements[0]?.tagName==='P'?elements.shift().textContent.trim():''
 const blocks=[];let current={blockType:'articleText',title:'',body:{root:{...root,children:[]}},width:'reading',theme:'light'}
 for(const el of elements){const text=el.textContent.trim();if(/^H[1-6]$/.test(el.tagName)&&text.length<180){if(current.body.root.children.length)blocks.push(current);current={blockType:'articleText',title:text,body:{root:{...root,children:[]}},width:'reading',theme:'light'}}else current.body.root.children.push(node(el))}
 if(current.body.root.children.length)blocks.push(current)
 const date=[...d.querySelectorAll('[data-framer-name]')].find(e=>e.getAttribute('data-framer-name')==='Date')?.textContent||''
 const match=date.match(/(\d{1,2}) (\S+) (\d{4})/);const months=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']
 const author=[...d.querySelectorAll('[data-framer-name]')].find(e=>e.getAttribute('data-framer-name')==='Author')?.textContent?.replace(/^Автор/,'').trim()||''
 articles.push({title,slug,summary,author,publishedAt:match?`${match[3]}-${String((match[2]==='мар.'?3:months.indexOf(match[2])+1)).padStart(2,'0')}-${match[1].padStart(2,'0')}T12:00:00.000Z`:null,blocks,pageTheme:'light',_status:'published',workflowStatus:'ready',categories:[{label:'Презентации'}],source:'blog/'+slug+'/index.html'})
}
fs.mkdirSync('src/content',{recursive:true});fs.writeFileSync('src/content/legacy-articles.json',JSON.stringify(articles,null,2));console.log(articles.map(a=>({slug:a.slug,sections:a.blocks.length,author:a.author,date:a.publishedAt})))
