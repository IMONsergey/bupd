import React from 'react'
import { requireStudioUser,studioRole } from '@/studio/lib/auth'

export default async function HelpPage(){
  const {user}=await requireStudioUser()
  const role=studioRole(user)
  return <>
    <section className="studio-page-head"><div className="studio-page-head__copy"><span className="studio-eyebrow">BAEV / guide</span><h1>Как здесь работать.</h1><p>Studio построена вокруг действий, а не сущностей CMS. Основные сценарии должны занимать 1–3 шага.</p></div></section>
    <div className="help-flow">
      {(role==='admin'||role==='editor')&&<section className="studio-card"><span>01 / Content</span><h2>Кейс</h2><ol><li><b>Создайте</b><p>Кейсы → Новый кейс → выберите структуру.</p></li><li><b>Соберите</b><p>Перетаскивайте сцены слева, редактируйте выбранную сцену справа.</p></li><li><b>Проверьте</b><p>Canvas по центру показывает desktop/mobile preview.</p></li><li><b>Опубликуйте</b><p>После проверки переведите workflow в «Готов» и публикуйте.</p></li></ol></section>}
      {(role==='admin'||role==='sales')&&<section className="studio-card"><span>02 / Sales</span><h2>Лид → сделка</h2><ol><li><b>Лид приходит сам</b><p>Форма сайта создаёт лид и задачу на контакт.</p></li><li><b>Квалифицируйте</b><p>Проверьте клиента, направление, бюджет и следующий шаг.</p></li><li><b>В сделку</b><p>Studio создаёт компанию, deal и activity автоматически.</p></li><li><b>Двигайте pipeline</b><p>Карточка переносится между этапами drag-and-drop.</p></li></ol></section>}
      <section className="studio-card"><span>03 / Navigation</span><h2>⌘K / Ctrl+K</h2><p>Из любого экрана откройте поиск и перейдите в нужный раздел. Это самый быстрый способ работать со Studio.</p></section>
    </div>
  </>
}
