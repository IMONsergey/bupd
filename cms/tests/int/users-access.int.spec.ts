import {describe,it,expect,vi} from 'vitest'
import {Users} from '@/collections/Users'
const create=Users.access!.create as any
const update=Users.access!.update as any
describe('Studio account access',()=>{
  it('closes anonymous admin registration after the first account',async()=>{
    const req={user:null,payload:{count:vi.fn().mockResolvedValue({totalDocs:1})}}
    expect(await create({req})).toBe(false)
    req.payload.count.mockResolvedValue({totalDocs:0})
    expect(await create({req})).toBe(true)
  })
  it('allows only administrators to add subsequent accounts',async()=>{
    expect(await create({req:{user:{id:1,role:'admin'}}})).toBe(true)
    expect(await create({req:{user:{id:2,role:'editor'}}})).toBe(false)
  })
  it('limits ordinary account updates to the signed-in user',()=>{
    expect(update({req:{user:{id:2,role:'editor'}}})).toEqual({id:{equals:2}})
    expect(update({req:{user:{id:1,role:'admin'}}})).toBe(true)
    expect(update({req:{user:null}})).toBe(false)
  })
})
