#!/usr/bin/env python3
"""Build the static BAEV concept pages. Case bodies and CRM stay in the existing CMS."""
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = [
    ("avito-auto-2024", "Авито Авто", "Высшая передача / Презентация, брендинг", "2024", "presentation brand", "avito-auto-2024.jpg"),
    ("linear-identity", "Haval", "Dealer Conference / Событие", "2023", "presentation event", "linear-identity.jpg"),
    ("future-archive", "Альфа Конфа", "Для своих / Событие", "2024", "event brand", "future-archive.png"),
    ("studio-atlas", "Спортмастер", "Будущее уже здесь / Сессия", "2022", "event presentation", "studio-atlas.jpg"),
    ("parallel-forms", "ОМК", "Итоги 2022 / Сессия", "2022", "presentation event", "parallel-forms.jpg"),
    ("silent-motif", "Teva Pharmaceutical", "Визуальные коммуникации", "2022", "brand presentation", "silent-motif.jpg"),
    ("pattern-language", "ORLA", "Цифровой проект", "", "digital brand", "pattern-language.jpg"),
    ("spectrum-project", "СтримМур", "Цифровой проект", "", "digital", "spectrum-project.png"),
]

def head(title, description):
    return f'''<!doctype html>
<html lang="ru" class="js-pending">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#ecdbd6">
  <meta name="color-scheme" content="light">
  <meta name="description" content="{escape(description)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{escape(title)}">
  <meta property="og:description" content="{escape(description)}">
  <meta property="og:image" content="https://baev-case-lab.vercel.app/front/media/baev-stage.jpg">
  <title>{escape(title)}</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='32' fill='%23ecd9d5'/%3E%3Ctext x='32' y='43' font-size='33' font-family='Arial' font-weight='bold' text-anchor='middle' fill='%231c1919'%3EB%3C/text%3E%3C/svg%3E">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/front/faithful/site.css">
  <script type="importmap">{{"imports":{{"three":"/front/faithful/vendor/three.module.js"}}}}</script>
  <script type="module" src="/front/faithful/world.js"></script>
  <script src="/front/faithful/app.js" defer></script>
</head>'''

def header(active):
    links=[("/", "Главная", "01"), ("/work/", "Проекты", "02"), ("/contact/", "Контакт", "03")]
    nav=''.join(f'<a href="{u}" {"aria-current=\"page\"" if u==active else ""}>{t}</a>' for u,t,_ in links)
    menu=''.join(f'<a href="{u}"><span>{n}</span>{t}<span aria-hidden="true">↗</span></a>' for u,t,n in links)
    return f'''<a class="skip-link" href="#main">Перейти к содержимому</a>
<header class="header" id="header">
  <a href="/" class="brand" aria-label="BAEV — главная">baev<span>studio<sup>®</sup></span></a>
  <nav class="header__links" aria-label="Навигация">{nav}</nav>
  <button class="menu-button" id="menu-toggle" type="button" aria-label="Открыть меню" aria-controls="menu" aria-expanded="false"><i></i><i></i></button>
</header>
<div class="menu" id="menu" hidden inert>
  <nav class="menu__navigation" aria-label="Полная навигация">{menu}</nav>
  <div class="menu__bottom"><span>СТУДИЯ ВИЗУАЛЬНЫХ КОММУНИКАЦИЙ</span><a href="mailto:hello@baev.agency">hello@baev.agency ↗</a></div>
</div>'''

def intro():
    return '''<div class="intro" id="intro" role="dialog" aria-modal="true" aria-labelledby="intro-name">
  <div class="intro__inner">
    <div class="intro__logo" aria-hidden="true"><span>B</span><span>A</span><span>E</span><span>V</span></div>
    <p class="intro__name" id="intro-name">BAEV STUDIO<sup>®</sup></p>
    <p class="intro__description">Студия визуальных коммуникаций.<br>Создаём впечатление, за которым стоит смысл.</p>
    <button class="intro__button" type="button" id="enter">Войти <span aria-hidden="true">↘</span></button>
  </div>
  <button class="intro__skip" type="button" id="enter-muted">ВОЙТИ БЕЗ ЗВУКА</button>
</div>'''

