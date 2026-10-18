import React, { useEffect, useState } from 'react';
import { ShoppingBag, Sparkles, Wifi, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InitialLoadingScreen: React.FC = () => {
  const { isAppReady, initialLoadingStep, siteSettings } = useApp();
  const [shouldRender, setShouldRender] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isAppReady) {
      setFadeOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isAppReady]);

  if (!shouldRender) return null;

  const displayName = siteSettings.siteName && siteSettings.siteName !== 'OneRoof'
    ? siteSettings.siteName
    : 'বাংলা বাজার (Bangla Bazar)';

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background ambient glow circles */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-sm w-full mx-auto px-6 text-center space-y-7">
        {/* Animated Brand Emblem */}
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-25 blur-lg animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-400/30 flex items-center justify-center shadow-2xl">
            <ShoppingBag className="w-10 h-10 text-white animate-bounce" />
            <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1 -right-1 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>

        {/* Brand Text */}
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>{displayName}</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            {siteSettings.taglineBn || 'সবকিছু এক ছাদের নিচে • আপনার বিশ্বস্ত অনলাইন মার্কেটপ্লেস'}
          </p>
        </div>

        {/* Loading Bar & Step */}
        <div className="space-y-3 pt-2">
          {/* Animated progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full animate-[progress_1.4s_ease-in-out_infinite]" />
          </div>

          <p className="text-xs text-emerald-400 font-semibold tracking-wide flex items-center justify-center gap-1.5 animate-pulse">
            <span>{initialLoadingStep || 'ক্যাটালগ ও ডাটা প্রস্তুত হচ্ছে...'}</span>
          </p>
        </div>

        {/* Connectivity Mode Badge */}
        <div className="pt-2 flex items-center justify-center">
          {isOnline ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[11px] text-emerald-300 font-medium">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>অনলাইন মোড • রিয়েলটাইম ক্লাউড সিঙ্ক</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[11px] text-amber-300 font-medium">
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span>অফলাইন মোড • দ্রুত ক্যাশ থেকে ব্রাউজিং সক্রিয়</span>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-500 pt-1">
          ১১,৯০০+ জেনুইন প্রোডাক্ট • ক্যাশ অন ডেলিভারি
        </div>
      </div>
    </div>
  );
};
