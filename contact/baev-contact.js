(() => {
  const CMS = ['localhost', '127.0.0.1'].includes(location.hostname) ? 'http://localhost:3001' : 'https://baev-cms.vercel.app'
  const params = new URLSearchParams(location.search)
  let busy=false
  function prepare(form){
    for(const [name,autocomplete] of [['Name','name'],['Email','email']]){
      const input=form.elements.namedItem(name)
      if(input){input.required=true;input.autocomplete=autocomplete}
    }
    const message=form.elements.namedItem('MessageEmail')
    if(message){message.required=true;message.placeholder='Расскажите о задаче, сроках и формате проекта';message.setAttribute('aria-label','Задача - обязательное поле')}
    let status=form.querySelector('.baev-form-status')
    if(!status){status=document.createElement('p');status.className='baev-form-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');form.append(status)}
    if(!form.querySelector('.baev-form-context')){
      const context=document.createElement('p');context.className='baev-form-context'
      const project=params.get('project')?.slice(0,200)
      context.textContent=project?'Вас заинтересовал кейс «'+project+'». Расскажите о своей задаче.':'Все три поля обязательны. Можно также написать на hello@baev.agency.'
      form.prepend(context)
    }
    return status
  }
  function preparePage(){document.querySelectorAll('form.framer-hqhav0').forEach(prepare)}
  if(document.readyState==='complete')preparePage();else addEventListener('load',preparePage,{once:true})
  document.addEventListener('submit',async event=>{
    const form=event.target
    if(!(form instanceof HTMLFormElement)||!form.matches('form.framer-hqhav0'))return
    event.preventDefault();event.stopImmediatePropagation()
    const status=prepare(form)
    if(busy||!form.reportValidity())return
    const data=new FormData(form)
    const name=String(data.get('Name')||'').trim(),email=String(data.get('Email')||'').trim(),message=String(data.get('MessageEmail')||'').trim()
    if(!name||!email||!message){status.textContent='Заполните имя, почту и описание задачи.';return}
    const submit=form.querySelector('button[type="submit"]'),text=submit?.querySelector('p'),label=text?.textContent||'Отправить запрос'
    const setBusy=value=>{busy=value;form.setAttribute('aria-busy',String(value));if(submit)submit.disabled=value;if(text)text.textContent=value?'Отправляем…':label}
    setBusy(true);status.textContent='Отправляем вашу задачу…'
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000)
    try{
      const project=params.get('project')?.slice(0,200)
      const response=await fetch(CMS+'/api/leads/submit',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,message:message+(project?'\n\nЗаинтересовал кейс: '+project:''),website:String(data.get('website')||'').trim(),source:'site',service:'other',utm_source:params.get('utm_source'),utm_medium:params.get('utm_medium'),utm_campaign:params.get('utm_campaign'),utm_content:params.get('utm_content')})})
      if(!response.ok)throw new Error('submit_failed')
      form.reset();status.textContent='Спасибо. Задача отправлена команде BAEV. Ответ придёт на указанную почту.'
    }catch{
      status.replaceChildren(document.createTextNode('Не удалось подтвердить отправку. Ваш текст сохранён в форме. Можно повторить попытку или '))
      const link=document.createElement('a');link.href='mailto:hello@baev.agency';link.textContent='написать нам на почту';status.append(link)
    }finally{clearTimeout(timer);setBusy(false)}
  },true)
})()
