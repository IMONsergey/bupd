import type { Field } from 'payload'
import { CaseBlocks } from '@/blocks/caseBlocks'

export type EditorField = {
  name: string
  label: string
  type: string
  required?: boolean
  defaultValue?: unknown
  min?: number
  max?: number
  minRows?: number
  maxRows?: number
  options?: { label: string; value: string }[]
  fields?: EditorField[]
}

const choiceLabels: Record<string, string> = {
  dark:'Тёмная', light:'Светлая', media:'На фоне медиа', editorial:'Редакционная',
  'media-first':'Медиа в центре', fullscreen:'Во весь экран', 'text-left':'Текст слева',
  'text-right':'Текст справа', balanced:'Равные колонки', auto:'По пропорциям файла',
  screen:'Высота экрана', cover:'Заполнить', contain:'Вписать целиком', none:'Без',
  xs:'Минимальный', s:'Маленький', m:'Средний', l:'Большой', xl:'Крупный', display:'Очень крупный',
  left:'Слева', center:'По центру', right:'Справа', copy:'Текст',
  rail:'В строку', cards:'Карточки', oversized:'Крупные числа', grid:'Сетка', staggered:'Со сдвигом',
  drag:'Перетаскивание', toggle:'Переключение', split:'Разделение', timeline:'Последовательность',
  accordion:'Аккордеон', sticky:'С фиксацией', cursor:'По курсору', stack:'Стопка',
  filmstrip:'Лента', snap:'По кадрам', scrub:'Плавная прокрутка', fan:'Веер', spread:'Разворот',
  edge:'К краю', marquee:'Бегущая строка', inline:'Внутри страницы', full:'Полный экран',
  columns:'Колонки', table:'Таблица', statement:'Крупный заголовок', minimal:'Компактный',
  browser:'Окно браузера', phone:'Телефон', print:'Печать', parallax:'Параллакс', float:'Парение',
}

export function describeFields(fields: Field[]): EditorField[] {
  return fields.flatMap((field): EditorField[] => {
    if (!('name' in field)) return 'fields' in field ? describeFields(field.fields) : []
    const f = field as any
    if (f.type === 'ui') return []
    const label = typeof f.label === 'string' ? f.label : f.name === 'media' ? 'Медиа' : f.name
    const result: EditorField = { name:f.name, label, type:f.type }
    for (const key of ['required','min','max','minRows','maxRows','defaultValue'] as const) {
      if (f[key] !== undefined && typeof f[key] !== 'function') (result as any)[key] = f[key]
    }
    if (f.options) result.options = f.options.map((option: any) => {
      const value = typeof option === 'string' ? option : option.value
      return { value, label:choiceLabels[value] || (typeof option === 'object' && typeof option.label==='string' ? option.label : value) }
    })
    if (f.fields) result.fields = describeFields(f.fields)
    return [result]
  })
}

export const editorSchemas = Object.fromEntries(CaseBlocks.map(block => [block.slug, describeFields(block.fields)]))
