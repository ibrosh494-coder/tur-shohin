const fs = require('fs');

const SRC = process.env.SHOHIN_SRC || 'C:/Users/Hp omen/.local/share/opencode/tool-output/tool_0868ac95d001al2ioYyT8gbHZj';
const OUT = __dirname + '/analysis.txt';

const raw = fs.readFileSync(SRC, 'utf8');
const data = JSON.parse(raw);

const tourSlugs = [
  'tadzhikistan-8-dnej-ot-pamirskih-vershin-do-drevnih-sokrovishh',
  'aktivnyj-otdyh-v-gorah-tadzhikistana',
  'pamir-dorogami-legend-i-vysokogornyh-chudes',
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat',
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat-2',
  'puteshestvie-po-severnomu-shelkovomu-puti',
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat',
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat-kopirovat-kopirovat-kopirovat',
  'beloe-ushhele-vsesezonnyj-gornolyzhnyj-kompleks-safed-dara',
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat-kopirovat-kopirovat',
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat-kopirovat',
  'shablon-dlya-kopirovaniya-kopirovat-kopirovat',
  'shablon-dlya-kopirovaniya-kopirovat',
  'voshozhdenie-na-koronu-pamira-pik-kommunizma-somoni-7495-m',
  'voshozhdenie-na-pik-korzhenevskoj',
  'puteshestvie-po-drevnemu-tadzhikistanu',
  'shablon-dlya-kopirovaniya',
  'pik-energiya-gornyj-vyzov-v-serdcze-fanskih-gor',
  'fanskie-gory-i-samarkand-puteshestvie-k-zhemchuzhinam-pamira-i-velikogo-shelkovogo-puti',
  '15-ozyor-fanskih-gor-lazurnoe-ozherele',
  'odnodnevnyj-tur-v-temurdara',
  '6-dnevnyj-tur-pendzhikent-dushanbe',
  '5-dnevnyj-tur-v-tadzhikistan',
  '5-dnevnyj-tur-po-marshrutu-hudzhand-istaravshan-pendzhikent',
  'napravleniya-dlya-otdyha-v-turczii-kopirovat',
  'napravleniya-dlya-otdyha-v-turczii',
];

const lines = [];
lines.push('TOTAL: ' + data.length);
lines.push('FOUND 26 slugs: ' + tourSlugs.length);

for (const slug of tourSlugs) {
  const p = data.find((x) => x.slug === slug);
  if (!p) {
    lines.push('\n=== NOT FOUND: ' + slug);
    continue;
  }
  const d = p.description || '';
  const h3 = (d.match(/<h[1-6]/g) || []).length;
  const days1 = (d.match(/\u{1F5D3}/gu) || []).length;
  const dayH = (d.match(/день\s*\d|День\s*\d/g) || []).length;
  const hasInc = /Включено|В стоимость|Что включено/i.test(d);
  const hasExc = /Не включено|Исключено|Что не входит/i.test(d);
  const imgs = (p.images || []).map((i) => i.src);
  lines.push(
    '\n=== ' + p.id + ' | ' + p.name +
    '\nslug: ' + p.slug +
    '\npermalink: ' + p.permalink +
    '\nprice: ' + (p.prices ? p.prices.price / 100 : '-') + ' ' + (p.prices ? p.prices.currency_code : '') +
    '\nrating: ' + p.average_rating + ' reviews: ' + p.review_count +
    '\ndescLen: ' + d.length + ' headings: ' + h3 + ' calendarDays: ' + days1 + ' dayWordMatches: ' + dayH + ' includes: ' + hasInc + ' excludes: ' + hasExc +
    '\nimages[' + imgs.length + ']: ' + imgs.join('\n    ')
  );
}

fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
console.log('written', OUT, 'bytes', fs.statSync(OUT).size);