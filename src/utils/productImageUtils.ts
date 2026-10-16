import { Product } from '../types';

/**
 * Category-aware high definition fallback images.
 * Replaces generic t-shirt fallbacks with context-accurate photography.
 */
export const CATEGORY_FALLBACKS: Record<string, string> = {
  'bag-collection': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1000&auto=format&fit=crop&q=95',
  'jewelry-accessories': 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&auto=format&fit=crop&q=95',
  'home-living': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=1000&auto=format&fit=crop&q=95',
  'electronics-gadgets': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=95',
  'men-fashion': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=1000&auto=format&fit=crop&q=95',
  'women-clothing': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=95',
  'baby-kids': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=1000&auto=format&fit=crop&q=95',
  'couple-combo': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&auto=format&fit=crop&q=95',
  'winter-collection': 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=1000&auto=format&fit=crop&q=95',
  'seasonal-products': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=95',
  'other-categories': 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1000&auto=format&fit=crop&q=95',
};

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1000&auto=format&fit=crop&q=95';

/**
 * Returns a high-definition fallback image suited for the product's category.
 */
export function getCategoryFallbackImage(category?: string): string {
  if (!category) return DEFAULT_FALLBACK_IMAGE;
  const key = category.toLowerCase().trim();
  return CATEGORY_FALLBACKS[key] || DEFAULT_FALLBACK_IMAGE;
}

/**
 * Given a single raw image URL, generates all viable alternative candidate URLs.
 * For ShopBaseBD images:
 * 1. Large HD with .jpg (majority of ShopBase images)
 * 2. Large HD with .jpeg (some ShopBase images)
 * 3. Small thumbnail with .jpg (100% available on ShopBase server)
 * 4. Small thumbnail with .jpeg
 */
export function expandImageCandidates(rawUrl: string): string[] {
  if (!rawUrl || typeof rawUrl !== 'string') return [];
  const trimmed = rawUrl.trim();
  if (!trimmed) return [];

  const candidates: string[] = [];

  if (trimmed.includes('shopbasebd.com')) {
    // 1. Large HD with .jpg
    candidates.push(trimmed.replace('_S_', '_L_').replace(/\.jpeg$/i, '.jpg'));
    // 2. Large HD with .jpeg
    candidates.push(trimmed.replace('_S_', '_L_').replace(/\.jpg$/i, '.jpeg'));
    // 3. Small thumbnail with .jpg (100% available on ShopBase CDN)
    candidates.push(trimmed.replace('_L_', '_S_').replace(/\.jpeg$/i, '.jpg'));
    // 4. Small thumbnail with .jpeg
    candidates.push(trimmed.replace('_L_', '_S_').replace(/\.jpg$/i, '.jpeg'));
  } else if (trimmed.includes('unsplash.com')) {
    // Upgrade unsplash to high definition
    const hd = trimmed.replace(/w=\d+/, 'w=1000').replace(/q=\d+/, 'q=95');
    candidates.push(hd);
    candidates.push(trimmed);
  } else {
    candidates.push(trimmed);
  }

  return [...new Set(candidates)];
}

/**
 * Computes an ordered waterfall of image URLs to try for a given product.
 * Always attempts the real product photos first (both HD and thumbnail variants),
 * and only falls back to category-matching photography if all product URLs fail.
 */
export function getProductImageCandidates(product: Partial<Product>): string[] {
  const result: string[] = [];
  const rawList: string[] = [];

  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === 'string' && img.trim()) {
        rawList.push(img.trim());
      }
    }
  }

  if (product.image && typeof product.image === 'string' && product.image.trim()) {
    rawList.push(product.image.trim());
  }

  // Deduplicate raw inputs
  const uniqueRaw = [...new Set(rawList)];

  for (const raw of uniqueRaw) {
    const expanded = expandImageCandidates(raw);
    for (const cand of expanded) {
      if (!result.includes(cand)) {
        result.push(cand);
      }
    }
  }

  // Final category fallback
  const fallback = getCategoryFallbackImage(product.category);
  if (!result.includes(fallback)) {
    result.push(fallback);
  }

  return result.length > 0 ? result : [DEFAULT_FALLBACK_IMAGE];
}

/**
 * Returns the best initial image URL to display for a product.
 */
export function getProductMainImage(product: Partial<Product>): string {
  const candidates = getProductImageCandidates(product);
  return candidates[0] || DEFAULT_FALLBACK_IMAGE;
}
