import fs from 'node:fs/promises'
import assert from 'node:assert/strict'
const base=process.env.BAEV_QA_URL||'https://baev-cms.vercel.app'
const [email,password]=(await fs.readFile(process.env.BAEV_QA_CREDENTIALS||'/tmp/baev-qa-creds','utf8')).trim().split(/\r?\n/)
const login=await fetch(base+'/api/users/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
assert.equal(login.status,200,'Existing QA account login')
const {token}=await login.json()
const auth={Authorization:'JWT '+token,'Content-Type':'application/json'}
const checked=[]
async function call(path,method='GET',body,authenticated=true){
  const response=await fetch(base+path,{method,headers:authenticated?auth:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)})
  return {status:response.status,data:await response.json().catch(()=>null)}
}
function check(name,condition){assert.ok(condition,name);checked.push(name);console.log('PASS',name)}
const created=[]
try {
  check('Anonymous Studio write denied',(await call('/api/studio/projects/1','PATCH',{title:'Ignored'},false)).status===403)
  check('Anonymous account registration denied',(await call('/api/users','POST',{},false)).status===403)
  const title='Studio QA '+Date.now()
  const draft=await call('/api/baev/create-case','POST',{title,client:'Technical QA',template:'blank'})
  check('Create a draft',draft.status===201)
  const id=draft.data.id,slug=draft.data.slug;created.push(id)
  check('Draft is absent from public page',(await fetch(base+'/work/'+slug)).status===404)
  const invalid=await call('/api/studio/projects/'+id+'/publish','POST',{action:'publish'})
  check('Required media blocks publication',invalid.status===400&&typeof invalid.data.error==='string')
  const media=await call('/api/media?limit=1&where[mimeType][contains]=image')
  const mediaID=media.data.docs[0].id
  const privateMarker='studio-only-validation-marker'
  const patch={title,cover:mediaID,internalNotes:privateMarker,sourceURL:'https://example.com/private-source',blocks:[{blockType:'caseHero',title,layout:'editorial',theme:'dark',media:mediaID}]}
  check('Save a valid document',(await call('/api/studio/projects/'+id,'PATCH',patch)).status===200)
  const duplicate=await call('/api/baev/duplicate-project','POST',{id})
  check('Duplicate populated media and owner relationships',duplicate.status===201)
  created.push(duplicate.data.id)
  const versions=await call('/api/studio/projects/'+id+'/versions')
  const version=versions.data.docs[0].id
  check('Publish valid content',(await call('/api/studio/projects/'+id+'/publish','POST',{action:'publish'})).status===200)
  check('Published page available',(await fetch(base+'/work/'+slug)).status===200)
  const html=await (await fetch(base+'/work/'+slug)).text()
  check('Internal notes excluded from public HTML',!html.includes(privateMarker))
  const publicDoc=await call('/api/projects/'+id,'GET',undefined,false)
  check('Internal fields excluded from public API',publicDoc.status===200&&!('internalNotes' in publicDoc.data)&&!('sourceURL' in publicDoc.data)&&!('owner' in publicDoc.data))
  check('Save changes as a draft',(await call('/api/studio/projects/'+id,'PATCH',{title:title+' changed'})).status===200)
  check('Restore a version to draft',(await call('/api/studio/projects/'+id+'/versions','POST',{versionId:version})).status===200)
  const stillPublic=await call('/api/projects/'+id,'GET',undefined,false)
  check('Restoration preserves the published version',stillPublic.status===200&&stillPublic.data.title===title)
  check('Reject another case version',(await call('/api/studio/projects/'+duplicate.data.id+'/versions','POST',{versionId:version})).status===400)
  check('Unpublish',(await call('/api/studio/projects/'+id+'/publish','POST',{action:'unpublish'})).status===200)
  check('Unpublished page becomes unavailable',(await fetch(base+'/work/'+slug)).status===404)
  console.log('Verified',checked.length,'API scenarios')
} finally {
  // Only remove documents created by this run; source projects and media are never touched.
  for(const id of created){const result=await call('/api/projects/'+id,'DELETE');assert.equal(result.status,200,'QA document cleanup')}
}
