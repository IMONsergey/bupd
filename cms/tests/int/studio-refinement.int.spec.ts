import {afterEach,describe,expect,it,vi} from 'vitest'
import {act,cleanup,renderHook,waitFor} from '@testing-library/react'
import {blockSearchText,blockShortcut} from '@/studio/builder/editorInteraction'
import {readDraftRecovery} from '@/studio/builder/draftRecovery'
import {useUploadQueue} from '@/studio/media/useUploadQueue'
import {createMediaUpload} from '@/studio/media/mediaUpload'
vi.mock('@/studio/media/mediaUpload',()=>({createMediaUpload:vi.fn()}))
afterEach(()=>{cleanup();vi.resetAllMocks();sessionStorage.clear()})

describe('Refined editor workflows',()=>{
  it('finds text deep in rich text and array captions without matching asset URLs',()=>{
    expect(blockSearchText({title:'Intro',body:{root:{children:[{text:'Deep paragraph'}]}},items:[{caption:'Hidden caption'}],media:{url:'secret-path.jpg',alt:'Landscape'},id:'hidden-id'})).toContain('Deep paragraph')
    expect(blockSearchText({items:[{caption:'Hidden caption'}]})).toContain('Hidden caption')
    expect(blockSearchText({url:'secret-path.jpg',id:'hidden-id'})).toBe('')
  })
  it('reserves block shortcuts without swallowing unrelated modifier combinations',()=>{
    const key={key:'d',ctrlKey:true,metaKey:false,altKey:false,shiftKey:false}
    expect(blockShortcut(key)).toBe('duplicate')
    expect(blockShortcut({...key,ctrlKey:false,metaKey:true})).toBe('duplicate')
    expect(blockShortcut({...key,altKey:true})).toBeNull()
    expect(blockShortcut({...key,ctrlKey:false,key:'ArrowDown',altKey:true})).toBe('down')
    expect(blockShortcut({...key,key:'Delete'})).toBeNull()
  })
  it('expires cached drafts and tolerates inaccessible or corrupted storage',()=>{
    sessionStorage.setItem('draft',JSON.stringify({snapshot:{blocks:[],metadata:{title:'Draft'}},at:Date.now()-86400001}))
    expect(readDraftRecovery(sessionStorage,'draft')).toBeNull();expect(sessionStorage.getItem('draft')).toBeNull()
    sessionStorage.setItem('draft','{invalid');expect(readDraftRecovery(sessionStorage,'draft')).toBeNull()
    expect(readDraftRecovery({getItem:()=>{throw Error('denied')},removeItem:vi.fn()},'draft')).toBeNull()
  })
  it('retains the populated snapshot and server timestamp needed for recovery',()=>{
    const draft={snapshot:{blocks:[{blockType:'mediaFrame',media:{id:1,url:'/media.jpg'}}],metadata:{title:'Unsaved'}},at:Date.now(),baseUpdatedAt:'2026-10-04'}
    sessionStorage.setItem('draft',JSON.stringify(draft));expect(readDraftRecovery(sessionStorage,'draft')).toEqual(draft)
  })
  it('continues past an upload failure and retries only failed tasks using the same receipts',async()=>{
    const first=vi.fn().mockResolvedValue({id:1}),second=vi.fn().mockRejectedValueOnce(Error('Temporary')).mockResolvedValue({id:2}),third=vi.fn().mockResolvedValue({id:3})
    vi.mocked(createMediaUpload).mockReturnValueOnce(first).mockReturnValueOnce(second).mockReturnValueOnce(third)
    const uploaded=vi.fn(),finished=vi.fn(),busy=vi.fn()
    const {result}=renderHook(()=>useUploadQueue(true,uploaded,finished,busy))
    act(()=>result.current.choose([new File(['a'],'a.png'),new File(['b'],'b.png'),new File(['c'],'c.png')] as unknown as FileList))
    await waitFor(()=>expect(result.current.uploading).toBe(false))
    expect(result.current.queue.map(item=>item.state)).toEqual(['done','error','done'])
    act(()=>result.current.retry());await waitFor(()=>expect(result.current.uploading).toBe(false))
    expect(result.current.queue.map(item=>item.state)).toEqual(['done','done','done'])
    expect(first).toHaveBeenCalledTimes(1);expect(second).toHaveBeenCalledTimes(2);expect(third).toHaveBeenCalledTimes(1)
    expect(createMediaUpload).toHaveBeenCalledTimes(3);expect(uploaded).toHaveBeenCalledTimes(3)
    expect(busy.mock.calls).toEqual([[true],[false],[true],[false]])
  })
})
