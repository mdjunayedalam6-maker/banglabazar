import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Language, 
  PageView, 
  Product, 
  Category, 
  CartItem, 
  Order, 
  OrderItem,
  OrderStatus,
  User, 
  FilterState, 
  Coupon,
  Review,
  SiteSettings,
  AdminBannerSlide,
  WalletTransaction,
  WalletTransactionType,
  WalletTransactionStatus,
  WalletPaymentMethod,
  ReferralRecord,
  DeliveryAddress,
  OrderAffiliateCommission,
  AffiliateCommissionStatus,
  CustomerRuleNotice
} from '../types';
import { 
  PRODUCTS as INITIAL_PRODUCTS, 
  CATEGORIES, 
  INITIAL_USER, 
  INITIAL_ORDERS 
} from '../data/mockData';
import { DEFAULT_SITE_SETTINGS, DEFAULT_BANNER_SLIDES, DEFAULT_CUSTOMER_NOTICES } from '../data/defaultSiteSettings';
import { getPaymentMethodDisplayLabel } from '../data/paymentConfig';
import { TRANSLATIONS, formatPrice as formatPriceUtil } from '../utils/translations';
import {
  testSupabaseConnection,
  syncOrderToSupabase,
  deleteOrderFromSupabase,
  fetchOrdersFromSupabase,
  syncProductToSupabase,
  deleteProductFromSupabase,
  deleteMultipleProductsFromSupabase,
  fetchProductsFromSupabase,
  syncSiteSettingsToSupabase,
  fetchSiteSettingsFromSupabase,
  syncCategoriesToSupabase,
  deleteCategoryFromSupabase,
  fetchCategoriesFromSupabase,
  syncBannerSlidesToSupabase,
  deleteBannerSlideFromSupabase,
  fetchBannerSlidesFromSupabase,
  syncUserToSupabase,
  deleteUserFromSupabase,
  syncProductsBatchToSupabase,
  updateAllProductsProfitMarginInSupabase,
  fetchUsersFromSupabase,
  supabase,
  SUPABASE_URL,
  SUPABASE_SETUP_SQL,
} from '../lib/supabase';
import { safeLocalStorage, safeSessionStorage } from '../utils/safeStorage';
import { idbGet, idbSet } from '../utils/idbStorage';
import { getShopBaseCategoryMetadata, fetchLiveShopBaseProductDescription } from '../services/shopbaseService';
import { getSubcategoryImage } from '../utils/subcategoryImages';
import { calculateCategoryCounts } from '../utils/categoryMatcher';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

export interface AffiliateOrderSummary {
  orderId: string;
  date: string;
  orderStatus: OrderStatus;
  commissionStatus: AffiliateCommissionStatus;
  productTitles: string[];
  productIds: string[];
  itemCount: number;
  commissionBaseAmount: number;
  commissionAmount: number;
  buyerName: string;
  buyerPhone: string;
  createdAt: string;
  creditedAt?: string;
  deductedAt?: string;
}

