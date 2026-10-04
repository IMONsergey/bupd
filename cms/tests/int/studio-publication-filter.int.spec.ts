import {it,expect,vi,afterEach} from 'vitest'
import React from 'react'
import {render,screen,fireEvent,cleanup} from '@testing-library/react'
import CasesClient from '@/studio/cases/CasesClient'
vi.mock('next/navigation',()=>({useRouter:()=>({push:vi.fn()}),useSearchParams:()=>({get:()=>null})}))
afterEach(cleanup)
it('keeps a published case in the published filter while its changes are a draft',()=>{
  render(React.createElement(CasesClient,{items:[{id:1,title:'QA published',slug:'qa',_status:'draft',isPublished:true,workflowStatus:'review'}],templates:[]}))
  fireEvent.click(screen.getByRole('button',{name:'Опубликовано'}))
  expect(screen.getByRole('link',{name:'Редактировать QA published'}).getAttribute('href')).toBe('/studio/cases/1')
  expect(screen.getByText('Опубликован')).toBeTruthy()
})
