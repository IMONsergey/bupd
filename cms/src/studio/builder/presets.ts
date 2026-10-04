import { textToRichText } from './document'

export const blockDefaults:Record<string,Record<string,any>>={
  caseHero:{blockType:'caseHero',eyebrow:'Новый кейс',title:'Заголовок кейса',dek:'Короткое описание',layout:'editorial',theme:'dark'},
  manifesto:{blockType:'manifesto',kicker:'Идея',text:'Крупная мысль, которая меняет ритм истории.',size:'xl',align:'left',theme:'dark'},
  fullBleedMedia:{blockType:'fullBleedMedia',caption:'',height:'screen',fit:'cover',theme:'media'},
  splitMedia:{blockType:'splitMedia',ratio:'1-1',gap:'s',theme:'dark'},
  mediaMosaic:{blockType:'mediaMosaic',items:[],layout:'editorial',theme:'dark'},
  stickyStory:{blockType:'stickyStory',chapter:'Глава',title:'Заголовок главы',body:'Описание логики и решения.',frames:[],pin:'copy',theme:'dark'},
  metrics:{blockType:'metrics',items:[{value:'00',label:'Результат',note:''}],style:'oversized',theme:'dark'},
  beforeAfter:{blockType:'beforeAfter',beforeLabel:'До',afterLabel:'После',mode:'drag',theme:'dark'},
  quote:{blockType:'quote',text:'Ключевая цитата или вывод.',author:'',role:'',size:'xl',theme:'light'},
  process:{blockType:'process',title:'Процесс',steps:[{number:'01',title:'Этап',body:'Описание'}],mode:'timeline',theme:'dark'},
  gallery:{blockType:'gallery',items:[],mode:'drag',theme:'dark'},
  deviceShowcase:{blockType:'deviceShowcase',device:'screen',caption:'',float:true,theme:'dark'},
  credits:{blockType:'credits',title:'Команда',items:[{role:'Role',name:'Name'}],theme:'dark'},
  nextProject:{blockType:'nextProject',label:'Следующий проект',theme:'dark'},
  horizontalStory:{blockType:'horizontalStory',title:'Последовательность',scenes:[],mode:'snap',theme:'dark'},
  layeredMedia:{blockType:'layeredMedia',layers:[],mode:'stack',theme:'dark'},
  typographyTakeover:{blockType:'typographyTakeover',kicker:'',text:'Большая идея',mode:'center',align:'left',theme:'dark'},
  videoChapter:{blockType:'videoChapter',title:'Видео-глава',caption:'',autoplay:true,loop:true,mode:'inline',theme:'dark'},
  comparison:{blockType:'comparison',title:'Сравнение',items:[{title:'Вариант',value:'',body:''}],mode:'columns',theme:'dark'},
  artifactStack:{blockType:'artifactStack',items:[],mode:'fan',theme:'dark'},
  textMedia:{blockType:'textMedia',eyebrow:'',title:'Заголовок',layout:'text-left',theme:'dark'},
  cta:{blockType:'cta',title:'Обсудим следующий проект?',body:'',buttonLabel:'Связаться',buttonURL:'/contact',mode:'statement',theme:'light'},
}


Object.assign(blockDefaults, {
  editorialText: {blockType:'editorialText',eyebrow:'',title:'',body:textToRichText('Расскажите о задаче, идее или результате проекта.'),width:'reading',align:'left',spacing:'medium'},
  mediaFrame: {blockType:'mediaFrame',caption:'',width:'wide',aspect:'auto',align:'center',spacing:'medium'},
  mediaGrid: {blockType:'mediaGrid',items:[{media:null,caption:''},{media:null,caption:''}],columns:'2',gap:16,width:'full',aspect:'square',spacing:'small'},
  textColumns: {blockType:'textColumns',items:[{title:'Задача',body:'Что предстояло изменить.'},{title:'Решение',body:'Как мы к этому подошли.'}],width:'wide',spacing:'medium'},
  projectFacts: {blockType:'projectFacts',items:[{label:'Услуги',value:'Брендинг, дизайн'},{label:'Год',value:'2026'}],width:'wide',spacing:'medium'},
  sectionBreak: {blockType:'sectionBreak',eyebrow:'',title:'',line:false,height:80,width:'wide'},
})

blockDefaults.articleText = { blockType: 'articleText', title: 'Название раздела', body: textToRichText('Раскройте одну мысль. Добавьте примеры, факты и выводы.'), width: 'reading', theme: 'light' }