export interface AffiliateStatsSummary {
  referralCode: string;
  totalSharedOrders: number;
  pendingOrdersCount: number;
  creditedOrdersCount: number;
  cancelledOrDeductedCount: number;
  pendingCommission: number;
  creditedCommission: number;
  deductedCommission: number;
  entries: AffiliateOrderSummary[];
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof TRANSLATIONS['bn'];
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  viewProductDetails: (product: Product) => void;
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  wishlist: string[];
  orders: Order[];
  userOrders: Order[];
  currentUser: User | null;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  filterState: FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addToCart: (
    product: Product, 
    quantity?: number, 
    variant?: Record<string, string>,
    selectedImage?: string,
    selectedSize?: string,
    selectedColor?: string
  ) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  addReview: (productId: string, rating: number, comment: string, name: string) => void;
  calculateShippingFee: (location?: 'dhaka' | 'outside', speed?: 'regular' | 'express', subtotal?: number) => number;
  placeOrder: (shippingInfo: any, paymentMethod: any, specifiedShippingFee?: number) => Order;
  lastPlacedOrder: Order | null;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  loginUser: (identifier: string, password?: string) => boolean;
  registerUser: (userData: Partial<User>) => boolean;
  updateUserProfile: (userData: Partial<User>) => boolean;
  addDeliveryAddress: (addr: Omit<DeliveryAddress, 'id'>) => void;
  updateDeliveryAddress: (id: string, addr: Partial<DeliveryAddress>) => void;
  deleteDeliveryAddress: (id: string) => void;
  setDefaultDeliveryAddress: (id: string) => void;
  logoutUser: () => void;
  formatPrice: (amount: number) => string;
  cartSubtotal: number;
  cartDiscount: number;
  cartShippingFee: number;
  cartTotal: number;
  cartItemsCount: number;
  openCategory: (catSlug: string) => void;
  profileActiveTab: 'overview' | 'orders' | 'wallet' | 'referral' | 'rules' | 'wishlist' | 'addresses' | 'settings';
  setProfileActiveTab: (tab: 'overview' | 'orders' | 'wallet' | 'referral' | 'rules' | 'wishlist' | 'addresses' | 'settings') => void;
  // Referral & Welcome Bonus Program
  activeReferralCode: string | null;
  setActiveReferralCode: (code: string | null) => void;
  applyReferralCode: (code: string) => { success: boolean; message: string; referrerName?: string };
  getUserReferralStats: (user?: User | null) => {
    referralCode: string;
    totalReferrals: number;
    successfulReferrals: number;
    pendingReferrals: number;
    totalEarnings: number;
    referralsList: ReferralRecord[];
  };
  // Product Share & 2% Affiliate Commission Program
  getProductShareUrl: (productId: string, referrerCodeOverride?: string) => string;
  getUserAffiliateStats: (user?: User | null) => AffiliateStatsSummary;
  // Customer Wallet Extensions
  allWalletTransactions: WalletTransaction[];
  depositToWallet: (amount: number, method: WalletPaymentMethod, senderNumber?: string, trxId?: string, note?: string) => Promise<{ success: boolean; message: string }>;
  withdrawFromWallet: (amount: number, method: WalletPaymentMethod, accountNumber: string, bankDetails?: any) => Promise<{ success: boolean; message: string }>;
  updateWalletTransactionStatus: (txnId: string, status: WalletTransactionStatus, reason?: string) => void;
  adminAdjustUserBalance: (userId: string, amount: number, type: 'credit' | 'debit', note: string) => void;
  // Hidden Admin Panel extensions
  siteSettings: SiteSettings;
  updateSiteSettings: (newSettings: Partial<SiteSettings>) => void;
  resetSiteSettings: () => void;
  customerNotices: CustomerRuleNotice[];
  addCustomerNotice: (notice: Omit<CustomerRuleNotice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomerNotice: (id: string, updates: Partial<CustomerRuleNotice>) => void;
  deleteCustomerNotice: (id: string) => void;
  resetCustomerNoticesToDefault: () => void;
  bannerSlides: AdminBannerSlide[];
  updateBannerSlides: (slides: AdminBannerSlide[]) => void;
  addBannerSlide: (slide: AdminBannerSlide) => void;
  deleteBannerSlide: (id: string) => void;
  addProduct: (product: Product) => void;
  addMultipleProducts: (products: Product[]) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteMultipleProducts: (ids: string[]) => void;
  resetProductsToDefault: () => void;
  addCategory: (category: Category) => void;
  ensureCategoryExists: (
    categorySlug: string,
    nameBn?: string,
    nameEn?: string,
    image?: string,
    iconName?: string
  ) => Category;
  updateCategory: (id: string, updated: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  resetCategoriesToDefault: () => void;
  updateBannerSlide: (id: string, updated: Partial<AdminBannerSlide>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, paymentStatus?: 'paid' | 'pending') => void;
  deleteOrder: (orderId: string) => void;
  isTrackOrderModalOpen: boolean;
  setIsTrackOrderModalOpen: (open: boolean) => void;
  trackingQuery: string;
  setTrackingQuery: (q: string) => void;
  openTrackOrder: (query?: string) => void;
  isAdminModalOpen: boolean;
  setIsAdminModalOpen: (open: boolean) => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (identifier?: string, password?: string) => boolean;
  logoutAdmin: () => void;
  isUserAdmin: (user?: User | null) => boolean;
  // Admin Customer Account Management
  users: User[];
  adminCreateUser: (userData: Partial<User>) => boolean;
  adminUpdateUser: (userId: string, updates: Partial<User>) => boolean;
  adminDeleteUser: (userId: string) => boolean;
  adminToggleUserBlock: (userId: string) => boolean;
  // Supabase Integration
  supabaseConnected: boolean;
  supabaseStatusMsg: string;
  checkSupabaseConnection: () => Promise<boolean>;
  syncAllToSupabase: () => Promise<boolean>;
  supabaseSetupSql: string;
  supabaseUrl: string;
  isProductsLoading: boolean;
  globalProfitMargin: number;
  updateGlobalProfitMargin: (marginPercent: number) => Promise<boolean>;
  enforceWhiteLabelPurge: () => Promise<boolean>;
  isAppReady: boolean;
  initialLoadingStep: string;
  isAppInstallModalOpen: boolean;
  setIsAppInstallModalOpen: (open: boolean) => void;
}

const defaultFilterState: FilterState = {
  category: 'all',
  subcategory: 'all',
  minPrice: 0,
  maxPrice: 60000,
  brand: [],
  minRating: 0,
  inStockOnly: false,
  isFlashSaleOnly: false,
  searchQuery: '',
  sortBy: 'featured',
};

export const SECRET_ADMIN_CONFIG = {
  email: 'mdjunayedalam6@gmail.com',
  secondaryEmail: 'mdzunayedali6@gmail.com',
  phone: '01929637253',
  secondaryPhone: '01326654722',
  password: 'B$R@Z#3.0',
  secondaryPassword: 'B$R@Z#3.0'
};

export const isUserAdmin = (user?: User | null): boolean => {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  const phoneDigits = (user.phone || '').replace(/[^0-9]/g, '');
  if (email === SECRET_ADMIN_CONFIG.email || email === SECRET_ADMIN_CONFIG.secondaryEmail) return true;
  if (
    phoneDigits.length >= 10 && 
    (phoneDigits.endsWith(SECRET_ADMIN_CONFIG.phone) || phoneDigits.endsWith(SECRET_ADMIN_CONFIG.secondaryPhone))
  ) {
    return true;
  }
  return user.role === 'admin';
};

export const deduplicateProducts = (list: Product[]): Product[] => {
  if (!Array.isArray(list)) return [];
  const seen = new Set<string>();
  const result: Product[] = [];
  const martRegex = /(?:OneRoof\s*Mart|Bangla\s*Bazar\s*Mart|বাংলা\s*বাজার\s*Mart|বাংলা\s*বাজার\s*মার্ট|OneRoof|ShopBase\s*BD|ShopBase)/gi;

  for (let i = 0; i < list.length; i++) {
    const rawItem = list[i];
    if (rawItem && rawItem.id && !seen.has(rawItem.id)) {
      seen.add(rawItem.id);

      const titleBn = rawItem.titleBn || '';
      const cleanTitleBn = martRegex.test(titleBn) ? titleBn.replace(martRegex, 'বাংলা বাজার') : titleBn;

      const titleEn = rawItem.titleEn || '';
      const cleanTitleEn = martRegex.test(titleEn) ? titleEn.replace(martRegex, 'Bangla Bazar') : titleEn;

      let descBn = rawItem.descriptionBn || '';
      if (martRegex.test(descBn)) {
        descBn = descBn.replace(martRegex, 'বাংলা বাজার');
      }

      // Clean specifications: brand is ALWAYS 'বাংলা বাজার'
      const cleanSpecs: Record<string, string> = {
        'ব্র্যান্ড': 'বাংলা বাজার',
        'কোয়ালিটি': '১০০% প্রিমিয়াম এক্সপোর্ট স্ট্যান্ডার্ড',
        'ডেলিভারি': 'সারাদেশে ক্যাশ অন ডেলিভারি (২-৪ দিন)',
        'ওয়ারেন্টি': '৭ দিনের রিটার্ন ও রিপ্লেসমেন্ট',
      };

      if (rawItem.specifications && typeof rawItem.specifications === 'object') {
        const forbiddenKeys = ['সোর্স', 'উৎস', 'পাইকারি', 'হোলসেল', 'লাভ', 'প্রফিট', 'রিসেলার', 'একাউন্ট'];
        const entries = Object.entries(rawItem.specifications);
        for (let j = 0; j < entries.length; j++) {
          const [k, v] = entries[j];
          if (!forbiddenKeys.some((f) => k.includes(f))) {
            if (k.includes('ব্র্যান্ড') || k.toLowerCase().includes('brand')) {
              cleanSpecs[k] = 'বাংলা বাজার';
            } else {
              const valStr = String(v);
              cleanSpecs[k] = martRegex.test(valStr) ? valStr.replace(martRegex, 'বাংলা বাজার') : valStr;
            }
          }
        }
      }

      // Upgrade and sanitize product images to guaranteed HD resolution
      const rawImageList = (Array.isArray(rawItem.images) && rawItem.images.length > 0)
        ? rawItem.images
        : (rawItem.image ? [rawItem.image] : []);

      const uniqueHdImages: string[] = [];
      const imgSeen = new Set<string>();

      for (let j = 0; j < rawImageList.length; j++) {
        const rawImg = rawImageList[j];
        if (typeof rawImg !== 'string') continue;
        let img = rawImg.trim();

        // ShopBaseBD: Upgrade low-res thumbnail (_S_) to full-size Large HD (_L_) preserving exact extension
        if (img.includes('shopbasebd.com')) {
          img = img.replace('_S_', '_L_');
        }

        // Unsplash: Upgrade to ultra HD 1600px+ with q=95 quality
        if (img.includes('unsplash.com') && !img.includes('w=1600')) {
          img = img.replace(/w=\d+/, 'w=1600').replace(/q=\d+/, 'q=95');
          if (!img.includes('w=1600')) {
            img += (img.includes('?') ? '&' : '?') + 'w=1600&auto=format&fit=crop&q=95';
          }
        }

        if (!imgSeen.has(img)) {
          imgSeen.add(img);
          uniqueHdImages.push(img);
        }
      }

      const item: Product = {
        ...rawItem,
        titleBn: cleanTitleBn || rawItem.titleBn,
        titleEn: cleanTitleEn || rawItem.titleEn,
        descriptionBn: descBn,
        specifications: cleanSpecs,
        brand: 'বাংলা বাজার',
        images: uniqueHdImages.length > 0 ? uniqueHdImages : [
          'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&auto=format&fit=crop&q=95'
        ],
      };
      item.image = item.images[0];
      result.push(item);
    }
  }
  return result;
};

// Strictly allow Shopbase BD uploaded products only (purge legacy demo/mock products)
export const isShopbaseUploadedProduct = (p?: Product | null): boolean => {
  if (!p || !p.id) return false;
  const idLower = String(p.id).toLowerCase();
  if (idLower.startsWith('sbp-katua-') || /^prod-\d+$/i.test(idLower)) return false;
  if (p.sourceUrl && p.sourceUrl.toLowerCase().includes('shopbasebd.com')) return true;
  if (
    Array.isArray(p.images) &&
    p.images.some((img) => typeof img === 'string' && img.toLowerCase().includes('shopbasebd.com'))
  ) {
    return true;
  }
  return /^sbp-\d+$/i.test(p.id);
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate unique, clean referral code for any user
export const generateUserReferralCode = (user: { id: string; phone?: string; name?: string }): string => {
  if (user.phone) {
    const digits = user.phone.replace(/\D/g, '');
    if (digits.length >= 6) {
      return `BB-${digits.slice(-6)}`;
    }
  }
  const idDigits = user.id.replace(/\D/g, '');
  if (idDigits.length >= 4) {
    return `BB-${idDigits.slice(-5)}`;
  }
  return `BB-${Math.floor(100000 + Math.random() * 900000)}`;
};

// Mask phone number for privacy in referral lists e.g. 0171****890
export const maskPhoneNumber = (phone?: string): string => {
  if (!phone) return '017****000';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 8) return phone;
  return `${clean.slice(0, 4)}****${clean.slice(-3)}`;
};

// Track intentionally deleted products to guarantee they never resurrect on reload
export const getDeletedProductIds = (): Set<string> => {
  try {
    const raw = safeLocalStorage.getItem('oneroof_deleted_product_ids');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {}
  return new Set();
};

export const recordDeletedProductIds = (ids: string[]) => {
  try {
    if (!ids || ids.length === 0) return;
    const existing = getDeletedProductIds();
    ids.forEach((id) => existing.add(id));
    const arr = Array.from(existing);
    safeLocalStorage.setItem('oneroof_deleted_product_ids', JSON.stringify(arr));
    idbSet('oneroof_deleted_product_ids', arr).catch(() => {});
  } catch {}
};

export const unrecordDeletedProductId = (id: string) => {
  try {
    const existing = getDeletedProductIds();
    if (existing.has(id)) {
      existing.delete(id);
      const arr = Array.from(existing);
      safeLocalStorage.setItem('oneroof_deleted_product_ids', JSON.stringify(arr));
      idbSet('oneroof_deleted_product_ids', arr).catch(() => {});
    }
  } catch {}
};

// Track and queue orders placed while offline to automatically sync when internet reconnects
export const getPendingOfflineOrders = (): Order[] => {
  try {
    const raw = safeLocalStorage.getItem('oneroof_pending_offline_orders');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  return [];
};

export const savePendingOfflineOrder = (order: Order) => {
  try {
    const existing = getPendingOfflineOrders();
    const filtered = existing.filter((o) => o.id !== order.id);
    filtered.push(order);
    safeLocalStorage.setItem('oneroof_pending_offline_orders', JSON.stringify(filtered));
    idbSet('oneroof_pending_offline_orders', filtered).catch(() => {});
  } catch {}
};

export const clearPendingOfflineOrders = () => {
  try {
    safeLocalStorage.removeItem('oneroof_pending_offline_orders');
    idbSet('oneroof_pending_offline_orders', []).catch(() => {});
  } catch {}
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (safeLocalStorage.getItem('oneroof_lang') as Language) || 'bn';
  });

  const [currentPage, setCurrentPageState] = useState<PageView>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Persistent Products: Strictly ShopbaseBD products only, without resurrecting deleted items
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const deletedIds = getDeletedProductIds();
      const saved = safeLocalStorage.getItem('oneroof_products');
      if (saved !== null) {
        const parsed: Product[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validSaved = parsed.filter(
            (p) => !deletedIds.has(p.id) && isShopbaseUploadedProduct(p)
          );
          if (validSaved.length > 0) {
            return deduplicateProducts(validSaved);
          }
        }
      }
      const initialClean = deduplicateProducts(
        INITIAL_PRODUCTS.filter((p) => !deletedIds.has(p.id) && isShopbaseUploadedProduct(p))
      );
      try {
        safeLocalStorage.setItem('oneroof_products', JSON.stringify(initialClean.slice(0, 100)));
      } catch (_) {}
      return initialClean;
    } catch {
      return deduplicateProducts(INITIAL_PRODUCTS.filter(isShopbaseUploadedProduct));
    }
  });

  // Strict 11 Main Category IDs in requested display order
  const MAIN_11_ORDER = [
    'womens-clothing',
    'mens-clothing',
    'baby-collection',
    'couple-combo',
    'home-living',
    'bag-collection',
    'jewelry-accessories',
    'electronics-gadgets',
    'winter-collection',
    'seasonal-products',
    'other-categories',
  ];

  const isCustomRasterOrExternal = (url?: string): boolean => {
    if (!url) return false;
    if (url.startsWith('data:image/') && !url.startsWith('data:image/svg+xml')) return true;
    if (url.startsWith('https://') && !url.includes('images.unsplash.com') && !url.includes('oneroof')) {
      return true;
    }
    return false;
  };

  const sanitizeCategories = (cats: Category[]): Category[] => {
    if (!Array.isArray(cats) || cats.length === 0) return CATEGORIES;
    const defMap = new Map(CATEGORIES.map((c) => [c.id, c]));

    const processed: Category[] = cats.map((c) => {
      const def = defMap.get(c.id);
      const defSubMap = new Map((def?.subcategories || []).map((s) => [s.id, s.image]));
      const updatedSubs = (c.subcategories || def?.subcategories || []).map((s) => {
        const defSubImg = defSubMap.get(s.id);
        const keepSub =
          s.image &&
          (s.image === defSubImg ||
            s.image.includes('shopbasebd.com') ||
            (s.image.startsWith('data:image/') && !s.image.startsWith('data:image/svg+xml')));
        return {
          ...s,
          image: keepSub ? s.image : defSubImg || getSubcategoryImage(s.id, s.nameBn, undefined, undefined, c.id),
        };
      });

      const keepCatImage =
        c.image &&
        (c.image === def?.image || isCustomRasterOrExternal(c.image));

      return {
        ...c,
        image: keepCatImage ? c.image : def?.image || c.image || '',
        subcategories: updatedSubs,
      };
    });

    // Make sure standard 11 categories exist if not present
    const existingIds = new Set(processed.map((c) => c.id));
    for (const def of CATEGORIES) {
      if (!existingIds.has(def.id)) {
        processed.push(def);
      }
    }

    // Sort: standard 11 first in MAIN_11_ORDER, followed by custom categories
    return processed.sort((a, b) => {
      const idxA = MAIN_11_ORDER.indexOf(a.id);
      const idxB = MAIN_11_ORDER.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  };

  const OLD_DEFAULT_SLIDE_IDS = new Set([
    'slide-eid',
    'slide-tech',
    'slide-grocery',
    'slide-home',
    'slide-beauty',
    'slide-delivery',
  ]);

  const sanitizeBannerSlides = (slides: AdminBannerSlide[]): AdminBannerSlide[] => {
    if (!Array.isArray(slides) || slides.length === 0) return DEFAULT_BANNER_SLIDES;
    const defaultSlideMap = new Map(DEFAULT_BANNER_SLIDES.map((s) => [s.id, s]));

    // Keep any admin-created custom slides or legacy slides explicitly given custom uploaded photos
    const customSlides = slides
      .filter((s) => {
        if (!s || !s.id) return false;
        if (defaultSlideMap.has(s.id)) return false;
        if (OLD_DEFAULT_SLIDE_IDS.has(s.id)) {
          return Boolean(s.image && s.image.startsWith('data:image/') && !s.image.startsWith('data:image/svg+xml'));
        }
        return !s.image?.includes('images.unsplash.com');
      })
      .map((s) => ({
        ...s,
        showTextOverlay: s.showTextOverlay !== false,
      }));

    // Preserve any custom image edits applied to the new 2026 default slides while keeping fresh bundled assets
    const existingNewMap = new Map(
      slides.filter((s) => s && defaultSlideMap.has(s.id)).map((s) => [s.id, s])
    );

    const refreshedDefaults = DEFAULT_BANNER_SLIDES.map((defSlide) => {
      const existing = existingNewMap.get(defSlide.id);
      if (!existing) return defSlide;
      const keepExistingImage = existing.image === defSlide.image || isCustomRasterOrExternal(existing.image);
      return {
        ...defSlide,
        ...existing,
        image: keepExistingImage ? existing.image : defSlide.image,
        showTextOverlay: existing.showTextOverlay !== false,
      };
    });

    return [...refreshedDefaults, ...customSlides];
  };

  // Persistent Categories (maintains all admin updates and custom categories)
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_categories');
      if (saved !== null) {
        const parsed: Category[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeCategories(parsed);
        }
      }
      return CATEGORIES;
    } catch {
      return CATEGORIES;
    }
  });

  // Dynamic Categories: item counts are automatically and accurately synchronized with the real products in the catalog
  const dynamicCategories = useMemo<Category[]>(() => {
    return calculateCategoryCounts(categories, products);
  }, [categories, products]);

  // Persistent Site Settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.primaryColor === '#003882' || !parsed.primaryColor) {
          parsed.primaryColor = '#00873E';
        }
        if (parsed.accentColor === '#FF6B00' || !parsed.accentColor) {
          parsed.accentColor = '#DC2626';
        }
        return { ...DEFAULT_SITE_SETTINGS, ...parsed };
      }
      return DEFAULT_SITE_SETTINGS;
    } catch {
      return DEFAULT_SITE_SETTINGS;
    }
  });

  // Persistent Banner Slides
  const [bannerSlides, setBannerSlides] = useState<AdminBannerSlide[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_banner_slides');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeBannerSlides(parsed);
        }
      }
      return DEFAULT_BANNER_SLIDES;
    } catch {
      return DEFAULT_BANNER_SLIDES;
    }
  });

  // Persistent Customer Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_orders');
      if (saved) {
        const parsed: Order[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove old hardcoded dummy orders if present
          return parsed.filter((o) => o.id !== 'OR-88219' && o.id !== 'OR-74190');
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [profileActiveTab, setProfileActiveTab] = useState<'overview' | 'orders' | 'wallet' | 'referral' | 'rules' | 'wishlist' | 'addresses' | 'settings'>('orders');

  // Referral Program State
  const [activeReferralCode, setActiveReferralCode] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const refParam = params.get('ref') || params.get('referral');
        if (refParam) {
          const clean = refParam.trim().toUpperCase();
          safeLocalStorage.setItem('oneroof_referrer_code', clean);
          return clean;
        }
        return safeLocalStorage.getItem('oneroof_referrer_code') || null;
      }
    } catch {}
    return null;
  });

  // Product-Share Affiliate Map: { [productId]: { referrerCode, capturedAt } }
  const [affiliateProductMap, setAffiliateProductMap] = useState<
    Record<string, { referrerCode: string; capturedAt: number }>
  >(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_affiliate_links');
      const parsed = saved ? JSON.parse(saved) : {};
      const validMap: Record<string, { referrerCode: string; capturedAt: number }> =
        parsed && typeof parsed === 'object' ? { ...parsed } : {};

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const prodParam = params.get('product') || params.get('p') || params.get('id');
        const affParam =
          params.get('aff') ||
          params.get('affiliate') ||
          (prodParam ? params.get('ref') || params.get('referral') : null);
        if (affParam && prodParam) {
          const cleanAff = affParam.trim().toUpperCase();
          const cleanProd = prodParam.trim();
          const entry = { referrerCode: cleanAff, capturedAt: Date.now() };
          validMap[cleanProd] = entry;
          const cleanNum = cleanProd.replace(/\D/g, '');
          if (cleanNum) validMap[`sbp-${cleanNum}`] = entry;
          safeLocalStorage.setItem('oneroof_affiliate_links', JSON.stringify(validMap));
        }
      }
      return validMap;
    } catch {
      return {};
    }
  });

  const recordAffiliateAttribution = (productId: string, referrerCode: string, extraKeys: string[] = []) => {
    const cleanCode = referrerCode.trim().toUpperCase();
    const cleanId = productId.trim();
    if (!cleanCode || !cleanId) return;
    setAffiliateProductMap((prev) => {
      const next = { ...prev };
      const entry = { referrerCode: cleanCode, capturedAt: Date.now() };
      next[cleanId] = entry;
      const digits = cleanId.replace(/\D/g, '');
      if (digits) {
        next[digits] = entry;
        next[`sbp-${digits}`] = entry;
      }
      for (const k of extraKeys) {
        if (k && k.trim()) next[k.trim()] = entry;
      }
      try {
        safeLocalStorage.setItem('oneroof_affiliate_links', JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Auto-detect referral code from URL search parameters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const refParam = params.get('ref') || params.get('referral');
        if (refParam) {
          const clean = refParam.trim().toUpperCase();
          setActiveReferralCode(clean);
          safeLocalStorage.setItem('oneroof_referrer_code', clean);
        }
      } catch {}
    }
  }, []);

  // Sanitize helper to remove any mock/demo transactions so all wallet data is 100% real
  const sanitizeRealWalletTransactions = (txns: any[]): WalletTransaction[] => {
    if (!Array.isArray(txns)) return [];
    return txns.filter(
      (t) => t && t.id && t.id !== 'TXN-98421' && !String(t.id).includes('sample') && !String(t.trxId).includes('BQR992810')
    );
  };

  // Sanitize helper to remove any mock/demo referrals
  const sanitizeRealReferrals = (refs: any[]): ReferralRecord[] => {
    if (!Array.isArray(refs)) return [];
    return refs.filter(
      (r) => r && r.friendId && r.friendId !== 'user-sample-1' && r.friendId !== 'user-sample-2'
    );
  };

  // Customer Wallet Transactions across the application (100% Real)
  const [allWalletTransactions, setAllWalletTransactions] = useState<WalletTransaction[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_wallet_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return sanitizeRealWalletTransactions(parsed);
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      safeLocalStorage.setItem('oneroof_wallet_transactions', JSON.stringify(allWalletTransactions));
    } catch (_) {}
  }, [allWalletTransactions]);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.filter((item: CartItem) => isShopbaseUploadedProduct(item?.product))
        : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_wishlist');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.filter(
            (id: string) =>
              typeof id === 'string' && !/^prod-\d+$/i.test(id) && !/^sbp-katua-/i.test(id)
          )
        : [];
    } catch {
      return [];
    }
  });

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_users');
      const parsed: User[] = saved ? JSON.parse(saved) : [];
      const hasAdmin = parsed.some(
        (u) =>
          u.email?.toLowerCase() === SECRET_ADMIN_CONFIG.email ||
          u.email?.toLowerCase() === SECRET_ADMIN_CONFIG.secondaryEmail ||
          u.phone?.replace(/[^0-9]/g, '').endsWith(SECRET_ADMIN_CONFIG.phone) ||
          u.phone?.replace(/[^0-9]/g, '').endsWith(SECRET_ADMIN_CONFIG.secondaryPhone)
      );
      const baseUsers = !hasAdmin ? [INITIAL_USER, ...parsed] : parsed;
      return baseUsers.map((u) => {
        const isAdm =
          u.email?.toLowerCase() === SECRET_ADMIN_CONFIG.email ||
          u.email?.toLowerCase() === SECRET_ADMIN_CONFIG.secondaryEmail ||
          u.phone?.replace(/[^0-9]/g, '').endsWith(SECRET_ADMIN_CONFIG.phone) ||
          u.phone?.replace(/[^0-9]/g, '').endsWith(SECRET_ADMIN_CONFIG.secondaryPhone);

        const realTxns = sanitizeRealWalletTransactions(u.walletTransactions || []);
        const realRefs = sanitizeRealReferrals(u.referrals || []);
        // Purge any old demo balance (such as 2500) if no valid completed transactions exist
        const isOldDemoBalance = u.balance === 2500 && realTxns.length === 0;
        const realBalance = isOldDemoBalance ? 0 : Math.max(0, u.balance || 0);

        return {
          ...u,
          role: (isAdm ? 'admin' : u.role || 'user') as 'admin' | 'user',
          password: isAdm ? SECRET_ADMIN_CONFIG.password : u.password,
          balance: realBalance,
          walletTransactions: realTxns,
          referrals: realRefs,
          referralCode: u.referralCode || (u.phone ? `BB-${u.phone.replace(/\D/g, '').slice(-6)}` : `BB-${u.id.replace(/\D/g, '').slice(-5)}`),
          pendingWelcomeBonus: u.pendingWelcomeBonus ?? (u.hasCompletedFirstOrder ? 0 : 50),
          hasCompletedFirstOrder: u.hasCompletedFirstOrder ?? false,
          firstOrderBonusUnlocked: u.firstOrderBonusUnlocked ?? false,
        };
      });
    } catch {
      return [INITIAL_USER];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = safeLocalStorage.getItem('oneroof_current_user');
      if (saved) {
        const parsed: User = JSON.parse(saved);
        const isAdm = isUserAdmin(parsed);
        const realTxns = sanitizeRealWalletTransactions(parsed.walletTransactions || []);
        const realRefs = sanitizeRealReferrals(parsed.referrals || []);
        const isOldDemoBalance = parsed.balance === 2500 && realTxns.length === 0;
        const realBalance = isOldDemoBalance ? 0 : Math.max(0, parsed.balance || 0);

        return {
          ...parsed,
          role: (isAdm ? 'admin' : parsed.role || 'user') as 'admin' | 'user',
          balance: realBalance,
          walletTransactions: realTxns,
          referrals: realRefs,
          referralCode: parsed.referralCode || (parsed.phone ? `BB-${parsed.phone.replace(/\D/g, '').slice(-6)}` : `BB-${parsed.id.replace(/\D/g, '').slice(-5)}`),
          pendingWelcomeBonus: parsed.pendingWelcomeBonus ?? (parsed.hasCompletedFirstOrder ? 0 : 50),
          hasCompletedFirstOrder: parsed.hasCompletedFirstOrder ?? false,
          firstOrderBonusUnlocked: parsed.firstOrderBonusUnlocked ?? false,
        };
      }
      return null;
    } catch {
      return null;
    }
  });

  // Customer-specific orders: strictly only orders placed by the current user
  const userOrders = useMemo(() => {
    if (!currentUser) return [];
    const userEmail = (currentUser.email || '').trim().toLowerCase();
    const userPhoneDigits = (currentUser.phone || '').replace(/[^0-9]/g, '');

    return orders.filter((order) => {
      // 1. Direct userId match
      if (order.userId && order.userId === currentUser.id) return true;

      // 2. Direct customer email match
      if (userEmail) {
        if (order.customerEmail && order.customerEmail.trim().toLowerCase() === userEmail) return true;
        if (order.shippingAddress?.email && order.shippingAddress.email.trim().toLowerCase() === userEmail) return true;
      }

      // 3. Direct customer phone match (last 10 digits)
      if (userPhoneDigits.length >= 10) {
        const orderPhone = (order.customerPhone || order.shippingAddress?.phone || '').replace(/[^0-9]/g, '');
        if (orderPhone.length >= 10 && orderPhone.endsWith(userPhoneDigits.slice(-10))) {
          return true;
        }
      }

      return false;
    });
  }, [orders, currentUser]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTrackOrderModalOpen, setIsTrackOrderModalOpen] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState('');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const openTrackOrder = (query?: string) => {
    if (query) {
      setTrackingQuery(query);
    }
    setIsTrackOrderModalOpen(true);
  };

  // App Install Modal State
  const [isAppInstallModalOpen, setIsAppInstallModalOpen] = useState(false);

  // Hidden Admin Authentication & Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return safeSessionStorage.getItem('oneroof_admin_auth') === 'true';
  });

  // Supabase Connection & Sync State
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<string>('কানেক্ট হচ্ছে...');
  const [isProductsLoading, setIsProductsLoading] = useState<boolean>(() => products.length === 0);
  const [isAppReady, setIsAppReady] = useState<boolean>(false);
  const [initialLoadingStep, setInitialLoadingStep] = useState<string>('ক্যাটালগ ও ডাটা প্রস্তুত হচ্ছে...');

  // Check Supabase Connection
  const checkSupabaseConnection = async (): Promise<boolean> => {
    const res = await testSupabaseConnection();
    setSupabaseConnected(res.success);
    setSupabaseStatusMsg(res.message);
    return res.success;
  };

  // Instant restoration from IndexedDB (ultra-fast 10-30ms offline cache)
  useEffect(() => {
    let isMounted = true;
    Promise.all([
      idbGet<Product[]>('oneroof_cached_products'),
      idbGet<Category[]>('oneroof_cached_categories'),
      idbGet<AdminBannerSlide[]>('oneroof_cached_slides'),
      idbGet<SiteSettings>('oneroof_cached_site_settings'),
      idbGet<Order[]>('oneroof_cached_orders'),
    ])
      .then(([cachedProducts, cachedCategories, cachedSlides, cachedSettings, cachedOrders]) => {
        if (!isMounted) return;
        const CATALOG_SYNC_VERSION = 'bb_shopbase_only_v4_13716';
        const savedCatalogVer = safeLocalStorage.getItem('oneroof_catalog_version');
        if (
          cachedProducts &&
          Array.isArray(cachedProducts) &&
          cachedProducts.length >= 13700 &&
          savedCatalogVer === CATALOG_SYNC_VERSION
        ) {
          const deletedIds = getDeletedProductIds();
          const cleanCached = deduplicateProducts(
            cachedProducts.filter((p) => !deletedIds.has(p.id) && isShopbaseUploadedProduct(p))
          );
          setProducts(cleanCached);
          setIsProductsLoading(false);
        } else {
          // Immediately load ShopbaseBD products from website/app bundled /products.json
          fetch('/products.json')
            .then((res) => {
              if (!res.ok) throw new Error('Status ' + res.status);
              return res.json();
            })
            .then((localProducts: Product[]) => {
              if (!isMounted) return;
              if (Array.isArray(localProducts) && localProducts.length > 0) {
                const deletedIds = getDeletedProductIds();
                const clean = deduplicateProducts(
                  localProducts.filter((p) => !deletedIds.has(p.id) && isShopbaseUploadedProduct(p))
                );
                setProducts(clean);
                idbSet('oneroof_cached_products', clean).catch(() => {});
                safeLocalStorage.setItem('oneroof_catalog_version', CATALOG_SYNC_VERSION);
                try {
                  safeLocalStorage.setItem('oneroof_products', JSON.stringify(clean.slice(0, 100)));
                } catch (_) {}
                setIsProductsLoading(false);
              }
            })
            .catch((err) => {
              console.warn('Local products.json load notice:', err);
              if (cachedProducts && Array.isArray(cachedProducts) && cachedProducts.length > 0) {
                const deletedIds = getDeletedProductIds();
                setProducts(
                  deduplicateProducts(
                    cachedProducts.filter((p) => !deletedIds.has(p.id) && isShopbaseUploadedProduct(p))
                  )
                );
                setIsProductsLoading(false);
              }
            });
        }
        if (cachedCategories && Array.isArray(cachedCategories) && cachedCategories.length > 0) {
          const cleanCats = sanitizeCategories(cachedCategories);
          setCategories(cleanCats);
          idbSet('oneroof_cached_categories', cleanCats).catch(() => {});
          safeLocalStorage.setItem('oneroof_categories', JSON.stringify(cleanCats));
        }
        if (cachedSlides && Array.isArray(cachedSlides) && cachedSlides.length > 0) {
          const cleanSlides = sanitizeBannerSlides(cachedSlides);
          setBannerSlides(cleanSlides);
          idbSet('oneroof_cached_slides', cleanSlides).catch(() => {});
          safeLocalStorage.setItem('oneroof_banner_slides', JSON.stringify(cleanSlides));
        }
        if (cachedSettings) {
          setSiteSettings((prev) => ({ ...prev, ...cachedSettings }));
        }
        if (cachedOrders && Array.isArray(cachedOrders) && cachedOrders.length > 0) {
          setOrders((prev) => (prev.length === 0 ? cachedOrders : prev));
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Deep-link listener for shared product URLs (e.g. ?product=sbp-17804, /product/17804, or #product=sbp-17804)
  useEffect(() => {
    const checkUrlForProduct = () => {
      if (typeof window === 'undefined') return;
      try {
        const params = new URLSearchParams(window.location.search);
        let targetId = params.get('product') || params.get('p') || params.get('id');
        
        // Check pathname (e.g. /product/sbp-1234 or /product/1234)
        if (!targetId && window.location.pathname) {
          const pathMatch = window.location.pathname.match(/\/product\/([^/?#]+)/i);
          if (pathMatch) targetId = decodeURIComponent(pathMatch[1]);
        }

        if (!targetId && window.location.hash) {
          const match = window.location.hash.match(/product=([^&]+)/);
          if (match) targetId = decodeURIComponent(match[1]);
          else if (window.location.hash.startsWith('#/product/')) {
            targetId = decodeURIComponent(window.location.hash.replace('#/product/', ''));
          }
        }

        const affParam =
          params.get('aff') ||
          params.get('affiliate') ||
          (targetId ? params.get('ref') || params.get('referral') : null);

        if (targetId) {
          targetId = targetId.trim();
          const targetLower = targetId.toLowerCase();
          const cleanNum = targetId.replace(/\D/g, '');

          if (affParam) {
            recordAffiliateAttribution(targetId, affParam);
          }

          // Check if already viewing this product
          if (
            selectedProduct && 
            (selectedProduct.id.toLowerCase() === targetLower || 
             selectedProduct.sku?.toUpperCase() === targetId.toUpperCase() ||
             (cleanNum && selectedProduct.id.toLowerCase() === `sbp-${cleanNum}`))
          ) {
            if (affParam) {
              recordAffiliateAttribution(selectedProduct.id, affParam, [targetId]);
            }
            if (currentPage !== 'product-detail') setCurrentPageState('product-detail');
            return;
          }

          // Try finding in current products state
          const matchInState = products.find((p) => {
            const pId = p.id.toLowerCase();
            const pSku = (p.sku || '').toLowerCase();
            return pId === targetLower || 
                   pSku === targetLower || 
                   (cleanNum && (pId === `sbp-${cleanNum}` || pSku === `sbp-${cleanNum}`));
          });

          if (matchInState) {
            if (affParam) {
              recordAffiliateAttribution(matchInState.id, affParam, [targetId]);
            }
            setSelectedProduct(matchInState);
            setCurrentPageState('product-detail');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            // Fetch directly from Supabase for instant link resolution even before full catalog loads
            const orConditions = [
              `id.eq.${targetId}`,
              `id.eq.sbp-${targetId}`,
              `data->>sku.eq.${targetId}`,
              `data->>sku.eq.SBP-${targetId}`
            ];
            if (cleanNum) {
              orConditions.push(`id.eq.sbp-${cleanNum}`);
              orConditions.push(`data->>sku.eq.SBP-${cleanNum}`);
            }

            Promise.resolve(
              supabase
                .from('products')
                .select('*')
                .or(orConditions.join(','))
                .maybeSingle()
            )
              .then(({ data, error }) => {
                if (!error && data) {
                  const p: Product = (data.data && typeof data.data === 'object') ? { ...(data.data as Product) } : ({} as Product);
                  p.id = data.id || p.id;
                  if (data.title_bn) p.titleBn = data.title_bn;
                  if (data.title_en) p.titleEn = data.title_en;
                  if (data.price !== undefined && data.price !== null) p.price = Number(data.price);
                  if (data.original_price !== undefined && data.original_price !== null) p.originalPrice = Number(data.original_price);
                  if (!p.brand || p.brand.toLowerCase().includes('shopbase') || p.brand.toLowerCase().includes('oneroof')) p.brand = 'বাংলা বাজার';
                  if (affParam) {
                    recordAffiliateAttribution(p.id, affParam, [targetId!]);
                  }
                  setSelectedProduct(p);
                  setCurrentPageState('product-detail');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              })
              .catch(() => {});
          }
        }
      } catch (_) {}
    };

    checkUrlForProduct();
    window.addEventListener('popstate', checkUrlForProduct);
    window.addEventListener('hashchange', checkUrlForProduct);

    return () => {
      window.removeEventListener('popstate', checkUrlForProduct);
      window.removeEventListener('hashchange', checkUrlForProduct);
    };
  }, [products]);

  // Initial Supabase Sync on mount - unblocked & parallel for lightning load speed
  useEffect(() => {
    let isMounted = true;
    let channelObj: any = null;

    const initSupabase = async () => {
      try {
        // Run test connection asynchronously without blocking resource downloads
        testSupabaseConnection()
          .then((res) => {
            if (isMounted) {
              setSupabaseConnected(res.success);
              setSupabaseStatusMsg(res.message);
            }
          })
          .catch(() => {});

        // Fetch products, categories, slides, orders immediately in parallel
        const [
          remoteProducts,
          remoteOrders,
          remoteSettings,
          remoteCategories,
          remoteSlides,
          remoteUsers
        ] = await Promise.all([
          fetchProductsFromSupabase((batchProducts) => {
            if (isMounted && batchProducts && batchProducts.length > 0) {
              setProducts((prev) => {
                const map = new Map(
                  prev.filter(isShopbaseUploadedProduct).map((p) => [p.id, p])
                );
                for (const p of batchProducts) {
                  if (isShopbaseUploadedProduct(p)) {
                    map.set(p.id, p);
                  }
                }
                return Array.from(map.values());
              });
            }
          }),
          fetchOrdersFromSupabase(),
          fetchSiteSettingsFromSupabase(),
          fetchCategoriesFromSupabase(),
          fetchBannerSlidesFromSupabase(),
          fetchUsersFromSupabase()
        ]);

        if (isMounted) {
          if (remoteProducts && Array.isArray(remoteProducts) && remoteProducts.length > 0) {
            const deletedIds = getDeletedProductIds();
            const cleanRemote = deduplicateProducts(
              remoteProducts.filter((p) => !deletedIds.has(p.id) && isShopbaseUploadedProduct(p))
            );
            setProducts((prev) => {
              const mergedMap = new Map<string, Product>();
              for (const localP of prev) {
                if (!deletedIds.has(localP.id) && isShopbaseUploadedProduct(localP)) {
                  mergedMap.set(localP.id, localP);
                }
              }
              for (const remoteP of cleanRemote) {
                mergedMap.set(remoteP.id, remoteP);
              }
              const merged = Array.from(mergedMap.values());
              idbSet('oneroof_cached_products', merged).catch(() => {});
              try {
                safeLocalStorage.setItem('oneroof_products', JSON.stringify(merged.slice(0, 200)));
              } catch (_) {}
              return merged;
            });

            // Auto-clean any products in Supabase that were deleted or are non-ShopbaseBD mock items
            const ghostIds = remoteProducts
              .filter((p) => deletedIds.has(p.id) || !isShopbaseUploadedProduct(p))
              .map((p) => p.id);
            if (ghostIds.length > 0) {
              deleteMultipleProductsFromSupabase(ghostIds).catch(() => {});
            }
          }
          if (remoteOrders && remoteOrders.length > 0) {
            setOrders(remoteOrders);
            safeLocalStorage.setItem('oneroof_orders', JSON.stringify(remoteOrders));
            idbSet('oneroof_cached_orders', remoteOrders).catch(() => {});
          }
          if (remoteSettings) {
            setSiteSettings(remoteSettings);
            safeLocalStorage.setItem('oneroof_site_settings', JSON.stringify(remoteSettings));
            idbSet('oneroof_cached_site_settings', remoteSettings).catch(() => {});
          }
          if (remoteCategories && Array.isArray(remoteCategories) && remoteCategories.length > 0) {
            const cleanCats = sanitizeCategories(remoteCategories);
            setCategories(cleanCats);
            safeLocalStorage.setItem('oneroof_categories', JSON.stringify(cleanCats));
            idbSet('oneroof_cached_categories', cleanCats).catch(() => {});
          }
          if (remoteSlides && Array.isArray(remoteSlides) && remoteSlides.length > 0) {
            const cleanSlides = sanitizeBannerSlides(remoteSlides);
            setBannerSlides(cleanSlides);
            safeLocalStorage.setItem('oneroof_banner_slides', JSON.stringify(cleanSlides));
            idbSet('oneroof_cached_slides', cleanSlides).catch(() => {});
          }
          if (remoteUsers && remoteUsers.length > 0) {
            setUsers((prev) => {
              const map = new Map<string, User>();
              for (const localU of prev) {
                map.set(localU.id, localU);
              }
              for (const remoteU of remoteUsers) {
                map.set(remoteU.id, remoteU);
              }
              return Array.from(map.values());
            });
          }
          setIsProductsLoading(false);
          setInitialLoadingStep('সবকিছু প্রস্তুত, স্বাগতম!');
          setTimeout(() => {
            if (isMounted) setIsAppReady(true);
          }, 250);
        }
        
        // Setup real-time listeners for live sync across devices with graceful error handling
        try {
          try {
            const existingChannels = supabase.getChannels();
            const stale = existingChannels.find((c: any) => c.topic === 'realtime:oneroof-realtime');
            if (stale) supabase.removeChannel(stale);
          } catch (_) {}

          const channel = supabase
            .channel('oneroof-realtime')
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'orders' },
              (payload) => {
                if (!isMounted) return;
                if (payload.eventType === 'INSERT' && payload.new?.data) {
                  const newOrder = payload.new.data as Order;
                  setOrders((prev) => (prev.some((o) => o.id === newOrder.id) ? prev : [newOrder, ...prev]));
                } else if (payload.eventType === 'UPDATE' && payload.new?.data) {
                  const updatedOrder = payload.new.data as Order;
                  setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
                } else if (payload.eventType === 'DELETE' && payload.old?.id) {
                  const deletedId = payload.old.id;
                  setOrders((prev) => prev.filter((o) => o.id !== deletedId));
                }
              }
            )
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'products' },
              (payload) => {
                if (!isMounted) return;
                if (payload.eventType === 'INSERT' && payload.new?.data) {
                  const newProduct = payload.new.data as Product;
                  const deletedIds = getDeletedProductIds();
                  if (deletedIds.has(newProduct.id)) return;
                  setProducts((prev) => {
                    const next = deduplicateProducts([newProduct, ...prev]);
                    safeLocalStorage.setItem('oneroof_products', JSON.stringify(next.slice(0, 50)));
                    idbSet('oneroof_cached_products', next).catch(() => {});
                    return next;
                  });
                } else if (payload.eventType === 'UPDATE' && payload.new?.data) {
                  const updatedProduct = payload.new.data as Product;
                  const deletedIds = getDeletedProductIds();
                  if (deletedIds.has(updatedProduct.id)) return;
                  setProducts((prev) => {
                    const next = prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
                    safeLocalStorage.setItem('oneroof_products', JSON.stringify(next.slice(0, 50)));
                    idbSet('oneroof_cached_products', next).catch(() => {});
                    return next;
                  });
                } else if (payload.eventType === 'DELETE' && payload.old?.id) {
                  const deletedId = payload.old.id;
                  recordDeletedProductIds([deletedId]);
                  setProducts((prev) => {
                    const next = prev.filter((p) => p.id !== deletedId);
                    safeLocalStorage.setItem('oneroof_products', JSON.stringify(next.slice(0, 50)));
                    idbSet('oneroof_cached_products', next).catch(() => {});
                    return next;
                  });
                }
              }
            )
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'categories' },
              (payload) => {
                if (!isMounted) return;
                if (payload.eventType === 'INSERT' && payload.new?.data) {
                  const newCat = payload.new.data as Category;
                  setCategories((prev) => {
                    const next = prev.some((c) => c.id === newCat.id) ? prev : [...prev, newCat];
                    safeLocalStorage.setItem('oneroof_categories', JSON.stringify(next));
                    idbSet('oneroof_cached_categories', next).catch(() => {});
                    return next;
                  });
                } else if (payload.eventType === 'UPDATE' && payload.new?.data) {
                  const updatedCat = payload.new.data as Category;
                  setCategories((prev) => {
                    const next = prev.map((c) => (c.id === updatedCat.id ? updatedCat : c));
                    safeLocalStorage.setItem('oneroof_categories', JSON.stringify(next));
                    idbSet('oneroof_cached_categories', next).catch(() => {});
                    return next;
                  });
                } else if (payload.eventType === 'DELETE' && payload.old?.id) {
                  const deletedId = payload.old.id;
                  setCategories((prev) => {
                    const next = prev.filter((c) => c.id !== deletedId);
                    safeLocalStorage.setItem('oneroof_categories', JSON.stringify(next));
                    idbSet('oneroof_cached_categories', next).catch(() => {});
                    return next;
                  });
                }
              }
            )
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'site_settings' },
              (payload) => {
                if (!isMounted) return;
                if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new?.data) {
                  const settings = payload.new.data as SiteSettings;
                  setSiteSettings(settings);
                  safeLocalStorage.setItem('oneroof_site_settings', JSON.stringify(settings));
                  idbSet('oneroof_cached_site_settings', settings).catch(() => {});
                }
              }
            )
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'banner_slides' },
              (payload) => {
                if (!isMounted) return;
                if (payload.eventType === 'INSERT' && payload.new?.data) {
                  const newSlide = payload.new.data as AdminBannerSlide;
                  setBannerSlides((prev) => {
                    const next = prev.some((s) => s.id === newSlide.id) ? prev : [...prev, newSlide];
                    safeLocalStorage.setItem('oneroof_banner_slides', JSON.stringify(next));
                    idbSet('oneroof_cached_slides', next).catch(() => {});
                    return next;
                  });
                } else if (payload.eventType === 'UPDATE' && payload.new?.data) {
                  const updatedSlide = payload.new.data as AdminBannerSlide;
                  setBannerSlides((prev) => {
                    const next = prev.map((s) => (s.id === updatedSlide.id ? updatedSlide : s));
                    safeLocalStorage.setItem('oneroof_banner_slides', JSON.stringify(next));
                    idbSet('oneroof_cached_slides', next).catch(() => {});
                    return next;
                  });
                } else if (payload.eventType === 'DELETE' && payload.old?.id) {
                  const deletedId = payload.old.id;
                  setBannerSlides((prev) => {
                    const next = prev.filter((s) => s.id !== deletedId);
                    safeLocalStorage.setItem('oneroof_banner_slides', JSON.stringify(next));
                    idbSet('oneroof_cached_slides', next).catch(() => {});
                    return next;
                  });
                }
              }
            )
            .on(
              'postgres_changes',
              { event: '*', schema: 'public', table: 'users' },
              (payload) => {
                if (!isMounted) return;
                if (payload.eventType === 'INSERT' && payload.new?.data) {
                  const newUser = payload.new.data as User;
                  setUsers((prev) => (prev.some((u) => u.id === newUser.id) ? prev : [newUser, ...prev]));
                } else if (payload.eventType === 'UPDATE' && payload.new?.data) {
                  const updatedUser = payload.new.data as User;
                  setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
                  setCurrentUser((curr) => (curr && curr.id === updatedUser.id ? updatedUser : curr));
                } else if (payload.eventType === 'DELETE' && payload.old?.id) {
                  const deletedId = payload.old.id;
                  setUsers((prev) => prev.filter((u) => u.id !== deletedId));
                }
              }
            );

          channel.subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
              // Ignore WebSocket channel errors silently
            }
          });

          channelObj = channel;
        } catch (rtErr) {
          console.warn('Supabase realtime notice:', rtErr);
        }

      } catch (e) {
        console.warn('Supabase initial fetch notice:', e);
      }
    };

    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsAppReady(true);
      }
    }, 1400);

    initSupabase();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      try {
        if (channelObj) supabase.removeChannel(channelObj);
      } catch (_) {}
    };
  }, []);

  // Auto-sync pending offline orders when internet connection is restored
  const syncPendingOfflineOrders = async () => {
    try {
      const pending = getPendingOfflineOrders();
      if (!pending || pending.length === 0) return;

      const syncedIds = new Set<string>();
      for (const order of pending) {
        const orderToSync = { ...order, isOfflineOrder: false, syncedToCloud: true };
        const ok = await syncOrderToSupabase(orderToSync);
        if (ok) {
          syncedIds.add(order.id);
        }
      }

      if (syncedIds.size > 0) {
        const remaining = pending.filter((o) => !syncedIds.has(o.id));
        safeLocalStorage.setItem('oneroof_pending_offline_orders', JSON.stringify(remaining));
        idbSet('oneroof_pending_offline_orders', remaining).catch(() => {});

        // Mark them as synced in state, localStorage, and IDB
        setOrders((prev) => {
          const updated = prev.map((o) =>
            syncedIds.has(o.id) ? { ...o, isOfflineOrder: false, syncedToCloud: true } : o
          );
          safeLocalStorage.setItem('oneroof_orders', JSON.stringify(updated));
          idbSet('oneroof_cached_orders', updated).catch(() => {});
          return updated;
        });

        addToast(
          language === 'bn'
            ? `ইন্টারনেট সংযুক্ত! ${syncedIds.size}টি অফলাইন অর্ডার সার্ভারে সফলভাবে সিঙ্ক হয়েছে।`
            : `Back online! ${syncedIds.size} offline order(s) successfully synced.`,
          'success'
        );
      }
    } catch (e) {
      console.warn('Sync pending orders error:', e);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      syncPendingOfflineOrders();
    };

    window.addEventListener('online', handleOnline);

    if (navigator.onLine) {
      const timer = setTimeout(() => {
        syncPendingOfflineOrders();
      }, 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('online', handleOnline);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Bulk Sync to Supabase
  const syncAllToSupabase = async (): Promise<boolean> => {
    try {
      addToast(language === 'bn' ? 'Supabase এ সিঙ্ক শুরু হচ্ছে...' : 'Syncing with Supabase...', 'info');
      await syncSiteSettingsToSupabase(siteSettings);
      await syncCategoriesToSupabase(categories);
      await syncBannerSlidesToSupabase(bannerSlides);
      if (products.length > 0) {
        await syncProductsBatchToSupabase(products);
      }
      for (const o of orders) {
        await syncOrderToSupabase(o);
      }
      for (const u of users) {
        await syncUserToSupabase(u);
      }
      setSupabaseConnected(true);
      setSupabaseStatusMsg(`সকল তথ্য (${products.length}টি পণ্য) Supabase এ সিঙ্ক হয়েছে`);
      addToast(
        language === 'bn'
          ? `সকল ${products.length}টি প্রডাক্ট, অর্ডার ও সেটিংস Supabase এ সিঙ্ক হয়েছে!`
          : `All ${products.length} products and settings synced to Supabase!`,
        'success'
      );
      return true;
    } catch (e) {
      addToast(language === 'bn' ? 'Supabase সিঙ্কে সমস্যা হয়েছে' : 'Supabase sync failed', 'error');
      return false;
    }
  };

  // Synchronize CSS Root Variables for dynamic branding
  useEffect(() => {
    const primary = siteSettings.primaryColor || '#00873E';
    const accent = siteSettings.accentColor || '#DC2626';
    document.documentElement.style.setProperty('--theme-primary', primary);
    document.documentElement.style.setProperty('--theme-accent', accent);
    document.documentElement.style.setProperty('--color-primary', primary);
    document.documentElement.style.setProperty('--color-accent', accent);
    document.documentElement.style.setProperty('--theme-primary-light', `${primary}14`);
    document.documentElement.style.setProperty('--theme-accent-light', `${accent}1c`);
  }, [siteSettings.primaryColor, siteSettings.accentColor]);

  // Save changes to safeLocalStorage
  useEffect(() => {
    safeLocalStorage.setItem('oneroof_lang', language);
  }, [language]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    try {
      safeLocalStorage.setItem('oneroof_products', JSON.stringify(products.slice(0, 100)));
    } catch (_) {}
    idbSet('oneroof_cached_products', products).catch(() => {});
  }, [products]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_categories', JSON.stringify(categories));
    idbSet('oneroof_cached_categories', categories).catch(() => {});
  }, [categories]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      safeLocalStorage.setItem('oneroof_current_user', JSON.stringify(currentUser));
    } else {
      safeLocalStorage.removeItem('oneroof_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    safeLocalStorage.setItem('oneroof_banner_slides', JSON.stringify(bannerSlides));
    idbSet('oneroof_cached_slides', bannerSlides).catch(() => {});
  }, [bannerSlides]);

  // Apply dynamic theme colors and layout style to :root across the entire website
  useEffect(() => {
    const root = document.documentElement;
    const primary = siteSettings.primaryColor || '#00873E';
    const accent = siteSettings.accentColor || '#DC2626';

    root.style.setProperty('--theme-primary', primary);
    root.style.setProperty('--theme-accent', accent);
    root.style.setProperty('--theme-primary-light', `${primary}18`);
    root.style.setProperty('--theme-accent-light', `${accent}1e`);

    // Radius
    const radius = siteSettings.layoutStyle === 'compact' ? '0.5rem' : siteSettings.layoutStyle === 'festive' ? '1.5rem' : '1rem';
    root.style.setProperty('--theme-radius', radius);
  }, [siteSettings.primaryColor, siteSettings.accentColor, siteSettings.layoutStyle]);

  // Secret keyboard trigger (Ctrl + Shift + A or Cmd + Shift + A) and URL Hash (#admin)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminModalOpen(true);
      }
    };

    const checkHash = () => {
      if (window.location.hash === '#admin' || window.location.search.includes('admin=')) {
        setIsAdminModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', checkHash);
    checkHash();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', checkHash);
    };
  }, []);

  const loginAdmin = (identifier?: string, password?: string): boolean => {
    // If identifier & password provided
    if (identifier && password) {
      const cleanId = identifier.trim().toLowerCase();
      const cleanDigits = identifier.replace(/[^0-9]/g, '');
      const isEmailValid = cleanId === SECRET_ADMIN_CONFIG.email || cleanId === SECRET_ADMIN_CONFIG.secondaryEmail;
      const isPhoneValid = cleanDigits.length >= 10 && (
        cleanDigits.endsWith(SECRET_ADMIN_CONFIG.phone) || 
        cleanDigits.endsWith(SECRET_ADMIN_CONFIG.secondaryPhone)
      );
      const isPassValid = password === SECRET_ADMIN_CONFIG.password;

      // Also check user database for any admin matching credentials
      const matchedAdminUser = users.find((u) => {
        if (!isUserAdmin(u) && u.role !== 'admin') return false;
        const uEmail = (u.email || '').trim().toLowerCase();
        const uPhoneDigits = (u.phone || '').replace(/[^0-9]/g, '');
        const emailMatches = Boolean(uEmail && uEmail === cleanId);
        const phoneMatches = cleanDigits.length >= 10 && uPhoneDigits.length >= 10 && uPhoneDigits.endsWith(cleanDigits.slice(-10));
        const passMatches = password === SECRET_ADMIN_CONFIG.password;
        return (emailMatches || phoneMatches) && passMatches;
      });

      if (((isEmailValid || isPhoneValid) && isPassValid) || matchedAdminUser) {
        let adminUser = matchedAdminUser || users.find((u) => isUserAdmin(u));

        if (!adminUser) {
          adminUser = { ...INITIAL_USER, role: 'admin', password: SECRET_ADMIN_CONFIG.password };
          setUsers((prev) => [adminUser!, ...prev]);
        }

        const validAdmin = { ...adminUser, role: 'admin' as const, password: SECRET_ADMIN_CONFIG.password };
        setCurrentUser(validAdmin);
        setIsAdminAuthenticated(true);
        safeSessionStorage.setItem('oneroof_admin_auth', 'true');
        addToast(
          language === 'bn' 
            ? 'এডমিন কন্ট্রোল ভেরিফাইড! এডমিন প্যানেলে স্বাগতম।' 
            : 'Admin Verified! Welcome to Admin Panel.',
          'success'
        );
        return true;
      } else {
        addToast(
          language === 'bn' 
            ? 'অ্যাক্সেস ডিনাইড! ভুল তথ্য বা অননুমোদিত ক্রেডেনশিয়াল।' 
            : 'Access Denied! Unauthorized admin credentials or incorrect password.',
          'error'
        );
        return false;
      }
    }

    // Direct password verification when password alone is passed for currently logged in admin user
    if (password) {
      if (password === SECRET_ADMIN_CONFIG.password && isUserAdmin(currentUser)) {
        setIsAdminAuthenticated(true);
        safeSessionStorage.setItem('oneroof_admin_auth', 'true');
        addToast(
          language === 'bn' 
            ? 'এডমিন সিক্রেট পাসওয়ার্ড সফলভাবে ভেরিফাইড! স্বাগতম।' 
            : 'Admin password verified! Welcome.',
          'success'
        );
        return true;
      }
    }

    addToast(
      language === 'bn' 
        ? 'অ্যাক্সেস ডিনাইড! সঠিক সিক্রেট এডমিন পাসওয়ার্ড প্রদান করুন।' 
        : 'Access Denied! Secret password required for Admin Panel.',
      'error'
    );
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    safeSessionStorage.removeItem('oneroof_admin_auth');
    if (currentPage === 'admin') {
      setCurrentPage('home');
    }
    addToast(language === 'bn' ? 'এডমিন প্যানেল থেকে প্রস্থান করা হয়েছে' : 'Logged out from Admin', 'info');
  };

  // Category Admin Operations & Auto-Creation Helper
  const ensureCategoryExists = (
    categorySlug: string,
    nameBn?: string,
    nameEn?: string,
    image?: string,
    iconName?: string
  ): Category => {
    const cleanSlug = (categorySlug || '').trim().toLowerCase();
    const cleanBn = (nameBn || '').trim().toLowerCase();
    const cleanEn = (nameEn || '').trim().toLowerCase();

    // 1. Check if category already exists in current categories
    const existing = categories.find((c) => {
      const cId = (c.id || '').trim().toLowerCase();
      const cSlug = (c.slug || '').trim().toLowerCase();
      const cBn = (c.nameBn || '').trim().toLowerCase();
      const cEn = (c.nameEn || '').trim().toLowerCase();
      return (
        (cleanSlug && (cId === cleanSlug || cSlug === cleanSlug)) ||
        (cleanBn && cBn === cleanBn) ||
        (cleanEn && cEn === cleanEn)
      );
    });

    if (existing) {
      return existing;
    }

    // 2. Derive metadata for the missing category
    const meta = getShopBaseCategoryMetadata(categorySlug || nameBn || '');
    const finalSlug = cleanSlug || meta.slug;
    const finalNameBn = nameBn || meta.nameBn;
    const finalNameEn = nameEn || meta.nameEn;
    const finalIcon = iconName || meta.iconName || 'Shirt';
    const finalImage =
      image ||
      meta.image ||
      'https://shopbasebd.com/public/uploads/shop/category/scategory-1738393401.png';

    const newCategory: Category = {
      id: finalSlug,
      slug: finalSlug,
      nameBn: finalNameBn,
      nameEn: finalNameEn,
      iconName: finalIcon,
      image: finalImage,
      itemCount: 1,
      featured: true,
    };

    setCategories((prev) => {
      const alreadyPresent = prev.some(
        (c) =>
          c.id.toLowerCase() === finalSlug.toLowerCase() ||
          c.slug.toLowerCase() === finalSlug.toLowerCase() ||
          c.nameBn.trim().toLowerCase() === finalNameBn.trim().toLowerCase()
      );
      if (alreadyPresent) return prev;
      const updated = [...prev, newCategory];
      safeLocalStorage.setItem('oneroof_categories', JSON.stringify(updated));
      idbSet('oneroof_cached_categories', updated).catch(() => {});
      syncCategoriesToSupabase(updated).catch(() => {});
      return updated;
    });

    addToast(
      language === 'bn'
        ? `নতুন ক্যাটাগরি "${finalNameBn}" স্বয়ংক্রিয়ভাবে ওয়েবসাইটে যুক্ত হয়েছে!`
        : `New category "${finalNameEn}" automatically created!`,
      'success'
    );

    return newCategory;
  };

  // Product Admin Operations
  const addProduct = (newProduct: Product) => {
    // Unrecord from deleted set if re-adding
    unrecordDeletedProductId(newProduct.id);

    // Automatically ensure the product's category exists on the website
    if (newProduct.category) {
      ensureCategoryExists(
        newProduct.category,
        newProduct.subcategory,
        undefined,
        newProduct.images?.[0]
      );
    }
    setProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== newProduct.id);
      const next = [newProduct, ...filtered];
      safeLocalStorage.setItem('oneroof_products', JSON.stringify(next.slice(0, 200)));
      idbSet('oneroof_cached_products', next).catch(() => {});
      return next;
    });
    syncProductToSupabase(newProduct).catch((err) => {
      console.warn('Supabase product add warning:', err);
    });
    addToast(
      language === 'bn' 
        ? `"${newProduct.titleBn}" প্রডাক্ট সফলভাবে যুক্ত হয়েছে!` 
        : `Product "${newProduct.titleEn}" added successfully!`,
      'success'
    );
  };

  const addMultipleProducts = (newProducts: Product[]) => {
    if (!newProducts || newProducts.length === 0) return;

    for (const p of newProducts) {
      unrecordDeletedProductId(p.id);
    }

    // Automatically ensure all categories exist on the website
    const categoriesProcessed = new Set<string>();
    for (const p of newProducts) {
      if (p.category && !categoriesProcessed.has(p.category)) {
        categoriesProcessed.add(p.category);
        ensureCategoryExists(
          p.category,
          p.subcategory,
          undefined,
          p.images?.[0]
        );
      }
    }

    setProducts((prev) => {
      const incomingClean = deduplicateProducts(newProducts);
      const incomingIds = new Set(incomingClean.map((p) => p.id));
      const filteredExisting = prev.filter((p) => !incomingIds.has(p.id));
      const next = [...incomingClean, ...filteredExisting];
      safeLocalStorage.setItem('oneroof_products', JSON.stringify(next.slice(0, 200)));
      idbSet('oneroof_cached_products', next).catch(() => {});
      return next;
    });
    syncProductsBatchToSupabase(newProducts).catch((err) => {
      console.warn('Supabase batch add warning:', err);
    });
    addToast(
      language === 'bn' 
        ? `${newProducts.length}টি প্রোডাক্ট সফলভাবে যুক্ত করা হয়েছে!` 
        : `${newProducts.length} products imported successfully!`,
      'success'
    );
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    let updatedTarget: Product | undefined;
    setProducts((prev) => {
      const next = prev.map((p) => {
        if (p.id === id) {
          const merged = { ...p, ...updated };
          updatedTarget = merged;
          return merged;
        }
        return p;
      });
      safeLocalStorage.setItem('oneroof_products', JSON.stringify(next.slice(0, 200)));
      idbSet('oneroof_cached_products', next).catch(() => {});
      return next;
    });

    if (updatedTarget) {
      syncProductToSupabase(updatedTarget).catch((err) => {
        console.warn('Supabase product update warning:', err);
      });
    }

    addToast(language === 'bn' ? 'প্রডাক্ট তথ্য আপডেট করা হয়েছে!' : 'Product updated successfully!', 'success');
  };

  const deleteProduct = (id: string) => {
    recordDeletedProductIds([id]);
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      safeLocalStorage.setItem('oneroof_products', JSON.stringify(next.slice(0, 200)));
      idbSet('oneroof_cached_products', next).catch(() => {});
      return next;
    });
    deleteProductFromSupabase(id).catch((err) => {
      console.warn('Supabase delete error:', err);
    });
    addToast(language === 'bn' ? 'প্রডাক্ট সফলভাবে মুছে ফেলা হয়েছে!' : 'Product deleted successfully!', 'info');
  };

  const deleteMultipleProducts = (ids: string[]) => {
    if (!ids || ids.length === 0) return;
    recordDeletedProductIds(ids);
    const idSet = new Set(ids);
    setProducts((prev) => {
      const next = prev.filter((p) => !idSet.has(p.id));
      safeLocalStorage.setItem('oneroof_products', JSON.stringify(next.slice(0, 200)));
      idbSet('oneroof_cached_products', next).catch(() => {});
      return next;
    });
    deleteMultipleProductsFromSupabase(ids).catch((err) => {
      console.warn('Supabase batch delete error:', err);
    });
    addToast(
      language === 'bn' 
        ? `${ids.length}টি পণ্য সফলভাবে মুছে ফেলা হয়েছে!` 
        : `${ids.length} products deleted successfully!`, 
      'info'
    );
  };

  const resetProductsToDefault = () => {
    safeLocalStorage.removeItem('oneroof_deleted_product_ids');
    idbSet('oneroof_deleted_product_ids', []).catch(() => {});
    const cleanDefault = deduplicateProducts(INITIAL_PRODUCTS);
    setProducts(cleanDefault);
    safeLocalStorage.setItem('oneroof_products', JSON.stringify(cleanDefault));
    idbSet('oneroof_cached_products', cleanDefault).catch(() => {});
    cleanDefault.forEach((p) => syncProductToSupabase(p));
    addToast(language === 'bn' ? 'ডিফল্ট প্রডাক্টগুলো রিস্টোর করা হয়েছে' : 'Default products restored', 'info');
  };

  // Category Admin Operations
  const addCategory = (newCat: Category) => {
    setCategories((prev) => {
      const next = [...prev, newCat];
      safeLocalStorage.setItem('oneroof_categories', JSON.stringify(next));
      idbSet('oneroof_cached_categories', next).catch(() => {});
      syncCategoriesToSupabase(next).catch(() => {});
      return next;
    });
    addToast(
      language === 'bn' ? `"${newCat.nameBn}" ক্যাটাগরি সফলভাবে যুক্ত হয়েছে!` : `Category "${newCat.nameEn}" added!`,
      'success'
    );
  };

  const updateCategory = (id: string, updated: Partial<Category>) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...updated } : c));
      safeLocalStorage.setItem('oneroof_categories', JSON.stringify(next));
      idbSet('oneroof_cached_categories', next).catch(() => {});
      syncCategoriesToSupabase(next).catch(() => {});
      return next;
    });
    addToast(language === 'bn' ? 'ক্যাটাগরি সফলভাবে আপডেট হয়েছে!' : 'Category updated successfully!', 'success');
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      safeLocalStorage.setItem('oneroof_categories', JSON.stringify(next));
      idbSet('oneroof_cached_categories', next).catch(() => {});
      deleteCategoryFromSupabase(id).catch(() => {});
      syncCategoriesToSupabase(next).catch(() => {});
      return next;
    });
    addToast(language === 'bn' ? 'ক্যাটাগরি মুছে ফেলা হয়েছে' : 'Category deleted', 'info');
  };

  const resetCategoriesToDefault = () => {
    setCategories(CATEGORIES);
    safeLocalStorage.setItem('oneroof_categories', JSON.stringify(CATEGORIES));
    idbSet('oneroof_cached_categories', CATEGORIES).catch(() => {});
    syncCategoriesToSupabase(CATEGORIES).catch(() => {});
    addToast(language === 'bn' ? 'ডিফল্ট ক্যাটাগরিগুলো রিস্টোর করা হয়েছে' : 'Default categories restored', 'info');
  };

  // Order Admin Operations (includes automatic 2% product share commission credit & reversal)
  const roundCurrency = (val: number): number => Math.round((Number(val) || 0) * 100) / 100;

  const findAffiliateSharer = (
    referrerId: string | undefined,
    referrerCode: string | undefined,
    userList: User[]
  ): User | undefined => {
    const cleanCode = (referrerCode || '').trim().toUpperCase();
    return userList.find((u) => {
      if (referrerId && u.id === referrerId) return true;
      if (cleanCode) {
        if (u.referralCode && u.referralCode.toUpperCase() === cleanCode) return true;
        const phoneCode = u.phone ? `BB-${u.phone.replace(/\D/g, '').slice(-6)}` : '';
        if (phoneCode && phoneCode === cleanCode) return true;
        if (cleanCode === 'BB-637253' && isUserAdmin(u)) return true;
      }
      return false;
    });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, paymentStatus?: 'paid' | 'pending') => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const nowIso = new Date().toISOString();
    const now = new Date();
    const dateFormatted =
      language === 'bn'
        ? `আজ, ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}`
        : now.toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

    let nextCommissions: OrderAffiliateCommission[] | undefined = targetOrder?.affiliateCommissions;
    const updatedSharersMap = new Map<string, User>();
    const generatedTxns: WalletTransaction[] = [];
    let commissionSummaryNotice = '';

    if (targetOrder && Array.isArray(targetOrder.affiliateCommissions) && targetOrder.affiliateCommissions.length > 0) {
      if (status === 'delivered') {
        nextCommissions = targetOrder.affiliateCommissions.map((comm) => {
          if (comm.status === 'credited' || comm.commissionAmount <= 0) return comm;
          const baseUser =
            updatedSharersMap.get(comm.referrerId || comm.referrerCode) ||
            findAffiliateSharer(comm.referrerId, comm.referrerCode, users);
          if (!baseUser) return comm;

          const commTxn: WalletTransaction = {
            id: `COMM-${Math.floor(10000 + Math.random() * 90000)}`,
            userId: baseUser.id,
            userName: baseUser.name,
            userPhone: baseUser.phone,
            type: 'commission',
            amount: comm.commissionAmount,
            date: dateFormatted,
            status: 'completed',
            method: 'system',
            note: `প্রোডাক্ট শেয়ার কমিশন (২%): অর্ডার #${targetOrder.id} ডেলিভারি সম্পন্ন`,
          };

          const updatedSharer: User = {
            ...baseUser,
            balance: roundCurrency((baseUser.balance || 0) + comm.commissionAmount),
            walletTransactions: [commTxn, ...(baseUser.walletTransactions || [])],
          };

          updatedSharersMap.set(updatedSharer.id, updatedSharer);
          generatedTxns.push(commTxn);
          commissionSummaryNotice =
            language === 'bn'
              ? ` শেয়ারকারীর (${updatedSharer.name}) অ্যাকাউন্টে ২% কমিশন (৳${comm.commissionAmount}) যোগ হয়েছে।`
              : ` Added 2% share commission (৳${comm.commissionAmount}) to ${updatedSharer.name}.`;

          return {
            ...comm,
            referrerId: updatedSharer.id,
            referrerName: updatedSharer.name,
            status: 'credited' as const,
            creditedAt: nowIso,
            txnId: commTxn.id,
          };
        });
      } else if (status === 'cancelled') {
        nextCommissions = targetOrder.affiliateCommissions.map((comm) => {
          if (comm.status === 'credited' && comm.commissionAmount > 0) {
            const baseUser =
              updatedSharersMap.get(comm.referrerId || comm.referrerCode) ||
              findAffiliateSharer(comm.referrerId, comm.referrerCode, users);
            if (!baseUser) {
              return { ...comm, status: 'deducted' as const, deductedAt: nowIso };
            }

            const reversalTxn: WalletTransaction = {
              id: `CREV-${Math.floor(10000 + Math.random() * 90000)}`,
              userId: baseUser.id,
              userName: baseUser.name,
              userPhone: baseUser.phone,
              type: 'commission_reversal',
              amount: comm.commissionAmount,
              date: dateFormatted,
              status: 'completed',
              method: 'system',
              note: `অর্ডার #${targetOrder.id} বাতিল হওয়ায় ২% শেয়ার কমিশন অটোমেটিক কর্তন`,
            };

            const updatedSharer: User = {
              ...baseUser,
              balance: Math.max(0, roundCurrency((baseUser.balance || 0) - comm.commissionAmount)),
              walletTransactions: [reversalTxn, ...(baseUser.walletTransactions || [])],
            };

            updatedSharersMap.set(updatedSharer.id, updatedSharer);
            generatedTxns.push(reversalTxn);
            commissionSummaryNotice =
              language === 'bn'
                ? ` অর্ডার বাতিল হওয়ায় ${updatedSharer.name}-এর অ্যাকাউন্ট থেকে ৳${comm.commissionAmount} কমিশন কেটে নেওয়া হয়েছে।`
                : ` Deducted ৳${comm.commissionAmount} share commission from ${updatedSharer.name}.`;

            return {
              ...comm,
              referrerId: updatedSharer.id,
              referrerName: updatedSharer.name,
              status: 'deducted' as const,
              deductedAt: nowIso,
              reversalTxnId: reversalTxn.id,
            };
          }
          if (comm.status === 'pending') {
            return { ...comm, status: 'cancelled' as const };
          }
          return comm;
        });
      }
    }

    if (updatedSharersMap.size > 0) {
      setUsers((prev) =>
        prev.map((u) => {
          const updated = updatedSharersMap.get(u.id);
          return updated ? updated : u;
        })
      );
      if (currentUser && updatedSharersMap.has(currentUser.id)) {
        setCurrentUser(updatedSharersMap.get(currentUser.id)!);
      }
      if (generatedTxns.length > 0) {
        setAllWalletTransactions((prev) => [...generatedTxns, ...prev]);
      }
      updatedSharersMap.forEach((updatedSharer) => {
        syncUserToSupabase(updatedSharer).catch(() => {});
      });
    }

    setOrders((prev) => {
      const next = prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedOrd: Order = {
            ...ord,
            status,
            ...(paymentStatus ? { paymentStatus } : {}),
            ...(nextCommissions !== undefined ? { affiliateCommissions: nextCommissions } : {}),
          };
          syncOrderToSupabase(updatedOrd).catch(() => {});
          return updatedOrd;
        }
        return ord;
      });
      safeLocalStorage.setItem('oneroof_orders', JSON.stringify(next));
      idbSet('oneroof_cached_orders', next).catch(() => {});
      return next;
    });

    addToast(
      (language === 'bn' ? `অর্ডার #${orderId} স্ট্যাটাস আপডেট হয়েছে!` : `Order #${orderId} status updated!`) +
        commissionSummaryNotice,
      'success'
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const next = prev.filter((ord) => ord.id !== orderId);
      safeLocalStorage.setItem('oneroof_orders', JSON.stringify(next));
      idbSet('oneroof_cached_orders', next).catch(() => {});
      return next;
    });
    deleteOrderFromSupabase(orderId).catch(() => {});
    addToast(language === 'bn' ? 'অর্ডার রেকর্ড মুছে ফেলা হয়েছে' : 'Order record deleted', 'info');
  };

  // Site Settings Operations
  const updateSiteSettings = (newSettings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      safeLocalStorage.setItem('oneroof_site_settings', JSON.stringify(merged));
      idbSet('oneroof_cached_site_settings', merged).catch(() => {});
      syncSiteSettingsToSupabase(merged).catch(() => {});
      return merged;
    });
    addToast(language === 'bn' ? 'সাইটের সেটিংস ও ডিজাইন সংরক্ষিত হয়েছে!' : 'Settings & design saved!', 'success');
  };

  const resetSiteSettings = () => {
    setSiteSettings(DEFAULT_SITE_SETTINGS);
    safeLocalStorage.setItem('oneroof_site_settings', JSON.stringify(DEFAULT_SITE_SETTINGS));
    idbSet('oneroof_cached_site_settings', DEFAULT_SITE_SETTINGS).catch(() => {});
    syncSiteSettingsToSupabase(DEFAULT_SITE_SETTINGS).catch(() => {});
    addToast(language === 'bn' ? 'ডিফল্ট সেটিংস ও কালার রিস্টোর করা হয়েছে' : 'Default settings restored', 'info');
  };

  // Customer Rules, Conditions & Notices Operations (stored in siteSettings -> Supabase realtime)
  const customerNotices: CustomerRuleNotice[] = useMemo(() => {
    return Array.isArray(siteSettings.customerNotices)
      ? siteSettings.customerNotices
      : DEFAULT_CUSTOMER_NOTICES;
  }, [siteSettings.customerNotices]);

  const persistCustomerNotices = (nextNotices: CustomerRuleNotice[]) => {
    setSiteSettings((prev) => {
      const merged: SiteSettings = { ...prev, customerNotices: nextNotices };
      safeLocalStorage.setItem('oneroof_site_settings', JSON.stringify(merged));
      idbSet('oneroof_cached_site_settings', merged).catch(() => {});
      syncSiteSettingsToSupabase(merged).catch(() => {});
      return merged;
    });
  };

  const addCustomerNotice = (
    notice: Omit<CustomerRuleNotice, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newNotice: CustomerRuleNotice = {
      ...notice,
      id: `notice-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    persistCustomerNotices([newNotice, ...customerNotices]);
    addToast(
      language === 'bn' ? 'নতুন নিয়ম/নোটিশ সফলভাবে আপলোড হয়েছে!' : 'Notice published!',
      'success'
    );
  };

  const updateCustomerNotice = (id: string, updates: Partial<CustomerRuleNotice>) => {
    const updated = customerNotices.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    );
    persistCustomerNotices(updated);
    addToast(language === 'bn' ? 'তথ্য সফলভাবে আপডেট হয়েছে!' : 'Updated successfully!', 'success');
  };

  const deleteCustomerNotice = (id: string) => {
    const updated = customerNotices.filter((n) => n.id !== id);
    persistCustomerNotices(updated);
    addToast(language === 'bn' ? 'নিয়ম/নোটিশ মুছে ফেলা হয়েছে' : 'Notice deleted', 'info');
  };

  const resetCustomerNoticesToDefault = () => {
    persistCustomerNotices(DEFAULT_CUSTOMER_NOTICES);
    addToast(
      language === 'bn' ? 'ডিফল্ট নিয়ম ও শর্তাবলী ফিরিয়ে আনা হয়েছে' : 'Default rules restored',
      'info'
    );
  };

  const globalProfitMargin = siteSettings.globalProfitMargin || siteSettings.shopbaseConfig?.profitMargin || 5;

  // Universal Profit Margin & Dynamic Pricing Controller
  const updateGlobalProfitMargin = async (newMargin: number): Promise<boolean> => {
    try {
      const validMargin = Math.max(1, Math.min(100, Math.round(newMargin)));
      // 1. Update siteSettings
      const updatedSettings: SiteSettings = {
        ...siteSettings,
        globalProfitMargin: validMargin,
        shopbaseConfig: {
          ...(siteSettings.shopbaseConfig || {
            connected: true,
            accountNumber: '01929637253',
            autoSync: true,
            autoForwardOrders: true,
          }),
          profitMargin: validMargin,
        },
      };
      setSiteSettings(updatedSettings);
      syncSiteSettingsToSupabase(updatedSettings).catch(() => {});
      safeLocalStorage.setItem('oneroof_site_settings', JSON.stringify(updatedSettings));

      // 2. Recalculate prices across all products in state
      setProducts((prev) => {
        const updated = prev.map((p) => {
          const wholesale = Number(p.wholesalePrice || p.price);
          const newPrice = Math.round(wholesale * (1 + validMargin / 100));
          return {
            ...p,
            price: newPrice,
            originalPrice: Math.max(p.originalPrice || Math.round(newPrice * 1.3), Math.round(newPrice * 1.25)),
            profitMarginPercent: validMargin,
            brand: 'বাংলা বাজার',
          };
        });
        idbSet('oneroof_cached_products', updated).catch(() => {});
        try {
          safeLocalStorage.setItem('oneroof_products', JSON.stringify(updated.slice(0, 200)));
        } catch (_) {}
        return updated;
      });

      // 3. Batch sync to Supabase in background
      updateAllProductsProfitMarginInSupabase(validMargin).catch((err) => {
        console.warn('Background Supabase margin sync notice:', err);
      });

      addToast(
        language === 'bn'
          ? `সকল ${products.length}টি প্রোডাক্টে ${validMargin}% প্রফিট মার্জিন সফলভাবে কার্যকর হয়েছে!`
          : `Applied ${validMargin}% profit margin across all ${products.length} products!`,
        'success'
      );
      return true;
    } catch {
      addToast(language === 'bn' ? 'মার্জিন আপডেটে সমস্যা হয়েছে' : 'Failed to update margin', 'error');
      return false;
    }
  };

  // Enforce White-Label Store Branding and Purge Supplier references
  const enforceWhiteLabelPurge = async (): Promise<boolean> => {
    try {
      setProducts((prev) => {
        const cleaned = prev.map((p) => {
          let desc = p.descriptionBn || '';
          desc = desc.replace(/OneRoof\s*Mart\s*এক্সক্লুসিভ\s*পণ্য/gi, 'বাংলা বাজার এক্সক্লুসিভ পণ্য');
          desc = desc.replace(/ShopBase\s*BD\s*পণ্য/gi, 'বাংলা বাজার এক্সক্লুসিভ পণ্য');
          desc = desc.replace(/বাংলা\s*বাজার\s*Mart\s*এক্সক্লুসিভ\s*পণ্য/gi, 'বাংলা বাজার এক্সক্লুসিভ পণ্য');
          desc = desc.replace(/বাংলা\s*বাজার\s*মার্ট\s*এক্সক্লুসিভ\s*পণ্য/gi, 'বাংলা বাজার এক্সক্লুসিভ পণ্য');
          desc = desc.replace(/Bangla\s*Bazar\s*Mart/gi, 'Bangla Bazar');
          desc = desc.replace(/বাংলা\s*বাজার\s*Mart/gi, 'বাংলা বাজার');
          desc = desc.replace(/বাংলা\s*বাজার\s*মার্ট/gi, 'বাংলা বাজার');
          desc = desc.replace(/OneRoof\s*Mart/gi, 'বাংলা বাজার');
          desc = desc.replace(/ShopBase\s*BD/gi, 'বাংলা বাজার');
          desc = desc.replace(/ShopBaseBD\s*Official/gi, 'Bangla Bazar Official');
          desc = desc.replace(/OneRoof\s*Official/gi, 'Bangla Bazar Official');
          desc = desc.replace(/ShopBase/gi, 'বাংলা বাজার');
          desc = desc.replace(/OneRoof/gi, 'বাংলা বাজার');
          desc = desc.split('\n').filter(line => {
            const l = line.toLowerCase();
            return !l.includes('পাইকারি রেট') && 
                   !l.includes('পাইকারি মূল্য') && 
                   !l.includes('হোলসেল') && 
                   !l.includes('রিসেলার একাউন্ট') && 
                   !l.includes('01929637253') &&
                   !l.includes('আপনার নিট প্রফিট') &&
                   !l.includes('আপনার লাভ');
          }).join('\n').trim();

          const cleanSpecs: Record<string, string> = {
            'ব্র্যান্ড': 'বাংলা বাজার',
            'কোয়ালিটি': '১০০% প্রিমিয়াম এক্সপোর্ট স্ট্যান্ডার্ড',
            'ডেলিভারি': 'সারাদেশে ক্যাশ অন ডেলিভারি (২-৪ দিন)',
            'ওয়ারেন্টি': '৭ দিনের রিটার্ন ও রিপ্লেসমেন্ট',
          };

          if (p.specifications && typeof p.specifications === 'object') {
            const forbiddenKeys = ['সোর্স', 'উৎস', 'পাইকারি', 'হোলসেল', 'লাভ', 'প্রফিট', 'রিসেলার', 'একাউন্ট'];
            Object.entries(p.specifications).forEach(([k, v]) => {
              if (!forbiddenKeys.some(f => k.includes(f))) {
                if (k.includes('ব্র্যান্ড') || k.toLowerCase().includes('brand')) {
                  cleanSpecs[k] = 'বাংলা বাজার';
                } else {
                  cleanSpecs[k] = String(v)
                    .replace(/OneRoof\s*Mart/gi, 'বাংলা বাজার')
                    .replace(/Bangla\s*Bazar\s*Mart/gi, 'বাংলা বাজার')
                    .replace(/বাংলা\s*বাজার\s*Mart/gi, 'বাংলা বাজার')
                    .replace(/বাংলা\s*বাজার\s*মার্ট/gi, 'বাংলা বাজার')
                    .replace(/ShopBase/gi, 'বাংলা বাজার')
                    .replace(/OneRoof/gi, 'বাংলা বাজার');
                }
              }
            });
          }

          return {
            ...p,
            brand: 'বাংলা বাজার',
            descriptionBn: desc,
            specifications: cleanSpecs,
            tags: (p.tags || []).filter(t => !['shopbase', 'dropshipping', 'wholesale'].includes(String(t).toLowerCase())),
          };
        });

        idbSet('oneroof_cached_products', cleaned).catch(() => {});
        try {
          safeLocalStorage.setItem('oneroof_products', JSON.stringify(cleaned.slice(0, 200)));
        } catch (_) {}
        return cleaned;
      });

      addToast(
        language === 'bn'
          ? '১০০% নিজস্ব বাংলা বাজার (Bangla Bazar) ব্র্যান্ডিং সফলভাবে নিশ্চিত করা হয়েছে!'
          : 'Enforced 100% white-label store brand!',
        'success'
      );
      return true;
    } catch {
      return false;
    }
  };

  // Banner Slides Operations
  const updateBannerSlides = (slides: AdminBannerSlide[]) => {
    setBannerSlides(slides);
    safeLocalStorage.setItem('oneroof_banner_slides', JSON.stringify(slides));
    idbSet('oneroof_cached_slides', slides).catch(() => {});
    syncBannerSlidesToSupabase(slides).catch(() => {});
    addToast(language === 'bn' ? 'ব্যানার স্লাইডার আপডেট হয়েছে!' : 'Banner slides updated!', 'success');
  };

  const addBannerSlide = (slide: AdminBannerSlide) => {
    setBannerSlides((prev) => {
      const next = [...prev, slide];
      safeLocalStorage.setItem('oneroof_banner_slides', JSON.stringify(next));
      idbSet('oneroof_cached_slides', next).catch(() => {});
      syncBannerSlidesToSupabase(next).catch(() => {});
      return next;
    });
    addToast(language === 'bn' ? 'নতুন ব্যানার যুক্ত করা হয়েছে!' : 'New banner added!', 'success');
  };

  const updateBannerSlide = (id: string, updated: Partial<AdminBannerSlide>) => {
    setBannerSlides((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, ...updated } : s));
      safeLocalStorage.setItem('oneroof_banner_slides', JSON.stringify(next));
      idbSet('oneroof_cached_slides', next).catch(() => {});
      syncBannerSlidesToSupabase(next).catch(() => {});
      return next;
    });
    addToast(language === 'bn' ? 'ব্যানার সফলভাবে আপডেট হয়েছে!' : 'Banner updated successfully!', 'success');
  };

  const deleteBannerSlide = (id: string) => {
    setBannerSlides((prev) => {
      const next = prev.filter((s) => s.id !== id);
      safeLocalStorage.setItem('oneroof_banner_slides', JSON.stringify(next));
      idbSet('oneroof_cached_slides', next).catch(() => {});
      deleteBannerSlideFromSupabase(id).catch(() => {});
      syncBannerSlidesToSupabase(next).catch(() => {});
      return next;
    });
    addToast(language === 'bn' ? 'ব্যানার মুছে ফেলা হয়েছে!' : 'Banner deleted!', 'info');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCurrentPage = (page: PageView) => {
    setCurrentPageState(page);
    try {
      if (typeof window !== 'undefined' && window.history && page !== 'product-detail') {
        const url = new URL(window.location.href);
        if (
          url.searchParams.has('product') ||
          url.searchParams.has('p') ||
          url.searchParams.has('id') ||
          url.searchParams.has('aff') ||
          url.searchParams.has('affiliate')
        ) {
          url.searchParams.delete('product');
          url.searchParams.delete('p');
          url.searchParams.delete('id');
          url.searchParams.delete('aff');
          url.searchParams.delete('affiliate');
          const newUrl = url.pathname + (url.search ? url.search : '') + (url.hash && !url.hash.includes('product') ? url.hash : '');
          window.history.pushState({}, '', newUrl);
        }
      }
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Automatically fetch live Shopbasebd.com description if the selected ShopBase product lacks one
  useEffect(() => {
    if (!selectedProduct) return;
    if (!selectedProduct.id.startsWith('sbp-')) return;
    if (selectedProduct.descriptionBn && selectedProduct.descriptionBn.trim().length > 10) return;

    let cancelled = false;
    const targetId = selectedProduct.id;
    fetchLiveShopBaseProductDescription(targetId, selectedProduct.titleEn || selectedProduct.titleBn)
      .then((liveDesc) => {
        if (cancelled || !liveDesc || liveDesc.trim().length < 5) return;
        setSelectedProduct((curr) =>
          curr && curr.id === targetId
            ? { ...curr, descriptionBn: liveDesc, descriptionEn: curr.descriptionEn || liveDesc }
            : curr
        );
        setProducts((prev) => {
          const next = prev.map((p) =>
            p.id === targetId
              ? { ...p, descriptionBn: liveDesc, descriptionEn: p.descriptionEn || liveDesc }
              : p
          );
          idbSet('oneroof_cached_products', next).catch(() => {});
          return next;
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [selectedProduct?.id]);

  const getAffiliateCodeForProduct = (product: Product): string | undefined => {
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    // 1. Live URL query param check if currently viewing this product
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlProd = params.get('product') || params.get('p') || params.get('id');
        const urlAff = params.get('aff') || params.get('affiliate') || (urlProd ? params.get('ref') || params.get('referral') : null);
        if (urlAff && urlProd) {
          const urlCleanNum = urlProd.replace(/\D/g, '');
          const prodCleanNum = product.id.replace(/\D/g, '');
          if (
            urlProd.toLowerCase() === product.id.toLowerCase() ||
            (product.sku && urlProd.toLowerCase() === product.sku.toLowerCase()) ||
            (urlCleanNum && prodCleanNum && urlCleanNum === prodCleanNum)
          ) {
            return urlAff.trim().toUpperCase();
          }
        }
      } catch (_) {}
    }

    // 2. Stored attribution map (expires after 30 days)
    const keysToTry = [product.id];
    const cleanNum = product.id.replace(/\D/g, '');
    if (cleanNum) {
      keysToTry.push(cleanNum, `sbp-${cleanNum}`);
    }
    if (product.sku) keysToTry.push(product.sku);

    for (const k of keysToTry) {
      const entry = affiliateProductMap[k];
      if (entry && entry.referrerCode && now - entry.capturedAt <= THIRTY_DAYS_MS) {
        return entry.referrerCode.toUpperCase();
      }
    }
    return undefined;
  };

  const viewProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPageState('product-detail');
    try {
      if (typeof window !== 'undefined' && window.history) {
        const url = new URL(window.location.href);
        url.searchParams.set('product', product.id);
        // Keep aff param only if URL was already opened with aff for this same product
        const existingAff = getAffiliateCodeForProduct(product);
        if (!existingAff) {
          url.searchParams.delete('aff');
          url.searchParams.delete('affiliate');
        }
        window.history.pushState({ productId: product.id }, '', url.toString());
      }
    } catch (_) {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCategory = (catSlug: string) => {
    setFilterState((prev) => ({ 
      ...prev, 
      category: catSlug, 
      subcategory: 'all', 
      searchQuery: '' 
    }));
    setCurrentPage('shop');
  };

  const addToCart = (
    product: Product, 
    quantity = 1, 
    variant?: Record<string, string>,
    selectedImage?: string,
    selectedSize?: string,
    selectedColor?: string
  ) => {
    const finalSize = selectedSize || variant?.['size'] || variant?.['Size'];
    const finalColor = selectedColor || variant?.['color'] || variant?.['Color'];
    const finalImage = selectedImage || product.images?.[0] || '';
    const detectedAffCode = getAffiliateCodeForProduct(product);

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => 
          item.product.id === product.id && 
          JSON.stringify(item.selectedVariant) === JSON.stringify(variant) &&
          item.selectedSize === finalSize &&
          item.selectedColor === finalColor
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          affiliateCode: detectedAffCode || updated[existingIndex].affiliateCode,
        };
        return updated;
      } else {
        return [
          ...prev, 
          { 
            product, 
            quantity, 
            selectedVariant: variant,
            selectedSize: finalSize,
            selectedColor: finalColor,
            selectedImage: finalImage,
            ...(detectedAffCode ? { affiliateCode: detectedAffCode } : {}),
          }
        ];
      }
    });

    const title = language === 'bn' ? product.titleBn : product.titleEn;
    addToast(
      language === 'bn' 
        ? `"${title.substring(0, 24)}..." কার্টে যোগ করা হয়েছে` 
        : `"${title.substring(0, 24)}..." added to cart`,
      'success'
    );
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    addToast(language === 'bn' ? 'আইটেম কার্ট থেকে সরানো হয়েছে' : 'Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (productId: string) => {
    const isSaved = wishlist.includes(productId);
    if (isSaved) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      addToast(language === 'bn' ? 'উইশলিস্ট থেকে সরানো হয়েছে' : 'Removed from wishlist', 'info');
    } else {
      setWishlist((prev) => [...prev, productId]);
      addToast(language === 'bn' ? 'উইশলিস্টে সংরক্ষণ করা হয়েছে' : 'Added to wishlist', 'success');
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed === 'BANGLABAZAR10' || trimmed === 'BANGLA10' || trimmed === 'ONEROOF10' || trimmed === 'ONEROOFMART10') {
      const coupon: Coupon = {
        code: trimmed,
        discountPercent: 10,
        minSpend: 1000,
        description: language === 'bn' ? '10% ফ্ল্যাট ডিসকাউন্ট' : '10% Flat Discount',
      };
      setAppliedCoupon(coupon);
      return { 
        success: true, 
        message: language === 'bn' ? '10% ডিসকাউন্ট কুপন সফলভাবে যুক্ত হয়েছে!' : '10% Discount applied successfully!' 
      };
    } else if (trimmed === 'EID500') {
      const coupon: Coupon = {
        code: 'EID500',
        fixedDiscount: 500,
        minSpend: 3000,
        description: language === 'bn' ? '৳500 ঈদ স্পেশাল ক্যাশব্যাক' : '৳500 Special Eid Cashback',
      };
      setAppliedCoupon(coupon);
      return { 
        success: true, 
        message: language === 'bn' ? '৳500 ছাড় সফলভাবে যুক্ত হয়েছে!' : '৳500 Discount applied!' 
      };
    } else {
      return { 
        success: false, 
        message: language === 'bn' ? 'ভুল কুপন কোড! "BANGLABAZAR10" বা "EID500" ট্রাই করুন' : 'Invalid promo code! Try "BANGLABAZAR10" or "EID500"' 
      };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast(language === 'bn' ? 'কুপন বাতিল করা হয়েছে' : 'Coupon removed', 'info');
  };

  const applyReferralCode = (code: string): { success: boolean; message: string; referrerName?: string } => {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      return { success: false, message: language === 'bn' ? 'রেফারেল কোড লিখুন' : 'Please enter a referral code' };
    }

    if (currentUser) {
      const myCode = (currentUser.referralCode || '').toUpperCase();
      const myPhoneCode = currentUser.phone ? `BB-${currentUser.phone.replace(/\D/g, '').slice(-6)}` : '';
      if (clean === myCode || clean === myPhoneCode) {
        return {
          success: false,
          message: language === 'bn' ? 'আপনি নিজের রেফারেল কোড ব্যবহার করতে পারবেন না!' : 'You cannot use your own referral code!'
        };
      }
    }

    // Match in existing users
    const matched = users.find(
      (u) =>
        (u.referralCode && u.referralCode.toUpperCase() === clean) ||
        (u.phone && `BB-${u.phone.replace(/\D/g, '').slice(-6)}` === clean) ||
        clean === 'BB-637253'
    );

    setActiveReferralCode(clean);
    safeLocalStorage.setItem('oneroof_referrer_code', clean);

    if (matched) {
      return {
        success: true,
        message: language === 'bn' 
          ? `রেফারেল কোড গৃহীত হয়েছে! আমন্ত্রণকারী: ${matched.name}। একাউন্ট খুলেই পাবেন ৫০ টাকা ওয়েলকাম বোনাস!`
          : `Referral code applied! Invited by: ${matched.name}. You will get ৳50 welcome bonus!`,
        referrerName: matched.name
      };
    }

    return {
      success: true,
      message: language === 'bn'
        ? `রেফারেল কোড (${clean}) সক্রিয় হয়েছে! একাউন্ট খুলেই পাবেন ৫০ টাকা ওয়েলকাম বোনাস!`
        : `Referral code (${clean}) applied! You will get ৳50 welcome bonus!`
    };
  };

  const getUserReferralStats = (targetUser?: User | null) => {
    const u = targetUser || currentUser;
    if (!u) {
      return {
        referralCode: 'BB-637253',
        totalReferrals: 0,
        successfulReferrals: 0,
        pendingReferrals: 0,
        totalEarnings: 0,
        referralsList: []
      };
    }
    const code = u.referralCode || generateUserReferralCode(u);
    const list = u.referrals || [];
    const successful = list.filter((r) => r.firstOrderPlaced && r.rewardClaimed).length;
    const pending = list.filter((r) => !r.firstOrderPlaced).length;
    const totalEarnings = successful * 30;

    return {
      referralCode: code,
      totalReferrals: list.length,
      successfulReferrals: successful,
      pendingReferrals: pending,
      totalEarnings,
      referralsList: list
    };
  };

  const getProductShareUrl = (productId: string, referrerCodeOverride?: string): string => {
    const origin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin
        : 'https://banglabazarbd.vercel.app';
    const rawCode =
      referrerCodeOverride ||
      (currentUser ? currentUser.referralCode || generateUserReferralCode(currentUser) : '');
    const cleanCode = rawCode.trim().toUpperCase();
    const base = `${origin}/?product=${encodeURIComponent(productId)}`;
    return cleanCode ? `${base}&aff=${encodeURIComponent(cleanCode)}` : base;
  };

  const getUserAffiliateStats = (targetUser?: User | null): AffiliateStatsSummary => {
    const u = targetUser || currentUser;
    if (!u) {
      return {
        referralCode: 'BB-637253',
        totalSharedOrders: 0,
        pendingOrdersCount: 0,
        creditedOrdersCount: 0,
        cancelledOrDeductedCount: 0,
        pendingCommission: 0,
        creditedCommission: 0,
        deductedCommission: 0,
        entries: [],
      };
    }

    const myCode = (u.referralCode || generateUserReferralCode(u)).trim().toUpperCase();
    const entries: AffiliateOrderSummary[] = [];

    for (const ord of orders) {
      if (!Array.isArray(ord.affiliateCommissions) || ord.affiliateCommissions.length === 0) continue;
      for (const comm of ord.affiliateCommissions) {
        const matchesUser =
          (comm.referrerId && comm.referrerId === u.id) ||
          (comm.referrerCode && comm.referrerCode.trim().toUpperCase() === myCode);
        if (!matchesUser) continue;

        entries.push({
          orderId: ord.id,
          date: ord.date,
          orderStatus: ord.status,
          commissionStatus: comm.status,
          productTitles: comm.productTitles || [],
          productIds: comm.productIds || [],
          itemCount: comm.itemCount || 1,
          commissionBaseAmount: comm.commissionBaseAmount,
          commissionAmount: comm.commissionAmount,
          buyerName: ord.shippingAddress?.fullName || 'গ্রাহক',
          buyerPhone: maskPhoneNumber(ord.customerPhone || ord.shippingAddress?.phone),
          createdAt: comm.createdAt || ord.date,
          creditedAt: comm.creditedAt,
          deductedAt: comm.deductedAt,
        });
      }
    }

    const pendingList = entries.filter((e) => e.commissionStatus === 'pending');
    const creditedList = entries.filter((e) => e.commissionStatus === 'credited');
    const deductedOrCancelledList = entries.filter(
      (e) => e.commissionStatus === 'deducted' || e.commissionStatus === 'cancelled'
    );

    return {
      referralCode: myCode,
      totalSharedOrders: entries.length,
      pendingOrdersCount: pendingList.length,
      creditedOrdersCount: creditedList.length,
      cancelledOrDeductedCount: deductedOrCancelledList.length,
      pendingCommission: roundCurrency(pendingList.reduce((sum, e) => sum + e.commissionAmount, 0)),
      creditedCommission: roundCurrency(creditedList.reduce((sum, e) => sum + e.commissionAmount, 0)),
      deductedCommission: roundCurrency(
        deductedOrCancelledList
          .filter((e) => e.commissionStatus === 'deducted')
          .reduce((sum, e) => sum + e.commissionAmount, 0)
      ),
      entries,
    };
  };

  const addReview = (productId: string, rating: number, comment: string, name: string) => {
    const newRev: Review = {
      id: 'rev-' + Date.now(),
      userName: name || (currentUser ? currentUser.name : 'গ্রাহক (Customer)'),
      rating,
      date: language === 'bn' ? 'আজকে' : 'Today',
      comment,
      verifiedPurchase: true,
    };

    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          const updatedReviews = [newRev, ...prod.reviews];
          const newAvgRating = (
            updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length
          );
          const updatedProd = {
            ...prod,
            reviews: updatedReviews,
            reviewCount: updatedReviews.length,
            rating: Number(newAvgRating.toFixed(1)),
          };
          syncProductToSupabase(updatedProd).catch(() => {});
          return updatedProd;
        }
        return prod;
      })
    );

    addToast(
      language === 'bn' ? 'আপনার রিভিউ সফলভাবে যুক্ত হয়েছে!' : 'Review posted successfully!',
      'success'
    );
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  // Dynamic Shipping Fee Calculation
  const calculateShippingFee = (
    location: 'dhaka' | 'outside' = 'dhaka',
    speed: 'regular' | 'express' = 'regular',
    subtotal: number = cartSubtotal
  ): number => {
    if (cart.length === 0 || subtotal === 0) return 0;

    // 1. Express delivery override
    if (speed === 'express') {
      return Number(siteSettings.shippingFeeExpress ?? 150);
    }

    // 2. Check if product-specific shipping fee is defined for the items in cart
    if (location === 'dhaka') {
      const productInsideFees = cart
        .map((item) => item.product.shippingInside ?? item.product.shippingFee)
        .filter((fee): fee is number => fee !== undefined && fee >= 0);
      if (productInsideFees.length > 0) {
        return Math.max(...productInsideFees);
      }
    } else {
      const productOutsideFees = cart
        .map((item) => item.product.shippingOutside ?? item.product.shippingFee)
        .filter((fee): fee is number => fee !== undefined && fee >= 0);
      if (productOutsideFees.length > 0) {
        return Math.max(...productOutsideFees);
      }
    }

    // 3. Check if all products in cart are marked as free shipping
    const allFreeShipping = cart.every((item) => item.product.isFreeShipping);
    if (allFreeShipping && speed === 'regular') return 0;

    // 4. Check if subtotal qualifies for site-wide free delivery threshold
    if (
      siteSettings.enableFreeShipping !== false &&
      siteSettings.freeShippingThreshold > 0 &&
      subtotal >= siteSettings.freeShippingThreshold
    ) {
      if (speed === 'regular') return 0;
    }

    // 5. Default site settings inside vs outside Dhaka
    if (location === 'dhaka') {
      return Number(siteSettings.shippingFeeInsideDhaka ?? 60);
    } else {
      return Number(siteSettings.shippingFeeOutsideDhaka ?? 120);
    }
  };

  const cartShippingFee = calculateShippingFee('dhaka', 'regular', cartSubtotal);

  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      cartDiscount = Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.fixedDiscount) {
      cartDiscount = appliedCoupon.fixedDiscount;
    }
  }

  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartShippingFee);
  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  const placeOrder = (shippingInfo: any, paymentMethod: any, specifiedShippingFee?: number): Order => {
    const randomOrderNum = Math.floor(10000 + Math.random() * 90000);
    const trackingNum = 'TRK-BD-' + Math.floor(100000 + Math.random() * 900000);
    
    const finalShippingFee = specifiedShippingFee !== undefined ? specifiedShippingFee : cartShippingFee;
    const finalTotal = Math.max(0, cartSubtotal - cartDiscount + finalShippingFee);

    const now = new Date();
    const dateFormatted = language === 'bn' 
      ? `আজ, ${now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })}` 
      : now.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

    // Build 2% product-share affiliate commissions per sharer (multi-buyer unlimited; self-order blocked)
    const nowIso = now.toISOString();
    const buyerEmail = (currentUser?.email || shippingInfo?.email || '').trim().toLowerCase();
    const buyerPhoneDigits = (currentUser?.phone || shippingInfo?.phone || '').replace(/[^0-9]/g, '');

    const groupedByAff = new Map<
      string,
      { sharer?: User; code: string; items: { product: Product; quantity: number; title: string }[] }
    >();

    const resolvedOrderItems: OrderItem[] = cart.map((item) => {
      const affCode = (item.affiliateCode || getAffiliateCodeForProduct(item.product) || '').trim().toUpperCase();
      const itemTitle = language === 'bn' ? item.product.titleBn : item.product.titleEn;

      if (affCode) {
        const sharer = findAffiliateSharer(undefined, affCode, users);
        const sharerEmail = (sharer?.email || '').trim().toLowerCase();
        const sharerPhoneDigits = (sharer?.phone || '').replace(/[^0-9]/g, '');
        const isSelfOrder = Boolean(
          sharer &&
            ((currentUser && sharer.id === currentUser.id) ||
              (buyerEmail && sharerEmail && buyerEmail === sharerEmail) ||
              (buyerPhoneDigits.length >= 10 &&
                sharerPhoneDigits.length >= 10 &&
                buyerPhoneDigits.slice(-10) === sharerPhoneDigits.slice(-10)))
        );
        const isOwnCode = Boolean(
          currentUser?.referralCode && currentUser.referralCode.trim().toUpperCase() === affCode
        );

        if (!isSelfOrder && !isOwnCode) {
          const groupKey = sharer?.id || affCode;
          const existingGroup = groupedByAff.get(groupKey) || {
            sharer,
            code: sharer?.referralCode || affCode,
            items: [],
          };
          existingGroup.items.push({ product: item.product, quantity: item.quantity, title: itemTitle });
          groupedByAff.set(groupKey, existingGroup);
        }
      }

      return {
        productId: item.product.id,
        sku: item.product.sku || (item.product.id ? `SBP-${item.product.id.replace(/\D/g, '') || item.product.id}` : undefined),
        title: itemTitle,
        price: item.product.price,
        quantity: item.quantity,
        image: item.selectedImage || item.product.images?.[0] || '',
        variant: item.selectedVariant,
        selectedSize: item.selectedSize || item.selectedVariant?.['size'] || item.selectedVariant?.['Size'],
        selectedColor: item.selectedColor || item.selectedVariant?.['color'] || item.selectedVariant?.['Color'],
        ...(affCode ? { affiliateCode: affCode } : {}),
      };
    });

    const affiliateCommissions: OrderAffiliateCommission[] = [];
    groupedByAff.forEach((group) => {
      const baseAmount = group.items.reduce(
        (sum, entry) => sum + Number(entry.product.price || 0) * Number(entry.quantity || 1),
        0
      );
      const commissionAmount = roundCurrency(baseAmount * 0.02);
      if (commissionAmount > 0) {
        affiliateCommissions.push({
          id: `AFC-${randomOrderNum}-${Math.floor(100 + Math.random() * 900)}`,
          referrerId: group.sharer?.id || '',
          referrerCode: group.code,
          referrerName: group.sharer?.name,
          referrerPhone: group.sharer?.phone,
          productIds: Array.from(new Set(group.items.map((i) => i.product.id))),
          productTitles: group.items.map((i) => i.title),
          itemCount: group.items.reduce((s, i) => s + i.quantity, 0),
          commissionBaseAmount: baseAmount,
          commissionPercent: 2,
          commissionAmount,
          status: 'pending',
          createdAt: nowIso,
        });
      }
    });

    const newOrder: Order = {
      id: `OR-${randomOrderNum}`,
      trackingNumber: trackingNum,
      date: dateFormatted,
      status: 'placed',
      items: resolvedOrderItems,
      subtotal: cartSubtotal,
      shippingFee: finalShippingFee,
      discount: cartDiscount,
      total: finalTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      shippingAddress: shippingInfo,
      userId: currentUser?.id,
      customerEmail: currentUser?.email || shippingInfo?.email || '',
      customerPhone: currentUser?.phone || shippingInfo?.phone || '',
      isOfflineOrder: typeof navigator !== 'undefined' && !navigator.onLine,
      syncedToCloud: typeof navigator !== 'undefined' ? navigator.onLine : false,
      ...(affiliateCommissions.length > 0 ? { affiliateCommissions } : {}),
    };

    // Handle customer wallet balance deduction and first-order referral & welcome bonuses
    const isFirstOrder = Boolean(
      currentUser && 
      (currentUser.hasCompletedFirstOrder !== true || orders.filter((o) => o.userId === currentUser.id).length === 0)
    );

    if (currentUser) {
      const userBalanceBeforeBonus = paymentMethod === 'wallet'
        ? Math.max(0, roundCurrency((currentUser.balance || 0) - finalTotal))
        : roundCurrency(currentUser.balance || 0);

      if (isFirstOrder) {
        // 1. UNLOCK ৳50 WELCOME BONUS FOR CUSTOMER
        const welcomeBonusAmount = 50;
        const randomBonusTxnNum = Math.floor(10000 + Math.random() * 90000);
        const welcomeBonusTxn: WalletTransaction = {
          id: `TXN-${randomBonusTxnNum}`,
          userId: currentUser.id,
          userName: currentUser.name,
          userPhone: currentUser.phone,
          type: 'bonus',
          amount: welcomeBonusAmount,
          date: dateFormatted,
          status: 'completed',
          method: 'system',
          note: '১ম অর্ডার সম্পন্নের ৫০ টাকা ওয়েলকাম বোনাস সক্রিয় (পরবর্তী ২য় অর্ডারে ব্যবহারযোগ্য)',
        };

        const currentTxns = paymentMethod === 'wallet'
          ? [
              {
                id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
                userId: currentUser.id,
                userName: currentUser.name,
                userPhone: currentUser.phone,
                type: 'order_payment' as const,
                amount: finalTotal,
                date: dateFormatted,
                status: 'completed' as const,
                method: 'wallet' as const,
                note: `অর্ডার #${newOrder.id} মূল্য পরিশোধ (অ্যাকাউন্ট ব্যালেন্স)`,
              },
              welcomeBonusTxn,
              ...(currentUser.walletTransactions || [])
            ]
          : [welcomeBonusTxn, ...(currentUser.walletTransactions || [])];

        const userWithBonus: User = {
          ...currentUser,
          balance: roundCurrency(userBalanceBeforeBonus + welcomeBonusAmount),
          pendingWelcomeBonus: 0,
          hasCompletedFirstOrder: true,
          firstOrderBonusUnlocked: true,
          walletTransactions: currentTxns
        };

        setCurrentUser(userWithBonus);
        setUsers((prev) => prev.map((u) => (u.id === userWithBonus.id ? userWithBonus : u)));
        setAllWalletTransactions((prev) => [welcomeBonusTxn, ...prev]);
        syncUserToSupabase(userWithBonus);

        // 2. CREDIT ৳30 REFERRAL BONUS TO THE FRIEND WHO INVITED THEM
        if (currentUser.referredBy) {
          const refCode = currentUser.referredBy.trim().toUpperCase();
          const referrerUser = users.find(
            (u) =>
              u.id !== currentUser.id &&
              ((u.referralCode && u.referralCode.toUpperCase() === refCode) ||
               (u.phone && `BB-${u.phone.replace(/\D/g, '').slice(-6)}` === refCode) ||
               refCode === 'BB-637253')
          );

          if (referrerUser) {
            const refTxnNum = Math.floor(10000 + Math.random() * 90000);
            const referrerBonusTxn: WalletTransaction = {
              id: `TXN-${refTxnNum}`,
              userId: referrerUser.id,
              userName: referrerUser.name,
              userPhone: referrerUser.phone,
              type: 'bonus',
              amount: 30,
              date: dateFormatted,
              status: 'completed',
              method: 'system',
              note: `রেফারেল বোনাস: ${currentUser.name} ১ম অর্ডার করায় ৳৩০ বোনাস অর্জিত`,
            };

            const existingReferrals = referrerUser.referrals || [];
            let updatedReferrals = existingReferrals.map((r) => {
              if (r.friendId === currentUser.id || r.friendName === currentUser.name) {
                return { ...r, firstOrderPlaced: true, rewardClaimed: true };
              }
              return r;
            });

            const alreadyInList = updatedReferrals.some((r) => r.friendId === currentUser.id);
            if (!alreadyInList) {
              updatedReferrals = [
                {
                  friendId: currentUser.id,
                  friendName: currentUser.name,
                  friendPhone: maskPhoneNumber(currentUser.phone),
                  date: dateFormatted,
                  firstOrderPlaced: true,
                  rewardClaimed: true,
                  bonusAmount: 30
                },
                ...updatedReferrals
              ];
            }

            const updatedReferrer: User = {
              ...referrerUser,
              balance: (referrerUser.balance || 0) + 30,
              referrals: updatedReferrals,
              walletTransactions: [referrerBonusTxn, ...(referrerUser.walletTransactions || [])]
            };

            setUsers((prev) => prev.map((u) => (u.id === updatedReferrer.id ? updatedReferrer : u)));
            setAllWalletTransactions((prev) => [referrerBonusTxn, ...prev]);
            syncUserToSupabase(updatedReferrer);
          }
        }

        addToast(
          language === 'bn'
            ? '🎉 অভিনন্দন! ১ম অর্ডার কনফার্ম হয়েছে এবং ৫০ টাকা ওয়েলকাম বোনাস আপনার ওয়ালেটে যোগ হয়েছে! ২য় অর্ডারে এই টাকা দিয়ে সরাসরি অর্ডার করতে পারবেন।'
            : '🎉 Congratulations! Your 1st order confirmed and ৳50 Welcome Bonus is unlocked in your wallet for next orders!',
          'success'
        );
      } else if (paymentMethod === 'wallet') {
        // Regular wallet payment deduction for non-first orders
        if (roundCurrency(currentUser.balance || 0) >= finalTotal) {
          const randomTxnNum = Math.floor(10000 + Math.random() * 90000);
          const walletPaymentTxn: WalletTransaction = {
            id: `TXN-${randomTxnNum}`,
            userId: currentUser.id,
            userName: currentUser.name,
            userPhone: currentUser.phone,
            type: 'order_payment',
            amount: finalTotal,
            date: dateFormatted,
            status: 'completed',
            method: 'wallet',
            note: `অর্ডার #${newOrder.id} মূল্য পরিশোধ (অ্যাকাউন্ট ব্যালেন্স)`,
          };

          const updatedUser: User = {
            ...currentUser,
            balance: userBalanceBeforeBonus,
            walletTransactions: [walletPaymentTxn, ...(currentUser.walletTransactions || [])],
          };

          setCurrentUser(updatedUser);
          setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
          setAllWalletTransactions((prev) => [walletPaymentTxn, ...prev]);
          syncUserToSupabase(updatedUser);
        }
      }
    }

    const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    setOrders((prev) => {
      const next = [newOrder, ...prev];
      safeLocalStorage.setItem('oneroof_orders', JSON.stringify(next));
      idbSet('oneroof_cached_orders', next).catch(() => {});
      return next;
    });
    setLastPlacedOrder(newOrder);

    if (isOffline) {
      savePendingOfflineOrder(newOrder);
      addToast(
        language === 'bn'
          ? 'অফলাইনে অর্ডার সংরক্ষিত হয়েছে! ইন্টারনেট সংযুক্ত হলে স্বয়ংক্রিয়ভাবে সার্ভারে সিঙ্ক হবে।'
          : 'Order saved offline! It will automatically sync when online.',
        'info'
      );
    } else {
      syncOrderToSupabase(newOrder)
        .then((ok) => {
          if (!ok) savePendingOfflineOrder(newOrder);
        })
        .catch(() => {
          savePendingOfflineOrder(newOrder);
        });
      addToast(
        language === 'bn'
          ? 'ধন্যবাদ! আপনার অর্ডার সফলভাবে গ্রহণ করা হয়েছে।'
          : 'Thank you! Your order has been placed successfully.',
        'success'
      );
    }

    clearCart();
    setAppliedCoupon(null);
    setCurrentPage('order-success');
    return newOrder;
  };

  const loginUser = (identifier: string, password?: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanDigits = identifier.replace(/[^0-9]/g, '');

    const user = users.find(u => {
      const uEmail = (u.email || '').trim().toLowerCase();
      const uPhone = (u.phone || '').trim();
      const uPhoneDigits = uPhone.replace(/[^0-9]/g, '');

      // Match email directly
      if (uEmail && uEmail === cleanId) return true;
      // Match phone directly
      if (uPhone && uPhone.toLowerCase() === cleanId) return true;
      // Match phone digits (e.g., 01712-345678 vs 01712345678)
      if (cleanDigits.length >= 10 && uPhoneDigits.length >= 10 && uPhoneDigits.endsWith(cleanDigits.slice(-10))) {
        return true;
      }
      return false;
    });

    if (!user) {
      addToast(
        language === 'bn' 
          ? 'এই ইমেইল বা মোবাইল নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি!' 
          : 'No account found with this email or mobile number!', 
        'error'
      );
      return false;
    }
    
    if (password && user.password && user.password !== password) {
      addToast(language === 'bn' ? 'ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।' : 'Incorrect password! Please try again.', 'error');
      return false;
    }

    const isOwner = isUserAdmin(user);
    if (!isOwner && user.accountStatus === 'blocked') {
      addToast(
        language === 'bn'
          ? 'আপনার অ্যাকাউন্টটি অ্যাডমিন কর্তৃক সাময়িকভাবে স্থগিত করা হয়েছে। সহায়তার জন্য যোগাযোগ করুন।'
          : 'Your account has been suspended by admin.',
        'error'
      );
      return false;
    }

    const userToSet = isOwner && user.role !== 'admin' ? { ...user, role: 'admin' as const } : user;
    setCurrentUser(userToSet);
    if (isOwner || userToSet.role === 'admin') {
      setIsAdminAuthenticated(true);
      safeSessionStorage.setItem('oneroof_admin_auth', 'true');
    }
    setIsAuthModalOpen(false);
    addToast(
      language === 'bn' 
        ? `স্বাগতম, ${user.name}! সফলভাবে লগইন হয়েছে।` 
        : `Welcome, ${user.name}! Logged in successfully.`, 
      'success'
    );
    return true;
  };

  const registerUser = (userData: Partial<User>): boolean => {
    const cleanEmail = userData.email?.trim().toLowerCase() || '';
    const cleanPhone = userData.phone?.trim() || '';
    const cleanDigits = cleanPhone.replace(/[^0-9]/g, '');

    // Ensure at least one identifier is provided (either phone or email)
    if (!cleanEmail && cleanDigits.length < 10) {
      addToast(
        language === 'bn' 
          ? 'মোবাইল নম্বর অথবা ইমেইল — যেকোনো একটি অবশ্যই প্রদান করতে হবে।' 
          : 'Please provide either a mobile number or an email address.', 
        'error'
      );
      return false;
    }

    // Validate uniqueness if email provided
    if (cleanEmail) {
      const existingEmail = users.find(u => (u.email || '').trim().toLowerCase() === cleanEmail);
      if (existingEmail) {
        addToast(
          language === 'bn' 
            ? 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে! লগইন করার চেষ্টা করুন।' 
            : 'An account with this email already exists! Please log in.', 
          'error'
        );
        return false;
      }
    }

    // Validate phone uniqueness if phone provided
    if (cleanDigits.length >= 10) {
      const existingPhone = users.find(u => (u.phone || '').replace(/[^0-9]/g, '').endsWith(cleanDigits.slice(-10)));
      if (existingPhone) {
        addToast(
          language === 'bn' 
            ? 'এই মোবাইল নম্বর দিয়ে আগেই অ্যাকাউন্ট খোলা হয়েছে! লগইন করার চেষ্টা করুন।' 
            : 'An account with this phone number already exists! Please log in.', 
          'error'
        );
        return false;
      }
    }

    const defaultAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
    
    // Auto-promote owner email/phone to admin
    const isAdmin = (Boolean(cleanEmail) && (cleanEmail === SECRET_ADMIN_CONFIG.email || cleanEmail === SECRET_ADMIN_CONFIG.secondaryEmail)) || 
                    (cleanDigits.length >= 10 && cleanDigits.endsWith(SECRET_ADMIN_CONFIG.phone)) || 
                    userData.role === 'admin';

    const fullAddrString = [userData.village, userData.thana, userData.district, userData.division]
      .filter(Boolean)
      .join(', ');

    // Determine referral code (either explicitly passed or from URL/active state)
    const rawRefCode = (userData.referredBy || (userData as any).referralCodeInput || activeReferralCode || safeLocalStorage.getItem('oneroof_referrer_code') || '').trim().toUpperCase();
    
    let matchedReferrer: User | undefined;
    if (rawRefCode) {
      matchedReferrer = users.find(
        (u) =>
          (u.referralCode && u.referralCode.toUpperCase() === rawRefCode) ||
          (u.phone && `BB-${u.phone.replace(/\D/g, '').slice(-6)}` === rawRefCode) ||
          rawRefCode === 'BB-637253'
      );
    }

    const newUserId = `user-${Date.now()}`;
    const myReferralCode = generateUserReferralCode({ id: newUserId, phone: cleanPhone, name: userData.name });

    const newUser: User = {
      id: newUserId,
      name: userData.name?.trim() || '',
      email: cleanEmail,
      phone: cleanPhone,
      password: userData.password || '',
      role: isAdmin ? 'admin' : 'user',
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      division: userData.division?.trim() || '',
      district: userData.district?.trim() || '',
      thana: userData.thana?.trim() || '',
      village: userData.village?.trim() || '',
      avatar: userData.avatar || defaultAvatar,
      balance: 0,
      pendingWelcomeBonus: 50, // ৳50 Welcome bonus unlocked upon 1st order
      hasCompletedFirstOrder: false,
      firstOrderBonusUnlocked: false,
      referralCode: myReferralCode,
      referredBy: matchedReferrer ? (matchedReferrer.referralCode || rawRefCode) : (rawRefCode || undefined),
      referrals: [],
      walletTransactions: [],
      addresses: userData.addresses || (fullAddrString ? [
        {
          id: `addr-${Date.now()}`,
          title: language === 'bn' ? 'মূল ঠিকানা (Default Address)' : 'Primary Address',
          recipientName: userData.name?.trim() || '',
          phone: cleanPhone,
          division: userData.division?.trim() || '',
          district: userData.district?.trim() || '',
          thana: userData.thana?.trim() || '',
          address: userData.village?.trim() || fullAddrString,
          isDefault: true
        }
      ] : [])
    };

    // If invited by a friend, record the referral in friend's profile
    if (matchedReferrer) {
      const now = new Date();
      const dateFormatted = language === 'bn' 
        ? `আজ, ${now.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short' })}` 
        : now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

      const newReferralRecord: ReferralRecord = {
        friendId: newUser.id,
        friendName: newUser.name,
        friendPhone: maskPhoneNumber(newUser.phone),
        date: dateFormatted,
        firstOrderPlaced: false,
        rewardClaimed: false,
        bonusAmount: 30
      };

      const updatedReferrer: User = {
        ...matchedReferrer,
        referrals: [newReferralRecord, ...(matchedReferrer.referrals || [])]
      };

      setUsers(prev => prev.map(u => u.id === updatedReferrer.id ? updatedReferrer : u));
      syncUserToSupabase(updatedReferrer);
    }

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    syncUserToSupabase(newUser);
    setIsAuthModalOpen(false);

    addToast(
      language === 'bn' 
        ? `অভিনন্দন ${newUser.name}! অ্যাকাউন্ট সম্পন্ন হয়েছে এবং ৫০ টাকা ওয়েলকাম বোনাস সংরক্ষিত হয়েছে! ১ম অর্ডার কনফার্ম হলেই ওয়ালেটে ৫০ টাকা যোগ হবে এবং ২য় অর্ডারে ব্যবহার করতে পারবেন।` 
        : `Congratulations ${newUser.name}! Account created and ৳50 Welcome Bonus reserved! It activates upon your 1st order.`, 
      'success'
    );
    return true;
  };

  const updateUserProfile = (userData: Partial<User>): boolean => {
    if (!currentUser) return false;

    if (userData.phone !== undefined) {
      const cleanPhone = userData.phone.trim();
      if (!cleanPhone) {
        addToast(
          language === 'bn' ? 'দয়া করে একটি সঠিক মোবাইল নম্বর লিখুন' : 'Please enter a valid mobile number',
          'error'
        );
        return false;
      }
      const duplicate = users.find(
        (u) => u.id !== currentUser.id && u.phone && u.phone.trim() === cleanPhone
      );
      if (duplicate) {
        addToast(
          language === 'bn'
            ? 'এই মোবাইল নম্বরটি অন্য একটি অ্যাকাউন্টে ব্যবহৃত হচ্ছে'
            : 'This mobile number is already registered to another account',
          'error'
        );
        return false;
      }
    }

    const updatedUser: User = {
      ...currentUser,
      ...userData,
      name: userData.name !== undefined ? userData.name.trim() : currentUser.name,
      phone: userData.phone !== undefined ? userData.phone.trim() : currentUser.phone,
      email: userData.email !== undefined ? userData.email.trim() : currentUser.email,
    };

    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    syncUserToSupabase(updatedUser);
    addToast(language === 'bn' ? 'প্রোফাইল সফলভাবে আপডেট করা হয়েছে' : 'Profile updated successfully', 'success');
    return true;
  };

  const addDeliveryAddress = (addr: Omit<DeliveryAddress, 'id'>) => {
    if (!currentUser) return;
    const existing = currentUser.addresses || [];
    const shouldBeDefault = addr.isDefault || existing.length === 0;
    const newAddr: DeliveryAddress = {
      ...addr,
      id: `addr-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      isDefault: shouldBeDefault,
    };
    const nextAddresses = shouldBeDefault
      ? [newAddr, ...existing.map((a) => ({ ...a, isDefault: false }))]
      : [...existing, newAddr];

    const updatedUser: User = {
      ...currentUser,
      addresses: nextAddresses,
      ...(shouldBeDefault && addr.division ? { division: addr.division } : {}),
      ...(shouldBeDefault && addr.district ? { district: addr.district } : {}),
      ...(shouldBeDefault && addr.thana ? { thana: addr.thana } : {}),
      ...(shouldBeDefault && addr.address ? { village: addr.address } : {}),
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    syncUserToSupabase(updatedUser);
    addToast(language === 'bn' ? 'নতুন ডেলিভারি ঠিকানা যোগ করা হয়েছে' : 'New delivery address added', 'success');
  };

  const updateDeliveryAddress = (id: string, addr: Partial<DeliveryAddress>) => {
    if (!currentUser) return;
    const existing = currentUser.addresses || [];
    const makeDefault = addr.isDefault === true;
    const nextAddresses = existing.map((item) => {
      if (item.id === id) {
        return { ...item, ...addr };
      }
      return makeDefault ? { ...item, isDefault: false } : item;
    });

    const edited = nextAddresses.find((a) => a.id === id);
    const updatedUser: User = {
      ...currentUser,
      addresses: nextAddresses,
      ...(edited?.isDefault && edited.division ? { division: edited.division } : {}),
      ...(edited?.isDefault && edited.district ? { district: edited.district } : {}),
      ...(edited?.isDefault && edited.thana ? { thana: edited.thana } : {}),
      ...(edited?.isDefault && edited.address ? { village: edited.address } : {}),
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    syncUserToSupabase(updatedUser);
    addToast(language === 'bn' ? 'ডেলিভারি ঠিকানা আপডেট করা হয়েছে' : 'Delivery address updated', 'success');
  };

  const deleteDeliveryAddress = (id: string) => {
    if (!currentUser) return;
    const existing = currentUser.addresses || [];
    const filtered = existing.filter((a) => a.id !== id);
    if (filtered.length > 0 && !filtered.some((a) => a.isDefault)) {
      filtered[0] = { ...filtered[0], isDefault: true };
    }
    const updatedUser: User = {
      ...currentUser,
      addresses: filtered,
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    syncUserToSupabase(updatedUser);
    addToast(language === 'bn' ? 'ডেলিভারি ঠিকানা মুছে ফেলা হয়েছে' : 'Delivery address deleted', 'info');
  };

  const setDefaultDeliveryAddress = (id: string) => {
    if (!currentUser) return;
    const existing = currentUser.addresses || [];
    const target = existing.find((a) => a.id === id);
    if (!target) return;
    const nextAddresses = existing.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    const updatedUser: User = {
      ...currentUser,
      addresses: nextAddresses,
      ...(target.division ? { division: target.division } : {}),
      ...(target.district ? { district: target.district } : {}),
      ...(target.thana ? { thana: target.thana } : {}),
      ...(target.address ? { village: target.address } : {}),
    };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    syncUserToSupabase(updatedUser);
    addToast(
      language === 'bn' ? `"${target.title}" ডিফল্ট ঠিকানা হিসেবে সেট হয়েছে` : `"${target.title}" set as default address`,
      'success'
    );
  };

  const logoutUser = () => {
    setCurrentUser(null);
    safeLocalStorage.removeItem('oneroof_current_user');
    addToast(
      language === 'bn' ? 'লগআউট সম্পন্ন হয়েছে' : 'Logged out',
      'info'
    );
  };

  // Customer Wallet Operations (ডিপোজিট ও উত্তোলন)
  const depositToWallet = async (
    amount: number, 
    method: WalletPaymentMethod, 
    senderNumber?: string, 
    trxId?: string, 
    note?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      addToast(language === 'bn' ? 'অনুগ্রহ করে প্রথমে লগইন করুন' : 'Please login first', 'error');
      return { success: false, message: 'Not logged in' };
    }

    if (amount <= 0 || isNaN(amount)) {
      addToast(language === 'bn' ? 'সঠিক টাকার পরিমাণ লিখুন' : 'Please enter valid amount', 'error');
      return { success: false, message: 'Invalid amount' };
    }

    const randomTxnNum = Math.floor(10000 + Math.random() * 90000);
    const now = new Date();
    const dateFormatted = language === 'bn' 
      ? `আজ, ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}` 
      : now.toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

    const newTxn: WalletTransaction = {
      id: `TXN-${randomTxnNum}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'deposit',
      amount,
      date: dateFormatted,
      status: 'completed', // Instant deposit credit for immediate user satisfaction
      method,
      accountNumber: senderNumber || currentUser.phone,
      trxId: trxId || `TRX${Math.floor(100000 + Math.random() * 900000)}`,
      note: note || `${getPaymentMethodDisplayLabel(method, 'bn')} ডিপোজিট`,
    };

    const currentBal = roundCurrency(currentUser.balance || 0);
    const newBalance = roundCurrency(currentBal + amount);
    const userTxns = [newTxn, ...(currentUser.walletTransactions || [])];
    const updatedUser: User = {
      ...currentUser,
      balance: newBalance,
      walletTransactions: userTxns,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setAllWalletTransactions((prev) => [newTxn, ...prev]);
    syncUserToSupabase(updatedUser);

    addToast(
      language === 'bn'
        ? `৳${amount} সফলভাবে ডিপোজিট হয়েছে! বর্তমান ব্যালেন্স: ৳${newBalance}`
        : `Successfully deposited ৳${amount}! Current balance: ৳${newBalance}`,
      'success'
    );

    return { success: true, message: 'Deposit successful' };
  };

  const withdrawFromWallet = async (
    amount: number, 
    method: WalletPaymentMethod, 
    accountNumber: string, 
    bankDetails?: any
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      addToast(language === 'bn' ? 'অনুগ্রহ করে প্রথমে লগইন করুন' : 'Please login first', 'error');
      return { success: false, message: 'Not logged in' };
    }

    const currentBal = currentUser.balance || 0;
    if (amount <= 0 || isNaN(amount)) {
      addToast(language === 'bn' ? 'সঠিক উত্তোলনের পরিমাণ লিখুন' : 'Please enter valid amount', 'error');
      return { success: false, message: 'Invalid amount' };
    }

    if (amount < 50) {
      addToast(language === 'bn' ? 'সর্বনিম্ন উত্তোলনের পরিমাণ ৫০ টাকা' : 'Minimum withdrawal is ৳50', 'error');
      return { success: false, message: 'Amount below minimum' };
    }

    if (amount > currentBal) {
      addToast(
        language === 'bn' 
          ? `অপর্যাপ্ত ব্যালেন্স! আপনার বর্তমান ব্যালেন্স ৳${currentBal}` 
          : `Insufficient balance! Your balance is ৳${currentBal}`,
        'error'
      );
      return { success: false, message: 'Insufficient balance' };
    }

    if (!accountNumber || accountNumber.trim().length < 8) {
      addToast(
        language === 'bn' ? 'সঠিক অ্যাকাউন্ট বা মোবাইল নম্বর দিন' : 'Please enter valid account/phone number',
        'error'
      );
      return { success: false, message: 'Invalid account number' };
    }

    const randomTxnNum = Math.floor(10000 + Math.random() * 90000);
    const now = new Date();
    const dateFormatted = language === 'bn' 
      ? `আজ, ${now.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}` 
      : now.toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

    const newTxn: WalletTransaction = {
      id: `WTH-${randomTxnNum}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      type: 'withdraw',
      amount,
      date: dateFormatted,
      status: 'pending', // Pending admin disbursement
      method,
      accountNumber: accountNumber.trim(),
      bankDetails,
      note: `${getPaymentMethodDisplayLabel(method, 'bn', bankDetails?.bankName)} একাউন্টে উত্তোলন অনুরোধ`,
    };

    const newBalance = currentBal - amount;
    const userTxns = [newTxn, ...(currentUser.walletTransactions || [])];
    const updatedUser: User = {
      ...currentUser,
      balance: newBalance,
      walletTransactions: userTxns,
    };

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setAllWalletTransactions((prev) => [newTxn, ...prev]);
    syncUserToSupabase(updatedUser);

    addToast(
      language === 'bn'
        ? `৳${amount} উত্তোলনের অনুরোধ জমা হয়েছে! শীঘ্রই আপনার নম্বরে পাঠানো হবে।`
        : `Withdrawal request of ৳${amount} submitted! Processing shortly.`,
      'success'
    );

    return { success: true, message: 'Withdrawal submitted' };
  };

  const updateWalletTransactionStatus = (
    txnId: string, 
    status: WalletTransactionStatus, 
    reason?: string
  ) => {
    setAllWalletTransactions((prev) =>
      prev.map((txn) => {
        if (txn.id === txnId) {
          return {
            ...txn,
            status,
            rejectionReason: reason || txn.rejectionReason,
          };
        }
        return txn;
      })
    );

    // If withdrawal rejected, refund back to user
    const targetTxn = allWalletTransactions.find((t) => t.id === txnId);
    if (targetTxn && targetTxn.type === 'withdraw' && status === 'rejected' && targetTxn.status !== 'rejected') {
      const userToRefund = users.find((u) => u.id === targetTxn.userId);
      if (userToRefund) {
        const refundedBalance = (userToRefund.balance || 0) + targetTxn.amount;
        const refundTxn: WalletTransaction = {
          id: `REF-${Math.floor(10000 + Math.random() * 90000)}`,
          userId: userToRefund.id,
          userName: userToRefund.name,
          userPhone: userToRefund.phone,
          type: 'refund',
          amount: targetTxn.amount,
          date: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
          status: 'completed',
          method: 'system',
          note: `উত্তোলন বাতিলজনিত রিফান্ড (${reason || 'বাতিল'})`,
        };
        const updatedUser: User = {
          ...userToRefund,
          balance: refundedBalance,
          walletTransactions: [
            refundTxn,
            ...(userToRefund.walletTransactions || []).map((t) =>
              t.id === txnId ? { ...t, status: 'rejected' as const, rejectionReason: reason } : t
            ),
          ],
        };
        setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        if (currentUser?.id === updatedUser.id) {
          setCurrentUser(updatedUser);
        }
        syncUserToSupabase(updatedUser);
      }
    } else if (targetTxn) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id === targetTxn.userId) {
            const updated = {
              ...u,
              walletTransactions: (u.walletTransactions || []).map((t) =>
                t.id === txnId ? { ...t, status, rejectionReason: reason } : t
              ),
            };
            if (currentUser?.id === updated.id) {
              setCurrentUser(updated);
            }
            return updated;
          }
          return u;
        })
      );
    }

    addToast(
      language === 'bn' 
        ? `লেনদেন #${txnId} স্ট্যাটাস ${status === 'completed' ? 'অনুমোদিত' : 'বাতিল'} হয়েছে` 
        : `Transaction #${txnId} status updated to ${status}`,
      'info'
    );
  };

  const adminAdjustUserBalance = (
    userId: string, 
    amount: number, 
    type: 'credit' | 'debit', 
    note: string
  ) => {
    const user = users.find((u) => u.id === userId);
    if (!user) {
      addToast('গ্রাহক পাওয়া যায়নি', 'error');
      return;
    }

    const currentBal = user.balance || 0;
    const newBal = type === 'credit' ? currentBal + amount : Math.max(0, currentBal - amount);

    const randomTxnNum = Math.floor(10000 + Math.random() * 90000);
    const newTxn: WalletTransaction = {
      id: `ADJ-${randomTxnNum}`,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      type: 'admin_adjustment',
      amount,
      date: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      status: 'completed',
      method: 'system',
      note: note || (type === 'credit' ? 'এডমিন কর্তৃক ব্যালেন্স যোগ' : 'এডমিন কর্তৃক ব্যালেন্স কর্তন'),
    };

    const updatedUser: User = {
      ...user,
      balance: newBal,
      walletTransactions: [newTxn, ...(user.walletTransactions || [])],
    };

    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setAllWalletTransactions((prev) => [newTxn, ...prev]);
    if (currentUser?.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    syncUserToSupabase(updatedUser);

    addToast(
      language === 'bn'
        ? `${user.name}-এর একাউন্টে ৳${amount} ${type === 'credit' ? 'যোগ' : 'কর্তন'} হয়েছে! বর্তমান: ৳${newBal}`
        : `Adjusted ৳${amount} for ${user.name}! Current: ৳${newBal}`,
      'success'
    );
  };

  // Admin Customer Account Management Actions
  const adminCreateUser = (userData: Partial<User>): boolean => {
    const cleanEmail = userData.email?.trim().toLowerCase() || '';
    const cleanPhone = userData.phone?.trim() || '';
    const cleanDigits = cleanPhone.replace(/[^0-9]/g, '');

    if (!userData.name?.trim()) {
      addToast('কাস্টমারের নাম লিখুন', 'error');
      return false;
    }
    if (!cleanEmail && cleanDigits.length < 10) {
      addToast('সঠিক মোবাইল নম্বর বা ইমেইল দিন', 'error');
      return false;
    }
    if (cleanEmail && users.some((u) => (u.email || '').trim().toLowerCase() === cleanEmail)) {
      addToast('এই ইমেইলে আগেই অ্যাকাউন্ট রয়েছে', 'error');
      return false;
    }
    if (
      cleanDigits.length >= 10 &&
      users.some((u) => (u.phone || '').replace(/[^0-9]/g, '').endsWith(cleanDigits.slice(-10)))
    ) {
      addToast('এই মোবাইল নম্বরে আগেই অ্যাকাউন্ট রয়েছে', 'error');
      return false;
    }

    const newUserId = `user-${Date.now()}`;
    const myReferralCode = generateUserReferralCode({
      id: newUserId,
      phone: cleanPhone,
      name: userData.name,
    });
    const fullAddr = [userData.village, userData.thana, userData.district, userData.division]
      .filter(Boolean)
      .join(', ');

    const newUser: User = {
      id: newUserId,
      name: userData.name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: userData.password || '123456',
      role: userData.role === 'admin' ? 'admin' : 'user',
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      adminNote: userData.adminNote?.trim() || '',
      division: userData.division?.trim() || '',
      district: userData.district?.trim() || '',
      thana: userData.thana?.trim() || '',
      village: userData.village?.trim() || '',
      avatar:
        userData.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      balance: Number(userData.balance) || 0,
      pendingWelcomeBonus: 50,
      hasCompletedFirstOrder: false,
      firstOrderBonusUnlocked: false,
      referralCode: myReferralCode,
      referrals: [],
      walletTransactions: [],
      addresses: fullAddr
        ? [
            {
              id: `addr-${Date.now()}`,
              title: 'মূল ঠিকানা',
              recipientName: userData.name.trim(),
              phone: cleanPhone,
              division: userData.division?.trim() || '',
              district: userData.district?.trim() || '',
              thana: userData.thana?.trim() || '',
              address: userData.village?.trim() || fullAddr,
              isDefault: true,
            },
          ]
        : [],
    };

    setUsers((prev) => [newUser, ...prev]);
    syncUserToSupabase(newUser);
    addToast(`নতুন কাস্টমার অ্যাকাউন্ট "${newUser.name}" তৈরি হয়েছে!`, 'success');
    return true;
  };

  const adminUpdateUser = (userId: string, updates: Partial<User>): boolean => {
    const target = users.find((u) => u.id === userId);
    if (!target) {
      addToast('কাস্টমার পাওয়া যায়নি', 'error');
      return false;
    }

    if (updates.email !== undefined) {
      const cleanEmail = updates.email.trim().toLowerCase();
      if (
        cleanEmail &&
        users.some((u) => u.id !== userId && (u.email || '').trim().toLowerCase() === cleanEmail)
      ) {
        addToast('এই ইমেইল অন্য অ্যাকাউন্টে ব্যবহৃত হচ্ছে', 'error');
        return false;
      }
    }

    if (updates.phone !== undefined) {
      const cleanDigits = updates.phone.replace(/[^0-9]/g, '');
      if (
        cleanDigits.length >= 10 &&
        users.some(
          (u) =>
            u.id !== userId &&
            (u.phone || '').replace(/[^0-9]/g, '').endsWith(cleanDigits.slice(-10))
        )
      ) {
        addToast('এই মোবাইল নম্বর অন্য অ্যাকাউন্টে ব্যবহৃত হচ্ছে', 'error');
        return false;
      }
    }

    const updatedUser: User = {
      ...target,
      ...updates,
      email: updates.email !== undefined ? updates.email.trim().toLowerCase() : target.email,
      phone: updates.phone !== undefined ? updates.phone.trim() : target.phone,
      name: updates.name !== undefined ? updates.name.trim() : target.name,
    };

    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
    }
    syncUserToSupabase(updatedUser);
    addToast(`${updatedUser.name}-এর অ্যাকাউন্ট তথ্য আপডেট হয়েছে!`, 'success');
    return true;
  };

  const adminToggleUserBlock = (userId: string): boolean => {
    const target = users.find((u) => u.id === userId);
    if (!target) return false;
    if (isUserAdmin(target)) {
      addToast('মূল অ্যাডমিন অ্যাকাউন্ট স্থগিত করা যাবে না', 'error');
      return false;
    }
    const nextStatus: 'active' | 'blocked' =
      target.accountStatus === 'blocked' ? 'active' : 'blocked';
    const updatedUser: User = { ...target, accountStatus: nextStatus };
    setUsers((prev) => prev.map((u) => (u.id === userId ? updatedUser : u)));
    if (currentUser?.id === userId) {
      setCurrentUser(updatedUser);
    }
    syncUserToSupabase(updatedUser);
    addToast(
      nextStatus === 'blocked'
        ? `${target.name}-এর অ্যাকাউন্ট স্থগিত (Block) করা হয়েছে`
        : `${target.name}-এর অ্যাকাউন্ট পুনরায় সক্রিয় করা হয়েছে`,
      nextStatus === 'blocked' ? 'info' : 'success'
    );
    return true;
  };

  const adminDeleteUser = (userId: string): boolean => {
    const target = users.find((u) => u.id === userId);
    if (!target) return false;
    if (isUserAdmin(target)) {
      addToast('মূল অ্যাডমিন অ্যাকাউন্ট মুছে ফেলা যাবে না', 'error');
      return false;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser?.id === userId) {
      setCurrentUser(null);
    }
    deleteUserFromSupabase(userId).catch(() => {});
    addToast(`"${target.name}" অ্যাকাউন্টটি মুছে ফেলা হয়েছে`, 'info');
    return true;
  };

  const formatPrice = (amount: number) => {
    return formatPriceUtil(amount, language);
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t: TRANSLATIONS[language],
        currentPage,
        setCurrentPage,
        selectedProduct,
        setSelectedProduct,
        viewProductDetails,
        products,
        categories: dynamicCategories,
        cart,
        wishlist,
        orders,
        userOrders,
        currentUser,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        filterState,
        setFilterState,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        addReview,
        calculateShippingFee,
        placeOrder,
        lastPlacedOrder,
        toasts,
        addToast,
        removeToast,
        loginUser,
        registerUser,
        updateUserProfile,
        addDeliveryAddress,
        updateDeliveryAddress,
        deleteDeliveryAddress,
        setDefaultDeliveryAddress,
        logoutUser,
        formatPrice,
        cartSubtotal,
        cartDiscount,
        cartShippingFee,
        cartTotal,
        cartItemsCount,
        openCategory,
        profileActiveTab,
        setProfileActiveTab,
        activeReferralCode,
        setActiveReferralCode,
        applyReferralCode,
        getUserReferralStats,
        getProductShareUrl,
        getUserAffiliateStats,
        allWalletTransactions,
        depositToWallet,
        withdrawFromWallet,
        updateWalletTransactionStatus,
        adminAdjustUserBalance,
        siteSettings,
        updateSiteSettings,
        resetSiteSettings,
        customerNotices,
        addCustomerNotice,
        updateCustomerNotice,
        deleteCustomerNotice,
        resetCustomerNoticesToDefault,
        bannerSlides,
        updateBannerSlides,
        addBannerSlide,
        updateBannerSlide,
        deleteBannerSlide,
        addProduct,
        addMultipleProducts,
        updateProduct,
        deleteProduct,
        deleteMultipleProducts,
        resetProductsToDefault,
        addCategory,
        ensureCategoryExists,
        updateCategory,
        deleteCategory,
        resetCategoriesToDefault,
        updateOrderStatus,
        deleteOrder,
        isTrackOrderModalOpen,
        setIsTrackOrderModalOpen,
        trackingQuery,
        setTrackingQuery,
        openTrackOrder,
        isAdminModalOpen,
        setIsAdminModalOpen,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        isUserAdmin,
        users,
        adminCreateUser,
        adminUpdateUser,
        adminDeleteUser,
        adminToggleUserBlock,
        supabaseConnected,
        supabaseStatusMsg,
        checkSupabaseConnection,
        syncAllToSupabase,
        supabaseSetupSql: SUPABASE_SETUP_SQL,
        supabaseUrl: SUPABASE_URL,
        isProductsLoading,
        globalProfitMargin,
        updateGlobalProfitMargin,
        enforceWhiteLabelPurge,
        isAppReady,
        initialLoadingStep,
        isAppInstallModalOpen,
        setIsAppInstallModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