def world(mode):
    if mode=='contact':
        return '''<section class="world world--contact" data-world="contact" aria-labelledby="hero-title">
  <div class="world__fallback" aria-hidden="true"><span class="world__fallback-arch"></span></div>
  <canvas class="world__canvas" tabindex="0" aria-label="Трёхмерное пространство. Стрелками или перетаскиванием можно менять ракурс." role="img"></canvas>
  <div class="world__grain" aria-hidden="true"></div>
  <div class="world__content world__content--contact">
    <div class="world__title-wrap">
      <p class="world__eyebrow">НОВАЯ ЗАДАЧА / НОВЫЙ ДИАЛОГ</p>
      <h1 class="world__title world__title--contact" id="hero-title"><em>Давайте</em><span>обсудим.</span></h1>
      <div class="world__contact-actions"><a href="#contact-form" class="pill pill--light">Обсудить проект ↘</a><a class="pill" href="mailto:hello@baev.agency">Написать напрямую ↗</a></div>
      <p class="world__contact-email">hello@baev.agency</p>
    </div>
  </div>
</section>'''
    return '''<section class="world" data-world="home" id="world" aria-labelledby="hero-title">
  <div class="world__fallback" aria-hidden="true"><span class="world__fallback-arch"></span></div>
  <canvas class="world__canvas" tabindex="0" aria-label="Трёхмерное пространство BAEV: арки, ступени, вода и скульптуры. Ракурс меняется перетаскиванием и клавишами-стрелками." role="img"></canvas>
  <div class="world__grain" aria-hidden="true"></div>
  <div class="world__content">
    <div class="world__title-wrap">
      <p class="world__eyebrow">КРЕАТИВНАЯ СТУДИЯ / САНКТ-ПЕТЕРБУРГ · МОСКВА</p>
      <h1 class="world__title" id="hero-title"><em>Создаём</em><span>впечатление.</span></h1>
      <a class="pill pill--light world__cta" href="#selected">Смотреть работы <span aria-hidden="true">↘</span></a>
    </div>
    <p class="world__drag">ПЕРЕТАСКИВАЙТЕ, ЧТОБЫ ИССЛЕДОВАТЬ ПРОСТРАНСТВО</p>
  </div>
</section>'''

def fixed_controls():
    return '''<div class="fixed-controls" id="scene-controls">
  <div class="fixed-controls__left">
    <button class="sound-toggle" id="sound-toggle" type="button" aria-label="Включить звук" aria-pressed="false"><span aria-hidden="true">◖▏</span></button>
    <a class="pill pill--outline" href="/work/">Избранные проекты ↘</a>
  </div>
  <a class="fixed-controls__center" href="/work/" aria-label="Смотреть проекты">◎</a>
  <span class="fixed-controls__right">©2026</span>
</div>'''

def project_cards(limit=None):
    entries=PROJECTS[:limit] if limit else PROJECTS
    result=[]
    for index,(slug,title,detail,year,cats,image) in enumerate(entries,1):
        result.append(f'''<a class="project-card" href="/work/{slug}" data-slug="{slug}" data-category="{cats}" aria-label="Кейс {escape(title)}">
  <div class="project-card__media"><img src="/front/media/{image}" alt="{escape(title)} — визуальные материалы проекта" loading="lazy"><span class="project-card__hover">Смотреть кейс ↗</span></div>
  <div class="project-card__meta"><div><strong>{escape(title)}</strong><span>{escape(detail)}</span></div><span aria-hidden="true">↘</span></div>
</a>''')
    return '\n'.join(result)

def showcase(full=False):
    title='Избранные проекты'
    return f'''<section class="projects" id="selected" aria-labelledby="selected-heading">
  <div class="projects__heading"><p class="projects__index">{'01 /' if not full else 'BAEV / ПОРТФОЛИО'}</p><{'h1' if full else 'h2'} id="selected-heading">{title}</{'h1' if full else 'h2'}>
    <div class="projects__filters" role="group" aria-label="Фильтр по типу проекта">
      <button type="button" data-filter="all" aria-pressed="true">Все <small>08</small></button>
      <button type="button" data-filter="presentation" aria-pressed="false">Презентации</button>
      <button type="button" data-filter="event" aria-pressed="false">События</button>
      <button type="button" data-filter="brand" aria-pressed="false">Брендинг</button>
      <button type="button" data-filter="digital" aria-pressed="false">Digital</button>
    </div>
  </div>
  <div class="projects__grid" id="projects-grid">{project_cards()}</div>
  <p class="projects__empty" id="projects-empty" hidden>В этой категории пока нет проектов.</p>
  {'<a href="/work/" class="more-work">Все работы <span aria-hidden="true">↗</span></a>' if not full else ''}
</section>'''

