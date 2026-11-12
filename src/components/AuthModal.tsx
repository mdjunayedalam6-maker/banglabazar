import React, { useState, useRef } from 'react';
import { 
  X, 
  User as UserIcon, 
  Lock, 
  Phone, 
  Mail, 
  ArrowRight,
  MapPin,
  Map,
  Home,
  CheckCircle2,
  ImagePlus,
  Eye,
  EyeOff,
  Trash2,
  Gift
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BANGLADESH_DIVISIONS } from '../data/mockData';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    loginUser, 
    loginWithGoogle, 
    registerUser, 
    language, 
    addToast,
    activeReferralCode
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [division, setDivision] = useState(BANGLADESH_DIVISIONS[0].nameBn);
  const [district, setDistrict] = useState(BANGLADESH_DIVISIONS[0].districts[0]);
  const [thana, setThana] = useState('');
  const [village, setVillage] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState<string>(() => activeReferralCode || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (activeReferralCode) {
      setReferralCodeInput(activeReferralCode);
    }
  }, [activeReferralCode]);

  if (!isAuthModalOpen) return null;

  // Division and district options
  const selectedDivObj = BANGLADESH_DIVISIONS.find(
    (d) => d.nameBn === division || d.nameEn === division
  ) || BANGLADESH_DIVISIONS[0];

  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    const divObj = BANGLADESH_DIVISIONS.find((d) => d.nameBn === newDiv || d.nameEn === newDiv);
    if (divObj && divObj.districts.length > 0) {
      setDistrict(divObj.districts[0]);
    }
  };

  // Handle Gallery / Local File Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast(
        language === 'bn' ? 'দয়া করে একটি সঠিক ছবি ফাইল নির্বাচন করুন' : 'Please select a valid image file',
        'error'
      );
      return;
    }

    // Limit to 4MB to prevent excessive memory/storage bloat
    if (file.size > 4 * 1024 * 1024) {
      addToast(
        language === 'bn' ? 'ছবির সাইজ সর্বোচ্চ 4MB হতে পারবে' : 'Image size must be less than 4MB',
        'error'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatar(result);
      setAvatarPreview(result);
      addToast(
        language === 'bn' ? 'প্রোফাইল ছবি সফলভাবে যুক্ত হয়েছে' : 'Profile photo selected successfully',
        'success'
      );
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Handlers
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      addToast(
        language === 'bn' ? 'দয়া করে আপনার ইমেইল অথবা মোবাইল নম্বর লিখুন' : 'Please enter your email or mobile number',
        'error'
      );
      return;
    }
    if (!loginPassword) {
      addToast(
        language === 'bn' ? 'দয়া করে আপনার পাসওয়ার্ড লিখুন' : 'Please enter your password',
        'error'
      );
      return;
    }

    loginUser(loginIdentifier, loginPassword);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      addToast(
        language === 'bn' ? 'আপনার নাম লিখুন' : 'Please provide your full name',
        'error'
      );
      return;
    }

    let cleanEmail = email.trim();
    let cleanPhone = phone.trim();

    // Smart swap if customer typed email into phone box or phone into email box
    if (cleanPhone.includes('@') && !cleanEmail) {
      cleanEmail = cleanPhone;
      cleanPhone = '';
    }
    const emailDigits = cleanEmail.replace(/[^0-9]/g, '');
    if (!cleanEmail.includes('@') && emailDigits.length >= 10 && !cleanPhone) {
      cleanPhone = cleanEmail;
      cleanEmail = '';
    }

    const cleanDigits = cleanPhone.replace(/[^0-9]/g, '');

    // Check that at least one contact method is provided
    if (!cleanDigits && !cleanEmail) {
      addToast(
        language === 'bn' 
          ? 'মোবাইল নম্বর অথবা ইমেইল — যেকোনো একটি অবশ্যই প্রদান করুন' 
          : 'Please provide either a mobile number or an email address',
        'error'
      );
      return;
    }

    // If phone is provided, validate length
    if (cleanPhone && cleanDigits.length < 10) {
      addToast(
        language === 'bn' ? 'কমপক্ষে 10-11 ডিজিটের সঠিক মোবাইল নম্বর দিন' : 'Please provide a valid 11-digit phone number',
        'error'
      );
      return;
    }

    // If email is provided, validate format
    if (cleanEmail && (!cleanEmail.includes('@') || !cleanEmail.includes('.'))) {
      addToast(
        language === 'bn' ? 'একটি সঠিক ইমেইল অ্যাড্রেস দিন' : 'Please provide a valid email address',
        'error'
      );
      return;
    }

    if (!registerPassword || registerPassword.length < 4) {
      addToast(
        language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে 4 অক্ষরের হতে হবে' : 'Password must be at least 4 characters',
        'error'
      );
      return;
    }

    registerUser({
      email: cleanEmail,
      name: name.trim(),
      phone: cleanPhone,
      password: registerPassword,
      division: division,
      district: district,
      thana: thana.trim(),
      village: village.trim(),
      avatar: avatar || undefined,
      referredBy: referralCodeInput.trim().toUpperCase() || undefined
    });
  };

  const handleGoogleClick = async () => {
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setTimeout(() => setIsGoogleLoading(false), 2000);
    }
  };

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

  const renderSocialAuthButtons = () => (
    <div className="mt-5">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-slate-500 font-medium">
            {language === 'bn' ? 'অথবা সরাসরি এর মাধ্যমে' : 'Or continue with'}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={isGoogleLoading}
        onClick={handleGoogleClick}
        className="mt-4 w-full flex items-center justify-center gap-3 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xs active:scale-98 cursor-pointer disabled:opacity-70"
      >
        {isGoogleLoading ? (
          <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
        )}
        <span>
          {isGoogleLoading
            ? (language === 'bn' ? 'গুগল সংযুক্ত হচ্ছে...' : 'Connecting to Google...')
            : (language === 'bn' ? 'গুগল দিয়ে লগইন/রেজিস্টার করুন' : 'Continue with Google')}
        </span>
      </button>

      {isIframe && (
        <p className="text-[11px] text-slate-400 text-center mt-2.5 leading-relaxed">
          {language === 'bn'
            ? '💡 প্রিভিউ ফ্রেমের নিরাপত্তার জন্য গুগল লগইন নতুন ট্যাবে ওপেন হবে'
            : '💡 Google sign-in opens in a new tab for preview frame security'}
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsAuthModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-5 sm:p-7 border border-slate-100 z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute right-4 top-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-sm">
            {activeTab === 'login' ? <Lock className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">
            {activeTab === 'login' 
              ? (language === 'bn' ? 'অ্যাকাউন্টে লগইন করুন' : 'Sign in to your account')
              : (language === 'bn' ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create a new account')}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'login'
              ? (language === 'bn' ? 'আপনার ইমেইল অথবা মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে লগইন করুন' : 'Log in using your registered email or mobile number & password')
              : (language === 'bn' ? 'ইমেইল, মোবাইল নম্বর ও প্রয়োজনীয় তথ্য দিয়ে রেজিস্ট্রেশন করুন' : 'Enter your email, mobile number and details to register')}
          </p>
        </div>

        {/* Top Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'লগইন' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {language === 'bn' ? 'নতুন রেজিস্ট্রেশন' : 'Register'}
          </button>
        </div>

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>{language === 'bn' ? 'ইমেইল অথবা মোবাইল নম্বর' : 'Email or Mobile Number'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {language === 'bn' ? 'উভয় দিয়ে লগইন সম্ভব' : 'Both supported'}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: example@gmail.com বা 017XXXXXXXX' : 'example@gmail.com or 017XXXXXXXX'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-inner"
                  />
                  <div className="absolute right-3 top-3 text-slate-400 pointer-events-none flex items-center gap-1">
                    {loginIdentifier.includes('@') ? (
                      <Mail className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Phone className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {renderSocialAuthButtons()}

            <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              <p>
                {language === 'bn' ? 'নতুন একাউন্ট খুলতে চান?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'রেজিস্ট্রেশন করুন' : 'Register Now'}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* Welcome Bonus Notice - Short & Attractive */}
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-300 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Gift className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>স্বাগতম বোনাস ৳৫০</span>
                    <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">অফার</span>
                  </div>
                  <div className="text-[11px] text-slate-600 truncate">রেজিস্ট্রেশনে ৫০ টাকা বোনাস • ১ম অর্ডারে আনলক</div>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-200 shadow-2xs shrink-0">
                +৳৫০
              </span>
            </div>

            {/* 1. Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'আপনার পূর্ণ নাম' : 'Full Name'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: মোহাম্মদ জোনায়েদ' : 'Your Full Name'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-inner"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {/* 2. Contact Information: Phone or Email (Either one is sufficient) */}
            <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/90 space-y-2.5">
              <div className="flex items-start gap-2 bg-emerald-50 text-emerald-900 border border-emerald-200/80 p-2.5 rounded-xl text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold text-emerald-950 block">
                    {language === 'bn' ? 'ফোন নম্বর অথবা ইমেইল — যেকোনো 1টি দিলেই চলবে:' : 'Phone or Email — either one is sufficient:'}
                  </span>
                  <span className="text-emerald-800">
                    {language === 'bn'
                      ? 'ফোন নম্বর থাকলে শুধু ফোন নম্বর দিলেই হবে, আলাদা করে দুটোই দেওয়া বাধ্যতামূলক নয়।'
                      : 'If you have a phone number, entering just your phone number is enough. Both are not required.'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}
                    </label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${phone.trim() ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-200/70 text-slate-600'}`}>
                      {phone.trim() ? (language === 'bn' ? '✓ প্রধান' : '✓ Added') : (language === 'bn' ? 'ফোন নম্বর দিন' : 'Enter phone')}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-600 transition-all shadow-xs"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      {language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}
                    </label>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${email.trim() ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : (phone.trim() ? 'bg-slate-100 text-slate-400' : 'bg-slate-200/70 text-slate-600')}`}>
                      {email.trim() ? (language === 'bn' ? '✓ যুক্ত হয়েছে' : '✓ Added') : (phone.trim() ? (language === 'bn' ? 'ঐচ্ছিক' : 'Optional') : (language === 'bn' ? 'ইমেইল দিন' : 'Enter email'))}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-10 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-600 transition-all shadow-xs"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Address Section (Division, District, Thana, Village) */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 pb-1 border-b border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'bn' ? 'বিস্তারিত ঠিকানা' : 'Detailed Address'}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'bn' ? 'বিভাগ' : 'Division'}
                  </label>
                  <select
                    value={division}
                    onChange={(e) => handleDivisionChange(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 cursor-pointer shadow-xs"
                  >
                    {BANGLADESH_DIVISIONS.map((d) => (
                      <option key={d.nameEn} value={language === 'bn' ? d.nameBn : d.nameEn}>
                        {language === 'bn' ? d.nameBn : d.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'bn' ? 'জেলা' : 'District'}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 cursor-pointer shadow-xs"
                  >
                    {selectedDivObj.districts.map((dst) => (
                      <option key={dst} value={dst}>
                        {dst}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'bn' ? 'থানা / উপজেলা' : 'Thana / Upazila'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      placeholder={language === 'bn' ? 'যেমন: ধানমন্ডি' : 'e.g. Dhanmondi'}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 shadow-xs"
                    />
                    <Home className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'bn' ? 'গ্রাম / এলাকা / বাসা' : 'Village / Area'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder={language === 'bn' ? 'রোড ও বাসা নং' : 'House / Road details'}
                      className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-emerald-600 shadow-xs"
                    />
                    <Map className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Profile Photo Upload from Gallery (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'bn' ? 'প্রোফাইল ছবি (গ্যালারি থেকে আপলোড)' : 'Profile Photo (From Gallery)'}
                </label>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {language === 'bn' ? 'ঐচ্ছিক (না দিলেও চলবে)' : 'Optional'}
                </span>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/*"
                className="hidden"
                id="gallery-avatar-upload"
              />

              {avatarPreview ? (
                <div className="flex items-center gap-3 bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-200">
                  <div className="relative">
                    <img
                      src={avatarPreview}
                      alt="Uploaded avatar"
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-emerald-900 truncate">
                      {language === 'bn' ? 'ছবি নির্বাচন করা হয়েছে' : 'Photo selected'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {language === 'bn' ? 'রেজিস্ট্রেশনের পর এটি প্রোফাইলে দেখাবে' : 'Will be used as profile avatar'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-bold text-emerald-700 bg-white hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-200 shadow-xs cursor-pointer transition-colors"
                    >
                      {language === 'bn' ? 'পরিবর্তন' : 'Change'}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title={language === 'bn' ? 'ছবি মুছুন' : 'Remove Photo'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-slate-50/80 hover:bg-emerald-50/40 rounded-2xl p-3 text-center cursor-pointer transition-all flex items-center justify-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-full bg-white group-hover:bg-emerald-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-700 transition-colors shadow-xs">
                    <ImagePlus className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-800 transition-colors">
                      {language === 'bn' ? 'গ্যালারি থেকে ছবি আপলোড করুন' : 'Upload photo from gallery'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {language === 'bn' ? 'না দিলেও কোনো সমস্যা নেই, স্বয়ংক্রিয় ছবি বসবে' : 'Optional: Default avatar will be used if skipped'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 5. Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'bn' ? 'পাসওয়ার্ড সেট করুন' : 'Create Password'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2 text-xs sm:text-sm text-slate-800 outline-none focus:border-emerald-600 focus:bg-white transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {language === 'bn' ? 'এই পাসওয়ার্ড এবং আপনার ইমেইল অথবা মোবাইল নম্বর দিয়ে পরে লগইন করতে পারবেন' : 'You can log in later with this password and your email or mobile number'}
              </p>
            </div>

            {/* 6. Referral Code (Optional) */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/90 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'bn' ? 'রেফারেল কোড (ঐচ্ছিক)' : 'Referral Code (Optional)'}</span>
                </label>
                {referralCodeInput.trim() ? (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>কোড যুক্ত হয়েছে</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-400">
                    {language === 'bn' ? 'না থাকলে খালি রাখুন' : 'Leave empty if none'}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                placeholder="যেমন: BB-637253"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono uppercase text-slate-800 outline-none focus:border-emerald-600 shadow-xs"
              />
              <p className="text-[10px] text-slate-400">
                {language === 'bn'
                  ? 'কোনো বন্ধু আপনাকে লিংক বা কোড দিয়ে থাকলে তা এখানে লিখুন।'
                  : 'Enter friend referral code if you were invited.'}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{language === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Complete Registration'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>

            {renderSocialAuthButtons()}

            <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              <p>
                {language === 'bn' ? 'ইতিমধ্যেই একাউন্ট আছে?' : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'লগইন করুন' : 'Sign In'}
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
