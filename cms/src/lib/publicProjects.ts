import {cache} from 'react'
import {getPayload} from 'payload'
import config from '@/payload.config'
export const publicProject=cache(async(slug:string)=>{
  const payload=await getPayload({config})
  const result=await payload.find({collection:'projects',depth:2,draft:false,limit:1,overrideAccess:false,where:{slug:{equals:slug}},select:{title:true,slug:true,summary:true,client:true,year:true,categories:true,blocks:true,bodyMode:true,embedURL:true,embedHeight:true,embedMobileHeight:true,embedAutoHeight:true,cover:true,ogImage:true,pageBackground:true,mediaRadius:true,pageTheme:true,seoTitle:true,seoDescription:true,noIndex:true,canonicalURL:true}})
  return result.docs[0]||null
})
