export function caseSiteLink(value:string|undefined,siteURL:string){
  const path=value?.trim()||'/contact'
  if(/^\/(?!\/)/.test(path))return siteURL.replace(/\/$/,'')+path
  if(/^(https?:|mailto:|tel:|#)/i.test(path))return path
  return siteURL.replace(/\/$/,'')+'/contact'
}
