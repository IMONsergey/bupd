import {describe,it,expect,vi,afterEach} from 'vitest'
import React from 'react'
import {render,screen,fireEvent,cleanup} from '@testing-library/react'
import {BlockLibrary} from '@/studio/builder/BlockLibrary'
import {blockCatalog} from '@/blocks/catalog'
import CasesClient from '@/studio/cases/CasesClient'
import StudioLogin from '@/studio/ui/StudioLogin'

vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn(),replace:vi.fn(),refresh:vi.fn()}),useSearchParams:()=>({get:()=>null})}))
afterEach(()=>{cleanup();vi.restoreAllMocks();vi.unstubAllGlobals()})

describe('Studio chooser and recoverable network failures',()=>{
  it('finds a block across categories and inserts the chosen block with Enter',()=>{
    const add=vi.fn()
    render(React.createElement(BlockLibrary,{catalog:blockCatalog,onAdd:add,onClose:vi.fn()}))
    const search=screen.getByRole('textbox',{name:'Найти блок'})
    fireEvent.change(search,{target:{value:'цитата'}})
    expect(screen.getByRole('button',{name:'Цитата'})).toBeTruthy()
    fireEvent.keyDown(search,{key:'Enter'})
    expect(add).toHaveBeenCalledWith('quote', {size:'l'})
  })
  it('does not insert anything when search results are empty',()=>{
    const add=vi.fn()
    render(React.createElement(BlockLibrary,{catalog:blockCatalog,onAdd:add,onClose:vi.fn()}))
    const search=screen.getByRole('textbox',{name:'Найти блок'})
    fireEvent.change(search,{target:{value:'zzzzzz'}})
    fireEvent.keyDown(search,{key:'Enter'})
    expect(add).not.toHaveBeenCalled()
    expect((screen.getByRole('button',{name:'Добавить блок'}) as HTMLButtonElement).disabled).toBe(true)
    fireEvent.click(screen.getByRole('button',{name:'Показать все блоки'}))
    expect((search as HTMLInputElement).value).toBe('')
    expect(screen.getByRole('button',{name:'Первый экран'})).toBeTruthy()
  })
  it('returns focus and restores the surrounding interface on closing a dialog',()=>{
    const button=document.createElement('button')
    document.body.append(button);button.focus()
    const view=render(React.createElement(BlockLibrary,{catalog:blockCatalog,onAdd:vi.fn(),onClose:vi.fn()}))
    expect(button.inert).toBe(true)
    view.unmount()
    expect(button.inert).toBe(false)
    expect(document.activeElement).toBe(button)
    button.remove()
  })
  it('keeps a new case form available after a connection failure',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>{throw new TypeError('Offline')}))
    render(React.createElement(CasesClient,{items:[],templates:[]}))
    fireEvent.click(screen.getByRole('button',{name:'Новый кейс'}))
    const title=screen.getByLabelText('Название *')
    fireEvent.change(title,{target:{value:'New case'}})
    fireEvent.click(screen.getByRole('button',{name:'Создать кейс'}))
    await screen.findByRole('alert')
    expect((title as HTMLInputElement).value).toBe('New case')
    expect((screen.getByRole('button',{name:'Создать кейс'}) as HTMLButtonElement).disabled).toBe(false)
  })
  it('allows retrying login after a connection failure',async()=>{
    vi.stubGlobal('fetch',vi.fn(async()=>{throw new TypeError('Offline')}))
    render(React.createElement(StudioLogin))
    fireEvent.change(screen.getByLabelText('Email'),{target:{value:'qa@example.com'}})
    fireEvent.change(screen.getByLabelText('Пароль'),{target:{value:'qa-password'}})
    fireEvent.click(screen.getByRole('button',{name:'Войти'}))
    await screen.findByRole('alert')
    expect((screen.getByRole('button',{name:'Войти'}) as HTMLButtonElement).disabled).toBe(false)
  })
})
