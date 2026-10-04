export const caseStatuses=['all','draft','review','ready','paused','published','changes','issues'] as const
export const caseSorts=['updated','title','year'] as const
export type CaseViewItem={id:string|number;title:string;slug:string;client?:string|null;year?:number|null;workflowStatus?:string|null;_status?:string|null;isPublished?:boolean;hasUnpublishedChanges?:boolean;issueCount?:number;updatedAt?:string|null}
export const onSite=(item:CaseViewItem)=>item.isPublished??item._status==='published'
export function matchesCaseStatus(item:CaseViewItem,status:string){
  if(status==='all')return true
  if(status==='published')return onSite(item)
  if(status==='changes')return Boolean(item.hasUnpublishedChanges)
  if(status==='issues')return Boolean(item.issueCount)
  if(status==='ready')return item.workflowStatus==='ready'&&item._status!=='published'
  return (item.workflowStatus||'draft')===status
}
export function filterCases(items:CaseViewItem[],query:string,status:string,sort:string){
  const q=query.trim().toLocaleLowerCase('ru')
  return items.filter(item=>matchesCaseStatus(item,status)&&(!q||[item.title,item.client,item.slug,item.year].some(value=>String(value??'').toLocaleLowerCase('ru').includes(q))))
    .sort((a,b)=>sort==='title'?a.title.localeCompare(b.title,'ru'):sort==='year'?(Number(b.year)||0)-(Number(a.year)||0)||a.title.localeCompare(b.title,'ru'):(Date.parse(b.updatedAt||'')||0)-(Date.parse(a.updatedAt||'')||0)||a.title.localeCompare(b.title,'ru'))
}
