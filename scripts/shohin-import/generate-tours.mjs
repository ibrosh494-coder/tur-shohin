import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('.', import.meta.url));
const tours = JSON.parse(readFileSync(dir + 'shohin-tours.json', 'utf8'));

const SITE_CAT = {
  trekking: 'cat-trekking',
  'kulturnye-tury': 'cat-culture',
  'pamirskij-trakt-ru': 'cat-pamir',
  'shelkovyj-put-ru': 'cat-silk-road',
  'lyzhnyj-tur-ru': 'cat-winter',
  'alpinizm-ru': 'cat-climbing',
};

// slug -> { destinations, city, region, difficulty }
const META = {
  'tadzhikistan-8-dnej-ot-pamirskih-vershin-do-drevnih-sokrovishh': { d: ['dst-tajikistan', 'dst-pamir'], city: '', region: 'Памир и Центральный Таджикистан', diff: 'easy' },
  'aktivnyj-otdyh-v-gorah-tadzhikistana': { d: ['dst-dushanbe'], city: 'Душанбе', region: 'Варзобская долина', diff: 'easy' },
  'pamir-dorogami-legend-i-vysokogornyh-chudes': { d: ['dst-pamir'], city: '', region: 'Памир (ГБАО)', diff: 'moderate' },
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat': { d: ['dst-pamir'], city: 'Душанбе', region: 'Памир (ГБАО)', diff: 'moderate' },
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat-2': { d: ['dst-tajikistan'], city: 'Бохтар', region: 'Хатлонская область', diff: 'easy' },
  'puteshestvie-po-severnomu-shelkovomu-puti': { d: ['dst-tajikistan', 'dst-khujand'], city: '', region: 'Согдийская область', diff: 'easy' },
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat': { d: ['dst-tajikistan'], city: 'Душанбе', region: 'Согдийская область', diff: 'easy' },
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat': { d: ['dst-tajikistan'], city: '', region: 'Ущелье Каратаг', diff: 'moderate' },
  'beloe-ushhele-vsesezonnyj-gornolyzhnyj-kompleks-safed-dara': { d: ['dst-khujand'], city: 'Худжанд', region: 'Согдийская область', diff: 'easy' },
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat-kopirovat-kopirovat': { d: ['dst-pamir'], city: 'Душанбе', region: 'Памир (ГБАО)', diff: 'hard' },
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat-kopirovat': { d: ['dst-fann'], city: 'Душанбе', region: 'Фанские горы', diff: 'moderate' },
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat': { d: ['dst-fann'], city: 'Душанбе', region: 'Фанские горы', diff: 'hard' },
  'shablon-dlya-kopirovaniya-kopirovat': { d: ['dst-tajikistan', 'dst-pamir'], city: '', region: 'Таджикистан', diff: 'moderate' },
  'voshozhdenie-na-koronu-pamira-pik-kommunizma-somoni-7495-m': { d: ['dst-pamir'], city: '', region: 'Памир', diff: 'extreme' },
  'voshozhdenie-na-pik-korzhenevskoj': { d: ['dst-pamir'], city: '', region: 'Памир', diff: 'extreme' },
  'puteshestvie-po-drevnemu-tadzhikistanu': { d: ['dst-tajikistan'], city: '', region: 'Таджикистан', diff: 'easy' },
  'shablon-dlya-kopirovaniya': { d: ['dst-dushanbe'], city: 'Душанбе', region: 'Душанбе', diff: 'easy' },
  'pik-energiya-gornyj-vyzov-v-serdcze-fanskih-gor': { d: ['dst-fann'], city: 'Самарканд', region: 'Фанские горы', diff: 'hard' },
  'fanskie-gory-i-samarkand-puteshestvie-k-zhemchuzhinam-pamira-i-velikogo-shelkovogo-puti': { d: ['dst-fann', 'dst-samarkand'], city: 'Самарканд', region: 'Фанские горы — Самарканд', diff: 'moderate' },
  '15-ozyor-fanskih-gor-lazurnoe-ozherele': { d: ['dst-fann'], city: 'Душанбе', region: 'Фанские горы', diff: 'moderate' },
  'odnodnevnyj-tur-v-temurdara': { d: ['dst-tajikistan'], city: '', region: 'Ущелье Каратаг', diff: 'moderate' },
  '6-dnevnyj-tur-pendzhikent-dushanbe': { d: ['dst-tajikistan'], city: 'Пенджикент', region: 'Согд — Фанские горы', diff: 'easy' },
  '5-dnevnyj-tur-v-tadzhikistan': { d: ['dst-tajikistan'], city: '', region: 'Таджикистан', diff: 'easy' },
  '5-dnevnyj-tur-po-marshrutu-hudzhand-istaravshan-pendzhikent': { d: ['dst-khujand'], city: 'Худжанд', region: 'Согдийская область', diff: 'easy' },
  'napravleniya-dlya-otdyha-v-turczii-kopirovat': { d: ['dst-pamir'], city: '', region: 'Памир', diff: 'moderate' },
  'napravleniya-dlya-otdyha-v-turczii': { d: ['dst-turkey'], city: '', region: 'Турция', diff: 'easy' },
};

