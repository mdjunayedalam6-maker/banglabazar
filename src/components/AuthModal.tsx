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
  Camera,
  Eye,
  EyeOff,
  Trash2,
  Gift,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BANGLADESH_DIVISIONS } from '../data/mockData';
import { compressImageFile } from '../utils/imageCompressor';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    loginUser,
    loginWithGoogle,
    registerUser,
    language,
    addToast,
    activeReferralCode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Streamlined Register Form State (4 core required fields)
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Optional Collapsible Detailed Delivery Address & Extra Details
  const [showDetailedAddress, setShowDetailedAddress] = useState(false);
  const [division, setDivision] = useState(BANGLADESH_DIVISIONS[0].nameBn);
  const [district, setDistrict] = useState(BANGLADESH_DIVISIONS[0].districts[0]);
  const [thana, setThana] = useState('');
  const [village, setVillage] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleAuthIssue, setGoogleAuthIssue] = useState<'provider_not_enabled' | 'popup_blocked' | 'error' | null>(null);
  const [copiedRedirectUrl, setCopiedRedirectUrl] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState<string>(
    () => activeReferralCode || ''
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (activeReferralCode) {
      setReferralCodeInput(activeReferralCode);
    }
  }, [activeReferralCode]);

  if (!isAuthModalOpen) return null;

  const selectedDivObj =
    BANGLADESH_DIVISIONS.find((d) => d.nameBn === division || d.nameEn === division) ||
    BANGLADESH_DIVISIONS[0];

  const handleDivisionChange = (newDiv: string) => {
    setDivision(newDiv);
    const divObj = BANGLADESH_DIVISIONS.find((d) => d.nameBn === newDiv || d.nameEn === newDiv);
    if (divObj && divObj.districts.length > 0) {
      setDistrict(divObj.districts[0]);
    }
  };

  // Compressed Mobile / Gallery Photo Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast(
        language === 'bn'
          ? 'দয়া করে একটি সঠিক ছবি ফাইল সিলেক্ট করুন'
          : 'Please select a valid image file',
        'error'
      );
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      addToast(
        language === 'bn' ? 'ছবির সাইজ ১৫ মেগাবাইটের কম হতে হবে' : 'Image size must be under 15MB',
        'error'
      );
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const compressed = await compressImageFile(file, 420, 420, 0.82);
      if (compressed) {
        setAvatar(compressed);
        setAvatarPreview(compressed);
        addToast(
          language === 'bn' ? 'প্রোফাইল ছবি যুক্ত হয়েছে' : 'Profile photo selected',
          'success'
        );
      }
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      addToast(
        language === 'bn'
          ? 'আপনার মোবাইল নম্বর অথবা ইমেইল লিখুন'
          : 'Please enter your mobile number or email',
        'error'
      );
      return;
    }
    if (!loginPassword) {
      addToast(
        language === 'bn' ? 'আপনার পাসওয়ার্ড লিখুন' : 'Please enter your password',
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
        language === 'bn' ? 'আপনার নাম লিখুন' : 'Please enter your full name',
        'error'
      );
      return;
    }

    const cleanPhone = phone.trim();
    const cleanDigits = cleanPhone.replace(/[^0-9]/g, '');

    if (cleanDigits.length < 10) {
      addToast(
        language === 'bn'
          ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
          : 'Please enter a valid 11-digit mobile number',
        'error'
      );
      return;
    }

    if (!registerPassword || registerPassword.length < 4) {
      addToast(
        language === 'bn'
          ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে'
          : 'Password must be at least 4 characters',
        'error'
      );
      return;
    }

    if (registerPassword !== confirmPassword) {
      addToast(
        language === 'bn'
          ? 'পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মেলেনি'
          : 'Password and confirm password do not match',
        'error'
      );
      return;
    }

    const cleanEmail = email.trim();
    if (cleanEmail && (!cleanEmail.includes('@') || !cleanEmail.includes('.'))) {
      addToast(
        language === 'bn' ? 'একটি সঠিক ইমেইল অ্যাড্রেস দিন' : 'Please provide a valid email address',
        'error'
      );
      return;
    }

    // Only save address fields if user opened/filled the optional detailed address section
    const hasAddressInput =
      showDetailedAddress && Boolean(thana.trim() || village.trim() || division);

    registerUser({
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      password: registerPassword,
      division: hasAddressInput ? division : '',
      district: hasAddressInput ? district : '',
      thana: hasAddressInput ? thana.trim() : '',
      village: hasAddressInput ? village.trim() : '',
      avatar: avatar || undefined,
      referredBy: referralCodeInput.trim().toUpperCase() || undefined,
    });
  };

  const handleGoogleClick = async () => {
    setGoogleAuthIssue(null);
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (res && !res.ok) {
        setGoogleAuthIssue(res.reason || 'error');
        setIsGoogleLoading(false);
        return;
      }
      setTimeout(() => setIsGoogleLoading(false), 2500);
    } catch {
      setIsGoogleLoading(false);
    }
  };

  const handleCopyRedirectUrl = (urlToCopy: string) => {
    try {
      navigator.clipboard?.writeText(urlToCopy);
      setCopiedRedirectUrl(true);
      setTimeout(() => setCopiedRedirectUrl(false), 2000);
    } catch {}
  };

  const passwordsMatch =
    confirmPassword.length > 0 && registerPassword === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && registerPassword !== confirmPassword;

  const hasEnteredOptionalAddress = Boolean(thana.trim() || village.trim());
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const renderSocialAuthButtons = (mode: 'login' | 'register') => (
    <div className="pt-2">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-white text-slate-400 font-medium">
            {language === 'bn' ? 'অথবা ১-ক্লিকে গুগল দিয়ে' : 'Or 1-click via Google'}
          </span>
        </div>
      </div>

      <button
        type="button"
        disabled={isGoogleLoading}
        onClick={handleGoogleClick}
        className="mt-3 w-full min-h-[46px] flex items-center justify-center gap-2.5 px-3 py-2.5 bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-slate-800 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-70 shadow-2xs"
      >
        {isGoogleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#00873E]" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span>
          {isGoogleLoading
            ? language === 'bn'
              ? 'গুগল অ্যাকাউন্ট নির্বাচন খুলছে...'
              : 'Opening Google Account Picker...'
            : mode === 'register'
            ? language === 'bn'
              ? 'গুগল (Gmail) দিয়ে রেজিস্ট্রেশন করুন'
              : 'Register with Google'
            : language === 'bn'
            ? 'গুগল (Gmail) দিয়ে লগইন করুন'
            : 'Sign in with Google'}
        </span>
      </button>

      <p className="text-[11px] text-slate-500 text-center mt-1.5">
        {language === 'bn'
          ? isIframe
            ? 'ক্লিক করে আপনার ইমেইল সিলেক্ট করলেই অটো লগইন/রেজিস্ট্রেশন হবে (নতুন উইন্ডোতে)'
            : 'ক্লিক করে আপনার গুগল ইমেইল সিলেক্ট করলেই অটো লগইন বা রেজিস্ট্রেশন হয়ে যাবে'
          : 'Select your Google email to sign in or auto-register instantly'}
      </p>

      {googleAuthIssue === 'popup_blocked' && (
        <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">
              {language === 'bn' ? 'পপ-আপ ব্লক করা হয়েছে!' : 'Popup Blocked'}
            </div>
            <p className="mt-0.5">
              {language === 'bn'
                ? 'ব্রাউজারের অ্যাড্রেস বার থেকে Pop-up Allow করে পুনরায় গুগল বাটনে ক্লিক করুন।'
                : 'Please allow popups in your browser and click Google sign-in again.'}
            </p>
          </div>
        </div>
      )}

      {googleAuthIssue === 'provider_not_enabled' && (
        <div className="mt-2.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-[11px] text-rose-900 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                {language === 'bn'
                  ? 'Supabase-এ Google Provider এখনো চালু করা হয়নি'
                  : 'Google Provider is not enabled in Supabase'}
              </div>
              <p className="mt-0.5 text-rose-800">
                {language === 'bn'
                  ? 'অ্যাডমিনকে Supabase Dashboard → Authentication → Providers → Google অন করতে হবে এবং নিচের Redirect URL যোগ করতে হবে:'
                  : 'Enable Google in Supabase Auth Providers and add this Redirect URL:'}
              </p>
            </div>
          </div>

          {currentOrigin && (
            <div className="flex items-center gap-1.5 bg-white border border-rose-200 rounded-lg px-2 py-1.5">
              <span className="font-mono text-[10px] text-slate-700 truncate flex-1">{currentOrigin}</span>
              <button
                type="button"
                onClick={() => handleCopyRedirectUrl(currentOrigin)}
                className="px-2 py-1 rounded bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedRedirectUrl ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRedirectUrl ? 'কপিড' : 'কপি'}</span>
              </button>
            </div>
          )}

          <a
            href="https://supabase.com/dashboard/project/ppwaosjmbdyocrmhnwak/auth/providers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-bold text-rose-700 hover:underline"
          >
            <span>Supabase Google Provider সেটিংস খুলুন</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
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
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 z-10 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Brand Accent Header */}
        <div className="bg-gradient-to-br from-[#062919] via-[#0A3D24] to-[#00873E] px-6 pt-6 pb-5 text-white relative shrink-0">
          <button
            type="button"
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute right-4 top-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              {activeTab === 'login' ? (
                <Lock className="w-5 h-5 text-emerald-200" />
              ) : (
                <UserIcon className="w-5 h-5 text-emerald-200" />
              )}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                {activeTab === 'login'
                  ? language === 'bn'
                    ? 'বাংলা বাজারে স্বাগতম'
                    : 'Welcome to Bangla Bazar'
                  : language === 'bn'
                  ? 'নতুন অ্যাকাউন্ট খুলুন'
                  : 'Create New Account'}
              </h3>
              <p className="text-xs text-emerald-100/85 mt-0.5">
                {activeTab === 'login'
                  ? language === 'bn'
                    ? 'মোবাইল নম্বর বা ইমেইল দিয়ে লগইন করুন'
                    : 'Sign in with your mobile or email'
                  : language === 'bn'
                  ? 'মাত্র ৪টি তথ্যে ঝটপট রেজিস্ট্রেশন করুন'
                  : 'Register in seconds with just 4 details'}
              </p>
            </div>
          </div>

          {/* Segmented Tab Switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/25 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('login')}
              className={`min-h-[40px] py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'লগইন' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`min-h-[40px] py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              {language === 'bn' ? 'রেজিস্ট্রেশন' : 'Register'}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto scrollbar-thin space-y-4">
          {/* LOGIN TAB */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    {language === 'bn' ? 'মোবাইল নম্বর অথবা ইমেইল' : 'Mobile Number or Email'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={
                        language === 'bn'
                          ? '017XXXXXXXX অথবা ইমেইল'
                          : '017XXXXXXXX or email'
                      }
                      className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                    />
                    <div className="absolute right-3.5 top-3 text-slate-400 pointer-events-none">
                      {loginIdentifier.includes('@') ? (
                        <Mail className="w-4 h-4 text-[#00873E]" />
                      ) : (
                        <Phone className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-11 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-2 top-1.5 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer rounded-lg"
                      tabIndex={-1}
                      aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full min-h-[46px] py-2.5 bg-[#00873E] hover:bg-[#007033] text-white font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer mt-1 shadow-xs"
                >
                  <span>{language === 'bn' ? 'লগইন করুন' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {renderSocialAuthButtons('login')}

              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                <span>
                  {language === 'bn' ? 'নতুন অ্যাকাউন্ট খুলতে চান?' : "Don't have an account?"}{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-[#00873E] font-bold hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'ফ্রি রেজিস্ট্রেশন করুন' : 'Register Now'}
                </button>
              </div>
            </div>
          )}

          {/* STREAMLINED REGISTER TAB */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Concise ৳50 Bonus Strip */}
              <div className="px-3.5 py-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 truncate">
                    {language === 'bn'
                      ? 'অ্যাকাউন্ট করলেই ৫০ টাকা বোনাস · ১ম অর্ডারে সক্রিয়'
                      : '৳50 Welcome Bonus · Unlocks on 1st order'}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#00873E] shrink-0 tabular-nums">
                  +৳৫০
                </span>
              </div>

              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'bn' ? 'আপনার নাম' : 'Full Name'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'bn' ? 'আপনার পুরো নাম লিখুন' : 'Enter your name'}
                    className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                  />
                  <UserIcon className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* 2. Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {language === 'bn' ? 'ফোন নাম্বার' : 'Phone Number'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors tabular-nums"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                </div>
              </div>

              {/* 3. Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-1.5 top-1.5 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer rounded-lg"
                      tabIndex={-1}
                      aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    {language === 'bn' ? 'কনফার্ম পাসওয়ার্ড' : 'Confirm Password'}{' '}
                    <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      className={`w-full min-h-[44px] bg-slate-50 border rounded-xl pl-3.5 pr-10 py-2.5 text-xs sm:text-sm font-medium text-slate-900 outline-none focus:bg-white transition-colors ${
                        passwordsMismatch
                          ? 'border-rose-400 focus:border-rose-500'
                          : passwordsMatch
                          ? 'border-[#00873E] focus:border-[#00873E]'
                          : 'border-slate-200 focus:border-[#00873E]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-1.5 top-1.5 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer rounded-lg"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Match Live Status */}
              {(passwordsMatch || passwordsMismatch) && (
                <p
                  className={`text-[11px] font-semibold flex items-center gap-1 ${
                    passwordsMismatch ? 'text-rose-600' : 'text-[#00873E]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {passwordsMismatch
                      ? language === 'bn'
                        ? 'দুটি পাসওয়ার্ড এক হয়নি'
                        : 'Passwords do not match'
                      : language === 'bn'
                      ? 'পাসওয়ার্ড মিলেছে'
                      : 'Passwords match'}
                  </span>
                </p>
              )}

              {/* Active Referral Notice if user arrived via invite link */}
              {activeReferralCode && (
                <div className="px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-semibold text-emerald-900 flex items-center justify-between">
                  <span>
                    {language === 'bn'
                      ? 'বন্ধুর রেফার কোড যুক্ত আছে'
                      : 'Friend referral code applied'}
                  </span>
                  <span className="font-mono font-bold text-[#00873E]">
                    {referralCodeInput}
                  </span>
                </div>
              )}

              {/* Collapsible Optional Section: "অর্ডার বিস্তারিত ঠিকানা" */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowDetailedAddress(!showDetailedAddress)}
                  className="w-full min-h-[48px] px-3.5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-slate-100/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00873E] border border-emerald-200/80 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>
                          {language === 'bn'
                            ? 'অর্ডার বিস্তারিত ঠিকানা'
                            : 'Detailed Order Address'}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          ({language === 'bn' ? 'ঐচ্ছিক' : 'Optional'})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {hasEnteredOptionalAddress
                          ? `${village || thana}, ${district}`
                          : language === 'bn'
                          ? 'এখানে ক্লিক করে ঠিকানা দিতে পারেন — না দিলেও চলবে'
                          : 'Tap to add delivery address, email or photo (optional)'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 text-slate-500">
                    {hasEnteredOptionalAddress && (
                      <CheckCircle2 className="w-4 h-4 text-[#00873E]" />
                    )}
                    {showDetailedAddress ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {showDetailedAddress && (
                  <div className="p-3.5 pt-2 border-t border-slate-200/80 bg-white space-y-3">
                    {/* Division & District */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {language === 'bn' ? 'বিভাগ' : 'Division'}
                        </label>
                        <select
                          value={division}
                          onChange={(e) => handleDivisionChange(e.target.value)}
                          className="w-full min-h-[40px] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#00873E] cursor-pointer"
                        >
                          {BANGLADESH_DIVISIONS.map((d) => (
                            <option key={d.nameEn} value={d.nameBn}>
                              {language === 'bn' ? d.nameBn : d.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {language === 'bn' ? 'জেলা' : 'District'}
                        </label>
                        <select
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full min-h-[40px] bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-[#00873E] cursor-pointer"
                        >
                          {selectedDivObj.districts.map((dst) => (
                            <option key={dst} value={dst}>
                              {dst}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Thana & Area/Village */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {language === 'bn' ? 'থানা / উপজেলা' : 'Thana / Upazila'}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={thana}
                            onChange={(e) => setThana(e.target.value)}
                            placeholder={language === 'bn' ? 'যেমন: মিরপুর' : 'e.g. Mirpur'}
                            className="w-full min-h-[40px] bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-900 outline-none focus:border-[#00873E]"
                          />
                          <Home className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {language === 'bn' ? 'বাসা / রোড / এলাকা' : 'House / Road / Area'}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={village}
                            onChange={(e) => setVillage(e.target.value)}
                            placeholder={language === 'bn' ? 'পূর্ণ ঠিকানা লিখুন' : 'Full address'}
                            className="w-full min-h-[40px] bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs text-slate-900 outline-none focus:border-[#00873E]"
                          />
                          <Map className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Optional Email & Referral Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {language === 'bn' ? 'ইমেইল (ঐচ্ছিক)' : 'Email (Optional)'}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full min-h-[40px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-[#00873E]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          {language === 'bn' ? 'রেফার কোড (ঐচ্ছিক)' : 'Referral Code (Optional)'}
                        </label>
                        <input
                          type="text"
                          value={referralCodeInput}
                          onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                          placeholder="BB-637253"
                          className="w-full min-h-[40px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono uppercase text-slate-900 outline-none focus:border-[#00873E]"
                        />
                      </div>
                    </div>

                    {/* Optional Mobile Profile Photo */}
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageFileChange}
                        accept="image/*"
                        className="hidden"
                      />
                      {avatarPreview ? (
                        <div className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-emerald-50/60 border border-emerald-200">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={avatarPreview}
                              alt="Avatar preview"
                              className="w-10 h-10 rounded-full object-cover border border-[#00873E]"
                            />
                            <span className="text-xs font-semibold text-slate-800">
                              {language === 'bn' ? 'প্রোফাইল ছবি যুক্ত হয়েছে' : 'Photo selected'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveAvatar}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            aria-label="Remove photo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="w-full min-h-[40px] px-3 py-2 border border-dashed border-slate-300 hover:border-[#00873E] rounded-xl text-xs font-semibold text-slate-700 hover:text-[#00873E] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          {isUploadingAvatar ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                          <span>
                            {language === 'bn'
                              ? 'মোবাইল থেকে প্রোফাইল ছবি দিন (ঐচ্ছিক)'
                              : 'Add Profile Photo (Optional)'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Submit CTA */}
              <button
                type="submit"
                className="w-full min-h-[48px] py-3 bg-[#00873E] hover:bg-[#007033] text-white font-bold rounded-xl text-xs sm:text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {language === 'bn' ? 'রেজিস্ট্রেশন সম্পন্ন করুন' : 'Complete Registration'}
                </span>
              </button>

              {renderSocialAuthButtons('register')}

              <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                <span>
                  {language === 'bn' ? 'ইতিমধ্যেই অ্যাকাউন্ট আছে?' : 'Already have an account?'}{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-[#00873E] font-bold hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'লগইন করুন' : 'Sign In'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
