import React, { useState, useEffect } from 'react';
import { Flame, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { toBengaliNumber } from '../utils/translations';

export const FlashSaleSection: React.FC = () => {
  const { products, language, t, setFilterState, setCurrentPage } = useApp();

  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 36,
    seconds: 48,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const flashSaleProducts = React.useMemo(() => {
    const tagged = products.filter((p) => p.isFlashSale || (p.discountPercentage && p.discountPercentage > 0));
    return (tagged.length >= 4 ? tagged : products).slice(0, 4);
  }, [products]);

  if (flashSaleProducts.length === 0) return null;

  const formatDigit = (n: number) => {
    const str = n < 10 ? `0${n}` : `${n}`;
    return language === 'bn' ? toBengaliNumber(str) : str;
  };

  const handleViewAllFlashDeals = () => {
    setFilterState((prev) => ({
      ...prev,
      isFlashSaleOnly: true,
      category: 'all',
      searchQuery: '',
    }));
    setCurrentPage('shop');
  };

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6">
      <div className="bg-gradient-to-r from-[#062919] via-[#0B3E26] to-[#00873E] rounded-3xl p-4 sm:p-6 text-white mb-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-slate-950" />
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            {t.flashSale}
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-between md:justify-end gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-100">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>{t.endsIn}</span>
            </div>

            <div className="flex items-center gap-1 text-slate-900 font-black tabular-nums">
              <div className="bg-white rounded-xl px-2.5 py-1 text-sm min-w-[38px] text-center">
                {formatDigit(timeLeft.hours)}
                <span className="block text-[9px] font-medium text-slate-500">{t.hours}</span>
              </div>
              <span className="text-white font-bold">:</span>
              <div className="bg-white rounded-xl px-2.5 py-1 text-sm min-w-[38px] text-center">
                {formatDigit(timeLeft.minutes)}
                <span className="block text-[9px] font-medium text-slate-500">{t.mins}</span>
              </div>
              <span className="text-white font-bold">:</span>
              <div className="bg-white rounded-xl px-2.5 py-1 text-sm min-w-[38px] text-center text-[#DC2626]">
                {formatDigit(timeLeft.seconds)}
                <span className="block text-[9px] font-medium text-slate-500">{t.secs}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleViewAllFlashDeals}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-[#062919] hover:bg-emerald-50 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
          >
            <span>{language === 'bn' ? 'সব ডিল দেখুন' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {flashSaleProducts.map((product, idx) => (
          <ProductCard key={`flash-${product.id}-${idx}`} product={product} />
        ))}
      </div>
    </section>
  );
};
