export const publicDefaults = {
  headline:'Помогаем сложным идеям звучать ясно.',
  intro:'Стратегия, сценарий и визуальная система для презентаций, выступлений и событий.',
  about:'BAEV — агентство визуальных коммуникаций. Соединяем содержание и дизайн, чтобы важные идеи было легко понять, увидеть и запомнить.',
  capabilities:[
    {title:'Объяснить сложное',body:'Собираем материал в понятную историю: от ключевой мысли до структуры презентации.',link:'/work?category=Презентация',label:'Презентации'},
    {title:'Выступить убедительно',body:'Создаём визуальный язык выступлений, конференций и стратегических сессий.',link:'/work?category=Стратегическая%20сессия',label:'События и выступления'},
    {title:'Собрать единый образ',body:'Развиваем идею в систему, которая работает на экране, в пространстве и в коммуникации бренда.',link:'/work?category=Брендинг',label:'Визуальные системы'},
  ],
  process:[
    {title:'Разобраться',body:'Задача, аудитория, контекст и ограничения. Определяем, что человек должен понять и сделать.',artifact:'Бриф и ключевая мысль'},
    {title:'Выстроить историю',body:'Расставляем акценты, проверяем аргументы и собираем логику повествования.',artifact:'Структура и сценарий'},
    {title:'Найти форму',body:'Создаём визуальный язык и проверяем его на ключевых фрагментах.',artifact:'Концепция и дизайн-система'},
    {title:'Подготовить к работе',body:'Собираем материалы в согласованные форматы и проверяем детали перед передачей.',artifact:'Готовые материалы и исходники'},
  ],
}
export function publicContent(settings: unknown): typeof publicDefaults {
 const value=(settings as {publicContent?:Record<string,unknown>})?.publicContent
 if(!value||typeof value!=='object')return publicDefaults
 const text=(key:'headline'|'intro'|'about')=>typeof value[key]==='string'&&value[key].trim()?value[key]:publicDefaults[key]
 const rows=<T extends Record<string,string>>(raw:unknown,fallback:T[]):T[]=>Array.isArray(raw)&&raw.length&&raw.length<=8&&raw.every(row=>row&&Object.keys(fallback[0]).every(key=>typeof row[key]==='string'))?raw:fallback
 return {headline:text('headline'),intro:text('intro'),about:text('about'),capabilities:rows(value.capabilities,publicDefaults.capabilities),process:rows(value.process,publicDefaults.process)}
}
