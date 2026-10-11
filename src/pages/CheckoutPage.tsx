import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  ShoppingBag,
  Zap,
  Gift,
  Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BANGLADESH_DIVISIONS } from '../data/mockData';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    cartShippingFee,
    cartTotal,
    siteSettings,
    calculateShippingFee,
    currentUser,
    placeOrder,
    language,
    t,
    formatPrice,
    setCurrentPage,
    addToast,
  } = useApp();

  // Form states & Step control
  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [division, setDivision] = useState(BANGLADESH_DIVISIONS[0].nameBn);
  const [district, setDistrict] = useState(BANGLADESH_DIVISIONS[0].districts[0]);
  const [address, setAddress] = useState(currentUser?.addresses[0]?.address || '');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'cod'>('bkash');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If cart is empty and user lands here, redirect
  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">{t.emptyCart}</h2>
        <p className="text-xs text-slate-500">{t.emptyCartDesc}</p>
        <button
          onClick={() => setCurrentPage('shop')}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          {t.startShopping}
        </button>
      </div>
    );
  }

  const currentDivObj = BANGLADESH_DIVISIONS.find(
    (d) => d.nameBn === division || d.nameEn === division
  ) || BANGLADESH_DIVISIONS[0];

  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    const divObj = BANGLADESH_DIVISIONS.find((d) => d.nameBn === newDiv || d.nameEn === newDiv);
    if (divObj && divObj.districts.length > 0) {
      setDistrict(divObj.districts[0]);
    }
  };

  const isDhakaLocation = division === 'ঢাকা' || division.toLowerCase().includes('dhaka') || district.toLowerCase().includes('dhaka');
  const activeLocation: 'dhaka' | 'outside' = isDhakaLocation ? 'dhaka' : 'outside';
  const dynamicShippingFee = calculateShippingFee(activeLocation, 'regular', cartSubtotal);
  const calculatedTotal = Math.max(0, cartSubtotal - cartDiscount + dynamicShippingFee);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(
      language === 'bn' 
        ? `${label} নম্বর (${text}) সফলভাবে কপি করা হয়েছে!` 
        : `${label} number (${text}) copied to clipboard!`, 
      'success'
    );
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast(language === 'bn' ? 'দয়া করে সম্পূর্ণ নাম লিখুন' : 'Please enter your full name', 'error');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      addToast(language === 'bn' ? 'দয়া করে সঠিক মোবাইল নম্বর দিন (11 ডিজিট)' : 'Please enter a valid 11-digit phone number', 'error');
      return;
    }
    if (!address.trim()) {
      addToast(language === 'bn' ? 'দয়া করে সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন' : 'Please provide your full delivery address', 'error');
      return;
    }
    setCheckoutStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && (!senderNumber.trim() || !trxId.trim())) {
      addToast(
        language === 'bn' 
          ? 'দয়া করে আপনার সেন্ডার মোবাইল নম্বর এবং TrxID (ট্রানজেকশন আইডি) প্রদান করুন' 
          : 'Please provide your Sender Mobile Number and TrxID', 
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      placeOrder(
        {
          fullName,
          phone,
          division,
          district,
          address,
          deliverySpeed: 'regular',
          senderNumber: paymentMethod === 'bkash' || paymentMethod === 'nagad' ? senderNumber : undefined,
          trxId: paymentMethod === 'bkash' || paymentMethod === 'nagad' ? trxId : undefined,
          email: currentUser?.email || '',
        },
        paymentMethod,
        dynamicShippingFee
      );
      setIsSubmitting(false);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fade-in">
      {/* Checkout Title */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>{t.checkoutTitle}</span>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
              {language === 'bn' ? 'সুরক্ষিত পেমেন্ট' : 'Secure Checkout'}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'bn' ? 'দ্রুত, নিরাপদ ও এনক্রিপ্টেড চেকআউট ও পেমেন্ট গেটওয়ে' : 'Fast, secure & encrypted checkout gateway'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage('cart')}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl border border-emerald-200 transition-all cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'bn' ? 'কার্টে ফিরে যান' : 'Back to Cart'}</span>
        </button>
      </div>

      <form onSubmit={checkoutStep === 1 ? handleProceedToPayment : handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Step 1 (Delivery) or Step 2 (Payment) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {checkoutStep === 1 ? (
            <>
              {/* Step indicator */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block">ধাপ 1 অব 2: ডেলিভারি ঠিকানা ও মাধ্যম</span>
                    <span className="text-[11px] text-emerald-100">আপনার সঠিক ঠিকানা ও মোবাইল নম্বর প্রদান করুন</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold bg-white text-emerald-800 px-3.5 py-1.5 rounded-xl shadow-xs">
                  ধাপ 1
                </span>
              </div>

              {/* 1. Delivery Details Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {language === 'bn' ? 'ডেলিভারি ঠিকানা ও যোগাযোগের তথ্য' : 'Shipping Address & Contact'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {t.fullName} *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={language === 'bn' ? 'উদা: মোঃ জুনায়েদ আলী' : 'e.g. Md. Zunayed Ali'}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-xs"
                      />
                      <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {t.phone} *
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="01712-345678"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-xs"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>
                </div>

                {/* Division & District */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {t.division} *
                    </label>
                    <select
                      value={division}
                      onChange={(e) => handleDivisionChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all cursor-pointer shadow-xs"
                    >
                      {BANGLADESH_DIVISIONS.map((div) => (
                        <option key={div.nameBn} value={div.nameBn} className="text-slate-900">
                          {language === 'bn' ? div.nameBn : div.nameEn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {t.district} *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all cursor-pointer shadow-xs"
                    >
                      {currentDivObj.districts.map((dist) => (
                        <option key={dist} value={dist} className="text-slate-900">
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    {t.fullAddress} *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={language === 'bn' ? 'বাসা/ফ্ল্যাট নং, রোড নং, এলাকা বা চেনার উপায়...' : 'House/Flat No, Road, Area, Landmark...'}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-emerald-600 focus:bg-white transition-all resize-none shadow-xs"
                  />
                </div>
              </div>

              {/* Automatic Shipping Fee Info Banner */}
              <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-3xl p-5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                      ডেলিভারি চার্জ: <span className="text-emerald-700 font-extrabold">{isDhakaLocation ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      নির্বাচিত জেলা ({division} - {district}) অনুযায়ী স্বয়ংক্রিয়ভাবে প্রযোজ্য
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">চার্জ</span>
                  <span className="font-extrabold text-sm sm:text-base text-emerald-700">
                    {dynamicShippingFee === 0 ? 'ফ্রি (৳0)' : formatPrice(dynamicShippingFee)}
                  </span>
                </div>
              </div>

              {/* Note text if defined in siteSettings */}
              {siteSettings.deliveryNoteBn && (
                <p className="text-[11px] text-slate-600 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-200">
                  💡 <span className="font-bold">নোট:</span> {siteSettings.deliveryNoteBn}
                </p>
              )}
            </>
          ) : (
            <>
              {/* Step indicator */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(1)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 bg-white px-3 py-2 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-all shadow-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>আগের ধাপে ফিরুন</span>
                  </button>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block">ধাপ 2 অব 2: পেমেন্ট গেটওয়ে</span>
                    <span className="text-[11px] text-indigo-100">আপনার পছন্দের পেমেন্ট মাধ্যম নির্বাচন করুন</span>
                  </div>
                </div>
                <span className="text-xs font-extrabold bg-white text-indigo-900 px-3.5 py-1.5 rounded-xl shadow-xs">
                  ধাপ 2
                </span>
              </div>

              {/* 3. Payment Method Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {t.selectPayment}
                  </h2>
                </div>

                {/* Side-by-side Payment Options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* bKash */}
                  <div
                    onClick={() => setPaymentMethod('bkash')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'bkash'
                        ? 'border-[#D12053] bg-pink-50/80 shadow-sm ring-1 ring-[#D12053]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-xs sm:text-sm text-[#D12053]">bKash (বিকাশ)</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'bkash' ? 'border-[#D12053] bg-[#D12053]' : 'border-slate-300'
                      }`}>
                        {paymentMethod === 'bkash' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug">সেন্ড মানি করুন</p>
                    <span className="text-[10px] text-[#D12053] font-bold mt-2 bg-pink-100 px-2 py-0.5 rounded-md inline-block w-fit">5% ক্যাশব্যাক</span>
                  </div>

                  {/* Nagad */}
                  <div
                    onClick={() => setPaymentMethod('nagad')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'nagad'
                        ? 'border-[#F7941D] bg-amber-50/80 shadow-sm ring-1 ring-[#F7941D]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-xs sm:text-sm text-[#E25A1E]">Nagad (নগদ)</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'nagad' ? 'border-[#E25A1E] bg-[#E25A1E]' : 'border-slate-300'
                      }`}>
                        {paymentMethod === 'nagad' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug">সেন্ড মানি করুন</p>
                    <span className="text-[10px] text-[#E25A1E] font-bold mt-2 bg-amber-100 px-2 py-0.5 rounded-md inline-block w-fit">জিরো ক্যাশ-আউট</span>
                  </div>

                  {/* Cash On Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-sm ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs sm:text-sm text-emerald-800">ক্যাশ অন ডেলিভারি</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                      }`}>
                        {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug">পণ্য হাতে পেয়ে মূল্য</p>
                    <span className="text-[10px] text-emerald-700 font-bold mt-2 bg-emerald-100 px-2 py-0.5 rounded-md inline-block w-fit">1۰۰% নিরাপদ</span>
                  </div>
                </div>

                {/* bKash Send Money Box */}
                {paymentMethod === 'bkash' && (
                  <div className="p-5 rounded-2xl border bg-pink-50/80 border-pink-200 text-pink-950 space-y-3.5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-pink-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-600 animate-pulse"></span>
                        bKash Send Money নির্দেশিকা
                      </span>
                      <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-pink-200 shadow-xs">
                        <span className="text-xs text-slate-600 font-medium">নম্বর:</span>
                        <strong className="text-pink-700 font-mono text-sm">01884196205</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('01884196205', 'বিকাশ')}
                          className="ml-1 px-2.5 py-1 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>কপি করুন</span>
                        </button>
                      </div>
                    </div>

                    <ol className="text-xs space-y-1.5 text-slate-700 list-decimal list-inside font-medium bg-white/70 p-3.5 rounded-xl border border-pink-100">
                      <li>আপনার বিকাশ অ্যাপ বা ডায়াল কোড (*243#) থেকে <strong className="text-pink-700">Send Money</strong> করুন।</li>
                      <li>প্রাপক নম্বর হিসেবে উপরের নম্বরটি ব্যবহার করুন <strong className="font-mono text-slate-900">01884196205</strong>।</li>
                      <li>সর্বমোট প্রদেয় পরিমাণ: <strong className="text-slate-900 font-extrabold">{formatPrice(calculatedTotal)}</strong></li>
                      <li>টাকা পাঠানোর পর প্রাপ্ত <strong className="text-pink-700">TrxID</strong> এবং আপনার <strong className="text-pink-700">সেন্ডার মোবাইল নম্বরটি</strong> নিচে লিখে অর্ডার কনফার্ম করুন।</li>
                    </ol>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {language === 'bn' ? 'আপনার সেন্ডার মোবাইল নম্বর *' : 'Your Sender Mobile Number *'}
                        </label>
                        <input
                          type="tel"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-pink-600 transition-all shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {language === 'bn' ? 'লেনদেনের ট্রানজেকশন আইডি (TrxID) *' : 'Transaction ID (TrxID) *'}
                        </label>
                        <input
                          type="text"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                          placeholder="উদা: 9H87G6F5"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-pink-600 transition-all uppercase shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Nagad Send Money Box */}
                {paymentMethod === 'nagad' && (
                  <div className="p-5 rounded-2xl border bg-amber-50/80 border-amber-200 text-amber-950 space-y-3.5 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-600 animate-pulse"></span>
                        Nagad Send Money নির্দেশিকা
                      </span>
                      <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-amber-200 shadow-xs">
                        <span className="text-xs text-slate-600 font-medium">নম্বর:</span>
                        <strong className="text-amber-700 font-mono text-sm">01929637253</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('01929637253', 'নগদ')}
                          className="ml-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>কপি করুন</span>
                        </button>
                      </div>
                    </div>

                    <ol className="text-xs space-y-1.5 text-slate-700 list-decimal list-inside font-medium bg-white/70 p-3.5 rounded-xl border border-amber-100">
                      <li>আপনার নগদ অ্যাপ বা ডায়াল কোড থেকে <strong className="text-amber-700">Send Money</strong> করুন।</li>
                      <li>প্রাপক নম্বর হিসেবে উপরের নম্বরটি ব্যবহার করুন <strong className="font-mono text-slate-900">01929637253</strong>।</li>
                      <li>সর্বমোট প্রদেয় পরিমাণ: <strong className="text-slate-900 font-extrabold">{formatPrice(calculatedTotal)}</strong></li>
                      <li>টাকা পাঠানোর পর প্রাপ্ত <strong className="text-amber-700">TrxID</strong> এবং আপনার <strong className="text-amber-700">সেন্ডার মোবাইল নম্বরটি</strong> নিচে লিখে অর্ডার কনফার্ম করুন।</li>
                    </ol>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {language === 'bn' ? 'আপনার সেন্ডার মোবাইল নম্বর *' : 'Your Sender Mobile Number *'}
                        </label>
                        <input
                          type="tel"
                          value={senderNumber}
                          onChange={(e) => setSenderNumber(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-amber-600 transition-all shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {language === 'bn' ? 'লেনদেনের ট্রানজেকশন আইডি (TrxID) *' : 'Transaction ID (TrxID) *'}
                        </label>
                        <input
                          type="text"
                          value={trxId}
                          onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                          placeholder="উদা: 9H87G6F5"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-amber-600 transition-all uppercase shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Summary Card (4 or 5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
            <h3 className="text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>{t.orderSummary}</span>
              <span className="text-xs text-slate-400 font-normal">({cart.length} টি পণ্য)</span>
            </h3>

            {/* Mini Cart Items List */}
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
              {cart.map((item) => {
                const title = language === 'bn' ? item.product.titleBn : item.product.titleEn;
                return (
                  <div key={item.product.id} className="pt-2 flex items-center gap-2.5">
                    <img
                      src={
                        (item.selectedImage || item.product?.images?.[0])?.includes('_L_') && (item.selectedImage || item.product?.images?.[0]).endsWith('.jpg')
                          ? (item.selectedImage || item.product?.images?.[0]).replace(/\.jpg$/i, '.jpeg')
                          : item.selectedImage || item.product?.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80'
                      }
                      alt={title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes('_L_')) {
                          target.src = target.src.replace('_L_', '_S_').replace(/\.jpeg$/i, '.jpg');
                        } else {
                          target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80';
                        }
                      }}
                      className="w-11 h-11 object-cover rounded-lg border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{title}</p>
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        {item.selectedSize && (
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                            সাইজ: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-100">
                            কালার: {item.selectedColor}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.quantity} x {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{t.subtotal}</span>
                <span className="font-bold text-slate-800">{formatPrice(cartSubtotal)}</span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>{t.discount}</span>
                  <span>-{formatPrice(cartDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600 items-center">
                <span>{t.shipping}</span>
                <span className="font-bold text-slate-800">
                  {dynamicShippingFee === 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold uppercase text-[11px]">
                      {language === 'bn' ? 'ফ্রি ডেলিভারি' : 'FREE'}
                    </span>
                  ) : (
                    formatPrice(dynamicShippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>{t.total}</span>
                <span className="text-[#00873E] font-black">{formatPrice(calculatedTotal)}</span>
              </div>
            </div>

            {/* Action Button: Proceed to Payment (Step 1) or Place Order (Step 2) */}
            {checkoutStep === 1 ? (
              <button
                type="submit"
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-base transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                <span>{language === 'bn' ? 'পরবর্তী ধাপ: পেমেন্ট' : 'Next Step: Payment'}</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 theme-btn-buy theme-shimmer-effect disabled:opacity-50 text-white font-black rounded-2xl text-base transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer group"
              >
                {isSubmitting ? (
                  <span>{language === 'bn' ? 'অর্ডার প্রসেস হচ্ছে...' : 'Processing Order...'}</span>
                ) : (
                  <>
                    <span>{t.placeOrder}</span>
                    <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            )}

            {/* Security Guarantee Notice */}
            <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>{language === 'bn' ? 'অর্ডার কনফার্মেশনের সাথে সাথে এসএমএস পাবেন' : 'SMS confirmation will be sent instantly'}</span>
              </div>
              <p>{language === 'bn' ? 'কোনো অগ্রিম অতিরিক্ত চার্জ প্রযোজ্য নয়' : 'No hidden fees or extra surcharges'}</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export const OrderSuccessView: React.FC = () => {
  const { lastPlacedOrder, language, t, formatPrice, setCurrentPage, openTrackOrder } = useApp();

  if (!lastPlacedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <button
          onClick={() => setCurrentPage('home')}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          {t.home}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md text-center space-y-6">
        {/* Animated Checkmark */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            {language === 'bn' ? 'অর্ডার নিশ্চিত হয়েছে' : 'Order Confirmed'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {t.orderSuccessTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {language === 'bn' 
              ? 'আপনার অর্ডারটির প্যাকেজিং শুরু হয়েছে। শীঘ্রই ডেলিভারি প্রতিনিধির মাধ্যমে আপনার ঠিকানায় পৌঁছে যাবে।'
              : 'Your order is currently being packaged and will be handed over to courier shortly.'}
          </p>
        </div>

        {/* Order Details Badge Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left text-xs">
          <div>
            <span className="text-slate-400 block">{t.orderIdText}</span>
            <span className="font-black text-slate-900 text-sm">{lastPlacedOrder.id}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{language === 'bn' ? 'ট্র্যাকিং কোড:' : 'Tracking #:'}</span>
            <span className="font-bold text-emerald-700 text-xs">{lastPlacedOrder.trackingNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{language === 'bn' ? 'পেমেন্ট মেথড:' : 'Payment:'}</span>
            <span className="font-bold text-slate-800 uppercase">{lastPlacedOrder.paymentMethod}</span>
          </div>
          <div>
            <span className="text-slate-400 block">{t.total}</span>
            <span className="font-black text-slate-900 text-sm">{formatPrice(lastPlacedOrder.total)}</span>
          </div>
        </div>

        {/* Shipping Address Summary */}
        <div className="p-4 bg-emerald-50/60 rounded-2xl text-left text-xs space-y-1 border border-emerald-200/60">
          <div className="font-bold text-emerald-900 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Shipping Address'}:</span>
          </div>
          <p className="text-slate-700 font-semibold">{lastPlacedOrder.shippingAddress.fullName} ({lastPlacedOrder.shippingAddress.phone})</p>
          <p className="text-slate-600">{lastPlacedOrder.shippingAddress.address}, {lastPlacedOrder.shippingAddress.district}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => openTrackOrder(lastPlacedOrder.trackingNumber || lastPlacedOrder.id)}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>{t.trackOrderBtn}</span>
          </button>

          <button
            onClick={() => setCurrentPage('home')}
            className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors"
          >
            {language === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}
          </button>
        </div>
      </div>
    </div>
  );
};
