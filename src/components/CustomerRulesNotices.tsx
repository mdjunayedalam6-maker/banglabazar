import React, { useMemo, useState } from 'react';
import {
  ScrollText,
  Coins,
  Gift,
  Wallet,
  Share2,
  CheckCircle2,
  AlertCircle,
  Bell,
  ShieldCheck,
  Pin,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CustomerNoticeCategory } from '../types';

export const CustomerRulesNotices: React.FC = () => {
  const {
    customerNotices,
    language,
    setProfileActiveTab,
    setCurrentPage,
  } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<'all' | CustomerNoticeCategory>('all');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const sortedNotices = useMemo(() => {
    const filtered =
      categoryFilter === 'all'
        ? customerNotices
        : customerNotices.filter((n) => n.category === categoryFilter);

    return [...filtered].sort((a, b) => {
      if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
        return a.isPinned ? -1 : 1;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [customerNotices, categoryFilter]);

  const counts = useMemo(() => {
    return {
      all: customerNotices.length,
      notice: customerNotices.filter((n) => n.category === 'notice').length,
      rule: customerNotices.filter((n) => n.category === 'rule').length,
      condition: customerNotices.filter((n) => n.category === 'condition').length,
    };
  }, [customerNotices]);

  const getCategoryMeta = (cat: CustomerNoticeCategory) => {
    switch (cat) {
      case 'notice':
        return {
          labelBn: 'জরুরি নোটিশ',
          labelEn: 'Notice',
          textClass: 'text-amber-800',
          icon: Bell,
        };
      case 'rule':
        return {
          labelBn: 'আয়ের নিয়ম',
          labelEn: 'Earning Rule',
          textClass: 'text-[#00873E]',
          icon: CheckCircle2,
        };
      case 'condition':
        return {
          labelBn: 'শর্তাবলী',
          labelEn: 'Condition',
          textClass: 'text-rose-700',
          icon: AlertCircle,
        };
    }
  };

  const formatNoticeDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Section A: Structured Step-by-Step Customer Income Guide */}
      <section className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="bg-gradient-to-br from-[#062919] via-[#0B4626] to-[#046A31] p-6 sm:p-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <Coins className="w-4 h-4 shrink-0" />
                <span>{language === 'bn' ? 'গ্রাহক আয় নির্দেশিকা' : 'Customer Earning Guide'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                {language === 'bn'
                  ? 'বাংলা বাজার থেকে যেভাবে আয় করবেন ও টাকা তুলবেন'
                  : 'How to Earn Commission & Withdraw from Bangla Bazar'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                {language === 'bn'
                  ? 'কোনো ইনভেস্টমেন্ট ছাড়াই প্রোডাক্টের লিংক শেয়ার করে প্রতি সফল অর্ডারে ২% কমিশন ও বন্ধুদের রেফার করে নিয়মিত আয় করুন।'
                  : 'Earn 2% commission on every completed order from your shared product links plus ৳30 friend referral bonuses with zero investment.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setProfileActiveTab('referral')}
                className="min-h-[44px] px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>{language === 'bn' ? 'শেয়ার লিংক নিন' : 'Get Share Links'}</span>
              </button>
              <button
                type="button"
                onClick={() => setProfileActiveTab('wallet')}
                className="min-h-[44px] px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 border border-white/20 transition-colors cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>{language === 'bn' ? 'ওয়ালেট ও উত্তোলন' : 'Wallet & Cashout'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Structured Steps */}
        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-[#00873E] tabular-nums">ধাপ ০১</span>
              <Share2 className="w-4 h-4 text-[#00873E] shrink-0" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              যেকোনো প্রোডাক্টের পার্সোনাল লিংক শেয়ার করুন
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              লগইন থাকা অবস্থায় যেকোনো পণ্যের পেজ বা প্রোফাইলের <strong className="text-slate-800">শেয়ার ও রেফার আয়</strong> ট্যাব থেকে আপনার ইউনিক শেয়ার লিংক কপি করুন এবং ফেসবুক, হোয়াটসঅ্যাপ বা মেসেঞ্জারে পাঠান।
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-[#00873E] tabular-nums">ধাপ ০২</span>
              <Coins className="w-4 h-4 text-amber-600 shrink-0" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              একই লিংক থেকে আনলিমিটেড ২% কমিশন পান
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনার শেয়ার করা একটি লিংক থেকে যদি <strong className="text-slate-800">৫ জন বা তার বেশি</strong> কাস্টমার অর্ডার করে, তবে প্রত্যেকের পণ্যের দামের ওপর <strong className="text-slate-800">২% করে</strong> কমিশন আপনার একাউন্টে হিসাব হবে।
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-[#00873E] tabular-nums">ধাপ ০৩</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              ডেলিভারিতে অটো যোগ ও বাতিল হলে অটো কর্তন
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              কাস্টমার পণ্য হাতে পেয়ে অর্ডার সম্পূর্ণ (<strong className="text-slate-800">Delivered</strong>) হলে কমিশন অটোমেটিক আপনার ওয়ালেটে যোগ হবে। আর অর্ডার বাতিল (<strong className="text-slate-800">Cancelled</strong>) হলে সেই ২% কমিশন অটোমেটিক কেটে নেওয়া হবে।
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-[#00873E] tabular-nums">ধাপ ০৪</span>
              <Gift className="w-4 h-4 text-[#00873E] shrink-0" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">
              বন্ধু রেফার (৳৩০) ও টাকা উত্তোলন (সর্বনিম্ন ৳৫০)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              আপনার রেফার কোডে বন্ধু ১ম অর্ডার করলে <strong className="text-slate-800">৳৩০ বোনাস</strong> পাবেন। ওয়ালেটে <strong className="text-slate-800">৳৫০+</strong> জমলেই বিকাশ, নগদ, উপায় বা রকেটে তুলতে অথবা পণ্য কিনতে পারবেন।
            </p>
          </div>
        </div>
      </section>

      {/* Section B: Admin-Managed Official Rules, Conditions & Notices Board */}
      <section className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-[#00873E] shrink-0">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {language === 'bn' ? 'অফিশিয়াল নিয়ম, শর্ত ও নোটিশ বোর্ড' : 'Official Rules, Conditions & Notices'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {language === 'bn'
                  ? `মোট ${counts.all}টি প্রকাশিত বিজ্ঞপ্তি ও নীতিমালা`
                  : `${counts.all} published policies & notices`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage('shop')}
            className="min-h-[40px] px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#00873E]" />
            <span>{language === 'bn' ? 'শপ ব্রাউজ করুন' : 'Browse Shop'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Category Filter Bar */}
        <div className="px-5 sm:px-6 pt-4 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {(
            [
              { id: 'all', label: `সবগুলো (${counts.all})` },
              { id: 'notice', label: `নোটিশ (${counts.notice})` },
              { id: 'rule', label: `আয়ের নিয়ম (${counts.rule})` },
              { id: 'condition', label: `শর্তাবলী (${counts.condition})` },
            ] as const
          ).map((tab) => {
            const isSelected = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer tabular-nums ${
                  isSelected
                    ? 'bg-[#00873E] text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Notices / Rules List */}
        <div className="p-5 sm:p-6 space-y-4">
          {sortedNotices.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <ScrollText className="w-9 h-9 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">
                {language === 'bn'
                  ? 'এই বিভাগে কোনো নিয়ম বা নোটিশ নেই'
                  : 'No notices or rules found in this section'}
              </p>
              <p className="text-xs text-slate-500">
                {language === 'bn'
                  ? 'নতুন আপডেট প্রকাশিত হলে এখানে স্বয়ংক্রিয়ভাবে দেখা যাবে।'
                  : 'New notices published by admin will appear here automatically.'}
              </p>
            </div>
          ) : (
            sortedNotices.map((item) => {
              const meta = getCategoryMeta(item.category);
              const CatIcon = meta.icon;
              const showImage = Boolean(item.image && !failedImages[item.id]);

              return (
                <article
                  key={item.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white transition-colors space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 font-bold">
                      <CatIcon className={`w-4 h-4 shrink-0 ${meta.textClass}`} />
                      <span className={meta.textClass}>
                        {language === 'bn' ? meta.labelBn : meta.labelEn}
                      </span>
                      {item.isPinned && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold">
                            <Pin className="w-3.5 h-3.5" />
                            <span>গুরুত্বপূর্ণ</span>
                          </span>
                        </>
                      )}
                    </div>
                    <time className="text-[11px] text-slate-500 tabular-nums">
                      {formatNoticeDate(item.updatedAt || item.createdAt)}
                    </time>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {language === 'bn' ? item.titleBn : item.titleEn || item.titleBn}
                  </h3>

                  {showImage && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white max-w-2xl">
                      <img
                        src={item.image}
                        alt={item.titleBn}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [item.id]: true }))
                        }
                        className="w-full max-h-80 object-cover"
                      />
                    </div>
                  )}

                  <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {language === 'bn' ? item.contentBn : item.contentEn || item.contentBn}
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
