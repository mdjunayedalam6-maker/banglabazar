import React, { useState } from 'react';
import {
  Gift,
  Share2,
  Copy,
  Check,
  Users,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone,
  ExternalLink,
  MessageCircle,
  Share,
  ShoppingBag,
  Wallet
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CustomerReferral: React.FC = () => {
  const {
    currentUser,
    getUserReferralStats,
    applyReferralCode,
    formatPrice,
    language,
    addToast,
    setProfileActiveTab,
    setCurrentPage
  } = useApp();

  const [copiedType, setCopiedType] = useState<'code' | 'link' | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState('');
  const [isApplyingCode, setIsApplyingCode] = useState(false);

  if (!currentUser) return null;

  const stats = getUserReferralStats(currentUser);
  const referralCode = stats.referralCode;

  // Build full referral URL based on current origin
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://banglabazar.com';
  const referralUrl = `${baseUrl}/?ref=${referralCode}`;

  const handleCopy = (text: string, type: 'code' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    addToast(
      language === 'bn' 
        ? `${type === 'code' ? 'রেফারেল কোড' : 'রেফারেল লিংক'} কপি করা হয়েছে!` 
        : `Referral ${type === 'code' ? 'code' : 'link'} copied!`, 
      'success'
    );
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `বাংলা বাজারে কেনাকাটা করুন এবং ফ্রি ৳৫০ ওয়েলকাম বোনাস পান! আমার রেফারেল লিংক থেকে এখনই একাউন্ট খুলুন:\n${referralUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`, '_blank');
  };

  const handleShareSMS = () => {
    const body = encodeURIComponent(
      `বাংলা বাজারে কেনাকাটায় পান ৫০ টাকা বোনাস! আমার লিংক থেকে একাউন্ট খুলুন: ${referralUrl}`
    );
    window.open(`sms:?body=${body}`, '_blank');
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

  return (
    <div className="space-y-6">
      {/* Hero Banner: Refer & Earn 30 Taka */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-[#0B4626] to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-emerald-700/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm">
              <Gift className="w-3.5 h-3.5" />
              <span>রেফার ও ক্যাশ আয়</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              বন্ধুকে রেফার করলেই প্রতি রেফারে <span className="text-amber-300">৳৩০ ক্যাশ!</span>
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              বন্ধু পাবে ৫০ টাকা স্বাগতম বোনাস, আর বন্ধুর ১ম অর্ডারে আপনি পাবেন ৩০ টাকা সরাসরি ওয়ালেটে।
            </p>

            {/* Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              <span className="px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center gap-1.5 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>প্রতি রেফারে ৳৩০</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center gap-1.5 font-bold">
                <Award className="w-3.5 h-3.5 text-emerald-300" />
                <span>বন্ধু পাবে ৳৫০</span>
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 flex items-center gap-1.5 font-bold">
                <Wallet className="w-3.5 h-3.5 text-amber-300" />
                <span>১০০% ক্যাশ ওয়ালেটে</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics Circle / Card */}
          <div className="bg-emerald-950/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-emerald-600/40 text-center shrink-0 min-w-[200px] shadow-lg">
            <span className="text-xs text-emerald-300 font-bold block mb-1">
              মোট রেফারেল আয়
            </span>
            <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
              {formatPrice(stats.totalEarnings)}
            </div>
            <div className="text-[11px] text-emerald-200/80 mt-1 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{stats.successfulReferrals} জনের ১ম অর্ডার সম্পন্ন</span>
            </div>
            <button
              onClick={() => setProfileActiveTab('wallet')}
              className="mt-3 w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>ওয়ালেট দেখুন</span>
            </button>
          </div>
        </div>

        {/* Decorative background glows */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 top-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Customer's Own Welcome Bonus Status Banner - Sleek & Compact */}
      <div className={`p-3 sm:p-4 rounded-2xl border transition-all ${
        currentUser.hasCompletedFirstOrder
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : 'bg-amber-50 border-amber-200 text-amber-950'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              currentUser.hasCompletedFirstOrder
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 text-slate-950'
            }`}>
              {currentUser.hasCompletedFirstOrder ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Gift className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-black text-xs sm:text-sm">
                  {currentUser.hasCompletedFirstOrder
                    ? '৫০ টাকা ওয়েলকাম বোনাস ওয়ালেটে যুক্ত আছে'
                    : '৫০ টাকা ওয়েলকাম বোনাস (১ম অর্ডারে আনলক)'}
                </h4>
                <span className={`text-[9px] font-black px-2 py-0.2 rounded-full ${
                  currentUser.hasCompletedFirstOrder
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-amber-200 text-amber-900'
                }`}>
                  {currentUser.hasCompletedFirstOrder ? 'সক্রিয়' : 'পেন্ডিং'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                {currentUser.hasCompletedFirstOrder
                  ? 'আপনার পরবর্তী ২য় অর্ডারে এই টাকা দিয়ে সরাসরি অর্ডার করতে পারবেন।'
                  : '১ম অর্ডার সম্পন্ন হলেই টাকাটি ওয়ালেটে জমা হবে এবং ২য় অর্ডারে ব্যবহার করা যাবে।'}
              </p>
            </div>
          </div>

          {!currentUser.hasCompletedFirstOrder && (
            <button
              onClick={() => setCurrentPage('shop')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs whitespace-nowrap active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>শপ করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Share Section: Code & Link */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Referral Code Box */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              আপনার রেফারেল কোড (Referral Code)
            </span>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md">
              স্থায়ী কোড
            </span>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-mono font-black text-lg sm:text-xl text-slate-900 tracking-wider flex-1">
              {referralCode}
            </div>
            <button
              onClick={() => handleCopy(referralCode, 'code')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              {copiedType === 'code' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>কোড কপি</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            বন্ধুকে একাউন্ট খোলার সময় এই কোডটি লিখতে বলুন।
          </p>
        </div>

        {/* Shareable Link Box */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              আপনার রেফারেল লিংক (Direct Share Link)
            </span>
            <span className="text-[11px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md">
              অটো-বোনাস লিংক
            </span>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={referralUrl}
              className="bg-transparent text-xs text-slate-700 font-mono w-full focus:outline-none select-all truncate"
            />
            <button
              onClick={() => handleCopy(referralUrl, 'link')}
              className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
            >
              {copiedType === 'link' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>লিংক কপি</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            এই লিংকে ক্লিক করে যে কেউ একাউন্ট খুললেই অটো রেফারেল যুক্ত হবে।
          </p>
        </div>
      </div>

      {/* 1-Tap Social Share Bar */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          সরাসরি বন্ধুদের কাছে শেয়ার করুন (1-Tap Instant Share)
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={handleShareWhatsApp}
            className="py-2.5 px-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#25D366]/30 active:scale-95"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>WhatsApp-এ শেয়ার</span>
          </button>

          <button
            onClick={handleShareFacebook}
            className="py-2.5 px-3 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-[#1877F2]/30 active:scale-95"
          >
            <Share2 className="w-4 h-4 text-[#1877F2]" />
            <span>Facebook-এ শেয়ার</span>
          </button>

          <button
            onClick={handleShareSMS}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-200 active:scale-95"
          >
            <Smartphone className="w-4 h-4 text-slate-700" />
            <span>SMS / মেসেজ</span>
          </button>

          <button
            onClick={() => handleCopy(referralUrl, 'link')}
            className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-200 active:scale-95"
          >
            <Copy className="w-4 h-4 text-amber-600" />
            <span>লিংক কপি করুন</span>
          </button>
        </div>
      </div>

      {/* How it Works - 3 Easy Steps */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
            রেফার করার সহজ ৩টি ধাপ
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
              ১
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                লিংক শেয়ার করুন
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                বন্ধুদের হোয়াটসঅ্যাপ বা ফেসবুকে লিংক পাঠান।
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
              ২
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                বন্ধু পাবে ৳৫০ বোনাস
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                একাউন্ট খুললেই বন্ধু পাবে ৫০ টাকা বোনাস।
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center shrink-0">
              ৩
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">
                আপনি পাবেন ৳৩০ ক্যাশ
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                বন্ধুর ১ম অর্ডারে আপনার ওয়ালেটে ৩০ টাকা জমা।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-bold text-slate-600">মোট রেফারেল</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.totalReferrals}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">জন বন্ধু জয়েন করেছেন</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-bold text-emerald-700">সফল রেফারেল</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {stats.successfulReferrals}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">যাঁরা ১ম অর্ডার করেছেন</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-bold text-amber-700">অপেক্ষমাণ (Pending)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats.pendingReferrals}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">১ম অর্ডারের অপেক্ষায়</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-bold text-slate-600">মোট অর্জিত আয়</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {formatPrice(stats.totalEarnings)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">ওয়ালেটে জমা হওয়া টাকা</div>
        </div>
      </div>

      {/* Referrals List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-slate-900">
              রেফার করা বন্ধুদের তালিকা (Referral History)
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              কারা আপনার মাধ্যমে একাউন্ট খুলেছেন এবং তাঁদের অর্ডারের স্ট্যাটাস
            </p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full">
            মোট: {stats.referralsList.length} জন
          </span>
        </div>

        {stats.referralsList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-1.5">
            <Users className="w-9 h-9 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-xs font-bold text-slate-600">
              কোনো রেফারেল পাওয়া যায়নি
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
              বন্ধুদের রেফারেল লিংক শেয়ার করে প্রতি রেফারে ৩০ টাকা আয় করুন।
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 border-b border-slate-200 uppercase tracking-wider">
                  <th className="py-3 px-4">বন্ধুর নাম</th>
                  <th className="py-3 px-4">মোবাইল নম্বর</th>
                  <th className="py-3 px-4">যুক্ত হওয়ার তারিখ</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4 text-right">আপনার অর্জিত রিওয়ার্ড</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.referralsList.map((ref, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {ref.friendName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {ref.friendPhone || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {ref.date}
                    </td>
                    <td className="py-3.5 px-4">
                      {ref.firstOrderPlaced ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>১ম অর্ডার সম্পন্ন</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>১ম অর্ডারের অপেক্ষায়</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black">
                      {ref.firstOrderPlaced ? (
                        <span className="text-emerald-600">+৳৩০ (ওয়ালেটে যুক্ত)</span>
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

      {/* Manual Referral Code Input (if customer forgot to enter during signup) */}
      {!currentUser.referredBy && !currentUser.hasCompletedFirstOrder && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              বন্ধুর রেফারেল কোড দিন
            </h4>
          </div>
          <form onSubmit={handleApplyManualCode} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={manualCodeInput}
              onChange={(e) => setManualCodeInput(e.target.value.toUpperCase())}
              placeholder="কোড লিখুন (যেমন: BB-637253)"
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-emerald-600"
            />
            <button
              type="submit"
              disabled={isApplyingCode || !manualCodeInput.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              সাবমিট
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
