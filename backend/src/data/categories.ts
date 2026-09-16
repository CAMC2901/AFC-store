import { Category } from '../types';

export const categoriesSeed: Category[] = [
  {
    id: 'cat_living',
    name: 'Sala de estar',
    nameEn: 'Living Room',
    slug: 'living-room',
    description: 'Sofás, modulares y piezas lounge que anclan tu comodidad cotidiana.',
    descriptionEn: 'Sofas, sectionals and lounge pieces that anchor your everyday comfort.',
    imageUrl:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 1,
  },
  {
    id: 'cat_bedroom',
    name: 'Dormitorio',
    nameEn: 'Bedroom',
    slug: 'bedroom',
    description: 'Camas, cómodas y mesitas de noche para espacios serenos y refinados.',
    descriptionEn: 'Beds, dressers and nightstands for restful, refined spaces.',
    imageUrl:
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 2,
  },
  {
    id: 'cat_dining',
    name: 'Comedor',
    nameEn: 'Dining',
    slug: 'dining',
    description: 'Mesas, sillas y aparadores creados para momentos memorables.',
    descriptionEn: 'Tables, chairs and cabinets crafted for memorable gatherings.',
    imageUrl:
      'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 3,
  },
  {
    id: 'cat_office',
    name: 'Oficina',
    nameEn: 'Office',
    slug: 'office',
    description: 'Escritorios y asientos ergonómicos para un trabajo enfocado y productivo.',
    descriptionEn: 'Desks and ergonomic seating for focused, productive work.',
    imageUrl:
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 4,
  },
  {
    id: 'cat_lighting',
    name: 'Iluminación',
    nameEn: 'Lighting',
    slug: 'lighting',
    description: 'Piezas de autor que definen el ambiente de cada espacio.',
    descriptionEn: 'Statement fixtures that set the mood of every room.',
    imageUrl:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 5,
  },
  {
    id: 'cat_decor',
    name: 'Decor y accesorios',
    nameEn: 'Decor & Accents',
    slug: 'decor',
    description: 'Alfombras, arte y detalles que completan la historia de tu hogar.',
    descriptionEn: 'Rugs, art and accents that complete the story of your home.',
    imageUrl:
      'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=1200&q=80',
    sortOrder: 6,
  },
];