export function responsiveImage(value:any){
  if(!value?.url)return {}
  const ratio=value.width&&value.height?value.width/value.height:null
  // Cropped thumbnails must not replace the full composition of an image.
  const candidates=Object.values(value.sizes||{}).filter((item:any)=>item?.url&&item.width&&item.height&&ratio&&Math.abs(item.width/item.height-ratio)<.025) as any[]
  if(value.width)candidates.push(value)
  const unique=[...new Map(candidates.map(item=>[item.width,item])).values()].sort((a,b)=>a.width-b.width)
  return unique.length>1?{srcSet:unique.map(item=>item.url+' '+item.width+'w').join(', '),sizes:'(max-width: 809px) 100vw, (max-width: 1199px) calc(100vw - 280px), calc(100vw - 340px)'}:{}
}
