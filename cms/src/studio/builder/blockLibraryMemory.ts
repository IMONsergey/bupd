export type BlockLibraryMemory={version:1;favorites:string[];recent:string[]}
export const blockLibraryKey='studio:block-library:v1'
export function readBlockLibraryMemory(storage:Pick<Storage,'getItem'>):BlockLibraryMemory{
  const empty:BlockLibraryMemory={version:1,favorites:[],recent:[]}
  try{
    const value=JSON.parse(storage.getItem(blockLibraryKey)||'null')
    if(value?.version!==1)return empty
    const strings=(items:unknown,limit:number)=>Array.isArray(items)?[...new Set(items.filter((item):item is string=>typeof item==='string'))].slice(0,limit):[]
    return {version:1,favorites:strings(value.favorites,100),recent:strings(value.recent,8)}
  }catch{return empty}
}
