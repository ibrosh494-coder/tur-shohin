import type { GalleryItem, Localized, NewsItem } from '../../types'
import { IMG } from './images'

const T: Localized = { ru: '', tj: '', en: '' }

export const gallery: GalleryItem[] = [
  { id: 'g1', image: 'https://shohintour.com/wp-content/uploads/2025/12/c44a1a75-65fb-4bba-8cca-ff54cd57e53d_1_105_c-1.jpeg', title: T, category: 'pamir' },
  { id: 'g2', image: 'https://shohintour.com/wp-content/uploads/2025/12/b1c0ff2d-bd87-41ab-834a-429f9ea15954_1_105_c.jpeg', title: T, category: 'fann' },
  { id: 'g3', image: 'https://shohintour.com/wp-content/uploads/2025/12/94b45ed5-2ee8-413f-9ad9-6074f7663b83_1_105_c-1.jpeg', title: T, category: 'pamir' },
  { id: 'g4', image: 'https://shohintour.com/wp-content/uploads/2025/12/3b3d889d-e108-4939-ae49-9401155dea59_1_105_c.jpeg', title: T, category: 'adventure' },
  { id: 'g5', image: 'https://shohintour.com/wp-content/uploads/2025/12/587ca344-9bb6-410d-916c-e2740623c825_1_105_c.jpeg', title: T, category: 'culture' },
  { id: 'g6', image: 'https://shohintour.com/wp-content/uploads/2025/12/554938b9-f923-4278-97e7-2410750440d5_1_105_c-1.jpeg', title: T, category: 'dushanbe' },
  { id: 'g7', image: 'https://shohintour.com/wp-content/uploads/2025/12/1a1e9fe8-db89-4112-9a82-6551546d0b54_1_105_c.jpeg', title: T, category: 'adventure' },
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