export type PagePreset = { id: string; kind: 'case' | 'article'; title: string; description: string; blocks: Record<string, any>[] }
const block = (type: string, values: Record<string, any> = {}) => ({ ...blockDefaults[type], ...values })
const hero = () => block('caseHero', { title: '', dek: '' })
const idea = (title: string) => block('manifesto', { kicker: title, text: 'Опишите '+title.toLowerCase()+' проекта.', size: 'l' })
const photo = () => block('fullBleedMedia', { height: 'auto', fit: 'contain' })
const text = (title: string) => block('articleText', { title })
const contact = () => block('cta')

export const pagePresets: PagePreset[] = [
  {id:'baev-minimal',kind:'case',title:'Минималистичный',description:'Спокойный текст, большие изображения и ровная сетка.',blocks:[hero(),block('textColumns'),block('mediaFrame'),block('mediaGrid'),block('editorialText',{title:'Результат'}),block('projectFacts')]},
  { id: 'baev-brand', kind: 'case', title: 'Брендинг', description: 'От задачи и идеи — к системе и её применению.', blocks: [hero(), idea('Задачу'), idea('Идею'), photo(), block('splitMedia'), photo(), block('credits'), contact()] },
  { id: 'baev-digital', kind: 'case', title: 'Сайт / digital', description: 'Контекст, решение, экраны и результат.', blocks: [hero(), idea('Задачу'), block('textMedia', { title: 'Решение', body: textToRichText('Как устроен продукт и почему выбрано это решение.') }), block('deviceShowcase', { device: 'browser' }), block('splitMedia'), block('metrics', { items: [{ value: '', label: 'Результат', note: 'Добавьте подтверждённые данные' }] }), contact()] },
  { id: 'baev-event', kind: 'case', title: 'Презентация / событие', description: 'Концепция, ключевые кадры и впечатление.', blocks: [hero(), idea('Концепцию'), photo(), block('splitMedia'), photo(), block('quote', { text: 'Добавьте отзыв участника или клиента.' }), block('credits'), contact()] },
  { id: 'baev-short', kind: 'case', title: 'Короткий кейс', description: 'Одна идея, сильные изображения и контакт.', blocks: [hero(), idea('Идею'), photo(), contact()] },
  { id: 'baev-essay', kind: 'article', title: 'Статья / мнение', description: 'Вступление, аргументы, цитата и вывод.', blocks: [text('Контекст'), text('Главная мысль'), block('quote', { text: 'Ключевая мысль статьи.', size: 'l', theme: 'light' }), text('Вывод')] },
  { id: 'baev-guide', kind: 'article', title: 'Практическое руководство', description: 'Задача, понятные шаги, пример и итог.', blocks: [text('Что разберём'), block('process', { title: 'Шаг за шагом', theme: 'light', steps: [{ number: '01', title: 'Первый шаг', body: 'Что нужно сделать и на что обратить внимание.' }, { number: '02', title: 'Следующий шаг', body: 'Как проверить результат.' }] }), text('Пример'), text('Что дальше')] },
  { id: 'baev-news', kind: 'article', title: 'Новость студии', description: 'Короткий материал с фотографией и деталями.', blocks: [text('Что произошло'), { ...photo(), theme: 'light' }, text('Детали')] },
]

export function presetBlocks(id: string, title: string) {
  const preset = pagePresets.find(item => item.id === id)
  if (!preset) return null
  return structuredClone(preset.blocks).map(item => item.blockType === 'caseHero' ? { ...item, title } : item)
}

