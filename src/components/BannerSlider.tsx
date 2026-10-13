import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ArrowRight, 
  Tag,
  Flame,
  Pause,
  Play,
  Copy,
  Check,
  ShieldCheck,
  Truck
} from 'lucide-react';
import eidBannerImg from '../assets/images/oneroof_eid_banner_1789265637891.jpg';
import techBannerImg from '../assets/images/oneroof_tech_banner_1789265651663.jpg';
import { useApp } from '../context/AppContext';

interface BannerSlide {
  id: string;
  badgeBn?: string;
  badgeEn?: string;
  titleBn?: string;
  titleEn?: string;
  subtitleBn?: string;
  subtitleEn?: string;
  coupon?: string;
  discountTextBn?: string;
  discountTextEn?: string;
  btnTextBn?: string;
  btnTextEn?: string;
  categoryTarget: string;
  image: string;
  accentColor?: string;
  showTextOverlay?: boolean;
}

const SLIDES_DATA: BannerSlide[] = [
  {
    id: 'slide-eid',
    badgeBn: 'মেগা ফেস্টিভ অফার',
    badgeEn: 'Mega Festive Offer',
    titleBn: 'ঈদ ও বৈশাখী মহোৎসব স্পেশাল ধামাকা',
    titleEn: 'Eid & Festive Grand Celebration',
    subtitleBn: 'উৎসবের সেরা পোশাক, লাক্সারি পারফিউম, গিফট আইটেম ও হোম ডেকোরে অভাবনীয় ছাড়!',
    subtitleEn: 'Exclusive designer wear, premium perfumes, festive gifts and home styling at unbeatable prices!',
    coupon: 'EID70',
    discountTextBn: '70% পর্যন্ত মূল্যছাড়',
    discountTextEn: 'Up to 70% Off',
    btnTextBn: 'উৎসবের অফার উপভোগ করুন',
    btnTextEn: 'Explore Festive Deals',
    categoryTarget: 'fashion',
    image: eidBannerImg,
    accentColor: 'from-amber-500 to-amber-600',
    showTextOverlay: false,
  },
  {
    id: 'slide-tech',
    badgeBn: '100% অফিসিয়াল ওয়ারেন্টি',
    badgeEn: '100% Official Warranty',
    titleBn: 'ফ্ল্যাগশিপ গ্যাজেট ও স্মার্ট টেক কার্নিভাল',
    titleEn: 'Flagship Tech & Gadgets Carnival',
    subtitleBn: 'স্মার্টফোন, ওয়্যারলেস হেডফোন, ল্যাপটপ ও স্মার্টওয়াচে বিশেষ ক্যাশব্যাক ও সহজ ইএমআই।',
    subtitleEn: 'Official smartphones, noise-cancelling headphones, laptops & smartwatches with easy EMI.',
    coupon: 'TECH20',
    discountTextBn: 'ফ্ল্যাট 20% ক্যাশব্যাক',
    discountTextEn: 'Flat 20% Cashback',
    btnTextBn: 'টেক অফার দেখুন',
    btnTextEn: 'Discover Gadgets',
    categoryTarget: 'electronics',
    image: techBannerImg,
    accentColor: 'from-emerald-500 to-teal-600',
    showTextOverlay: false,
  },
  {
    id: 'slide-grocery',
    badgeBn: '1 ঘণ্টায় এক্সপ্রেস ডেলিভারি',
    badgeEn: '1-Hour Express Delivery',
    titleBn: 'খাঁটি দেশীয় খাদ্যপণ্য ও তাজা গ্রোসারি বাজার',
    titleEn: 'Pure Organic Staples & Groceries',
    subtitleBn: 'সুন্দরবনের প্রাকৃতিক মধু, ঘানিভাঙা সরিষার তেল, প্রিমিয়াম পোলাও চাল ও ফ্রেশ নিত্যপ্রয়োজনীয় বাজার।',
    subtitleEn: 'Pure natural honey, authentic cold-pressed mustard oil, aromatic rice & daily groceries delivered fast.',
    coupon: 'ORGANIC',
    discountTextBn: '৳200 ইনস্ট্যান্ট ডিসকাউন্ট',
    discountTextEn: 'Up to ৳200 Off',
    btnTextBn: 'মুদি বাজার অর্ডার করুন',
    btnTextEn: 'Shop Groceries',
    categoryTarget: 'grocery',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&h=600&auto=format&fit=crop&q=80',
    accentColor: 'from-green-500 to-emerald-600',
    showTextOverlay: false,
  },
  {
    id: 'slide-home',
    badgeBn: 'ফ্রি ইনস্টলেশন ও ডেলিভারি',
    badgeEn: 'Free Home Installation',
    titleBn: 'স্মার্ট হোম ও মডার্ন কিচেন অ্যাপ্লায়েন্স',
    titleEn: 'Modern Home & Kitchen Appliances',
    subtitleBn: 'ডিজিটাল এয়ার ফ্রায়ার, হেভি-ডিউটি ব্লেন্ডার, ওভেন ও কিচেন গ্যাজেটে অফিশিয়াল ওয়ারেন্টি।',
    subtitleEn: 'Top-rated air fryers, heavy-duty blenders, microwaves and kitchen gadgets with official service warranty.',
    coupon: 'HOME25',
    discountTextBn: '25% পর্যন্ত বিশেষ ছাড়',
    discountTextEn: 'Up to 25% Off',
    btnTextBn: 'হোম অ্যাপ্লায়েন্স দেখুন',
    btnTextEn: 'Shop Appliances',
    categoryTarget: 'home',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&h=600&auto=format&fit=crop&q=80',
    accentColor: 'from-blue-500 to-indigo-600',
    showTextOverlay: false,
  },
  {
    id: 'slide-beauty',
    badgeBn: '100% অথেনটিক কোরিয়ান ও গ্লোবাল',
    badgeEn: '100% Authentic Beauty',
    titleBn: 'গ্লো ও স্কিনকেয়ার ফেস্ট - মেগা ডিসকাউন্ট',
    titleEn: 'Glow & Skincare Fest - Mega Deals',
    subtitleBn: 'অরিজিনাল কোরিয়ান সিরাম, সানস্ক্রিন, ফেসওয়াশ ও প্রিমিয়াম কসমেটিক্সে আকর্ষণীয় ফ্রি উপহার।',
    subtitleEn: 'Original Korean serums, sunscreens, gentle face washes & global beauty brands with free gifts.',
    coupon: 'GLOW30',
    discountTextBn: 'বাই 1 গেট 1 / 30% ছাড়',
    discountTextEn: 'Buy 1 Get 1 / 30% Off',
    btnTextBn: 'বিউটি অফার দেখুন',
    btnTextEn: 'Shop Beauty',
    categoryTarget: 'beauty',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&h=600&auto=format&fit=crop&q=80',
    accentColor: 'from-pink-500 to-rose-600',
    showTextOverlay: false,
  },
  {
    id: 'slide-delivery',
    badgeBn: '24 ঘণ্টায় সারা দেশে ডেলিভারি',
    badgeEn: '24-Hour Express Shipping',
    titleBn: 'সুপার ফ্ল্যাশ ডিল ও ফ্রি হোম ডেলিভারি',
    titleEn: 'Super Flash Deals & Free Delivery',
    subtitleBn: '64 জেলায় দ্রুত ক্যাশ অন ডেলিভারি, পার্সেল খুলে দেখে পেমেন্ট করার শতভাগ নিশ্চয়তা।',
    subtitleEn: 'Fast cash on delivery across 64 districts in Bangladesh with open-box verification guarantee.',
    coupon: 'FLASHFREE',
    discountTextBn: 'ফ্রি হোম ডেলিভারি',
    discountTextEn: 'Free Delivery on ৳1000+',
    btnTextBn: 'সব হট ডিল দেখুন',
    btnTextEn: 'Explore Flash Deals',
    categoryTarget: 'electronics',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&h=600&auto=format&fit=crop&q=80',
    accentColor: 'from-amber-500 to-orange-600',
    showTextOverlay: false,
  },
];

