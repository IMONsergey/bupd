import {caseEmbedKeys,normalizeEmbedURL,isOwnCaseEmbed} from '@/lib/caseEmbed'
import type { EditorField } from './editorSchema'
import { serializeDocument, richTextToText } from './document'

export type PublicationIssue = {
  key: string
  severity: 'error' | 'warning'
  label: string
  detail: string
  field: string
  blockIndex?: number
}

const contentKeys = [...caseEmbedKeys,'role','audience','portfolioOrder','title','author','publishedAt','client','year','summary','categories','cover','ogImage','pageBackground','mediaRadius','pageTheme','accent','featured','seoTitle','seoDescription','noIndex','blocks']

// Compare content, not version timestamps, row IDs or editorial workflow status.
export function projectContentSignature(project: Record<string, any>): string {
  const normalize = (value: any): any => Array.isArray(value) ? value.map(normalize)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.keys(value).filter(key => key !== 'id').sort().map(key => [key, normalize(value[key])]))
      : value === undefined || value === null ? '' : value
  const values = Object.fromEntries(contentKeys.map(key => [key, project[key] ?? (({bodyMode:'blocks',embedHeight:6000,embedMobileHeight:9000,embedAutoHeight:false} as Record<string,unknown>)[key] ?? (['blocks','categories'].includes(key) ? [] : ['featured','noIndex'].includes(key) ? false : ''))]))
  return JSON.stringify(normalize(serializeDocument(values)))
}

