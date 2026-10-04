export function studioError(error: unknown) {
  const failure=error as {status?:number;name?:string;data?:{errors?:{path?:string;message?:string}[]}}
  const status=failure.status||500
  if(status===404) return Response.json({error:'Кейс не найден.'},{status})
  if(status===400 || failure.name==='ValidationError') {
    const fields=(failure.data?.errors||[]).map(item=>item.path).filter(Boolean)
    return Response.json({error:'Проверьте обязательные поля и выбранные файлы.'+(fields.length?' Поля: '+fields.join(', '):''),fields},{status:400})
  }
  console.error('Studio request failed',error)
  return Response.json({error:'Не удалось выполнить действие. Повторите попытку.'},{status:500})
}
