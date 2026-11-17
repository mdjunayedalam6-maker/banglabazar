import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Clock,
  ShoppingBag,
  Lock,
  Copy,
  Check,
  X,
  Wallet,
  Edit3,
  Plus,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BANGLADESH_DIVISIONS } from '../data/mockData';
import { DeliveryAddress, WalletPaymentMethod } from '../types';

function resolveDivisionAndDistrict(divInput?: string, distInput?: string) {
  let matchedDiv = BANGLADESH_DIVISIONS[0];
  if (divInput) {
    const foundDiv = BANGLADESH_DIVISIONS.find(
      (d) =>
        d.nameBn === divInput.trim() ||
        d.nameEn.toLowerCase() === divInput.trim().toLowerCase()
    );
    if (foundDiv) matchedDiv = foundDiv;
  }

  let matchedDist = matchedDiv.districts[0];
  if (distInput) {
    const cleanDist = distInput.trim().toLowerCase();
    // Search within matchedDiv first
    const inDiv = matchedDiv.districts.find(
      (d) => d.toLowerCase().includes(cleanDist) || cleanDist.includes(d.toLowerCase())
    );
    if (inDiv) {
      matchedDist = inDiv;
    } else {
      // Search across all divisions if only district was stored
      for (const divObj of BANGLADESH_DIVISIONS) {
        const found = divObj.districts.find(
          (d) => d.toLowerCase().includes(cleanDist) || cleanDist.includes(d.toLowerCase())
        );
        if (found) {
          matchedDiv = divObj;
          matchedDist = found;
          break;
        }
      }
    }
  }

  const area: 'dhaka' | 'outside' =
    matchedDiv.nameBn === 'ঢাকা' && matchedDist.includes('ঢাকা') ? 'dhaka' : 'outside';

  return {
    division: matchedDiv.nameBn,
    district: matchedDist,
    area,
  };
}

