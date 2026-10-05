import {describe,it,expect,vi,afterEach} from 'vitest'
import React from 'react'
import {render,screen,fireEvent,waitFor,cleanup} from '@testing-library/react'
import ContactForm from '@/public/ContactForm'
import {withDocumentLock,versionMatches} from '@/studio/lib/documentLock'
import {publicationChanges} from '@/studio/builder/publication'
import {projectContentSignature} from '@/studio/builder/publication'
import legacy from '@/content/legacy-articles.json'
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals()})
describe('New public version safeguards',()=>{
 it('keeps one submission key across an ambiguous failure and retry, without losing content',async()=>{
 const fetcher=vi.fn().mockRejectedValueOnce(new TypeError('timeout')).mockResolvedValueOnce({ok:true});vi.stubGlobal('fetch',fetcher)
 render(React.createElement(ContactForm,{email:'hello@example.test',project:'Avito',comparison:true}))
 fireEvent.change(screen.getByLabelText('Ваше имя *'),{target:{value:'Editor'}});fireEvent.change(screen.getByLabelText('Email *'),{target:{value:'qa@example.test'}});fireEvent.change(screen.getByLabelText('Задача *'),{target:{value:'A retained task'}})
 fireEvent.submit(document.querySelector('form')!);await screen.findByRole('alert');expect((screen.getByLabelText('Задача *') as HTMLTextAreaElement).value).toBe('A retained task')
 fireEvent.submit(document.querySelector('form')!);await screen.findByRole('status');expect(fetcher).toHaveBeenCalledTimes(2)
 const first=JSON.parse(fetcher.mock.calls[0][1].body),second=JSON.parse(fetcher.mock.calls[1][1].body);expect(first.submissionKey).toBe(second.submissionKey);expect(second.project).toBe('Avito');expect(screen.getByRole('status').textContent).toContain('тестовой CRM')
 })
 it('serializes conflicting writes and requires the exact saved revision',async()=>{
 const order:string[]=[];let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve});const payload={db:{}} as any
 const one=withDocumentLock(payload,'projects','42',async()=>{order.push('first');await gate;order.push('saved')});const two=withDocumentLock(payload,'projects','42',async()=>{order.push('second')});await Promise.resolve();await Promise.resolve();release();await Promise.all([one,two]);expect(order).toEqual(['first','saved','second']);expect(versionMatches('old','new')).toBe(false);expect(versionMatches(undefined,'new')).toBe(false);expect(versionMatches('new','new')).toBe(true)
 })
 it('imports only real source articles with valid dates and semantic body sections',()=>{expect(legacy).toHaveLength(3);for(const article of legacy){expect(Number.isFinite(Date.parse(article.publishedAt!))).toBe(true);expect(article.author).toBe('Редакция BAEV');expect(article.blocks.length).toBeGreaterThan(3);expect(JSON.stringify(article.blocks)).not.toContain('Ключевые запросы:')}})
 it('reports actual content changes before publishing',()=>{const original={title:'First',blocks:[{blockType:'manifesto',text:'Before'}]};const signature=projectContentSignature(original);expect(publicationChanges(signature,original)).toEqual([]);expect(publicationChanges(signature,{...original,title:'After'})).toEqual(['Название']);expect(publicationChanges(signature,{...original,blocks:[]})).toEqual(['Содержание: 0 изменённых блоков, количество 1 → 0'])})
})
