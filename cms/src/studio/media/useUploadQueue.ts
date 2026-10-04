'use client'

import {useRef,useState} from 'react'
import {createMediaUpload,type UploadProgress} from './mediaUpload'
import type {MediaItem} from './types'

type UploadEntry={id:number;name:string;state:'waiting'|'uploading'|'done'|'error';error?:string;progress?:UploadProgress;run:ReturnType<typeof createMediaUpload>}

export function useUploadQueue(blobEnabled:boolean,onUploaded:(item:MediaItem)=>void,onFinished:()=>void,onBusyChange?:(busy:boolean)=>void){
  const [queue,setQueue]=useState<UploadEntry[]>([])
  const [uploading,setUploading]=useState(false)
  const entries=useRef<UploadEntry[]>([])
  const lock=useRef(false)
  const callbacks=useRef({onUploaded,onFinished,onBusyChange})
  callbacks.current={onUploaded,onFinished,onBusyChange}
  const update=(entry:UploadEntry,patch:Partial<UploadEntry>)=>{Object.assign(entry,patch);setQueue(entries.current.map(item=>({...item})))}
  const run=async()=>{
    if(lock.current)return
    lock.current=true;setUploading(true);callbacks.current.onBusyChange?.(true)
    try{
      for(const entry of entries.current){
        if(entry.state==='done')continue
        update(entry,{state:'uploading',error:undefined})
        try{
          const item=await entry.run(progress=>update(entry,{progress}))
          update(entry,{state:'done'});callbacks.current.onUploaded(item)
        }catch(error){update(entry,{state:'error',error:error instanceof Error?error.message:'Не удалось загрузить файл.'})}
      }
    }finally{
      lock.current=false;setUploading(false);callbacks.current.onBusyChange?.(false);callbacks.current.onFinished()
    }
  }
  const choose=(files:FileList|null)=>{
    if(!files?.length||lock.current)return
    entries.current=Array.from(files,(file,id)=>({id,name:file.name,state:'waiting',run:createMediaUpload(file,blobEnabled)}))
    setQueue(entries.current.map(item=>({...item})));void run()
  }
  return {queue,uploading,choose,retry:()=>void run(),clear:()=>{if(!lock.current){entries.current=[];setQueue([])}}}
}
