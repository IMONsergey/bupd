'use client'

import React, { useState } from 'react'

// Each miniature describes the layout it inserts. It never changes the case theme.
export function BlockPreview({ slug, imageURL, large = false }: { slug: string; imageURL?: string | null; large?: boolean }) {
  const [failedURL, setFailedURL] = useState<string | null>(null)
  const asset = (className = '') => <div className={'block-preview__asset ' + className}>{imageURL && imageURL !== failedURL ? <img src={imageURL} alt="" loading="lazy" onError={() => setFailedURL(imageURL)}/> : <div className="block-preview__landscape"><i/><b/></div>}</div>
  const copy = <div className="block-preview__copy"><b/><i/><i/></div>
  let content: React.ReactNode
  switch (slug) {
    default: content = asset(); break
    case 'caseHero': content = <><div className="block-preview__rail"><small>ПРОЕКТ / 2026</small><strong>Новая<br/>история.</strong>{copy}</div>{asset()}</>; break
    case 'manifesto': content = <div className="block-preview__statement"><small>ИДЕЯ</small><strong>Хороший дизайн<br/>начинается<br/>с ясной мысли.</strong></div>; break
    case 'fullBleedMedia': content = asset(); break
    case 'splitMedia': content = <>{asset()}{asset('is-secondary')}</>; break
    case 'mediaMosaic': content = <>{asset()}{asset('is-secondary')}{asset('is-third')}</>; break
    case 'stickyStory': content = <><div className="block-preview__rail"><small>01 / ЗАДАЧА</small><strong>Шаг<br/>за шагом.</strong>{copy}</div><div className="block-preview__frames">{asset()}{asset('is-secondary')}</div></>; break
    case 'metrics': content = <>{['38%', '2.4×', '12'].map((n,i)=><div className="block-preview__metric" key={n}><strong>{n}</strong><small>{['Рост узнаваемости','Больше обращений','Новых форматов'][i]}</small></div>)}</>; break
    case 'beforeAfter': content = <>{asset()}{asset('is-secondary')}<div className="block-preview__divider"><b>↔</b></div><small className="block-preview__before">До</small><small className="block-preview__after">После</small></>; break
    case 'quote': content = <div className="block-preview__statement"><em>“</em><strong>Именно так<br/>мы и представляли<br/>наш новый бренд.</strong><small>ИМЯ / КЛИЕНТ</small></div>; break
    case 'process': content = <>{['Задача','Поиск','Решение'].map((n,i)=><div className="block-preview__step" key={n}><small>0{i+1}</small><strong>{n}</strong>{copy}</div>)}</>; break
    case 'gallery': content = <><div className="block-preview__gallery">{asset()}{asset('is-secondary')}{asset('is-third')}</div><div className="block-preview__dots">● ○ ○</div></>; break
    case 'deviceShowcase': content = <div className="block-preview__device"><div>•••</div>{asset()}</div>; break
    case 'credits': content = <div className="block-preview__credits"><strong>Команда</strong>{['Дизайн','Стратегия','Разработка'].map(n=><div key={n}><small>{n}</small><b>Имя Фамилия</b></div>)}</div>; break
    case 'nextProject': content = <>{asset()}<div className="block-preview__next"><small>СЛЕДУЮЩИЙ ПРОЕКТ</small><strong>Новая глава ↗</strong></div></>; break
    case 'horizontalStory': content = <><small className="block-preview__caption">ИСТОРИЯ В ДЕТАЛЯХ →</small><div className="block-preview__horizontal">{asset()}{asset('is-secondary')}{asset('is-third')}</div></>; break
    case 'layeredMedia': content = <>{asset()}{asset('is-secondary')}{asset('is-third')}</>; break
    case 'typographyTakeover': content = <div className="block-preview__type"><strong>СМЕЛЕЕ.<br/>ПРОЩЕ.<br/>ТОЧНЕЕ.</strong></div>; break
    case 'videoChapter': content = <>{asset()}<b className="block-preview__play">▶</b><div className="block-preview__video-controls"><i/><small>00:24 / 01:12</small></div></>; break
    case 'comparison': content = <>{['Первый подход','Второй подход'].map(n=><div className="block-preview__comparison" key={n}><small>{n}</small><strong>Aa</strong>{copy}</div>)}</>; break
    case 'artifactStack': content = <>{[0,1,2].map(i=><div className="block-preview__artifact" key={i}><small>ПРОЕКТ / 0{i+1}</small><strong>BAEV.</strong>{copy}</div>)}</>; break
    case 'textMedia': content = <><div className="block-preview__rail"><small>ПОДХОД</small><strong>Внимание<br/>к деталям.</strong>{copy}</div>{asset()}</>; break
    case 'cta': content = <div className="block-preview__statement"><small>ЕСТЬ ЗАДАЧА?</small><strong>Давайте<br/>обсудим.</strong><b className="block-preview__cta">Написать ↗</b></div>; break
  }
  return <div aria-hidden="true" className={'block-preview block-preview--'+slug+(large?' is-large':'')}>{content}</div>
}
