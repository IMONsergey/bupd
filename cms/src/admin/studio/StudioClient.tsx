'use client'

import React, { useMemo, useState } from 'react'

type Project = {
  id: string | number
  title: string
  slug: string
  client?: string | null
  year?: number | null
  _status?: 'draft' | 'published'
  workflowStatus?: 'draft' | 'review' | 'ready' | 'paused'
  deadline?: string | null
  updatedAt?: string
}

type Template = {
  slug: string
  title: string
  description?: string | null
}

const workflowLabel: Record<string,string> = {
  draft:'В работе',
  review:'На проверке',
  ready:'Готов',
  paused:'Пауза',
  published:'Опубликован',
}

export default function StudioClient({
  projects,
  templates,
}: {
  projects: Project[]
  templates: Template[]
}) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'draft' | 'review' | 'ready' | 'published'>('all')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [title, setTitle] = useState('')
  const [client, setClient] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [categories, setCategories] = useState('')
  const [template, setTemplate] = useState(templates[0]?.slug || '')
  const [error, setError] = useState('')

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return projects.filter((project) => {
      if (status === 'published' && project._status !== 'published') return false
      if (status !== 'all' && status !== 'published' && project.workflowStatus !== status) return false
      if (!needle) return true
      return [project.title, project.client, project.slug]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle))
    })
  }, [projects, query, status])

  const createProject = async () => {
    if (!title.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/baev/create-case', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          client: client.trim(),
          year: Number(year) || undefined,
          template: template || 'blank',
          categories: categories.split(',').map((item) => item.trim()).filter(Boolean),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'create_failed')
      window.location.href = '/admin/collections/projects/' + data.id
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось создать кейс')
      setBusy(false)
    }
  }

  const duplicate = async (id: string | number) => {
    const response = await fetch('/api/baev/duplicate-project', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await response.json().catch(() => ({}))
    if (response.ok && data.id) window.location.href = '/admin/collections/projects/' + data.id
  }

  return (
    <>
      <section className="baev-studio-toolbar">
        <div className="baev-studio-search">
          <span>⌕</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Найти кейс, клиента или slug" />
        </div>
        <div className="baev-studio-filter">
          {(['all','draft','review','ready','published'] as const).map((item) => (
            <button key={item} className={status === item ? 'is-active' : ''} onClick={() => setStatus(item)}>
              {item === 'all' ? 'Все' : item === 'draft' ? 'В работе' : item === 'review' ? 'Проверка' : item === 'ready' ? 'Готово' : 'Опубликовано'}
            </button>
          ))}
        </div>
        <button className="baev-button" onClick={() => setOpen(true)}>Новый кейс +</button>
      </section>

      <section className="baev-project-grid">
        {visible.map((project, index) => (
          <article className="baev-project-card" key={project.id}>
            <div className="baev-project-card__top">
              <span>{String(index + 1).padStart(2,'0')}</span>
              <i className={'is-' + (project._status === 'published' ? 'published' : project.workflowStatus || 'draft')}>
                {workflowLabel[project._status === 'published' ? 'published' : project.workflowStatus || 'draft']}
              </i>
            </div>
            <div className="baev-project-card__body">
              <small>{project.client || 'Без клиента'}{project.year ? ' / ' + project.year : ''}</small>
              <h3>{project.title}</h3>
              <p>/{project.slug}{project.deadline ? ' · дедлайн ' + new Date(project.deadline).toLocaleDateString('ru-RU',{ day:'2-digit', month:'2-digit' }) : ''}</p>
            </div>
            <div className="baev-project-card__actions">
              <a href={'/admin/collections/projects/' + project.id}>Редактировать ↗</a>
              <a href={'/preview/' + project.slug} target="_blank" rel="noreferrer">Preview</a>
              <button type="button" onClick={() => duplicate(project.id)}>Дублировать</button>
            </div>
          </article>
        ))}
        {!visible.length && <div className="baev-studio-empty">Ничего не найдено.</div>}
      </section>

      {open && (
        <div className="baev-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}>
          <section className="baev-create-modal">
            <header>
              <div><span>BAEV / NEW CASE</span><h2>Новый кейс</h2></div>
              <button onClick={() => setOpen(false)}>×</button>
            </header>
            <div className="baev-create-grid">
              <label><span>Название *</span><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Авито — Высшая передача" /></label>
              <label><span>Клиент</span><input value={client} onChange={(e) => setClient(e.target.value)} placeholder="Авито" /></label>
              <label><span>Год</span><input value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" /></label>
              <label><span>Категории</span><input value={categories} onChange={(e) => setCategories(e.target.value)} placeholder="Презентация, Брендинг" /></label>
            </div>
            <div className="baev-template-choice">
              <span>Структура</span>
              <div>
                {templates.map((item) => (
                  <button key={item.slug} className={template === item.slug ? 'is-active' : ''} onClick={() => setTemplate(item.slug)}>
                    <strong>{item.title.replace('Template — ','')}</strong>
                    <small>{item.description || 'Готовая структура кейса'}</small>
                  </button>
                ))}
                <button className={template === '' ? 'is-active' : ''} onClick={() => setTemplate('')}>
                  <strong>Пустой</strong><small>Начать с чистого Case Builder</small>
                </button>
              </div>
            </div>
            <footer>
              {error && <span className="baev-form-error">{error}</span>}
              <button className="baev-button baev-button--ghost" onClick={() => setOpen(false)}>Отмена</button>
              <button className="baev-button" disabled={!title.trim() || busy} onClick={createProject}>
                {busy ? 'Создаём…' : 'Создать и открыть →'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}
