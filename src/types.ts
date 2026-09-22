export type OrderStatus = 'received' | 'preparing' | 'in_transit' | 'ready_for_pickup' | 'delivered' | 'cancelled';

export type DeliveryType = 'delivery' | 'pickup';

export type PaymentMethod = 'cash' | 'card';

export type RecurringFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Alto (12 oz)", "Grande (16 oz)", "Venti (24 oz)"
  priceDelta: number; // additional cost relative to base price
  calories?: number;
}

export interface ModifierOption {
  id: string;
  name: string; // e.g. "Leche de Avena", "Jarabe de Vainilla Sugar-Free"
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  name: string; // e.g. "Tipo de Leche", "Jarabes y Toppings", "Temperatura", "Espresso Extra"
  required: boolean;
  maxSelection: number;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  name: string;
  category: 'bebidas_calientes' | 'bebidas_frias' | 'frappuccinos' | 'reposteria' | 'alimentos' | 'cafe_grano';
  shortDescription: string;
  longDescription: string;
  basePrice: number;
  salePrice?: number; // Segundo precio de oferta / descuento
  imageUrl: string;
  available: boolean;
  featured?: boolean;
  temperatureOption?: 'caliente' | 'frio' | 'ambos' | 'no_aplica';
  variants: ProductVariant[];
  modifierGroups: ModifierGroup[];
  starsAwarded?: number;
}

export interface SelectedModifier {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique item instance id
  productId: string;
  productName: string;
  category: string;
  imageUrl: string;
  basePrice: number;
  selectedVariant: ProductVariant;
  selectedModifiers: SelectedModifier[];
  unitPrice: number;
  quantity: number;
  specialInstructions?: string;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
}

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  time: string;
  completed: boolean;
  description: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  pickupBranch?: string;
  deliveryNotes?: string;
  paymentMethod: PaymentMethod;
  cashAmountProvided?: number; // for cash: "pagará con billete de $500"
  cashChangeNeeded?: number;
  cardLast4?: string;
  paymentStatus: 'paid' | 'pending_cash' | 'failed';
  status: OrderStatus;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tip: number;
  total: number;
  pointsEarned: number;
  pointsRedeemed: number;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  createdAt: string;
  estimatedTimeMinutes: number;
  timeline: OrderTimelineStep[];
}

export type LoyaltyTier = 'green' | 'gold' | 'reserve';

export interface LoyaltyBadge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  starsReward: number;
  targetCount: number;
  currentCount: number;
  completed: boolean;
}

export interface RewardItem {
  id: string;
  name: string;
  description: string;
  starsRequired: number;
  category: string;
  imageUrl: string;
  available: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  phone?: string;
  address?: string;
  stars: number;
  lifetimeStars: number;
  tier: LoyaltyTier;
  favoriteProductIds: string[];
  badges: LoyaltyBadge[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'loyalty' | 'promo' | 'system';
  read: boolean;
  timestamp: string;
  orderId?: string;
}

export interface CMSConfig {
  brandName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  darkColor: string;
  lightColor: string;
  goldColor: string;
  creamColor: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBadge: string;
  heroImageUrl: string;
  announcementText: string;
  showAnnouncement: boolean;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  pointsPerDollar: number; // e.g. 10 stars per $1
  storeBranches: string[];
  isDeliveryOpen: boolean; // Control de apertura y cierre de delivery por el admin
}

export type AdminTab = 'dashboard' | 'products' | 'orders' | 'rewards' | 'cms' | 'supabase' | 'pentesting' | 'tests' | 'docs';

export interface UnitTestResult {
  id: string;
  category: string;
  name: string;
  passed: boolean;
  durationMs: number;
  message: string;
}

export interface SecurityAuditResult {
  id: string;
  category: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  status: 'MITIGATED' | 'PASSED' | 'ALERT';
  cwe: string;
  owaspCategory: string;
  description: string;
  mitigationTechnique: string;
}
