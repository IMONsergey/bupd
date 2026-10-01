import React from 'react'

export default function TemplateCreateButton({ template, label = 'Использовать шаблон' }: { template: string; label?: string }) {
  return <a className="baev-template-button" href={'/admin/new-case?template=' + encodeURIComponent(template)}>{label} ↗</a>
}
