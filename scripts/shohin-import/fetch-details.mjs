import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('.', import.meta.url));
const { readFile, writeFile } = await import('node:fs/promises');

const API_CACHE = dir + 'api-products.json';
async function getProducts() {
  if (existsSync(API_CACHE)) return JSON.parse(await readFile(API_CACHE, 'utf8'));
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const r = await fetch(`https://shohintour.com/wp-json/wc/store/v1/products?per_page=100&page=${page}`, {
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    if (!r.ok) break;
    const batch = await r.json();
    all.push(...batch);
    if (batch.length < 100) break;
  }
  await writeFile(API_CACHE, JSON.stringify(all, null, 2), 'utf8');
  console.log('API products cached:', all.length);
  return all;
}

const products = await getProducts();

const slugs = [
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

function stripTags(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h\d>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, (m) => {
      const c = m.match(/\d+/)[0];
      try {
        return String.fromCodePoint(+c);
      } catch {
        return m;
      }
    })
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function htmlToText(html) {
  return stripTags(html);
}

function parseItinerary(html) {
  const items = [];
  const re = /<div class="interary-item ">([\s\S]*?)<\/div>\s*<\/div>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const block = m[1];
    const numM = block.match(/icon-left">\s*(\d+)/);
    const titleM = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
    const rest = block.replace(/<h3[^>]*>[\s\S]*?<\/h3>/, '');
    const title = titleM ? htmlToText(titleM[1]).replace(/^\s*\d+\s*[.:-]?\s*/, '') : '';
    const description = htmlToText(rest);
    items.push({ day: numM ? +numM[1] : items.length + 1, title: title.replace(/^\s*🗓\s*/, ''), description });
  }
  return items;
}

function parseMeta(html, patterns) {
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return m[1].trim();
  }
  return '';
}

function parseCategories(html) {
  const found = [];
  const re = /<a href="https:\/\/shohintour\.com\/tour-category\/([^\/"]+)\/" class="loop-item-term[^"]*">([^<]+)<\/a>/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    const name = m[2].trim();
    if (name && !found.some((x) => x.slug === m[1])) found.push({ slug: m[1], name });
  }
  return found;
}

const out = [];
mkdirSync(dir + 'html', { recursive: true });

const fetchOne = async (url, i) => {
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
  if (!res.ok) throw new Error(url + ' -> ' + res.status);
  const text = await res.text();
  writeFileSync(dir + 'html/' + i + '.html', text, 'utf8');
  return text;
};

let idx = 0;
for (const slug of slugs) {
  const p = products.find((x) => x.slug === slug);
  idx++;
  let html = existsSync(dir + 'html/' + idx + '.html')
    ? (await (await import('node:fs/promises')).readFile(dir + 'html/' + idx + '.html', 'utf8'))
    : '';
  if (!html.includes('interary-item') && !html.includes('Программа')) {
    try {
      html = await fetchOne(p.permalink, idx);
    } catch (e) {
      console.log('FETCH FAIL', p.permalink, e.message);
    }
  }

  const h1 = parseMeta(html, [/<h1\b[^>]*>([\s\S]*?)<\/h1>/]);
  const durationMatch = html.match(/Длительность:\s*<span[^>]*>\s*([^<]*?)\s*<\/span>\s*дн/i) || html.match(/Длительность:\s*<span[^>]*>\s*([^<]*?)\s*<\/span>/i) || html.match(/Длительность:\s*([\d\u00a0 ]+)\s*дн/i);
  const durationDays = durationMatch ? parseInt((durationMatch[1] || '').replace(/[^\d]/g, ''), 10) : null;
  const bookingMatch = html.match(/(\d+)\s*бронирован/i);

  const itinerary = parseItinerary(html);
  const title = (p.name || '').replace(/&#\d+;/g, (x) => String.fromCodePoint(+x.match(/\d+/)[0]));

  out.push({
    id: p.id,
    slug,
    sourceUrl: p.permalink,
    title: htmlToText(h1) || title,
    price: p.prices ? p.prices.price / 100 : null,
    currency: p.prices ? p.prices.currency_code : null,
    rating: p.average_rating ? +p.average_rating : null,
    reviewsCount: p.review_count || 0,
    images: (p.images || []).map((i) => i.src),
    description: htmlToText(p.description || ''),
    durationDays,
    city: '',
    categories: parseCategories(html),
    bookingCount: bookingMatch ? parseInt(bookingMatch[1], 10) : 0,
    itinerary,
  });
  console.log(idx, slug, '| dur:', out[out.length - 1].durationDays, '| itin:', itinerary.length, '| h1:', out[out.length - 1].title.slice(0, 60));
  await new Promise((r) => setTimeout(r, 200));
}

writeFileSync(dir + 'shohin-tours.json', JSON.stringify(out, null, 2), 'utf8');
console.log('WROTE', out.length, 'tours');