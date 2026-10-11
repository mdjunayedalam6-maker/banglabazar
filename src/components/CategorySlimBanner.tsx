import React, { useMemo, useState, useRef, useEffect } from 'react';
import { 
  X,
  ArrowLeft,
  ChevronDown,
  Layers
} from 'lucide-react';
import { Category } from '../types';
import { toBengaliNumber } from '../utils/translations';
import { getSubcategoryImage } from '../utils/subcategoryImages';
import { useApp } from '../context/AppContext';

interface CategorySlimBannerProps {
  currentCategory: string; // 'all' or category id
  currentSubcategory: string; // 'all' or subcategory id
  categories: Category[];
  onSelectCategory: (catId: string) => void;
  onSelectSubcategory: (subcatId: string) => void;
  productsCount: number;
  language: 'bn' | 'en';
  searchQuery?: string;
  onClearSearch?: () => void;
  onResetFilters?: () => void;
}

export const CategorySlimBanner: React.FC<CategorySlimBannerProps> = ({
  currentCategory,
  currentSubcategory,
  categories,
  onSelectCategory,
  onSelectSubcategory,
  productsCount,
  language,
  searchQuery,
  onClearSearch,
}) => {
  const { products } = useApp();
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCatDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Find current category object
  const categoryObj = useMemo(() => {
    if (currentCategory === 'all') return null;
    return categories.find(
      (c) => c.id.toLowerCase() === currentCategory.toLowerCase() || c.slug.toLowerCase() === currentCategory.toLowerCase()
    );
  }, [currentCategory, categories]);

  const isSpecificCategory = Boolean(categoryObj && currentCategory !== 'all');

  return (
    <div className="space-y-2.5 select-none pt-1">
      {/* Search Filter Chip (Shown only when user is searching) */}
      {searchQuery && (
        <div className="flex items-center justify-between bg-emerald-50/90 border border-emerald-200/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-normal">
              {language === 'bn' ? 'অনুসন্ধানকৃত ফলাফল:' : 'Search results for:'}
            </span>
            <span className="font-bold text-[#00873E]">"{searchQuery}"</span>
            <span className="text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              {language === 'bn' ? toBengaliNumber(productsCount) : productsCount} {language === 'bn' ? 'টি পণ্য' : 'products'}
            </span>
          </div>
          {onClearSearch && (
            <button
              onClick={onClearSearch}
              className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 cursor-pointer transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'মুছে ফেলুন' : 'Clear'}</span>
            </button>
          )}
        </div>
      )}

      {/* CASE 1: SPECIFIC CATEGORY SELECTED (e.g. মেয়েদের পোশাক) -> NO BANNER! Clean navigation & subcategories */}
      {isSpecificCategory && categoryObj && (
        <div className="space-y-2">
          {/* Category Header Row with Breadcrumb & Quick Switcher */}
          <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-200/80">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => {
                  onSelectCategory('all');
                  onSelectSubcategory('all');
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                title={language === 'bn' ? 'সকল ক্যাটাগরিতে ফিরে যান' : 'Back to all categories'}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
              </button>

              <span className="text-slate-300 font-light hidden sm:inline">/</span>

              {/* Active Category Title */}
              <div className="flex items-center gap-2 truncate">
                <h1 className="text-base sm:text-lg font-black text-slate-900 truncate">
                  {language === 'bn' ? categoryObj.nameBn : categoryObj.nameEn}
                </h1>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                  {language === 'bn' ? toBengaliNumber(productsCount) : productsCount} {language === 'bn' ? 'টি পণ্য' : 'products'}
                </span>
              </div>
            </div>

            {/* Quick Switch to another category dropdown */}
            <div ref={dropdownRef} className="relative shrink-0">
              <button
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
              >
                <span>{language === 'bn' ? 'অন্য ক্যাটাগরি' : 'Switch Category'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isCatDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCatDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-40 max-h-72 overflow-y-auto animate-in fade-in duration-100">
                  <button
                    onClick={() => {
                      onSelectCategory('all');
                      onSelectSubcategory('all');
                      setIsCatDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold hover:bg-slate-50 flex items-center justify-between ${
                      currentCategory === 'all' ? 'text-emerald-700 bg-emerald-50' : 'text-slate-700'
                    }`}
                  >
                    <span>{language === 'bn' ? 'সকল পণ্য' : 'All Products'}</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCategory(c.id);
                        onSelectSubcategory('all');
                        setIsCatDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between ${
                        categoryObj.id === c.id ? 'text-emerald-700 font-bold bg-emerald-50/70' : 'text-slate-700'
                      }`}
                    >
                      <span>{language === 'bn' ? c.nameBn : c.nameEn}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {language === 'bn' ? `${toBengaliNumber(c.itemCount)}টি` : c.itemCount}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subcategory Navigation Pills (Scrollable horizontally with small images) */}
          {categoryObj.subcategories && categoryObj.subcategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none">
              {/* All Items in This Main Category */}
              <button
                onClick={() => onSelectSubcategory('all')}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  currentSubcategory === 'all'
                    ? 'bg-emerald-700 text-white shadow-xs scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <img
                  src={categoryObj.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&auto=format&fit=crop&q=80'}
                  alt={categoryObj.nameBn}
                  className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md object-cover shrink-0 ${
                    currentSubcategory === 'all' ? 'ring-1 ring-white/60' : 'border border-slate-200'
                  }`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&auto=format&fit=crop&q=80';
                  }}
                />
                <span>{language === 'bn' ? `সকল ${categoryObj.nameBn}` : 'All Items'}</span>
              </button>

              {/* Subcategories list with small dynamic images */}
              {categoryObj.subcategories.map((sub) => {
                const isSelected = 
                  currentSubcategory.toLowerCase() === sub.id.toLowerCase() || 
                  currentSubcategory.toLowerCase() === sub.nameBn.toLowerCase();

                const subImg = getSubcategoryImage(sub.id, sub.nameBn, sub.image, products, categoryObj.id);

                return (
                  <button
                    key={sub.id}
                    onClick={() => onSelectSubcategory(sub.id)}
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-emerald-700 text-white shadow-xs scale-[1.02]'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/90 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={subImg}
                      alt={sub.nameBn}
                      className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md object-cover shrink-0 ${
                        isSelected ? 'ring-1 ring-white/60' : 'border border-slate-200'
                      }`}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getSubcategoryImage(sub.id, sub.nameBn, undefined, undefined, categoryObj.id);
                      }}
                    />
                    <span>{language === 'bn' ? sub.nameBn : sub.nameEn}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CASE 2: ALL CATEGORIES VIEW (Clean horizontal pills for all 11 main categories) */}
      {!isSpecificCategory && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {/* All Categories Button */}
          <button
            onClick={() => {
              onSelectCategory('all');
              onSelectSubcategory('all');
            }}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              currentCategory === 'all'
                ? 'bg-[#00873E] text-white shadow-xs scale-[1.02]'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'bn' ? 'সকল ক্যাটাগরি' : 'All Categories'}</span>
            {currentCategory === 'all' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            )}
          </button>

          {/* 11 Main Category Buttons */}
          {categories.map((cat) => {
            const isSelected = currentCategory.toLowerCase() === cat.id.toLowerCase() || currentCategory.toLowerCase() === cat.slug.toLowerCase();
            const displayImg = cat.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&auto=format&fit=crop&q=80';

            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectSubcategory('all');
                }}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <img
                  src={displayImg}
                  alt={cat.nameBn}
                  className={`w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-md object-cover shrink-0 ${
                    isSelected ? 'ring-1 ring-white/60' : 'border border-slate-200'
                  }`}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100&auto=format&fit=crop&q=80';
                  }}
                />
                <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
