import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Share2, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  WifiOff, 
  Bell, 
  Layers,
  ChevronRight,
  Apple,
  Chrome,
  Laptop
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import brandAppIcon from '../assets/images/bangla_bazar_app_icon_1791721630543.jpg';

export const AppInstallModal: React.FC = () => {
  const { isAppInstallModalOpen, setIsAppInstallModalOpen, language, siteSettings, addToast } = useApp();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isAppInstallModalOpen) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      if (isInstallable) {
        const success = await install();
        if (success) {
          addToast(
            language === 'bn' 
              ? 'অভিনন্দন! বাংলা বাজার অ্যাপ সফলভাবে ইনস্টল হয়েছে।' 
              : 'Congratulations! Bangla Bazar app installed successfully.', 
            'success'
          );
          setIsAppInstallModalOpen(false);
        }
      } else if (isIOS) {
        setActiveTab('ios');
      } else {
        setActiveTab('android');
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleShareApp = () => {
    const url = window.location.origin;
    if (navigator.share) {
      navigator.share({
        title: 'বাংলা বাজার (Bangla Bazar) মোবাইল অ্যাপ',
        text: 'বাংলা বাজার মোবাইল অ্যাপ থেকে ১১,৯০০+ পণ্যে কেনাকাটা করুন ক্যাশ অন ডেলিভারিতে!',
        url: url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      addToast(
        language === 'bn' ? 'অ্যাপ লিংক কপি করা হয়েছে!' : 'App link copied to clipboard!',
        'success'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-5 sm:p-7 space-y-6">
        {/* Close Button */}
        <button
          onClick={() => setIsAppInstallModalOpen(false)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          title="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header App Card */}
        <div className="flex items-center gap-4 pr-8">
          <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg border-2 border-emerald-500/20 shrink-0">
            <img
              src={brandAppIcon}
              alt="বাংলা বাজার অ্যাপ"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">
                অফিসিয়াল অ্যাপ
              </span>
              <span className="text-xs text-amber-500 font-bold flex items-center gap-0.5">
                ★ 4.9 (10k+)
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
              বাংলা বাজার (Bangla Bazar)
            </h3>
            <p className="text-xs text-slate-500">
              সাইজ: মাত্র ১.৮ এমবি • কোনো বাড়তি মেমরি দখল করে না
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="space-y-2.5">
          {isInstalled ? (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>অ্যাপটি ইতোমধ্যে আপনার ডিভাইসে ইনস্টল করা আছে!</span>
            </div>
          ) : isInstallable ? (
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-5 h-5 animate-bounce" />
              <span>{isInstalling ? 'ইনস্টল হচ্ছে...' : 'সরাসরি ১-ক্লিকে অ্যাপ ইনস্টল করুন'}</span>
            </button>
          ) : (
            <button
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-98 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Smartphone className="w-5 h-5" />
              <span>ফোনে অ্যাপ হিসেবে যুক্ত করার নিয়ম দেখুন</span>
            </button>
          )}

          {siteSettings.appDownloadUrl && (
            <a
              href={siteSettings.appDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>📥 সরাসরি Android APK ফাইল ডাউনলোড করুন</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          )}
        </div>

        {/* App Key Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl text-center space-y-1">
            <Zap className="w-4 h-4 text-amber-500 mx-auto" />
            <div className="text-[11px] font-bold text-slate-800">সুপার ফাস্ট</div>
            <div className="text-[10px] text-slate-500">পলকে পেজ লোড হয়</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-2xl text-center space-y-1">
            <WifiOff className="w-4 h-4 text-emerald-600 mx-auto" />
            <div className="text-[11px] font-bold text-slate-800">অফলাইন সুবিধা</div>
            <div className="text-[10px] text-slate-500">নেট ছাড়াও প্রডাক্ট দেখা যায়</div>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3 bg-slate-50 border border-slate-200/70 rounded-2xl text-center space-y-1">
            <ShieldCheck className="w-4 h-4 text-blue-600 mx-auto" />
            <div className="text-[11px] font-bold text-slate-800">১০০% নিরাপদ</div>
            <div className="text-[10px] text-slate-500">কোনো পারমিশন লাগে না</div>
          </div>
        </div>

        {/* Step-by-step Installation Guide Tabs */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>ডিভাইস অনুযায়ী সহজ ইনস্টল গাইড:</span>
          </h4>

          {/* Device Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'android'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Chrome className="w-3.5 h-3.5 text-emerald-600" />
              <span>Android</span>
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'ios'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Apple className="w-3.5 h-3.5 text-slate-900" />
              <span>iPhone (iOS)</span>
            </button>
            <button
              onClick={() => setActiveTab('pc')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'pc'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-blue-600" />
              <span>কম্পিউটার</span>
            </button>
          </div>

          {/* Guide Content */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
            {activeTab === 'android' && (
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    ১
                  </span>
                  <p>
                    ব্রাউজারের (Chrome/Samsung Internet) উপরের ডানদিকের <strong>তিনটি ডট (⋮)</strong> মেন্যুতে চাপুন।
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    ২
                  </span>
                  <p>
                    মেন্যু থেকে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen" (হোম স্ক্রিনে যোগ করুন)</strong> অপশনটিতে চাপুন।
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    ৩
                  </span>
                  <p>
                    <strong>'Install'</strong> বাটন চাপলেই সাথে সাথে আপনার ফোনের অ্যাপ লিস্টে <strong>বাংলা বাজার</strong> অ্যাপটি যুক্ত হয়ে যাবে!
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'ios' && (
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    ১
                  </span>
                  <p>
                    সাফারি ব্রাউজারের নিচের মাঝের <strong>শেয়ার আইকনে (Share ⎋)</strong> চাপুন।
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    ২
                  </span>
                  <p>
                    তালিকাটি একটু নিচে স্ক্রোল করে <strong>"Add to Home Screen" (হোম স্ক্রিনে যোগ করুন)</strong> চাপুন।
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    ৩
                  </span>
                  <p>
                    উপরে ডানদিকের <strong>'Add'</strong> বাটনে চাপ দিন — আপনার আইফোনে বাংলা বাজার অ্যাপ তৈরি হয়ে যাবে!
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'pc' && (
              <div className="space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    ১
                  </span>
                  <p>
                    কম্পিউটারে Chrome অথবা Edge ব্রাউজারের অ্যাড্রেস বারের (URL bar) একেবারে ডানপাশে থাকা <strong>ইনস্টল আইকনটিতে (⊕)</strong> ক্লিক করুন।
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    ২
                  </span>
                  <p>
                    <strong>'Install'</strong> এ ক্লিক করলেই ব্রাউজার ছাড়াই সরাসরি ডেস্কটপ অ্যাপ হিসেবে ওপেন হবে।
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Share App Link with Friends */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            বন্ধুদের সাথে অ্যাপ শেয়ার করুন
          </span>
          <button
            onClick={handleShareApp}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>লিংক শেয়ার</span>
          </button>
        </div>
      </div>
    </div>
  );
};
