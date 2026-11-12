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
  XCircle,
  QrCode,
  Smartphone,
  Building2,
  AlertCircle,
  X,
  Eye,
  Download,
  Info,
  ShieldCheck,
  RefreshCw,
  Search,
  Filter,
  Gift,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WalletTransaction, WalletPaymentMethod } from '../types';

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
  const [isQrStandeeModalOpen, setIsQrStandeeModalOpen] = useState(false);

  // Deposit Form State
  const [depositAmount, setDepositAmount] = useState<string>('500');
  const [depositMethod, setDepositMethod] = useState<WalletPaymentMethod>('bangla_qr');
  const [depositSenderNumber, setDepositSenderNumber] = useState<string>('');
  const [depositTrxId, setDepositTrxId] = useState<string>('');
  const [depositNote, setDepositNote] = useState<string>('');
  const [isDepositing, setIsDepositing] = useState(false);

  // Withdraw Form State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('500');
  const [withdrawMethod, setWithdrawMethod] = useState<'bkash' | 'nagad' | 'rocket' | 'bank'>('bkash');
  const [withdrawAccount, setWithdrawAccount] = useState<string>('');
  const [withdrawBankName, setWithdrawBankName] = useState<string>('');
  const [withdrawAccountHolder, setWithdrawAccountHolder] = useState<string>('');
  const [withdrawBranch, setWithdrawBranch] = useState<string>('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // History Filter
  const [historyFilter, setHistoryFilter] = useState<'all' | 'deposit' | 'withdraw' | 'order_payment'>('all');
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
    if (historyFilter !== 'all' && t.type !== historyFilter) return false;
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

    if (!withdrawAccount.trim()) {
      addToast(language === 'bn' ? 'সঠিক অ্যাকাউন্ট বা মোবাইল নম্বর দিন' : 'Enter account number', 'error');
      return;
    }

    setIsWithdrawing(true);
    try {
      const bankDetails = withdrawMethod === 'bank' ? {
        bankName: withdrawBankName,
        accountHolder: withdrawAccountHolder,
        branchName: withdrawBranch
      } : undefined;

      await withdrawFromWallet(
        amt,
        withdrawMethod,
        withdrawAccount.trim(),
        bankDetails
      );
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('500');
      setWithdrawAccount('');
      setWithdrawBankName('');
      setWithdrawAccountHolder('');
      setWithdrawBranch('');
    } finally {
      setIsWithdrawing(false);
    }
  };

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

      {/* Referral & Welcome Bonus Banner - Compact & Attractive */}
      <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-300 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Gift className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>রেফার ও আয়: প্রতি রেফারে ৳৩০</span>
              <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">ক্যাশ</span>
            </div>
            <div className="text-[11px] text-slate-600 truncate">
              {!currentUser.hasCompletedFirstOrder
                ? '১ম অর্ডারে ৫০ টাকা বোনাস ওয়ালেটে যুক্ত হবে'
                : 'বন্ধুর ১ম অর্ডারে সরাসরি ওয়ালেটে ৩০ টাকা জমা হবে'}
            </div>
          </div>
        </div>

        <button
          onClick={() => setProfileActiveTab('referral')}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0 cursor-pointer"
        >
          <span>রেফার লিংক</span>
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

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: language === 'bn' ? 'সব লেনদেন' : 'All' },
            { id: 'deposit', label: language === 'bn' ? 'ডিপোজিট' : 'Deposits' },
            { id: 'withdraw', label: language === 'bn' ? 'উত্তোলন' : 'Withdrawals' },
            { id: 'order_payment', label: language === 'bn' ? 'কেনাকাটা' : 'Orders' },
          ].map((pill) => (
            <button
              key={pill.id}
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
              const isCredit = txn.type === 'deposit' || txn.type === 'refund' || txn.type === 'bonus';

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
                        <span>
                          {txn.type === 'deposit' 
                            ? 'টাকা ডিপোজিট' 
                            : txn.type === 'withdraw'
                            ? 'টাকা উত্তোলন'
                            : txn.type === 'order_payment'
                            ? 'অর্ডার পেমেন্ট'
                            : 'রিফান্ড / অ্যাডজাস্টমেন্ট'}
                        </span>
                        
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
                            <span className="font-medium uppercase bg-slate-100 px-1.5 py-0.2 rounded text-[10px]">
                              {txn.method === 'bangla_qr' ? 'Bangla QR' : txn.method}
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
                  <p className="text-[11px] text-emerald-200">বাংলা কিউআর, বিকাশ বা নগদ দিয়ে সরাসরি ওয়ালেটে ব্যালেন্স নিন</p>
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

              {/* Step 2: Payment Method Choice */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  পেমেন্ট মাধ্যম বেছে নিন: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'bangla_qr', name: 'বাংলা কিউআর', sub: 'সার্বজনীন QR', popular: true },
                    { id: 'bkash', name: 'বিকাশ', sub: 'bKash App' },
                    { id: 'nagad', name: 'নগদ', sub: 'Nagad App' },
                    { id: 'bank', name: 'ব্যাংক', sub: 'Bank Transfer' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDepositMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                        depositMethod === m.id
                          ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m.popular && (
                        <span className="absolute -top-1.5 right-1.5 bg-red-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full">
                          অনুমোদিত
                        </span>
                      )}
                      <div className="font-bold text-slate-900 text-xs">{m.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Instructions & Details for Chosen Method */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                {depositMethod === 'bangla_qr' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <span className="text-[10px] font-black text-red-600 uppercase tracking-wider block">
                          বাংলাদেশ ব্যাংক অনুমোদিত সার্বজনীন বাংলা কিউআর
                        </span>
                        <div className="font-bold text-slate-900 text-xs mt-0.5">মার্চেন্ট: বাংলা বাজার (Bangla Bazar)</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsQrStandeeModalOpen(true)}
                        className="text-[10px] font-bold text-slate-700 bg-white hover:bg-slate-100 px-2 py-1 rounded-md border border-slate-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-slate-600" />
                        <span>স্ট্যান্ডি</span>
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      {/* Clean cropped QR Image */}
                      <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs shrink-0 text-center">
                        <img
                          src="/assets/bangla_qr_code.png"
                          alt="Bangla QR Code"
                          className="w-28 h-28 object-contain mx-auto"
                        />
                        <span className="text-[9px] font-bold text-slate-400 block mt-1">ক্যামেরা দিয়ে স্ক্যান করুন</span>
                      </div>

                      <div className="space-y-2 flex-1 text-[11px] w-full">
                        <div className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-500">টালিপে নম্বর:</span>
                          <div className="flex items-center gap-1">
                            <strong className="font-mono text-red-700 text-xs font-black">01929-637253</strong>
                            <button
                              type="button"
                              onClick={() => copyToClipboard('01929637253', 'মার্চেন্ট নম্বর')}
                              className="px-1.5 py-0.5 bg-red-600 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              কপি
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-1.5 bg-white rounded-lg border border-slate-200">
                          <span className="text-slate-500">প্রদেয় টাকা:</span>
                          <div className="flex items-center gap-1">
                            <strong className="font-mono text-emerald-700 text-xs font-black">৳{depositAmount || '0'}</strong>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(depositAmount, 'টাকা')}
                              className="px-1.5 py-0.5 bg-slate-800 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              কপি
                            </button>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-tight">
                          বিকাশ, নগদ, রকেট, সেলফিন বা যেকোনো ব্যাংকের অ্যাপ খুলে QR স্ক্যান করে টাকা পাঠান।
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {depositMethod === 'bkash' && (
                  <div className="space-y-2">
                    <div className="font-bold text-pink-700 text-xs flex items-center justify-between">
                      <span>বিকাশ মার্চেন্ট / পার্সোনাল নম্বর:</span>
                      <div className="flex items-center gap-1">
                        <strong className="font-mono text-sm text-pink-800">01929-637253</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('01929637253', 'বিকাশ নম্বর')}
                          className="px-2 py-0.5 bg-pink-600 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          কপি
                        </button>
                      </div>
                    </div>
                    <p className="text-[10.5px] text-slate-600">
                      বিকাশ অ্যাপ থেকে <strong>"Send Money"</strong> বা <strong>"Payment"</strong> করে ৳{depositAmount} পাঠান।
                    </p>
                  </div>
                )}

                {depositMethod === 'nagad' && (
                  <div className="space-y-2">
                    <div className="font-bold text-orange-700 text-xs flex items-center justify-between">
                      <span>নগদ নম্বর:</span>
                      <div className="flex items-center gap-1">
                        <strong className="font-mono text-sm text-orange-800">01929-637253</strong>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('01929637253', 'নগদ নম্বর')}
                          className="px-2 py-0.5 bg-orange-600 text-white rounded text-[10px] font-bold cursor-pointer"
                        >
                          কপি
                        </button>
                      </div>
                    </div>
                    <p className="text-[10.5px] text-slate-600">
                      নগদ অ্যাপ থেকে সেন্ড মানি বা ক্যাশ আউট করে ৳{depositAmount} প্রদান করুন।
                    </p>
                  </div>
                )}

                {depositMethod === 'bank' && (
                  <div className="space-y-2 text-[11px] bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="font-bold text-slate-900">ব্যাংক ট্রান্সফার তথ্য:</div>
                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>ব্যাংক: <strong>City Bank PLC</strong></div>
                      <div>হিসাব নাম: <strong>Bangla Bazar</strong></div>
                      <div>হিসাব নম্বর: <strong className="font-mono text-emerald-700">1102938472001</strong></div>
                      <div>শাখা: <strong>Banani Branch, Dhaka</strong></div>
                    </div>
                  </div>
                )}
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
                  <p className="text-[11px] text-slate-300">আপনার ওয়ালেটের টাকা বিকাশ, নগদ বা ব্যাংক একাউন্টে নিন</p>
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

              {/* Withdraw Method */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  টাকা গ্রহণের মাধ্যম: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'bkash', name: 'বিকাশ (bKash)' },
                    { id: 'nagad', name: 'নগদ (Nagad)' },
                    { id: 'rocket', name: 'রকেট (Rocket)' },
                    { id: 'bank', name: 'ব্যাংক হিসাব' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setWithdrawMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        withdrawMethod === m.id
                          ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-xs">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {withdrawMethod === 'bank' ? 'ব্যাংক হিসাব নম্বর' : 'মোবাইল অ্যাকাউন্ট নম্বর'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  placeholder={withdrawMethod === 'bank' ? 'যেমন: 1102938472001' : '01XXXXXXXXX'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              {/* Bank-specific Fields */}
              {withdrawMethod === 'bank' && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ব্যাংকের নাম (Bank Name) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={withdrawBankName}
                      onChange={(e) => setWithdrawBankName(e.target.value)}
                      placeholder="যেমন: Islami Bank / City Bank / BRAC Bank"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        হিসাবধারীর নাম (Account Holder)
                      </label>
                      <input
                        type="text"
                        value={withdrawAccountHolder}
                        onChange={(e) => setWithdrawAccountHolder(e.target.value)}
                        placeholder="আপনার নাম"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        শাখার নাম (Branch)
                      </label>
                      <input
                        type="text"
                        value={withdrawBranch}
                        onChange={(e) => setWithdrawBranch(e.target.value)}
                        placeholder="যেমন: বনানী শাখা"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}

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

      {/* 5. FULL BANGLA QR STANDEE PREVIEW MODAL */}
      {isQrStandeeModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsQrStandeeModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 relative flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
              <div>
                <h4 className="font-black text-sm">বাংলাদেশ ব্যাংক সার্বজনীন বাংলা কিউআর</h4>
                <p className="text-[11px] text-red-100">মার্চেন্ট: বাংলা বাজার • টালিপে নম্বর: 01929-637253</p>
              </div>
              <button
                type="button"
                onClick={() => setIsQrStandeeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex flex-col items-center text-center space-y-3">
              <img
                src="/assets/bangla_qr_card.png"
                alt="Bangla QR Standee"
                className="max-h-[60vh] w-auto object-contain rounded-xl border border-slate-200 shadow-md"
              />
              <div className="flex items-center gap-2 w-full pt-1">
                <a
                  href="/assets/bangla_qr_card.png"
                  download="Bangla_Bazar_BanglaQR_Standee.png"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>স্ট্যান্ডি ছবি ডাউনলোড</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsQrStandeeModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
