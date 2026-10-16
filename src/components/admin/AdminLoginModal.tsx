import React, { useState } from 'react';
import { 
  ShieldAlert, 
  X, 
  ArrowRight, 
  Lock, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Mail, 
  Phone, 
  KeyRound,
  AlertOctagon,
  CheckCircle2,
  LogIn
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminLoginModal: React.FC = () => {
  const { 
    isAdminModalOpen, 
    setIsAdminModalOpen, 
    loginAdmin, 
    setCurrentPage, 
    language,
    currentUser,
    isUserAdmin,
    setIsAuthModalOpen,
    addToast
  } = useApp();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdminModalOpen) return null;

  const isCurrentAdmin = isUserAdmin(currentUser);

  const handleDirectAdminEnter = () => {
    if (loginAdmin()) {
      setIsAdminModalOpen(false);
      setCurrentPage('admin');
    }
  };

  const handleSecretLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const effectiveId = identifier.trim() || (isCurrentAdmin ? (currentUser?.email || currentUser?.phone || '') : '');

    if (!effectiveId) {
      setErrorMessage(
        language === 'bn' 
          ? 'অনুগ্রহ করে অনুমোদিত Gmail অথবা ফোন নম্বর দিন' 
          : 'Please enter authorized Gmail or Phone number'
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        language === 'bn' 
          ? 'অনুগ্রহ করে সিক্রেট পাসওয়ার্ড দিন' 
          : 'Please enter the secret password'
      );
      return;
    }

    setIsSubmitting(true);

    const success = loginAdmin(effectiveId, password);
    setIsSubmitting(false);

    if (success) {
      setIsAdminModalOpen(false);
      setCurrentPage('admin');
      setIdentifier('');
      setPassword('');
      setErrorMessage('');
    } else {
      setErrorMessage(
        language === 'bn'
          ? 'অ্যাক্সেস ডিনাইড! ভুল ক্রেডেনশিয়াল বা অননুমোদিত অ্যাক্সেস।'
          : 'Access Denied! Invalid credentials or unauthorized access.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white text-center relative border-b border-amber-500/20">
          <button
            onClick={() => {
              setIsAdminModalOpen(false);
              setErrorMessage('');
            }}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <div className="inline-block px-3 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[11px] font-bold rounded-full mb-2 uppercase tracking-wider">
            {language === 'bn' ? 'সিক্রেট এডমিন কন্ট্রোল' : 'Secret Admin Control'}
          </div>

          <h3 className="text-xl font-black tracking-wide text-white">
            {language === 'bn' ? 'এডমিন গেটওয়ে ভেরিফিকেশন' : 'Admin Gateway Verification'}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            {language === 'bn' 
              ? 'শুধুমাত্র অনুমোদিত এডমিন ক্রেডেনশিয়াল দিয়েই প্রবেশাধিকার সংরক্ষিত।' 
              : 'Strictly restricted to authorized administrative credentials.'}
          </p>
        </div>

        {/* Content Area */}
        <div className="p-6">
          {/* Case 1: Currently logged in user is the authorized admin - Requires Secret Password confirmation */}
          {isCurrentAdmin ? (
            <div className="space-y-4 py-1">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3.5">
                <img 
                  src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'} 
                  alt="Admin Avatar" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>অনুমোদিত এডমিন সেশন সক্রিয়</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    {currentUser?.name || 'Authorized Admin'}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono">
                    ••••••••••••••••
                  </p>
                </div>
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong className="block text-rose-900 font-bold mb-0.5">পাসওয়ার্ড মেলেনি</strong>
                    {errorMessage}
                  </div>
                </div>
              )}

              <form onSubmit={handleSecretLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>সিক্রেট পাসওয়ার্ড দিন</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-slate-900 font-medium"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'যাচাই করা হচ্ছে...' : 'পাসওয়ার্ড ভেরিফাই করে প্রবেশ করুন'}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </form>
            </div>
          ) : (
            /* Case 2 & 3: Not logged in or logged in as unauthorized user */
            <div className="space-y-4">
              {currentUser && !isCurrentAdmin && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-left">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-rose-800 flex items-center gap-1.5">
                        <span>অ্যাক্সেস ডিনাইড</span>
                        <span className="text-[10px] uppercase tracking-wider bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                          অননুমোদিত
                        </span>
                      </h4>
                      <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                        বর্তমান অ্যাকাউন্টের এডমিন প্যানেলে প্রবেশের অনুমতি নেই।
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message Box */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-snug">
                    <strong className="block text-rose-900 font-bold mb-0.5">অ্যাক্সেস ডিনাইড</strong>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSecretLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-600" />
                    <span>অনুমোদিত Gmail অথবা ফোন নম্বর</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="এডমিন আইডি (ইমেইল অথবা মোবাইল নম্বর)"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-slate-900"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    <span>সিক্রেট পাসওয়ার্ড</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isSubmitting ? 'যাচাই করা হচ্ছে...' : 'ভেরিফাই ও এডমিন প্যানেলে প্রবেশ'}</span>
                  </button>
                </div>
              </form>

              {/* Notice */}
              <div className="pt-3 border-t border-slate-100 text-center space-y-2">
                <p className="text-[11px] text-slate-400 leading-normal">
                  নিরাপত্তার স্বার্থে সকল প্রবেশাধিকার কঠোরভাবে সুরক্ষিত। অননুমোদিত যেকোনো প্রচেষ্টা প্রতিরোধ করা হবে।
                </p>
                {!currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdminModalOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>মূল অ্যাকাউন্টে লগইন করুন</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
