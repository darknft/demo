import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  OrderStatus,
  User,
  CMSConfig,
  RewardItem,
  AppNotification,
  DeliveryType,
  RecurringFrequency,
  ProductVariant,
  SelectedModifier,
  AdminTab
} from '../types';
import {
  DEFAULT_CMS_CONFIG,
  INITIAL_PRODUCTS,
  INITIAL_REWARDS,
  INITIAL_BADGES,
  INITIAL_USER,
  ADMIN_USER
} from '../data/initialData';
import { getSupabaseClient } from '../lib/supabase';

// Master Administrator Credentials
export const ADMIN_CREDENTIALS = {
  email: 'darkbts@protonmail.com',
  password: 'Mastercoffe26@#$'
};

// Simple audio tone synthesis for authentic feedback
export function calculateAge(birthDateString: string): number {
  if (!birthDateString) return 0;
  const parts = birthDateString.split('-');
  if (parts.length < 3) return 0;
  const birthYear = parseInt(parts[0], 10);
  const birthMonth = parseInt(parts[1], 10) - 1;
  const birthDay = parseInt(parts[2], 10);
  if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return 0;

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() - birthMonth;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return age;
}

interface StoreContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  currentOrder: Order | null;
  user: User;
  cmsConfig: CMSConfig;
  rewards: RewardItem[];
  notifications: AppNotification[];
  deliveryType: DeliveryType;
  selectedBranch: string;
  deliveryAddress: string;
  activeTab: 'menu' | 'rewards' | 'favorites' | 'admin';
  adminTab: AdminTab;
  isCartOpen: boolean;
  isAuthModalOpen: boolean;
  isProductModalOpen: boolean;
  isCheckoutOpen: boolean;
  isOrderTrackerOpen: boolean;
  isDownloadModalOpen: boolean;
  activeProduct: Product | null;
  searchQuery: string;
  selectedCategory: string;

  // Setters for remote data sync
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setCmsConfig: React.Dispatch<React.SetStateAction<CMSConfig>>;

  // Actions
  setDeliveryType: (type: DeliveryType) => void;
  setSelectedBranch: (branch: string) => void;
  setDeliveryAddress: (address: string) => void;
  setActiveTab: (tab: 'menu' | 'rewards' | 'favorites' | 'admin') => void;
  setAdminTab: (tab: AdminTab) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsAuthModalOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsOrderTrackerOpen: (open: boolean) => void;
  setIsDownloadModalOpen: (open: boolean) => void;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (cat: string) => void;

  // Cart operations
  addToCart: (
    product: Product,
    variant: ProductVariant,
    modifiers: SelectedModifier[],
    quantity: number,
    specialInstructions?: string,
    isRecurring?: boolean,
    recurringFrequency?: RecurringFrequency
  ) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;

  // Favorites
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;

  // Orders
  createOrder: (orderData: {
    deliveryType: DeliveryType;
    deliveryAddress?: string;
    pickupBranch?: string;
    deliveryNotes?: string;
    paymentMethod: 'cash' | 'card';
    cashAmountProvided?: number;
    tip: number;
    pointsToRedeem: number;
    isRecurring?: boolean;
    recurringFrequency?: RecurringFrequency;
  }) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  viewOrderDetails: (order: Order) => void;

  // Products CRUD (Admin)
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleProductAvailability: (productId: string) => void;
  toggleDeliveryStatus: () => void;

  // Loyalty & Rewards
  claimBadge: (badgeId: string) => void;
  redeemReward: (reward: RewardItem) => boolean;
  addStarsToUser: (amount: number, reason?: string) => void;
  addReward: (reward: Omit<RewardItem, 'id'>) => void;
  updateReward: (reward: RewardItem) => void;
  deleteReward: (rewardId: string) => void;

  // CMS
  updateCMSConfig: (newConfig: Partial<CMSConfig>, immediateNotify?: boolean) => void;
  resetCMSToStarbucks: () => void;
  resetCMSToArtisan: () => void;

  // Notifications
  addNotification: (title: string, message: string, type?: AppNotification['type'], orderId?: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Auth, Roles & Profile
  switchUserRole: (role: 'admin' | 'customer') => void;
  loginUser: (email: string, name?: string, password?: string) => { success: boolean; error?: string };
  logoutUser: () => void;
  registerCustomer: (customerData: {
    name: string;
    email: string;
    phone: string;
    gender: string;
    birthDate: string;
    city: string;
    address?: string;
    password?: string;
  }) => { success: boolean; error?: string };
  updateCustomerProfile: (data: Partial<User>) => { success: boolean; error?: string };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Simple audio tone synthesis for authentic feedback
function playChime(type: 'success' | 'bell' | 'star') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'star') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); // C6
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'bell') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  } catch {
    // AudioContext blocked or not allowed in silent mode
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('sb_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // CMS config
  const [cmsConfig, setCmsConfig] = useState<CMSConfig>(() => {
    try {
      const saved = localStorage.getItem('sb_cms_config');
      return saved ? JSON.parse(saved) : DEFAULT_CMS_CONFIG;
    } catch {
      return DEFAULT_CMS_CONFIG;
    }
  });

  // Rewards catalog
  const [rewards, setRewards] = useState<RewardItem[]>(() => {
    try {
      const saved = localStorage.getItem('sb_rewards');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((r: RewardItem) => ({
          ...r,
          description: r.description?.replace(/Starbucks/g, 'Bean & Co') || r.description
        }));
      }
      return INITIAL_REWARDS;
    } catch {
      return INITIAL_REWARDS;
    }
  });

  // User
  const [user, setUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem('sb_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sb_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('sb_orders');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback to initial sample order
    }
    // Create an initial sample order for realistic experience
    const sampleOrder: Order = {
      id: 'SB-88219',
      userId: INITIAL_USER.id,
      customerName: INITIAL_USER.name,
      customerEmail: INITIAL_USER.email,
      customerPhone: INITIAL_USER.phone || '+52 55 4920 1184',
      deliveryType: 'delivery',
      deliveryAddress: INITIAL_USER.address,
      deliveryNotes: 'Dejar en recepción del piso 8 por favor.',
      paymentMethod: 'card',
      cardLast4: '4242',
      paymentStatus: 'paid',
      status: 'preparing',
      subtotal: 10.10,
      discount: 0,
      deliveryFee: 2.99,
      tip: 1.50,
      total: 14.59,
      pointsEarned: 100,
      pointsRedeemed: 0,
      createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      estimatedTimeMinutes: 20,
      timeline: [
        { status: 'received', label: 'Pedido Confirmado', time: '10:15 AM', completed: true, description: 'Tu orden fue recibida por la barra de café.' },
        { status: 'preparing', label: 'En Preparación por Barista', time: '10:18 AM', completed: true, description: 'El barista Mateo está vaporizando la leche y calibrando el espresso.' },
        { status: 'in_transit', label: 'En Camino con Repartidor', time: '10:30 AM', completed: false, description: 'El repartidor está en ruta con tu portavasos térmico protegido.' },
        { status: 'delivered', label: 'Entregado', time: '10:45 AM', completed: false, description: '¡Disfruta tu café!' }
      ],
      items: [
        {
          id: 'item-demo-1',
          productId: 'prod-caramel-macchiato',
          productName: 'Caramel Macchiato',
          category: 'bebidas_calientes',
          imageUrl: INITIAL_PRODUCTS[0].imageUrl,
          basePrice: 4.85,
          selectedVariant: INITIAL_PRODUCTS[0].variants[1], // Grande
          selectedModifiers: [
            { groupId: 'mg-milk', groupName: 'Tipo de Leche', optionId: 'm-avena', optionName: 'Leche de Avena Barista', priceDelta: 0.75 }
          ],
          unitPrice: 6.30,
          quantity: 1,
          specialInstructions: 'Poco jarabe de vainilla por favor'
        },
        {
          id: 'item-demo-2',
          productId: 'prod-croissant-mantequilla',
          productName: 'Butter Croissant Francés Horneado',
          category: 'reposteria',
          imageUrl: INITIAL_PRODUCTS[4].imageUrl,
          basePrice: 3.25,
          selectedVariant: INITIAL_PRODUCTS[4].variants[0],
          selectedModifiers: [
            { groupId: 'mg-heating', groupName: 'Servicio y Calentado', optionId: 'h-caliente', optionName: 'Calentado al Horno', priceDelta: 0 }
          ],
          unitPrice: 3.25,
          quantity: 1
        }
      ]
    };
    return [sampleOrder];
  });

  // Current order for tracker
  const [currentOrder, setCurrentOrder] = useState<Order | null>(() => orders[0] || null);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif-welcome',
      title: '¡Bienvenido a Bean & Co Rewards!',
      message: 'Tienes 320 estrellas disponibles. Úsalas para canjear bebidas artesanales o postres.',
      type: 'loyalty',
      read: false,
      timestamp: 'Hace 5 minutos'
    },
    {
      id: 'notif-order-demo',
      title: 'Tu pedido SB-88219 está en preparación ☕',
      message: 'El barista Mateo está calibrando el espresso de tu Caramel Macchiato.',
      type: 'order',
      read: false,
      timestamp: 'Hace 10 minutos',
      orderId: 'SB-88219'
    }
  ]);

  // Delivery & UI states
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [selectedBranch, setSelectedBranch] = useState<string>(DEFAULT_CMS_CONFIG.storeBranches[0]);
  const [deliveryAddress, setDeliveryAddress] = useState<string>(INITIAL_USER.address || '');
  const [activeTab, setActiveTab] = useState<'menu' | 'rewards' | 'favorites' | 'admin'>('menu');
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isOrderTrackerOpen, setIsOrderTrackerOpen] = useState<boolean>(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const cmsTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Protect admin views: If user is a customer/buyer, force tab to menu
  useEffect(() => {
    if (user.role !== 'admin' && activeTab === 'admin') {
      setActiveTab('menu');
    }
  }, [user.role, activeTab]);

  const handleSetActiveTab = (tab: 'menu' | 'rewards' | 'favorites' | 'admin') => {
    if (tab === 'admin' && user.role !== 'admin') {
      addNotification('Acceso Restringido', 'Solo administradores autorizados pueden acceder al panel administrativo.', 'system');
      setActiveTab('menu');
      return;
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    return () => {
      if (cmsTimerRef.current) {
        clearTimeout(cmsTimerRef.current);
      }
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('sb_products', JSON.stringify(products));
    } catch { /* ignored */ }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('sb_cms_config', JSON.stringify(cmsConfig));
      // Update dynamic document root colors for white-label CMS live preview
      document.documentElement.style.setProperty('--brand-primary', cmsConfig.primaryColor);
      document.documentElement.style.setProperty('--brand-dark', cmsConfig.darkColor);
      document.documentElement.style.setProperty('--brand-light', cmsConfig.lightColor);
      document.documentElement.style.setProperty('--brand-gold', cmsConfig.goldColor);
      document.documentElement.style.setProperty('--brand-cream', cmsConfig.creamColor);
    } catch { /* ignored */ }
  }, [cmsConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('sb_rewards', JSON.stringify(rewards));
    } catch { /* ignored */ }
  }, [rewards]);

  useEffect(() => {
    try {
      localStorage.setItem('sb_user', JSON.stringify(user));
    } catch { /* ignored */ }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('sb_cart', JSON.stringify(cart));
    } catch { /* ignored */ }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('sb_orders', JSON.stringify(orders));
    } catch { /* ignored */ }
  }, [orders]);

  // Sync helpers to Supabase
  const syncProductToSupabase = async (product: Product) => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      await supabase.from('products').upsert({
        id: product.id,
        name: product.name,
        category: product.category,
        short_description: product.shortDescription || '',
        long_description: product.longDescription || '',
        base_price: product.basePrice || 0,
        sale_price: product.salePrice || null,
        image_url: product.imageUrl || '',
        available: product.available ?? true,
        featured: product.featured ?? false,
        temperature_option: product.temperatureOption || 'no_aplica',
        variants: product.variants || [],
        modifier_groups: product.modifierGroups || [],
        stars_awarded: product.starsAwarded || 10,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (err) {
      console.warn('Error syncing product to Supabase:', err);
    }
  };

  const syncCMSToSupabase = async (config: CMSConfig) => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      await supabase.from('cms_config').upsert({
        id: 'default',
        brand_name: config.brandName,
        tagline: config.tagline,
        primary_color: config.primaryColor,
        dark_color: config.darkColor,
        light_color: config.lightColor,
        gold_color: config.goldColor,
        cream_color: config.creamColor,
        logo_url: config.logoUrl,
        hero_title: config.heroTitle,
        hero_subtitle: config.heroSubtitle,
        hero_badge: config.heroBadge,
        hero_image_url: config.heroImageUrl,
        announcement_bar: config.announcementText,
        show_announcement: config.showAnnouncement,
        delivery_fee: config.deliveryFee,
        free_delivery_threshold: config.freeDeliveryThreshold,
        points_per_dollar: config.pointsPerDollar,
        store_branches: config.storeBranches,
        is_delivery_open: config.isDeliveryOpen,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (err) {
      console.warn('Error syncing CMS to Supabase:', err);
    }
  };

  const syncOrderToSupabase = async (order: Order) => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      await supabase.from('orders').upsert({
        id: order.id,
        user_id: order.userId,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        delivery_type: order.deliveryType,
        delivery_address: order.deliveryAddress,
        pickup_branch: order.pickupBranch,
        delivery_notes: order.deliveryNotes,
        payment_method: order.paymentMethod,
        card_last4: order.cardLast4,
        payment_status: order.paymentStatus,
        status: order.status,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        delivery_fee: order.deliveryFee,
        tip: order.tip,
        total: order.total,
        points_earned: order.pointsEarned,
        points_redeemed: order.pointsRedeemed,
        timeline: order.timeline,
        created_at: order.createdAt,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    } catch (err) {
      console.warn('Error syncing order to Supabase:', err);
    }
  };

  const syncCustomerToSupabase = async (cust: User) => {
    try {
      const supabase = getSupabaseClient();
      if (!supabase) return;
      await supabase.from('store_users').upsert({
        id: cust.id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone || '',
        gender: cust.gender || null,
        birth_date: cust.birthDate || null,
        age: cust.age || null,
        city: cust.city || null,
        address: cust.address || null,
        stars: cust.stars || 50,
        tier: cust.tier || 'green',
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' });
    } catch (err) {
      // Non-blocking sync
    }
  };

  // Auto-sync with Supabase on startup if configured
  useEffect(() => {
    const syncFromRemote = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) return;

      try {
        // 1. Fetch products from Supabase
        const { data: dbProds, error: prodErr } = await supabase.from('products').select('*');
        if (!prodErr && dbProds && dbProds.length > 0) {
          const mapped = dbProds.map((row: any) => ({
            id: row.id,
            name: row.name,
            category: row.category,
            shortDescription: row.short_description,
            longDescription: row.long_description,
            basePrice: Number(row.base_price),
            salePrice: row.sale_price ? Number(row.sale_price) : undefined,
            imageUrl: row.image_url,
            available: Boolean(row.available),
            featured: Boolean(row.featured),
            temperatureOption: row.temperature_option,
            variants: row.variants || [],
            modifierGroups: row.modifier_groups || [],
            starsAwarded: row.stars_awarded || 10
          }));
          setProducts(mapped);
        } else if (!prodErr && (!dbProds || dbProds.length === 0)) {
          // If table exists but is empty, seed products to Supabase automatically!
          const mappedProducts = products.map((p: any) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            short_description: p.shortDescription || '',
            long_description: p.longDescription || '',
            base_price: p.basePrice || 0,
            sale_price: p.salePrice || null,
            image_url: p.imageUrl || '',
            available: p.available ?? true,
            featured: p.featured ?? false,
            temperature_option: p.temperatureOption || 'no_aplica',
            variants: p.variants || [],
            modifier_groups: p.modifierGroups || [],
            stars_awarded: p.starsAwarded || 10,
            updated_at: new Date().toISOString()
          }));
          await supabase.from('products').upsert(mappedProducts, { onConflict: 'id' });
        }

        // 2. Fetch CMS config from Supabase
        const { data: dbCms, error: cmsErr } = await supabase.from('cms_config').select('*').eq('id', 'default').maybeSingle();
        if (!cmsErr && dbCms) {
          setCmsConfig(prev => ({
            ...prev,
            brandName: dbCms.brand_name || prev.brandName,
            tagline: dbCms.tagline || prev.tagline,
            primaryColor: dbCms.primary_color || prev.primaryColor,
            darkColor: dbCms.dark_color || prev.darkColor,
            lightColor: dbCms.light_color || prev.lightColor,
            goldColor: dbCms.gold_color || prev.goldColor,
            creamColor: dbCms.cream_color || prev.creamColor,
            logoUrl: dbCms.logo_url || prev.logoUrl,
            heroTitle: dbCms.hero_title || prev.heroTitle,
            heroSubtitle: dbCms.hero_subtitle || prev.heroSubtitle,
            heroBadge: dbCms.hero_badge || prev.heroBadge,
            heroImageUrl: dbCms.hero_image_url || prev.heroImageUrl,
            announcementText: dbCms.announcement_bar || prev.announcementText,
            showAnnouncement: dbCms.show_announcement ?? prev.showAnnouncement,
            deliveryFee: Number(dbCms.delivery_fee || prev.deliveryFee),
            freeDeliveryThreshold: Number(dbCms.free_delivery_threshold || prev.freeDeliveryThreshold),
            pointsPerDollar: Number(dbCms.points_per_dollar || prev.pointsPerDollar),
            storeBranches: dbCms.store_branches || prev.storeBranches,
            isDeliveryOpen: dbCms.is_delivery_open ?? prev.isDeliveryOpen
          }));
        } else if (!cmsErr && !dbCms) {
          await syncCMSToSupabase(cmsConfig);
        }

        // 3. Fetch orders from Supabase
        const { data: dbOrders, error: ordErr } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!ordErr && dbOrders && dbOrders.length > 0) {
          const mappedOrders = dbOrders.map((ord: any) => ({
            id: ord.id,
            userId: ord.user_id,
            customerName: ord.customer_name,
            customerEmail: ord.customer_email,
            customerPhone: ord.customer_phone,
            deliveryType: ord.delivery_type,
            deliveryAddress: ord.delivery_address,
            pickupBranch: ord.pickup_branch,
            deliveryNotes: ord.delivery_notes,
            paymentMethod: ord.payment_method,
            cardLast4: ord.card_last4,
            paymentStatus: ord.payment_status,
            status: ord.status,
            items: ord.items || [],
            subtotal: Number(ord.subtotal),
            discount: Number(ord.discount || 0),
            deliveryFee: Number(ord.delivery_fee || 0),
            tip: Number(ord.tip || 0),
            total: Number(ord.total),
            pointsEarned: ord.points_earned || 0,
            pointsRedeemed: ord.points_redeemed || 0,
            timeline: ord.timeline || [
              { status: 'received', label: 'Pedido Confirmado', time: 'En registro', completed: true, description: 'Sincronizado con Supabase.' }
            ],
            createdAt: ord.created_at || new Date().toISOString(),
            estimatedTimeMinutes: 20
          }));
          setOrders(mappedOrders);
        }
      } catch (e) {
        console.warn('Initial Supabase sync check:', e);
      }
    };

    syncFromRemote();
  }, []);

  // Actions
  const openProductModal = (product: Product) => {
    setActiveProduct(product);
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setActiveProduct(null);
  };

  const addToCart = (
    product: Product,
    variant: ProductVariant,
    modifiers: SelectedModifier[],
    quantity: number,
    specialInstructions?: string,
    isRecurring?: boolean,
    recurringFrequency?: RecurringFrequency
  ) => {
    const effectiveBasePrice =
      product.salePrice && product.salePrice < product.basePrice
        ? product.salePrice
        : product.basePrice;
    const modifierTotal = modifiers.reduce((acc, m) => acc + m.priceDelta, 0);
    const unitPrice = effectiveBasePrice + variant.priceDelta + modifierTotal;

    const newItem: CartItem = {
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      productId: product.id,
      productName: product.name,
      category: product.category,
      imageUrl: product.imageUrl,
      basePrice: effectiveBasePrice,
      selectedVariant: variant,
      selectedModifiers: modifiers,
      unitPrice,
      quantity,
      specialInstructions,
      isRecurring,
      recurringFrequency
    };

    setCart(prev => [...prev, newItem]);
    playChime('bell');
    addNotification(
      'Agregado al carrito ☕',
      `Agregaste ${quantity}x ${product.name} (${variant.name})`,
      'promo'
    );
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(item => (item.id === cartItemId ? { ...item, quantity } : item)));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleFavorite = (productId: string) => {
    setUser(prev => {
      const isFav = prev.favoriteProductIds.includes(productId);
      const updated = isFav
        ? prev.favoriteProductIds.filter(id => id !== productId)
        : [...prev.favoriteProductIds, productId];
      return { ...prev, favoriteProductIds: updated };
    });
    playChime('star');
  };

  const isFavorite = (productId: string) => {
    return user.favoriteProductIds.includes(productId);
  };

  const addNotification = (
    title: string,
    message: string,
    type: AppNotification['type'] = 'system',
    orderId?: string
  ) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      read: false,
      timestamp: 'Justo ahora',
      orderId
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Create order
  const createOrder = (orderData: {
    deliveryType: DeliveryType;
    deliveryAddress?: string;
    pickupBranch?: string;
    deliveryNotes?: string;
    paymentMethod: 'cash' | 'card';
    cashAmountProvided?: number;
    tip: number;
    pointsToRedeem: number;
    isRecurring?: boolean;
    recurringFrequency?: RecurringFrequency;
  }) => {
    const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
    const deliveryFee = orderData.deliveryType === 'delivery' && subtotal < cmsConfig.freeDeliveryThreshold
      ? cmsConfig.deliveryFee
      : 0;

    // Discount from points: 100 points = $5.00 discount
    const discountFromPoints = Math.min(orderData.pointsToRedeem * 0.05, subtotal);
    // 10% discount if recurring subscription
    const recurringDiscount = orderData.isRecurring ? subtotal * 0.10 : 0;
    const totalDiscount = discountFromPoints + recurringDiscount;

    const total = Math.max(0, subtotal - totalDiscount + deliveryFee + orderData.tip);
    const pointsEarned = Math.round(total * cmsConfig.pointsPerDollar);

    const orderId = `SB-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: Order = {
      id: orderId,
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone || '+52 55 4920 1184',
      items: [...cart],
      deliveryType: orderData.deliveryType,
      deliveryAddress: orderData.deliveryType === 'delivery' ? (orderData.deliveryAddress || deliveryAddress) : undefined,
      pickupBranch: orderData.deliveryType === 'pickup' ? (orderData.pickupBranch || selectedBranch) : undefined,
      deliveryNotes: orderData.deliveryNotes,
      paymentMethod: orderData.paymentMethod,
      cashAmountProvided: orderData.cashAmountProvided,
      cashChangeNeeded: orderData.cashAmountProvided ? Math.max(0, orderData.cashAmountProvided - total) : undefined,
      cardLast4: orderData.paymentMethod === 'card' ? '4242' : undefined,
      paymentStatus: orderData.paymentMethod === 'card' ? 'paid' : 'pending_cash',
      status: 'received',
      subtotal,
      discount: totalDiscount,
      deliveryFee,
      tip: orderData.tip,
      total,
      pointsEarned,
      pointsRedeemed: orderData.pointsToRedeem,
      isRecurring: orderData.isRecurring,
      recurringFrequency: orderData.recurringFrequency,
      createdAt: new Date().toISOString(),
      estimatedTimeMinutes: orderData.deliveryType === 'delivery' ? 30 : 15,
      timeline: [
        {
          status: 'received',
          label: 'Pedido Confirmado',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          completed: true,
          description: 'Orden recibida en sistema y enviada a la pantalla de baristas.'
        },
        {
          status: 'preparing',
          label: 'En Preparación por Barista',
          time: '--:--',
          completed: false,
          description: 'Preparando tu receta artesanal y empaquetando con sello de seguridad.'
        },
        {
          status: orderData.deliveryType === 'delivery' ? 'in_transit' : 'ready_for_pickup',
          label: orderData.deliveryType === 'delivery' ? 'En Camino con Repartidor' : 'Listo para Retiro en Barra',
          time: '--:--',
          completed: false,
          description: orderData.deliveryType === 'delivery'
            ? 'Repartidor asignado con mochila térmica sellada.'
            : 'Tu bebida te espera en la estación de retiro identificada con tu nombre.'
        },
        {
          status: 'delivered',
          label: orderData.deliveryType === 'delivery' ? 'Entregado con Éxito' : 'Entregado al Cliente',
          time: '--:--',
          completed: false,
          description: '¡Gracias por disfrutar la experiencia Starbucks!'
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    setCurrentOrder(newOrder);
    clearCart();

    // Update user points and badges
    setUser(prev => {
      const newBalance = Math.max(0, prev.stars - orderData.pointsToRedeem + pointsEarned);
      const newLifetime = prev.lifetimeStars + pointsEarned;
      let newTier = prev.tier;
      if (newLifetime >= 1000) newTier = 'reserve';
      else if (newLifetime >= 300) newTier = 'gold';

      return {
        ...prev,
        stars: newBalance,
        lifetimeStars: newLifetime,
        tier: newTier
      };
    });

    playChime('success');
    addNotification(
      `¡Pedido ${orderId} realizado! ☕`,
      `Recibirás ${pointsEarned} estrellas. Estimado: ${newOrder.estimatedTimeMinutes} min.`,
      'order',
      orderId
    );

    setIsCheckoutOpen(false);
    setIsOrderTrackerOpen(true);

    // If Supabase is connected, background-sync the order
    syncOrderToSupabase(newOrder);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id !== orderId) return ord;
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const updatedTimeline = ord.timeline.map(step => {
          if (step.status === status) {
            return { ...step, completed: true, time: nowTime };
          }
          return step;
        });

        const updatedOrder = {
          ...ord,
          status,
          timeline: updatedTimeline,
          paymentStatus: status === 'delivered' && ord.paymentMethod === 'cash' ? ('paid' as const) : ord.paymentStatus
        };

        if (currentOrder && currentOrder.id === orderId) {
          setCurrentOrder(updatedOrder);
        }

        // Auto-sync order status update to Supabase
        syncOrderToSupabase(updatedOrder);

        return updatedOrder;
      })
    );

    const statusMessages: Record<OrderStatus, string> = {
      received: 'recibido y confirmado.',
      preparing: 'en preparación por el barista.',
      in_transit: 'en camino con el repartidor 🛵.',
      ready_for_pickup: '¡listo para retirar en la barra! ☕',
      delivered: 'entregado con éxito. ¡Buen provecho!',
      cancelled: 'ha sido cancelado.'
    };

    playChime('bell');
    addNotification(
      `Estado de tu pedido ${orderId}`,
      `Tu pedido está ${statusMessages[status]}`,
      'order',
      orderId
    );
  };

  const viewOrderDetails = (order: Order) => {
    setCurrentOrder(order);
    setIsOrderTrackerOpen(true);
  };

  // Products CRUD
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    const product: Product = { ...newProd, id };
    setProducts(prev => [product, ...prev]);
    syncProductToSupabase(product);
    addNotification('Producto Creado', `Se añadió "${product.name}" al catálogo.`, 'system');
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    syncProductToSupabase(updated);
    addNotification('Producto Actualizado', `Se guardaron los cambios en "${updated.name}".`, 'system');
  };

  const deleteProduct = (productId: string) => {
    // Por directriz del sistema, los productos solo se pueden desactivar (no eliminar permanentemente)
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, available: false } : p))
    );
    const prod = products.find(p => p.id === productId);
    if (prod) syncProductToSupabase({ ...prod, available: false });
    addNotification('Producto Desactivado', 'El producto ha sido desactivado del menú para mantener la integridad histórica.', 'system');
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const nextState = !p.available;
          syncProductToSupabase({ ...p, available: nextState });
          addNotification(
            nextState ? 'Producto Activado' : 'Producto Desactivado',
            `"${p.name}" ahora está ${nextState ? 'visible y disponible' : 'desactivado'}.`,
            'system'
          );
          return { ...p, available: nextState };
        }
        return p;
      })
    );
  };

  const toggleDeliveryStatus = () => {
    setCmsConfig(prev => {
      const nextState = !prev.isDeliveryOpen;
      const updatedConfig = { ...prev, isDeliveryOpen: nextState };
      syncCMSToSupabase(updatedConfig);
      addNotification(
        nextState ? '🛵 Delivery Abierto' : '⏸️ Delivery Cerrado',
        nextState
          ? 'El servicio de delivery a domicilio está activo.'
          : 'El servicio de delivery ha sido pausado. Solo retiro en tienda activo.',
        'system'
      );
      return updatedConfig;
    });
  };

  // Loyalty & Rewards
  const claimBadge = (badgeId: string) => {
    setUser(prev => {
      const badge = prev.badges.find(b => b.id === badgeId);
      if (!badge || badge.completed) return prev;
      const updatedBadges = prev.badges.map(b => (b.id === badgeId ? { ...b, completed: true } : b));
      playChime('star');
      addNotification(
        '🏆 ¡Insignia Desbloqueada!',
        `Completaste "${badge.title}" y ganaste +${badge.starsReward} estrellas.`,
        'loyalty'
      );
      return {
        ...prev,
        stars: prev.stars + badge.starsReward,
        lifetimeStars: prev.lifetimeStars + badge.starsReward,
        badges: updatedBadges
      };
    });
  };

  const redeemReward = (reward: RewardItem): boolean => {
    if (user.stars < reward.starsRequired) {
      alert(`Necesitas ${reward.starsRequired} estrellas para canjear ${reward.name}. Tienes ${user.stars}.`);
      return false;
    }

    setUser(prev => ({
      ...prev,
      stars: prev.stars - reward.starsRequired
    }));

    playChime('star');
    addNotification(
      '🎁 ¡Recompensa Canjeada!',
      `Canjeaste exitosamente: "${reward.name}". Muestra tu código QR o cupón al recoger tu pedido.`,
      'loyalty'
    );
    return true;
  };

  const addStarsToUser = (amount: number, reason: string = 'Ajuste administrativo') => {
    setUser(prev => {
      const newStars = Math.max(0, prev.stars + amount);
      const newLifetime = Math.max(prev.lifetimeStars, prev.lifetimeStars + (amount > 0 ? amount : 0));
      let newTier = prev.tier;
      if (newLifetime >= 1000) newTier = 'reserve';
      else if (newLifetime >= 300) newTier = 'gold';

      return {
        ...prev,
        stars: newStars,
        lifetimeStars: newLifetime,
        tier: newTier
      };
    });
    playChime('star');
    addNotification('Ajuste de Estrellas', `${amount > 0 ? '+' : ''}${amount} estrellas por: ${reason}`, 'loyalty');
  };

  const addReward = (reward: Omit<RewardItem, 'id'>) => {
    const id = `rew-${Date.now()}`;
    setRewards(prev => [...prev, { ...reward, id }]);
  };

  const updateReward = (updated: RewardItem) => {
    setRewards(prev => prev.map(r => (r.id === updated.id ? updated : r)));
  };

  const deleteReward = (rewardId: string) => {
    setRewards(prev => prev.filter(r => r.id !== rewardId));
  };

  // CMS
  const updateCMSConfig = (newConfig: Partial<CMSConfig>, immediateNotify: boolean = false) => {
    setCmsConfig(prev => {
      const updated = { ...prev, ...newConfig };
      syncCMSToSupabase(updated);
      return updated;
    });

    if (cmsTimerRef.current) {
      clearTimeout(cmsTimerRef.current);
      cmsTimerRef.current = null;
    }

    if (immediateNotify) {
      addNotification('CMS de Marca', 'Configuraciones de marca y diseño guardadas.', 'system');
    } else {
      // Debounce notification so typing name and slogan does NOT repeatedly send notifications on every keystroke
      cmsTimerRef.current = setTimeout(() => {
        addNotification('CMS de Marca', 'Configuración de marca actualizada.', 'system');
      }, 1500);
    }
  };

  const resetCMSToStarbucks = () => {
    setCmsConfig(DEFAULT_CMS_CONFIG);
    syncCMSToSupabase(DEFAULT_CMS_CONFIG);
  };

  const resetCMSToArtisan = () => {
    const artisanConfig: CMSConfig = {
      brandName: 'Artisan Roast & Specialty Coffee',
      tagline: 'Café de especialidad de origen único tostado a fuego lento.',
      logoUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=300&auto=format&fit=crop',
      primaryColor: '#6F4E37', // Coffee brown
      darkColor: '#2C1810',
      lightColor: '#E8D8C8',
      goldColor: '#D4AF37',
      creamColor: '#FAF7F2',
      heroTitle: 'El verdadero sabor del café de especialidad',
      heroSubtitle: 'Granos de altura cosechados a mano y tostados artesanalmente en pequeños lotes semanales.',
      heroBadge: '☕ Origen Único - Tueste Fresco Garantizado',
      heroImageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
      announcementText: '🔥 Lote especial Geisha de Panamá recién tostado disponible esta semana.',
      showAnnouncement: true,
      deliveryFee: 3.50,
      freeDeliveryThreshold: 30.0,
      pointsPerDollar: 12,
      storeBranches: [
        'Tostaduría Central & Bar de Espresso (Calle 7 #402)',
        'Barra de Filtrados Slow Bar (Distrito Creativo)'
      ],
      isDeliveryOpen: true
    };
    setCmsConfig(artisanConfig);
    syncCMSToSupabase(artisanConfig);
  };

  // Auth & Roles
  const switchUserRole = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      if (user.role === 'admin') {
        setActiveTab('admin');
      } else {
        setIsAuthModalOpen(true);
        addNotification(
          'Acceso Administrador Requerido',
          'Ingresa con darkbts@protonmail.com y tu clave de acceso para entrar como Administrador Master.',
          'system'
        );
      }
    } else {
      setUser(INITIAL_USER);
      setActiveTab('menu');
      addNotification('Sesión Cliente', 'Has cambiado al perfil de cliente.', 'system');
    }
  };

  const registerCustomer = (customerData: {
    name: string;
    email: string;
    phone: string;
    gender: string;
    birthDate: string;
    city: string;
    address?: string;
    password?: string;
  }): { success: boolean; error?: string } => {
    const trimmedName = customerData.name?.trim() || '';
    const trimmedEmail = customerData.email?.trim().toLowerCase() || '';
    const trimmedPhone = customerData.phone?.trim() || '';
    const trimmedCity = customerData.city?.trim() || '';
    const trimmedBirthDate = customerData.birthDate?.trim() || '';
    const gender = customerData.gender?.trim() || '';

    if (!trimmedName || trimmedName.length < 3) {
      return { success: false, error: 'Por favor ingresa tu Nombre y Apellido completo.' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return { success: false, error: 'Por favor ingresa un correo electrónico válido.' };
    }
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 7) {
      return { success: false, error: 'El número de celular es obligatorio (mínimo 7 dígitos numéricos).' };
    }
    if (!gender) {
      return { success: false, error: 'Por favor selecciona tu género.' };
    }
    if (!trimmedBirthDate) {
      return { success: false, error: 'La fecha de nacimiento es obligatoria.' };
    }

    const calculatedAge = calculateAge(trimmedBirthDate);
    if (calculatedAge < 18) {
      return {
        success: false,
        error: `Solo mayores de edad (18 años o más) pueden registrarse en la tienda. Tu edad calculada es de ${calculatedAge} años.`
      };
    }
    if (!trimmedCity || trimmedCity.length < 2) {
      return { success: false, error: 'La ciudad de residencia es obligatoria.' };
    }

    const newCustomer: User = {
      id: `usr-cust-${Date.now()}`,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      gender,
      birthDate: trimmedBirthDate,
      age: calculatedAge,
      city: trimmedCity,
      address: customerData.address?.trim() || trimmedCity,
      role: 'customer',
      stars: 50, // 50 estrellas de regalo de bienvenida
      lifetimeStars: 50,
      tier: 'green',
      favoriteProductIds: [],
      badges: INITIAL_BADGES
    };

    // Save to list of registered users
    try {
      const savedList: User[] = JSON.parse(localStorage.getItem('sb_registered_users') || '[]');
      const filtered = savedList.filter(u => u.email.toLowerCase() !== newCustomer.email.toLowerCase());
      filtered.push(newCustomer);
      localStorage.setItem('sb_registered_users', JSON.stringify(filtered));
    } catch (e) {
      console.error('Error saving registered customer:', e);
    }

    setUser(newCustomer);
    syncCustomerToSupabase(newCustomer);
    setActiveTab('menu');
    setIsAuthModalOpen(false);
    playChime('star');
    addNotification(
      '¡Registro Exitoso en Bean & Co!',
      `¡Bienvenido(a), ${newCustomer.name}! Se han acreditado 50★ de bienvenida a tu cuenta de mayor de edad (${calculatedAge} años).`,
      'loyalty'
    );

    return { success: true };
  };

  const updateCustomerProfile = (data: Partial<User>): { success: boolean; error?: string } => {
    let updatedAge = user.age;
    if (data.birthDate) {
      const calculatedAge = calculateAge(data.birthDate);
      if (calculatedAge < 18) {
        return {
          success: false,
          error: `Debes tener al menos 18 años para guardar tu fecha de nacimiento. Edad calculada: ${calculatedAge} años.`
        };
      }
      updatedAge = calculatedAge;
    }

    if (data.phone && data.phone.replace(/\D/g, '').length < 7) {
      return { success: false, error: 'El celular debe tener al menos 7 dígitos.' };
    }

    setUser(prev => {
      const updated: User = {
        ...prev,
        ...data,
        name: data.name?.trim() || prev.name,
        phone: data.phone?.trim() ?? prev.phone,
        city: data.city?.trim() ?? prev.city,
        address: data.address?.trim() ?? prev.address,
        gender: data.gender ?? prev.gender,
        birthDate: data.birthDate ?? prev.birthDate,
        age: updatedAge ?? prev.age
      };

      try {
        const savedList: User[] = JSON.parse(localStorage.getItem('sb_registered_users') || '[]');
        const idx = savedList.findIndex(u => u.email.toLowerCase() === updated.email.toLowerCase());
        if (idx >= 0) {
          savedList[idx] = updated;
          localStorage.setItem('sb_registered_users', JSON.stringify(savedList));
        }
      } catch (e) {
        console.error('Error updating registered user list:', e);
      }

      syncCustomerToSupabase(updated);
      return updated;
    });

    playChime('bell');
    addNotification('Perfil Actualizado', 'Tus datos de cliente se han guardado con éxito.', 'system');
    return { success: true };
  };

  const loginUser = (
    email: string,
    name?: string,
    password?: string
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password ? password.trim() : '';

    // Check if logging in as Admin Master
    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase()) {
      if (cleanPassword !== ADMIN_CREDENTIALS.password) {
        return {
          success: false,
          error: 'Contraseña incorrecta para la cuenta de Administrador Master (darkbts@protonmail.com).'
        };
      }

      setUser(ADMIN_USER);
      setActiveTab('admin');
      setIsAuthModalOpen(false);
      playChime('bell');
      addNotification(
        'Sesión Administrador Master',
        '¡Bienvenido(a)! Has ingresado con privilegios totales de administración.',
        'system'
      );
      return { success: true };
    }

    // Check if user is trying to use a generic admin email
    if (cleanEmail.includes('admin') && cleanEmail !== ADMIN_CREDENTIALS.email.toLowerCase()) {
      return {
        success: false,
        error: 'El correo oficial de Administrador es darkbts@protonmail.com.'
      };
    }

    // Check if user exists in saved registered users
    let foundUser: User | null = null;
    let savedList: any[] = [];
    try {
      savedList = JSON.parse(localStorage.getItem('sb_registered_users') || '[]');
      foundUser = savedList.find((u: any) => u.email.toLowerCase() === cleanEmail) || null;
    } catch {}

    if (foundUser) {
      const storedPassword = (foundUser as any).password;
      if (storedPassword && cleanPassword && storedPassword !== cleanPassword) {
        return {
          success: false,
          error: 'Contraseña incorrecta para tu cuenta de cliente.'
        };
      }
      setUser(foundUser);
    } else if (cleanEmail.includes('camila')) {
      setUser(INITIAL_USER);
    } else {
      setUser({
        ...INITIAL_USER,
        id: `usr-cust-${Date.now()}`,
        email: cleanEmail,
        name: name || cleanEmail.split('@')[0],
        role: 'customer'
      });
    }

    setActiveTab('menu');
    setIsAuthModalOpen(false);
    playChime('bell');
    addNotification('Inicio de Sesión', `¡Bienvenido(a) de vuelta, ${name || foundUser?.name || cleanEmail}!`, 'system');
    return { success: true };
  };

  const logoutUser = () => {
    setUser({
      ...INITIAL_USER,
      name: 'Invitado',
      email: 'invitado@starbucks-demo.com',
      role: 'customer',
      stars: 0
    });
    setActiveTab('menu');
    addNotification('Sesión Finalizada', 'Has cerrado tu sesión.', 'system');
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        cart,
        orders,
        currentOrder,
        user,
        cmsConfig,
        rewards,
        notifications,
        deliveryType,
        selectedBranch,
        deliveryAddress,
        activeTab,
        adminTab,
        isCartOpen,
        isAuthModalOpen,
        isProductModalOpen,
        isCheckoutOpen,
        isOrderTrackerOpen,
        isDownloadModalOpen,
        activeProduct,
        searchQuery,
        selectedCategory,

        setProducts,
        setOrders,
        setCmsConfig,

        setDeliveryType,
        setSelectedBranch,
        setDeliveryAddress,
        setActiveTab: handleSetActiveTab,
        setAdminTab,
        setIsCartOpen,
        setIsAuthModalOpen,
        setIsCheckoutOpen,
        setIsOrderTrackerOpen,
        setIsDownloadModalOpen,
        openProductModal,
        closeProductModal,
        setSearchQuery,
        setSelectedCategory,

        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,

        toggleFavorite,
        isFavorite,

        createOrder,
        updateOrderStatus,
        viewOrderDetails,

        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        toggleDeliveryStatus,

        claimBadge,
        redeemReward,
        addStarsToUser,
        addReward,
        updateReward,
        deleteReward,

        updateCMSConfig,
        resetCMSToStarbucks,
        resetCMSToArtisan,

        addNotification,
        markNotificationAsRead,
        clearNotifications,

        switchUserRole,
        loginUser,
        logoutUser,
        registerCustomer,
        updateCustomerProfile
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
