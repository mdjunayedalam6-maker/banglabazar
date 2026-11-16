import React, { useState, useEffect, useCallback } from 'react';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Heart
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { isProductInCategory } from '../utils/categoryMatcher';
import { getProductMainImage, getCategoryFallbackImage } from '../utils/productImageUtils';

interface ShowcasePanelProps {
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  eyebrowBn: string;
  eyebrowEn: string;
  accent: 'emerald' | 'amber';
  categorySlug: string;
  products: Product[];
  autoRotateInterval?: number;
}

const ShowcasePanel: React.FC<ShowcasePanelProps> = ({
  titleBn,
  titleEn,
  subtitleBn,
  subtitleEn,
  eyebrowBn,
  eyebrowEn,
  accent,
  categorySlug,
  products,
  autoRotateInterval = 4000,
}) => {
  const {
    language,
    formatPrice,
    viewProductDetails,
    setCurrentPage,
    setFilterState,
    toggleWishlist,
    isInWishlist,
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = products.length;

  const nextProduct = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevProduct = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  }, [total]);

  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(nextProduct, autoRotateInterval);
    return () => clearInterval(timer);
  }, [isPaused, total, autoRotateInterval, nextProduct]);

  if (!products || products.length === 0) {
    return null;
  }

  const currentProduct = products[currentIndex] || products[0];
  const title = language === 'bn' ? currentProduct.titleBn : currentProduct.titleEn;
  const isSaved = isInWishlist(currentProduct.id);
  const isEmerald = accent === 'emerald';

  const handleViewAll = () => {
    setFilterState((prev) => ({
      ...prev,
      category: categorySlug,
      subcategory: 'all',
      searchQuery: '',
    }));
    setCurrentPage('shop');
  };

  return (
    <div
      className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
          {language === 'bn' ? titleBn : titleEn}
        </h3>

        <button
          type="button"
          onClick={handleViewAll}
          className="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-[#00873E] hover:text-[#007033] px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer whitespace-nowrap"
        >
          <span>{language === 'bn' ? 'সব দেখুন' : 'View All'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Featured Rotating Product Card */}
      <div
        onClick={() => viewProductDetails(currentProduct)}
        className="my-4 p-3 sm:p-4 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/40 border border-slate-200/70 transition-colors cursor-pointer group flex items-center gap-4"
      >
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 rounded-2xl overflow-hidden bg-white border border-slate-200/70">
          <img
            src={getProductMainImage(currentProduct)}
            alt={title}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.src = getCategoryFallbackImage(currentProduct.category);
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {currentProduct.discountPercentage && (
            <span className="absolute top-1.5 left-1.5 bg-[#DC2626] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums">
              -{currentProduct.discountPercentage}%
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 text-xs text-slate-600 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="tabular-nums">{currentProduct.rating}</span>
              <span className="text-slate-400 font-normal tabular-nums">
                ({currentProduct.reviewCount})
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(currentProduct.id);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-rose-50 text-[#DC2626]'
                  : 'bg-white text-slate-400 hover:text-[#DC2626] border border-slate-200'
              }`}
              aria-label="Wishlist"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#DC2626]' : ''}`} />
            </button>
          </div>

          <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#00873E] transition-colors line-clamp-2 leading-snug">
            {title}
          </h4>

          <div className="flex items-baseline justify-between gap-2 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 tabular-nums">
                {formatPrice(currentProduct.price)}
              </span>
              {currentProduct.originalPrice && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formatPrice(currentProduct.originalPrice)}
                </span>
              )}
            </div>
            <span className="text-xs font-bold text-[#00873E] hidden sm:inline-flex items-center gap-0.5">
              {language === 'bn' ? 'দেখুন' : 'View'}
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          {products.map((p, idx) => (
            <button
              key={`showcase-dot-${p.id}-${idx}`}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? isEmerald
                    ? 'w-6 bg-[#00873E]'
                    : 'w-6 bg-amber-500'
                  : 'w-1.5 bg-slate-200 hover:bg-slate-300'
              }`}
              aria-label={`Show item ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400 tabular-nums mr-1">
            {currentIndex + 1}/{total}
          </span>
          <button
            type="button"
            onClick={prevProduct}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextProduct}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const DualCategoryShowcase: React.FC = () => {
  const { products, categories } = useApp();

  const mensFashionProducts = React.useMemo(() => {
    const matched = products.filter((p) => isProductInCategory(p, 'mens-clothing', 'all', categories));
    return (matched.length > 0 ? matched : products).slice(0, 6);
  }, [products, categories]);

  const womensAndHomeProducts = React.useMemo(() => {
    const electronics = products.filter((p) => isProductInCategory(p, 'electronics-gadgets', 'all', categories));
    const womens = products.filter((p) => isProductInCategory(p, 'womens-clothing', 'all', categories));
    const pool = electronics.length >= 4 ? electronics : womens;
    return (pool.length > 0 ? pool : products).slice(0, 6);
  }, [products, categories]);

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ShowcasePanel
          eyebrowBn="ট্রেন্ডিং ফ্যাশন"
          eyebrowEn="Trending Fashion"
          titleBn="ছেলেদের পোশাক ও পাঞ্জাবি কালেকশন"
          titleEn="Menswear & Panjabi Collection"
          subtitleBn="প্রিমিয়াম কটন শার্ট, পলো, টিশার্ট ও উৎসবের পাঞ্জাবি"
          subtitleEn="Curated cotton shirts, polos, t-shirts & festive panjabis"
          accent="amber"
          categorySlug="mens-clothing"
          products={mensFashionProducts}
          autoRotateInterval={4000}
        />

        <ShowcasePanel
          eyebrowBn="স্মার্ট কালেকশন"
          eyebrowEn="Smart Picks"
          titleBn="গ্যাজেট ও আধুনিক লাইফস্টাইল"
          titleEn="Gadgets & Smart Essentials"
          subtitleBn="স্মার্টওয়াচ, স্পিকার, কুলিং ফ্যান ও দরকারি সব গ্যাজেট"
          subtitleEn="Smartwatches, speakers, fans & everyday lifestyle tech"
          accent="emerald"
          categorySlug="electronics-gadgets"
          products={womensAndHomeProducts}
          autoRotateInterval={4400}
        />
      </div>
    </section>
  );
};
