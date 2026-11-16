import React, { useState } from 'react';
import {
  TrendingUp,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { DualCategoryShowcase } from './DualCategoryShowcase';
import { FlashSaleSection } from './FlashSaleSection';
import { isProductInCategory } from '../utils/categoryMatcher';

export const FeaturedSections: React.FC = () => {
  const {
    products,
    categories,
    isProductsLoading,
    language,
    setCurrentPage,
    setFilterState,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredFeatured = React.useMemo(() => {
    const inCategory = products.filter((p) =>
      isProductInCategory(p, activeTab, 'all', categories)
    );
    const featuredOnly = inCategory.filter((p) => p.isFeatured);
    return featuredOnly.length >= 4 ? featuredOnly : inCategory;
  }, [products, activeTab, categories]);

  const displayedFeatured = React.useMemo(() => {
    return filteredFeatured.slice(0, 12);
  }, [filteredFeatured]);

  const bestSellers = React.useMemo(() => {
    const list = products.filter((p) => p.isBestSeller);
    return (list.length >= 4 ? list : products).slice(0, 4);
  }, [products]);

  const newArrivals = React.useMemo(() => {
    const list = products.filter((p) => p.isNewArrival || p.isFlashSale);
    return (list.length >= 4 ? list : products.slice(4)).slice(0, 4);
  }, [products]);

  const featuredTabs = [
    { id: 'all', labelBn: 'সকল পণ্য', labelEn: 'All' },
    { id: 'womens-clothing', labelBn: 'মেয়েদের পোশাক', labelEn: 'Womenswear' },
    { id: 'mens-clothing', labelBn: 'ছেলেদের পোশাক', labelEn: 'Menswear' },
    { id: 'electronics-gadgets', labelBn: 'ইলেকট্রনিক্স', labelEn: 'Electronics' },
    { id: 'home-living', labelBn: 'গৃহ সামগ্রী', labelEn: 'Home Living' },
    { id: 'winter-collection', labelBn: 'শীতের কালেকশন', labelEn: 'Winter' },
  ];

  return (
    <div className="space-y-10 sm:space-y-12 pb-10">
      {/* 1. Featured Products with Real Category Tabs */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 gap-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'bn' ? 'জনপ্রিয় ও ফিচারড পণ্য' : 'Featured Products'}
          </h2>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
            {featuredTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[#00873E] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                {language === 'bn' ? tab.labelBn : tab.labelEn}
              </button>
            ))}
          </div>
        </div>

        {isProductsLoading && products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-3.5 border border-slate-200/80 space-y-3">
                <div className="w-full pt-[100%] bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : displayedFeatured.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {displayedFeatured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {filteredFeatured.length > displayedFeatured.length && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setFilterState((prev) => ({
                      ...prev,
                      category: activeTab,
                      subcategory: 'all',
                      searchQuery: '',
                    }));
                    setCurrentPage('shop');
                  }}
                  className="px-6 py-3 bg-white hover:bg-emerald-50 text-[#00873E] font-bold text-xs sm:text-sm rounded-xl border border-[#00873E]/30 hover:border-[#00873E] inline-flex items-center gap-2 transition-colors cursor-pointer tabular-nums"
                >
                  <span>
                    {language === 'bn'
                      ? `সবগুলো দেখুন (${filteredFeatured.length}টি পণ্য)`
                      : `View All Products (${filteredFeatured.length})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200/80 text-slate-500 text-sm">
            {language === 'bn' ? 'এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই।' : 'No products in this category yet.'}
          </div>
        )}
      </section>

      {/* 3. Flash Sale Countdown Showcase */}
      <FlashSaleSection />

      {/* 4. Dual Category Spotlight */}
      <DualCategoryShowcase />

      {/* 5. Best Sellers & New Arrivals */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Best Sellers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {language === 'bn' ? 'সেরা বিক্রিত পণ্য' : 'Best Sellers'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFilterState((prev) => ({ ...prev, category: 'all', sortBy: 'featured', searchQuery: '' }));
                  setCurrentPage('shop');
                }}
                className="text-xs font-bold text-[#00873E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'bn' ? 'সব দেখুন' : 'See all'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {bestSellers.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>

          {/* New Arrivals */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#00873E] flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {language === 'bn' ? 'নতুন কালেকশন' : 'New Arrivals'}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFilterState((prev) => ({ ...prev, category: 'all', sortBy: 'newest', searchQuery: '' }));
                  setCurrentPage('shop');
                }}
                className="text-xs font-bold text-[#00873E] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{language === 'bn' ? 'সব দেখুন' : 'See all'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {newArrivals.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
