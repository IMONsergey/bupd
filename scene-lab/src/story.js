import { clamp, smooth } from './settings.js';
export const CHAPTERS = Object.freeze([
  {
    id: 'opening',
    at: 0,
    label: 'Открытие',
    title: 'Сначала —\nвнимание.',
    text: 'Зал собирается. Свет меняется. История начинается.',
  },
  {
    id: 'presence',
    at: 0.14,
    label: 'Среди зрителей',
    title: 'Не наблюдать.\nБыть внутри.',
    text: 'Мы приближаемся к сцене вместе с аудиторией.',
  },
  {
    id: 'address',
    at: 0.27,
    label: 'Первое слово',
    title: 'У каждой идеи\nесть аудитория.',
    text: 'За сильным выступлением — ясная мысль.',
  },
  {
    id: 'threshold',
    at: 0.42,
    label: 'За экраном',
    title: 'Увидеть\nбольше кадра.',
    text: 'Экран становится входом в саму презентацию.',
  },
  {
    id: 'meaning',
    at: 0.56,
    label: 'Внутри мысли',
    title: 'Из сложного —\nв понятное.',
    text: 'Выделяем главное. Остальное выстраивается вокруг него.',
  },
  {
    id: 'narrative',
    at: 0.69,
    label: 'История',
    title: 'Мысль обретает\nпоследовательность.',
    text: 'Содержание, структура и форма работают вместе.',
  },
  {
    id: 'work',
    at: 0.81,
    label: 'Реальные проекты',
    title: 'Теперь —\nв реальном мире.',
    text: 'Работы BAEV. Откройте кейс, чтобы увидеть задачу и решение.',
  },
  {
    id: 'your-stage',
    at: 1,
    label: 'Ваша история',
    title: 'Что важно\nобъяснить вам?',
    text: 'Теперь вы на сцене. Следующая история может быть вашей.',
  },
]);
export const PROJECTS = Object.freeze([
  {
    id: 'avito',
    title: 'Авито Авто',
    subtitle: 'Высшая передача',
    image: 'avito.webp',
    href: '/work/avito-auto-2024',
  },
  {
    id: 'haval',
    title: 'HAVAL',
    subtitle: 'Dealer Conference',
    image: 'haval.webp',
    href: '/work/linear-identity',
  },
  {
    id: 'alfa',
    title: 'Альфа Конфа',
    subtitle: 'Для своих',
    image: 'alfa.webp',
    href: '/work/future-archive',
  },
]);
const hall = [
  [0, [0.3, 1.72, 15.4], [-1, 4.8, -17]],
  [0.14, [-0.35, 1.74, 6.9], [0, 2.5, -12.4]],
  [0.21, [0, 1.84, -7.1], [0, 2.4, -12.4]],
  [0.27, [-7.6, 3, -7.2], [0, 3.5, -15.4]],
  [0.36, [-2, 4.2, -11.2], [-1.3, 5.6, -18.1]],
  [0.42, [-1.3, 5.6, -15.2], [-1.3, 5.6, -18.1]],
  [0.46, [-1.3, 5.6, -18.04], [-1.3, 5.6, -20]],
];
const thought = [
  [0.46, [0, 5, 22], [0, 5, -4]],
  [0.5, [2, 5.1, 13], [-1, 5, -5]],
  [0.56, [16, 8.4, 18], [-1, 4, -7]],
  [0.63, [7, 5.7, -4], [0, 3.5, -18]],
  [0.69, [12, 7, -4], [0, 4.8, -24]],
  [0.75, [-6, 5, -17], [0, 5.5, -34]],
  [0.81, [0, 5.7, -20], [0, 5.7, -35]],
  [0.895, [0, 5.7, -33.7], [0, 5.7, -36]],
  [0.92, [0, 5.7, -34.6], [0, 5.7, -36]],
];
const end = [
  [0.92, [0, 2, -16], [0, 2, -10]],
  [1, [0, 2.5, -14.2], [0, 2.6, 15]],
];
const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
function rail(keys, t) {
  const j = Math.max(
    0,
    keys.findIndex(
      (k, i) => i < keys.length - 1 && t >= k[0] && t <= keys[i + 1][0],
    ),
  );
  const a = keys[j],
    b = keys[j + 1],
    u = smooth((t - a[0]) / (b[0] - a[0]));
  return { position: lerp(a[1], b[1], u), target: lerp(a[2], b[2], u) };
}
export function chapterIndex(value) {
  const p = clamp(value, 0, 1);
  let index = 0;
  CHAPTERS.forEach((chapter, i) => {
    if (p >= chapter.at - 0.0001) index = i;
  });
  return index;
}
export function chapterFromHash(hash) {
  const value = String(hash || '').replace(/^#/, '');
  const match = CHAPTERS.find((chapter) => chapter.id === value);
  if (match) return match.at;
  const number = Number(value);
  return Number.isFinite(number) ? clamp(number, 0, 1) : 0;
}
export function nextStop(progress, direction = 1) {
  if (direction > 0)
    return CHAPTERS.find((chapter) => chapter.at > progress + 0.005)?.at ?? 1;
  return (
    [...CHAPTERS].reverse().find((chapter) => chapter.at < progress - 0.005)
      ?.at ?? 0
  );
}
export function sampleStory(value, mobile = false) {
  const progress = clamp(value, 0, 1);
  const world = progress < 0.46 || progress >= 0.92 ? 'hall' : 'thought';
  const pose =
    progress < 0.46
      ? rail(hall, progress)
      : progress < 0.92
        ? rail(thought, progress)
        : rail(end, progress);
  if (mobile && progress < 0.39) {
    const amount = 1 - smooth((progress - 0.28) / 0.11);
    pose.position[0] *= 1 - 0.58 * amount;
    pose.position[2] += 5 * amount;
  }
  if (mobile && world === 'thought') {
    const amount =
      smooth((progress - 0.49) / 0.05) *
      (1 - smooth((progress - 0.86) / 0.035));
    pose.position[2] += 10 * amount;
    pose.position[0] *= 1 - 0.65 * amount;
  }
  if (world === 'thought') {
    pose.position[2] -= 100;
    pose.target[2] -= 100;
  }
  const conceal = (center, width) =>
    1 - smooth(Math.abs(progress - center) / width);
  const mask = Math.max(conceal(0.46, 0.016), conceal(0.92, 0.018));
  return { ...pose, world, mask, chapter: chapterIndex(progress), progress };
}
export class WheelIntent {
  constructor() {
    this.last = -Infinity;
    this.total = 0;
    this.spent = false;
  }
  feed(delta, now, busy = false) {
    if (now - this.last > 220) {
      this.total = 0;
      this.spent = false;
    }
    this.last = now;
    if (busy) {
      this.spent = true;
      return 0;
    }
    if (this.spent || !Number.isFinite(delta)) return 0;
    if (Math.sign(delta) !== Math.sign(this.total)) this.total = 0;
    this.total += delta;
    if (Math.abs(this.total) < 55) return 0;
    this.spent = true;
    return Math.sign(this.total);
  }
}
