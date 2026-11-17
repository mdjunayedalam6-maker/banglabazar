import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  Share2,
  Truck,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Zap,
  X,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { getCategoryFallbackImage, expandImageCandidates } from '../utils/productImageUtils';

const COLOR_HEX_MAP: Record<string, string> = {
  'কালো': '#111827',
  black: '#111827',
  'সাদা': '#FFFFFF',
  white: '#FFFFFF',
  'লাল': '#DC2626',
  red: '#DC2626',
  'নীল': '#2563EB',
  blue: '#2563EB',
  'নেভি ব্লু': '#1E3A8A',
  navy: '#1E3A8A',
  'navy blue': '#1E3A8A',
  'সবুজ': '#16A34A',
  green: '#16A34A',
  'হলুদ': '#EAB308',
  yellow: '#EAB308',
  'মেরুন': '#831843',
  maroon: '#831843',
  'গোলাপি': '#DB2777',
  pink: '#DB2777',
  'কমলা': '#EA580C',
  orange: '#EA580C',
  'ধূসর / গ্রে': '#6B7280',
  'ধূসর': '#6B7280',
  gray: '#6B7280',
  grey: '#6B7280',
  'বেগুনি': '#7C3AED',
  purple: '#7C3AED',
  'গোল্ডেন': '#D97706',
  gold: '#D97706',
};

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProduct,
    siteSettings,
    language,
    t,
    categories,
    openCategory,
    setCurrentPage,
    addToCart,
    clearCart,
    toggleWishlist,
    isInWishlist,
    products,
    formatPrice,
    addReview,
    addToast,
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });

  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const availableSizes = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
      return selectedProduct.sizes;
    }
    const found = selectedProduct.variants?.find((v) => v.type.toLowerCase() === 'size');
    return found ? found.options : [];
  }, [selectedProduct]);

  const availableColors = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.colors && selectedProduct.colors.length > 0) {
      return selectedProduct.colors;
    }
    const found = selectedProduct.variants?.find((v) => v.type.toLowerCase() === 'color');
    return found ? found.options : [];
  }, [selectedProduct]);

  const productReviews = useMemo(() => {
    return Array.isArray(selectedProduct?.reviews) ? selectedProduct.reviews : [];
  }, [selectedProduct?.reviews]);

  const productSpecifications = useMemo(() => {
    return selectedProduct?.specifications && typeof selectedProduct.specifications === 'object'
      ? selectedProduct.specifications
      : {};
  }, [selectedProduct?.specifications]);

  const sanitizedImages = useMemo(() => {
    if (!selectedProduct) return [getCategoryFallbackImage()];
    const rawList =
      Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0
        ? selectedProduct.images
        : selectedProduct.image
        ? [selectedProduct.image]
        : [];

    const list: string[] = [];
    const seen = new Set<string>();

    for (const raw of rawList) {
      if (typeof raw !== 'string') continue;
      const candidates = expandImageCandidates(raw);
      for (const cand of candidates) {
        if (!seen.has(cand)) {
          seen.add(cand);
          list.push(cand);
        }
      }
    }
    return list.length > 0 ? list : [getCategoryFallbackImage(selectedProduct.category)];
  }, [selectedProduct]);

  const description = useMemo(() => {
    if (!selectedProduct) return '';
    const rawDescription =
      language === 'bn'
        ? selectedProduct.descriptionBn || selectedProduct.descriptionEn || ''
        : selectedProduct.descriptionEn || selectedProduct.descriptionBn || '';
    if (!rawDescription.trim()) return '';

    let cleaned = rawDescription
      .replace(/OneRoof\s*Mart\s*এক্সক্লুসিভ\s*পণ্য/gi, 'বাংলা বাজার এক্সক্লুসিভ পণ্য')
      .replace(/ShopBase\s*BD\s*পণ্য/gi, 'বাংলা বাজার এক্সক্লুসিভ পণ্য')
      .replace(/বাংলা\s*বাজার\s*Mart\s*এক্সক্লুসিভ\s*পণ্য/gi, 'বাংলা বাজার এক্সক্লুসিভ পণ্য')
      .replace(/বাংলা\s*বাজার\s*মার্ট\s*এক্সক্লুসিভ\s*পণ্য/gi, 'বাংলা বাজার এক্সক্লুসিভ পণ্য')
      .replace(/Bangla\s*Bazar\s*Mart/gi, 'Bangla Bazar')
      .replace(/বাংলা\s*বাজার\s*Mart/gi, 'বাংলা বাজার')
      .replace(/বাংলা\s*বাজার\s*মার্ট/gi, 'বাংলা বাজার')
      .replace(/OneRoof\s*Mart/gi, 'বাংলা বাজার')
      .replace(/ShopBase\s*BD/gi, 'বাংলা বাজার')
      .replace(/ShopBaseBD\s*Official/gi, 'Bangla Bazar Official')
      .replace(/OneRoof\s*Official/gi, 'Bangla Bazar Official')
      .replace(/ShopBase/gi, 'বাংলা বাজার')
      .replace(/OneRoof/gi, 'বাংলা বাজার');

    const wholesaleLineTerms = [
      'পাইকারি রেট',
      'পাইকারি মূল্য',
      'হোলসেল রেট',
      'wholesale price',
      'রিসেলার একাউন্ট',
      'আপনার নিট প্রফিট',
      'আপনার লাভ',
      '01929637253',
    ];

    cleaned = cleaned
      .split(/\r?\n/)
      .filter((line) => {
        const lower = line.toLowerCase();
        return !wholesaleLineTerms.some((term) => lower.includes(term));
      })
      .join('\n')
      .trim();

    return cleaned;
  }, [selectedProduct, language]);

  const descriptionLines = useMemo(() => {
    if (!description) return [];
    return description
      .split(/\r?\n/)
      .map((line) => line.replace(/^[•\-–*📌✨✅🔸🔹▪️►👉]+\s*/u, '').trim())
      .filter(Boolean);
  }, [description]);

  const renderDescriptionLine = (line: string, index: number, sizeClass: string) => {
    const isSubheading =
      /^(প্রোডাক্ট ডিটেইলস|product details|size measurement|বৈশিষ্ট্য|বিবরণ|ফিচার|মাপ)/i.test(line) ||
      (/[ঃ:]$/.test(line) && line.length <= 40);
    if (isSubheading) {
      return (
        <p key={index} className={`${sizeClass} font-bold text-slate-900 pt-1`}>
          {line}
        </p>
      );
    }

    const colonIdx = line.indexOf(':');
    const hasPrefix = colonIdx > 1 && colonIdx <= 30 && !line.startsWith('http');
    if (hasPrefix) {
      const label = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      return (
        <p key={index} className={`${sizeClass} leading-relaxed text-slate-600`}>
          <span className="font-semibold text-slate-900">{label}:</span>{' '}
          <span>{value}</span>
        </p>
      );
    }

    return (
      <p key={index} className={`${sizeClass} leading-[1.7] text-slate-600`}>
        {line}
      </p>
    );
  };

  const productShareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !selectedProduct) return '';
    return `${window.location.origin}/?product=${encodeURIComponent(selectedProduct.id)}`;
  }, [selectedProduct]);

  const matchedCategory = useMemo(() => {
    if (!selectedProduct) return undefined;
    return categories.find(
      (c) =>
        c.id === selectedProduct.category ||
        c.nameEn.toLowerCase() === (selectedProduct.category || '').toLowerCase()
    );
  }, [categories, selectedProduct]);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIndex(0);
      setSelectedQuantity(1);
      setSelectedVariants({});
      setActiveTab('specs');
      setIsDescriptionExpanded(false);
      setSelectedSize(availableSizes[0] || '');
      setSelectedColor(availableColors[0] || '');
    }
  }, [selectedProduct, availableSizes, availableColors]);

  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">
          {language === 'bn' ? 'কোনো পণ্য নির্বাচিত হয়নি' : 'No product selected'}
        </h2>
        <button
          onClick={() => setCurrentPage('shop')}
          className="mt-4 px-6 py-2.5 bg-[#00873E] text-white rounded-xl text-sm font-bold cursor-pointer"
        >
          {language === 'bn' ? 'শপে ফিরে যান' : 'Back to Shop'}
        </button>
      </div>
    );
  }

  const isSaved = isInWishlist(selectedProduct.id);
  const title = language === 'bn' ? selectedProduct.titleBn : selectedProduct.titleEn;
  const displayBrand = language === 'bn' ? 'বাংলা বাজার' : 'Bangla Bazar';
  const skuCode = selectedProduct.sku
    ? selectedProduct.sku.toUpperCase()
    : `SBP-${selectedProduct.id.replace(/\D/g, '') || selectedProduct.id.toUpperCase()}`;

  const categoryLabel = matchedCategory
    ? language === 'bn'
      ? matchedCategory.nameBn
      : matchedCategory.nameEn
    : selectedProduct.category;

  const extraVariants =
    selectedProduct.variants?.filter(
      (v) => v.type.toLowerCase() !== 'size' && v.type.toLowerCase() !== 'color'
    ) || [];

  const filteredSpecs = Object.entries(productSpecifications).filter(([key, value]) => {
    const k = key.toLowerCase();
    const v = String(value || '').toLowerCase();
    const forbidden = [
      'সোর্স',
      'উৎস',
      'পাইকারি',
      'হোলসেল',
      'লাভ',
      'প্রফিট',
      'দাম',
      'shopbase',
      'রিসেলার',
      '01929637253',
    ];
    return !forbidden.some((term) => k.includes(term) || v.includes(term));
  });

  const savingsAmount =
    selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price
      ? selectedProduct.originalPrice - selectedProduct.price
      : 0;

  const handleVariantSelect = (type: string, option: string) => {
    setSelectedVariants((prev) => ({ ...prev, [type]: option }));
  };

  const handleAddToCart = () => {
    const chosenImage = sanitizedImages[activeImageIndex] || sanitizedImages[0] || '';
    const variantMap: Record<string, string> = { ...selectedVariants };
    if (selectedSize) variantMap['size'] = selectedSize;
    if (selectedColor) variantMap['color'] = selectedColor;

    addToCart(selectedProduct, selectedQuantity, variantMap, chosenImage, selectedSize, selectedColor);
  };

  const handleBuyNow = () => {
    clearCart();
    const chosenImage = sanitizedImages[activeImageIndex] || sanitizedImages[0] || '';
    const variantMap: Record<string, string> = { ...selectedVariants };
    if (selectedSize) variantMap['size'] = selectedSize;
    if (selectedColor) variantMap['color'] = selectedColor;

    addToCart(selectedProduct, selectedQuantity, variantMap, chosenImage, selectedSize, selectedColor);
    setCurrentPage('checkout');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} - বাংলা বাজার`,
          url: productShareUrl,
        });
        return;
      } catch (_) {}
    }
    setIsShareModalOpen(true);
  };

  const copyProductLink = () => {
    if (navigator.clipboard && productShareUrl) {
      navigator.clipboard.writeText(productShareUrl);
      setCopiedLink(true);
      addToast(
        language === 'bn' ? 'লিংক কপি করা হয়েছে' : 'Link copied',
        'success'
      );
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      addToast(
        language === 'bn' ? 'আপনার মতামত লিখুন' : 'Please write your review',
        'error'
      );
      return;
    }
    addReview(selectedProduct.id, reviewRating, reviewComment, reviewName);
    setReviewComment('');
    setShowReviewForm(false);
  };

  const relatedProducts = products
    .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    .slice(0, 4);

  const deliverySummaryText = selectedProduct.isFreeShipping
    ? language === 'bn'
      ? 'ফ্রি ডেলিভারি · ক্যাশ অন ডেলিভারি'
      : 'Free Delivery · Cash on Delivery'
    : selectedProduct.shippingFee !== undefined
    ? language === 'bn'
      ? `ডেলিভারি চার্জ ${formatPrice(selectedProduct.shippingFee)} · ক্যাশ অন ডেলিভারি`
      : `Delivery ${formatPrice(selectedProduct.shippingFee)} · Cash on Delivery`
    : language === 'bn'
    ? `ঢাকা ${formatPrice(siteSettings.shippingFeeInsideDhaka ?? 60)} · বাইরে ${formatPrice(
        siteSettings.shippingFeeOutsideDhaka ?? 120
      )} · ক্যাশ অন ডেলিভারি`
    : `Dhaka ${formatPrice(siteSettings.shippingFeeInsideDhaka ?? 60)} · Outside ${formatPrice(
        siteSettings.shippingFeeOutsideDhaka ?? 120
      )} · COD`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-32 md:py-7 space-y-6">
      {/* Compact Breadcrumb & Back */}
      <div className="flex items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 min-w-0">
          <button
            type="button"
            onClick={() => setCurrentPage('home')}
            className="hover:text-[#00873E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {t.home}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <button
            type="button"
            onClick={() =>
              matchedCategory ? openCategory(matchedCategory.id) : setCurrentPage('shop')
            }
            className="hover:text-[#00873E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {categoryLabel}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden sm:block" />
          <span className="text-slate-700 font-medium truncate max-w-[220px] hidden sm:inline">
            {title}
          </span>
        </nav>

        <button
          type="button"
          onClick={() => setCurrentPage('shop')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#00873E] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'শপে ফিরুন' : 'Back'}</span>
        </button>
      </div>

      {/* Contiguous Purchase Module */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200/80 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        {/* Left Column: Gallery */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-3">
          <div
            className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-slate-200/80 group select-none cursor-zoom-in"
            onMouseEnter={() => setIsHoverZooming(true)}
            onMouseLeave={() => {
              setIsHoverZooming(false);
              setZoomCoords({ x: 50, y: 50 });
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
              const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
              setZoomCoords({ x, y });
            }}
            onClick={() => {
              setLightboxImage(sanitizedImages[activeImageIndex] || sanitizedImages[0]);
              setLightboxZoom(1);
              setLightboxPan({ x: 0, y: 0 });
            }}
          >
            <img
              src={sanitizedImages[activeImageIndex] || sanitizedImages[0]}
              alt={title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = getCategoryFallbackImage(selectedProduct.category);
                if (target.src === fallback) return;
                if (target.src.includes('.jpeg') && !(target as any)._jpegTried) {
                  (target as any)._jpegTried = true;
                  target.src = target.src.replace(/\.jpeg$/i, '.jpg');
                } else if (target.src.includes('_L_') && !(target as any)._smallTried) {
                  (target as any)._smallTried = true;
                  target.src = target.src.replace('_L_', '_S_').replace(/\.jpeg$/i, '.jpg');
                } else {
                  target.src = fallback;
                }
              }}
              style={{
                transformOrigin: isHoverZooming ? `${zoomCoords.x}% ${zoomCoords.y}%` : 'center center',
                transform: isHoverZooming ? 'scale(2.1)' : 'scale(1)',
                transition: isHoverZooming ? 'transform 0.08s ease-out' : 'transform 0.25s ease-out',
                imageRendering: '-webkit-optimize-contrast' as any,
              }}
              className="w-full h-full object-contain bg-white"
              loading="eager"
              decoding="async"
            />

            {selectedProduct.discountPercentage ? (
              <span className="absolute top-3 left-3 bg-[#DC2626] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg pointer-events-none tabular-nums">
                -{selectedProduct.discountPercentage}%
              </span>
            ) : selectedProduct.isFlashSale ? (
              <span className="absolute top-3 left-3 bg-[#DC2626] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg pointer-events-none">
                {language === 'bn' ? 'ফ্ল্যাশ সেল' : 'Flash Sale'}
              </span>
            ) : null}

            <span
              className="absolute bottom-3 right-3 w-9 h-9 rounded-xl bg-white/95 border border-slate-200/90 text-slate-600 shadow-xs flex items-center justify-center opacity-85 group-hover:opacity-100 transition-opacity pointer-events-none"
              aria-hidden="true"
            >
              <Maximize2 className="w-4 h-4" />
            </span>
          </div>

          {sanitizedImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {sanitizedImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-15 h-15 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#00873E] ring-2 ring-[#00873E]/15'
                      : 'border-slate-200 hover:border-slate-300 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${title} ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = getCategoryFallbackImage(selectedProduct.category);
                      if (target.src === fallback) return;
                      if (target.src.includes('.jpeg') && !(target as any)._jpegTried) {
                        (target as any)._jpegTried = true;
                        target.src = target.src.replace(/\.jpeg$/i, '.jpg');
                      } else if (target.src.includes('_L_') && !(target as any)._fallbackTried) {
                        (target as any)._fallbackTried = true;
                        target.src = target.src.replace('_L_', '_S_').replace(/\.jpeg$/i, '.jpg');
                      } else {
                        target.src = fallback;
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Clean Purchase Options */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-5">
          <div className="space-y-4">
            {/* Unboxed Metadata */}
            <div className="flex items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#00873E]">{displayBrand}</span>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(skuCode);
                    addToast(language === 'bn' ? `SKU কপি হয়েছে` : `SKU copied`, 'info');
                  }}
                  className="inline-flex items-center gap-1 font-mono text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                  title="Copy SKU"
                >
                  <span>{skuCode}</span>
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="text-xl sm:text-2xl lg:text-[26px] font-bold text-slate-900 leading-snug text-balance">
              {title}
            </h1>

            {/* Rating & Stock Inline */}
            <div className="flex items-center flex-wrap gap-2.5 text-xs text-slate-600">
              <div className="inline-flex items-center gap-1 font-semibold text-slate-800 tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{selectedProduct.rating}</span>
              </div>
              {productReviews.length > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('reviews')}
                    className="hover:text-[#00873E] transition-colors cursor-pointer tabular-nums"
                  >
                    {selectedProduct.reviewCount || productReviews.length}{' '}
                    {language === 'bn' ? 'রিভিউ' : 'Reviews'}
                  </button>
                </>
              )}
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span
                className={`font-semibold inline-flex items-center gap-1 tabular-nums ${
                  selectedProduct.stock > 0 ? 'text-[#00873E]' : 'text-[#DC2626]'
                }`}
              >
                {selectedProduct.stock > 0 ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {t.inStock} ({selectedProduct.stock}
                      {language === 'bn' ? 'টি' : ''})
                    </span>
                  </>
                ) : (
                  <span>{language === 'bn' ? 'স্টক শেষ' : 'Out of Stock'}</span>
                )}
              </span>
            </div>

            {/* Clean Price Row */}
            <div className="py-3.5 border-y border-slate-100 flex items-baseline flex-wrap gap-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tabular-nums">
                {formatPrice(selectedProduct.price)}
              </span>
              {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                <span className="text-sm text-slate-400 line-through tabular-nums">
                  {formatPrice(selectedProduct.originalPrice)}
                </span>
              )}
              {savingsAmount > 0 && (
                <span className="text-xs font-semibold text-[#DC2626] tabular-nums">
                  {language === 'bn'
                    ? `${formatPrice(savingsAmount)} সাশ্রয়`
                    : `Save ${formatPrice(savingsAmount)}`}
                </span>
              )}
            </div>

            {/* Product Description (Preserved & Attractively Styled) */}
            {(descriptionLines.length > 0 || selectedProduct.subcategory) && (
              <div className="bg-[#F8FAFC] rounded-xl px-4 py-3 border border-slate-200/70 space-y-2">
                {descriptionLines.length > 0 ? (
                  <>
                    <div className="space-y-1.5">
                      {(isDescriptionExpanded
                        ? descriptionLines
                        : descriptionLines.slice(0, 6)
                      ).map((line, index) =>
                        renderDescriptionLine(line, index, 'text-[13px] sm:text-sm')
                      )}
                    </div>
                    {descriptionLines.length > 6 && (
                      <button
                        type="button"
                        onClick={() => setIsDescriptionExpanded((prev) => !prev)}
                        className="text-xs font-semibold text-[#00873E] hover:underline cursor-pointer"
                      >
                        {isDescriptionExpanded
                          ? language === 'bn'
                            ? 'সংক্ষিপ্ত করুন'
                            : 'Show less'
                          : language === 'bn'
                          ? 'সম্পূর্ণ বিবরণ পড়ুন'
                          : 'Read more'}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-[13px] sm:text-sm leading-relaxed text-slate-600">
                    <span className="font-semibold text-slate-900">
                      {categoryLabel}
                      {selectedProduct.subcategory ? ` · ${selectedProduct.subcategory}` : ''}
                    </span>{' '}
                    —{' '}
                    {language === 'bn'
                      ? `${title} প্রিমিয়াম কোয়ালিটির যাচাইকৃত পণ্য।`
                      : `${title} verified quality product.`}
                  </p>
                )}
              </div>
            )}

            {/* Size Selector (Unboxed) */}
            {availableSizes.length > 0 && (
              <div className="space-y-2 pt-0.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-700">
                    {language === 'bn' ? 'সাইজ:' : 'Size:'}
                  </span>
                  <span className="font-bold text-[#00873E]">{selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`min-h-[40px] min-w-[44px] px-3.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#062919] text-white border-[#062919] shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selector (Unboxed with clean swatches) */}
            {availableColors.length > 0 && (
              <div className="space-y-2 pt-0.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-700">
                    {language === 'bn' ? 'কালার:' : 'Color:'}
                  </span>
                  <span className="font-bold text-slate-900">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((clr) => {
                    const isSelected = selectedColor === clr;
                    const hexCode = COLOR_HEX_MAP[clr.toLowerCase()] || COLOR_HEX_MAP[clr];
                    return (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => setSelectedColor(clr)}
                        className={`min-h-[40px] px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'border-[#00873E] bg-emerald-50/70 text-slate-900 ring-1 ring-[#00873E]'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: hexCode || '#94A3B8' }}
                        />
                        <span>{clr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Variants */}
            {extraVariants.length > 0 && (
              <div className="space-y-3 pt-0.5">
                {extraVariants.map((v) => {
                  const chosen = selectedVariants[v.type] || v.options[0];
                  return (
                    <div key={v.type} className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-700 capitalize">{v.type}:</span>
                        <span className="font-bold text-[#00873E]">{chosen}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {v.options.map((opt) => {
                          const isChosen = chosen === opt;
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleVariantSelect(v.type, opt)}
                              className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                                isChosen
                                  ? 'bg-[#062919] text-white border-[#062919]'
                                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quantity + Quick Utility Row */}
            <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-700">
                  {language === 'bn' ? 'পরিমাণ:' : 'Qty:'}
                </span>
                <div className="inline-flex items-center h-11 border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                    className="w-10 h-full text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900 tabular-nums">
                    {selectedQuantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                    className="w-10 h-full text-slate-600 hover:bg-slate-100 font-bold transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleWishlist(selectedProduct.id)}
                  className={`h-11 px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isSaved
                      ? 'border-rose-200 bg-rose-50 text-rose-600'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:text-rose-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span className="hidden sm:inline">
                    {isSaved
                      ? language === 'bn'
                        ? 'সংরক্ষিত'
                        : 'Saved'
                      : language === 'bn'
                      ? 'পছন্দ'
                      : 'Save'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="h-11 px-3.5 rounded-xl border border-slate-200 text-slate-600 hover:border-slate-300 hover:text-[#00873E] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{language === 'bn' ? 'শেয়ার' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="theme-btn-cart min-h-[48px] px-5 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>{t.addToCart}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="theme-btn-buy theme-shimmer-effect min-h-[48px] px-5 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Zap className="w-4 h-4 text-amber-200 fill-amber-300 shrink-0" />
                <span>{t.buyNow}</span>
              </button>
            </div>
          </div>

          {/* Concise Single-Line Delivery Summary */}
          <div className="pt-3.5 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
            <Truck className="w-4 h-4 text-[#00873E] shrink-0" />
            <span>{deliverySummaryText}</span>
          </div>
        </div>
      </div>

      {/* Concise 2-Tab Details & Reviews */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-6 border-b border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-3 text-sm sm:text-base font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'specs'
                ? 'text-[#00873E] border-[#00873E]'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            {language === 'bn' ? 'বিবরণ ও তথ্য' : 'Details'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-sm sm:text-base font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer tabular-nums ${
              activeTab === 'reviews'
                ? 'text-[#00873E] border-[#00873E]'
                : 'text-slate-500 border-transparent hover:text-slate-800'
            }`}
          >
            {t.reviews}
            {productReviews.length > 0 ? ` (${productReviews.length})` : ''}
          </button>
        </div>

        {/* Tab 1: Concise Description & Specifications */}
        {activeTab === 'specs' && (
          <div className="space-y-6">
            {descriptionLines.length > 0 && (
              <div className="space-y-2 max-w-3xl">
                {descriptionLines.map((line, index) =>
                  renderDescriptionLine(line, index, 'text-sm')
                )}
              </div>
            )}

            {filteredSpecs.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 border-t border-slate-100">
                {filteredSpecs.map(([key, value]) => {
                  let cleanVal = String(value || '');
                  if (key.includes('ব্র্যান্ড') || key.toLowerCase().includes('brand')) {
                    cleanVal = displayBrand;
                  } else {
                    cleanVal = cleanVal
                      .replace(/Bangla\s*Bazar\s*Mart/gi, displayBrand)
                      .replace(/বাংলা\s*বাজার\s*Mart/gi, displayBrand)
                      .replace(/বাংলা\s*বাজার\s*মার্ট/gi, displayBrand)
                      .replace(/OneRoof\s*Mart/gi, displayBrand)
                      .replace(/OneRoof/gi, displayBrand)
                      .replace(/ShopBase\s*BD/gi, displayBrand)
                      .replace(/ShopBase/gi, displayBrand);
                  }
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 text-xs sm:text-sm"
                    >
                      <span className="text-slate-500 font-medium">{key}</span>
                      <span className="font-semibold text-slate-900 text-right">{cleanVal}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedProduct.warranty && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 pt-1">
                <ShieldCheck className="w-4 h-4 text-[#00873E] shrink-0" />
                <span>
                  <strong className="font-semibold">
                    {language === 'bn' ? 'ওয়ারেন্টি: ' : 'Warranty: '}
                  </strong>
                  {selectedProduct.warranty}
                </span>
              </div>
            )}

            {!description && filteredSpecs.length === 0 && !selectedProduct.warranty && (
              <p className="text-sm text-slate-500">
                {language === 'bn'
                  ? 'স্টকে আছে — ক্যাশ অন ডেলিভারিতে অর্ডার করুন।'
                  : 'In stock and ready for Cash on Delivery.'}
              </p>
            )}
          </div>
        )}

        {/* Tab 2: Customer Reviews */}
        {activeTab === 'reviews' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                  {selectedProduct.rating}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(selectedProduct.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 tabular-nums">
                    {productReviews.length} {language === 'bn' ? 'টি রিভিউ' : 'reviews'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="min-h-[42px] px-5 bg-[#00873E] hover:bg-[#007033] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
              >
                {t.writeReview}
              </button>
            </div>

            {showReviewForm && (
              <form
                onSubmit={handleReviewSubmit}
                className="p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-700">
                    {language === 'bn' ? 'রেটিং:' : 'Rating:'}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার নাম' : 'Your name'}
                  className="w-full sm:max-w-sm p-2.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:border-[#00873E]"
                />

                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার মতামত লিখুন...' : 'Write your review...'}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 text-slate-900 rounded-xl outline-none focus:border-[#00873E]"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="min-h-[40px] px-4 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="min-h-[40px] px-5 bg-[#00873E] text-white text-xs font-bold rounded-xl cursor-pointer"
                  >
                    {language === 'bn' ? 'জমা দিন' : 'Submit'}
                  </button>
                </div>
              </form>
            )}

            {productReviews.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {productReviews.map((rev) => (
                  <div key={rev.id} className="py-4 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#00873E] font-bold flex items-center justify-center text-xs">
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="text-[11px] text-[#00873E] font-medium inline-flex items-center gap-0.5">
                                <Check className="w-3 h-3" />
                                {t.verifiedPurchase}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{rev.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 pl-10 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">
                {language === 'bn' ? 'এখনও কোনো রিভিউ নেই।' : 'No reviews yet.'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {t.relatedProducts}
            </h3>
            <button
              type="button"
              onClick={() => setCurrentPage('shop')}
              className="text-xs font-semibold text-[#00873E] hover:underline cursor-pointer"
            >
              {language === 'bn' ? 'আরও দেখুন' : 'See more'}
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.map((prod, idx) => (
              <ProductCard key={`related-${prod.id}-${idx}`} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Quick Purchase Bar */}
      <div className="md:hidden fixed bottom-[56px] left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[11px] text-slate-500 block leading-none">
            {language === 'bn' ? 'মোট' : 'Total'}
          </span>
          <span className="text-base font-extrabold text-slate-900 leading-tight tabular-nums">
            {formatPrice(selectedProduct.price * selectedQuantity)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[260px]">
          <button
            type="button"
            onClick={handleAddToCart}
            className="theme-btn-cart flex-1 min-h-[42px] px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'bn' ? 'কার্টে যোগ' : 'Add to Cart'}</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="theme-btn-buy flex-1 min-h-[42px] px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-300 shrink-0" />
            <span>{language === 'bn' ? 'এখনই কিনুন' : 'Buy Now'}</span>
          </button>
        </div>
      </div>

      {/* Lightbox Image Viewer */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 select-none"
          onClick={() => setLightboxImage(null)}
          onWheel={(e) => {
            const delta = e.deltaY < 0 ? 0.35 : -0.35;
            setLightboxZoom((prev) => Math.min(4, Math.max(1, +(prev + delta).toFixed(2))));
          }}
        >
          <div
            className="absolute top-4 inset-x-4 max-w-xl mx-auto flex items-center justify-between gap-3 bg-slate-900/95 border border-slate-700/80 rounded-2xl px-4 py-2 shadow-2xl text-white z-60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold tabular-nums">
                {Math.round(lightboxZoom * 100)}%
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => Math.max(1, +(prev - 0.5).toFixed(2)))}
                disabled={lightboxZoom <= 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 cursor-pointer"
                title={language === 'bn' ? 'জুম আউট' : 'Zoom Out'}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => Math.min(4, +(prev + 0.5).toFixed(2)))}
                disabled={lightboxZoom >= 4}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 cursor-pointer"
                title={language === 'bn' ? 'জুম ইন' : 'Zoom In'}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => {
                    setLightboxZoom(level);
                    if (level === 1) setLightboxPan({ x: 0, y: 0 });
                  }}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    Math.round(lightboxZoom) === level
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {level}x
                </button>
              ))}
              <div className="h-4 w-px bg-slate-700 mx-1" />
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors cursor-pointer"
                title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {sanitizedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const prevIdx =
                    (activeImageIndex - 1 + sanitizedImages.length) % sanitizedImages.length;
                  setActiveImageIndex(prevIdx);
                  setLightboxImage(sanitizedImages[prevIdx]);
                  setLightboxZoom(1);
                  setLightboxPan({ x: 0, y: 0 });
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700 shadow-xl transition-all cursor-pointer z-60"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextIdx = (activeImageIndex + 1) % sanitizedImages.length;
                  setActiveImageIndex(nextIdx);
                  setLightboxImage(sanitizedImages[nextIdx]);
                  setLightboxZoom(1);
                  setLightboxPan({ x: 0, y: 0 });
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700 shadow-xl transition-all cursor-pointer z-60"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div
            className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={() => {
              if (lightboxZoom > 1) {
                setLightboxZoom(1);
                setLightboxPan({ x: 0, y: 0 });
              } else {
                setLightboxZoom(2.5);
              }
            }}
            onMouseDown={(e) => {
              if (lightboxZoom > 1) {
                setIsDragging(true);
                setDragStart({ x: e.clientX - lightboxPan.x, y: e.clientY - lightboxPan.y });
              }
            }}
            onMouseMove={(e) => {
              if (isDragging && lightboxZoom > 1) {
                setLightboxPan({
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y,
                });
              }
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            <img
              src={lightboxImage}
              alt={title}
              referrerPolicy="no-referrer"
              style={{
                transform: `scale(${lightboxZoom}) translate(${lightboxPan.x / lightboxZoom}px, ${
                  lightboxPan.y / lightboxZoom
                }px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                imageRendering: '-webkit-optimize-contrast' as any,
              }}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Share Product Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Share2 className="w-4 h-4 text-[#00873E]" />
                <span>{language === 'bn' ? 'শেয়ার করুন' : 'Share Product'}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <img
                src={sanitizedImages[0]}
                alt={title}
                referrerPolicy="no-referrer"
                className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{title}</h4>
                <p className="text-xs text-[#00873E] font-bold mt-0.5 tabular-nums">
                  {formatPrice(selectedProduct.price)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={productShareUrl}
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl text-slate-700 outline-none select-all"
              />
              <button
                type="button"
                onClick={copyProductLink}
                className={`min-h-[38px] px-3.5 text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  copiedLink ? 'bg-[#00873E] text-white' : 'bg-slate-900 text-white'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : language === 'bn' ? 'কপি' : 'Copy'}</span>
              </button>
            </div>

            <div className="flex gap-2 pt-1">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `${title}\nদাম: ${formatPrice(selectedProduct.price)}\n${productShareUrl}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-h-[42px] bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold flex items-center justify-center transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  productShareUrl
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-h-[42px] bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center transition-colors"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
