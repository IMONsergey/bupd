import type { Field } from 'payload'

// Shared by cases, articles, templates and their versions.
export const blockPresentationFields: Field[] = [
  { name: 'squareMedia', label: 'Без скругления', type: 'checkbox', defaultValue: false },
  { name: 'flushTop', label: 'Без отступа сверху', type: 'checkbox', defaultValue: false },
  { name: 'flushBottom', label: 'Без отступа снизу', type: 'checkbox', defaultValue: false },
]
