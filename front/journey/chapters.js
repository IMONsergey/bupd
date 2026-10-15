/** Editorial content and spatial stops. URLs remain owned by the existing public site. */
export const CHAPTERS = Object.freeze([
  { id: 'opening', label: 'Открытие', title: 'Всё начинается\nс внимания.', copy: 'Публичная коммуникация и презентации для бизнеса. Окажитесь по ту сторону экрана.', action: 'Внутрь истории', camera: [0, 4.1, 24], look: [0, 5.1, -20], mobile: [0, 5.6, 25.5], mood: 'hall' },
  { id: 'inside', label: 'За экраном', title: 'У впечатления\nесть глубина.', copy: 'За убедительным кадром — содержание, сценарий и визуальная система. Раскроем их по отдельности.', action: 'Найти главную мысль', camera: [12, 7, 23], look: [0, 4, 0], mobile: [15, 9, 37], mood: 'studio', detail: 'Собрать кадр' },
  { id: 'meaning', label: 'Главная мысль', title: 'Сначала —\nсмысл.', copy: 'Кому говорим. Что необходимо объяснить. Какой вывод должен остаться. Когда найден фокус, сложное становится понятным.', action: 'Выстроить историю', camera: [10, 6, 24], look: [0, 4, 0], mobile: [11, 8, 39], mood: 'studio', detail: 'Найти фокус' },
  { id: 'structure', label: 'Сценарий', title: 'Не слайды.\nПоследовательность.', copy: 'Контекст, аргумент, решение, следующий шаг. Каждый кадр подготавливает следующий — и работает на общий вывод.', action: 'Перейти к форме', camera: [21, 19, 31], look: [0, 3, -5], mobile: [24, 26, 46], mood: 'studio', detail: 'Следующий аргумент' },
  { id: 'form', label: 'Визуальная система', title: 'Внимание —\nк главному.', copy: 'Типографика, композиция и движение расставляют акценты. Форма помогает прочитать содержание, а не заслоняет его.', action: 'Увидеть в деле', camera: [8, 6, 24], look: [0, 4, 0], mobile: [10, 8, 38], mood: 'studio', detail: 'Показать устройство' },
  { id: 'projects', label: 'Реальные проекты', title: 'Из идеи —\nв реальный мир.', copy: 'Избранные визуальные истории BAEV. Материалы проектов — без вымышленных результатов и реконструкций площадок.', action: 'За кулисы', camera: [-14, 6, 24], look: [-14, 5, 0], mobile: [-14, 7, 37], mood: 'gallery' },
  { id: 'backstage', label: 'За кадром', title: 'На экране — результат.\nЗа экраном — работа.', copy: 'Содержание, структура, визуальная система и подготовка к показу. Рассмотрите устройство работы на демонстрационном материале BAEV.', action: 'На вашу сцену', camera: [11, 11, 16], look: [0, 1.8, -1], mobile: [13, 16, 26], mood: 'warm', detail: 'Рассмотреть материал' },
  { id: 'your-stage', label: 'Ваша история', title: 'Что важно\nобъяснить вам?', copy: 'Теперь вы по другую сторону зала. Расскажите о задаче — найдём для неё точную и убедительную форму.', action: 'Обсудить задачу', camera: [0, 3.1, -20], look: [0, 3, 13], mobile: [0, 4.2, -23], mood: 'hall' },
]);
export const CASES = Object.freeze([
  { title: 'Авито Авто', subtitle: 'Высшая передача', image: '/front/media/avito-auto-2024.jpg', href: '/work/avito-auto-2024', x: -14 },
  { title: 'HAVAL', subtitle: 'Dealer Conference', image: '/front/media/linear-identity.jpg', href: '/work/linear-identity', x: 0 },
  { title: 'Альфа Конфа', subtitle: 'Для своих', image: '/front/media/future-archive.png', href: '/work/future-archive', x: 14 },
]);
export const SPACING = 100;
export const indexFromHash = (hash) => { const id = String(hash || '').replace(/^#/, ''); if (id === 'approach') return 2; const index = CHAPTERS.findIndex(chapter => chapter.id === id); return index < 0 ? 0 : index; };
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const smooth = (value) => { const t = clamp(value, 0, 1); return t * t * t * (t * (t * 6 - 15) + 10); };

/** A gesture is consumed once; trackpad inertia cannot skip subsequent chapters. */
export class GestureGate {
  constructor() { this.last = -Infinity; this.total = 0; this.spent = false; }
  feed(delta, now, busy = false) {
    if (now - this.last > 200) { this.total = 0; this.spent = false; }
    this.last = now;
    if (busy) { this.spent = true; return 0; }
    if (this.spent || !Number.isFinite(delta)) return 0;
    if (Math.sign(delta) !== Math.sign(this.total)) this.total = 0;
    this.total += delta;
    if (Math.abs(this.total) < 55) return 0;
    this.spent = true; return Math.sign(this.total);
  }
}
