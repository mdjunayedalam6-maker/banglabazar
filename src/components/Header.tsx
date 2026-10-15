import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, 
  X,
  ArrowLeft,
  MoreVertical, 
  ShoppingCart, 
  Heart, 
  User, 
  Truck, 
  ShieldCheck,
  Download,
  Smartphone,
  ExternalLink,
  Grid,
  PhoneCall,
  Store
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { MobileDrawer } from './MobileNav';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const Header: React.FC = () => {
  const {
    language,
    setCurrentPage,
    products,
    categories,
    setFilterState,
    viewProductDetails,
    formatPrice,
    siteSettings,
    cartItemsCount,
    wishlist,
    currentUser,
    isUserAdmin,
    loginAdmin,
    openTrackOrder,
    setIsAuthModalOpen,
    setIsCartDrawerOpen,
  } = useApp();
  const { isInstallable, isInstalled, install } = usePWAInstall();

  const [searchInput, setSearchInput] = useState('');
  const [selectedSearchCat, setSelectedSearchCat] = useState('all');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isThreeDotMenuOpen, setIsThreeDotMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const threeDotRef = useRef<HTMLDivElement>(null);

  // Filter auto-suggestions: matches Bengali, English, SKU code, brand, tags (memoized for instant typing response)
  const trimmedTerm = searchInput.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (trimmedTerm.length < 1) return [];

    const searchTokens = trimmedTerm.split(/\s+/).filter(Boolean);
    const matched: typeof products = [];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      if (selectedSearchCat !== 'all' && p.category !== selectedSearchCat) continue;

      const titleBn = (p.titleBn || '').toLowerCase();
      const titleEn = (p.titleEn || '').toLowerCase();
      const sku = p.sku ? String(p.sku).toLowerCase() : '';
      const id = String(p.id || '').toLowerCase();
      const brand = typeof p.brand === 'string' ? p.brand.toLowerCase() : '';
      const tags = Array.isArray(p.tags) ? p.tags.join(' ').toLowerCase() : '';
      const cat = String(p.category || '').toLowerCase();

      // Direct match
      const directMatch =
        titleBn.includes(trimmedTerm) ||
        titleEn.includes(trimmedTerm) ||
        sku.includes(trimmedTerm) ||
        id.includes(trimmedTerm) ||
        brand.includes(trimmedTerm) ||
        tags.includes(trimmedTerm) ||
        cat.includes(trimmedTerm);

      // Multi-token match if spaces are present
      const tokenMatch =
        !directMatch &&
        searchTokens.length > 1 &&
        searchTokens.every((token) =>
          titleBn.includes(token) ||
          titleEn.includes(token) ||
          sku.includes(token) ||
          brand.includes(token) ||
          tags.includes(token)
        );

      if (directMatch || tokenMatch) {
        matched.push(p);
        // Early stop when sufficient candidates found to keep memory & sorting ultra-light
        if (matched.length >= 30) break;
      }
    }

    return matched
      .sort((a, b) => {
        const aSku = a.sku ? String(a.sku).toLowerCase() : '';
        const bSku = b.sku ? String(b.sku).toLowerCase() : '';

        // 1. Exact SKU match gets top priority
        if (aSku === trimmedTerm && bSku !== trimmedTerm) return -1;
        if (bSku === trimmedTerm && aSku !== trimmedTerm) return 1;

        // 2. Partial SKU match gets high priority
        const aSkuMatch = aSku.includes(trimmedTerm);
        const bSkuMatch = bSku.includes(trimmedTerm);
        if (aSkuMatch && !bSkuMatch) return -1;
        if (!aSkuMatch && bSkuMatch) return 1;

        // 3. Title prefix match
        const aTitle = (a.titleBn || a.titleEn || '').toLowerCase();
        const bTitle = (b.titleBn || b.titleEn || '').toLowerCase();
        const aPrefix = aTitle.startsWith(trimmedTerm);
        const bPrefix = bTitle.startsWith(trimmedTerm);
        if (aPrefix && !bPrefix) return -1;
        if (!aPrefix && bPrefix) return 1;

        return 0;
      })
      .slice(0, 10);
  }, [products, trimmedTerm, selectedSearchCat]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (threeDotRef.current && !threeDotRef.current.contains(e.target as Node)) {
        setIsThreeDotMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsThreeDotMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setFilterState((prev) => ({
      ...prev,
      searchQuery: searchInput.trim(),
      category: selectedSearchCat,
    }));
    setIsSearchOpen(false);
    setCurrentPage('shop');
  };

  const handleSelectSuggestion = (prod: any) => {
    setIsSearchOpen(false);
    setSearchInput('');
    viewProductDetails(prod);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-200/80 transition-all">
      {/* Top Announcement Bar (Controllable via Secret Admin Panel) */}
      {siteSettings.showAnnouncementBar && (
        <div 
          className="text-white text-xs py-1.5 px-4 text-center font-medium transition-colors"
          style={{ backgroundColor: siteSettings.primaryColor }}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <span className="truncate">
              {language === 'bn' ? siteSettings.announcementTextBn : siteSettings.announcementTextEn}
            </span>
            {siteSettings.hotlineNumber && (
              <span className="shrink-0 text-[11px] opacity-90 hidden sm:inline">
                হটলাইন: {siteSettings.hotlineNumber}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Header Bar: Brand Logo on Left, Product Search & Find Button directly on Right */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: 3-Dot Navigation Toggle + Brand Logo (Hidden on mobile when search is open so search gets 100% full width like YouTube) */}
        <div className={`items-center gap-2 sm:gap-4 shrink-0 py-0.5 ${isSearchOpen ? 'hidden sm:flex' : 'flex'}`}>
          <div ref={threeDotRef} className="relative">
            <button
              onClick={() => {
                if (siteSettings.appDownloadUrl?.trim()) {
                  setIsThreeDotMenuOpen((prev) => !prev);
                } else {
                  setIsDrawerOpen(true);
                }
              }}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 focus:outline-none cursor-pointer relative"
              aria-label="Toggle Menu"
            >
              <MoreVertical className="w-6 h-6" />
              {siteSettings.appDownloadUrl?.trim() && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Dropdown Menu directly below Three-Dot Button */}
            {isThreeDotMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                {/* App Download / Install Action (Priority feature) */}
                {siteSettings.appDownloadUrl?.trim() && (
                  <div className="mb-2 p-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-xl shadow-md">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Download className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black leading-tight flex items-center gap-1.5">
                          <span className="truncate">{siteSettings.appNameBn || (language === 'bn' ? 'বাংলা বাজার মোবাইল অ্যাপ' : 'Bangla Bazar Mobile App')}</span>
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-white text-emerald-800 rounded">
                            APK
                          </span>
                        </div>
                        <p className="text-[10px] text-emerald-100 mt-0.5 leading-snug line-clamp-2">
                          {siteSettings.appSubtitleBn || (language === 'bn' ? 'সহজ ও দ্রুত কেনাকাটায় সরাসরি ডাউনলোড ও ইনস্টল করুন' : 'Fast and smooth shopping experience')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={siteSettings.appDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download
                      onClick={() => setIsThreeDotMenuOpen(false)}
                      className="mt-2.5 w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-emerald-50 text-emerald-800 rounded-lg text-xs font-black shadow-xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{language === 'bn' ? 'অ্যাপ ডাউনলোড বা ইনস্টল করুন' : 'Download / Install App'}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-600" />
                    </a>
                  </div>
                )}

                {/* Navigation Items */}
                <div className="space-y-0.5 text-xs font-medium text-slate-700">
                  <button
                    onClick={() => {
                      setIsDrawerOpen(true);
                      setIsThreeDotMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Grid className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-slate-800">{language === 'bn' ? 'সকল ক্যাটাগরি ও মেনু' : 'All Categories & Menu'}</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      {categories.length}টি
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      openTrackOrder();
                      setIsThreeDotMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-orange-50 text-orange-600 text-left transition-colors cursor-pointer font-bold"
                  >
                    <Truck className="w-4 h-4 text-orange-500" />
                    <span>{language === 'bn' ? 'লাইভ অর্ডার ট্র্যাকিং' : 'Track Order'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('about');
                      setIsThreeDotMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 text-left transition-colors cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-slate-500" />
                    <span>{language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentPage('contact');
                      setIsThreeDotMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 text-left transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 text-slate-500" />
                    <span>{language === 'bn' ? 'যোগাযোগ ও সাপোর্ট' : 'Contact & Support'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Brand Logo */}
          <div className="flex items-center">
            <BrandLogo onClick={() => setCurrentPage('home')} size="md" />
          </div>
        </div>

        {/* Right: Product Find & Search Section (Expands full-width on mobile like YouTube) */}
        <div 
          ref={searchRef} 
          className={
            isSearchOpen 
              ? 'fixed inset-x-0 top-0 z-50 h-16 bg-white px-2.5 sm:px-0 flex items-center shadow-lg sm:shadow-none border-b-2 border-emerald-600 sm:border-0 sm:relative sm:inset-auto sm:top-auto sm:h-auto sm:flex-1 sm:max-w-2xl' 
              : 'relative flex-1 max-w-2xl justify-end ml-auto'
          }
        >
          {!isSearchOpen ? (
            /* Standalone Search Button Icon - Only the Search Icon is shown until clicked */
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 80);
              }}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-gradient-to-tr from-[#00873E] to-[#059669] hover:from-[#007033] hover:to-[#047857] text-white shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-emerald-500/25 group"
              aria-label={language === 'bn' ? 'চার্জ বাটন (পণ্য বা SKU খুঁজুন)' : 'Search Button (Search products or SKU)'}
              title={language === 'bn' ? 'চার্জ বাটন: ক্লিক করে পণ্যের নাম বা SKU কোড দিয়ে খুঁজুন' : 'Click to search by name or SKU'}
            >
              <Search className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.4] transition-transform duration-200 group-hover:scale-110" />
            </button>
          ) : (
            /* Open Search Input with Auto-focus - Roomy, expansive YouTube-style search bar */
            <div className="relative w-full">
              <div className="w-full flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-150">
                {/* YouTube-style Back Arrow for Mobile and Exit button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchInput('');
                  }}
                  className="w-10 h-10 flex items-center justify-center text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-full transition-all cursor-pointer shrink-0 active:scale-90"
                  aria-label={language === 'bn' ? 'সার্চ বন্ধ করুন' : 'Back to normal'}
                  title={language === 'bn' ? 'সার্চ বন্ধ করুন' : 'Back'}
                >
                  <ArrowLeft className="w-5 h-5 stroke-[2.4]" />
                </button>

                {/* Main Search Input Form - Expands full width */}
                <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center group min-w-0">
                  <div className="relative flex w-full bg-slate-100 focus-within:bg-white rounded-full sm:rounded-2xl shadow-sm border-2 border-emerald-500 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-500/20 overflow-hidden h-11 sm:h-12 items-center transition-all">
                    {/* Category Select inside Search Input (Desktop only) */}
                    <div className="hidden md:flex items-center pl-2 bg-slate-50 border-r border-slate-200 h-full">
                      <select
                        value={selectedSearchCat}
                        onChange={(e) => setSelectedSearchCat(e.target.value)}
                        className="bg-transparent hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 px-2 focus:outline-none cursor-pointer transition-colors max-w-[130px] truncate"
                      >
                        <option value="all">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {language === 'bn' ? c.nameBn : c.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Leading Search Icon inside Input (Desktop) */}
                    <div className="hidden sm:flex pl-3 sm:pl-3.5 pr-1.5 text-emerald-600 items-center shrink-0">
                      <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                    </div>

                    {/* YouTube-style Roomy Search Input: large font, full width so typed text is 100% visible */}
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder={
                        language === 'bn'
                          ? 'পণ্যের নাম, ব্র্যান্ড বা SKU কোড লিখুন...'
                          : 'Search by product name, brand, or SKU...'
                      }
                      className="flex-1 min-w-0 bg-transparent py-2 pl-3.5 sm:pl-2 pr-2 text-base text-slate-900 placeholder:text-slate-400 placeholder:text-xs sm:placeholder:text-sm font-medium outline-none"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      autoFocus
                    />

                    {/* Prominent Instant Clear / Delete Button ("X") - Tap to immediately clear what you wrote */}
                    {searchInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput('');
                          searchInputRef.current?.focus();
                        }}
                        className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0 mr-1.5 active:scale-90"
                        aria-label={language === 'bn' ? 'লেখা মুছে ফেলুন' : 'Clear text'}
                        title={language === 'bn' ? 'লেখা মুছে ফেলুন' : 'Clear text'}
                      >
                        <X className="w-4 h-4 stroke-[2.8]" />
                      </button>
                    )}

                    {/* Search Submit Button */}
                    <button
                      type="submit"
                      className="h-full px-3.5 sm:px-5 bg-gradient-to-r from-[#00873E] to-[#046A31] hover:from-[#007033] hover:to-[#035526] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
                      aria-label={language === 'bn' ? 'অনুসন্ধান' : 'Search'}
                    >
                      <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      <span className="whitespace-nowrap">{language === 'bn' ? 'খুঁজুন' : 'Search'}</span>
                    </button>

                    {/* Close Expand Button (Desktop only) */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchInput('');
                      }}
                      className="hidden sm:flex h-full px-2.5 sm:px-3 text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors border-l border-slate-200 cursor-pointer items-center justify-center shrink-0"
                      title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </form>
              </div>

              {/* Auto-suggest dropdown showing live SKU and name matches */}
              {searchInput.trim().length >= 1 ? (
                <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white rounded-b-2xl sm:rounded-2xl shadow-2xl border border-slate-200/80 sm:border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {suggestions.length > 0 ? (
                    <div className="p-2 divide-y divide-slate-100 max-h-[calc(80vh-4rem)] sm:max-h-96 overflow-y-auto">
                      <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>{language === 'bn' ? 'পণ্য ও SKU ম্যাচিং' : 'Product & SKU Matches'}</span>
                        <span className="text-emerald-600 font-semibold">
                          {suggestions.length} {language === 'bn' ? 'টি পাওয়া গেছে' : 'found'}
                        </span>
                      </div>
                      {suggestions.map((prod) => {
                        const isSkuMatched = prod.sku && prod.sku.toLowerCase().includes(trimmedTerm);
                        return (
                          <div
                            key={prod.id}
                            onClick={() => handleSelectSuggestion(prod)}
                            className="flex items-center gap-3 p-2.5 hover:bg-emerald-50/70 rounded-xl cursor-pointer transition-colors group"
                          >
                            <img
                              src={
                                prod?.images?.[0]?.includes('shopbasebd.com')
                                  ? prod.images[0].replace('_S_', '_L_').replace(/\.jpg$/i, '.jpeg')
                                  : prod?.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=90'
                              }
                              alt={prod.titleBn || ''}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop&q=90';
                              }}
                              className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0 group-hover:scale-105 transition-transform shadow-2xs"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700">
                                {language === 'bn' ? prod.titleBn : prod.titleEn}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-[#DC2626] font-black">
                                  {formatPrice(prod.price)}
                                </span>
                                {prod.originalPrice && (
                                  <span className="text-slate-400 line-through text-[10px] font-normal">
                                    {formatPrice(prod.originalPrice)}
                                  </span>
                                )}
                                {prod.sku && (
                                  <span
                                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold border ${
                                      isSkuMatched
                                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-black'
                                        : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    }`}
                                  >
                                    {isSkuMatched ? `⚡ SKU: ${prod.sku}` : `SKU: ${prod.sku}`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-500 shrink-0 capitalize bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                              {prod.category}
                            </span>
                          </div>
                        );
                      })}
                      <div className="p-2 pt-2.5 text-center bg-slate-50">
                        <button
                          type="button"
                          onClick={handleSearchSubmit}
                          className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                        >
                          {language === 'bn' ? `"${searchInput}" দিয়ে সব ফলাফল দেখুন →` : `View all results for "${searchInput}" →`}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 text-center space-y-1">
                      <div className="text-xs font-bold text-slate-700">
                        {language === 'bn' ? `"${searchInput}" এর সাথে কোনো পণ্য মেলেনি` : `No products matching "${searchInput}"`}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {language === 'bn' ? 'সঠিক বানান লিখুন অথবা SKU কোড দিয়ে চেষ্টা করুন।' : 'Check the spelling or try searching with an SKU code.'}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute top-full left-0 right-0 mt-1 sm:mt-2 bg-white rounded-b-2xl sm:rounded-2xl shadow-2xl border border-slate-200/80 sm:border-slate-100 overflow-hidden z-50 p-3 sm:p-4 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>{language === 'bn' ? 'জনপ্রিয় সার্চসমূহ' : 'Popular Searches'}</span>
                    <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      💡 SKU কোড দিয়েও সার্চ করতে পারেন
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['স্যামসাং', 'পাঞ্জাবি', 'টিশার্ট', 'স্মার্টওয়াচ', 'হেডফোন', 'SBP-'].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchInput(tag);
                          searchInputRef.current?.focus();
                        }}
                        className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent rounded-full text-slate-600 transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Desktop Action Icons (Track, Admin, Cart, Wishlist, User) */}
        <div className="hidden md:flex items-center gap-3 shrink-0 pl-3">
          {/* In-App PWA Install Button on Desktop */}
          {isInstallable && !isInstalled && (
            <button
              onClick={() => install()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all border border-emerald-200 cursor-pointer shadow-2xs"
              title={language === 'bn' ? 'বাংলা বাজার অ্যাপ ইনস্টল করুন' : 'Install Bangla Bazar App'}
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
              <span>{language === 'bn' ? 'অ্যাপ ইনস্টল' : 'Install App'}</span>
            </button>
          )}

          {/* Universal Track Order Button */}
          <button
            onClick={() => openTrackOrder()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-[#FF6B00] text-slate-700 text-xs font-bold transition-all border border-slate-200 cursor-pointer"
            title={language === 'bn' ? 'অর্ডার লাইভ ট্র্যাক করুন' : 'Track Order'}
          >
            <Truck className="w-4 h-4 text-emerald-600" />
            <span className="hidden lg:inline">{language === 'bn' ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
          </button>

          {/* Admin Panel Button if Logged-in User is Admin */}
          {currentUser && isUserAdmin(currentUser) && (
            <button
              onClick={() => {
                loginAdmin();
                setCurrentPage('admin');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-sm transition-all cursor-pointer"
              title="এডমিন ড্যাশবোর্ডে প্রবেশ করুন"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>{language === 'bn' ? 'এডমিন' : 'Admin'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (currentUser) {
                setCurrentPage('profile');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title={language === 'bn' ? 'লগইন / রেজিস্ট্রেশন' : 'Login / Register'}
          >
            <User className="w-6 h-6" />
          </button>
          
          <button
            onClick={() => {
              if (currentUser) {
                setCurrentPage('profile');
              } else {
                setIsAuthModalOpen(true);
              }
            }}
            className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <Heart className="w-6 h-6" />
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="relative flex items-center gap-2 bg-[#00873E] hover:bg-[#007033] text-white px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-md shadow-emerald-900/10"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="font-bold text-sm hidden lg:inline">
              {language === 'bn' ? 'কার্ট' : 'Cart'}
            </span>
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#DC2626] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  );
};
