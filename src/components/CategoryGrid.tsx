import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toBengaliNumber } from '../utils/translations';

export const CategoryGrid: React.FC = () => {
  const { categories, openCategory, language, setCurrentPage, setFilterState } = useApp();

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
          {language === 'bn' ? 'জনপ্রিয় ক্যাটাগরি' : 'Shop by Category'}
        </h2>

        <button
          onClick={() => {
            setFilterState((prev) => ({ ...prev, category: 'all', subcategory: 'all', searchQuery: '' }));
            setCurrentPage('shop');
          }}
          className="text-xs sm:text-sm font-bold text-[#00873E] hover:text-[#007033] flex items-center gap-1 group active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <span>{language === 'bn' ? 'সব দেখুন' : 'View All'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 3 cols mobile, 4 small tablet, 6 tablet, 11 desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2.5 sm:gap-3">
        {categories.map((cat) => {
          const displayName = language === 'bn' ? cat.nameBn : cat.nameEn;
          const countText = language === 'bn' ? `${toBengaliNumber(cat.itemCount)}টি` : `${cat.itemCount}`;
          const displayImage = cat.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format&fit=crop&q=80';

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => openCategory(cat.id)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-[#00873E]/60 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col text-center active:scale-98"
            >
              <div className="relative w-full aspect-square overflow-hidden bg-slate-100">
                <img
                  src={displayImage}
                  alt={displayName}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              <div className="p-2 flex flex-col items-center justify-center flex-1 w-full">
                <span
                  title={displayName}
                  className="text-xs font-bold text-slate-800 group-hover:text-[#00873E] transition-colors leading-snug line-clamp-2"
                >
                  {displayName}
                </span>
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-emerald-600 transition-colors mt-0.5 tabular-nums">
                  {countText}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
