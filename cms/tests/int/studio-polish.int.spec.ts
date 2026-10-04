import {afterEach,describe,expect,it,vi} from 'vitest'
import React from 'react'
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {PATCH} from '@/app/(payload)/api/studio/media/[id]/route'
import {getStudioSession} from '@/studio/lib/auth'
import {withPublicationMedia} from '@/studio/lib/publicationMedia'
import {normalizePageColor} from '@/lib/pageAppearance'
import {publicationIssues} from '@/studio/builder/publication'
import {readBlockLibraryMemory,blockLibraryKey} from '@/studio/builder/blockLibraryMemory'
import {PublicationPreview} from '@/studio/builder/PublicationPreview'
import MediaMetadata from '@/studio/media/MediaMetadata'
import {BlockLibrary} from '@/studio/builder/BlockLibrary'
vi.mock('@/studio/lib/auth',()=>({getStudioSession:vi.fn(),canContent:(role:string)=>['admin','editor'].includes(role),studioRole:(user:any)=>user?.role||''}))
afterEach(()=>{cleanup();vi.resetAllMocks();vi.unstubAllGlobals();localStorage.clear()})
const request=(body:unknown,origin='https://studio.test')=>new Request('https://studio.test/api/studio/media/1',{method:'PATCH',headers:{'Content-Type':'application/json',origin},body:JSON.stringify(body)})
const good={alt:'Описание',kind:'project',tags:['Авито'],credit:''}
const params={params:Promise.resolve({id:'1'})}

describe('Media metadata permissions and recoverable edits',()=>{
  it('rejects anonymous and sales users before writing',async()=>{
    const update=vi.fn();vi.mocked(getStudioSession).mockResolvedValue({payload:{update} as any,user:null})
    expect((await PATCH(request(good),params)).status).toBe(401)
    vi.mocked(getStudioSession).mockResolvedValue({payload:{update} as any,user:{role:'sales'} as any})
    expect((await PATCH(request(good),params)).status).toBe(403);expect(update).not.toHaveBeenCalled()
  })
  it('rejects cross-origin writes and malformed metadata without changing files',async()=>{
    const update=vi.fn();vi.mocked(getStudioSession).mockResolvedValue({payload:{update} as any,user:{role:'editor'} as any})
    expect((await PATCH(request(good,'https://other.test'),params)).status).toBe(403)
    for(const value of [{...good,alt:' '},{...good,kind:'invalid'},{...good,tags:[{}]},{...good,tags:Array.from({length:13},()=> 'tag')},{...good,credit:1}])expect((await PATCH(request(value),params)).status).toBe(400)
    expect(update).not.toHaveBeenCalled()
  })
  it('saves only allowed metadata, trims and deduplicates tags, and enforces Payload access',async()=>{
    const update=vi.fn(async()=>({id:1,alt:'Описание'}));const user={id:4,role:'editor'}
    vi.mocked(getStudioSession).mockResolvedValue({payload:{update} as any,user:user as any})
    expect((await PATCH(request({...good,alt:' Описание ',tags:[' Авито ','Авито'],url:'https://bad.test/replacement.png',filename:'replacement.png'}),params)).status).toBe(200)
    expect(update).toHaveBeenCalledWith({collection:'media',id:'1',overrideAccess:false,user,data:{alt:'Описание',kind:'project',tags:[{label:'Авито'}],credit:''}})
  })
  it('keeps edits in the metadata form after an offline save',async()=>{
    vi.stubGlobal('fetch',vi.fn().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(Response.json({doc:{id:1,alt:'Новая подпись',kind:'project',tags:[]}})))
    const onSaved=vi.fn();render(React.createElement(MediaMetadata,{item:{id:1,alt:'Старая подпись'},onSaved,onBusyChange:vi.fn()}))
    fireEvent.change(screen.getByLabelText('Описание изображения (alt)'),{target:{value:'Новая подпись'}});fireEvent.click(screen.getByRole('button',{name:'Сохранить описание'}))
    expect((await screen.findByRole('alert')).textContent).toContain('Нет связи')
    expect((screen.getByLabelText('Описание изображения (alt)') as HTMLTextAreaElement).value).toBe('Новая подпись')
    fireEvent.click(screen.getByRole('button',{name:'Сохранить описание'}));await waitFor(()=>expect(onSaved).toHaveBeenCalledWith(expect.objectContaining({alt:'Новая подпись'})))
  })
})

