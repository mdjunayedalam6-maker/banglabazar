import React, { useEffect, useState } from 'react';
import { WifiOff, CheckCircle2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getPendingOfflineOrders } from '../context/AppContext';

export const OfflineIndicator: React.FC = () => {
  const { language, addToast } = useApp();
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const checkPendingOrders = () => {
    try {
      const orders = getPendingOfflineOrders();
      setPendingCount(orders.length);
    } catch {
      setPendingCount(0);
    }
  };

  useEffect(() => {
    checkPendingOrders();
    const interval = setInterval(checkPendingOrders, 3000);

    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      addToast(
        language === 'bn'
          ? 'ইন্টারনেট সংযোগ ফিরে এসেছে! ডাটা ও অর্ডার সিঙ্ক হচ্ছে...'
          : 'Internet connection restored! Syncing data & orders...',
        'success'
      );
      setTimeout(() => {
        setJustReconnected(false);
      }, 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
      checkPendingOrders();
      addToast(
        language === 'bn'
          ? 'আপনি বর্তমানে অফলাইনে আছেন — প্রডাক্ট দেখা ও অর্ডার দেওয়া সম্পূর্ণ চালু আছে।'
          : 'You are currently offline — browsing and placing orders is fully functional.',
        'info'
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [language, addToast]);

  if (isOnline && !justReconnected) return null;

  if (justReconnected) {
    return (
      <div className="fixed bottom-20 sm:bottom-6 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-emerald-700/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-white shadow-2xl animate-fade-in border border-emerald-500/40">
        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-200" />
        <span>
          {language === 'bn'
            ? 'ইন্টারনেট সংযোগ সক্রিয় — ডাটা সিঙ্ক সফল!'
            : 'Online — Data synchronized successfully!'}
        </span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-4 z-50 max-w-sm flex items-center gap-3 rounded-2xl bg-slate-900/95 backdrop-blur-md p-3 text-xs text-white shadow-2xl animate-fade-in border border-amber-500/40 ring-1 ring-amber-500/20">
      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <WifiOff className="w-4 h-4 animate-pulse" />
      </div>
      <div className="flex-1 space-y-0.5">
        <div className="font-bold text-amber-300 flex items-center gap-1.5">
          <span>{language === 'bn' ? 'অফলাইন মোড সক্রিয়' : 'Offline Mode Active'}</span>
          {pendingCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full">
              {pendingCount}টি অর্ডার পেন্ডিং
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-300 leading-tight">
          {language === 'bn'
            ? 'সব প্রডাক্ট দেখা ও অর্ডার করা চালু আছে। ইন্টারনেট পেলে অর্ডার অটো সিঙ্ক হবে।'
            : 'Catalog browsing & ordering work offline. Orders sync when online.'}
        </p>
      </div>
    </div>
  );
};
