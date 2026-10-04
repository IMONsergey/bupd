export function studioError(error: unknown) {
  const failure=error as {status?:number;name?:string;data?:{errors?:{path?:string;message?:string}[]}}
  const status=failure.status||500
  if(status===404) return Response.json({error:'Кейс не найден.'},{status})
  if(status===400 || failure.name==='ValidationError') {
    const fields=(failure.data?.errors||[]).map(item=>item.path).filter(Boolean)
    const labels:Record<string,string>={title:'название',media:'медиа',video:'видео',text:'текст',body:'текст',cover:'обложка',items:'элементы',frames:'кадры',steps:'этапы',label:'подпись',value:'значение'}
    const hints=fields.map(path=>{
      const scene=path?.match(/blocks\.(\d+)/)
      const field=path?.split('.').at(-1)||''
      return (scene?'Сцена '+(Number(scene[1])+1)+' — ':'')+(labels[field]||'обязательное поле')
    })
    return Response.json({error:'Проверьте обязательные поля и выбранные файлы.'+(hints.length?' '+hints.join('; '):''),fields},{status:400})
  }
  console.error('Studio request failed',error)
  return Response.json({error:'Не удалось выполнить действие. Повторите попытку.'},{status:500})
}
