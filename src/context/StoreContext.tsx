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
  INITIAL_USER,
  ADMIN_USER
} from '../data/initialData';
import { getSupabaseClient } from '../lib/supabase';

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
  updateCMSConfig: (newConfig: Partial<CMSConfig>) => void;
  resetCMSToStarbucks: () => void;
  resetCMSToArtisan: () => void;

  // Notifications
  addNotification: (title: string, message: string, type?: AppNotification['type'], orderId?: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;

  // Auth & Roles
  switchUserRole: (role: 'admin' | 'customer') => void;
  loginUser: (email: string, name?: string) => void;
  logoutUser: () => void;
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
      return saved ? JSON.parse(saved) : INITIAL_REWARDS;
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
      title: '¡Bienvenido a Starbucks Rewards!',
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
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.from('orders').insert([
          {
            id: newOrder.id,
            user_id: newOrder.userId,
            customer_name: newOrder.customerName,
            customer_email: newOrder.customerEmail,
            customer_phone: newOrder.customerPhone,
            delivery_type: newOrder.deliveryType,
            delivery_address: newOrder.deliveryAddress,
            pickup_branch: newOrder.pickupBranch,
            delivery_notes: newOrder.deliveryNotes,
            payment_method: newOrder.paymentMethod,
            card_last4: newOrder.cardLast4,
            payment_status: newOrder.paymentStatus,
            status: newOrder.status,
            items: newOrder.items,
            subtotal: newOrder.subtotal,
            discount: newOrder.discount,
            delivery_fee: newOrder.deliveryFee,
            tip: newOrder.tip,
            total: newOrder.total,
            points_earned: newOrder.pointsEarned,
            points_redeemed: newOrder.pointsRedeemed,
            created_at: newOrder.createdAt
          }
        ]).then(({ error }) => {
          if (error) console.warn('No se pudo sincronizar pedido a Supabase:', error.message);
        });
      }
    } catch {
      // Ignored
    }

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
    addNotification('Producto Creado', `Se añadió "${product.name}" al catálogo.`, 'system');
  };

  const updateProduct = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    addNotification('Producto Actualizado', `Se guardaron los cambios en "${updated.name}".`, 'system');
  };

  const deleteProduct = (productId: string) => {
    // Por directriz del sistema, los productos solo se pueden desactivar (no eliminar permanentemente)
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, available: false } : p))
    );
    addNotification('Producto Desactivado', 'El producto ha sido desactivado del menú para mantener la integridad histórica.', 'system');
  };

  const toggleProductAvailability = (productId: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const nextState = !p.available;
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
      addNotification(
        nextState ? '🛵 Delivery Abierto' : '⏸️ Delivery Cerrado',
        nextState
          ? 'El servicio de delivery a domicilio está activo.'
          : 'El servicio de delivery ha sido pausado. Solo retiro en tienda activo.',
        'system'
      );
      return { ...prev, isDeliveryOpen: nextState };
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
  const updateCMSConfig = (newConfig: Partial<CMSConfig>) => {
    setCmsConfig(prev => ({ ...prev, ...newConfig }));
    addNotification('CMS de Marca', 'Configuraciones de marca y diseño guardadas.', 'system');
  };

  const resetCMSToStarbucks = () => {
    setCmsConfig(DEFAULT_CMS_CONFIG);
  };

  const resetCMSToArtisan = () => {
    setCmsConfig({
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
      ]
    });
  };

  // Auth & Roles
  const switchUserRole = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setUser(ADMIN_USER);
      setActiveTab('admin');
      addNotification('Sesión Administrador', 'Has ingresado con permisos completos de administrador.', 'system');
    } else {
      setUser(INITIAL_USER);
      setActiveTab('menu');
      addNotification('Sesión Cliente', 'Has cambiado al perfil de cliente Camila Rosales.', 'system');
    }
  };

  const loginUser = (email: string, name?: string) => {
    const isMockAdmin = email.toLowerCase().includes('admin');
    if (isMockAdmin) {
      setUser(ADMIN_USER);
      setActiveTab('admin');
    } else {
      setUser({
        ...INITIAL_USER,
        email,
        name: name || email.split('@')[0]
      });
    }
    setIsAuthModalOpen(false);
    playChime('bell');
    addNotification('Inicio de Sesión', `¡Bienvenido de vuelta, ${name || email}!`, 'system');
  };

  const logoutUser = () => {
    setUser({
      ...INITIAL_USER,
      name: 'Invitado',
      email: 'invitado@starbucks-demo.com',
      stars: 0
    });
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
        activeProduct,
        searchQuery,
        selectedCategory,

        setProducts,
        setOrders,
        setCmsConfig,

        setDeliveryType,
        setSelectedBranch,
        setDeliveryAddress,
        setActiveTab,
        setAdminTab,
        setIsCartOpen,
        setIsAuthModalOpen,
        setIsCheckoutOpen,
        setIsOrderTrackerOpen,
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
        logoutUser
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
