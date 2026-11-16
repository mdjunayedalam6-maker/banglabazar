import React from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Youtube,
  Lock,
  MessageCircle,
  MessageSquare,
  PhoneCall,
  Download,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';
import { usePWAInstall } from '../hooks/usePWAInstall';
import brandAppIcon from '../assets/images/bangla_bazar_logo_trimmed.png';

export const Footer: React.FC = () => {
  const {
    language,
    categories,
    openCategory,
    setCurrentPage,
    setFilterState,
    openTrackOrder,
    isAdminAuthenticated,
    setIsAdminModalOpen,
    siteSettings,
    currentUser,
    isUserAdmin,
    loginAdmin,
    setIsAuthModalOpen,
    setProfileActiveTab,
  } = useApp();
  const { isInstalled, install } = usePWAInstall();

  const hotline = siteSettings.hotlineNumber || '01929637253';

  return (
    <footer className="bg-[#062316] text-white pt-12 pb-24 md:pb-10 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-10">
          {/* Col 1: Brand & Contact Info */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo onClick={() => setCurrentPage('home')} size="md" textColor="light" />
            <p className="text-xs text-slate-300/90 leading-relaxed max-w-xs">
              {language === 'bn'
                ? 'সাশ্রয়ী মূল্যে দ্রুত ক্যাশ অন ডেলিভারি।'
                : 'Trusted online shopping across Bangladesh.'}
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${hotline}`} className="hover:text-emerald-300 transition-colors">
                  হটলাইন: <strong className="font-mono text-white tabular-nums">{hotline}</strong>
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="mailto:mdzunayedali6@gmail.com" className="hover:text-emerald-300 transition-colors">
                  mdzunayedali6@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>রামপুর, তারাকান্দা, ময়মনসিংহ, বাংলাদেশ</span>
              </div>
            </div>
          </div>

          {/* Col 2: Popular Categories */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white">
              {language === 'bn' ? 'জনপ্রিয় ক্যাটাগরি' : 'Popular Categories'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {categories.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => openCategory(cat.id)}
                    className="hover:text-emerald-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{language === 'bn' ? cat.nameBn : cat.nameEn}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Quick Customer Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white">
              {language === 'bn' ? 'কাস্টমার সেবা' : 'Customer Links'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setFilterState((prev) => ({ ...prev, category: 'all', subcategory: 'all', searchQuery: '' }));
                    setCurrentPage('shop');
                  }}
                  className="hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'সকল পণ্য দেখুন' : 'Browse All Products'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openTrackOrder()}
                  className="hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'লাইভ অর্ডার ট্র্যাক' : 'Track Order'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (currentUser) {
                      setProfileActiveTab('settings');
                      setCurrentPage('profile');
                    } else {
                      setIsAuthModalOpen(true);
                    }
                  }}
                  className="hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'আমার অ্যাকাউন্ট' : 'My Account'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentPage('cart')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'শপিং কার্ট' : 'Shopping Cart'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentPage('about')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setCurrentPage('contact')}
                  className="hover:text-emerald-300 transition-colors cursor-pointer"
                >
                  {language === 'bn' ? 'যোগাযোগ ও সাপোর্ট' : 'Contact & Support'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: App & Social Channels */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold text-white">
              {language === 'bn' ? 'অ্যাপ ও সামাজিক যোগাযোগ' : 'App & Connect'}
            </h4>

            {/* App Install / Download Card */}
            {siteSettings.appDownloadUrl?.trim() ? (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-700/50 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {siteSettings.appNameBn || (language === 'bn' ? 'বাংলা বাজার মোবাইল অ্যাপ' : 'Bangla Bazar App')}
                    </div>
                    <div className="text-[11px] text-emerald-200/80 truncate">
                      {language === 'bn' ? 'দ্রুত অর্ডারের জন্য ইনস্টল করুন' : 'Fast shopping mobile app'}
                    </div>
                  </div>
                </div>
                <a
                  href={siteSettings.appDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="w-full py-2 bg-[#00873E] hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অ্যাপ ডাউনলোড' : 'Download APK'}</span>
                </a>
              </div>
            ) : !isInstalled ? (
              <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-700/50 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <img src={brandAppIcon} alt="বাংলা বাজার" className="w-9 h-9 rounded-xl object-contain bg-white/10 p-1 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">
                      {language === 'bn' ? 'বাংলা বাজার অ্যাপ' : 'Bangla Bazar App'}
                    </div>
                    <div className="text-[11px] text-emerald-200/80 truncate">
                      {language === 'bn' ? 'ফোনে সরাসরি ইনস্টল করুন' : 'Install on phone or desktop'}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const success = await install();
                    if (success) {
                      try {
                        localStorage.setItem('banglabazar_pwa_installed', 'true');
                      } catch (_) {}
                    }
                  }}
                  className="w-full py-2 bg-[#00873E] hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'অ্যাপ ইনস্টল করুন' : 'Install App'}</span>
                </button>
              </div>
            ) : null}

            {/* Social Links */}
            <div className="flex flex-wrap items-center gap-2">
              {siteSettings.whatsappLink && (
                <a
                  href={siteSettings.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#25D366] text-white flex items-center justify-center transition-colors"
                  title="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {siteSettings.facebookLink && (
                <a
                  href={siteSettings.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#1877F2] text-white flex items-center justify-center transition-colors"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {siteSettings.instagramLink && (
                <a
                  href={siteSettings.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {siteSettings.messengerLink && (
                <a
                  href={siteSettings.messengerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#00B2FF] text-white flex items-center justify-center transition-colors"
                  title="Messenger"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              )}
              {siteSettings.imoLink && (
                <a
                  href={siteSettings.imoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#0056FF] text-white flex items-center justify-center transition-colors"
                  title="Imo"
                >
                  <PhoneCall className="w-4 h-4" />
                </a>
              )}
              {siteSettings.youtubeLink && (
                <a
                  href={siteSettings.youtubeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#FF0000] text-white flex items-center justify-center transition-colors"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {siteSettings.tiktokLink && (
                <a
                  href={siteSettings.tiktokLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-black text-white flex items-center justify-center transition-colors font-black text-sm"
                  title="TikTok"
                >
                  ♪
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Secret Admin Entry */}
        <div className="pt-6 border-t border-emerald-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <p>
              © {new Date().getFullYear()} বাংলা বাজার (Bangla Bazar). {language === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
            </p>
            <button
              onClick={() => {
                if (isAdminAuthenticated || (currentUser && isUserAdmin(currentUser))) {
                  loginAdmin();
                  setCurrentPage('admin');
                } else {
                  setIsAdminModalOpen(true);
                }
              }}
              className="text-slate-500 hover:text-amber-400 transition-colors flex items-center gap-1 text-[11px] p-1 rounded-md cursor-pointer group"
              title="Secret Admin Access (Ctrl+Shift+A)"
            >
              <Lock className="w-3 h-3 text-amber-500/70 group-hover:scale-110 transition-transform" />
              <span className="opacity-70 group-hover:opacity-100 font-mono">সিক্রেট এডমিন</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            ট্রেড লাইসেন্স: TRAD/DNCC/012938/2024 | ডিবিআইডি: 98421
          </p>
        </div>
      </div>
    </footer>
  );
};
