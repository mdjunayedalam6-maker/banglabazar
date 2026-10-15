import React from 'react';
import { 
  Smartphone, 
  Shirt, 
  ShoppingBag, 
  Home, 
  Sparkles, 
  BookOpen, 
  Activity, 
  Smile, 
  Heart,
  Gem,
  Snowflake,
  Calendar,
  Grid,
  ArrowRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { toBengaliNumber } from '../utils/translations';

const ICON_MAP: Record<string, any> = {
  Smartphone,
  Shirt,
  ShoppingBag,
  Home,
  Sparkles,
  BookOpen,
  Activity,
  Smile,
  Heart,
  Gem,
  Snowflake,
  Calendar,
  Grid,
};

export const CategoryGrid: React.FC = () => {
  const { categories, openCategory, language, setCurrentPage, setFilterState, products } = useApp();

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>{language === 'bn' ? 'প্রধান ক্যাটাগরি সমূহ' : 'Main Categories'}</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500">
            {language === 'bn' ? 'পছন্দের ক্যাটাগরি বেছে নিয়ে পণ্য দেখুন' : 'Explore products by categories'}
          </p>
        </div>

        <button
          onClick={() => {
            setFilterState((prev) => ({ ...prev, category: 'all', subcategory: 'all', searchQuery: '' }));
            setCurrentPage('shop');
          }}
          className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group active:scale-95 transition-all cursor-pointer"
        >
          <span>{language === 'bn' ? 'সব দেখুন' : 'View All'}</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 3 columns on mobile (user request), 4 on small tablet, 6 on md, 11 on desktop */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2 sm:gap-2.5">
        {categories.map((cat) => {
          const IconComponent = ICON_MAP[cat.iconName] || ShoppingBag;
          const displayName = language === 'bn' ? cat.nameBn : cat.nameEn;
          const countText = language === 'bn' ? `${toBengaliNumber(cat.itemCount)}টি` : `${cat.itemCount} items`;

          // Main Category Image: Always strictly display the uploaded category image, never auto-override with products
          const displayImage = cat.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format&fit=crop&q=80';

          return (
            <div
              key={cat.id}
              onClick={() => openCategory(cat.id)}
              className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all duration-300 cursor-pointer group flex flex-col active:scale-95 shadow-2xs"
            >
              {/* Large Rectangular Image Container */}
              <div className="relative w-full aspect-[4/3] sm:aspect-square overflow-hidden bg-slate-100">
                <img
                  src={displayImage}
                  alt={displayName}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&auto=format&fit=crop&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
                
                {/* Floating Glassmorphism Icon Badge */}
                <div className="absolute top-1.5 right-1.5 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/90 backdrop-blur-xs shadow-xs flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              {/* Title & Count Information */}
              <div className="p-1.5 sm:p-2.5 flex flex-col items-center justify-center text-center bg-white flex-1">
                <span
                  title={displayName}
                  className="text-[11.5px] sm:text-[13px] font-bold text-slate-800 group-hover:text-emerald-700 transition-colors leading-tight text-center line-clamp-2"
                >
                  {displayName}
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 group-hover:text-emerald-600 transition-colors mt-0.5">
                  {countText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