describe('Compositions, appearance and publication previews',()=>{
  it('normalizes common HEX input and rejects invalid color without inventing a replacement',()=>{
    expect(normalizePageColor(' #AbC ')).toBe('#aabbcc');expect(normalizePageColor('202020')).toBe('#202020');expect(normalizePageColor('')).toBe('');expect(normalizePageColor('not a color')).toBeNull()
  })
  it('ignores incompatible storage and limits recent composition history',()=>{
    localStorage.setItem(blockLibraryKey,JSON.stringify({version:7,favorites:['bad']}));expect(readBlockLibraryMemory(localStorage).favorites).toEqual([])
    localStorage.setItem(blockLibraryKey,JSON.stringify({version:1,favorites:['a','a',null],recent:Array.from({length:20},(_,i)=>'id:'+i)}));expect(readBlockLibraryMemory(localStorage)).toMatchObject({favorites:['a']});expect(readBlockLibraryMemory(localStorage).recent).toHaveLength(8)
  })
  it('favorites a composition without inserting it, then records the chosen composition as recent',()=>{
    const onAdd=vi.fn();render(React.createElement(BlockLibrary,{catalog:[{slug:'quote',title:'Цитата',description:'Цитата клиента',group:'Narrative'}],onClose:vi.fn(),onAdd}))
    fireEvent.click(screen.getByRole('button',{name:'В избранное: Крупная'}));expect(onAdd).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button',{name:'Избранное'}));fireEvent.click(screen.getByRole('button',{name:'Крупная'}))
    expect(onAdd).toHaveBeenCalledWith('quote',expect.objectContaining({size:'xl'}));expect(readBlockLibraryMemory(localStorage).favorites).toHaveLength(1);expect(readBlockLibraryMemory(localStorage).recent).toEqual(readBlockLibraryMemory(localStorage).favorites)
  })
  it('resolves only publication image relations and leaves the document being published unchanged',async()=>{
    const project={cover:1,ogImage:2,blocks:[{media:9}]},find=vi.fn(async()=>({docs:[{id:1,mimeType:'video/mp4'},{id:2,mimeType:'image/png'}]}))
    const checked=await withPublicationMedia({find} as any,project)
    expect(project.cover).toBe(1);expect(checked.cover.mimeType).toBe('video/mp4');expect(find).toHaveBeenCalledWith(expect.objectContaining({where:{id:{in:[1,2]}},limit:2,select:{mimeType:true}}))
  })
  it('blocks video in link images while keeping long search text optional',()=>{
    const issues=publicationIssues({title:'a'.repeat(80),summary:'b'.repeat(200),cover:{id:1,mimeType:'video/mp4'},blocks:[{blockType:'text'}]},{text:[]})
    expect(issues).toContainEqual(expect.objectContaining({field:'cover',severity:'error'}));expect(issues).toContainEqual(expect.objectContaining({field:'seoTitle',severity:'warning'}));expect(issues).toContainEqual(expect.objectContaining({field:'seoDescription',severity:'warning'}))
  })
  it('uses the social image override and navigates directly to the relevant settings',()=>{
    const onFix=vi.fn();render(React.createElement(PublicationPreview,{project:{title:'Кейс',slug:'case',cover:{url:'/cover.jpg'},ogImage:{url:'/social.jpg',alt:'Социальная обложка'}},onFix}))
    fireEvent.click(screen.getByText('Вид в поиске и при отправке'));fireEvent.click(screen.getByRole('button',{name:'При отправке'}))
    expect(screen.getByRole('img',{name:'Социальная обложка'}).getAttribute('src')).toBe('/social.jpg');fireEvent.click(screen.getByRole('button',{name:'Изображение'}));expect(onFix).toHaveBeenCalledWith(expect.objectContaining({field:'ogImage'}))
  })
})
