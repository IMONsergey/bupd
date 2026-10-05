import {publicDefaults} from '@/lib/publicCopy'
export default function Process({items=publicDefaults.process}:{items?:typeof publicDefaults.process}){return <ol className="public-process">{items.map((step,index)=><li key={index}><span className="eyebrow">0{index+1}</span><h3>{step.title}</h3><p>{step.body}</p><span className="process-artifact">↳ {step.artifact}</span></li>)}</ol>}
