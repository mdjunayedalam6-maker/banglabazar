import React, { useState, useEffect, useMemo } from 'react';
import { 
  Star, 
  ShoppingBag, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
  Sparkles,
  Zap,
  Info,
  ThumbsUp,
  MessageSquare,
  Layers,
  Palette,
  X,
  Tag,
  Copy,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';

const COLOR_HEX_MAP: Record<string, string> = {
  'কালো': '#111827',
  'black': '#111827',
  'সাদা': '#FFFFFF',
  'white': '#FFFFFF',
  'লাল': '#DC2626',
  'red': '#DC2626',
  'নীল': '#2563EB',
  'blue': '#2563EB',
  'নেভি ব্লু': '#1E3A8A',
  'navy': '#1E3A8A',
  'navy blue': '#1E3A8A',
  'সবুজ': '#16A34A',
  'green': '#16A34A',
  'হলুদ': '#EAB308',
  'yellow': '#EAB308',
  'মেরুন': '#831843',
  'maroon': '#831843',
  'গোলাপি': '#DB2777',
  'pink': '#DB2777',
  'কমলা': '#EA580C',
  'orange': '#EA580C',
  'ধূসর / গ্রে': '#6B7280',
  'ধূসর': '#6B7280',
  'gray': '#6B7280',
  'grey': '#6B7280',
  'বেগুনি': '#7C3AED',
  'purple': '#7C3AED',
  'গোল্ডেন': '#D97706',
  'gold': '#D97706',
};

export const ProductDetailPage: React.FC = () => {
  const {
    selectedProduct,
    siteSettings,
    language,
    t,
    setCurrentPage,
    addToCart,
    clearCart,
    toggleWishlist,
    isInWishlist,
    products,
    formatPrice,
    addReview,
    addToast,
    viewProductDetails,
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);
  const [lightboxPan, setLightboxPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Interactive Hover Zoom Lens state
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });

  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'specs' | 'returns' | 'reviews'>('specs');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Available Sizes
  const availableSizes = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.sizes && selectedProduct.sizes.length > 0) {
      return selectedProduct.sizes;
    }
    const found = selectedProduct.variants?.find((v) => v.type.toLowerCase() === 'size');
    return found ? found.options : [];
  }, [selectedProduct]);

  // Available Colors
  const availableColors = useMemo(() => {
    if (!selectedProduct) return [];
    if (selectedProduct.colors && selectedProduct.colors.length > 0) {
      return selectedProduct.colors;
    }
    const found = selectedProduct.variants?.find((v) => v.type.toLowerCase() === 'color');
    return found ? found.options : [];
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedProduct) {
      setActiveImageIndex(0);
      if (availableSizes.length > 0) {
        setSelectedSize(availableSizes[0]);
      } else {
        setSelectedSize('');
      }
      if (availableColors.length > 0) {
        setSelectedColor(availableColors[0]);
      } else {
        setSelectedColor('');
      }
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
          className="mt-4 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold"
        >
          {language === 'bn' ? 'শপে ফিরে যান' : 'Back to Shop'}
        </button>
      </div>
    );
  }

  const isSaved = isInWishlist(selectedProduct.id);
  const title = language === 'bn' ? selectedProduct.titleBn : selectedProduct.titleEn;
  // All 11,902 products branded as Bangla Bazar
  const displayBrand = language === 'bn' ? 'বাংলা বাজার' : 'Bangla Bazar';

  // Safe reviews and specifications fallback
  const productReviews = React.useMemo(() => {
    return Array.isArray(selectedProduct?.reviews) ? selectedProduct.reviews : [];
  }, [selectedProduct?.reviews]);

  const productSpecifications = React.useMemo(() => {
    return (selectedProduct?.specifications && typeof selectedProduct.specifications === 'object')
      ? selectedProduct.specifications
      : {};
  }, [selectedProduct?.specifications]);

  // Guaranteed Ultra-HD Image URLs with Large resolution and crisp quality
  const sanitizedImages = React.useMemo(() => {
    const rawList = (Array.isArray(selectedProduct?.images) && selectedProduct.images.length > 0)
      ? selectedProduct.images
      : (selectedProduct?.image ? [selectedProduct.image] : []);

    const list: string[] = [];
    const seen = new Set<string>();

    for (const raw of rawList) {
      if (typeof raw !== 'string') continue;
      let img = raw.trim();
      // Upgrade shopbase images: always use _L_ (large HD) and .jpeg
      if (img.includes('shopbasebd.com')) {
        img = img.replace('_S_', '_L_').replace(/\.jpg$/i, '.jpeg');
      }
      // Upgrade unsplash images to ultra HD 1600px+ q=95
      if (img.includes('unsplash.com')) {
        img = img.replace(/w=\d+/, 'w=1600').replace(/q=\d+/, 'q=95');
        if (!img.includes('w=1600')) {
          img += (img.includes('?') ? '&' : '?') + 'w=1600&auto=format&fit=crop&q=95';
        }
      }
      if (!seen.has(img)) {
        seen.add(img);
        list.push(img);
      }
    }
    return list.length > 0 ? list : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&auto=format&fit=crop&q=95'];
  }, [selectedProduct?.images, selectedProduct?.image]);

  const rawDescription = language === 'bn' ? selectedProduct.descriptionBn : selectedProduct.descriptionEn;
  const description = React.useMemo(() => {
    if (!rawDescription) return '';
    const sensitiveTerms = [
      'সোর্স', 'উৎস', 'পাইকারি রেট', 'পাইকারি মূল্য', 'হোলসেল রেট', 'হোলসেল', 'আপনার লাভ', 'লাভ', 
      'Wholesale Price', 'Profit', 'রিসেলার একাউন্ট', '01929637253'
    ];
    let cleaned = rawDescription;
    cleaned = cleaned.replace(/OneRoof\s*Mart\s*এক্সক্লুসিভ\s*পণ্য/gi, 'বাংলা বাজার এক্সক্লুসিভ পণ্য');
    cleaned = cleaned.replace(/ShopBase\s*BD\s*পণ্য/gi, 'বাংলা বাজার এক্সক্লুসিভ পণ্য');
    cleaned = cleaned.replace(/বাংলা\s*বাজার\s*Mart\s*এক্সক্লুসিভ\s*পণ্য/gi, 'বাংলা বাজার এক্সক্লুসিভ পণ্য');
    cleaned = cleaned.replace(/বাংলা\s*বাজার\s*মার্ট\s*এক্সক্লুসিভ\s*পণ্য/gi, 'বাংলা বাজার এক্সক্লুসিভ পণ্য');
    cleaned = cleaned.replace(/Bangla\s*Bazar\s*Mart/gi, 'Bangla Bazar');
    cleaned = cleaned.replace(/বাংলা\s*বাজার\s*Mart/gi, 'বাংলা বাজার');
    cleaned = cleaned.replace(/বাংলা\s*বাজার\s*মার্ট/gi, 'বাংলা বাজার');
    cleaned = cleaned.replace(/OneRoof\s*Mart/gi, 'বাংলা বাজার');
    cleaned = cleaned.replace(/ShopBase\s*BD/gi, 'বাংলা বাজার');
    cleaned = cleaned.replace(/ShopBaseBD\s*Official/gi, 'Bangla Bazar Official');
    cleaned = cleaned.replace(/OneRoof\s*Official/gi, 'Bangla Bazar Official');
    cleaned = cleaned.replace(/ShopBase/gi, 'বাংলা বাজার');
    cleaned = cleaned.replace(/OneRoof/gi, 'বাংলা বাজার');
    sensitiveTerms.forEach(term => {
      const regex = new RegExp(`${term}.*?(\\n|$)`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });
    return cleaned.trim();
  }, [rawDescription, language]);

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

  const productShareUrl = useMemo(() => {
    if (typeof window === 'undefined' || !selectedProduct) return '';
    return `${window.location.origin}/?product=${encodeURIComponent(selectedProduct.id)}`;
  }, [selectedProduct]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} - বাংলা বাজার (Bangla Bazar) থেকে সহজে অর্ডার করুন`,
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
        language === 'bn' ? 'পণ্যটির সরাসরি লিংক কপি করা হয়েছে!' : 'Product direct link copied to clipboard!',
        'success'
      );
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      addToast(
        language === 'bn' ? 'দয়া করে আপনার মন্তব্য লিখুন' : 'Please write your feedback',
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Breadcrumb & Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <button onClick={() => setCurrentPage('home')} className="hover:text-emerald-700">
            {t.home}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => setCurrentPage('shop')}
            className="hover:text-emerald-700 capitalize"
          >
            {selectedProduct.category}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold truncate max-w-xs">{title}</span>
        </div>

        <button
          onClick={() => setCurrentPage('shop')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'শপে ফিরে যান' : 'Back to Shop'}</span>
        </button>
      </div>

      {/* Main Product Layout: Left Image Gallery, Right Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div 
            className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 group select-none cursor-crosshair"
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
            title={language === 'bn' ? 'ক্লিক করে ফুলস্ক্রিন আল্ট্রা-এইচডি ভিউয়ারে দেখুন' : 'Click to view in Fullscreen Ultra-HD'}
          >
            <img
              src={sanitizedImages[activeImageIndex] || sanitizedImages[0]}
              alt={title}
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&auto=format&fit=crop&q=95';
              }}
              style={{
                transformOrigin: isHoverZooming ? `${zoomCoords.x}% ${zoomCoords.y}%` : 'center center',
                transform: isHoverZooming ? 'scale(2.2)' : 'scale(1)',
                transition: isHoverZooming ? 'transform 0.08s ease-out' : 'transform 0.3s ease-out',
                imageRendering: '-webkit-optimize-contrast' as any,
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
                filter: isHoverZooming ? 'contrast(1.02) saturate(1.02)' : 'none',
              }}
              className="w-full h-full object-contain bg-white"
              loading="eager"
              decoding="async"
            />

            {/* Magnifier lens indicator on hover */}
            {isHoverZooming && (
              <div 
                className="absolute pointer-events-none rounded-xl border-2 border-emerald-500 bg-emerald-500/10 shadow-lg backdrop-contrast-125 hidden sm:block"
                style={{
                  width: '120px',
                  height: '120px',
                  left: `calc(${zoomCoords.x}% - 60px)`,
                  top: `calc(${zoomCoords.y}% - 60px)`,
                  transition: 'none',
                }}
              />
            )}

            {selectedProduct.discountPercentage && (
              <span className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow-sm pointer-events-none z-10">
                -{selectedProduct.discountPercentage}% OFF
              </span>
            )}
            {selectedProduct.isFlashSale && (
              <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-xs font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm pointer-events-none z-10">
                <Zap className="w-3 h-3 fill-slate-950" />
                FLASH SALE
              </span>
            )}

            {/* Interactive HD Zoom Indicator */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-bold shadow-lg pointer-events-none select-none z-10">
              <ZoomIn className={`w-3.5 h-3.5 ${isHoverZooming ? 'text-emerald-400 animate-pulse' : 'text-slate-300'}`} />
              <span>
                {isHoverZooming 
                  ? (language === 'bn' ? 'এইচডি জুম সক্রিয় (ক্লিক করে ফুলস্ক্রিন)' : 'HD Zoom Active (Click for 4K)') 
                  : (language === 'bn' ? 'এইচডি জুম (মাউস নিন / ক্লিক করুন)' : 'HD Zoom (Hover / Click)')}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {sanitizedImages.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {sanitizedImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt="Thumbnail"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.includes('_L_')) {
                        target.src = target.src.replace('_L_', '_S_').replace(/\.jpeg$/i, '.jpg');
                      } else {
                        target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80';
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Brand & SKU */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#00873E] uppercase bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-lg tracking-wider">
                {displayBrand}
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-mono font-medium border border-slate-200 transition-colors">
                <span>SKU: {selectedProduct.sku ? selectedProduct.sku.toUpperCase() : `SBP-${selectedProduct.id.replace(/\D/g, '') || selectedProduct.id.toUpperCase()}`}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const skuCode = selectedProduct.sku ? selectedProduct.sku.toUpperCase() : `SBP-${selectedProduct.id.replace(/\D/g, '') || selectedProduct.id.toUpperCase()}`;
                    navigator.clipboard?.writeText(skuCode);
                    addToast(language === 'bn' ? `SKU (${skuCode}) কপি করা হয়েছে` : `SKU (${skuCode}) copied`, 'info');
                  }}
                  className="text-slate-400 hover:text-slate-900 transition-colors p-0.5 rounded cursor-pointer"
                  title="Copy SKU"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {title}
            </h1>

            {/* Rating and Reviews Counter */}
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg font-bold border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{selectedProduct.rating}</span>
              </div>
              {productReviews.length > 0 && (
                <>
                  <span className="text-slate-500">
                    {selectedProduct.reviewCount || productReviews.length} {language === 'bn' ? 'টি কাস্টমার রিভিউ' : 'Customer Reviews'}
                  </span>
                  <span className="text-slate-300">|</span>
                </>
              )}
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {t.inStock} ({selectedProduct.stock} {language === 'bn' ? 'টি এভেইলেবল' : 'units left'})
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                {formatPrice(selectedProduct.price)}
              </span>
              {selectedProduct.originalPrice && (
                <span className="text-sm text-slate-400 line-through">
                  {formatPrice(selectedProduct.originalPrice)}
                </span>
              )}
            </div>

            {/* Description Short */}
            <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80">
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Size Selector */}
            {availableSizes.length > 0 && (
              <div className="space-y-2 p-3 bg-slate-50/90 rounded-2xl border border-slate-200/90">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{language === 'bn' ? 'সাইজ নির্বাচন করুন (Size):' : 'Select Size:'}</span>
                  </label>
                  <span className="text-xs font-bold text-indigo-700 bg-white px-2.5 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                    {selectedSize || (language === 'bn' ? 'সিলেক্ট করুন' : 'Select')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {availableSizes.map((sz) => {
                    const isSelected = selectedSize === sz;
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-600/20'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{sz}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {availableColors.length > 0 && (
              <div className="space-y-2 p-3 bg-slate-50/90 rounded-2xl border border-slate-200/90">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-600" />
                    <span>{language === 'bn' ? 'কালার / রঙ নির্বাচন করুন (Color):' : 'Select Color:'}</span>
                  </label>
                  <span className="text-xs font-bold text-amber-800 bg-white px-2.5 py-0.5 rounded-md border border-amber-200 shadow-2xs">
                    {selectedColor || (language === 'bn' ? 'সিলেক্ট করুন' : 'Select')}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  {availableColors.map((clr) => {
                    const isSelected = selectedColor === clr;
                    const hexCode = COLOR_HEX_MAP[clr.toLowerCase()] || COLOR_HEX_MAP[clr];
                    return (
                      <button
                        key={clr}
                        type="button"
                        onClick={() => setSelectedColor(clr)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs ring-2 ring-amber-600/20'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-amber-400 hover:bg-amber-50/40'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: hexCode || '#94A3B8' }}
                        />
                        <span>{clr}</span>
                        {isSelected && <Check className="w-3 h-3 text-white ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Variants Selector (Weight / Storage if any) */}
            {selectedProduct.variants && selectedProduct.variants.filter(v => v.type.toLowerCase() !== 'size' && v.type.toLowerCase() !== 'color').length > 0 && (
              <div className="space-y-3 pt-2">
                {selectedProduct.variants.filter(v => v.type.toLowerCase() !== 'size' && v.type.toLowerCase() !== 'color').map((v) => (
                  <div key={v.type} className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 capitalize">
                      {v.type}: {selectedVariants[v.type] || v.options[0]}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map((opt) => {
                        const isChosen = (selectedVariants[v.type] || v.options[0]) === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => handleVariantSelect(v.type, opt)}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                              isChosen
                                ? 'bg-[#00873E] text-white border-[#00873E] shadow-xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 pt-2">
              <span className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'পরিমাণ (Quantity):' : 'Quantity:'}
              </span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                <button
                  onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-slate-800 bg-white min-w-[36px] text-center">
                  {selectedQuantity}
                </span>
                <button
                  onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
              <button
                type="button"
                onClick={handleAddToCart}
                className="theme-btn-cart py-3.5 px-6 rounded-2xl text-sm sm:text-base font-black flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-md cursor-pointer group whitespace-nowrap"
              >
                <ShoppingBag className="w-5 h-5 transition-transform group-hover:scale-110 shrink-0" />
                <span className="whitespace-nowrap">{t.addToCart}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="theme-btn-buy theme-shimmer-effect py-3.5 px-6 rounded-2xl text-sm sm:text-base font-black flex items-center justify-center gap-2.5 transition-all active:scale-98 shadow-lg cursor-pointer group whitespace-nowrap"
              >
                <Zap className="w-5 h-5 text-amber-200 fill-amber-300 animate-pulse transition-transform group-hover:scale-110 shrink-0" />
                <span className="whitespace-nowrap">{t.buyNow}</span>
              </button>
            </div>

            {/* Wishlist & Share buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <button
                onClick={() => toggleWishlist(selectedProduct.id)}
                className={`flex items-center gap-1.5 font-semibold transition-colors ${
                  isSaved ? 'text-rose-600' : 'text-slate-600 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span>
                  {isSaved 
                    ? (language === 'bn' ? 'উইশলিস্টে সংরক্ষিত' : 'Saved in Wishlist') 
                    : (language === 'bn' ? 'উইশলিস্টে যোগ করুন' : 'Add to Wishlist')}
                </span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 font-semibold transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'শেয়ার করুন' : 'Share Product'}</span>
              </button>
            </div>
          </div>

          {/* Delivery & Shipping info block */}
          <div className="mt-6 p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>{selectedProduct.deliveryTime || (language === 'bn' ? '24-72 ঘণ্টা সমগ্র বাংলাদেশ' : '24-72 hours nationwide delivery')}</span>
              </div>
              {selectedProduct.isFreeShipping ? (
                <span className="text-[11px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full">
                  ফ্রি ডেলিভারি
                </span>
              ) : selectedProduct.shippingFee !== undefined ? (
                <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300">
                  ডেলিভারি চার্জ: {formatPrice(selectedProduct.shippingFee)}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-emerald-800">
                  ঢাকা {formatPrice(siteSettings.shippingFeeInsideDhaka ?? 60)} | ঢাকার বাইরে {formatPrice(siteSettings.shippingFeeOutsideDhaka ?? 120)}
                </span>
              )}
            </div>
            <div className="text-slate-600 text-[11px] flex items-center justify-between pt-1 border-t border-emerald-100">
              <span>{language === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD) উপলব্ধ।' : 'Cash on delivery (COD) available.'}</span>
              {siteSettings.freeShippingThreshold > 0 && !selectedProduct.isFreeShipping && (
                <span className="text-emerald-700 font-medium">
                  {formatPrice(siteSettings.freeShippingThreshold)} টাকার বেশি অর্ডারে ফ্রি ডেলিভারি
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications & Customer Reviews */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-3 sm:gap-6 border-b border-slate-200 pb-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('specs')}
            className={`text-sm sm:text-base font-bold pb-2 relative transition-colors whitespace-nowrap ${
              activeTab === 'specs'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {t.specifications}
          </button>
          <button
            onClick={() => setActiveTab('returns')}
            className={`text-sm sm:text-base font-bold pb-2 relative transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'returns'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'bn' ? 'রিটার্ন ও রিপ্লেসমেন্ট নিয়মাবলী' : 'Return Policy'}</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-sm sm:text-base font-bold pb-2 relative transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'reviews'
                ? 'text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{t.reviews}</span>
            {productReviews.length > 0 && (
              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                {productReviews.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Specifications & Description */}
        {activeTab === 'specs' && (
          <div className="space-y-6">
            {/* Full Product Description */}
            {description && (
              <div className="p-5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#00873E]" />
                  <span>{language === 'bn' ? 'পণ্যের পূর্ণাঙ্গ বিবরণ (Product Description)' : 'Product Description'}</span>
                </h4>
                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                  {description}
                </div>
              </div>
            )}

            {Object.keys(productSpecifications).length > 0 ? (
              <div className="space-y-2.5">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {language === 'bn' ? 'স্পেসিফিকেশন ও তথ্যসমূহ' : 'Specifications'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(productSpecifications)
                    .filter(([key, value]) => {
                      const k = key.toLowerCase();
                      const v = String(value || '').toLowerCase();
                      const forbidden = ['সোর্স', 'উৎস', 'পাইকারি', 'হোলসেল', 'লাভ', 'প্রফিট', 'দাম', 'shopbase', 'রিসেলার', '01929637253'];
                      return !forbidden.some(term => k.includes(term) || v.includes(term));
                    })
                    .map(([key, value]) => {
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
                        <div key={key} className="flex justify-between p-3 bg-slate-50 rounded-xl text-xs sm:text-sm border border-slate-100">
                          <span className="font-semibold text-slate-500">{key}</span>
                          <span className="font-bold text-slate-800 text-right">{cleanVal}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : null}

            {selectedProduct.warranty && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs sm:text-sm text-amber-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold">{language === 'bn' ? 'ওয়ারেন্টি পলিসি: ' : 'Warranty Policy: '}</span>
                  <span>{selectedProduct.warranty}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Return Policy & Rules */}
        {activeTab === 'returns' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <RotateCcw className="w-4 h-4 text-emerald-700" />
                  <span>৭ দিনের সহজ ফ্রি রিটার্ন ও রিপ্লেসমেন্ট পলিসি</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  পণ্য হাতে পাওয়ার পর সাইজ সমস্যা, কালার অমিল, কোনো ত্রুটি বা ডিফেক্ট থাকলে পণ্য ডেলিভারির ৭ দিনের মধ্যে সম্পূর্ণ ফ্রিতে রিটার্ন বা রিপ্লেসমেন্ট সুবিধা পাবেন।
                </p>
              </div>

              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <Truck className="w-4 h-4 text-blue-700" />
                  <span>ডেলিভারি ম্যানের সামনে পণ্য চেক করার সুযোগ</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ক্যাশ অন ডেলিভারিতে পার্সেল রিসিভ করার সময় ডেলিভারি রাইডারের সামনে প্যাকেট খুলে পণ্যটি দেখে নেওয়ার ১০০% সুযোগ রয়েছে।
                </p>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>১০০% মানিব্যাক ও রিফান্ড গ্যারান্টি</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  কোনো কারণে পণ্য পরিবর্তনের সুযোগ না থাকলে বা পণ্য স্টক-আউট থাকলে সম্পূর্ণ মূল্য বিকাশ বা নগদের মাধ্যমে রিফান্ড করা হবে।
                </p>
              </div>

              <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-purple-700" />
                  <span>রিটার্ন ও রিপ্লেসমেন্ট শর্তাবলী</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  পণ্যটি অব্যবহৃত অবস্থায় মূল ট্যাগ ও প্যাকেজিং সহ রাখতে হবে। আমাদের হেল্পলাইনে অথবা ওয়েবসাইটে অর্ডার ট্র্যাকিংয়ের মাধ্যমে যোগাযোগ করুন।
                </p>
              </div>
            </div>

            {selectedProduct.warranty && (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs sm:text-sm text-emerald-950 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-bold">অফিসিয়াল পলিসি: </span>
                  <span>{selectedProduct.warranty}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reviews & Rating breakdown */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Summary Rating */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-center sm:text-left">
                <div className="text-4xl font-black text-slate-900">{selectedProduct.rating}</div>
                <div className="flex items-center justify-center sm:justify-start gap-1 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(selectedProduct.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-slate-500">
                  {productReviews.length} {language === 'bn' ? 'টি যাচাইকৃত রেটিং' : 'verified ratings'}
                </p>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                {t.writeReview}
              </button>
            </div>

            {/* Write Review Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="p-5 bg-slate-50 rounded-2xl border border-emerald-300 space-y-4">
                <h4 className="text-sm font-bold text-slate-800">
                  {language === 'bn' ? 'আপনার মূল্যবান মতামত দিন' : 'Share your review'}
                </h4>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">
                    {language === 'bn' ? 'রেটিং দিন:' : 'Rating:'}
                  </span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder={language === 'bn' ? 'আপনার নাম' : 'Your name'}
                    className="p-2.5 text-xs bg-white border border-slate-300 text-slate-900 font-medium placeholder-slate-400 rounded-xl outline-none focus:border-emerald-600"
                  />
                </div>

                <textarea
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={language === 'bn' ? 'পণ্যটি সম্পর্কে আপনার বিস্তারিত অভিজ্ঞতা লিখুন...' : 'Write your detailed review here...'}
                  className="w-full p-2.5 text-xs bg-white border border-slate-300 text-slate-900 font-medium placeholder-slate-400 rounded-xl outline-none focus:border-emerald-600"
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
                  >
                    {language === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                  >
                    {language === 'bn' ? 'জমা দিন' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            {productReviews.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {productReviews.map((rev) => (
                  <div key={rev.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span>{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                <Check className="w-3 h-3" />
                                {t.verifiedPurchase}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">{rev.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating ? 'fill-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 pl-10 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-200">
                <p className="text-xs sm:text-sm text-slate-500">
                  {language === 'bn' ? 'এখনও কোনো কাস্টমার রিভিউ নেই। আপনার রিভিউ দিতে উপরের বাটনে চাপুন।' : 'No customer reviews yet. Click above to be the first to review!'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {t.relatedProducts}
            </h3>
            <button
              onClick={() => setCurrentPage('shop')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              {language === 'bn' ? 'আরও দেখুন' : 'See more'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.map((prod, idx) => (
              <ProductCard key={`related-${prod.id}-${idx}`} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Quick Purchase Bar */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2.5 shadow-[0_-6px_20px_rgba(0,0,0,0.1)] flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block uppercase leading-tight">
            {language === 'bn' ? 'মোট মূল্য' : 'Total'}
          </span>
          <span className="text-base font-black text-slate-900 leading-tight">
            {formatPrice(selectedProduct.price * selectedQuantity)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[270px]">
          <button
            type="button"
            onClick={handleAddToCart}
            className="theme-btn-cart flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-xs cursor-pointer whitespace-nowrap"
          >
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">{language === 'bn' ? 'কার্টে যোগ' : 'Add to Cart'}</span>
          </button>

          <button
            type="button"
            onClick={handleBuyNow}
            className="theme-btn-buy flex-1 py-2 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 shadow-md cursor-pointer whitespace-nowrap"
          >
            <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-300 shrink-0" />
            <span className="whitespace-nowrap">{language === 'bn' ? 'এখনই কিনুন' : 'Buy Now'}</span>
          </button>
        </div>
      </div>
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md p-4 select-none" 
          onClick={() => setLightboxImage(null)}
          onWheel={(e) => {
            const delta = e.deltaY < 0 ? 0.35 : -0.35;
            setLightboxZoom((prev) => Math.min(4, Math.max(1, +(prev + delta).toFixed(2))));
          }}
        >
          {/* Top Floating HD Zoom & Close Controls */}
          <div 
            className="absolute top-4 inset-x-4 max-w-2xl mx-auto flex items-center justify-between gap-3 bg-slate-900/95 border border-slate-700/80 rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-md text-white z-60"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ZoomIn className="w-4 h-4" />
                <span>{language === 'bn' ? 'আল্ট্রা এইচডি ভিউয়ার (৪K)' : 'Ultra HD 4K Viewer'}</span>
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                {Math.round(lightboxZoom * 100)}%
              </span>
              <span className="hidden sm:inline-block text-[10px] text-emerald-300/80 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                {language === 'bn' ? '✨ জুম করলেও ফাটবে না' : '✨ Crystal Clear'}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => Math.max(1, +(prev - 0.5).toFixed(2)))}
                disabled={lightboxZoom <= 1}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title={language === 'bn' ? 'জুম আউট' : 'Zoom Out'}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setLightboxZoom((prev) => Math.min(4, +(prev + 0.5).toFixed(2)))}
                disabled={lightboxZoom >= 4}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
                  title={`${level}x Zoom`}
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

          {/* Previous / Next Arrow Controls in Lightbox (when multiple images) */}
          {sanitizedImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const prevIdx = (activeImageIndex - 1 + sanitizedImages.length) % sanitizedImages.length;
                  setActiveImageIndex(prevIdx);
                  setLightboxImage(sanitizedImages[prevIdx]);
                  setLightboxZoom(1);
                  setLightboxPan({ x: 0, y: 0 });
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white border border-slate-700 shadow-xl transition-all cursor-pointer z-60"
                title={language === 'bn' ? 'পূর্ববর্তী ছবি' : 'Previous Image'}
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
                title={language === 'bn' ? 'পরবর্তী ছবি' : 'Next Image'}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Interactive Pan & Zoom Image Canvas */}
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
                transform: `scale(${lightboxZoom}) translate(${lightboxPan.x / lightboxZoom}px, ${lightboxPan.y / lightboxZoom}px)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                imageRendering: '-webkit-optimize-contrast' as any,
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl transition-transform" 
            />
          </div>
        </div>
      )}

      {/* Share Product Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base">
                <Share2 className="w-5 h-5 text-emerald-600" />
                <span>{language === 'bn' ? 'পণ্যটির লিংক শেয়ার করুন' : 'Share this Product'}</span>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={sanitizedImages[0]}
                alt={title}
                className="w-14 h-14 object-cover rounded-xl border border-slate-200 shrink-0"
              />
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-slate-900 truncate">{title}</h4>
                <p className="text-xs text-emerald-700 font-black mt-0.5">{formatPrice(selectedProduct.price)}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">SKU: {selectedProduct.sku ? selectedProduct.sku.toUpperCase() : `SBP-${selectedProduct.id}`}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">
                {language === 'bn' ? 'সরাসরি প্রডাক্ট লিঙ্ক:' : 'Direct Product Link:'}
              </label>
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
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                    copiedLink
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? (language === 'bn' ? 'কপি হয়েছে' : 'Copied') : (language === 'bn' ? 'কপি করুন' : 'Copy')}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${title}\nদাম: ${formatPrice(selectedProduct.price)}\nসরাসরি অর্ডার করতে ক্লিক করুন: ${productShareUrl}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productShareUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
              >
                <span>Facebook</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
