import React from 'react';
import { 
  Home, 
  Grid, 
  ShoppingBag, 
  Heart, 
  User, 
  X, 
  Flame, 
  PhoneCall, 
  Mail, 
  ChevronRight,
  ShieldCheck,
  Truck,
  Download,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { toBengaliNumber } from '../utils/translations';
import { usePWAInstall } from '../hooks/usePWAInstall';
import brandAppIcon from '../assets/images/bangla_bazar_logo_trimmed.png';

export const MobileBottomBar: React.FC = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    cartItemsCount, 
    wishlist, 
    currentUser, 
    setIsAuthModalOpen,
    setIsCartDrawerOpen,
    language 
  } = useApp();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around select-none">
      <button
        onClick={() => setCurrentPage('home')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
          currentPage === 'home' ? 'text-emerald-700' : 'text-slate-500'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">{language === 'bn' ? 'হোম' : 'Home'}</span>
      </button>

      <button
        onClick={() => setCurrentPage('shop')}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
          currentPage === 'shop' ? 'text-emerald-700' : 'text-slate-500'
        }`}
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">{language === 'bn' ? 'শপ' : 'Shop'}</span>
      </button>

      {/* Center Highlighted Cart */}
      <button
        onClick={() => setIsCartDrawerOpen(true)}
        className="relative flex flex-col items-center justify-center -mt-4 p-2 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-transform active:scale-95"
      >
        <ShoppingBag className="w-5 h-5" />
        {cartItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
            {cartItemsCount}
          </span>
        )}
      </button>

      <button
        onClick={() => {
          if (currentUser) {
            setCurrentPage('profile');
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        className={`relative flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
          currentPage === 'profile' ? 'text-emerald-700' : 'text-slate-500'
        }`}
      >
        <Heart className="w-5 h-5" />
        {wishlist.length > 0 && (
          <span className="absolute top-1 right-2 bg-amber-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
            {wishlist.length}
          </span>
        )}
        <span className="text-[10px] font-medium mt-0.5">{language === 'bn' ? 'উইশলিস্ট' : 'Wishlist'}</span>
      </button>

      <button
        onClick={() => {
          if (currentUser) {
            setCurrentPage('profile');
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        className={`flex flex-col items-center justify-center p-1.5 rounded-lg transition-colors ${
          currentPage === 'profile' ? 'text-emerald-700' : 'text-slate-500'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5">{language === 'bn' ? 'অ্যাকাউন্ট' : 'Account'}</span>
      </button>
    </div>
  );
};

export const MobileDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    language,
    setLanguage,
    categories,
    openCategory,
    setCurrentPage,
    currentUser,
    setIsAuthModalOpen,
    logoutUser,
    openTrackOrder,
    isUserAdmin,
    loginAdmin,
    siteSettings,
    setIsAppInstallModalOpen,
  } = useApp();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-4 bg-[#062919] text-white flex items-center justify-between border-b border-emerald-900/40">
          <BrandLogo size="sm" textColor="light" />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          {currentUser ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full border border-emerald-500 object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-slate-800">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-500">{currentUser.phone}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  logoutUser();
                  onClose();
                }}
                className="text-xs text-rose-600 font-semibold"
              >
                লগআউট
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600">স্বাগতম! কেনাকাটা শুরু করুন</span>
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  onClose();
                }}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                লগইন / রেজিস্ট্রেশন
              </button>
            </div>
          )}
        </div>

        {/* App Download / Install Banner in Drawer */}
        <div 
          onClick={() => {
            onClose();
            setIsAppInstallModalOpen(true);
          }}
          className="p-3 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between gap-2 shadow-inner cursor-pointer hover:brightness-105 transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <img src={brandAppIcon} alt="বাংলা বাজার (Bangla Bazar)" className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-xs border border-white/20" />
            <div className="min-w-0">
              <div className="text-xs font-bold truncate flex items-center gap-1.5">
                <span>{language === 'bn' ? 'বাংলা বাজার মোবাইল অ্যাপ' : 'Bangla Bazar App'}</span>
                <span className="text-[9px] bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-sm font-black">Free</span>
              </div>
              <div className="text-[10px] text-emerald-100 truncate">
                {language === 'bn' ? 'ফোনে ইনস্টল ও ডাউনলোড করুন' : 'Tap to install or download'}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="px-2.5 py-1.5 bg-white text-emerald-800 rounded-xl text-xs font-black shrink-0 shadow-xs flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>{language === 'bn' ? 'ইনস্টল' : 'Install'}</span>
          </button>
        </div>

        {/* Language Selection */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-600">ভাষা / Language:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                language === 'bn' ? 'bg-emerald-600 text-white' : 'text-slate-600'
              }`}
            >
              বাংলা
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                language === 'en' ? 'bg-emerald-600 text-white' : 'text-slate-600'
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="p-4 flex-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            {language === 'bn' ? 'ক্যাটাগরি সমূহ' : 'Categories'}
          </div>
          <div className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  openCategory(cat.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors text-left"
              >
                <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-normal">
                    {language === 'bn' ? `${toBengaliNumber(cat.itemCount)}টি` : `${cat.itemCount}`}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
            <button
              onClick={() => {
                openTrackOrder();
                onClose();
              }}
              className="w-full flex items-center gap-2 py-2 font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
            >
              <Truck className="w-4 h-4 text-orange-600" />
              <span>{language === 'bn' ? 'লাইভ অর্ডার ট্র্যাকিং' : 'Track Order'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                setIsAppInstallModalOpen(true);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs transition-colors cursor-pointer border border-emerald-200"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>{language === 'bn' ? 'মোবাইল অ্যাপ ইনস্টল ও ডাউনলোড' : 'Install / Download App'}</span>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded font-bold flex items-center gap-1 shadow-2xs">
                <Download className="w-3 h-3" />
                <span>ফ্রি</span>
              </span>
            </button>

            {currentUser && isUserAdmin(currentUser) && (
              <button
                onClick={() => {
                  loginAdmin();
                  setCurrentPage('admin');
                  onClose();
                }}
                className="w-full flex items-center gap-2 py-2 font-black text-amber-600 hover:text-amber-700 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{language === 'bn' ? 'এডমিন ড্যাশবোর্ড' : 'Admin Panel'}</span>
              </button>
            )}

            <button
              onClick={() => {
                setCurrentPage('about');
                onClose();
              }}
              className="w-full text-left py-2 font-medium text-slate-600 hover:text-emerald-600 cursor-pointer"
            >
              {language === 'bn' ? 'আমাদের সম্পর্কে (About Us)' : 'About Us'}
            </button>
            <button
              onClick={() => {
                setCurrentPage('contact');
                onClose();
              }}
              className="w-full text-left py-2 font-medium text-slate-600 hover:text-emerald-600 cursor-pointer"
            >
              {language === 'bn' ? 'যোগাযোগ ও সাপোর্ট (Contact & Support)' : 'Contact Us'}
            </button>
          </div>
        </div>

        {/* Drawer Footer Hotline */}
        <div className="p-4 bg-slate-100 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[#062919]">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <a href="tel:01929637253" className="hover:underline">
              হটলাইন: <span className="font-mono">01929637253</span>
            </a>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Mail className="w-4 h-4 text-amber-500" />
            <a href="mailto:mdzunayedali6@gmail.com" className="hover:underline">
              mdzunayedali6@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MobileNav = MobileBottomBar;