const AUTO_PLAY_INTERVAL = 3800; // 3.8 seconds auto change

export const BannerSlider: React.FC = () => {
  const { language, openCategory, bannerSlides, addToast } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const slides = bannerSlides && bannerSlides.length > 0 ? bannerSlides : SLIDES_DATA;
  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setProgress(0);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    setProgress(0);
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const handleCopyCoupon = (code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    addToast(
      language === 'bn' 
        ? `কুপন কোড "${code}" কপি করা হয়েছে!` 
        : `Coupon code "${code}" copied!`, 
      'info'
    );
    setTimeout(() => {
      setCopiedCoupon(null);
    }, 2500);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartXRef.current || !touchEndXRef.current) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Automatic banner transition timer with progress bar
  useEffect(() => {
    if (isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }

    const stepMs = 50;
    const progressStep = (stepMs / AUTO_PLAY_INTERVAL) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + progressStep;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isPaused, nextSlide]);

  const activeSlide = slides[currentSlide] || slides[0];
  const hasTextOverlay = Boolean(activeSlide?.showTextOverlay && (activeSlide.titleBn || activeSlide.badgeBn));

  return (
    <section 
      className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pt-2 pb-1"
      aria-label="Promotional Showcase"
    >
      {/* Slim, Compact, Ultra-Modern Hero Banner Canvas */}
      <div 
        className={`relative w-full h-[165px] sm:h-[210px] md:h-[260px] lg:h-[300px] rounded-xl sm:rounded-2xl overflow-hidden shadow-md shadow-slate-900/10 bg-slate-950 border border-slate-800/80 group select-none transition-all duration-300 ${
          !hasTextOverlay ? 'cursor-pointer' : ''
        }`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (!hasTextOverlay) {
            openCategory(activeSlide.categoryTarget || 'all');
          }
        }}
      >
        {/* Background Slides with smooth cross-fade & subtle ken-burns zoom */}
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const slideHasText = Boolean(slide.showTextOverlay && (slide.titleBn || slide.badgeBn));

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background Cover Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
                style={{ backgroundImage: `url(${slide.image})` }}
              />

              {/* Multi-tier Cinematic Gradient Overlays - ONLY when text is requested */}
              {slideHasText && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/30 sm:to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-slate-950/40" />
                  <div className="absolute -left-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/15 blur-2xl pointer-events-none" />
                  <div className="absolute right-6 bottom-4 w-52 h-52 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
                </>
              )}
            </div>
          );
        })}

        {/* Foreground Content for Current Slide - Slim & Compact Layout (Only when text overlay is requested) */}
        {hasTextOverlay && (
          <div className="relative z-20 h-full flex items-center justify-between px-3.5 sm:px-8 md:px-12 text-white">
            {/* Left / Main Text & Action Column */}
            <div className="max-w-xl md:max-w-2xl flex flex-col justify-center py-2">
              {/* Top Badges Row */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5">
                {activeSlide.badgeBn && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600/90 text-white text-[10px] sm:text-xs font-bold shadow-xs backdrop-blur-md">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-300 animate-pulse" />
                    <span>{language === 'bn' ? activeSlide.badgeBn : activeSlide.badgeEn}</span>
                  </span>
                )}

                {activeSlide.discountTextBn && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black shadow-xs">
                    <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-slate-950 text-slate-950" />
                    <span>{language === 'bn' ? activeSlide.discountTextBn : activeSlide.discountTextEn}</span>
                  </span>
                )}

                {activeSlide.coupon && (
                  <button
                    type="button"
                    onClick={() => handleCopyCoupon(activeSlide.coupon)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-amber-300 text-[10px] sm:text-xs font-mono font-bold tracking-wider backdrop-blur-xs transition-colors cursor-pointer"
                    title="কুপন কপি করতে ক্লিক করুন"
                  >
                    <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
                    <span>{activeSlide.coupon}</span>
                    {copiedCoupon === activeSlide.coupon ? (
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
                    )}
                  </button>
                )}
              </div>

              {/* Main Headline - Sleek, Punchy & Clear */}
              {activeSlide.titleBn && (
                <h2 className="text-base sm:text-xl md:text-2xl lg:text-[26px] font-black leading-tight tracking-tight text-white drop-shadow-sm mb-1 sm:mb-1.5 line-clamp-1">
                  {language === 'bn' ? activeSlide.titleBn : activeSlide.titleEn}
                </h2>
              )}

              {/* Subtitle / Description - Single concise line */}
              {activeSlide.subtitleBn && (
                <p className="text-[11px] sm:text-xs md:text-sm text-slate-200 font-normal leading-tight mb-2 sm:mb-3 line-clamp-1 max-w-lg drop-shadow-xs">
                  {language === 'bn' ? activeSlide.subtitleBn : activeSlide.subtitleEn}
                </p>
              )}

              {/* Call to Action Button & Quick Highlight */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => openCategory(activeSlide.categoryTarget)}
                  className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-500 hover:to-emerald-400 text-white font-black text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span className="whitespace-nowrap">{language === 'bn' ? (activeSlide.btnTextBn || 'অফার দেখুন') : (activeSlide.btnTextEn || 'Shop Now')}</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-0.5 shrink-0" />
                </button>

                <div className="hidden xs:flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-300 font-medium">
                  <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                  <span>{language === 'bn' ? '100% অরিজিনাল' : '100% Original'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Desktop Glassmorphic Quick Pill (Compact & Elegant) */}
            <div className="hidden lg:flex flex-col items-end gap-2 pr-6">
              {activeSlide.coupon && (
                <div className="bg-slate-900/70 border border-white/15 backdrop-blur-md rounded-xl p-2.5 text-right shadow-lg">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    {language === 'bn' ? 'বিশেষ ছাড় কুপন' : 'Promo Coupon'}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCoupon(activeSlide.coupon)}
                    className="mt-1 flex items-center gap-1.5 bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    <span>{activeSlide.coupon}</span>
                    {copiedCoupon === activeSlide.coupon ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-amber-300" />
                    )}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[10px] text-slate-300 bg-white/10 backdrop-blur-sm px-2 py-0.5 rounded-full">
                <Truck className="w-3 h-3 text-emerald-400" />
                <span>{language === 'bn' ? 'দ্রুত হোম ডেলিভারি' : 'Fast Delivery'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Compact Navigation Arrows (Clean & Minimalist) */}
        <button
          onClick={prevSlide}
          className="absolute left-1.5 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/70 hover:bg-emerald-600 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all opacity-70 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer shadow"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-1.5 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900/70 hover:bg-emerald-600 text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-all opacity-70 group-hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer shadow"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>

        {/* Bottom Bar: Slide Progress, Dot Navigation & Pause Toggle */}
        <div className="absolute bottom-1.5 sm:bottom-2.5 left-4 sm:left-8 right-4 sm:right-8 z-30 flex items-center justify-between gap-2">
          {/* Micro Slide Indicator Dots */}
          <div className="flex items-center gap-1.5 bg-slate-950/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
            {slides.map((slide, index) => {
              const isSelected = currentSlide === index;
              return (
                <button
                  key={slide.id}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'w-5 sm:w-7 bg-gradient-to-r from-amber-400 to-emerald-400 shadow-xs shadow-amber-400/50' 
                      : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              );
            })}
          </div>

          {/* Micro Auto-Slide Progress Bar & Status Pill */}
          <div className="flex items-center gap-2 bg-slate-950/50 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/10 text-white text-[10px]">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-0.5 rounded-full hover:bg-white/10 transition-colors text-slate-300 hover:text-white cursor-pointer"
              title={isPaused ? 'স্বয়ংক্রিয় স্লাইড চালু করুন' : 'সাময়িকভাবে থামান'}
            >
              {isPaused ? <Play className="w-2.5 h-2.5 text-emerald-400" /> : <Pause className="w-2.5 h-2.5 text-amber-400" />}
            </button>

            <span className="font-mono text-slate-300">
              {currentSlide + 1}/{totalSlides}
            </span>

            {/* Micro Linear Progress bar */}
            <div className="w-10 sm:w-14 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all duration-75 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom edge glowing progress line */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-30">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-500 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </section>
  );
};
