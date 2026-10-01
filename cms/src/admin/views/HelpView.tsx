import type { AdminViewServerProps } from 'payload'
import React from 'react'

const contentFlow = [
  ['01', 'Создать', 'Введите название, клиента и выберите тип истории. Система сама создаст slug, назначит вас ответственным и разложит стартовые сцены.', '/admin/new-case', 'Новый кейс'],
  ['02', 'Собрать', 'В Case Builder добавляйте сцены из библиотеки. Перетаскивайте их, дублируйте и меняйте режимы — без ручной верстки.', '/admin/case-system', 'Библиотека сцен'],
  ['03', 'Проверить', 'В карточке кейса справа есть чек-лист готовности, сверху — live preview. Проверяйте desktop, tablet и mobile до публикации.', '/admin/collections/projects', 'Открыть кейсы'],
  ['04', 'Опубликовать', 'Когда контент готов, переведите этап в «Готов к публикации» и используйте Publish changes. История версий сохраняется автоматически.', '/admin/collections/projects', 'К публикации'],
] as const

const crmFlow = [
  ['Новый лид', 'Заявка с сайта автоматически попадает в Lead inbox и получает задачу на первый контакт.'],
  ['Квалификация', 'Заполните направление, бюджет, ответственного и ближайшее действие.'],
  ['→ В сделку', 'Кнопка в карточке лида создаёт компанию, сделку и следующую задачу без повторного ввода данных.'],
  ['Pipeline', 'Перетаскивайте сделку между этапами. Изменение сохраняется сразу.'],
] as const

export default function HelpView({ user }: AdminViewServerProps) {
  const role = user && 'role' in user ? String(user.role) : ''
  return (
    <main className="baev-custom-view">
      <header className="baev-view-hero baev-view-hero--compact">
        <div>
          <span className="baev-view-kicker">BAEV OS / GUIDE</span>
          <h1>Как здесь<br />работать</h1>
        </div>
        <div className="baev-view-hero__side">
          <p>Система специально ограничена: меньше вариантов там, где они не нужны, и больше свободы только внутри визуальной истории.</p>
          <a className="baev-button" href="/admin">Вернуться в обзор →</a>
        </div>
      </header>

      {['admin', 'editor'].includes(role) && (
        <section className="baev-guide">
          <div className="baev-guide__title"><span>01</span><h2>Кейс от нуля до публикации</h2></div>
          <div className="baev-guide__steps">
            {contentFlow.map(([number, title, body, href, action]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                <a href={href}>{action} →</a>
              </article>
            ))}
          </div>
        </section>
      )}

      {['admin', 'sales'].includes(role) && (
        <section className="baev-guide">
          <div className="baev-guide__title"><span>02</span><h2>Лид → сделка → действие</h2></div>
          <div className="baev-guide__steps">
            {crmFlow.map(([title, body], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{body}</p>
                {index === 0 && <a href="/admin/crm">CRM home →</a>}
                {index === 3 && <a href="/admin/pipeline">Pipeline →</a>}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="baev-guide">
        <div className="baev-guide__title"><span>03</span><h2>Быстрая навигация</h2></div>
        <div className="baev-guide__rules">
          <p><b>⌘K — перейти куда угодно</b><span>Открывает быстрый поиск по главным разделам BAEV OS. На Windows используйте Ctrl+K.</span></p>
          <p><b>Case Studio — все кейсы</b><span>Поиск, фильтрация по этапу, preview и дублирование собраны на одном экране.</span></p>
          <p><b>Live preview — до публикации</b><span>Проверяйте 1440, 1200, tablet и mobile прямо во время редактирования.</span></p>
        </div>
      </section>

      <section className="baev-guide baev-guide--rules">
        <div className="baev-guide__title"><span>04</span><h2>Три правила системы</h2></div>
        <div className="baev-guide__rules">
          <p><b>Не собирайте кейс из одинаковых блоков.</b><span>Меняйте ритм: текст → крупное медиа → доказательство → интерактив → пауза.</span></p>
          <p><b>Не публикуйте «архив проекта».</b><span>Кейс должен объяснять решение, а не просто показывать всё, что было сделано.</span></p>
          <p><b>CRM держит следующий шаг.</b><span>У активного лида или сделки всегда должен быть ответственный и ближайшее действие.</span></p>
        </div>
      </section>
    </main>
  )
}
