import type { Field } from 'payload'
import { isPageColor } from '../lib/pageAppearance'

export const pageAppearanceFields: Field[] = [
  { name: 'pageBackground', label: 'Фон всей страницы', type: 'text', validate: (value: unknown) => !value || isPageColor(value) || 'Укажите цвет в формате #RRGGBB', admin: { description: 'Единый фон всех блоков. Пустое значение сохраняет оформление блоков.' } },
  { name: 'mediaRadius', label: 'Скругление изображений и видео, px', type: 'number', min: 0, max: 80, admin: { description: 'От 0 до 80. Пустое значение сохраняет исходное оформление.' } },
]
