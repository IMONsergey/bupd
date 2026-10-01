import StudioPipeline from '@/studio/components/StudioPipeline'
import { requireSalesUser } from '@/studio/lib/auth'

export default async function PipelinePage(){
  const {payload}=await requireSalesUser()
  const [result,companies,users]=await Promise.all([
    payload.find({collection:'deals',limit:200,sort:'-updatedAt',depth:1,overrideAccess:true}),
    payload.find({collection:'companies',limit:200,sort:'name',depth:0,overrideAccess:true}),
    payload.find({collection:'users',limit:100,sort:'name',depth:0,overrideAccess:true}),
  ])
  const deals=(result.docs as any[]).filter((deal)=>deal.stage!=='lost').map((deal)=>({
    id:deal.id,title:deal.title,stage:deal.stage,value:deal.value,currency:deal.currency,probability:deal.probability,
    nextActionAt:deal.nextActionAt,notes:deal.notes,owner:deal.owner,
    company:deal.company&&typeof deal.company==='object'?{id:deal.company.id,name:deal.company.name}:deal.company,
  }))
  return <StudioPipeline initialDeals={deals} companies={companies.docs as any} users={users.docs as any}/>
}
