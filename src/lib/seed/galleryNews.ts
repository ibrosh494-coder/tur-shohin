import type { GalleryItem, NewsItem } from '../../types'
import { IMG } from './images'

export const gallery: GalleryItem[] = [
  { id: 'g1', image: IMG.peak, title: { ru: 'Вершина на рассвете', tj: 'Қулла дар субҳ', en: 'Summit at dawn' }, category: 'pamir' },
  { id: 'g2', image: IMG.lake, title: { ru: '12-е озеро Фанских гор', tj: 'Кӯли 12-ум', en: 'Twelfth Fann lake' }, category: 'fann' },
  { id: 'g3', image: IMG.fog, title: { ru: 'Туман над Памиром', tj: 'Туман дар Помир', en: 'Fog over the Pamir' }, category: 'pamir' },
  { id: 'g4', image: IMG.hiker, title: { ru: 'Трекер на тропе', tj: 'Пиёдагар', en: 'Hiker on the trail' }, category: 'adventure' },
  { id: 'g5', image: IMG.cityN, title: { ru: 'Душанбе ночью', tj: 'Душанбе шабона', en: 'Dushanbe at night' }, category: 'dushanbe' },
  { id: 'g6', image: IMG.green, title: { ru: 'Долина Гиссара', tj: 'Водии Ҳисор', en: 'Hissar valley' }, category: 'dushanbe' },
  { id: 'g7', image: IMG.campfire, title: { ru: 'Костер в горах', tj: 'Оташ дар кӯҳ', en: 'Mountain campfire' }, category: 'adventure' },
  { id: 'g8', image: IMG.yurt, title: { ru: 'Юрты в Мургабе', tj: 'Юртҳо', en: 'Yurts in Murghab' }, category: 'pamir' },
  { id: 'g9', image: IMG.market, title: { ru: 'Рынок в Худжанде', tj: 'Бозор', en: 'Khujand bazaar' }, category: 'culture' },
  { id: 'g10', image: IMG.ceremony, title: { ru: 'Национальный танец', tj: 'Рақси миллӣ', en: 'Folk dance' }, category: 'culture' },
  { id: 'g11', image: IMG.tea, title: { ru: 'Чайная церемония', tj: 'Чойхона', en: 'Tea ceremony' }, category: 'culture' },
  { id: 'g12', image: IMG.river, title: { ru: 'Река Фандарья', tj: 'Фандарё', en: 'Fandarya river' }, category: 'fann' },
  { id: 'g13', image: IMG.blaze, title: { ru: 'Лагерь у подножия', tj: 'Лагери кӯҳ', en: 'Base camp' }, category: 'pamir' },
  { id: 'g14', image: IMG.temple, title: { ru: 'Крепость Гиссар', tj: 'Қалъаи Ҳисор', en: 'Hissar fortress' }, category: 'culture' },
  { id: 'g15', image: IMG.lakeBoat, title: { ru: 'Искандеркуль', tj: 'Искандаркӯл', en: 'Iskanderkul' }, category: 'fann' },
  { id: 'g16', image: IMG.desert, title: { ru: 'Пустыня у Булкункуля', tj: 'Биёбон', en: 'Desert near Bulunkul' }, category: 'pamir' },
]

export const news: NewsItem[] = [
  {
    id: 'news-1',
    slug: 'otkrytie-sezona-2027',
    title: {
      ru: 'Открыт сезон 2027: раннее бронирование со скидкой до 20%',
      tj: 'Фасли 2027 кушода шуд',
      en: 'Season 2027 is open: early booking up to 20% off',
    },
    excerpt: {
      ru: 'Мы открыли бронирование на весь сезон 2027. Скидки до 20% на туры по Памиру и Фанским горам при оплате до 31 января.',
      tj: 'Бронкунии фасли 2027 кушода шуд.',
      en: 'Early-bird discounts up to 20% on Pamir and Fann tours until January 31st.',
    },
    image: IMG.valley,
    date: '2026-09-01',
  },
  {
    id: 'news-2',
    slug: 'novyi-marshrut-family',
    title: {
      ru: 'Новый маршрут: «Семейный тур: Фанские горы + Душанбе»',
      tj: 'Маршрути нав: сафари оилавӣ',
      en: 'New route: family trip to the Fanns and Dushanbe',
    },
    excerpt: {
      ru: 'Лёгкий пятидневный маршрут с лошадьми, кострами и детским аниматором. Отправления — каждые выходные лета.',
      tj: 'Маршрути сабук барои оила.',
      en: 'A gentle five-day family route with horses, campfires and a kids host.',
    },
    image: IMG.green,
    date: '2026-08-15',
  },
  {
    id: 'news-3',
    slug: 'pamir-permit-update',
    title: {
      ru: 'Как оформить пропуск на Памир в 2026–2027',
      tj: 'Иҷозатномаи Помир',
      en: 'Pamir permits in 2026–2027: what changed',
    },
    excerpt: {
      ru: 'Пропуск на ГБАО оформляется онлайн за 72 часа. Мы берём все документы на себя — вам нужен только загранпаспорт.',
      tj: 'Иҷозатнома онлайн.',
      en: 'GBAO permits are now issued online in 72h — we handle everything.',
    },
    image: IMG.range,
    date: '2026-07-28',
  },
]