export type BlockVariant = { id: string; title: string; values: Record<string, any> }
export const blockVariants: Record<string, BlockVariant[]> = {
  caseHero: [{ id: 'editorial', title: 'Редакционная', values: { layout: 'editorial' } }, { id: 'full', title: 'Крупное медиа', values: { layout: 'fullscreen' } }],
  manifesto: [{ id: 'idea', title: 'Идея', values: { kicker: 'Идея', size: 'xl', align: 'left' } }, { id: 'intro', title: 'Вступление', values: { kicker: '', size: 'l', align: 'left' } }, { id: 'statement', title: 'Акцент', values: { kicker: '', size: 'display', align: 'center' } }],
  fullBleedMedia: [{ id: 'natural', title: 'Целиком', values: { height: 'auto', fit: 'contain' } }, { id: 'screen', title: 'На весь экран', values: { height: 'screen', fit: 'cover' } }],
  splitMedia: [{ id: 'equal', title: 'Поровну', values: { ratio: '1-1', gap: 's' } }, { id: 'left', title: 'Акцент слева', values: { ratio: '2-1', gap: 's' } }, { id: 'right', title: 'Акцент справа', values: { ratio: '1-2', gap: 's' } }],
  textMedia: [{ id: 'left', title: 'Текст слева', values: { layout: 'text-left' } }, { id: 'right', title: 'Текст справа', values: { layout: 'text-right' } }],
  articleText: [{ id: 'reading', title: 'Для чтения', values: { width: 'reading' } }, { id: 'wide', title: 'Широкая колонка', values: { width: 'wide' } }],
  deviceShowcase: [{ id: 'browser', title: 'Браузер', values: { device: 'browser' } }, { id: 'phone', title: 'Телефон', values: { device: 'phone' } }, { id: 'print', title: 'Печать', values: { device: 'print' } }],
  metrics: [{ id: 'large', title: 'Крупные числа', values: { style: 'oversized' } }, { id: 'cards', title: 'Карточки', values: { style: 'cards' } }],
  quote: [{ id: 'reading', title: 'Компактная', values: { size: 'l' } }, { id: 'big', title: 'Крупная', values: { size: 'xl' } }],
  cta: [{ id: 'statement', title: 'Крупный заголовок', values: { mode: 'statement' } }, { id: 'minimal', title: 'Компактный контакт', values: { mode: 'minimal' } }],
}


const mediaItems = (count:number) => Array.from({length:count},()=>({media:null,caption:''}))
Object.assign(blockVariants, {
  editorialText: [
    {id:'intro',title:'Короткое вступление',values:{title:'',width:'reading',align:'left'}},
    {id:'heading',title:'Заголовок и текст',values:{title:'Идея проекта',width:'reading',align:'left'}},
    {id:'wide',title:'Широкая колонка',values:{title:'',width:'wide',align:'left'}},
    {id:'center',title:'Текст по центру',values:{title:'Главная мысль',width:'reading',align:'center'}},
  ],
  mediaFrame: [
    {id:'wide',title:'Изображение с полями',values:{width:'wide',aspect:'auto'}},
    {id:'reading',title:'Узкое изображение',values:{width:'reading',aspect:'auto'}},
    {id:'full',title:'Во всю ширину',values:{width:'full',spacing:'none',aspect:'auto'}},
    {id:'portrait',title:'Вертикальный кадр',values:{width:'reading',aspect:'portrait'}},
    {id:'square',title:'Квадратный кадр',values:{width:'wide',aspect:'square'}},
  ],
  mediaGrid: [
    {id:'two',title:'Два кадра',values:{columns:'2',aspect:'classic',items:mediaItems(2)}},
    {id:'three',title:'Три кадра',values:{columns:'3',aspect:'portrait',items:mediaItems(3)}},
    {id:'four',title:'Четыре в ряд',values:{columns:'4',aspect:'square',items:mediaItems(4)}},
    {id:'grid',title:'Сетка 2 × 2',values:{columns:'2',aspect:'square',items:mediaItems(4)}},
    {id:'portrait',title:'Два вертикальных',values:{columns:'2',aspect:'portrait',items:mediaItems(2)}},
  ],
  textColumns: [
    {id:'two',title:'Задача и решение',values:{items:[{title:'Задача',body:'Опишите исходную задачу.'},{title:'Решение',body:'Расскажите о выбранном решении.'}]}},
    {id:'three',title:'Три колонки текста',values:{items:[{title:'Контекст',body:'С чего всё началось.'},{title:'Подход',body:'Что мы сделали.'},{title:'Результат',body:'Что изменилось.'}]}},
  ],
  projectFacts: [{id:'facts',title:'Детали проекта',values:{}}],
  sectionBreak: [
    {id:'space',title:'Свободное пространство',values:{title:'',line:false,height:96}},
    {id:'line',title:'Тонкая линия',values:{title:'',line:true,height:64}},
    {id:'heading',title:'Название раздела',values:{eyebrow:'02',title:'Новая глава',line:false,height:80}},
  ],
})

export const minimalBlockTypes = ['editorialText','mediaFrame','mediaGrid','textColumns','projectFacts','sectionBreak']