export function publicationIssues(project: Record<string, any>, schemas: Record<string, EditorField[]>): PublicationIssue[] {
  const issues: PublicationIssue[] = []
  const add = (issue: PublicationIssue) => issues.push(issue)
  const filled = (value: any) => typeof value === 'string' ? Boolean(value.trim()) : value !== null && value !== undefined && value !== ''
  if (!filled(project.title)) add({key:'title',severity:'error',label:'Название страницы',detail:'Укажите название, которое увидит посетитель.',field:'title'})
  if (project.year !== null && project.year !== undefined && project.year !== '' && (!Number.isFinite(Number(project.year)) || Number(project.year) < 2000 || Number(project.year) > 2100)) add({key:'year',severity:'error',label:'Год проекта',detail:'Укажите год от 2000 до 2100.',field:'year'})
  if (project.pageBackground && !/^#[\da-f]{6}$/i.test(project.pageBackground)) add({key:'pageBackground',severity:'error',label:'Фон страницы',detail:'Укажите цвет в формате #RRGGBB.',field:'pageBackground'})
  if (project.mediaRadius != null && project.mediaRadius !== '' && (!Number.isFinite(Number(project.mediaRadius)) || Number(project.mediaRadius)<0 || Number(project.mediaRadius)>80)) add({key:'mediaRadius',severity:'error',label:'Скругление медиа',detail:'Укажите значение от 0 до 80 px.',field:'mediaRadius'})
  const blocks = Array.isArray(project.blocks) ? project.blocks : []
  const embedded=project.kind!=='article'&&project.bodyMode==='embed'
  if(embedded){
    if(!normalizeEmbedURL(project.embedURL)||isOwnCaseEmbed(project.embedURL,project.slug,[process.env.NEXT_PUBLIC_SITE_URL||'https://baev-case-lab.vercel.app',process.env.NEXT_PUBLIC_SERVER_URL||'https://baev-cms.vercel.app']))add({key:'embedURL',severity:'error',label:'Внешний кейс',detail:'Укажите публичную HTTPS-ссылку на страницу кейса.',field:'embedURL'})
    for(const field of ['embedHeight','embedMobileHeight'])if(project[field]!=null&&project[field]!==''&&(!Number.isFinite(Number(project[field]))||Number(project[field])<400||Number(project[field])>50000))add({key:field,severity:'error',label:'Высота внешнего кейса',detail:'Укажите высоту от 400 до 50 000 px.',field})
    if(!blocks[0]?.media&&!project.cover)add({key:'hero-media',severity:'error',label:'Первый экран',detail:'Выберите изображение или видео для обложки кейса.',field:'cover'})
    add({key:'embed-check',severity:'warning',label:'Проверьте внешний кейс',detail:'Откройте предпросмотр на компьютере и телефоне: исходный сайт должен разрешать iframe.',field:'embedURL'})
  }
  if (!embedded&&!blocks.length) add({key:'blocks',severity:'error',label:'На странице нет блоков',detail:'Добавьте хотя бы один блок с содержимым.',field:'blocks'})
  const inspect = (data: Record<string, any>, fields: EditorField[], blockIndex: number, path = '', topField?: string) => {
    for (const field of fields) {
      const value = data?.[field.name]
      const name = path + field.label
      const focusField = topField || field.name
      const key = `blocks.${blockIndex}.${path}${field.name}`
      const fail = (detail: string) => add({key,severity:'error',label:`Блок ${blockIndex + 1} · ${name}`,detail,field:focusField,blockIndex})
      if (field.type === 'array') {
        const rows = Array.isArray(value) ? value : []
        if ((field.required || rows.length > 0) && rows.length < (field.minRows ?? (field.required ? 1 : 0))) fail(`Добавьте минимум ${field.minRows ?? 1} элемента.`)
        if (field.maxRows !== undefined && rows.length > field.maxRows) fail(`Оставьте не больше ${field.maxRows} элементов.`)
        rows.forEach((row, index) => inspect(row, field.fields || [], blockIndex, `${name} ${index + 1} / `, focusField))
        if (!rows.length && field.minRows && !field.required) add({key,severity:'warning',label:`Блок ${blockIndex + 1} · ${name}`,detail:'Этот блок пока пустой. Добавьте содержимое или удалите его.',field:focusField,blockIndex})
      } else {
        if (field.type === 'richText' && field.required && !richTextToText(value).trim()) { fail('Добавьте текст.'); continue }
        if (field.required && !filled(value)) { fail(field.type === 'upload' ? 'Выберите изображение или видео из медиатеки.' : 'Заполните обязательное поле.'); continue }
        if (!filled(value)) continue
        if (field.type === 'number' && (!Number.isFinite(Number(value)) || (field.min !== undefined && Number(value) < field.min) || (field.max !== undefined && Number(value) > field.max))) fail('Проверьте допустимое значение.')
        if (field.options && !field.options.some(option => option.value === value)) fail('Выберите значение из списка.')
      }
    }
  }
  blocks.forEach((block, index) => {
    if(embedded&&!(index===0&&block.blockType==='caseHero'))return
    if(block.blockType==='cta'&&block.buttonURL&&!/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(String(block.buttonURL).trim())) add({key:`blocks.${index}.buttonURL`,severity:'error',label:`Блок ${index+1} · Ссылка кнопки`,detail:'Используйте https://, mailto:, tel: или путь страницы, например /contact.',field:'buttonURL',blockIndex:index})
    if (!schemas[block.blockType]) add({key:`blocks.${index}`,severity:'error',label:`Блок ${index + 1}`,detail:'Тип блока не поддерживается. Замените его через каталог.',field:'blocks',blockIndex:index})
    else inspect(index===0&&block.blockType==='caseHero'?{...block,media:block.media||project.cover}:block, schemas[block.blockType], index)
  })
  if ((project.categories || []).length > 6) add({key:'categories-count',severity:'error',label:'Категории',detail:'Оставьте не больше шести категорий.',field:'categories'})
  if ((project.categories || []).some((item: any) => !filled(item.label))) add({key:'categories',severity:'error',label:'Категории',detail:'Заполните названия категорий или удалите пустые строки.',field:'categories'})
  for (const [field,label,detail] of [
    ['cover','Обложка','Добавьте обложку для карточки в портфолио.'],
    ['summary','Короткое описание','Объясните задачу и результат в нескольких предложениях.'],
    ...(project.kind==='article' ? [['author','Автор','Укажите автора статьи.']] : [['client','Клиент','Укажите, для кого сделан проект.'],['role','Роль BAEV','Коротко укажите вклад команды: посетителю важно понять, что сделали именно вы.']]),
  ]) if (!filled(project[field])) add({key:field,severity:'warning',label,detail,field})
  if (!filled(project.seoDescription) && !filled(project.summary)) add({key:'seoDescription',severity:'warning',label:'Описание в поиске',detail:'Без описания поисковик выберет текст страницы самостоятельно.',field:'seoDescription'})
  for(const field of ['cover','ogImage']){
    const image=project[field]
    if(image&&typeof image==='object'&&image.mimeType&&!image.mimeType.startsWith('image/'))add({key:field+'-format',severity:'error',label:field==='cover'?'Обложка':'Изображение для ссылки',detail:'Здесь нужно изображение. Видео можно разместить в блоках страницы.',field})
  }
  if(String(project.seoTitle||project.title||'').length>70)add({key:'seo-title-length',severity:'warning',label:'Длинный заголовок в поиске',detail:'Заголовок может обрезаться. Проверьте вид ссылки или сократите текст.',field:'seoTitle'})
  if(String(project.seoDescription||project.summary||'').length>180)add({key:'seo-description-length',severity:'warning',label:'Длинное описание в поиске',detail:'Часть описания может не поместиться в результатах поиска.',field:'seoDescription'})
  if (project.noIndex) add({key:'noIndex',severity:'warning',label:'Скрыт от поисковиков',detail:'Страница будет доступна по ссылке, но индексация отключена.',field:'noIndex'})
  return issues
}

export function publicationChanges(previous:string,project:Record<string,any>):string[]{
 let before:Record<string,any>;try{before=JSON.parse(previous)}catch{return []}
 const after=JSON.parse(projectContentSignature(project)),labels:Record<string,string>={title:'Название',summary:'Описание',role:'Роль BAEV',audience:'Аудитория',client:'Клиент',year:'Год',author:'Автор',publishedAt:'Дата статьи',cover:'Обложка',ogImage:'Изображение для ссылки',categories:'Категории',featured:'Избранное',portfolioOrder:'Порядок в портфолио',pageBackground:'Фон',mediaRadius:'Скругление медиа',pageTheme:'Тема',bodyMode:'Способ показа кейса',embedURL:'Адрес внешнего кейса',embedHeight:'Высота iframe',embedMobileHeight:'Высота iframe на телефоне',embedAutoHeight:'Автоматическая высота',seoTitle:'SEO-заголовок',seoDescription:'SEO-описание',noIndex:'Индексация'}
 return Object.keys(after).filter(key=>JSON.stringify(before[key])!==JSON.stringify(after[key])).map(key=>{
  if(key==='blocks'){const a=before.blocks||[],b=after.blocks||[];const changed=b.filter((item:any,index:number)=>JSON.stringify(item)!==JSON.stringify(a[index])).length;return `Содержание: ${changed} изменённых блоков${b.length!==a.length?`, количество ${a.length} → ${b.length}`:''}`}
  return labels[key]||key
 })
}
