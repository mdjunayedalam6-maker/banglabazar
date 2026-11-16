import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Flame,
  ChevronDown,
  ArrowRight,
  Truck,
  Tag,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toBengaliNumber } from '../utils/translations';

export const Navbar: React.FC = () => {
  const {
    language,
    t,
    categories,
    currentPage,
    setCurrentPage,
    openCategory,
    setFilterState,
    openTrackOrder,
    addToast,
  } = useApp();

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [copiedPromo, setCopiedPromo] = useState(false);
  const catMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (page: any) => {
    setCurrentPage(page);
    setIsCategoryOpen(false);
  };

  const openFlashSale = () => {
    setFilterState((prev) => ({ ...prev, isFlashSaleOnly: true, category: 'all', searchQuery: '' }));
    setCurrentPage('shop');
  };

  const copyCouponCode = () => {
    navigator.clipboard?.writeText('BANGLABAZAR10');
    setCopiedPromo(true);
    addToast(
      language === 'bn' ? 'কুপন কোড "BANGLABAZAR10" কপি হয়েছে!' : 'Coupon "BANGLABAZAR10" copied!',
      'success'
    );
    setTimeout(() => setCopiedPromo(false), 2500);
  };

  return (
    <div className="bg-[#062919] border-t border-emerald-900/60 text-white select-none hidden md:block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 min-w-0">
          {/* Category Mega Dropdown Button */}
          <div ref={catMenuRef} className="relative shrink-0">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2 px-4 lg:px-5 py-3 bg-[#00873E] hover:bg-[#007033] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Menu className="w-4 h-4 shrink-0" />
              <span>{t.allCategories}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Category Dropdown List */}
            {isCategoryOpen && (
              <div className="absolute top-full left-0 w-76 bg-white text-slate-800 shadow-2xl rounded-b-2xl border border-slate-200/80 py-2 z-50">
                <div className="max-h-[420px] overflow-y-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        openCategory(cat.id);
                        setIsCategoryOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50/80 hover:text-[#00873E] text-xs font-semibold text-slate-700 transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={cat.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&auto=format&fit=crop&q=80'}
                          alt={cat.nameBn}
                          className="w-6 h-6 rounded-md object-cover border border-slate-200 shrink-0"
                        />
                        <span className="truncate">{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 group-hover:text-[#00873E] font-medium tabular-nums shrink-0 pl-2">
                        {language === 'bn' ? `${toBengaliNumber(cat.itemCount)}` : cat.itemCount}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="pt-2 mt-1 border-t border-slate-100 px-4 pb-1">
                  <button
                    onClick={() => {
                      setFilterState((prev) => ({ ...prev, category: 'all', subcategory: 'all', searchQuery: '' }));
                      setCurrentPage('shop');
                      setIsCategoryOpen(false);
                    }}
                    className="text-xs text-[#00873E] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>{language === 'bn' ? 'সব পণ্য এক সাথে দেখুন' : 'Browse All Products'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Nav Links */}
          <nav className="flex items-center gap-0.5 lg:gap-1 pl-2 text-xs lg:text-sm font-medium overflow-x-auto scrollbar-none">
            <button
              onClick={() => handleNavClick('home')}
              className={`px-2.5 lg:px-3 py-3 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentPage === 'home' ? 'text-amber-300 font-bold' : 'text-slate-200 hover:text-white'
              }`}
            >
              {t.home}
            </button>

            <button
              onClick={openFlashSale}
              className="flex items-center gap-1 px-2.5 lg:px-3 py-3 text-amber-300 hover:text-amber-200 transition-colors font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{t.flashSale}</span>
            </button>

            <button
              onClick={() => {
                setFilterState((prev) => ({ ...prev, category: 'all', subcategory: 'all', sortBy: 'featured', searchQuery: '', isFlashSaleOnly: false }));
                setCurrentPage('shop');
              }}
              className="px-2.5 lg:px-3 py-3 text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.bestSellers}
            </button>

            <button
              onClick={() => {
                setFilterState((prev) => ({ ...prev, category: 'all', subcategory: 'all', sortBy: 'newest', searchQuery: '', isFlashSaleOnly: false }));
                setCurrentPage('shop');
              }}
              className="px-2.5 lg:px-3 py-3 text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t.newArrivals}
            </button>

            <button
              onClick={() => openCategory('electronics-gadgets')}
              className="hidden lg:block px-3 py-3 text-emerald-200 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {language === 'bn' ? 'গ্যাজেট কর্নার' : 'Gadgets'}
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className={`px-2.5 lg:px-3 py-3 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentPage === 'about' ? 'text-amber-300 font-bold' : 'text-slate-200 hover:text-white'
              }`}
            >
              {t.aboutUs}
            </button>

            <button
              onClick={() => handleNavClick('contact')}
              className={`px-2.5 lg:px-3 py-3 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentPage === 'contact' ? 'text-amber-300 font-bold' : 'text-slate-200 hover:text-white'
              }`}
            >
              {t.contact}
            </button>

            <button
              onClick={() => openTrackOrder()}
              className="flex items-center gap-1.5 px-2.5 lg:px-3 py-3 text-emerald-300 hover:text-white transition-colors font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span>{language === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
            </button>
          </nav>
        </div>

        {/* Clean Copyable Coupon Trigger */}
        <button
          type="button"
          onClick={copyCouponCode}
          className="hidden xl:flex items-center gap-2 text-xs text-slate-200 hover:text-white transition-colors shrink-0 cursor-pointer"
          title={language === 'bn' ? 'ক্লিক করে কুপন কপি করুন' : 'Click to copy coupon'}
        >
          {copiedPromo ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Tag className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="text-slate-300">{language === 'bn' ? '১০% ছাড়:' : '10% Off:'}</span>
          <code className="font-mono font-bold text-amber-300 underline decoration-amber-400/50 underline-offset-4">
            BANGLABAZAR10
          </code>
        </button>
      </div>
    </div>
  );
};
