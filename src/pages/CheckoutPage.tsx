import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User as UserIcon, 
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  ShoppingBag,
  Lock,
  Copy,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BANGLADESH_DIVISIONS } from '../data/mockData';

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
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

  // Auto-resolve initial state from currentUser if logged in
  const initialDivObj = currentUser?.division
    ? BANGLADESH_DIVISIONS.find(
        (d) =>
          d.nameBn === currentUser.division ||
          d.nameEn.toLowerCase() === currentUser.division.toLowerCase()
      ) || BANGLADESH_DIVISIONS[0]
    : BANGLADESH_DIVISIONS[0];

  const initialDistrict = currentUser?.district
    ? initialDivObj.districts.find(
        (dist) =>
          dist.toLowerCase().includes(currentUser.district.toLowerCase()) ||
          dist === currentUser.district
      ) || initialDivObj.districts[0]
    : initialDivObj.districts[0];

  // Form State
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [division, setDivision] = useState(initialDivObj.nameBn);
  const [district, setDistrict] = useState(initialDistrict);
  const [thana, setThana] = useState(currentUser?.thana || '');
  const [address, setAddress] = useState(
    currentUser?.addresses?.[0]?.address || currentUser?.village || ''
  );
  // Default to Cash on Delivery (1. COD, 2. bKash, 3. Nagad)
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [deliveryArea, setDeliveryArea] = useState<'dhaka' | 'outside'>(() => {
    if (initialDivObj.nameBn === 'ঢাকা' && initialDistrict.includes('ঢাকা')) {
      return 'dhaka';
    }
    return 'outside';
  });
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if currentUser logs in or loads
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name && !fullName) setFullName(currentUser.name);
      if (currentUser.phone && !phone) setPhone(currentUser.phone);
      if (currentUser.division) {
        const found = BANGLADESH_DIVISIONS.find(
          (d) =>
            d.nameBn === currentUser.division ||
            d.nameEn.toLowerCase() === currentUser.division.toLowerCase()
        );
        if (found) {
          setDivision(found.nameBn);
          const foundDist = currentUser.district
            ? found.districts.find((dist) =>
                dist.toLowerCase().includes(currentUser.district.toLowerCase())
              ) || found.districts[0]
            : found.districts[0];
          setDistrict(foundDist);
          if (found.nameBn === 'ঢাকা' && foundDist.includes('ঢাকা')) {
            setDeliveryArea('dhaka');
          } else {
            setDeliveryArea('outside');
          }
        }
      }
      if (currentUser.thana && !thana) setThana(currentUser.thana);
      if (currentUser.addresses?.[0]?.address && !address) {
        setAddress(currentUser.addresses[0].address);
      } else if (currentUser.village && !address) {
        setAddress(currentUser.village);
      }
    }
  }, [currentUser]);

  // If cart is empty, redirect
  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{t.emptyCart}</h2>
        <p className="text-xs text-slate-500">{t.emptyCartDesc}</p>
        <button
          onClick={() => setCurrentPage('shop')}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
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
      const firstDist = divObj.districts[0];
      setDistrict(firstDist);
      if (newDiv === 'ঢাকা' && firstDist.includes('ঢাকা')) {
        setDeliveryArea('dhaka');
      } else {
        setDeliveryArea('outside');
      }
    }
  };

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    if (division === 'ঢাকা' && newDist.includes('ঢাকা')) {
      setDeliveryArea('dhaka');
    } else {
      setDeliveryArea('outside');
    }
  };

  const dynamicShippingFee = calculateShippingFee(deliveryArea, 'regular', cartSubtotal);
  const calculatedTotal = Math.max(0, cartSubtotal - cartDiscount + dynamicShippingFee);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addToast(
      language === 'bn' 
        ? `${label} নম্বর (${text}) কপি করা হয়েছে!` 
        : `${label} number (${text}) copied!`, 
      'success'
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast(language === 'bn' ? 'দয়া করে আপনার নাম লিখুন' : 'Please enter your name', 'error');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 11) {
      addToast(language === 'bn' ? 'দয়া করে সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন' : 'Please enter a valid 11-digit phone number', 'error');
      return;
    }
    if (!division.trim()) {
      addToast(language === 'bn' ? 'দয়া করে আপনার বিভাগ নির্বাচন করুন' : 'Please select your division', 'error');
      return;
    }
    if (!district.trim()) {
      addToast(language === 'bn' ? 'দয়া করে আপনার জেলা নির্বাচন করুন' : 'Please select your district', 'error');
      return;
    }
    if (!address.trim()) {
      addToast(language === 'bn' ? 'দয়া করে সম্পূর্ণ ঠিকানা লিখুন' : 'Please provide your full address', 'error');
      return;
    }
    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && (!senderNumber.trim() || !trxId.trim())) {
      addToast(
        language === 'bn' 
          ? 'দয়া করে আপনার সেন্ডার নম্বর এবং TrxID প্রদান করুন' 
          : 'Please provide your Sender Number and TrxID', 
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
          division: deliveryArea === 'dhaka' ? 'ঢাকা' : division,
          district: deliveryArea === 'dhaka' ? 'ঢাকা' : district,
          thana: thana.trim() || undefined,
          address: thana ? `${address} (থানা: ${thana})` : address,
          deliverySpeed: 'regular',
          senderNumber: paymentMethod === 'bkash' || paymentMethod === 'nagad' ? senderNumber : undefined,
          trxId: paymentMethod === 'bkash' || paymentMethod === 'nagad' ? trxId : undefined,
          email: currentUser?.email || '',
        },
        paymentMethod,
        dynamicShippingFee
      );
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 animate-fade-in">
      {/* Clean Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'bn' ? 'অর্ডার কনফার্ম করুন' : 'Confirm Order'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn' ? 'প্রয়োজনীয় তথ্য দিয়ে অর্ডারটি সম্পন্ন করুন' : 'Enter required details to complete your order'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage('cart')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'bn' ? 'কার্টে ফিরুন' : 'Back to Cart'}</span>
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Form: All essentials in one clean flow (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Customer & Delivery Address Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                  ১
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {language === 'bn' ? 'ডেলিভারির তথ্য' : 'Delivery Information'}
                </h2>
              </div>

              {currentUser && (
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>অ্যাকাউন্ট থেকে অটো-পূরণ</span>
                </span>
              )}
            </div>

            {/* If logged in: User notice & 1-click address selector */}
            {currentUser && (
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100/90 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-emerald-950 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>আপনার অ্যাকাউন্ট থেকে তথ্য বসে গেছে। প্রয়োজনে যেকোনো ফিল্ডে ক্লিক করে এডিট করতে পারেন।</span>
                  </span>
                </div>

                {currentUser.addresses && currentUser.addresses.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-100/60">
                    <span className="text-[11px] text-slate-600 font-semibold">সেভ করা ঠিকানা:</span>
                    {currentUser.addresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => {
                          setAddress(addr.address);
                          if (addr.district) {
                            for (const d of BANGLADESH_DIVISIONS) {
                              const matched = d.districts.find(
                                (item) => item.toLowerCase().includes(addr.district.toLowerCase()) || addr.district.toLowerCase().includes(item.toLowerCase())
                              );
                              if (matched) {
                                setDivision(d.nameBn);
                                setDistrict(matched);
                                if (d.nameBn === 'ঢাকা' && matched.includes('ঢাকা')) {
                                  setDeliveryArea('dhaka');
                                } else {
                                  setDeliveryArea('outside');
                                }
                                break;
                              }
                            }
                          }
                          addToast(
                            language === 'bn' 
                              ? `"${addr.title}" ঠিকানা সিলেক্ট করা হয়েছে` 
                              : `Selected "${addr.title}" address`, 
                            'info'
                          );
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer ${
                          address === addr.address
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
                        }`}
                      >
                        {addr.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sequence 1 & 2: Name and Phone Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'bn' ? 'আপনার নাম' : 'Your Full Name'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'bn' ? 'আপনার পুরো নাম লিখুন' : 'Full Name'}
                    className="w-full bg-slate-50/80 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-2xs"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full bg-slate-50/80 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-2xs"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>
            </div>

            {/* Sequence 3 & 4: Division & Dynamic District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'bn' ? 'বিভাগ (Division)' : 'Division'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={division}
                  onChange={(e) => handleDivisionChange(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all cursor-pointer shadow-2xs"
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div.nameBn} value={div.nameBn} className="text-slate-900">
                      {div.nameBn} ({div.nameEn})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'bn' ? 'জেলা (District)' : 'District'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={district}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium outline-none focus:border-emerald-600 focus:bg-white transition-all cursor-pointer shadow-2xs"
                >
                  {currentDivObj.districts.map((dist) => (
                    <option key={dist} value={dist} className="text-slate-900">
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sequence 5: Thana / Upazila */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-800">
                  {language === 'bn' ? 'থানা / উপজেলা' : 'Thana / Upazila'} <span className="text-rose-500">*</span>
                </label>
                {division === 'ঢাকা' && (
                  <span className="text-[10px] text-slate-400">যেমন: মিরপুর, ধানমন্ডি, গুলশান, উত্তরা, বনানী...</span>
                )}
              </div>
              <input
                type="text"
                required
                value={thana}
                onChange={(e) => setThana(e.target.value)}
                placeholder={language === 'bn' ? 'আপনার থানা বা উপজেলার নাম লিখুন' : 'Thana / Upazila'}
                className="w-full bg-slate-50/80 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            {/* Sequence 6: Area / Detailed Delivery Address */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                {language === 'bn' ? 'নিজের এলাকা বা ডেলিভারির সম্পূর্ণ ঠিকানা' : 'Area & Detailed Delivery Address'} <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={language === 'bn' ? 'বাসা/রোড নং, এলাকা, পাড়া বা চেনার কোনো সহজ উপায় লিখুন...' : 'House/Road, Area, landmarks...'}
                className="w-full bg-slate-50/80 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-emerald-600 focus:bg-white transition-all resize-none shadow-2xs"
              />
            </div>

            {/* Delivery Charge & Location Indicator */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-700">
                  ডেলিভারি এলাকা: <strong className="text-slate-900">{deliveryArea === 'dhaka' ? 'ঢাকার ভেতরে' : 'ঢাকার বাইরে'}</strong>
                </span>
              </div>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                চার্জ: {dynamicShippingFee === 0 ? 'ফ্রি' : `৳${dynamicShippingFee}`}
              </span>
            </div>
          </div>

          {/* 2. Compact & Ultra-Attractive Payment Method Card ("ছোট আকারে একেবারে ছোট আকারে") */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                  ২
                </div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
                </h2>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {paymentMethod === 'cod' ? 'ক্যাশ অন ডেলিভারি' : paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'}
              </span>
            </div>

            {/* 3 Compact Buttons in exact order: 1. COD, 2. bKash, 3. Nagad */}
            <div className="grid grid-cols-3 gap-2">
              {/* 1. Cash On Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-600 bg-emerald-50/90 text-emerald-950 font-bold ring-1 ring-emerald-600 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-bold text-slate-900">ক্যাশ অন ডেলিভারি</span>
                </div>
              </button>

              {/* 2. bKash */}
              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'bkash'
                    ? 'border-[#D12053] bg-pink-50/90 text-pink-950 font-bold ring-1 ring-[#D12053] shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'bkash' ? 'border-[#D12053] bg-[#D12053]' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'bkash' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-black text-[#D12053]">বিকাশ (bKash)</span>
                </div>
              </button>

              {/* 3. Nagad */}
              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                  paymentMethod === 'nagad'
                    ? 'border-[#E25A1E] bg-amber-50/90 text-amber-950 font-bold ring-1 ring-[#E25A1E] shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    paymentMethod === 'nagad' ? 'border-[#E25A1E] bg-[#E25A1E]' : 'border-slate-300'
                  }`}>
                    {paymentMethod === 'nagad' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-xs font-black text-[#E25A1E]">নগদ (Nagad)</span>
                </div>
              </button>
            </div>

            {/* COD Micro reassurance */}
            {paymentMethod === 'cod' && (
              <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-emerald-900 flex items-center gap-2 animate-fade-in">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>পণ্য হাতে পেয়ে দেখে মূল্য পরিশোধ করবেন। কোনো অগ্রিম পেমেন্টের ঝামেলা নেই।</span>
              </div>
            )}

            {/* bKash Quick Payment Box */}
            {paymentMethod === 'bkash' && (
              <div className="p-3.5 rounded-xl bg-pink-50/90 border border-pink-200 text-pink-950 space-y-2.5 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-pink-900">
                    বিকাশ নম্বর (Send Money):
                  </span>
                  <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-pink-200">
                    <strong className="text-pink-700 font-mono text-xs">01884196205</strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('01884196205', 'বিকাশ')}
                      className="px-2 py-0.5 bg-pink-600 hover:bg-pink-700 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>কপি</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      আপনার বিকাশ নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-white border border-pink-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-pink-600 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      TrxID (ট্রানজেকশন আইডি) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder="9H87G6F5"
                      className="w-full bg-white border border-pink-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-pink-600 uppercase shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Nagad Quick Payment Box */}
            {paymentMethod === 'nagad' && (
              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-950 space-y-2.5 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-amber-900">
                    নগদ নম্বর (Send Money):
                  </span>
                  <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
                    <strong className="text-amber-700 font-mono text-xs">01884196205</strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('01884196205', 'নগদ')}
                      className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>কপি</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      আপনার নগদ নম্বর <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-amber-600 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                      TrxID (ট্রানজেকশন আইডি) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={trxId}
                      onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                      placeholder="9H87G6F5"
                      className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium placeholder-slate-400 outline-none focus:border-amber-600 uppercase shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Summary Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4 sticky top-24">
            <h3 className="text-sm sm:text-base font-black text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>{t.orderSummary}</span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                {cart.length} টি পণ্য
              </span>
            </h3>

            {/* Mini Cart Items List */}
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-2">
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
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{title}</p>
                      <div className="flex flex-wrap items-center gap-1 mt-0.5">
                        {item.selectedSize && (
                          <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-100">
                            সাইজ: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.2 rounded border border-amber-100">
                            কালার: {item.selectedColor}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {item.quantity} x {formatPrice(item.product.price)}
                      </p>
                    </div>
                    <span className="text-xs font-black text-slate-900">
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
                <span>ডেলিভারি চার্জ ({deliveryArea === 'dhaka' ? 'ঢাকার ভিতরে' : 'ঢাকার বাইরে'})</span>
                <span className="font-bold text-slate-800">
                  {dynamicShippingFee === 0 ? (
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold uppercase text-[11px]">
                      ফ্রি ডেলিভারি
                    </span>
                  ) : (
                    formatPrice(dynamicShippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between text-base sm:text-lg font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-[#00873E] font-black">{formatPrice(calculatedTotal)}</span>
              </div>
            </div>

            {/* 1-Click Direct Order Confirm Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 active:scale-98 text-white font-black rounded-2xl text-base transition-all shadow-lg shadow-emerald-700/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer group"
            >
              {isSubmitting ? (
                <span>{language === 'bn' ? 'অর্ডার সংরক্ষিত হচ্ছে...' : 'Placing Order...'}</span>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-emerald-200" />
                  <span>
                    {language === 'bn' 
                      ? `অর্ডার কনফার্ম করুন • ${formatPrice(calculatedTotal)}` 
                      : `Confirm Order • ${formatPrice(calculatedTotal)}`}
                  </span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            {/* Micro reassurance badge */}
            <div className="text-center pt-1">
              <span className="text-[11px] text-slate-500 font-medium inline-flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {paymentMethod === 'cod' 
                    ? 'ক্যাশ অন ডেলিভারিতে কোনো অগ্রিম টাকা নেওয়া হয় না' 
                    : 'নিরাপদ ও তাৎক্ষণিক ট্রানজেকশন গ্যারান্টি'}
                </span>
              </span>
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
          {lastPlacedOrder.isOfflineOrder ? (
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-300 px-3.5 py-1.5 rounded-full inline-block">
              {language === 'bn' ? 'অফলাইন অর্ডার সংরক্ষিত (ইন্টারনেট পেলেই স্বয়ংক্রিয় সিঙ্ক হবে)' : 'Offline Order Saved (Auto-Syncs Online)'}
            </span>
          ) : (
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              {language === 'bn' ? 'অর্ডার নিশ্চিত হয়েছে' : 'Order Confirmed'}
            </span>
          )}
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
