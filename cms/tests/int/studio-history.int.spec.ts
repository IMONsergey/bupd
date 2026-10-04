import {describe,it,expect,vi,afterEach} from 'vitest'
import React from 'react'
import {render,screen,fireEvent,cleanup} from '@testing-library/react'
import VisualCaseBuilder from '@/studio/builder/VisualCaseBuilder'
vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn()})}))
vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}})
vi.stubGlobal('fetch',vi.fn(async()=>Response.json({ok:true})))
afterEach(()=>{cleanup();sessionStorage.clear();localStorage.clear()})
describe('Studio history during batched selection and document changes',()=>{
  it('undoes and redoes a copied scene without overwriting the previous snapshot',()=>{
    const project={id:1,slug:'test',title:'Test',blocks:[{id:'first',blockType:'manifesto',text:'Original'}]}
    render(React.createElement(VisualCaseBuilder,{project,catalog:[],media:[],schemas:{manifesto:[]}}))
    const count=()=>document.querySelector('.builder-scenes__head span')?.textContent
    expect(count()).toBe('1')
    fireEvent.click(screen.getByRole('button',{name:'Дублировать сцену 1'}))
    expect(count()).toBe('2')
    fireEvent.click(screen.getByRole('button',{name:'Отменить'}))
    expect(count()).toBe('1')
    fireEvent.click(screen.getByRole('button',{name:'Повторить'}))
    expect(count()).toBe('2')
    fireEvent.click(screen.getByRole('button',{name:'Отменить'}))
    expect(count()).toBe('1')
  })
  it('keeps the first-screen title and page title in sync with undo',()=>{
    const project={id:1,slug:'test',title:'Original',blocks:[{id:'hero',blockType:'caseHero',title:'Original'}]}
    render(React.createElement(VisualCaseBuilder,{project,catalog:[],media:[],schemas:{caseHero:[{name:'title',label:'Заголовок',type:'text'}]}}))
    fireEvent.click(screen.getByRole('button',{name:'Original'}))
    fireEvent.change(screen.getByLabelText(/^Название/),{target:{value:'Updated'}})
    expect(document.querySelector('.builder-title>button')?.textContent).toBe('Updated')
    fireEvent.click(screen.getByRole('button',{name:'Отменить'}))
    expect(document.querySelector('.builder-title>button')?.textContent).toBe('Original')
    expect((screen.getByLabelText(/^Название/) as HTMLInputElement).value).toBe('Original')
  })

})
