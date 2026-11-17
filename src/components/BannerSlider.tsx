import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEFAULT_BANNER_SLIDES } from '../data/defaultSiteSettings';

const AUTO_PLAY_INTERVAL = 4200;

export const BannerSlider: React.FC = () => {
  const { language, openCategory, bannerSlides } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  const slides =
    bannerSlides && bannerSlides.length > 0 ? bannerSlides : DEFAULT_BANNER_SLIDES;
  const totalSlides = slides.length;

  useEffect(() => {
    if (currentSlide >= totalSlides) {
      setCurrentSlide(0);
    }
  }, [currentSlide, totalSlides]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

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

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isPaused, totalSlides, nextSlide]);

  const activeSlide = slides[currentSlide] || slides[0];
  const hasTextOverlay = Boolean(
    activeSlide?.showTextOverlay &&
      (activeSlide.titleBn || activeSlide.titleEn || activeSlide.badgeBn)
  );

  const eyebrowParts = [
    language === 'bn' ? activeSlide?.badgeBn : activeSlide?.badgeEn,
    language === 'bn' ? activeSlide?.discountTextBn : activeSlide?.discountTextEn,
  ].filter(Boolean);

  return (
    <section
      className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 pb-1"
      aria-label="Promotional Showcase"
    >
      <div
        className={`relative w-full h-[190px] sm:h-[260px] md:h-[320px] lg:h-[360px] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-slate-200/80 shadow-xs group select-none ${
          !hasTextOverlay ? 'cursor-pointer' : ''
        }`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          if (!hasTextOverlay) {
            openCategory(activeSlide?.categoryTarget || 'all');
          }
        }}
      >
        {/* Background Photography Slides */}
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          const slideHasText = Boolean(
            slide.showTextOverlay && (slide.titleBn || slide.titleEn || slide.badgeBn)
          );
          const altTitle =
            (language === 'bn' ? slide.titleBn : slide.titleEn) || 'Bangla Bazar Banner';

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950 ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.image}
                alt={altTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />

              {slideHasText && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                </>
              )}
            </div>
          );
        })}

        {/* Clean Editorial Foreground Overlay */}
        {hasTextOverlay && activeSlide && (
          <div className="relative z-20 h-full flex items-center px-5 sm:px-10 md:px-14 text-white">
            <div className="max-w-lg sm:max-w-xl flex flex-col justify-center space-y-2 sm:space-y-3">
              {eyebrowParts.length > 0 && (
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-emerald-300 tracking-wide">
                  <span>{eyebrowParts.join(' · ')}</span>
                </div>
              )}

              {(activeSlide.titleBn || activeSlide.titleEn) && (
                <h2
                  className="text-lg sm:text-2xl md:text-3xl lg:text-[34px] font-bold leading-tight text-white drop-shadow-xs line-clamp-2"
                  style={{ textWrap: 'balance' }}
                >
                  {language === 'bn' ? activeSlide.titleBn : activeSlide.titleEn}
                </h2>
              )}

              {(activeSlide.subtitleBn || activeSlide.subtitleEn) && (
                <p className="text-xs sm:text-sm text-slate-200/95 leading-snug line-clamp-2 max-w-md hidden sm:block">
                  {language === 'bn' ? activeSlide.subtitleBn : activeSlide.subtitleEn}
                </p>
              )}

              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCategory(activeSlide.categoryTarget || 'all');
                  }}
                  className="min-h-[40px] px-4 sm:px-5 py-2 rounded-xl bg-[#00873E] hover:bg-[#007033] text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors active:scale-98 cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                >
                  <span>
                    {language === 'bn'
                      ? activeSlide.btnTextBn || 'কালেকশন দেখুন'
                      : activeSlide.btnTextEn || 'Shop Now'}
                  </span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Minimalist Prev / Next Arrows */}
        {totalSlides > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevSlide();
              }}
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-950/55 hover:bg-[#00873E] text-white flex items-center justify-center backdrop-blur-xs border border-white/15 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextSlide();
              }}
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-slate-950/55 hover:bg-[#00873E] text-white flex items-center justify-center backdrop-blur-xs border border-white/15 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100 cursor-pointer"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Clean Bottom Dot Navigation & Quiet Pause Control */}
        {totalSlides > 1 && (
          <div className="absolute bottom-2.5 sm:bottom-3.5 left-5 sm:left-10 right-5 sm:right-10 z-30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {slides.map((slide, index) => {
                const isSelected = currentSlide === index;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToSlide(index);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      isSelected ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsPaused(!isPaused);
              }}
              className="w-7 h-7 rounded-full bg-slate-950/45 hover:bg-slate-950/70 text-white/85 hover:text-white flex items-center justify-center border border-white/15 transition-colors cursor-pointer"
              aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
            >
              {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
