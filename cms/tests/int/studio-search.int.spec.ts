import {it,expect,vi,afterEach} from 'vitest'
import {GET} from '@/app/(payload)/api/studio/search/route'
import {getStudioSession} from '@/studio/lib/auth'

vi.mock('@/studio/lib/auth',()=>({getStudioSession:vi.fn(),canContent:(role:string)=>['admin','editor'].includes(role),studioRole:(user:any)=>user?.role||''}))
afterEach(()=>vi.resetAllMocks())

it('requires authentication for search',async()=>{
  vi.mocked(getStudioSession).mockResolvedValue({payload:{} as any,user:null})
  expect((await GET(new Request('https://test/api/studio/search?q=secret'))).status).toBe(401)
})
it('does not expose content to a sales-only account',async()=>{
  const find=vi.fn()
  vi.mocked(getStudioSession).mockResolvedValue({payload:{find} as any,user:{role:'sales'} as any})
  const result=await GET(new Request('https://test/api/studio/search?q=secret'))
  expect(await result.json()).toEqual({docs:[]})
  expect(find).not.toHaveBeenCalled()
})
it('searches drafts with a bounded query and returns only navigation data',async()=>{
  const find=vi.fn(async({collection}:any)=>collection==='articles'?{docs:[],totalDocs:0}:({docs:[{id:1,title:'Кейс',client:'Клиент',slug:'case',internalNotes:'private'}],totalDocs:1}))
  vi.mocked(getStudioSession).mockResolvedValue({payload:{find} as any,user:{role:'editor'} as any})
  const result=await GET(new Request('https://test/api/studio/search?q='+('a'.repeat(150))))
  expect(result.headers.get('Cache-Control')).toContain('no-store')
  expect(await result.json()).toEqual({docs:[{id:1,title:'Кейс',client:'Клиент',slug:'case',kind:'case'}],totalDocs:1})
  expect(find).toHaveBeenCalledWith(expect.objectContaining({draft:true,limit:8,where:{or:[{title:{contains:'a'.repeat(80)}},{client:{contains:'a'.repeat(80)}},{slug:{contains:'a'.repeat(80)}}]}}))
})
