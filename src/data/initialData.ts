import { Product, LoyaltyBadge, RewardItem, CMSConfig, User } from '../types';

export const DEFAULT_CMS_CONFIG: CMSConfig = {
  brandName: 'Starbucks Coffee & Rewards',
  tagline: 'Inspirar y nutrir el espíritu humano: una persona, una taza y una comunidad a la vez.',
  logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=300&auto=format&fit=crop',
  primaryColor: '#006241', // Starbucks House Green
  darkColor: '#1E3932',    // Deep Forest Green
  lightColor: '#D4E9E2',   // Starbucks Mint
  goldColor: '#CBA258',    // Starbucks Gold / Warm Brass
  creamColor: '#F2F0EB',   // Soft Cream
  heroTitle: 'Tu café favorito, preparado con maestría y a tu puerta',
  heroSubtitle: 'Disfruta de nuestra icónica selección de café arábica 100% certificado. Entrega a domicilio o retiro express sin filas.',
  heroBadge: '🌟 Starbucks Rewards - 10 Estrellas por cada $1 gastado',
  heroImageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1200&auto=format&fit=crop',
  announcementText: '🎉 ¡Obtén 50 estrellas de bienvenida en tu primera compra y delivery gratis en pedidos mayores a $25!',
  showAnnouncement: true,
  deliveryFee: 2.99,
  freeDeliveryThreshold: 25.0,
  pointsPerDollar: 10,
  isDeliveryOpen: true,
  storeBranches: [
    'Sucursal Central Paseo Reforma (Abierto 6:30 AM - 10:00 PM)',
    'Sucursal Gourmet Zona Rosa (Abierto 7:00 AM - 9:30 PM)',
    'Sucursal Drive-Thru Aeropuerto (Abierto 24 Horas)'
  ]
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-caramel-macchiato',
    name: 'Caramel Macchiato',
    category: 'bebidas_calientes',
    shortDescription: 'Espresso intenso, leche al vapor con jarabe de vainilla y rejilla de caramelo.',
    longDescription: 'Nuestra legendaria combinación de leche fresca recién vaporizada combinada con sutil jarabe de vainilla, marcada con nuestro rico espresso tostado oscuro y finalizada con una generosa espiral de salsa de caramelo artesanal.',
    basePrice: 4.85,
    salePrice: 3.99,
    imageUrl: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?q=80&w=800&auto=format&fit=crop',
    available: true,
    featured: true,
    temperatureOption: 'ambos',
    starsAwarded: 50,
    variants: [
      { id: 'v-alto', name: 'Alto (12 oz)', priceDelta: 0, calories: 190 },
      { id: 'v-grande', name: 'Grande (16 oz)', priceDelta: 0.70, calories: 250 },
      { id: 'v-venti', name: 'Venti (24 oz)', priceDelta: 1.25, calories: 310 }
    ],
    modifierGroups: [
      {
        id: 'mg-milk',
        name: 'Tipo de Leche',
        required: true,
        maxSelection: 1,
        options: [
          { id: 'm-entera', name: 'Leche Entera Tradicional', priceDelta: 0 },
          { id: 'm-deslactosada', name: 'Leche Deslactosada', priceDelta: 0 },
          { id: 'm-avena', name: 'Leche de Avena Barista (Oatmeal)', priceDelta: 0.75 },
          { id: 'm-almendra', name: 'Bebida de Almendra', priceDelta: 0.75 },
          { id: 'm-soya', name: 'Bebida de Soya Orgánica', priceDelta: 0.60 }
        ]
      },
      {
        id: 'mg-temp',
        name: 'Temperatura',
        required: true,
        maxSelection: 1,
        options: [
          { id: 't-caliente', name: 'Caliente (Vapor estándar)', priceDelta: 0 },
          { id: 't-muy-caliente', name: 'Extra Caliente (70°C)', priceDelta: 0 },
          { id: 't-helado', name: 'Helado con Cubos de Hielo', priceDelta: 0 }
        ]
      },
      {
        id: 'mg-espresso',
        name: 'Espresso y Tostado',
        required: false,
        maxSelection: 2,
        options: [
          { id: 'e-blonde', name: 'Starbucks Blonde Roast (Suave y dulce)', priceDelta: 0 },
          { id: 'e-shot-extra', name: '1 Shot Extra de Espresso Signature', priceDelta: 0.90 },
          { id: 'e-descafeinado', name: 'Espresso Descafeinado al 100%', priceDelta: 0 }
        ]
      },
      {
        id: 'mg-syrups',
        name: 'Salsas y Jarabes Especiales',
        required: false,
        maxSelection: 3,
        options: [
          { id: 's-extra-caramel', name: 'Doble Drizzle de Caramelo', priceDelta: 0.50 },
          { id: 's-vanilla-sf', name: 'Jarabe Vainilla Sugar-Free', priceDelta: 0.60 },
          { id: 's-avellana', name: 'Jarabe de Avellana Tostada', priceDelta: 0.60 }
        ]
      }
    ]
  },
  {
    id: 'prod-cold-brew-vanilla-sweet-cream',
    name: 'Vanilla Sweet Cream Cold Brew',
    category: 'bebidas_frias',
    shortDescription: 'Café infusionado en frío por 20 horas coronado con crema dulce de vainilla.',
    longDescription: 'Nuestro café Starbucks Cold Brew de extracción lenta y artesanal servido con hielo y terminado delicadamente con un toque de crema dulce de vainilla casera que cae suavemente creando hermosas cascadas.',
    basePrice: 5.25,
    imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?q=80&w=800&auto=format&fit=crop',
    available: true,
    featured: true,
    starsAwarded: 55,
    variants: [
      { id: 'v-alto', name: 'Alto (12 oz)', priceDelta: 0, calories: 110 },
      { id: 'v-grande', name: 'Grande (16 oz)', priceDelta: 0.65, calories: 160 },
      { id: 'v-venti', name: 'Venti (24 oz)', priceDelta: 1.15, calories: 200 }
    ],
    modifierGroups: [
      {
        id: 'mg-ice',
        name: 'Cantidad de Hielo',
        required: true,
        maxSelection: 1,
        options: [
          { id: 'i-normal', name: 'Hielo Regular', priceDelta: 0 },
          { id: 'i-poco', name: 'Poco Hielo', priceDelta: 0 },
          { id: 'i-sin', name: 'Sin Hielo', priceDelta: 0 }
        ]
      },
      {
        id: 'mg-foam',
        name: 'Cold Foam y Cremas',
        required: false,
        maxSelection: 2,
        options: [
          { id: 'cf-vanilla', name: 'Sweet Cream Clásica de Vainilla', priceDelta: 0 },
          { id: 'cf-salted-caramel', name: 'Salted Caramel Cold Foam', priceDelta: 1.10 },
          { id: 'cf-chocolate', name: 'Chocolate Cream Cold Foam', priceDelta: 1.10 }
        ]
      }
    ]
  },
  {
    id: 'prod-mocha-frappuccino',
    name: 'Mocha Frappuccino® Blended Beverage',
    category: 'frappuccinos',
    shortDescription: 'Café tostado, salsa mocha intensa, leche y hielo frappé con crema batida.',
    longDescription: 'El consentido helado: una armonía chocolatosa y estimulante entre nuestro concentrado de café arábica frappuccino, salsa de cacao tostado mocha de la casa y leche batida con hielo, coronado con un remolino de crema batida sedosa.',
    basePrice: 5.60,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=800&auto=format&fit=crop',
    available: true,
    featured: true,
    starsAwarded: 60,
    variants: [
      { id: 'v-alto', name: 'Alto (12 oz)', priceDelta: 0, calories: 290 },
      { id: 'v-grande', name: 'Grande (16 oz)', priceDelta: 0.75, calories: 370 },
      { id: 'v-venti', name: 'Venti (24 oz)', priceDelta: 1.30, calories: 470 }
    ],
    modifierGroups: [
      {
        id: 'mg-milk-frap',
        name: 'Base de Leche',
        required: true,
        maxSelection: 1,
        options: [
          { id: 'mf-entera', name: 'Leche Entera Cremosa', priceDelta: 0 },
          { id: 'mf-deslactosada', name: 'Leche Deslactosada Light', priceDelta: 0 },
          { id: 'mf-avena', name: 'Leche de Avena', priceDelta: 0.75 }
        ]
      },
      {
        id: 'mg-whipped',
        name: 'Crema Batida (Whipped Cream)',
        required: true,
        maxSelection: 1,
        options: [
          { id: 'w-regular', name: 'Con Crema Batida Signature', priceDelta: 0 },
          { id: 'w-extra', name: 'Extra Crema Batida', priceDelta: 0.40 },
          { id: 'w-none', name: 'Sin Crema Batida', priceDelta: 0 }
        ]
      },
      {
        id: 'mg-chips',
        name: 'Toppings y Adiciones',
        required: false,
        maxSelection: 2,
        options: [
          { id: 'c-chips', name: 'Chispas de Chocolate Belga', priceDelta: 0.65 },
          { id: 'c-cookie', name: 'Polvo de Galleta Crujiente', priceDelta: 0.50 }
        ]
      }
    ]
  },
  {
    id: 'prod-iced-matcha-latte',
    name: 'Iced Matcha Green Tea Latte',
    category: 'bebidas_frias',
    shortDescription: 'Té verde matcha puro japonés mezclado suavemente con leche y hielo.',
    longDescription: 'Matcha culinario japonés finamente molido al vapor de bambú, mezclado rítmicamente con leche fresca fría y servido sobre cubos cristalinos de hielo.',
    basePrice: 4.95,
    imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=800&auto=format&fit=crop',
    available: true,
    featured: false,
    starsAwarded: 50,
    variants: [
      { id: 'v-alto', name: 'Alto (12 oz)', priceDelta: 0, calories: 140 },
      { id: 'v-grande', name: 'Grande (16 oz)', priceDelta: 0.70, calories: 200 },
      { id: 'v-venti', name: 'Venti (24 oz)', priceDelta: 1.20, calories: 280 }
    ],
    modifierGroups: [
      {
        id: 'mg-milk-matcha',
        name: 'Leche',
        required: true,
        maxSelection: 1,
        options: [
          { id: 'mm-avena', name: 'Leche de Avena (Recomendada)', priceDelta: 0.75 },
          { id: 'mm-almendra', name: 'Leche de Almendra', priceDelta: 0.75 },
          { id: 'mm-entera', name: 'Leche Entera', priceDelta: 0 }
        ]
      },
      {
        id: 'mg-sweet-level',
        name: 'Nivel de Endulzante',
        required: true,
        maxSelection: 1,
        options: [
          { id: 'sw-normal', name: 'Dulzura Normal (2 bombas)', priceDelta: 0 },
          { id: 'sw-medio', name: 'Menos Dulce (1 bomba)', priceDelta: 0 },
          { id: 'sw-sin', name: 'Sin Azúcar / Puro Matcha', priceDelta: 0 }
        ]
      }
    ]
  },
  {
    id: 'prod-croissant-mantequilla',
    name: 'Butter Croissant Francés Horneado',
    category: 'reposteria',
    shortDescription: 'Croissant clásico hojaldrado elaborado con mantequilla francesa pura.',
    longDescription: 'Hojaldre tradicional francés con 36 láminas de mantequilla natural, crujiente en su corteza dorada y tiernamente suave en su interior. Horneado en cada turno de barista.',
    basePrice: 3.25,
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
    available: true,
    featured: true,
    starsAwarded: 35,
    variants: [
      { id: 'v-pieza-1', name: '1 Pieza', priceDelta: 0, calories: 260 },
      { id: 'v-duo', name: 'Pack Dúo (2 piezas)', priceDelta: 2.80, calories: 520 }
    ],
    modifierGroups: [
      {
        id: 'mg-heating',
        name: 'Servicio y Calentado',
        required: true,
        maxSelection: 1,
        options: [
          { id: 'h-caliente', name: 'Calentado al Horno (Crujiente)', priceDelta: 0 },
          { id: 'h-temperatura', name: 'Temperatura Ambiente', priceDelta: 0 }
        ]
      },
      {
        id: 'mg-spreads',
        name: 'Untables Opcionales',
        required: false,
        maxSelection: 2,
        options: [
          { id: 'sp-mantequilla', name: 'Porción Mantequilla con Sal', priceDelta: 0.35 },
          { id: 'sp-mermelada', name: 'Mermelada de Frambuesa Orgánica', priceDelta: 0.60 }
        ]
      }
    ]
  },
  {
    id: 'prod-sandwich-pavo-panela',
    name: 'Sandwich de Pavo y Queso Panela Artesanal',
    category: 'alimentos',
    shortDescription: 'Pechuga de pavo horneada, queso panela fresco, espinacas y pesto en pan multigrano.',
    longDescription: 'Pechuga de pavo baja en sodio con rebanadas gruesas de queso panela artesanal, hojas tiernas de espinaca orgánica y aderezo pesto ligero sobre pan artesanal rústico de masa madre y granos tostados.',
    basePrice: 6.75,
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?q=80&w=800&auto=format&fit=crop',
    available: true,
    featured: false,
    starsAwarded: 70,
    variants: [
      { id: 'v-sandwich-std', name: 'Tamaño Regular', priceDelta: 0, calories: 420 }
    ],
    modifierGroups: [
      {
        id: 'mg-warm-sandwich',
        name: 'Preparación',
        required: true,
        maxSelection: 1,
        options: [
          { id: 'w-grill', name: 'Tostado al Grill (Queso derretido)', priceDelta: 0 },
          { id: 'w-frio', name: 'Frío / Fresco', priceDelta: 0 }
        ]
      }
    ]
  },
  {
    id: 'prod-cafe-pike-place-grano',
    name: 'Pike Place® Roast Café en Grano (250g)',
    category: 'cafe_grano',
    shortDescription: 'Nuestra mezcla insignia tostada media con sutiles notas de cacao y frutos secos.',
    longDescription: 'Nombrado en honor a nuestra primera tienda en el Pike Place Market de Seattle en 1971. Un tueste medio armonioso, accesible y perfectamente balanceado para disfrutar en prensa francesa, cafetera de goteo o espresso doméstico.',
    basePrice: 13.50,
    imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=800&auto=format&fit=crop',
    available: true,
    featured: false,
    starsAwarded: 135,
    variants: [
      { id: 'v-grano-250', name: 'Bolsa 250 gramos', priceDelta: 0 },
      { id: 'v-grano-500', name: 'Bolsa 500 gramos', priceDelta: 11.50 }
    ],
    modifierGroups: [
      {
        id: 'mg-grind',
        name: 'Tipo de Molienda',
        required: true,
        maxSelection: 1,
        options: [
          { id: 'g-entero', name: 'Grano Entero (Para moler en casa)', priceDelta: 0 },
          { id: 'g-prensa', name: 'Molienda Gruesa (Prensa Francesa)', priceDelta: 0 },
          { id: 'g-filtro', name: 'Molienda Media (Cafetera de Filtro)', priceDelta: 0 },
          { id: 'g-espresso', name: 'Molienda Fina (Máquina Espresso)', priceDelta: 0 }
        ]
      }
    ]
  }
];

