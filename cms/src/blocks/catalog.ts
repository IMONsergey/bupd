export type BlockCatalogItem = {
  slug: string
  number: string
  title: string
  description: string
  group: 'Narrative' | 'Media' | 'Data' | 'Interaction' | 'System'
  modes: string[]
}

export const blockCatalog: BlockCatalogItem[] = [
  { slug:'caseHero', number:'01', title:'Первый экран', description:'Первый экран кейса: название, контекст и ключевой визуал.', group:'Narrative', modes:['editorial','media-first','fullscreen'] },
  { slug:'manifesto', number:'02', title:'Крупный текст', description:'Крупное утверждение или смысловой перелом в истории.', group:'Narrative', modes:['m','l','xl','display'] },
  { slug:'fullBleedMedia', number:'03', title:'Медиа целиком', description:'Изображение или видео во всю ширину/высоту сцены.', group:'Media', modes:['70vh','screen','120vh','contain'] },
  { slug:'splitMedia', number:'04', title:'Два изображения', description:'Два артефакта рядом с управляемой пропорцией.', group:'Media', modes:['1–1','1–2','2–1'] },
  { slug:'mediaMosaic', number:'05', title:'Мозаика', description:'Редакционная сетка из нескольких изображений.', group:'Media', modes:['editorial','grid','rail','staggered'] },
  { slug:'stickyStory', number:'06', title:'История с фиксацией', description:'Фиксированный смысл и сменяющиеся визуальные сцены.', group:'Interaction', modes:['pin copy','pin media'] },
  { slug:'metrics', number:'07', title:'Результаты', description:'Крупные цифры, KPI и результаты проекта.', group:'Data', modes:['rail','cards','oversized'] },
  { slug:'beforeAfter', number:'08', title:'До и после', description:'Сравнение исходного и финального состояния.', group:'Interaction', modes:['drag','toggle','split'] },
  { slug:'quote', number:'09', title:'Цитата', description:'Цитата клиента или ключевой вывод крупной типографикой.', group:'Narrative', modes:['l','xl','display'] },
  { slug:'process', number:'10', title:'Этапы работы', description:'Этапы работы и логика принятия решений.', group:'Narrative', modes:['timeline','accordion','sticky'] },
  { slug:'gallery', number:'11', title:'Галерея', description:'Галерея с drag, cursor или filmstrip-навигацией.', group:'Interaction', modes:['drag','cursor','stack','filmstrip'] },
  { slug:'deviceShowcase', number:'12', title:'Макет устройства', description:'Фокусная демонстрация сайта, экрана, печати или устройства.', group:'Media', modes:['browser','phone','screen','print'] },
  { slug:'credits', number:'13', title:'Команда', description:'Команда и роли в проекте.', group:'System', modes:['table'] },
  { slug:'nextProject', number:'14', title:'Следующий проект', description:'Финальный переход в следующий кейс.', group:'System', modes:['cover','minimal'] },
  { slug:'horizontalStory', number:'15', title:'Горизонтальная история', description:'Горизонтальная последовательность сцен внутри вертикального скролла.', group:'Interaction', modes:['snap','scrub'] },
  { slug:'layeredMedia', number:'16', title:'Медиа слоями', description:'Несколько артефактов слоями с глубиной и параллаксом.', group:'Interaction', modes:['stack','parallax','float'] },
  { slug:'typographyTakeover', number:'17', title:'Типографика', description:'Экран, построенный почти целиком на сильной типографике.', group:'Narrative', modes:['center','edge','marquee'] },
  { slug:'videoChapter', number:'18', title:'Видео', description:'Видео-глава с подписью, постером и режимом воспроизведения.', group:'Media', modes:['inline','full','sticky'] },
  { slug:'comparison', number:'19', title:'Сравнение', description:'Сопоставление вариантов, систем или результатов.', group:'Data', modes:['columns','table','cards'] },
  { slug:'artifactStack', number:'20', title:'Стопка макетов', description:'Стопка презентаций, макетов или материалов с раскрытием по наведению.', group:'Interaction', modes:['fan','stack','spread'] },
  { slug:'textMedia', number:'21', title:'Текст и медиа', description:'Базовый, но управляемый редакционный блок текст + визуал.', group:'Narrative', modes:['text-left','text-right','balanced'] },
  { slug:'cta', number:'22', title:'Контакт', description:'Финальная конверсионная сцена с переходом к контакту.', group:'System', modes:['minimal','statement','media'] },
]

blockCatalog.push(
  {slug:'editorialText',number:'23',title:'Текстовая колонка',description:'Спокойный заголовок и текст без декоративных элементов.',group:'Narrative',modes:['reading','wide']},
  {slug:'mediaFrame',number:'24',title:'Медиа с полями',description:'Фото или видео с выбранной шириной и подписью.',group:'Media',modes:['full','wide','reading']},
  {slug:'mediaGrid',number:'25',title:'Ровная медиасетка',description:'Два, три или четыре медиа в ряд; сетка 2×2.',group:'Media',modes:['2','3','4']},
  {slug:'textColumns',number:'26',title:'Колонки текста',description:'Задача и решение или три коротких мысли рядом.',group:'Narrative',modes:['2','3']},
  {slug:'projectFacts',number:'27',title:'Детали проекта',description:'Услуги, сроки и другие данные в простой таблице.',group:'Data',modes:['rows']},
  {slug:'sectionBreak',number:'28',title:'Разделитель',description:'Пауза, тонкая линия или название следующего раздела.',group:'System',modes:['space','line','heading']},
)

export const catalogBySlug = Object.fromEntries(blockCatalog.map((item) => [item.slug, item]))

export const blockThumbnail = (slug: string) => `/block-thumbs/${slug}.svg`

export const articleCatalog: BlockCatalogItem[] = [
  { slug: 'articleText', number: '01', title: 'Текст статьи', description: 'Заголовки, абзацы, списки, выделения и ссылки в удобной колонке.', group: 'Narrative', modes: ['reading', 'wide'] },
  ...blockCatalog.filter(item => ['fullBleedMedia', 'splitMedia', 'mediaMosaic', 'quote', 'process', 'gallery', 'videoChapter', 'textMedia', 'cta', 'metrics'].includes(item.slug)),
]
