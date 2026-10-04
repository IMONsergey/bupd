export const caseEmbedKeys = ['bodyMode','embedURL','embedHeight','embedMobileHeight','embedAutoHeight'] as const

export function normalizeEmbedURL(value:unknown):string|null {
  if(typeof value!=='string'||!value.trim())return null
  try {
    const url=new URL(value.trim())
    if(url.protocol!=='https:'||url.username||url.password||url.port&&url.port!=='443')return null
    const host=url.hostname.toLowerCase()
    if(!host.includes('.')||host.endsWith('.localhost')||host.endsWith('.local')||host.endsWith('.internal')||/^\d+(\.\d+){3}$/.test(host)||host.includes(':'))return null
    if(/^\/(studio|admin|api|preview)(\/|$)/i.test(url.pathname))return null
    return url.href
  }catch{return null}
}

export function embedHeight(value:unknown,fallback:number){
  const height=Number(value)
  return Number.isFinite(height)&&height>=400&&height<=50000?Math.round(height):fallback
}

export function validEmbedMessage(event:MessageEvent,source:Window|null,url:string):number|null {
  if(!source||event.source!==source||event.origin!==new URL(url).origin||event.data?.type!=='baev:embed-size')return null
  const height=event.data.height
  return typeof height==='number'&&Number.isFinite(height)&&height>=200&&height<=50000?Math.ceil(height):null
}

export function embedResizeScript(origins:string[]){
  return `<script>\n(() => {\n  const allowed = ${JSON.stringify(origins)};\n  let target = '', last = 0, frame = 0;\n  const send = () => {\n    cancelAnimationFrame(frame);\n    frame = requestAnimationFrame(() => {\n      const height = Math.ceil(Math.max(200, (document.querySelector('[data-baev-embed-root]') || document.body).scrollHeight, (document.querySelector('[data-baev-embed-root]') || document.body).getBoundingClientRect().height));\n      if (target && height !== last && height >= 200 && height <= 50000) {\n        last = height;\n        parent.postMessage({type:'baev:embed-size',height}, target);\n      }\n    });\n  };\n  addEventListener('message', event => {\n    if (event.source !== parent || !allowed.includes(event.origin) || event.data?.type !== 'baev:embed-init') return;\n    target = event.origin; last = 0; send();\n  });\n  const start = () => { new ResizeObserver(send).observe(document.querySelector('[data-baev-embed-root]') || document.body); addEventListener('resize', send); document.fonts?.ready.then(send); };\n  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start, {once:true}); else start();\n})();\n<\/script>`
}

export function isOwnCaseEmbed(value:unknown,slug:unknown,origins:string[]){
  const normalized=normalizeEmbedURL(value)
  if(!normalized||typeof slug!=='string')return false
  const url=new URL(normalized)
  return origins.some(origin=>{try{return new URL(origin).origin===url.origin}catch{return false}})&&url.pathname.replace(/\/$/,'')==='/work/'+encodeURIComponent(slug)
}