function norm(s) {
  return (s || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ +/g, ' ')
    .trim();
}

function shortFrom(desc) {
  const first = norm(desc).split(/\n\n/)[0] || '';
  return first.length > 240 ? first.slice(0, 237).trimEnd() + '…' : first;
}

function parseIncludesExcludes(desc) {
  const incMatch = desc.match(/В стоимость входит:\s*\n+([\s\S]*?)(?:\n+\s*В стоимость\s+не\s+входит:|\n*$)/i);
  const excMatch = desc.match(/В стоимость\s+не\s+входит:\s*\n+([\s\S]*?)$/i);
  const cleanDesc = desc.replace(/\s*\n*\s*В стоимость\s+входит:[\s\S]*$/i, '').trim();
  const list = (txt) =>
    (txt || '')
      .split(/\n+/)
      .map((x) => norm(x).replace(/^[•\-–⭐]+\s*/, ''))
      .filter(Boolean);
  return {
    includes: list(incMatch && incMatch[1]),
    excludes: list(excMatch && excMatch[1]),
    desc: cleanDesc,
  };
}

const createdAt = '2025-11-20T00:00:00.000Z';
const priceNote = {
  ru: 'Цена по сайту Shohin Tour — «от 79 смн» в день (плейсхолдер). Итог тура: 79 смн × N дней × туристы. Реальные цены уточняйте у оператора.',
  tj: 'Нарх тибқи сайти Shohin Tour — «аз 79 сомонӣ» дар як рӯз (муваққатӣ). Ҳисоб: 79 × шумораи рӯзҳо × сайёҳон. Нархи воқеиро бо оператор тасдиқ кунед.',
  en: 'Price per site Shohin Tour — "from 79 somoni" per day (placeholder). Total: 79 × duration × travelers. Real prices to be confirmed.',
};

const entries = tours.map((t, i) => {
  const meta = META[t.slug] || { d: [], city: '', region: '', diff: 'easy' };
  const cats = (t.categories || []).map((c) => SITE_CAT[c.slug]).filter(Boolean);
  const { includes, excludes, desc } = parseIncludesExcludes(t.description || '');
  const short = shortFrom(desc);
  const days = (t.itinerary || []).map((it, j) => {
    const d = norm(it.description).replace(/^\d+\s*\n+/, '').trim();
    return {
      id: 'd' + (j + 1),
      day: it.day,
      title: { ru: norm(it.title), tj: norm(it.title), en: norm(it.title) },
      description: { ru: d, tj: d, en: d },
    };
  });

  return {
    id: 'tour-shohin-' + t.id,
    slug: t.slug,
    title: { ru: t.title, tj: t.title, en: t.title },
    shortDescription: { ru: short, tj: short, en: short },
    description: { ru: norm(desc), tj: norm(desc), en: norm(desc) },
    images: t.images || [],
    destinationIds: meta.d,
    categoryIds: cats,
    country: 'Таджикистан',
    city: meta.city,
    region: meta.region,
    durationDays: t.durationDays || 1,
    difficulty: meta.diff,
    rating: 0,
    reviewsCount: 0,
    basePrice: t.price || 79,
    discountPercent: undefined,
    groupSizeMin: 1,
    groupSizeMax: 16,
    includes: includes.map((x) => ({ ru: x, tj: x, en: x })),
    excludes: excludes.map((x) => ({ ru: x, tj: x, en: x })),
    whatToBring: [],
    faq: [],
    days,
    locations: [],
    extras: [],
    startDates: [],
    featured: i < 8,
    isNew: false,
    active: true,
    sourceUrl: t.sourceUrl,
    priceNote,
    createdAt,
  };
});

const lines = [
  "import type { Tour } from '../../types'",
  '',
  'export const tours: Tour[] = [',
  entries.map((t) => '  ' + JSON.stringify(t, null, 2).replace(/^\{/, '{').split('\n').map((l) => (l === '}' ? l : l)).join('\n')).join(',\n'),
  ']',
  '',
];

writeFileSync(dir + '../../src/lib/seed/tours.ts', lines.join('\n'), 'utf8');
console.log('generated tours:', entries.length);