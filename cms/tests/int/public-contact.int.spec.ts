import {describe,expect,it,vi} from 'vitest'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
const {JSDOM}=createRequire(import.meta.url)('jsdom')
const script=readFileSync('../contact/baev-contact.js','utf8')
function setup(){
  const dom=new JSDOM('<form class="framer-hqhav0"><input name="Name"><input type="email" name="Email"><textarea name="MessageEmail"></textarea><input name="website"><button type="submit"><p>Отправить запрос</p></button></form>',{url:'https://baev-case-lab.vercel.app/contact?project=Avito',runScripts:'outside-only'})
  const win=dom.window,form=win.document.querySelector('form')!
  const fetcher=vi.fn();Object.assign(win,{fetch:fetcher});win.eval(script);win.dispatchEvent(new win.Event('load'))
  const set=(name:string,value:string)=>(form.elements.namedItem(name) as HTMLInputElement).value=value
  set('Name','Сергей');set('Email','qa@example.test');set('MessageEmail','Сохранить эту задачу')
  const submit=()=>form.dispatchEvent(new win.Event('submit',{bubbles:true,cancelable:true}))
  return {win,form,fetcher,submit,dom}
}
describe('Public contact recovery without real submissions',()=>{
  it('retains the message on failure and retries with the originating case',async()=>{
    const {win,form,fetcher,submit,dom}=setup()
    try{
      fetcher.mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce({ok:true})
      submit();await vi.waitFor(()=>expect(form.textContent).toContain('Ваш текст сохранён'))
      expect((form.elements.namedItem('MessageEmail') as HTMLTextAreaElement).value).toBe('Сохранить эту задачу')
      expect(form.querySelector('button')!.disabled).toBe(false)
      submit();await vi.waitFor(()=>expect(form.textContent).toContain('Задача отправлена'))
      expect(JSON.parse(fetcher.mock.calls[1][1].body).message).toContain('Заинтересовал кейс: Avito')
      expect((form.elements.namedItem('MessageEmail') as HTMLTextAreaElement).value).toBe('')
      expect(form.querySelector('[role="status"]')).not.toBeNull()
    }finally{dom.window.close()}
  })
  it('validates email and prevents repeated submissions while waiting',async()=>{
    const {form,fetcher,submit,dom}=setup()
    try{
      ;(form.elements.namedItem('Email') as HTMLInputElement).value='bad'
      submit();expect(fetcher).not.toHaveBeenCalled()
      ;(form.elements.namedItem('Email') as HTMLInputElement).value='qa@example.test'
      let complete!:(result:unknown)=>void;fetcher.mockImplementation(()=>new Promise(resolve=>complete=resolve))
      submit();submit();expect(fetcher).toHaveBeenCalledTimes(1);expect(form.querySelector('button')!.disabled).toBe(true)
      complete({ok:true});await vi.waitFor(()=>expect(form.querySelector('button')!.disabled).toBe(false))
    }finally{dom.window.close()}
  })
})

describe('Export hydration corrections',()=>{
  it('keeps publication metadata and the article count correct after the export hydrates',async()=>{
    const dom=new JSDOM('<title>Old title</title><meta property="og:title" content="Old"><h2>(6)</h2>',{url:'https://baev-case-lab.vercel.app/blog',runScripts:'outside-only',pretendToBeVisual:true})
    try{
      dom.window.requestAnimationFrame=(callback:FrameRequestCallback)=>dom.window.setTimeout(()=>callback(0),0)
      dom.window.cancelAnimationFrame=(id:number)=>dom.window.clearTimeout(id)
      dom.window.eval(readFileSync('../site-refinements.js','utf8'));dom.window.dispatchEvent(new dom.window.Event('load'))
      expect(dom.window.document.querySelector('h2')!.textContent).toBe('(3)')
      dom.window.document.title='Export title';dom.window.document.querySelector('h2')!.textContent='(6)'
      await vi.waitFor(()=>expect(dom.window.document.title).toBe('Журнал BAEV - презентации и публичная коммуникация'))
      expect(dom.window.document.querySelector('h2')!.textContent).toBe('(3)')
      expect(dom.window.document.querySelector('meta')!.content).toBe(dom.window.document.title)
    }finally{dom.window.close()}
  })
})
