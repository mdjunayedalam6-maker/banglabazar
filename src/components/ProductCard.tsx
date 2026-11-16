import React from 'react';
import { Heart, Star, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { getProductImageCandidates, getCategoryFallbackImage } from '../utils/productImageUtils';

export const ProductCard: React.FC<{ product: Product; layout?: 'grid' | 'list' }> = ({
  product,
  layout = 'grid',
}) => {
  const {
    language,
    t,
    viewProductDetails,
    toggleWishlist,
    isInWishlist,
    formatPrice,
  } = useApp();

  const isSaved = isInWishlist(product.id);
  const displayBrand = language === 'bn' ? 'বাংলা বাজার' : 'Bangla Bazar';

  const rawTitle = language === 'bn' ? product.titleBn : product.titleEn;
  const title = (rawTitle || '')
    .replace(/OneRoof\s*Mart/gi, displayBrand)
    .replace(/Bangla\s*Bazar\s*Mart/gi, displayBrand)
    .replace(/বাংলা\s*বাজার\s*Mart/gi, displayBrand)
    .replace(/বাংলা\s*বাজার\s*মার্ট/gi, displayBrand)
    .replace(/OneRoof/gi, displayBrand);

  const imageCandidates = React.useMemo(
    () => getProductImageCandidates(product),
    [product.id, product.images, product.image, product.category]
  );
  const [candidateIndex, setCandidateIndex] = React.useState(0);

  React.useEffect(() => {
    setCandidateIndex(0);
  }, [product.id, product.images, product.image]);

  const currentImg = imageCandidates[candidateIndex] || getCategoryFallbackImage(product.category);

  const handleImageError = () => {
    setCandidateIndex((prev) => {
      if (prev < imageCandidates.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  };

  // Single concise badge max to avoid pill clutter
  const badgeText = product.discountPercentage
    ? `-${product.discountPercentage}%`
    : product.isFreeShipping
    ? language === 'bn'
      ? 'ফ্রি ডেলিভারি'
      : 'Free Delivery'
    : null;
  const badgeColorClass = product.discountPercentage ? 'bg-[#DC2626]' : 'bg-[#00873E]';

  if (layout === 'list') {
    return (
      <div
        onClick={() => viewProductDetails(product)}
        className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-[#00873E]/50 hover:shadow-lg transition-all duration-200 flex flex-col sm:flex-row gap-4 items-center group cursor-pointer"
      >
        <div className="relative w-full sm:w-44 h-44 sm:h-36 shrink-0 rounded-xl overflow-hidden bg-slate-100">
          <img
            src={currentImg}
            alt={title}
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
          />
          {badgeText && (
            <span className={`absolute top-2 left-2 ${badgeColorClass} text-white text-[11px] font-bold px-2 py-0.5 rounded-md tabular-nums`}>
              {badgeText}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between h-full w-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1 text-xs">
              <span className="font-bold text-[#00873E]">{displayBrand}</span>
              <div className="flex items-center text-slate-600 font-semibold gap-1 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount})</span>
              </div>
            </div>

            <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#00873E] line-clamp-2 transition-colors mb-1.5">
              {title}
            </h3>

            {(product.descriptionBn || product.descriptionEn) && (
              <p className="text-xs text-slate-500 line-clamp-2 hidden sm:block">
                {language === 'bn' ? product.descriptionBn : product.descriptionEn}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 tabular-nums">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                  isSaved
                    ? 'border-rose-200 bg-rose-50 text-[#DC2626]'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-[#DC2626]'
                }`}
                title={t.wishlist}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#DC2626]' : ''}`} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  viewProductDetails(product);
                }}
                className="h-10 px-4 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>{language === 'bn' ? 'বিস্তারিত' : 'Details'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => viewProductDetails(product)}
      className="bg-white rounded-2xl p-3 sm:p-3.5 border border-slate-200/80 hover:border-[#00873E]/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group relative cursor-pointer"
    >
      <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3">
        <img
          src={currentImg}
          alt={title}
          referrerPolicy="no-referrer"
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
        />

        {badgeText && (
          <span
            className={`absolute top-2 left-2 ${badgeColorClass} text-white text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md z-10 tabular-nums`}
          >
            {badgeText}
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90 z-20 cursor-pointer ${
            isSaved
              ? 'bg-[#DC2626] text-white shadow-sm'
              : 'bg-white/90 text-slate-500 hover:bg-white hover:text-[#DC2626] shadow-xs'
          }`}
          title={t.wishlist}
          aria-label={t.wishlist}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] mb-1 gap-2">
            <span className="font-bold text-[#00873E] truncate">{displayBrand}</span>
            <div className="flex items-center text-slate-600 font-semibold gap-0.5 shrink-0 tabular-nums">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
          </div>

          <h3 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-[#00873E] line-clamp-2 transition-colors min-h-[2.5rem] leading-snug">
            {title}
          </h3>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-baseline justify-between gap-1.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-[11px] text-slate-400 line-through tabular-nums">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <span className="text-xs font-bold text-[#00873E] flex items-center gap-0.5 shrink-0">
            <span className="hidden xs:inline">{language === 'bn' ? 'দেখুন' : 'View'}</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </div>
    </div>
  );
};
