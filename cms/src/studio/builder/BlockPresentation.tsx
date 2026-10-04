'use client'

const options = [
  ['squareMedia', 'Без скругления'],
  ['flushTop', 'Без отступа сверху'],
  ['flushBottom', 'Без отступа снизу'],
] as const

export const blockPresentationKeys = new Set(options.map(([key]) => key))

export function BlockPresentation({ block, onChange }: {
  block: Record<string, unknown>
  onChange: (key: string, value: boolean) => void
}) {
  return <fieldset className="block-presentation">
    <legend>Только этот блок</legend>
    {options.map(([key, label]) => <label key={key}>
      <input type="checkbox" checked={block[key] === true} onChange={event => onChange(key, event.target.checked)}/>
      <span>{label}</span>
    </label>)}
  </fieldset>
}
