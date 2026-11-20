import React, { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  ArrowRight,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  Smartphone,
  X,
  ShieldCheck,
  Search,
  Gift,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WalletPaymentMethod } from '../types';
import {
  PERSONAL_PAYMENT_ACCOUNTS,
  PersonalSendMoneyMethod,
  getPersonalPaymentAccount,
  WITHDRAW_MOBILE_BANKS,
  getPaymentMethodDisplayLabel,
} from '../data/paymentConfig';

export const CustomerWallet: React.FC = () => {
  const {
    currentUser,
    depositToWallet,
    withdrawFromWallet,
    formatPrice,
    language,
    addToast,
    setProfileActiveTab
  } = useApp();

  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  // Deposit Form State (ONLY Nagad, bKash, Upay Personal Send Money)
  const [depositAmount, setDepositAmount] = useState<string>('500');
  const [depositMethod, setDepositMethod] = useState<PersonalSendMoneyMethod>('nagad');
  const [depositSenderNumber, setDepositSenderNumber] = useState<string>('');
  const [depositTrxId, setDepositTrxId] = useState<string>('');
  const [depositNote, setDepositNote] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState(false);

  // Withdraw Form State (All Mobile Banks: bKash, Nagad, Upay, Rocket, CellFin, Tap, etc.)
  const [withdrawAmount, setWithdrawAmount] = useState<string>('500');
  const [withdrawMethod, setWithdrawMethod] = useState<WalletPaymentMethod>('bkash');
  const [withdrawAccount, setWithdrawAccount] = useState<string>('');
  const [withdrawOtherBankName, setWithdrawOtherBankName] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // History Filter
  const [historyFilter, setHistoryFilter] = useState<
    'all' | 'commission' | 'deposit' | 'withdraw' | 'order_payment'
  >('all');
  const [searchTxn, setSearchTxn] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!currentUser) return null;

  const currentBalance = currentUser.balance || 0;
  const transactions = currentUser.walletTransactions || [];

  // Computed summary metrics
  const totalDeposited = transactions
    .filter((t) => t.type === 'deposit' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawn = transactions
    .filter((t) => t.type === 'withdraw' && (t.status === 'completed' || t.status === 'pending'))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSpent = transactions
    .filter((t) => t.type === 'order_payment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  // Filtered transactions
  const filteredTransactions = transactions.filter((t) => {
    if (historyFilter === 'commission') {
      if (t.type !== 'commission' && t.type !== 'commission_reversal') return false;
    } else if (historyFilter !== 'all' && t.type !== historyFilter) {
      return false;
    }
    if (searchTxn.trim()) {
      const q = searchTxn.toLowerCase();
      const idMatch = t.id.toLowerCase().includes(q);
      const trxMatch = t.trxId?.toLowerCase().includes(q) || false;
      const noteMatch = t.note?.toLowerCase().includes(q) || false;
      return idMatch || trxMatch || noteMatch;
    }
    return true;
  });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast(language === 'bn' ? `${key} কপি করা হয়েছে` : 'Copied to clipboard', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(depositAmount, 10);
    if (!amt || amt <= 0) {
      addToast(language === 'bn' ? 'সঠিক টাকার পরিমাণ দিন' : 'Enter a valid amount', 'error');
      return;
    }

    if (!depositSenderNumber.trim()) {
      addToast(language === 'bn' ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন তা লিখুন' : 'Enter sender number', 'error');
      return;
    }

    if (!depositTrxId.trim()) {
      addToast(language === 'bn' ? 'পেমেন্টের TrxID প্রদান করুন' : 'Enter transaction ID', 'error');
      return;
    }

    setIsDepositing(true);
    try {
      await depositToWallet(
        amt,
        depositMethod,
        depositSenderNumber.trim(),
        depositTrxId.trim().toUpperCase(),
        depositNote.trim()
      );
      setIsDepositModalOpen(false);
      setDepositAmount('500');
      setDepositSenderNumber('');
      setDepositTrxId('');
      setDepositNote('');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(withdrawAmount, 10);
    if (!amt || amt <= 0) {
      addToast(language === 'bn' ? 'সঠিক উত্তোলনের পরিমাণ দিন' : 'Enter a valid amount', 'error');
      return;
    }

    if (amt > currentBalance) {
      addToast(language === 'bn' ? 'অপর্যাপ্ত ব্যালেন্স' : 'Insufficient balance', 'error');
      return;
    }

    if (amt < 50) {
      addToast(language === 'bn' ? 'সর্বনিম্ন উত্তোলন ৫০ টাকা' : 'Minimum withdrawal is ৳50', 'error');
      return;
    }

    if (!withdrawAccount.trim() || withdrawAccount.replace(/\D/g, '').length < 11) {
      addToast(
        language === 'bn'
          ? 'সঠিক ১১ ডিজিটের মোবাইল ব্যাংকিং নম্বর দিন'
          : 'Enter a valid 11-digit mobile banking number',
        'error'
      );
      return;
    }

    if (withdrawMethod === 'other_mfs' && !withdrawOtherBankName.trim()) {
      addToast(
        language === 'bn' ? 'মোবাইল ব্যাংকের নাম লিখুন' : 'Enter mobile banking name',
        'error'
      );
      return;
    }

    setIsWithdrawing(true);
    try {
      const customDetails =
        withdrawMethod === 'other_mfs'
          ? { bankName: withdrawOtherBankName.trim() }
          : undefined;

      await withdrawFromWallet(
        amt,
        withdrawMethod,
        withdrawAccount.trim(),
        customDetails
      );
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('500');
      setWithdrawAccount('');
      setWithdrawOtherBankName('');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const activeDepositAccount = getPersonalPaymentAccount(depositMethod);
  const selectedWithdrawBank =
    WITHDRAW_MOBILE_BANKS.find((m) => m.id === withdrawMethod) || WITHDRAW_MOBILE_BANKS[0];

  return (
    <div className="space-y-6">
      {/* 1. Master Glassmorphic Balance Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#062919] via-[#0A3D24] to-[#046A31] p-6 sm:p-8 text-white shadow-xl border border-emerald-500/30">
        {/* Subtle Decorative Elements */}
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-emerald-400/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Top Row: User & Wallet Label */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-400 shadow-inner">
                <Wallet className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
                  {language === 'bn' ? 'গ্রাহক অ্যাকাউন্ট ব্যালেন্স ও ওয়ালেট' : 'Customer Account Wallet'}
                </span>
                <h3 className="font-black text-lg text-white">
                  {currentUser.name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'সুরক্ষিত ওয়ালেট' : 'Secured'}</span>
              </span>
            </div>
          </div>

          {/* Center: Available Balance Display */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs text-emerald-200/90 font-medium block mb-1">
                {language === 'bn' ? 'মোট ব্যবহারযোগ্য ব্যালেন্স:' : 'Available Balance:'}
              </span>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight flex items-baseline gap-2">
                <span>{formatPrice(currentBalance)}</span>
                <span className="text-xs sm:text-sm font-bold text-amber-300 uppercase tracking-wider bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-400/30">
                  BDT
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 mt-1">
                {language === 'bn' 
                  ? '১-ক্লিকে যেকোনো অর্ডারের মূল্য পরিশোধ করুন।' 
                  : 'Ready for 1-click order payments.'}
              </p>
            </div>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{language === 'bn' ? 'টাকা ডিপোজিট' : 'Deposit Money'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-xs sm:text-sm flex items-center gap-2 border border-white/20 transition-all active:scale-95 cursor-pointer backdrop-blur-md"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                <span>{language === 'bn' ? 'টাকা উত্তোলন' : 'Withdraw'}</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <div className="bg-black/20 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 text-emerald-300 text-[11px] font-medium">
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'মোট ডিপোজিট' : 'Total Deposited'}</span>
              </div>
              <div className="text-sm sm:text-base font-black text-white mt-1">
                {formatPrice(totalDeposited)}
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 text-amber-300 text-[11px] font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'মোট উত্তোলন' : 'Withdrawn'}</span>
              </div>
              <div className="text-sm sm:text-base font-black text-white mt-1">
                {formatPrice(totalWithdrawn)}
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-xs rounded-2xl p-3 border border-white/5">
              <div className="flex items-center gap-1.5 text-sky-300 text-[11px] font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'কেনাকাটা ব্যয়' : 'Orders Spent'}</span>
              </div>
              <div className="text-sm sm:text-base font-black text-white mt-1">
                {formatPrice(totalSpent)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Share 2% Commission & Referral Banner */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#00873E] text-white flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-slate-900">
              {language === 'bn'
                ? 'প্রোডাক্ট লিংক শেয়ারে ২% কমিশন আয়'
                : 'Earn 2% Commission Sharing Product Links'}
            </div>
            <div className="text-[11px] text-slate-600 truncate">
              {language === 'bn'
                ? 'অর্ডার ডেলিভারি হলে অটো ২% ওয়ালেটে যুক্ত হবে · চাইলে সহজেই উত্তোলন করুন'
                : 'Auto-credited on delivery · Withdraw anytime to bKash/Nagad/Upay'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setProfileActiveTab('referral')}
          className="px-3.5 py-2 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
        >
          <span>{language === 'bn' ? 'শেয়ার ও আয়' : 'Share & Earn'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Transaction History Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'ওয়ালেট লেনদেনের ইতিহাস' : 'Wallet Transaction History'}</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'bn' 
                ? 'আপনার সকল ডিপোজিট, উত্তোলন ও অর্ডার পেমেন্টের বিস্তারিত রেকর্ড' 
                : 'Detailed record of all deposits, withdrawals, and purchases'}
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTxn}
              onChange={(e) => setSearchTxn(e.target.value)}
              placeholder={language === 'bn' ? 'আইডি বা TrxID খুঁজুন...' : 'Search ID or TrxID...'}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 w-full sm:w-48"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: language === 'bn' ? 'সব লেনদেন' : 'All' },
            { id: 'commission', label: language === 'bn' ? 'শেয়ার কমিশন (২%)' : '2% Commission' },
            { id: 'deposit', label: language === 'bn' ? 'ডিপোজিট' : 'Deposits' },
            { id: 'withdraw', label: language === 'bn' ? 'উত্তোলন' : 'Withdrawals' },
            { id: 'order_payment', label: language === 'bn' ? 'কেনাকাটা' : 'Orders' },
          ].map((pill) => (
            <button
              key={pill.id}
              type="button"
              onClick={() => setHistoryFilter(pill.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                historyFilter === pill.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Transaction Items List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6 space-y-2">
            <Wallet className="w-10 h-10 text-slate-400 mx-auto opacity-70" />
            <h5 className="font-bold text-slate-700 text-sm">
              {language === 'bn' ? 'কোনো লেনদেন রেকর্ড পাওয়া যায়নি' : 'No transactions found'}
            </h5>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {language === 'bn' 
                ? 'ডিপোজিট বাটনে ক্লিক করে সহজে ব্যালেন্স যোগ করুন এবং ঝামেলামুক্ত কেনাকাটা উপভোগ করুন।'
                : 'Deposit money to start using your digital wallet for instant checkouts.'}
            </p>
            <button
              type="button"
              onClick={() => setIsDepositModalOpen(true)}
              className="mt-2 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              {language === 'bn' ? 'প্রথম ডিপোজিট করুন' : 'Make First Deposit'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((txn) => {
              const isCredit =
                txn.type === 'deposit' ||
                txn.type === 'refund' ||
                txn.type === 'bonus' ||
                txn.type === 'commission';

              const txnTypeLabel =
                txn.type === 'commission'
                  ? language === 'bn'
                    ? 'প্রোডাক্ট শেয়ার কমিশন (২%)'
                    : '2% Product Share Commission'
                  : txn.type === 'commission_reversal'
                  ? language === 'bn'
                    ? 'অর্ডার বাতিল — ২% কমিশন কর্তন'
                    : 'Cancelled Order — Commission Deducted'
                  : txn.type === 'deposit'
                  ? 'টাকা ডিপোজিট'
                  : txn.type === 'withdraw'
                  ? 'টাকা উত্তোলন'
                  : txn.type === 'order_payment'
                  ? 'অর্ডার পেমেন্ট'
                  : txn.type === 'bonus'
                  ? 'বোনাস ক্রেডিট'
                  : 'রিফান্ড / অ্যাডজাস্টমেন্ট';

              return (
                <div key={txn.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                  {/* Left: Icon & Details */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      isCredit 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-rose-100 text-rose-700'
                    }`}>
                      {isCredit ? (
                        <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                        <span>{txnTypeLabel}</span>
                        
                        {/* Status Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                          txn.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : txn.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {txn.status === 'completed'
                            ? 'সফল'
                            : txn.status === 'pending'
                            ? 'প্রক্রিয়াধীন'
                            : 'বাতিল'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{txn.date}</span>
                        <span>•</span>
                        <span className="font-mono">{txn.id}</span>
                        {txn.method && (
                          <>
                            <span>•</span>
                            <span className="font-medium bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                              {getPaymentMethodDisplayLabel(txn.method, language, txn.bankDetails?.bankName)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* TrxID if available */}
                      {txn.trxId && (
                        <div className="text-[11px] text-slate-600 font-mono mt-1 flex items-center gap-1.5">
                          <span>TrxID: <strong>{txn.trxId}</strong></span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(txn.trxId!, txn.id)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="কপি করুন"
                          >
                            {copiedKey === txn.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      )}

                      {txn.note && (
                        <p className="text-[10.5px] text-slate-400 mt-0.5 italic">{txn.note}</p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount */}
                  <div className="text-right shrink-0">
                    <span className={`text-sm sm:text-base font-black ${
                      isCredit ? 'text-emerald-700' : 'text-slate-900'
                    }`}>
                      {isCredit ? '+' : '-'}{formatPrice(txn.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. DEPOSIT MODAL */}
      {isDepositModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setIsDepositModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#062919] via-[#0A3D24] to-[#046A31] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h4 className="font-black text-sm sm:text-base">টাকা ডিপোজিট করুন (Deposit Money)</h4>
                  <p className="text-[11px] text-emerald-200">নগদ, বিকাশ বা উপায় পার্সোনাল অ্যাকাউন্টে সেন্ড মানি করে ব্যালেন্স নিন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Step 1: Amount Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  ডিপোজিটের পরিমাণ (টাকা): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="10"
                    required
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="500"
                    className="w-full pl-8 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-base outline-none focus:border-emerald-600 focus:bg-white"
                  />
                  <span className="absolute left-3 top-3 font-bold text-slate-500">৳</span>
                  <span className="absolute right-3 top-3 text-[11px] font-bold text-slate-400">BDT</span>
                </div>

                {/* Amount Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[100, 300, 500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(String(amt))}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                        depositAmount === String(amt)
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Payment Method Choice (ONLY Nagad, bKash, Upay Personal Send Money) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  পেমেন্ট মাধ্যম বেছে নিন (পার্সোনাল • সেন্ড মানি): <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PERSONAL_PAYMENT_ACCOUNTS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDepositMethod(m.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        depositMethod === m.id
                          ? m.activeCardClass
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="font-bold text-slate-900 text-xs">{m.nameBn}</div>
                      <div className={`text-[10px] font-semibold mt-0.5 ${m.accentText}`}>
                        {m.accountTypeBn}
                      </div>
                      <div className="text-[10px] font-mono text-slate-600 mt-0.5 tabular-nums">
                        {m.number}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Personal Account Send Money Instructions */}
              <div className={`p-4 rounded-2xl border ${activeDepositAccount.accentBg} ${activeDepositAccount.accentBorder} space-y-2.5`}>
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                  <div>
                    <span className={`text-[10px] font-bold block ${activeDepositAccount.accentText}`}>
                      {activeDepositAccount.nameBn} পার্সোনাল নম্বর ({activeDepositAccount.actionTypeBn}):
                    </span>
                    <strong className="font-mono text-base sm:text-lg font-black text-slate-900 tabular-nums">
                      {activeDepositAccount.formattedNumber}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        activeDepositAccount.number,
                        `${activeDepositAccount.nameBn} নম্বর`
                      )
                    }
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 ${activeDepositAccount.buttonClass}`}
                  >
                    {copiedKey === `${activeDepositAccount.nameBn} নম্বর` ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>কপি করুন</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] bg-white/80 px-3 py-2 rounded-xl border border-slate-200/70">
                  <span className="text-slate-600 font-medium">সেন্ড মানি পরিমাণ:</span>
                  <strong className="font-mono text-emerald-700 text-xs font-black">
                    ৳{depositAmount || '0'}
                  </strong>
                </div>

                <p className="text-[11px] text-slate-700 leading-relaxed flex items-start gap-1.5">
                  <Smartphone className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${activeDepositAccount.accentText}`} />
                  <span>
                    আপনার <strong>{activeDepositAccount.nameBn}</strong> অ্যাপ থেকে{' '}
                    <strong>"Send Money (সেন্ড মানি)"</strong> অপশনে গিয়ে{' '}
                    <strong className="font-mono">{activeDepositAccount.number}</strong> (পার্সোনাল) নম্বরে{' '}
                    <strong>৳{depositAmount || '0'}</strong> পাঠান এবং নিচে প্রেরক নম্বর ও TrxID দিন।
                  </span>
                </p>
              </div>

              {/* Step 4: Verification Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    যে নম্বর থেকে টাকা পাঠিয়েছেন <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={depositSenderNumber}
                    onChange={(e) => setDepositSenderNumber(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    TrxID (ট্রানজেকশন আইডি) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={depositTrxId}
                    onChange={(e) => setDepositTrxId(e.target.value.toUpperCase())}
                    placeholder="9H87G6F5"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono uppercase outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isDepositing}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black rounded-xl text-sm transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDepositing ? (
                  <span>ডিপোজিট প্রক্রিয়াধীন...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                    <span>ডিপোজিট সম্পন্ন করুন • ৳{depositAmount || '0'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. WITHDRAW MODAL */}
      {isWithdrawModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in"
          onClick={() => setIsWithdrawModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                  <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-black text-sm sm:text-base">টাকা উত্তোলন করুন (Withdraw Money)</h4>
                  <p className="text-[11px] text-slate-300">বিকাশ, নগদ, উপায়, রকেট, সেলফিন সহ যেকোনো মোবাইল ব্যাংকে টাকা নিন</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              {/* Balance Badge */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">আপনার বর্তমান ব্যালেন্স:</span>
                  <div className="text-lg font-black text-emerald-900">{formatPrice(currentBalance)}</div>
                </div>
                <span className="text-[10px] font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs">
                  ০% চার্জ (ফ্রি উত্তোলন)
                </span>
              </div>

              {/* Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-700">
                    উত্তোলনের পরিমাণ (টাকা): <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(currentBalance))}
                    className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    সব টাকা তুলুন (৳{currentBalance})
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    max={currentBalance}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="500"
                    className="w-full pl-8 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold text-base outline-none focus:border-emerald-600 focus:bg-white"
                  />
                  <span className="absolute left-3 top-3 font-bold text-slate-500">৳</span>
                  <span className="absolute right-3 top-3 text-[11px] font-bold text-slate-400">BDT</span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[50, 100, 300, 500, 1000].filter((a) => a <= currentBalance).map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setWithdrawAmount(String(amt))}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold transition-all cursor-pointer ${
                        withdrawAmount === String(amt)
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Withdraw Method: All Mobile Banking Platforms */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  মোবাইল ব্যাংক নির্বাচন করুন: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {WITHDRAW_MOBILE_BANKS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setWithdrawMethod(m.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        withdrawMethod === m.id
                          ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-xs">{m.shortLabel}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Other Mobile Bank Name Input */}
              {withdrawMethod === 'other_mfs' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    মোবাইল ব্যাংকের নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={withdrawOtherBankName}
                    onChange={(e) => setWithdrawOtherBankName(e.target.value)}
                    placeholder="যেমন: MeghnaPay / MyCash / FastPay"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-emerald-600 focus:bg-white"
                  />
                </div>
              )}

              {/* Mobile Banking Account Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {withdrawMethod === 'other_mfs'
                    ? `${withdrawOtherBankName.trim() || 'মোবাইল ব্যাংক'} নম্বর`
                    : `${selectedWithdrawBank.nameBn} মোবাইল নম্বর`}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isWithdrawing || currentBalance < 50}
                className="w-full py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-black hover:to-slate-900 text-white font-black rounded-xl text-sm transition-all shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isWithdrawing ? (
                  <span>উত্তোলন অনুরোধ প্রক্রিয়াধীন...</span>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                    <span>উত্তোলন নিশ্চিত করুন • ৳{withdrawAmount || '0'}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