def footer():
    return '''<footer class="footer" id="footer">
  <div class="footer__top"><span>BAEV STUDIO®</span><span>ЕСТЬ ЗАДАЧА?</span></div>
  <div class="footer__statement"><p class="footer__serif">Начнём</p><a href="mailto:hello@baev.agency">разговор. <span aria-hidden="true">↗</span></a></div>
  <div class="footer__mid"><div><p>НОВЫЙ ПРОЕКТ</p><a href="/contact/">Обсудить сотрудничество ↗</a></div><div><p>ОБЩИЕ ВОПРОСЫ</p><a href="mailto:hello@baev.agency">hello@baev.agency ↗</a></div><div><p>НАВИГАЦИЯ</p><a href="/">Главная</a><a href="/work/">Проекты</a><a href="/contact/">Контакты</a></div></div>
  <div class="footer__bottom"><span>© BAEV 2026</span><span>Студия визуальных коммуникаций</span><a href="#main">Наверх ↑</a></div>
</footer>'''

def contact_form():
    return '''<section class="contact-form-section" id="contact-form" aria-labelledby="form-title">
  <div class="contact-form-section__intro"><p>02 / ОБСУДИТЬ ПРОЕКТ</p><h2 id="form-title">Расскажите<br><em>о задаче.</em></h2><p>Какой материал нужен, кому он адресован и почему это важно сейчас? Мы изучим контекст и предложим формат работы.</p></div>
  <form class="baev-contact-form" action="mailto:hello@baev.agency" method="post" enctype="text/plain" aria-label="Обсудить проект с BAEV">
    <label class="field">Ваше имя <span>*</span><input name="Name" type="text" placeholder="Как к вам обращаться" autocomplete="name" minlength="2" maxlength="120" required></label>
    <label class="field">Электронная почта <span>*</span><input name="Email" type="email" placeholder="name@company.com" autocomplete="email" maxlength="254" required></label>
    <label class="field field--wide">Задача <span>*</span><textarea name="MessageEmail" placeholder="Что нужно сделать и какие сроки?" rows="4" minlength="10" maxlength="10000" required></textarea></label>
    <div class="contact-honeypot" aria-hidden="true"><label>Не заполнять<input name="website" type="text" tabindex="-1" autocomplete="off"></label></div>
    <p class="form-terms">Все поля обязательны. Можно написать напрямую на <a href="mailto:hello@baev.agency">hello@baev.agency</a>.</p>
    <button type="submit" class="send-button"><span data-submit-label>Отправить запрос</span><span aria-hidden="true">↗</span></button>
    <p class="baev-form-status" role="status" aria-live="polite"></p>
    <noscript>Для работы формы требуется JavaScript. Напишите нам: hello@baev.agency.</noscript>
  </form>
</section>'''

def page(body,active,title,description,cls=''):
    script='<script src="/contact/baev-contact.js" defer></script>' if active=='/contact/' else ''
    modal = ''
    if cls == 'page-home':
        modal = intro()
        assert body.startswith(modal)
        body = body[len(modal):]
    output = head(title,description)+f'<body class="{cls}">' + header(active) + modal + '<main id="main">'+body+'</main>'+footer()+script+'</body></html>'
    return '\n'.join(line.rstrip() for line in output.splitlines()) + '\n'

home = intro()+world('home')+fixed_controls()+showcase()
contact = world('contact')+fixed_controls()+contact_form()
work = showcase(full=True)
(ROOT/'index.html').write_text(page(home,'/','BAEV Studio — Создаём впечатление','BAEV — студия визуальных коммуникаций: презентации, события и брендинг.','page-home'),encoding='utf8')
(ROOT/'work/index.html').write_text(page(work,'/work/','BAEV Studio — Проекты','Избранные кейсы студии BAEV: презентации, события, брендинг и digital.','page-projects'),encoding='utf8')
(ROOT/'contact/index.html').write_text(page(contact,'/contact/','BAEV Studio — Обсудить проект','Связаться с BAEV и обсудить презентацию, мероприятие или визуальную коммуникацию.','page-contact'),encoding='utf8')
print('Generated 3 BAEV concept pages')
