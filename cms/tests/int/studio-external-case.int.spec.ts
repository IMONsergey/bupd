import React from 'react'
import {afterEach,describe,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {embedHeight,isOwnCaseEmbed,normalizeEmbedURL,validEmbedMessage} from '@/lib/caseEmbed'
import {publicationIssues,projectContentSignature} from '@/studio/builder/publication'
import {editorSchemas} from '@/studio/builder/editorSchema'
import VisualCaseBuilder from '@/studio/builder/VisualCaseBuilder'
import ExternalCase from '@/app/(frontend)/preview/[slug]/ExternalCase'
import {responsiveImage} from '@/lib/responsiveMedia'
vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn()})}))
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals();sessionStorage.clear();localStorage.clear()})
const project={id:99,slug:'test',title:'Original',cover:8,blocks:[{id:'hero',blockType:'caseHero',title:'Original',media:8},{id:'text',blockType:'manifesto',text:'Keep this story'}]}

describe('External case publishing',()=>{
  it('accepts public HTTPS pages, rejecting unsafe schemes, credentials and internal destinations',()=>{
    expect(normalizeEmbedURL(' https://example.com/case?q=1 ')).toBe('https://example.com/case?q=1')
    for(const url of ['javascript:alert(1)','http://example.com','https://user:secret@example.com','https://localhost/x','https://127.0.0.1','https://192.168.1.1','https://x.local/case','https://example.com:8080','https://example.com/studio/a'])expect(normalizeEmbedURL(url)).toBeNull()
    expect(isOwnCaseEmbed('https://baev-case-lab.vercel.app/work/test?x=1','test',['https://baev-case-lab.vercel.app'])).toBe(true)
  })
  it('checks visible content without making preserved hidden drafts block publication',()=>{
    const embed={...project,bodyMode:'embed',embedURL:'https://example.com/case',blocks:[project.blocks[0],{blockType:'mediaGrid',items:[{}]}]}
    expect(publicationIssues(embed,editorSchemas).filter(issue=>issue.severity==='error')).toEqual([])
    expect(publicationIssues({...embed,embedURL:'http://example.com'},editorSchemas)).toContainEqual(expect.objectContaining({field:'embedURL',severity:'error'}))
    expect(publicationIssues({...embed,embedHeight:99999},editorSchemas)).toContainEqual(expect.objectContaining({field:'embedHeight',severity:'error'}))
    expect(publicationIssues({...embed,bodyMode:'blocks'},editorSchemas).some(issue=>issue.severity==='error')).toBe(true)
    expect(projectContentSignature(project)).toBe(projectContentSignature({...project,bodyMode:'blocks',embedHeight:6000,embedMobileHeight:9000,embedAutoHeight:false}))
    expect(projectContentSignature(embed)).not.toBe(projectContentSignature({...embed,embedMobileHeight:4000}))
  })
  it('trusts resize messages only from the embedded window and exact origin',()=>{
    const source={} as Window
    const event={origin:'https://example.com',source,data:{type:'baev:embed-size',height:2400.2}} as MessageEvent
    expect(validEmbedMessage(event,source,'https://example.com/case')).toBe(2401)
    expect(validEmbedMessage({...event,origin:'https://evil.test'} as MessageEvent,source,'https://example.com/case')).toBeNull()
    expect(validEmbedMessage({...event,source:{} as Window} as MessageEvent,source,'https://example.com/case')).toBeNull()
    for(const height of [-1,Infinity,50001,'2000'])expect(validEmbedMessage({...event,data:{...event.data,height}} as MessageEvent,source,'https://example.com/case')).toBeNull()
    expect(embedHeight(null,6000)).toBe(6000)
  })
  it('uses verified resize events and keeps a direct link if embedding is blocked',()=>{
    render(React.createElement(ExternalCase,{project:{...project,bodyMode:'embed',embedURL:'https://example.com/case',embedAutoHeight:true}}))
    const frame=screen.getByTitle('Original — внешний кейс') as HTMLIFrameElement
    expect(frame.getAttribute('sandbox')).not.toContain('allow-top-navigation')
    fireEvent(window,new MessageEvent('message',{origin:'https://example.com',source:frame.contentWindow,data:{type:'baev:embed-size',height:2700}}))
    expect(document.querySelector<HTMLElement>('.case-external')?.style.getPropertyValue('--embed-height')).toBe('2700px')
    expect(screen.getByRole('link',{name:'Открыть оригинал ↗'}).getAttribute('href')).toBe('https://example.com/case')
  })
  it('protects the cover and preserves body blocks when switching modes and saving',async()=>{
    vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}})
    const fetcher=vi.fn(async()=>Response.json({ok:true}));vi.stubGlobal('fetch',fetcher)
    render(React.createElement(VisualCaseBuilder,{project,catalog:[],media:[],schemas:editorSchemas}))
    expect(screen.queryByRole('button',{name:'Дублировать сцену 1'})).toBeNull()
    expect(screen.queryByRole('button',{name:'Удалить сцену 1'})).toBeNull()
    fireEvent.click(screen.getByRole('button',{name:'Original'}))
    fireEvent.change(screen.getByRole('combobox',{name:'Содержимое кейса'}),{target:{value:'embed'}})
    fireEvent.change(screen.getByRole('textbox',{name:'Ссылка на внешний кейс'}),{target:{value:'https://example.com/case'}})
    expect(screen.getAllByRole('button',{name:'Добавить блок'}).every(button=>(button as HTMLButtonElement).disabled)).toBe(true)
    fireEvent.click(screen.getByRole('button',{name:'Дополнительные действия'}))
    fireEvent.click(screen.getByRole('button',{name:'Сохранить сейчас'}))
    await waitFor(()=>expect(fetcher).toHaveBeenCalled())
    const saved=JSON.parse(String((fetcher.mock.calls[0] as unknown as [string,RequestInit])[1].body))
    expect(saved.bodyMode).toBe('embed');expect(saved.blocks).toHaveLength(2);expect(saved.blocks[1].text).toBe('Keep this story')
    fireEvent.change(screen.getByRole('combobox',{name:'Содержимое кейса'}),{target:{value:'blocks'}})
    expect(screen.getByRole('button',{name:'Сцена 2: manifesto'})).toBeTruthy()
  })
  it('excludes cropped thumbnails from full-frame responsive sources',()=>{
    const result=responsiveImage({url:'/full.jpg',width:2000,height:1000,sizes:{thumbnail:{url:'/square.jpg',width:300,height:300},large:{url:'/large.jpg',width:1000,height:500}}})
    expect(result.srcSet).toContain('/large.jpg 1000w');expect(result.srcSet).not.toContain('/square.jpg')
  })
})
