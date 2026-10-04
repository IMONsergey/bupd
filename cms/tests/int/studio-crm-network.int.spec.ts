import {describe,it,expect,vi,afterEach} from 'vitest'
import React from 'react'
import {render,screen,fireEvent,cleanup,waitFor} from '@testing-library/react'
import StudioPipeline from '@/studio/components/StudioPipeline'
import CrmWorkspace from '@/studio/crm/CrmWorkspace'
vi.stubGlobal('ResizeObserver',class{observe(){}unobserve(){}disconnect(){}})
afterEach(()=>{cleanup();vi.restoreAllMocks()})
const deal={id:1,title:'QA deal',stage:'brief',company:{id:1,name:'QA'},value:100,probability:50}
describe('CRM network failures and keyboard stage editing',()=>{
  it('restores the stage and reports a failed move',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>{throw new TypeError('Offline')}))
    render(React.createElement(StudioPipeline,{initialDeals:[deal],companies:[],users:[]}))
    fireEvent.change(screen.getByRole('combobox',{name:'Этап сделки «QA deal»'}),{target:{value:'estimate'}})
    await screen.findByRole('alert')
    expect((screen.getByRole('combobox',{name:'Этап сделки «QA deal»'}) as HTMLSelectElement).value).toBe('brief')
  })
  it('lets keyboard and touch users move a deal to a closed stage',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>Response.json({doc:{...deal,stage:'lost'}})))
    render(React.createElement(StudioPipeline,{initialDeals:[deal],companies:[],users:[]}))
    fireEvent.change(screen.getByRole('combobox',{name:'Этап сделки «QA deal»'}),{target:{value:'lost'}})
    await waitFor(()=>expect((screen.getByRole('combobox',{name:'Этап сделки «QA deal»'}) as HTMLSelectElement).disabled).toBe(false))
    expect((screen.getByRole('combobox',{name:'Этап сделки «QA deal»'}) as HTMLSelectElement).value).toBe('lost')
  })
  it('keeps a failed contact form editable for retry',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>{throw new TypeError('Offline')}))
    render(React.createElement(CrmWorkspace,{leads:[],deals:[],activities:[]}))
    fireEvent.click(screen.getByRole('button',{name:'Лиды'}))
    fireEvent.click(await screen.findByRole('button',{name:'Новый лид'}))
    fireEvent.change(screen.getByLabelText('Имя *'),{target:{value:'QA'}})
    fireEvent.change(screen.getByLabelText('Email'),{target:{value:'qa@example.com'}})
    fireEvent.click(screen.getByRole('button',{name:'Создать лид'}))
    await screen.findByRole('alert')
    expect((screen.getByRole('button',{name:'Создать лид'}) as HTMLButtonElement).disabled).toBe(false)
    expect((screen.getByLabelText('Имя *') as HTMLInputElement).value).toBe('QA')
  })
})