export const CheckoutPage: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    cartDiscount,
    calculateShippingFee,
    currentUser,
    addDeliveryAddress,
    placeOrder,
    depositToWallet,
    setIsAuthModalOpen,
    language,
    t,
    formatPrice,
    setCurrentPage,
    addToast,
  } = useApp();

  const savedAddresses = useMemo<DeliveryAddress[]>(() => {
    return currentUser?.addresses || [];
  }, [currentUser?.addresses]);

  const defaultSavedAddress = useMemo(() => {
    return savedAddresses.find((a) => a.isDefault) || savedAddresses[0];
  }, [savedAddresses]);

  const hasProfileAddress = Boolean(
    currentUser &&
      ((defaultSavedAddress?.address && defaultSavedAddress.address.trim()) ||
        (currentUser.village && currentUser.village.trim()))
  );

  const initialLocation = resolveDivisionAndDistrict(
    defaultSavedAddress?.division || currentUser?.division,
    defaultSavedAddress?.district || currentUser?.district
  );

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    defaultSavedAddress?.id || (hasProfileAddress ? 'profile' : '')
  );
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(!hasProfileAddress);
  const [saveAddressToProfile, setSaveAddressToProfile] = useState<boolean>(!hasProfileAddress);

  // Form State
  const [fullName, setFullName] = useState(
    defaultSavedAddress?.recipientName || currentUser?.name || ''
  );
  const [phone, setPhone] = useState(defaultSavedAddress?.phone || currentUser?.phone || '');
  const [division, setDivision] = useState(initialLocation.division);
  const [district, setDistrict] = useState(initialLocation.district);
  const [thana, setThana] = useState(defaultSavedAddress?.thana || currentUser?.thana || '');
  const [address, setAddress] = useState(
    defaultSavedAddress?.address || currentUser?.village || ''
  );
  const [deliveryArea, setDeliveryArea] = useState<'dhaka' | 'outside'>(initialLocation.area);

  const [checkoutStep, setCheckoutStep] = useState<'address' | 'payment'>('address');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'wallet'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Add Money (Wallet Deposit) Modal State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<string>('500');
  const [depositMethod, setDepositMethod] = useState<WalletPaymentMethod>('bangla_qr');
  const [depositSenderNumber, setDepositSenderNumber] = useState<string>('');
  const [depositTrxId, setDepositTrxId] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState(false);

  const applySavedAddress = (addr?: DeliveryAddress) => {
    if (addr) {
      const loc = resolveDivisionAndDistrict(
        addr.division || currentUser?.division,
        addr.district || currentUser?.district
      );
      setSelectedAddressId(addr.id);
      setFullName(addr.recipientName || currentUser?.name || '');
      setPhone(addr.phone || currentUser?.phone || '');
      setDivision(loc.division);
      setDistrict(loc.district);
      setThana(addr.thana || '');
      setAddress(addr.address || '');
      setDeliveryArea(loc.area);
      setIsEditingAddress(false);
    } else if (currentUser) {
      const loc = resolveDivisionAndDistrict(currentUser.division, currentUser.district);
      setSelectedAddressId('profile');
      setFullName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setDivision(loc.division);
      setDistrict(loc.district);
      setThana(currentUser.thana || '');
      setAddress(currentUser.village || '');
      setDeliveryArea(loc.area);
      setIsEditingAddress(!(currentUser.village || '').trim());
    }
  };

  // Auto-populate when customer profile or saved addresses load/change
  useEffect(() => {
    if (!currentUser) return;
    const def = currentUser.addresses?.find((a) => a.isDefault) || currentUser.addresses?.[0];
    if (def) {
      const loc = resolveDivisionAndDistrict(
        def.division || currentUser.division,
        def.district || currentUser.district
      );
      setSelectedAddressId(def.id);
      setFullName((prev) => prev || def.recipientName || currentUser.name || '');
      setPhone((prev) => prev || def.phone || currentUser.phone || '');
      setDivision(loc.division);
      setDistrict(loc.district);
      setThana((prev) => prev || def.thana || currentUser.thana || '');
      setAddress((prev) => prev || def.address || currentUser.village || '');
      setDeliveryArea(loc.area);
      if (def.address?.trim()) setIsEditingAddress(false);
    } else {
      const loc = resolveDivisionAndDistrict(currentUser.division, currentUser.district);
      setFullName((prev) => prev || currentUser.name || '');
      setPhone((prev) => prev || currentUser.phone || '');
      if (currentUser.division || currentUser.district) {
        setDivision(loc.division);
        setDistrict(loc.district);
        setDeliveryArea(loc.area);
      }
      setThana((prev) => prev || currentUser.thana || '');
      setAddress((prev) => prev || currentUser.village || '');
      if (currentUser.village?.trim()) {
        setSelectedAddressId('profile');
        setIsEditingAddress(false);
      }
    }
  }, [currentUser?.id, currentUser?.addresses?.length]);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-50 text-[#00873E] rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">{t.emptyCart}</h2>
        <button
          type="button"
          onClick={() => setCurrentPage('shop')}
          className="min-h-[44px] px-6 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
        >
          {t.startShopping}
        </button>
      </div>
    );
  }

  const currentDivObj =
    BANGLADESH_DIVISIONS.find((d) => d.nameBn === division || d.nameEn === division) ||
    BANGLADESH_DIVISIONS[0];

  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    const divObj = BANGLADESH_DIVISIONS.find((d) => d.nameBn === newDiv || d.nameEn === newDiv);
    if (divObj && divObj.districts.length > 0) {
      const firstDist = divObj.districts[0];
      setDistrict(firstDist);
      setDeliveryArea(newDiv === 'ঢাকা' && firstDist.includes('ঢাকা') ? 'dhaka' : 'outside');
    }
  };

  const handleDistrictChange = (newDist: string) => {
    setDistrict(newDist);
    setDeliveryArea(division === 'ঢাকা' && newDist.includes('ঢাকা') ? 'dhaka' : 'outside');
  };

  const dynamicShippingFee = calculateShippingFee(deliveryArea, 'regular', cartSubtotal);
  const calculatedTotal = Math.max(0, cartSubtotal - cartDiscount + dynamicShippingFee);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    addToast(
      language === 'bn' ? `${label} কপি করা হয়েছে` : `${label} copied`,
      'success'
    );
  };

  const validateAddressFields = (): boolean => {
    if (!fullName.trim()) {
      addToast(language === 'bn' ? 'আপনার নাম লিখুন' : 'Enter your name', 'error');
      setCheckoutStep('address');
      setIsEditingAddress(true);
      return false;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 11) {
      addToast(
        language === 'bn' ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন' : 'Enter valid 11-digit phone number',
        'error'
      );
      setCheckoutStep('address');
      setIsEditingAddress(true);
      return false;
    }
    if (!address.trim()) {
      addToast(
        language === 'bn' ? 'সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন' : 'Enter delivery address',
        'error'
      );
      setCheckoutStep('address');
      setIsEditingAddress(true);
      return false;
    }
    return true;
  };

  const handleProceedToPayment = () => {
    if (!validateAddressFields()) return;
    setCheckoutStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const walletBalance = currentUser?.balance || 0;
  const walletShortfall = Math.max(0, calculatedTotal - walletBalance);

  const openQuickDepositModal = () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    const suggested = walletShortfall > 0 ? walletShortfall : 500;
    setDepositAmount(String(suggested));
    setIsDepositModalOpen(true);
  };

  const handleQuickDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(depositAmount, 10);
    if (!amt || amt <= 0) {
      addToast(language === 'bn' ? 'সঠিক টাকার পরিমাণ দিন' : 'Enter a valid amount', 'error');
      return;
    }
    if (!depositSenderNumber.trim()) {
      addToast(
        language === 'bn' ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন তা দিন' : 'Enter sender number',
        'error'
      );
      return;
    }
    if (!depositTrxId.trim()) {
      addToast(language === 'bn' ? 'TrxID প্রদান করুন' : 'Enter TrxID', 'error');
      return;
    }

    setIsDepositing(true);
    try {
      const res = await depositToWallet(
        amt,
        depositMethod,
        depositSenderNumber.trim(),
        depositTrxId.trim().toUpperCase()
      );
      if (res.success) {
        setIsDepositModalOpen(false);
        setDepositSenderNumber('');
        setDepositTrxId('');
        setPaymentMethod('wallet');
      }
    } finally {
      setIsDepositing(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutStep === 'address') {
      handleProceedToPayment();
      return;
    }
    if (!validateAddressFields()) return;
    if (paymentMethod === 'wallet') {
      if (!currentUser) {
        addToast(
          language === 'bn'
            ? 'অ্যাকাউন্ট ব্যালেন্স দিয়ে পেমেন্ট করতে লগইন করুন'
            : 'Login to pay with account balance',
          'error'
        );
        setIsAuthModalOpen(true);
        return;
      }
      if (walletBalance < calculatedTotal) {
        addToast(
          language === 'bn'
            ? `অ্যাকাউন্টে পর্যাপ্ত ব্যালেন্স নেই (প্রয়োজন ${formatPrice(calculatedTotal)})`
            : `Insufficient account balance`,
          'error'
        );
        openQuickDepositModal();
        return;
      }
    }

    if (currentUser && isEditingAddress && saveAddressToProfile) {
      addDeliveryAddress({
        title: language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Address',
        recipientName: fullName.trim(),
        phone: phone.trim(),
        division,
        district,
        thana: thana.trim() || undefined,
        address: address.trim(),
        isDefault: savedAddresses.length === 0,
      });
    }

    setIsSubmitting(true);

    setTimeout(() => {
      placeOrder(
        {
          fullName: fullName.trim(),
          phone: phone.trim(),
          division: deliveryArea === 'dhaka' ? 'ঢাকা' : division,
          district: deliveryArea === 'dhaka' ? 'ঢাকা' : district,
          thana: thana.trim() || undefined,
          address: thana.trim() ? `${address.trim()}, ${thana.trim()}` : address.trim(),
          deliverySpeed: 'regular',
          email: currentUser?.email || '',
        },
        paymentMethod,
        dynamicShippingFee
      );
      setIsSubmitting(false);
    }, 600);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6">
      {/* Compact Header & 2-Step Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {language === 'bn' ? 'অর্ডার কনফার্ম করুন' : 'Confirm Order'}
          </h1>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCheckoutStep('address')}
              className={`inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                checkoutStep === 'address'
                  ? 'text-[#00873E]'
                  : 'text-slate-600 hover:text-[#00873E]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  checkoutStep === 'payment'
                    ? 'bg-[#00873E] text-white'
                    : 'bg-[#062919] text-white'
                }`}
              >
                {checkoutStep === 'payment' ? <Check className="w-3 h-3" /> : '১'}
              </span>
              <span>{language === 'bn' ? 'ঠিকানা' : 'Address'}</span>
            </button>

            <span className="text-slate-300">/</span>

            <button
              type="button"
              onClick={handleProceedToPayment}
              className={`inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                checkoutStep === 'payment'
                  ? 'text-[#00873E]'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  checkoutStep === 'payment'
                    ? 'bg-[#062919] text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                ২
              </span>
              <span>{language === 'bn' ? 'পেমেন্ট' : 'Payment'}</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            checkoutStep === 'payment' ? setCheckoutStep('address') : setCurrentPage('cart')
          }
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#00873E] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>
            {checkoutStep === 'payment'
              ? language === 'bn'
                ? 'ঠিকানায় ফিরুন'
                : 'Back to Address'
              : language === 'bn'
              ? 'কার্টে ফিরুন'
              : 'Back to Cart'}
          </span>
        </button>
      </div>

      <form
        onSubmit={handleFormSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
      >
        {/* Left Column: Step 1 (Address) or Step 2 (Payment) */}
        <div className="lg:col-span-7 space-y-5">
          {checkoutStep === 'address' ? (
            /* Step 1: Delivery Address Card */
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#00873E] shrink-0" />
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Delivery Address'}
                </h2>
              </div>

              {hasProfileAddress && (
                <button
                  type="button"
                  onClick={() => {
                    if (isEditingAddress) {
                      applySavedAddress(defaultSavedAddress);
                    } else {
                      setIsEditingAddress(true);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00873E] hover:text-[#007033] cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>
                    {isEditingAddress
                      ? language === 'bn'
                        ? 'সেভ করা ঠিকানা দেখুন'
                        : 'Use Saved'
                      : language === 'bn'
                      ? 'ঠিকানা পরিবর্তন করুন'
                      : 'Change Address'}
                  </span>
                </button>
              )}
            </div>

            {/* Quick Saved Address Switcher (when user has saved profile addresses) */}
            {savedAddresses.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {savedAddresses.map((addr) => {
                  const isActive = !isEditingAddress && selectedAddressId === addr.id;
                  return (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => applySavedAddress(addr)}
                      className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#062919] text-white border-[#062919]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3" />}
                      <span>{addr.title}</span>
                    </button>
                  );
                })}
                {!isEditingAddress && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingAddress(true);
                      setSelectedAddressId('custom');
                    }}
                    className="min-h-[36px] px-3 rounded-xl text-xs font-semibold border border-dashed border-slate-300 text-slate-600 hover:border-[#00873E] hover:text-[#00873E] transition-colors cursor-pointer"
                  >
                    + {language === 'bn' ? 'অন্য ঠিকানা' : 'New Address'}
                  </button>
                )}
              </div>
            )}

            {/* Clean Auto-Filled Address Summary OR Inline Edit Form */}
            {!isEditingAddress && address.trim() ? (
              <div className="bg-[#F8FAFC] rounded-xl p-4 border border-slate-200/80 space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">{fullName}</span>
                  <span className="text-xs font-semibold text-slate-700 font-mono tabular-nums">
                    {phone}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {address}
                  {thana ? `, ${thana}` : ''}, {district}, {division}
                </p>
                <div className="pt-1 flex items-center gap-2 text-xs text-[#00873E] font-semibold tabular-nums">
                  <Truck className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {deliveryArea === 'dhaka'
                      ? language === 'bn'
                        ? 'ঢাকার ভেতরে'
                        : 'Inside Dhaka'
                      : language === 'bn'
                      ? 'ঢাকার বাইরে'
                      : 'Outside Dhaka'}{' '}
                    ·{' '}
                    {dynamicShippingFee === 0
                      ? language === 'bn'
                        ? 'ফ্রি ডেলিভারি'
                        : 'Free Delivery'
                      : formatPrice(dynamicShippingFee)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'নাম' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={language === 'bn' ? 'আপনার নাম' : 'Full Name'}
                      className="w-full h-11 bg-slate-50/70 border border-slate-300 rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone'} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full h-11 bg-slate-50/70 border border-slate-300 rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 font-mono outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'বিভাগ' : 'Division'} *
                    </label>
                    <select
                      value={division}
                      onChange={(e) => handleDivisionChange(e.target.value)}
                      className="w-full h-11 bg-slate-50/70 border border-slate-300 rounded-xl px-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00873E] focus:bg-white cursor-pointer"
                    >
                      {BANGLADESH_DIVISIONS.map((div) => (
                        <option key={div.nameBn} value={div.nameBn}>
                          {div.nameBn}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'জেলা' : 'District'} *
                    </label>
                    <select
                      value={district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                      className="w-full h-11 bg-slate-50/70 border border-slate-300 rounded-xl px-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00873E] focus:bg-white cursor-pointer"
                    >
                      {currentDivObj.districts.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {language === 'bn' ? 'থানা / উপজেলা' : 'Thana'}
                    </label>
                    <input
                      type="text"
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      placeholder={language === 'bn' ? 'থানা' : 'Thana'}
                      className="w-full h-11 bg-slate-50/70 border border-slate-300 rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {language === 'bn' ? 'বিস্তারিত ঠিকানা' : 'Full Address'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={
                      language === 'bn' ? 'বাসা নং, রোড, এলাকা' : 'House, Road, Area'
                    }
                    className="w-full h-11 bg-slate-50/70 border border-slate-300 rounded-xl px-3.5 text-xs sm:text-sm text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                  {currentUser ? (
                    <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={saveAddressToProfile}
                        onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                        className="w-4 h-4 accent-[#00873E] rounded cursor-pointer"
                      />
                      <span>
                        {language === 'bn' ? 'প্রোফাইলে ঠিকানাটি সেভ রাখুন' : 'Save to profile'}
                      </span>
                    </label>
                  ) : (
                    <span />
                  )}

                  <span className="text-xs font-semibold text-[#00873E] tabular-nums">
                    {deliveryArea === 'dhaka'
                      ? language === 'bn'
                        ? 'ঢাকার ভেতরে'
                        : 'Inside Dhaka'
                      : language === 'bn'
                      ? 'ঢাকার বাইরে'
                      : 'Outside Dhaka'}{' '}
                    ·{' '}
                    {dynamicShippingFee === 0
                      ? language === 'bn'
                        ? 'ফ্রি ডেলিভারি'
                        : 'Free Delivery'
                      : formatPrice(dynamicShippingFee)}
                  </span>
                </div>
              </div>
            )}

            {/* Step 1 Primary CTA -> Advance to Payment Options */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleProceedToPayment}
                className="w-full min-h-[48px] px-5 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>
                  {language === 'bn' ? 'পরবর্তী: পেমেন্ট অপশন' : 'Next: Payment Options'}
                </span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>
          ) : (
            <>
              {/* Step 2: Compact Confirmed Address Strip */}
              <div className="bg-white rounded-2xl px-5 py-4 border border-slate-200/80 shadow-xs flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <MapPin className="w-4 h-4 text-[#00873E] shrink-0 mt-0.5" />
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-900">
                        {fullName}
                      </span>
                      <span className="text-xs font-mono text-slate-600 tabular-nums">
                        {phone}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 truncate sm:whitespace-normal">
                      {address}
                      {thana ? `, ${thana}` : ''}, {district}, {division}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('address')}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#00873E] hover:text-[#007033] shrink-0 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'পরিবর্তন' : 'Edit'}</span>
                </button>
              </div>

              {/* Step 2: Payment Method Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900">
                    {language === 'bn' ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}
                  </h2>
                  {currentUser && (
                    <button
                      type="button"
                      onClick={openQuickDepositModal}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#00873E] hover:text-[#007033] cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{language === 'bn' ? 'টাকা এড করুন' : 'Add Money'}</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Cash on Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      paymentMethod === 'cod'
                        ? 'border-[#00873E] bg-emerald-50/70 ring-1 ring-[#00873E]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'cod'
                          ? 'border-[#00873E] bg-[#00873E]'
                          : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'cod' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-[#00873E] shrink-0" />
                        <span className="truncate">
                          {language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {language === 'bn' ? 'পণ্য হাতে পেয়ে পরিশোধ' : 'Pay when delivered'}
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Customer Account Balance (Wallet) */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      paymentMethod === 'wallet'
                        ? 'border-[#00873E] bg-emerald-50/70 ring-1 ring-[#00873E]'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'wallet'
                          ? 'border-[#00873E] bg-[#00873E]'
                          : 'border-slate-300'
                      }`}
                    >
                      {paymentMethod === 'wallet' && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-[#00873E] shrink-0" />
                        <span className="truncate">
                          {language === 'bn' ? 'অ্যাকাউন্ট ব্যালেন্স' : 'Account Balance'}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold mt-0.5 tabular-nums truncate">
                        {currentUser ? (
                          <span
                            className={
                              walletBalance >= calculatedTotal
                                ? 'text-[#00873E]'
                                : 'text-slate-600'
                            }
                          >
                            {language === 'bn' ? 'ব্যালেন্স:' : 'Balance:'}{' '}
                            {formatPrice(walletBalance)}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal">
                            {language === 'bn' ? 'লগইন করে ব্যবহার করুন' : 'Login to use'}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Account Balance Status / Quick Top-up */}
                {paymentMethod === 'wallet' && (
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/80 text-xs space-y-2.5">
                    {!currentUser ? (
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-slate-600">
                          {language === 'bn'
                            ? 'অ্যাকাউন্টের টাকা দিয়ে পেমেন্ট করতে লগইন করুন'
                            : 'Login to pay using your account balance'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsAuthModalOpen(true)}
                          className="min-h-[36px] px-4 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          {language === 'bn' ? 'লগইন করুন' : 'Login'}
                        </button>
                      </div>
                    ) : walletBalance >= calculatedTotal ? (
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-slate-600">
                          {language === 'bn' ? 'বর্তমান ব্যালেন্স:' : 'Current Balance:'}{' '}
                          <strong className="text-slate-900 tabular-nums">
                            {formatPrice(walletBalance)}
                          </strong>
                        </span>
                        <span className="text-[#00873E] font-semibold tabular-nums">
                          {language === 'bn' ? 'অর্ডারের পর থাকবে:' : 'Remaining:'}{' '}
                          {formatPrice(walletBalance - calculatedTotal)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900 tabular-nums">
                            {language === 'bn'
                              ? `ব্যালেন্স ${formatPrice(walletBalance)} · আরও ${formatPrice(
                                  walletShortfall
                                )} প্রয়োজন`
                              : `Balance ${formatPrice(walletBalance)} · Need ${formatPrice(
                                  walletShortfall
                                )} more`}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {language === 'bn'
                              ? 'অ্যাকাউন্টে টাকা এড করেই পেমেন্ট করতে পারবেন'
                              : 'Add money to your account to pay now'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={openQuickDepositModal}
                          className="min-h-[38px] px-4 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{language === 'bn' ? 'টাকা এড করুন' : 'Add Money'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Column: Order Summary (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4 lg:sticky lg:top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">{t.orderSummary}</h3>
              <span className="text-xs text-slate-500 tabular-nums">
                {cart.length} {language === 'bn' ? 'টি আইটেম' : 'items'}
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cart.map((item) => {
                const title = language === 'bn' ? item.product.titleBn : item.product.titleEn;
                const variantParts = [
                  item.selectedSize,
                  item.selectedColor,
                  `${item.quantity}x`,
                ].filter(Boolean);
                return (
                  <div
                    key={`${item.product.id}-${item.selectedSize || ''}-${item.selectedColor || ''}`}
                    className="py-2.5 flex items-center gap-3"
                  >
                    <img
                      src={
                        (item.selectedImage || item.product?.images?.[0])?.includes('_L_') &&
                        (item.selectedImage || item.product?.images?.[0]).endsWith('.jpg')
                          ? (item.selectedImage || item.product?.images?.[0]).replace(
                              /\.jpg$/i,
                              '.jpeg'
                            )
                          : item.selectedImage ||
                            item.product?.images?.[0] ||
                            'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80'
                      }
                      alt={title}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes('_L_')) {
                          target.src = target.src
                            .replace('_L_', '_S_')
                            .replace(/\.jpeg$/i, '.jpg');
                        } else {
                          target.src =
                            'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80';
                        }
                      }}
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {variantParts.join(' · ')}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-900 tabular-nums shrink-0">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>{t.subtotal}</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatPrice(cartSubtotal)}
                </span>
              </div>

              {cartDiscount > 0 && (
                <div className="flex justify-between text-[#DC2626] font-medium">
                  <span>{t.discount}</span>
                  <span className="tabular-nums">-{formatPrice(cartDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>
                  {language === 'bn' ? 'ডেলিভারি' : 'Delivery'} (
                  {deliveryArea === 'dhaka'
                    ? language === 'bn'
                      ? 'ঢাকা'
                      : 'Dhaka'
                    : language === 'bn'
                    ? 'বাইরে'
                    : 'Outside'}
                  )
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {dynamicShippingFee === 0
                    ? language === 'bn'
                      ? 'ফ্রি'
                      : 'Free'
                    : formatPrice(dynamicShippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-base sm:text-lg font-extrabold text-slate-900 pt-3 border-t border-slate-200">
                <span>{language === 'bn' ? 'সর্বমোট' : 'Total'}</span>
                <span className="text-[#00873E] tabular-nums">
                  {formatPrice(calculatedTotal)}
                </span>
              </div>
            </div>

            {checkoutStep === 'payment' ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="theme-btn-cart w-full min-h-[50px] px-5 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>{language === 'bn' ? 'অর্ডার হচ্ছে...' : 'Placing Order...'}</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 shrink-0" />
                    <span className="tabular-nums">
                      {language === 'bn'
                        ? `অর্ডার কনফার্ম করুন · ${formatPrice(calculatedTotal)}`
                        : `Confirm Order · ${formatPrice(calculatedTotal)}`}
                    </span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            ) : (
              <p className="text-xs text-slate-500 text-center pt-1">
                {language === 'bn'
                  ? 'ঠিকানা নিশ্চিত করার পর পেমেন্ট অপশন দেখতে পাবেন'
                  : 'Select payment method in the next step'}
              </p>
            )}
          </div>
        </div>
      </form>

      {/* Quick Add Money Modal */}
      {isDepositModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsDepositModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#00873E]" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {language === 'bn' ? 'অ্যাকাউন্টে টাকা এড করুন' : 'Add Money to Account'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickDepositSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {language === 'bn' ? 'টাকার পরিমাণ (৳)' : 'Amount (BDT)'} *
                </label>
                <input
                  type="number"
                  min="10"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full h-11 bg-slate-50 border border-slate-300 rounded-xl px-3.5 text-sm font-bold font-mono text-slate-900 outline-none focus:border-[#00873E] focus:bg-white tabular-nums"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    ...(walletShortfall > 0 ? [walletShortfall] : []),
                    200,
                    500,
                    1000,
                  ]
                    .filter((v, i, arr) => arr.indexOf(v) === i)
                    .map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setDepositAmount(String(amt))}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold cursor-pointer transition-colors ${
                          depositAmount === String(amt)
                            ? 'bg-[#00873E] text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        ৳{amt}
                      </button>
                    ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bangla_qr', label: 'Bangla QR' },
                  { id: 'bkash', label: 'বিকাশ' },
                  { id: 'nagad', label: 'নগদ' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setDepositMethod(m.id as WalletPaymentMethod)}
                    className={`min-h-[38px] rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      depositMethod === m.id
                        ? 'border-[#00873E] bg-emerald-50 text-[#00873E]'
                        : 'border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                {depositMethod === 'bangla_qr' && (
                  <img
                    src="/assets/bangla_qr_code.png"
                    alt="Bangla QR"
                    className="w-20 h-20 object-contain rounded-lg bg-white p-1 border border-slate-200 shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">
                      {language === 'bn' ? 'পাঠানোর নম্বর:' : 'Send to:'}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('01929637253', 'নম্বর')}
                      className="inline-flex items-center gap-1 font-mono font-bold text-slate-900 hover:text-[#00873E] cursor-pointer"
                    >
                      <span>01929-637253</span>
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {language === 'bn'
                      ? `উপরের নম্বরে ৳${depositAmount || 0} পাঠিয়ে নিচে প্রেরক নম্বর ও TrxID দিন`
                      : `Send ৳${depositAmount || 0} above and enter Sender & TrxID below`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="tel"
                  required
                  value={depositSenderNumber}
                  onChange={(e) => setDepositSenderNumber(e.target.value)}
                  placeholder={language === 'bn' ? 'প্রেরক নম্বর' : 'Sender Number'}
                  className="h-10 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs text-slate-900 outline-none focus:border-[#00873E] focus:bg-white"
                />
                <input
                  type="text"
                  required
                  value={depositTrxId}
                  onChange={(e) => setDepositTrxId(e.target.value.toUpperCase())}
                  placeholder="TrxID"
                  className="h-10 bg-slate-50 border border-slate-300 rounded-xl px-3 text-xs font-mono uppercase text-slate-900 outline-none focus:border-[#00873E] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={isDepositing}
                className="w-full min-h-[44px] bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50"
              >
                {isDepositing
                  ? language === 'bn'
                    ? 'যোগ হচ্ছে...'
                    : 'Adding...'
                  : language === 'bn'
                  ? `৳${depositAmount || 0} অ্যাকাউন্টে এড করুন`
                  : `Add ৳${depositAmount || 0} to Account`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const OrderSuccessView: React.FC = () => {
  const { lastPlacedOrder, language, t, formatPrice, setCurrentPage, openTrackOrder } = useApp();

  if (!lastPlacedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <button
          type="button"
          onClick={() => setCurrentPage('home')}
          className="min-h-[44px] px-6 bg-[#00873E] text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          {t.home}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-[#00873E] rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900">{t.orderSuccessTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {language === 'bn' ? 'অর্ডার নম্বর:' : 'Order ID:'}{' '}
            <span className="font-mono font-bold text-slate-800">{lastPlacedOrder.id}</span>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/70 text-left text-xs">
          <div>
            <span className="text-slate-500 block">
              {language === 'bn' ? 'ট্র্যাকিং কোড' : 'Tracking'}
            </span>
            <span className="font-mono font-bold text-[#00873E] mt-0.5 block">
              {lastPlacedOrder.trackingNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">
              {language === 'bn' ? 'পেমেন্ট' : 'Payment'}
            </span>
            <span className="font-semibold text-slate-900 mt-0.5 block">
              {lastPlacedOrder.paymentMethod === 'bangla_qr'
                ? 'Bangla QR'
                : lastPlacedOrder.paymentMethod === 'wallet'
                ? language === 'bn'
                  ? 'ওয়ালেট'
                  : 'Wallet'
                : language === 'bn'
                ? 'ক্যাশ অন ডেলিভারি'
                : 'Cash on Delivery'}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-slate-500 block">{t.total}</span>
            <span className="font-bold text-slate-900 text-sm tabular-nums mt-0.5 block">
              {formatPrice(lastPlacedOrder.total)}
            </span>
          </div>
        </div>

        <div className="text-left text-xs sm:text-sm text-slate-600 bg-[#F8FAFC] p-4 rounded-xl border border-slate-200/70 space-y-1">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#00873E] shrink-0" />
            <span>
              {lastPlacedOrder.shippingAddress.fullName} ·{' '}
              <span className="font-mono tabular-nums">{lastPlacedOrder.shippingAddress.phone}</span>
            </span>
          </div>
          <p className="pl-5.5">
            {lastPlacedOrder.shippingAddress.address}, {lastPlacedOrder.shippingAddress.district}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => openTrackOrder(lastPlacedOrder.trackingNumber || lastPlacedOrder.id)}
            className="w-full sm:w-auto min-h-[44px] px-6 bg-[#00873E] hover:bg-[#007033] text-white font-bold rounded-xl text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>{t.trackOrderBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage('home')}
            className="w-full sm:w-auto min-h-[44px] px-6 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'আরও কেনাকাটা করুন' : 'Continue Shopping'}
          </button>
        </div>
      </div>
    </div>
  );
};
