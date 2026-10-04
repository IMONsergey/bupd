import {describe,it,expect,vi,afterEach} from 'vitest'
import React from 'react'
import {render,screen,fireEvent,cleanup} from '@testing-library/react'
import VisualCaseBuilder from '@/studio/builder/VisualCaseBuilder'
vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn()})}))
vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}})
vi.stubGlobal('fetch',vi.fn(async()=>Response.json({ok:true})))
afterEach(cleanup)
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
})
