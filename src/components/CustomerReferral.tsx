import React, { useState, useMemo } from 'react';
import {
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Smartphone,
  MessageCircle,
  ShoppingBag,
  Wallet,
  Search,
  Coins,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CustomerReferral: React.FC = () => {
  const {
    currentUser,
    products,
    getUserReferralStats,
    getUserAffiliateStats,
    getProductShareUrl,
    applyReferralCode,
    formatPrice,
    language,
    addToast,
    setProfileActiveTab,
    setCurrentPage,
    viewProductDetails,
  } = useApp();

  const [earnSubTab, setEarnSubTab] = useState<'affiliate' | 'referral'>('affiliate');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [productQuery, setProductQuery] = useState('');

  if (!currentUser) return null;

  const refStats = getUserReferralStats(currentUser);
  const affStats = getUserAffiliateStats(currentUser);
  const referralCode = affStats.referralCode;

  const baseUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://banglabazarbd.vercel.app';
  const referralUrl = `${baseUrl}/?ref=${referralCode}`;

  const matchedShareProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    const list = q
      ? products.filter(
          (p) =>
            (p.titleBn || '').toLowerCase().includes(q) ||
            (p.titleEn || '').toLowerCase().includes(q) ||
            (p.sku || '').toLowerCase().includes(q) ||
            (p.id || '').toLowerCase().includes(q)
        )
      : products.filter((p) => p.price > 0).slice(0, 6);
    return list.slice(0, 6);
  }, [products, productQuery]);

  const handleCopy = (text: string, key: string, successLabel?: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(key);
    addToast(
      successLabel ||
        (language === 'bn' ? 'লিংক কপি করা হয়েছে!' : 'Link copied to clipboard!'),
      'success'
    );
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleApplyManualCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;
    setIsApplyingCode(true);
    const result = applyReferralCode(manualCodeInput.trim());
    if (result.success) {
      addToast(result.message, 'success');
      setManualCodeInput('');
    } else {
      addToast(result.message, 'error');
    }
    setIsApplyingCode(false);
  };

  const whatsappInviteHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `বাংলা বাজারে কেনাকাটা করুন এবং ফ্রি ৳৫০ ওয়েলকাম বোনাস পান! আমার রেফারেল লিংক থেকে এখনই একাউন্ট খুলুন:\n${referralUrl}`
  )}`;

  const facebookInviteHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    referralUrl
  )}`;

  const smsInviteHref = `sms:?body=${encodeURIComponent(
    `বাংলা বাজারে কেনাকাটায় পান ৫০ টাকা বোনাস! আমার লিংক থেকে একাউন্ট খুলুন: ${referralUrl}`
  )}`;

  return (
    <div className="space-y-6">
      {/* Segmented Switcher: Product Share 2% vs Friend Referral */}
      <div className="bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => setEarnSubTab('affiliate')}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            earnSubTab === 'affiliate'
              ? 'bg-white text-[#00873E] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Coins className="w-4 h-4 shrink-0" />
          <span>{language === 'bn' ? 'প্রোডাক্ট শেয়ার (২% আয়)' : 'Product Share (2%)'}</span>
        </button>

        <button
          type="button"
          onClick={() => setEarnSubTab('referral')}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            earnSubTab === 'referral'
              ? 'bg-white text-[#00873E] shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gift className="w-4 h-4 shrink-0" />
          <span>{language === 'bn' ? 'বন্ধু রেফার (৳৩০ বোনাস)' : 'Friend Referral (৳30)'}</span>
        </button>
      </div>

      {/* ======================================================= */}
      {/* TAB 1: PRODUCT SHARE & EARN 2% COMMISSION DASHBOARD     */}
      {/* ======================================================= */}
      {earnSubTab === 'affiliate' && (
        <div className="space-y-6">
          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#062919] via-[#0B4626] to-[#046A31] p-6 sm:p-8 text-white shadow-xl border border-emerald-700/40">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Coins className="w-4 h-4" />
                  <span>{language === 'bn' ? 'শেয়ার ও ২% কমিশন আয়' : 'Share & Earn 2%'}</span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-snug">
                  যেকোনো প্রোডাক্ট শেয়ার করে আয় করুন{' '}
                  <span className="text-amber-300">২% ক্যাশ কমিশন</span>
                </h2>

                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  একই লিংক থেকে ৫ জন বা ১০০ জন — যতজন কাস্টমার অর্ডার করবে, প্রত্যেকের পণ্যের মূল্যের ২%
                  কমিশন অর্ডার ডেলিভারি হওয়ার সাথে সাথে অটোমেটিক আপনার ওয়ালেটে যোগ হবে। অর্ডার বাতিল হলে
                  কমিশনটি অটোমেটিক কেটে নেওয়া হবে।
                </p>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage('shop')}
                    className="min-h-[42px] px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>পণ্য বেছে শেয়ার করুন</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileActiveTab('wallet')}
                    className="min-h-[42px] px-4 py-2 bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>টাকা উত্তোলন করুন (৳{currentUser.balance || 0})</span>
                  </button>
                </div>
              </div>

              {/* Balance Summary Box */}
              <div className="bg-emerald-950/80 backdrop-blur-md rounded-2xl p-5 border border-emerald-600/40 text-center shrink-0 min-w-[220px]">
                <span className="text-xs text-emerald-300 font-semibold block mb-1">
                  মোট অর্জিত ২% কমিশন
                </span>
                <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight tabular-nums">
                  {formatPrice(affStats.creditedCommission)}
                </div>
                <div className="text-[11px] text-emerald-200/85 mt-1.5 tabular-nums">
                  সফল অর্ডার: {affStats.creditedOrdersCount}টি · অপেক্ষমাণ:{' '}
                  {formatPrice(affStats.pendingCommission)}
                </div>
                <button
                  type="button"
                  onClick={() => setProfileActiveTab('wallet')}
                  className="mt-3.5 w-full min-h-[38px] py-2 bg-white text-slate-950 hover:bg-emerald-50 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5 text-[#00873E]" />
                  <span>ওয়ালেট ও উত্তোলন</span>
                </button>
              </div>
            </div>
          </div>

          {/* How 2% Commission Works */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#00873E]" />
              <span>কীভাবে ২% কমিশন কাজ করে</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="font-bold text-slate-900">১. প্রোডাক্ট লিংক শেয়ার করুন</div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  নিচ থেকে অথবা যেকোনো প্রোডাক্টের পেজ থেকে আপনার আয়ের লিংক কপি করে বন্ধু বা কাস্টমারকে পাঠান।
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="font-bold text-slate-900">২. ডেলিভারিতে অটো ২% যোগ</div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  সেই লিংক থেকে যতজন কিনে ডেলিভারি পাবে, প্রত্যেকের ২% অটো আপনার ওয়ালেটে যোগ হবে।
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <div className="font-bold text-slate-900">৩. বাতিল হলে কর্তন · নাহলে উত্তোলন</div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  অর্ডার বাতিল হলে কমিশন কেটে যাবে। জমানো টাকা বিকাশ/নগদ/উপায়ে সহজেই তুলে নিতে পারবেন।
                </p>
              </div>
            </div>
          </div>

          {/* 4 Affiliate KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1.5">
                <span className="text-xs font-bold">মোট শেয়ার অর্ডার</span>
                <ShoppingBag className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 tabular-nums">
                {affStats.totalSharedOrders}টি
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">আপনার লিংকের মাধ্যমে</div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-emerald-700 mb-1.5">
                <span className="text-xs font-bold">ওয়ালেটে যোগ (২%)</span>
                <CheckCircle2 className="w-4 h-4 text-[#00873E]" />
              </div>
              <div className="text-2xl font-black text-[#00873E] tabular-nums">
                {formatPrice(affStats.creditedCommission)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                {affStats.creditedOrdersCount}টি ডেলিভারি সম্পন্ন
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-amber-700 mb-1.5">
                <span className="text-xs font-bold">অপেক্ষমাণ (Pending)</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-amber-600 tabular-nums">
                {formatPrice(affStats.pendingCommission)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                {affStats.pendingOrdersCount}টি অর্ডার চলমান
              </div>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-rose-700 mb-1.5">
                <span className="text-xs font-bold">বাতিল / কর্তন</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-2xl font-black text-rose-600 tabular-nums">
                {formatPrice(affStats.deductedCommission)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                {affStats.cancelledOrDeductedCount}টি অর্ডার বাতিল
              </div>
            </div>
          </div>

          {/* Instant Product Share Link Generator */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  তাৎক্ষণিক প্রোডাক্ট আয়ের লিংক তৈরি করুন
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  যেকোনো পণ্যের নাম বা কোড লিখে খুঁজুন এবং ২% আয়ের লিংক কপি করুন
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={productQuery}
                  onChange={(e) => setProductQuery(e.target.value)}
                  placeholder="প্রোডাক্ট খুঁজুন..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-[#00873E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchedShareProducts.map((prod) => {
                const comm2Percent = Math.round(Number(prod.price || 0) * 0.02 * 100) / 100;
                const prodUrl = getProductShareUrl(prod.id);
                const isCopied = copiedType === `prod-${prod.id}`;
                const imgUrl = prod.images?.[0] || prod.image || '';

                return (
                  <div
                    key={prod.id}
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-3"
                  >
                    <img
                      src={imgUrl}
                      alt={prod.titleBn}
                      referrerPolicy="no-referrer"
                      onClick={() => viewProductDetails(prod)}
                      className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0 cursor-pointer bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => viewProductDetails(prod)}
                        className="text-xs font-bold text-slate-900 truncate block w-full text-left hover:text-[#00873E] cursor-pointer"
                      >
                        {prod.titleBn || prod.titleEn}
                      </button>
                      <div className="text-[11px] text-slate-600 mt-0.5 tabular-nums">
                        দাম: <strong className="text-slate-900">{formatPrice(prod.price)}</strong> · ২% আয়:{' '}
                        <strong className="text-[#00873E]">+{formatPrice(comm2Percent)}</strong>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              prodUrl,
                              `prod-${prod.id}`,
                              'প্রোডাক্ট আয়ের লিংক কপি হয়েছে! প্রতিটি অর্ডারে ২% কমিশন পাবেন।'
                            )
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                            isCopied
                              ? 'bg-[#062919] text-white'
                              : 'bg-[#00873E] hover:bg-[#007033] text-white'
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
                        </button>

                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `${prod.titleBn}\nদাম: ${formatPrice(prod.price)}\n${prodUrl}`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-emerald-50 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3 text-[#00873E]" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shared-Link Orders & Commission Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  শেয়ার লিংক থেকে আসা অর্ডার ও কমিশনের তালিকা
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  কোনো সীমা নেই — আপনার শেয়ার করা লিংক থেকে প্রতিটি ডেলিভারিতে ২% এখানে যুক্ত হবে
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProfileActiveTab('wallet')}
                className="text-xs font-bold text-[#00873E] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>ওয়ালেটে যান</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {affStats.entries.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <Coins className="w-9 h-9 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-700">
                  এখনও আপনার শেয়ার করা লিংক থেকে কোনো অর্ডার আসেনি
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  উপরের তালিকা বা শপ থেকে যেকোনো প্রোডাক্টের লিংক শেয়ার করুন। কাস্টমার অর্ডার করলে এখানে
                  সাথে সাথে দেখা যাবে।
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                      <th className="py-3 px-4">অর্ডার</th>
                      <th className="py-3 px-4">পণ্য</th>
                      <th className="py-3 px-4">ক্রেতা</th>
                      <th className="py-3 px-4">পণ্যের মূল্য</th>
                      <th className="py-3 px-4">কমিশন (২%)</th>
                      <th className="py-3 px-4 text-right">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {affStats.entries.map((entry) => (
                      <tr key={`${entry.orderId}-${entry.createdAt}`} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono font-bold text-slate-900">#{entry.orderId}</div>
                          <div className="text-[11px] text-slate-500">{entry.date}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[220px]">
                          <div className="font-semibold text-slate-900 truncate">
                            {entry.productTitles[0] || 'পণ্য'}
                          </div>
                          {entry.productTitles.length > 1 && (
                            <div className="text-[11px] text-slate-500">
                              +{entry.productTitles.length - 1}টি আরও পণ্য ({entry.itemCount} পিস)
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{entry.buyerName}</div>
                          <div className="text-[11px] font-mono text-slate-500">{entry.buyerPhone}</div>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                          {formatPrice(entry.commissionBaseAmount)}
                        </td>
                        <td className="py-3.5 px-4 font-extrabold tabular-nums whitespace-nowrap">
                          {entry.commissionStatus === 'credited' ? (
                            <span className="text-[#00873E]">+{formatPrice(entry.commissionAmount)}</span>
                          ) : entry.commissionStatus === 'deducted' ? (
                            <span className="text-rose-600 line-through">
                              -{formatPrice(entry.commissionAmount)}
                            </span>
                          ) : entry.commissionStatus === 'cancelled' ? (
                            <span className="text-slate-400 line-through">
                              {formatPrice(entry.commissionAmount)}
                            </span>
                          ) : (
                            <span className="text-amber-600">{formatPrice(entry.commissionAmount)}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {entry.commissionStatus === 'credited' && (
                            <span className="text-[11px] font-bold text-[#00873E]">
                              ডেলিভারি সম্পন্ন · ওয়ালেটে যোগ
                            </span>
                          )}
                          {entry.commissionStatus === 'pending' && (
                            <span className="text-[11px] font-bold text-amber-700">
                              চলমান · ডেলিভারির অপেক্ষায়
                            </span>
                          )}
                          {entry.commissionStatus === 'deducted' && (
                            <span className="text-[11px] font-bold text-rose-600">
                              বাতিল · ওয়ালেট থেকে কর্তন
                            </span>
                          )}
                          {entry.commissionStatus === 'cancelled' && (
                            <span className="text-[11px] font-semibold text-slate-500">
                              অর্ডার বাতিল
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* TAB 2: FRIEND REFERRAL PROGRAM (৳30 BONUS)              */}
      {/* ======================================================= */}
      {earnSubTab === 'referral' && (
        <div className="space-y-6">
          {/* Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-[#0B4626] to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-700/40">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-xl">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Gift className="w-4 h-4" />
                  <span>রেফার ও ক্যাশ আয়</span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
                  বন্ধুকে রেফার করলেই প্রতি রেফারে <span className="text-amber-300">৳৩০ ক্যাশ!</span>
                </h2>

                <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                  বন্ধু পাবে ৫০ টাকা স্বাগতম বোনাস, আর বন্ধুর ১ম অর্ডারে আপনি পাবেন ৩০ টাকা সরাসরি ওয়ালেটে।
                </p>
              </div>

              <div className="bg-emerald-950/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-emerald-600/40 text-center shrink-0 min-w-[200px]">
                <span className="text-xs text-emerald-300 font-bold block mb-1">মোট রেফারেল আয়</span>
                <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight tabular-nums">
                  {formatPrice(refStats.totalEarnings)}
                </div>
                <div className="text-[11px] text-emerald-200/80 mt-1 tabular-nums">
                  {refStats.successfulReferrals} জনের ১ম অর্ডার সম্পন্ন
                </div>
                <button
                  type="button"
                  onClick={() => setProfileActiveTab('wallet')}
                  className="mt-3 w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>ওয়ালেট দেখুন</span>
                </button>
              </div>
            </div>
          </div>

          {/* Code & Direct Share Link */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                আপনার রেফারেল কোড
              </span>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-mono font-black text-lg text-slate-900 tracking-wider flex-1">
                  {referralCode}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(referralCode, 'code', 'রেফারেল কোড কপি করা হয়েছে!')}
                  className="px-3.5 py-2 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedType === 'code' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedType === 'code' ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                </button>
              </div>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                আপনার রেফারেল লিংক
              </span>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="bg-transparent text-xs text-slate-700 font-mono w-full focus:outline-none select-all truncate"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(referralUrl, 'link', 'রেফারেল লিংক কপি করা হয়েছে!')}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedType === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedType === 'link' ? 'কপি হয়েছে' : 'লিংক কপি'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 1-Tap Social Share Links */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              বন্ধুদের কাছে শেয়ার করুন
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <a
                href={whatsappInviteHref}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#00873E] font-bold text-xs flex items-center justify-center gap-2 border border-emerald-200"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>

              <a
                href={facebookInviteHref}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-2 border border-blue-200"
              >
                <Share2 className="w-4 h-4" />
                <span>Facebook</span>
              </a>

              <a
                href={smsInviteHref}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200"
              >
                <Smartphone className="w-4 h-4" />
                <span>SMS</span>
              </a>

              <button
                type="button"
                onClick={() => handleCopy(referralUrl, 'link', 'রেফারেল লিংক কপি করা হয়েছে!')}
                className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 border border-amber-200 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>লিংক কপি</span>
              </button>
            </div>
          </div>

          {/* Referrals List Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                রেফার করা বন্ধুদের তালিকা ({refStats.referralsList.length} জন)
              </h3>
            </div>

            {refStats.referralsList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-1.5">
                <Users className="w-9 h-9 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">কোনো রেফারেল পাওয়া যায়নি</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase">
                      <th className="py-3 px-4">বন্ধুর নাম</th>
                      <th className="py-3 px-4">মোবাইল</th>
                      <th className="py-3 px-4">তারিখ</th>
                      <th className="py-3 px-4">স্ট্যাটাস</th>
                      <th className="py-3 px-4 text-right">রিওয়ার্ড</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {refStats.referralsList.map((ref, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{ref.friendName}</td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {ref.friendPhone || '—'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">{ref.date}</td>
                        <td className="py-3.5 px-4">
                          {ref.firstOrderPlaced ? (
                            <span className="text-[11px] font-bold text-[#00873E]">১ম অর্ডার সম্পন্ন</span>
                          ) : (
                            <span className="text-[11px] font-bold text-amber-700">অপেক্ষায়</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold tabular-nums">
                          {ref.firstOrderPlaced ? (
                            <span className="text-[#00873E]">+৳৩০</span>
                          ) : (
                            <span className="text-slate-400">৳৩০ (পেন্ডিং)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!currentUser.referredBy && !currentUser.hasCompletedFirstOrder && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                বন্ধুর রেফারেল কোড দিন
              </h4>
              <form onSubmit={handleApplyManualCode} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value.toUpperCase())}
                  placeholder="যেমন: BB-637253"
                  className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-[#00873E]"
                />
                <button
                  type="submit"
                  disabled={isApplyingCode || !manualCodeInput.trim()}
                  className="px-4 py-2 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  সাবমিট
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