export const INITIAL_BADGES: LoyaltyBadge[] = [
  {
    id: 'badge-morning',
    title: 'Racha Matutina',
    description: 'Pide tu café favorito antes de las 10:00 AM para energizar tu día.',
    iconName: 'Sun',
    starsReward: 50,
    targetCount: 3,
    currentCount: 2,
    completed: false
  },
  {
    id: 'badge-explorer',
    title: 'Explorador Cold Brew',
    description: 'Disfruta 2 bebidas heladas o de extracción artesanal en frío.',
    iconName: 'Sparkles',
    starsReward: 40,
    targetCount: 2,
    currentCount: 2,
    completed: true
  },
  {
    id: 'badge-eco',
    title: 'Héroe Eco-Sostenible',
    description: 'Elige la opción sin empaque plástico o vaso reutilizable.',
    iconName: 'Leaf',
    starsReward: 30,
    targetCount: 1,
    currentCount: 1,
    completed: true
  },
  {
    id: 'badge-bakery',
    title: 'Maridaje Perfecto',
    description: 'Acompaña tu bebida favorita con un pan horneado o croissant.',
    iconName: 'CakeSlice',
    starsReward: 60,
    targetCount: 2,
    currentCount: 1,
    completed: false
  }
];

export const INITIAL_REWARDS: RewardItem[] = [
  {
    id: 'rew-extra-shot',
    name: 'Shot Extra de Espresso o Jarabe',
    description: 'Personaliza tu bebida favorita con un shot espresso adicional o salsa sin costo.',
    starsRequired: 50,
    category: 'personalizacion',
    imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=400&auto=format&fit=crop',
    available: true
  },
  {
    id: 'rew-cafe-del-dia',
    name: 'Café Caliente del Día o Té Shaken',
    description: 'Cualquier tamaño Alto o Grande de café recién filtrado o té helado infusionado.',
    starsRequired: 150,
    category: 'bebidas',
    imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=400&auto=format&fit=crop',
    available: true
  },
  {
    id: 'rew-handcrafted-drink',
    name: 'Bebida Artesanal Preparada o Alimento',
    description: 'Un Latte, Frappuccino®, Caramel Macchiato o sándwich horneado a tu gusto.',
    starsRequired: 250,
    category: 'artesanal',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=400&auto=format&fit=crop',
    available: true
  },
  {
    id: 'rew-cafe-grano',
    name: 'Bolsa de Café en Grano (250g) o Vaso Tumbler',
    description: 'Lleva el café Starbucks a tu hogar o adquiere un vaso reutilizable de colección.',
    starsRequired: 400,
    category: 'merchandise',
    imageUrl: 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=400&auto=format&fit=crop',
    available: true
  }
];

export const INITIAL_USER: User = {
  id: 'usr-client-001',
  name: 'Camila Rosales',
  email: 'camila.rosales@example.com',
  role: 'customer',
  phone: '+52 55 4920 1184',
  address: 'Av. Insurgentes Sur 1450, Piso 8, Del Valle, CDMX',
  stars: 320,
  lifetimeStars: 780,
  tier: 'gold',
  favoriteProductIds: ['prod-caramel-macchiato', 'prod-cold-brew-vanilla-sweet-cream'],
  badges: INITIAL_BADGES
};

export const ADMIN_USER: User = {
  id: 'usr-admin-001',
  name: 'Master Barista & Administrador',
  email: 'admin@starbucks-demo.com',
  role: 'admin',
  phone: '+52 55 9900 3321',
  address: 'Oficina Central de Operaciones Starbucks',
  stars: 1250,
  lifetimeStars: 3400,
  tier: 'reserve',
  favoriteProductIds: [],
  badges: INITIAL_BADGES
};
