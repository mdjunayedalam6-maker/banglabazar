import React, { useState, useEffect, useRef } from 'react';
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  LogOut,
  Clock,
  CheckCircle2,
  Truck,
  ShoppingBag,
  Trash2,
  ShieldCheck,
  Plus,
  Settings,
  Globe,
  Check,
  Bell,
  Wallet,
  Gift,
  Camera,
  Pencil,
  Phone,
  Mail,
  Home,
  Building2,
  X,
  Loader2,
  RotateCcw,
  Star,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BANGLADESH_DIVISIONS } from '../data/mockData';
import { DeliveryAddress, OrderStatus } from '../types';
import { CustomerWallet } from '../components/CustomerWallet';
import { CustomerReferral } from '../components/CustomerReferral';
import { compressImageFile } from '../utils/imageCompressor';

const DEFAULT_FALLBACK_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=600&auto=format&fit=crop&q=85';

const ADDRESS_PRESET_LABELS = [
  { bn: 'বাসা (Home)', en: 'Home', icon: Home },
  { bn: 'অফিস (Office)', en: 'Office', icon: Building2 },
  { bn: 'বাবা-মায়ের বাসা', en: 'Parents Home', icon: Heart },
  { bn: 'অন্যান্য', en: 'Other', icon: MapPin },
];

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    orders,
    userOrders,
    wishlist,
    products,
    language,
    setLanguage,
    t,
    formatPrice,
    logoutUser,
    setCurrentPage,
    toggleWishlist,
    addToCart,
    viewProductDetails,
    profileActiveTab,
    setProfileActiveTab,
    addToast,
    setIsAuthModalOpen,
    openTrackOrder,
    isUserAdmin,
    loginAdmin,
    updateUserProfile,
    addDeliveryAddress,
    updateDeliveryAddress,
    deleteDeliveryAddress,
    setDefaultDeliveryAddress,
  } = useApp();

  const activeTab = profileActiveTab;
  const setActiveTab = setProfileActiveTab;
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<string | null>(
    userOrders[0]?.id || null
  );
  const [smsNotification, setSmsNotification] = useState(true);
  const [promoNotification, setPromoNotification] = useState(true);
  const [securityNotification, setSecurityNotification] = useState(true);

  // Mobile Photo Upload & Avatar State
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const profileSectionRef = useRef<HTMLDivElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    division: currentUser?.division || BANGLADESH_DIVISIONS[0].nameBn,
    district: currentUser?.district || BANGLADESH_DIVISIONS[0].districts[0],
    thana: currentUser?.thana || '',
    village: currentUser?.village || '',
    avatar: currentUser?.avatar || '',
  });

  // Delivery Address Add/Edit Form State
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [confirmDeleteAddressId, setConfirmDeleteAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    title: 'বাসা (Home)',
    recipientName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    division: currentUser?.division || BANGLADESH_DIVISIONS[0].nameBn,
    district: currentUser?.district || BANGLADESH_DIVISIONS[0].districts[0],
    thana: currentUser?.thana || '',
    address: '',
    isDefault: false,
  });

  // Helper to resolve division/district safely against BANGLADESH_DIVISIONS
  const resolveDivisionAndDistrict = (divInput?: string, distInput?: string) => {
    const matchedDiv =
      BANGLADESH_DIVISIONS.find(
        (d) =>
          d.nameBn === divInput ||
          d.nameEn.toLowerCase() === (divInput || '').toLowerCase()
      ) || BANGLADESH_DIVISIONS[0];

    const matchedDist = distInput
      ? matchedDiv.districts.find(
          (dst) =>
            dst === distInput ||
            dst.toLowerCase().includes(distInput.toLowerCase()) ||
            distInput.toLowerCase().includes(dst.toLowerCase())
        ) || matchedDiv.districts[0]
      : matchedDiv.districts[0];

    return { division: matchedDiv.nameBn, district: matchedDist, divObj: matchedDiv };
  };

  // Keep edit form synced with currentUser updates
  useEffect(() => {
    if (currentUser) {
      const resolved = resolveDivisionAndDistrict(currentUser.division, currentUser.district);
      setEditForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        email: currentUser.email || '',
        division: resolved.division,
        district: resolved.district,
        thana: currentUser.thana || '',
        village: currentUser.village || '',
        avatar: currentUser.avatar || '',
      });
      setAvatarLoadError(false);
    }
  }, [currentUser]);

  const editDivObj =
    BANGLADESH_DIVISIONS.find(
      (d) => d.nameBn === editForm.division || d.nameEn === editForm.division
    ) || BANGLADESH_DIVISIONS[0];

  const addressDivObj =
    BANGLADESH_DIVISIONS.find(
      (d) => d.nameBn === addressForm.division || d.nameEn === addressForm.division
    ) || BANGLADESH_DIVISIONS[0];

  // Direct mobile gallery / camera photo upload with compression
  const handleAvatarFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      addToast(
        language === 'bn'
          ? 'অনুগ্রহ করে একটি সঠিক ছবি (JPG/PNG/WEBP) সিলেক্ট করুন'
          : 'Please select a valid image file',
        'error'
      );
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      addToast(
        language === 'bn'
          ? 'ছবির সাইজ ১৫ মেগাবাইটের কম হতে হবে'
          : 'Image size must be under 15MB',
        'error'
      );
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const compressedDataUrl = await compressImageFile(file, 420, 420, 0.82);
      if (!compressedDataUrl) {
        addToast(
          language === 'bn' ? 'ছবি প্রসেস করা যায়নি, আবার চেষ্টা করুন' : 'Failed to process image',
          'error'
        );
        return;
      }

      setAvatarLoadError(false);
      setEditForm((prev) => ({ ...prev, avatar: compressedDataUrl }));
      updateUserProfile({ avatar: compressedDataUrl });
    } catch {
      addToast(
        language === 'bn' ? 'ছবি আপলোড করতে সমস্যা হয়েছে' : 'Could not upload photo',
        'error'
      );
    } finally {
      setIsUploadingAvatar(false);
      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = '';
      }
    }
  };

  const handleResetAvatar = () => {
    setAvatarLoadError(false);
    setEditForm((prev) => ({ ...prev, avatar: DEFAULT_FALLBACK_AVATAR }));
    updateUserProfile({ avatar: DEFAULT_FALLBACK_AVATAR });
  };

  const handleEditDivisionChange = (newDiv: string) => {
    const divObj =
      BANGLADESH_DIVISIONS.find((d) => d.nameBn === newDiv || d.nameEn === newDiv) ||
      BANGLADESH_DIVISIONS[0];
    setEditForm((prev) => ({
      ...prev,
      division: divObj.nameBn,
      district: divObj.districts[0],
    }));
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim()) {
      addToast(language === 'bn' ? 'দয়া করে আপনার নাম লিখুন' : 'Please enter your name', 'error');
      return;
    }
    const ok = updateUserProfile({
      name: editForm.name.trim(),
      phone: editForm.phone.trim(),
      email: editForm.email.trim(),
      division: editForm.division,
      district: editForm.district,
      thana: editForm.thana.trim(),
      village: editForm.village.trim(),
      avatar: editForm.avatar.trim() || DEFAULT_FALLBACK_AVATAR,
    });
    if (ok) {
      setIsEditingProfile(false);
    }
  };

  const openQuickEditProfile = () => {
    setActiveTab('settings');
    setIsEditingProfile(true);
    setTimeout(() => {
      profileSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  // Address Form Helpers
  const openAddAddressForm = () => {
    const resolved = resolveDivisionAndDistrict(currentUser?.division, currentUser?.district);
    setEditingAddressId(null);
    setAddressForm({
      title: language === 'bn' ? 'বাসা (Home)' : 'Home',
      recipientName: currentUser?.name || '',
      phone: currentUser?.phone || '',
      division: resolved.division,
      district: resolved.district,
      thana: currentUser?.thana || '',
      address: '',
      isDefault: (currentUser?.addresses?.length || 0) === 0,
    });
    setIsAddressFormOpen(true);
  };

  const openEditAddressForm = (addr: DeliveryAddress) => {
    const resolved = resolveDivisionAndDistrict(
      addr.division || currentUser?.division,
      addr.district || currentUser?.district
    );
    setEditingAddressId(addr.id);
    setAddressForm({
      title: addr.title || 'বাসা (Home)',
      recipientName: addr.recipientName || currentUser?.name || '',
      phone: addr.phone || currentUser?.phone || '',
      division: resolved.division,
      district: resolved.district,
      thana: addr.thana || currentUser?.thana || '',
      address: addr.address || '',
      isDefault: addr.isDefault,
    });
    setIsAddressFormOpen(true);
  };

  const handleAddressDivisionChange = (newDiv: string) => {
    const divObj =
      BANGLADESH_DIVISIONS.find((d) => d.nameBn === newDiv || d.nameEn === newDiv) ||
      BANGLADESH_DIVISIONS[0];
    setAddressForm((prev) => ({
      ...prev,
      division: divObj.nameBn,
      district: divObj.districts[0],
    }));
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.title.trim()) {
      addToast(
        language === 'bn' ? 'ঠিকানার একটি নাম দিন (যেমন: বাসা বা অফিস)' : 'Please enter an address label',
        'error'
      );
      return;
    }
    if (!addressForm.address.trim()) {
      addToast(
        language === 'bn' ? 'বিস্তারিত ডেলিভারি ঠিকানা লিখুন' : 'Please enter detailed address',
        'error'
      );
      return;
    }

    const payload = {
      title: addressForm.title.trim(),
      recipientName: addressForm.recipientName.trim() || currentUser?.name || '',
      phone: addressForm.phone.trim() || currentUser?.phone || '',
      division: addressForm.division,
      district: addressForm.district,
      thana: addressForm.thana.trim(),
      address: addressForm.address.trim(),
      isDefault: addressForm.isDefault,
    };

    if (editingAddressId) {
      updateDeliveryAddress(editingAddressId, payload);
    } else {
      addDeliveryAddress(payload);
    }
    setIsAddressFormOpen(false);
    setEditingAddressId(null);
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {language === 'bn' ? 'প্রোফাইল দেখতে প্রথমে লগইন করুন' : 'Please login to view profile'}
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
          >
            {t.login}
          </button>
          <button
            onClick={() => openTrackOrder()}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Truck className="w-4 h-4 text-[#00873E]" />
            <span>{language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}</span>
          </button>
        </div>
      </div>
    );
  }

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));
  const savedAddresses = currentUser.addresses || [];
  const primaryLocationSummary = [
    currentUser.village,
    currentUser.thana,
    currentUser.district,
    currentUser.division,
  ]
    .filter(Boolean)
    .join(', ');

  // Step helper for tracking status
  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return 1;
      case 'processing':
        return 2;
      case 'shipped':
        return 3;
      case 'out_for_delivery':
        return 4;
      case 'delivered':
        return 5;
      default:
        return 1;
    }
  };

  const navItems: {
    id: 'settings' | 'addresses' | 'orders' | 'wallet' | 'referral' | 'wishlist';
    labelBn: string;
    labelEn: string;
    icon: React.ComponentType<{ className?: string }>;
    meta?: string;
  }[] = [
    {
      id: 'settings',
      labelBn: 'প্রোফাইল ও সেটিংস',
      labelEn: 'Profile & Settings',
      icon: Settings,
    },
    {
      id: 'addresses',
      labelBn: 'ডেলিভারি ঠিকানা',
      labelEn: 'Delivery Addresses',
      icon: MapPin,
      meta: `${savedAddresses.length}`,
    },
    {
      id: 'orders',
      labelBn: t.myOrders,
      labelEn: 'My Orders',
      icon: Package,
      meta: `${userOrders.length}`,
    },
    {
      id: 'wallet',
      labelBn: 'ওয়ালেট',
      labelEn: 'Wallet',
      icon: Wallet,
      meta: formatPrice(currentUser.balance || 0),
    },
    {
      id: 'referral',
      labelBn: 'শেয়ার ও রেফার আয়',
      labelEn: 'Share & Earn (2%)',
      icon: Gift,
      meta: '২% আয়',
    },
    {
      id: 'wishlist',
      labelBn: t.wishlist,
      labelEn: 'Wishlist',
      icon: Heart,
      meta: `${wishlist.length}`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Hidden File Input for Mobile Gallery / Camera Avatar Upload */}
      <input
        ref={avatarFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileUpload}
        className="hidden"
        aria-label={language === 'bn' ? 'প্রোফাইল ছবি আপলোড করুন' : 'Upload profile photo'}
      />

      {/* Account Identity Header Card */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Interactive Avatar + User Metadata */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative shrink-0 group">
              {currentUser.avatar && !avatarLoadError ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarLoadError(true)}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#00873E]/25 bg-slate-100"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-50 border-2 border-[#00873E]/25 flex items-center justify-center text-[#00873E] font-black text-2xl">
                  {(currentUser.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}

              {/* 1-Tap Mobile Photo Upload Trigger */}
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                title={language === 'bn' ? 'মোবাইল থেকে ছবি পরিবর্তন করুন' : 'Upload photo from device'}
                className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-[#00873E] hover:bg-[#007033] text-white border-2 border-white flex items-center justify-center shadow-sm transition-transform active:scale-95 cursor-pointer"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight truncate">
                  {currentUser.name || (language === 'bn' ? 'সম্মানিত গ্রাহক' : 'Valued Customer')}
                </h1>
                <span className="text-xs font-semibold text-[#00873E] flex items-center gap-1 whitespace-nowrap">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'যাচাইকৃত অ্যাকাউন্ট' : 'Verified Account'}</span>
                </span>
              </div>

              {/* Clean unboxed metadata with subtle separators */}
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-600 tabular-nums">
                <span>{currentUser.phone || (language === 'bn' ? 'নম্বর যুক্ত নেই' : 'No phone')}</span>
                {currentUser.email && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="truncate max-w-[220px] sm:max-w-none">{currentUser.email}</span>
                  </>
                )}
                {primaryLocationSummary && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-500">{primaryLocationSummary}</span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => avatarFileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="text-xs font-semibold text-[#00873E] hover:text-[#006830] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'মোবাইল থেকে ছবি সেভ করুন' : 'Change Profile Photo'}</span>
                </button>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('referral')}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer whitespace-nowrap"
                >
                  {currentUser.hasCompletedFirstOrder
                    ? '৫০ টাকা ওয়েলকাম বোনাস সক্রিয়'
                    : '১ম অর্ডারে ৫০ টাকা বোনাস সক্রিয় হবে'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Clean Key Actions */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <button
              type="button"
              onClick={openQuickEditProfile}
              className="min-h-[44px] px-4 py-2 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'প্রোফাইল এডিট' : 'Edit Profile'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className="min-h-[44px] px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
            >
              <Wallet className="w-4 h-4 text-[#00873E]" />
              <span>
                {language === 'bn' ? 'ব্যালেন্স:' : 'Balance:'} {formatPrice(currentUser.balance || 0)}
              </span>
            </button>

            {isUserAdmin(currentUser) && (
              <button
                type="button"
                onClick={() => {
                  loginAdmin();
                  setCurrentPage('admin');
                }}
                className="min-h-[44px] px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>{language === 'bn' ? 'এডমিন প্যানেল' : 'Admin Panel'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={logoutUser}
              className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <LogOut className="w-4 h-4" />
              <span>{t.logout}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Strip (thumb-friendly single-line tabs) */}
      <div className="lg:hidden -mx-4 px-4 overflow-x-auto pb-1">
        <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 min-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`min-h-[40px] px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00873E]' : 'text-slate-500'}`} />
                <span>{language === 'bn' ? item.labelBn : item.labelEn}</span>
                {item.meta && (
                  <span className="text-[11px] font-semibold text-slate-500 tabular-nums">
                    ({item.meta})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Layout: Desktop Left Navigation + Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Desktop Sidebar (3 cols) */}
        <aside className="hidden lg:block lg:col-span-3">
          <div className="bg-white rounded-2xl p-2.5 border border-slate-200/90 shadow-xs space-y-1 sticky top-24">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-[#007033]'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00873E]' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left truncate">
                    {language === 'bn' ? item.labelBn : item.labelEn}
                  </span>
                  {item.meta && (
                    <span
                      className={`text-[11px] font-bold tabular-nums whitespace-nowrap shrink-0 ${
                        isActive ? 'text-[#00873E]' : 'text-slate-500'
                      }`}
                    >
                      {item.meta}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Content (9 cols) */}
        <div className="lg:col-span-9 space-y-6" ref={profileSectionRef}>
          {/* Tab: Wallet */}
          {activeTab === 'wallet' && <CustomerWallet />}

          {/* Tab: Referral */}
          {activeTab === 'referral' && <CustomerReferral />}

          {/* Tab: Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
                  {t.myOrders} ({userOrders.length})
                </h2>
              </div>

              {isUserAdmin(currentUser) && orders.length > 0 && userOrders.length === 0 && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700">
                  <span>
                    {language === 'bn'
                      ? `এডমিন নোটিশ: দোকানে গ্রাহকদের মোট ${orders.length}টি অর্ডার জমা আছে।`
                      : `Admin Note: Store has ${orders.length} total customer orders.`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('admin')}
                    className="min-h-[40px] px-4 py-2 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl font-bold text-xs cursor-pointer transition-colors"
                  >
                    {language === 'bn' ? 'এডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
                  </button>
                </div>
              )}

              {userOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/90 space-y-3 shadow-xs">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-base font-bold text-slate-900">
                    {language === 'bn' ? 'আপনার কোনো পূর্ববর্তী অর্ডার নেই' : 'You have no orders yet'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {language === 'bn'
                      ? 'আপনি যখন কোনো পণ্য অর্ডার করবেন, তখন অর্ডারের বিস্তারিত ও লাইভ ট্র্যাকিং এখানে দেখা যাবে।'
                      : 'Once you place an order, your order details and live tracking will appear here.'}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage('shop')}
                      className="min-h-[44px] px-6 py-2.5 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t.startShopping}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => {
                    const isExpanded = selectedOrderTracking === order.id;
                    const currentStep = getStatusStep(order.status);

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs"
                      >
                        <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-semibold text-slate-500">
                              {language === 'bn' ? 'অর্ডার নম্বর' : 'Order ID'} · {order.date}
                            </div>
                            <div className="text-sm font-bold text-slate-900 tabular-nums">
                              {order.id}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-sm font-bold text-slate-900 tabular-nums">
                              {formatPrice(order.total)}
                            </span>
                            <span
                              className={`text-xs font-semibold ${
                                order.status === 'delivered'
                                  ? 'text-emerald-700'
                                  : order.status === 'cancelled'
                                  ? 'text-rose-600'
                                  : order.status === 'shipped'
                                  ? 'text-blue-700'
                                  : 'text-amber-700'
                              }`}
                            >
                              ·{' '}
                              {order.status === 'delivered'
                                ? t.statusDelivered
                                : order.status === 'cancelled'
                                ? t.statusCancelled
                                : order.status === 'shipped'
                                ? t.statusShipped
                                : t.statusProcessing}
                            </span>
                            <button
                              type="button"
                              onClick={() => openTrackOrder(order.trackingNumber || order.id)}
                              className="min-h-[36px] px-3 py-1.5 bg-white hover:bg-emerald-50 text-[#00873E] rounded-lg text-xs font-bold border border-slate-200 hover:border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'ট্র্যাক' : 'Track'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderTracking(isExpanded ? null : order.id)}
                              className="min-h-[36px] px-2.5 text-xs text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                            >
                              {isExpanded
                                ? language === 'bn'
                                  ? 'সংক্ষেপ'
                                  : 'Hide'
                                : language === 'bn'
                                ? 'টাইমলাইন'
                                : 'Timeline'}
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-5 bg-slate-900 text-white space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                              <span className="text-emerald-400 font-semibold flex items-center gap-1.5 tabular-nums">
                                <Clock className="w-4 h-4" />
                                {language === 'bn' ? 'ট্র্যাকিং:' : 'Tracking:'} {order.trackingNumber}
                              </span>
                              <span className="text-slate-400">
                                {language === 'bn'
                                  ? 'কুরিয়ার: রেডএক্স / সুন্দরবন কুরিয়ার'
                                  : 'Courier: RedX / Sundarban Express'}
                              </span>
                            </div>

                            <div className="grid grid-cols-5 gap-2 pt-1">
                              {[
                                { step: 1, labelBn: 'প্লেসড', labelEn: 'Placed' },
                                { step: 2, labelBn: 'প্যাকেজিং', labelEn: 'Packing' },
                                { step: 3, labelBn: 'শিপড', labelEn: 'Shipped' },
                                { step: 4, labelBn: 'ডেলিভারিতে', labelEn: 'On Way' },
                                { step: 5, labelBn: 'সম্পন্ন', labelEn: 'Delivered' },
                              ].map((s) => {
                                const isPassed = currentStep >= s.step;
                                return (
                                  <div key={s.step} className="text-center space-y-1.5">
                                    <div
                                      className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs tabular-nums ${
                                        isPassed
                                          ? 'bg-emerald-500 text-slate-950'
                                          : 'bg-slate-800 text-slate-500'
                                      }`}
                                    >
                                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                                    </div>
                                    <p
                                      className={`text-[11px] font-semibold ${
                                        isPassed ? 'text-white' : 'text-slate-500'
                                      }`}
                                    >
                                      {language === 'bn' ? s.labelBn : s.labelEn}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="p-4 sm:p-5 divide-y divide-slate-100">
                          {order.items.map((item) => (
                            <div
                              key={item.productId}
                              className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3"
                            >
                              <img
                                src={item.image}
                                alt={item.title}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-slate-900 truncate">
                                  {item.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                                  {item.selectedSize ? `সাইজ: ${item.selectedSize} · ` : ''}
                                  {item.selectedColor ? `কালার: ${item.selectedColor} · ` : ''}
                                  {language === 'bn' ? 'পরিমাণ:' : 'Qty:'} {item.quantity} ·{' '}
                                  {formatPrice(item.price)}
                                </p>
                              </div>
                              <span className="text-xs font-bold text-slate-900 tabular-nums shrink-0">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tabular-nums">
                {t.wishlist} ({wishlistProducts.length})
              </h2>

              {wishlistProducts.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/90 space-y-3">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-medium text-slate-600">
                    {language === 'bn'
                      ? 'উইশলিস্টে কোনো পণ্য সংরক্ষণ করা নেই'
                      : 'Your wishlist is empty'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCurrentPage('shop')}
                    className="min-h-[44px] px-5 py-2 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    {t.startShopping}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((prod) => {
                    const title = language === 'bn' ? prod.titleBn : prod.titleEn;
                    return (
                      <div
                        key={prod.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200/90 flex items-center gap-4 hover:shadow-sm transition-shadow"
                      >
                        <img
                          src={
                            prod.images[0]?.includes('_L_') && prod.images[0].endsWith('.jpg')
                              ? prod.images[0].replace(/\.jpg$/i, '.jpeg')
                              : prod.images[0] || ''
                          }
                          alt={title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes('_L_')) {
                              target.src = target.src
                                .replace('_L_', '_S_')
                                .replace(/\.jpeg$/i, '.jpg');
                            }
                          }}
                          className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0 bg-slate-50"
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => viewProductDetails(prod)}
                            className="text-xs font-bold text-slate-900 truncate hover:text-[#00873E] cursor-pointer"
                          >
                            {title}
                          </h4>
                          <div className="text-xs font-bold text-slate-900 mt-1 tabular-nums">
                            {formatPrice(prod.price)}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              onClick={() => addToCart(prod, 1)}
                              className="min-h-[36px] px-3 py-1.5 bg-[#00873E] hover:bg-[#007033] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>{t.addToCart}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleWishlist(prod.id)}
                              className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer transition-colors"
                              title={language === 'bn' ? 'সরান' : 'Remove'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Delivery Address Book (Add, Edit, Set Default, Delete) */}
          {activeTab === 'addresses' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    {language === 'bn' ? 'ডেলিভারি ঠিকানা তালিকা' : 'Delivery Address Book'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'bn'
                      ? 'একাধিক ঠিকানা সেভ করুন, ডিফল্ট ঠিকানা বাছুন বা প্রয়োজনে ডিলিট করুন'
                      : 'Add multiple delivery locations, set default, edit, or delete anytime'}
                  </p>
                </div>

                {!isAddressFormOpen && (
                  <button
                    type="button"
                    onClick={openAddAddressForm}
                    className="min-h-[44px] px-4 py-2 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'bn' ? 'নতুন ঠিকানা যোগ করুন' : 'Add New Address'}</span>
                  </button>
                )}
              </div>

              {/* Add / Edit Delivery Address Form */}
              {isAddressFormOpen && (
                <form
                  onSubmit={handleAddressSubmit}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-200 shadow-xs space-y-5"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {editingAddressId
                        ? language === 'bn'
                          ? 'ডেলিভারি ঠিকানা পরিবর্তন করুন'
                          : 'Edit Delivery Address'
                        : language === 'bn'
                        ? 'নতুন ডেলিভারি ঠিকানা যোগ করুন'
                        : 'Add New Delivery Address'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddressFormOpen(false);
                        setEditingAddressId(null);
                      }}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                      aria-label={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Quick Label Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {language === 'bn' ? 'ঠিকানার ধরন / নাম' : 'Address Label'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ADDRESS_PRESET_LABELS.map((preset) => {
                        const PresetIcon = preset.icon;
                        const label = language === 'bn' ? preset.bn : preset.en;
                        const selected = addressForm.title === label;
                        return (
                          <button
                            key={preset.en}
                            type="button"
                            onClick={() => setAddressForm((prev) => ({ ...prev, title: label }))}
                            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                              selected
                                ? 'bg-[#00873E] text-white border-[#00873E]'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <PresetIcon className="w-3.5 h-3.5" />
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="text"
                      value={addressForm.title}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder={
                        language === 'bn'
                          ? 'যেমন: বাসা, অফিস, মেস, বা বাড়ি'
                          : 'e.g. Home, Office, Hostel'
                      }
                      className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                      required
                    />
                  </div>

                  {/* Recipient & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {language === 'bn' ? 'প্রাপকের নাম' : 'Recipient Name'}
                      </label>
                      <input
                        type="text"
                        value={addressForm.recipientName}
                        onChange={(e) =>
                          setAddressForm((prev) => ({ ...prev, recipientName: e.target.value }))
                        }
                        placeholder={language === 'bn' ? 'যিনি পার্সেল গ্রহণ করবেন' : 'Recipient name'}
                        className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {language === 'bn' ? 'মোবাইল নম্বর' : 'Delivery Phone Number'}
                      </label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) =>
                          setAddressForm((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        placeholder="01XXXXXXXXX"
                        className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors tabular-nums"
                      />
                    </div>
                  </div>

                  {/* Division, District, Thana */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {language === 'bn' ? 'বিভাগ' : 'Division'}
                      </label>
                      <select
                        value={addressForm.division}
                        onChange={(e) => handleAddressDivisionChange(e.target.value)}
                        className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white cursor-pointer"
                      >
                        {BANGLADESH_DIVISIONS.map((div) => (
                          <option key={div.nameBn} value={div.nameBn}>
                            {div.nameBn} ({div.nameEn})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {language === 'bn' ? 'জেলা' : 'District'}
                      </label>
                      <select
                        value={addressForm.district}
                        onChange={(e) =>
                          setAddressForm((prev) => ({ ...prev, district: e.target.value }))
                        }
                        className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white cursor-pointer"
                      >
                        {addressDivObj.districts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        {language === 'bn' ? 'থানা / উপজেলা' : 'Thana / Upazila'}
                      </label>
                      <input
                        type="text"
                        value={addressForm.thana}
                        onChange={(e) =>
                          setAddressForm((prev) => ({ ...prev, thana: e.target.value }))
                        }
                        placeholder={language === 'bn' ? 'যেমন: মিরপুর / সাভার' : 'Thana / Upazila'}
                        className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Full Street / House Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      {language === 'bn'
                        ? 'বিস্তারিত ঠিকানা (বাসা নং, রোড, এলাকা)'
                        : 'Detailed Address (House, Road, Area)'}{' '}
                      <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={addressForm.address}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, address: e.target.value }))
                      }
                      placeholder={
                        language === 'bn'
                          ? 'বাসা নং, ফ্ল্যাট/তলা, রোড নং ও এলাকার নাম লিখুন'
                          : 'House no, road, area or landmarks'
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white resize-none transition-colors"
                    />
                  </div>

                  {/* Set Default Checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={addressForm.isDefault}
                      onChange={(e) =>
                        setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))
                      }
                      className="w-4 h-4 accent-[#00873E] rounded cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      {language === 'bn'
                        ? 'ডিফল্ট ডেলিভারি ঠিকানা হিসেবে সেট করুন'
                        : 'Set as my default delivery address'}
                    </span>
                  </label>

                  <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddressFormOpen(false);
                        setEditingAddressId(null);
                      }}
                      className="min-h-[44px] px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="min-h-[44px] px-6 py-2 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {editingAddressId
                        ? language === 'bn'
                          ? 'ঠিকানা আপডেট করুন'
                          : 'Update Address'
                        : language === 'bn'
                        ? 'ঠিকানা সেভ করুন'
                        : 'Save Address'}
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Address Cards Grid */}
              {savedAddresses.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200/90 space-y-3">
                  <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-800">
                    {language === 'bn'
                      ? 'এখনও কোনো ডেলিভারি ঠিকানা সেভ করা নেই'
                      : 'No saved delivery addresses yet'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {language === 'bn'
                      ? 'দ্রুত অর্ডার করতে আপনার বাসা বা অফিসের ঠিকানা যোগ করে রাখুন।'
                      : 'Save your home or office address for faster checkout.'}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={openAddAddressForm}
                      className="min-h-[44px] px-5 py-2.5 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>
                        {language === 'bn' ? 'প্রথম ঠিকানা যোগ করুন' : 'Add Your First Address'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedAddresses.map((addr) => {
                    const isConfirmingDelete = confirmDeleteAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        className={`bg-white rounded-2xl p-5 border transition-colors flex flex-col justify-between gap-4 ${
                          addr.isDefault
                            ? 'border-[#00873E]/60 bg-emerald-50/15'
                            : 'border-slate-200/90'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-[#00873E] shrink-0" />
                              <span>{addr.title}</span>
                            </span>
                            {addr.isDefault && (
                              <span className="text-xs font-semibold text-[#00873E] flex items-center gap-1 whitespace-nowrap">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{language === 'bn' ? 'ডিফল্ট' : 'Default'}</span>
                              </span>
                            )}
                          </div>

                          {(addr.recipientName || addr.phone) && (
                            <p className="text-xs font-semibold text-slate-700 tabular-nums">
                              {[addr.recipientName, addr.phone].filter(Boolean).join(' · ')}
                            </p>
                          )}

                          <p className="text-xs text-slate-700 leading-relaxed">{addr.address}</p>

                          <p className="text-xs text-slate-500 font-medium">
                            {[addr.thana, addr.district, addr.division]
                              .filter(Boolean)
                              .join(', ')}
                          </p>
                        </div>

                        {/* Address Card Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
                          {!addr.isDefault ? (
                            <button
                              type="button"
                              onClick={() => setDefaultDeliveryAddress(addr.id)}
                              className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-[#00873E] hover:bg-emerald-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'ডিফল্ট করুন' : 'Set Default'}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              {language === 'bn' ? 'অর্ডারে অটো সিলেক্ট হবে' : 'Auto-selected at checkout'}
                            </span>
                          )}

                          <div className="flex items-center gap-1.5 ml-auto">
                            {isConfirmingDelete ? (
                              <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                                <span className="text-[11px] font-semibold text-rose-800">
                                  {language === 'bn' ? 'মুছবেন?' : 'Delete?'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    deleteDeliveryAddress(addr.id);
                                    setConfirmDeleteAddressId(null);
                                  }}
                                  className="min-h-[30px] px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold cursor-pointer"
                                >
                                  {language === 'bn' ? 'হ্যাঁ' : 'Yes'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteAddressId(null)}
                                  className="min-h-[30px] px-2 py-1 bg-white text-slate-700 border border-slate-200 rounded text-[11px] font-semibold cursor-pointer"
                                >
                                  {language === 'bn' ? 'না' : 'No'}
                                </button>
                              </div>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openEditAddressForm(addr)}
                                  className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                  <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteAddressId(addr.id)}
                                  className="min-h-[38px] px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{language === 'bn' ? 'ডিলিট' : 'Delete'}</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab: Account Profile, Mobile Photo Upload, Name/Phone/Address Edit & Language Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    {language === 'bn' ? 'প্রোফাইল ও অ্যাকাউন্ট সেটিংস' : 'Profile & Account Settings'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'bn'
                      ? 'প্রোফাইল ছবি, নাম, মোবাইল নম্বর, ঠিকানা ও ভাষা পরিবর্তন করুন'
                      : 'Update profile photo, name, phone, address, and preferences'}
                  </p>
                </div>
              </div>

              {/* 1. Personal Details & Photo Upload Card */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00873E] flex items-center justify-center shrink-0">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">
                        {language === 'bn' ? 'ব্যক্তিগত তথ্য ও প্রোফাইল ছবি' : 'Personal Info & Profile Photo'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {language === 'bn'
                          ? 'নাম, মোবাইল নম্বর এবং মূল ঠিকানা এখান থেকে পরিবর্তন করুন'
                          : 'Change your name, mobile number, and primary address'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isEditingProfile
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-[#00873E] text-white hover:bg-[#007033]'
                    }`}
                  >
                    {isEditingProfile ? (
                      <>
                        <X className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'বাতিল' : 'Cancel'}</span>
                      </>
                    ) : (
                      <>
                        <Pencil className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'তথ্য এডিট করুন' : 'Edit Info'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Mobile Photo Upload Banner Bar (always accessible in 1 tap) */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {editForm.avatar && !avatarLoadError ? (
                      <img
                        src={editForm.avatar}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarLoadError(true)}
                        className="w-14 h-14 rounded-full object-cover border border-slate-300 bg-white shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#00873E] flex items-center justify-center font-bold text-lg shrink-0">
                        {(currentUser.name || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        {language === 'bn' ? 'মোবাইল থেকে প্রোফাইল ছবি সেভ করুন' : 'Upload Photo from Device'}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {language === 'bn'
                          ? 'গ্যালারি বা ক্যামেরা থেকে ছবি নিলে অটো সাইজ ঠিক হয়ে সেভ হবে'
                          : 'Pick from phone gallery or camera — automatically compressed & saved'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarFileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      className="min-h-[42px] px-4 py-2 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      <span>
                        {isUploadingAvatar
                          ? language === 'bn'
                            ? 'সেভ হচ্ছে...'
                            : 'Saving...'
                          : language === 'bn'
                          ? 'ছবি সিলেক্ট করুন'
                          : 'Choose Photo'}
                      </span>
                    </button>

                    {currentUser.avatar && currentUser.avatar !== DEFAULT_FALLBACK_AVATAR && (
                      <button
                        type="button"
                        onClick={handleResetAvatar}
                        title={language === 'bn' ? 'ডিফল্ট ছবিতে ফিরুন' : 'Reset photo'}
                        className="min-h-[42px] px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'রিসেট' : 'Reset'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleEditSubmit} className="space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          {language === 'bn' ? 'আপনার নাম' : 'Full Name'}{' '}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          placeholder={language === 'bn' ? 'আপনার পুরো নাম লিখুন' : 'Full Name'}
                          className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}{' '}
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="01XXXXXXXXX"
                          className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors tabular-nums"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                        </label>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          placeholder="example@email.com"
                          className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          {language === 'bn' ? 'বিভাগ (Division)' : 'Division'}
                        </label>
                        <select
                          value={editForm.division}
                          onChange={(e) => handleEditDivisionChange(e.target.value)}
                          className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white cursor-pointer"
                        >
                          {BANGLADESH_DIVISIONS.map((div) => (
                            <option key={div.nameBn} value={div.nameBn}>
                              {div.nameBn} ({div.nameEn})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          {language === 'bn' ? 'জেলা (District)' : 'District'}
                        </label>
                        <select
                          value={editForm.district}
                          onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                          className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white cursor-pointer"
                        >
                          {editDivObj.districts.map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          {language === 'bn' ? 'থানা / উপজেলা' : 'Thana / Upazila'}
                        </label>
                        <input
                          type="text"
                          value={editForm.thana}
                          onChange={(e) => setEditForm({ ...editForm, thana: e.target.value })}
                          placeholder={language === 'bn' ? 'থানার নাম লিখুন' : 'Thana / Upazila'}
                          className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                          {language === 'bn'
                            ? 'বিস্তারিত ঠিকানা (গ্রাম / এলাকা / বাসা নং)'
                            : 'Detailed Address (Area / Village / House)'}
                        </label>
                        <input
                          type="text"
                          value={editForm.village}
                          onChange={(e) => setEditForm({ ...editForm, village: e.target.value })}
                          placeholder={
                            language === 'bn'
                              ? 'বাসা নং, রোড, গ্রাম বা এলাকার নাম লিখুন'
                              : 'House no, road, village or area'
                          }
                          className="w-full min-h-[44px] bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="min-h-[44px] px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        {language === 'bn' ? 'বাতিল করুন' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        className="min-h-[44px] px-6 py-2 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        {language === 'bn' ? 'পরিবর্তন সেভ করুন' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{language === 'bn' ? 'গ্রাহকের নাম' : 'Full Name'}</span>
                      </span>
                      <span className="text-xs font-bold text-slate-900 mt-1 block">
                        {currentUser.name}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile Number'}</span>
                      </span>
                      <span className="text-xs font-bold text-slate-900 mt-1 block tabular-nums">
                        {currentUser.phone || (language === 'bn' ? 'যুক্ত নেই' : 'Not set')}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{language === 'bn' ? 'ইমেইল' : 'Email'}</span>
                      </span>
                      <span className="text-xs font-bold text-slate-900 mt-1 block truncate">
                        {currentUser.email || (language === 'bn' ? 'যুক্ত নেই' : 'Not set')}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                      <span className="text-[11px] text-slate-500 block">
                        {language === 'bn' ? 'বিভাগ ও জেলা' : 'Division & District'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 mt-1 block">
                        {[currentUser.district, currentUser.division].filter(Boolean).join(', ') ||
                          (language === 'bn' ? 'যুক্ত নেই' : 'Not set')}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                      <span className="text-[11px] text-slate-500 block">
                        {language === 'bn' ? 'থানা / উপজেলা' : 'Thana / Upazila'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 mt-1 block">
                        {currentUser.thana || (language === 'bn' ? 'যুক্ত নেই' : 'Not set')}
                      </span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                      <span className="text-[11px] text-slate-500 block">
                        {language === 'bn' ? 'বিস্তারিত ঠিকানা' : 'Detailed Address'}
                      </span>
                      <span className="text-xs font-bold text-slate-900 mt-1 block">
                        {currentUser.village || (language === 'bn' ? 'যুক্ত নেই' : 'Not set')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Shortcut to Address Book inside Profile */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-slate-600 tabular-nums">
                    {language === 'bn'
                      ? `সেভ করা অতিরিক্ত ডেলিভারি ঠিকানা: ${savedAddresses.length}টি`
                      : `Saved delivery addresses: ${savedAddresses.length}`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('addresses')}
                    className="min-h-[38px] px-3.5 py-1.5 text-xs font-bold text-[#00873E] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  >
                    {language === 'bn'
                      ? 'ডেলিভারি ঠিকানা যোগ বা ডিলিট করুন →'
                      : 'Manage Delivery Addresses →'}
                  </button>
                </div>
              </div>

              {/* 2. Language Preference */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00873E] flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {language === 'bn' ? 'ওয়েবসাইটের ভাষা (Language)' : 'Website Language'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'bn'
                        ? 'পছন্দের ভাষা নির্বাচন করলে পুরো সাইট সাথে সাথে পরিবর্তন হবে'
                        : 'Select your preferred display language'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (language !== 'bn') {
                        setLanguage('bn');
                        addToast('ওয়েবসাইটের ভাষা বাংলায় পরিবর্তন করা হয়েছে।', 'success');
                      }
                    }}
                    className={`min-h-[56px] p-4 rounded-xl border text-left transition-colors flex items-center justify-between cursor-pointer ${
                      language === 'bn'
                        ? 'border-[#00873E] bg-emerald-50/40'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">বাংলা (Bangla)</div>
                      <div className="text-xs text-slate-500 mt-0.5">সকল মেনু ও পণ্যের তথ্য বাংলায়</div>
                    </div>
                    {language === 'bn' && (
                      <div className="w-5 h-5 rounded-full bg-[#00873E] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (language !== 'en') {
                        setLanguage('en');
                        addToast('Website language switched to English.', 'success');
                      }
                    }}
                    className={`min-h-[56px] p-4 rounded-xl border text-left transition-colors flex items-center justify-between cursor-pointer ${
                      language === 'en'
                        ? 'border-[#00873E] bg-emerald-50/40'
                        : 'border-slate-200 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">English</div>
                      <div className="text-xs text-slate-500 mt-0.5">Browse catalog & checkout in English</div>
                    </div>
                    {language === 'en' && (
                      <div className="w-5 h-5 rounded-full bg-[#00873E] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* 3. Notification Preferences */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {language === 'bn' ? 'বিজ্ঞপ্তি ও অ্যালার্ট' : 'Notifications & Alerts'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'bn'
                        ? 'অর্ডার আপডেট ও বিশেষ অফারের নোটিফিকেশন নিয়ন্ত্রণ করুন'
                        : 'Manage SMS and promotional notifications'}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {language === 'bn' ? 'অর্ডার স্ট্যাটাস এসএমএস' : 'Order Status SMS'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {language === 'bn'
                          ? 'অর্ডার প্যাকিং ও ডেলিভারির আপডেট এসএমএসে পান'
                          : 'Receive SMS when order is packed and dispatched'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSmsNotification(!smsNotification)}
                      aria-label={language === 'bn' ? 'অর্ডার এসএমএস টগল' : 'Toggle order SMS'}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                        smsNotification ? 'bg-[#00873E]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          smsNotification ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {language === 'bn' ? 'বিশেষ ছাড় ও কুপন অ্যালার্ট' : 'Offers & Coupon Alerts'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {language === 'bn'
                          ? 'নতুন ডিসকাউন্ট ও ফ্ল্যাশ সেলের খবর পান'
                          : 'Stay updated on flash sales and special vouchers'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPromoNotification(!promoNotification)}
                      aria-label={language === 'bn' ? 'অফার অ্যালার্ট টগল' : 'Toggle promo alerts'}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                        promoNotification ? 'bg-[#00873E]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          promoNotification ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {language === 'bn' ? 'নিরাপত্তা ও লগইন সতর্কতা' : 'Security & Login Alerts'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {language === 'bn'
                          ? 'নতুন ডিভাইস থেকে লগইন হলে সতর্কতা পান'
                          : 'Alert when logging in from a new device'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSecurityNotification(!securityNotification)}
                      aria-label={language === 'bn' ? 'নিরাপত্তা অ্যালার্ট টগল' : 'Toggle security alerts'}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 cursor-pointer ${
                        securityNotification ? 'bg-[#00873E]' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          securityNotification ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
