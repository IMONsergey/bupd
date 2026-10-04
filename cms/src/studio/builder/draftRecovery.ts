export type EditorSnapshot={blocks:Record<string,any>[];metadata:Record<string,any>}
export type RecoveredDraft={snapshot:EditorSnapshot;at:number;baseUpdatedAt:string}

export function readDraftRecovery(storage:Pick<Storage,'getItem'|'removeItem'>,key:string):RecoveredDraft|null{
  try{
    const value=JSON.parse(storage.getItem(key)||'null')
    if(!value)return null
    if(!Number.isFinite(value.at)||Date.now()-value.at>86400000||!Array.isArray(value.snapshot?.blocks)||!value.snapshot?.metadata||typeof value.snapshot.metadata!=='object'){
      storage.removeItem(key);return null
    }
    return value
  }catch{return null}
}

export function writeDraftRecovery(storage:Pick<Storage,'setItem'>,key:string,snapshot:EditorSnapshot,baseUpdatedAt:string):boolean{
  try{storage.setItem(key,JSON.stringify({snapshot,at:Date.now(),baseUpdatedAt}));return true}catch{return false}
}
