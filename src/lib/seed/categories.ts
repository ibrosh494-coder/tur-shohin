import type { Category } from '../../types'

export const categories: Category[] = [
  {
    id: 'cat-trekking',
    slug: 'trekking',
    name: { ru: 'Треккинг', tj: 'Пиёдагардӣ', en: 'Trekking' },
    icon: 'Mountain',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306',
  },
  {
    id: 'cat-adventure',
    slug: 'adventure',
    name: { ru: 'Приключения', tj: 'Саргузашт', en: 'Adventure' },
    icon: 'Compass',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
  },
  {
    id: 'cat-culture',
    slug: 'culture',
    name: { ru: 'Культурные туры', tj: 'Турҳои фарҳангӣ', en: 'Cultural tours' },
    icon: 'Landmark',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc',
  },
  {
    id: 'cat-pamir',
    slug: 'pamir-highway',
    name: { ru: 'Памирский тракт', tj: 'Роҳи Памир', en: 'Pamir Highway' },
    icon: 'Route',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05',
  },
  {
    id: 'cat-winter',
    slug: 'winter',
    name: { ru: 'Зимний отдых', tj: 'Истироҳати зимистона', en: 'Winter travel' },
    icon: 'Snowflake',
    image: 'https://images.unsplash.com/photo-1553342385-111fd6bc6ab3',
  },
  {
    id: 'cat-climbing',
    slug: 'climbing',
    name: { ru: 'Альпинизм', tj: 'Алпинизм', en: 'Alpinism' },
    icon: 'MountainSnow',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4',
  },
  {
    id: 'cat-family',
    slug: 'family',
    name: { ru: 'Семейные туры', tj: 'Сафари оилавӣ', en: 'Family tours' },
    icon: 'Users',
    image: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8',
  },
  {
    id: 'cat-international',
    slug: 'international',
    name: { ru: 'Международные', tj: 'Байналмилалӣ', en: 'International' },
    icon: 'Globe',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200',
  },
]