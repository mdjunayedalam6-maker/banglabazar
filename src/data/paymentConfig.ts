import { WalletPaymentMethod } from '../types';

export type PersonalSendMoneyMethod = 'nagad' | 'bkash' | 'upay';

export interface PersonalPaymentAccount {
  id: PersonalSendMoneyMethod;
  nameBn: string;
  nameEn: string;
  accountTypeBn: string;
  accountTypeEn: string;
  actionTypeBn: string;
  actionTypeEn: string;
  number: string;
  formattedNumber: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  activeCardClass: string;
  badgeClass: string;
  buttonClass: string;
}

export const PERSONAL_PAYMENT_ACCOUNTS: PersonalPaymentAccount[] = [
  {
    id: 'nagad',
    nameBn: 'নগদ',
    nameEn: 'Nagad',
    accountTypeBn: 'পার্সোনাল',
    accountTypeEn: 'Personal',
    actionTypeBn: 'সেন্ড মানি',
    actionTypeEn: 'Send Money',
    number: '01929637253',
    formattedNumber: '01929-637253',
    accentBg: 'bg-orange-50',
    accentText: 'text-orange-700',
    accentBorder: 'border-orange-200',
    activeCardClass: 'border-orange-500 bg-orange-50/70 ring-1 ring-orange-500',
    badgeClass: 'bg-orange-600 text-white',
    buttonClass: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
  {
    id: 'bkash',
    nameBn: 'বিকাশ',
    nameEn: 'bKash',
    accountTypeBn: 'পার্সোনাল',
    accountTypeEn: 'Personal',
    actionTypeBn: 'সেন্ড মানি',
    actionTypeEn: 'Send Money',
    number: '01929637253',
    formattedNumber: '01929-637253',
    accentBg: 'bg-pink-50',
    accentText: 'text-pink-700',
    accentBorder: 'border-pink-200',
    activeCardClass: 'border-pink-600 bg-pink-50/70 ring-1 ring-pink-600',
    badgeClass: 'bg-pink-600 text-white',
    buttonClass: 'bg-pink-600 hover:bg-pink-700 text-white',
  },
  {
    id: 'upay',
    nameBn: 'উপায়',
    nameEn: 'Upay',
    accountTypeBn: 'পার্সোনাল',
    accountTypeEn: 'Personal',
    actionTypeBn: 'সেন্ড মানি',
    actionTypeEn: 'Send Money',
    number: '01929637253',
    formattedNumber: '01929-637253',
    accentBg: 'bg-sky-50',
    accentText: 'text-sky-700',
    accentBorder: 'border-sky-200',
    activeCardClass: 'border-sky-600 bg-sky-50/70 ring-1 ring-sky-600',
    badgeClass: 'bg-sky-600 text-white',
    buttonClass: 'bg-sky-600 hover:bg-sky-700 text-white',
  },
];

export const getPersonalPaymentAccount = (
  method: PersonalSendMoneyMethod
): PersonalPaymentAccount => {
  return (
    PERSONAL_PAYMENT_ACCOUNTS.find((m) => m.id === method) || PERSONAL_PAYMENT_ACCOUNTS[0]
  );
};

export interface MobileWithdrawMethod {
  id: WalletPaymentMethod;
  nameBn: string;
  nameEn: string;
  shortLabel: string;
}

export const WITHDRAW_MOBILE_BANKS: MobileWithdrawMethod[] = [
  { id: 'bkash', nameBn: 'বিকাশ', nameEn: 'bKash', shortLabel: 'বিকাশ (bKash)' },
  { id: 'nagad', nameBn: 'নগদ', nameEn: 'Nagad', shortLabel: 'নগদ (Nagad)' },
  { id: 'upay', nameBn: 'উপায়', nameEn: 'Upay', shortLabel: 'উপায় (Upay)' },
  { id: 'rocket', nameBn: 'রকেট', nameEn: 'Rocket', shortLabel: 'রকেট (Rocket)' },
  { id: 'cellfin', nameBn: 'সেলফিন', nameEn: 'CellFin', shortLabel: 'সেলফিন (CellFin)' },
  { id: 'tap', nameBn: 'ট্যাপ', nameEn: 'Tap', shortLabel: 'ট্যাপ (Tap)' },
  { id: 'okwallet', nameBn: 'ওকে ওয়ালেট', nameEn: 'OK Wallet', shortLabel: 'ওকে ওয়ালেট' },
  { id: 'mcash', nameBn: 'এমক্যাশ', nameEn: 'mCash', shortLabel: 'এমক্যাশ (mCash)' },
  { id: 'surecash', nameBn: 'শিওরক্যাশ', nameEn: 'SureCash', shortLabel: 'শিওরক্যাশ' },
  { id: 'other_mfs', nameBn: 'অন্যান্য মোবাইল ব্যাংক', nameEn: 'Other Mobile Bank', shortLabel: 'অন্যান্য MFS' },
];

export const getPaymentMethodDisplayLabel = (
  method?: string,
  language: 'bn' | 'en' = 'bn',
  customName?: string
): string => {
  switch (method) {
    case 'nagad':
      return language === 'bn' ? 'নগদ (পার্সোনাল · সেন্ড মানি)' : 'Nagad (Personal Send Money)';
    case 'bkash':
      return language === 'bn' ? 'বিকাশ (পার্সোনাল · সেন্ড মানি)' : 'bKash (Personal Send Money)';
    case 'upay':
      return language === 'bn' ? 'উপায় (পার্সোনাল · সেন্ড মানি)' : 'Upay (Personal Send Money)';
    case 'rocket':
      return language === 'bn' ? 'রকেট (Rocket)' : 'Rocket';
    case 'cellfin':
      return language === 'bn' ? 'সেলফিন (CellFin)' : 'CellFin';
    case 'tap':
      return language === 'bn' ? 'ট্যাপ (Tap)' : 'Tap';
    case 'okwallet':
      return language === 'bn' ? 'ওকে ওয়ালেট (OK Wallet)' : 'OK Wallet';
    case 'mcash':
      return language === 'bn' ? 'এমক্যাশ (mCash)' : 'mCash';
    case 'surecash':
      return language === 'bn' ? 'শিওরক্যাশ (SureCash)' : 'SureCash';
    case 'other_mfs':
      return customName?.trim() || (language === 'bn' ? 'অন্যান্য মোবাইল ব্যাংক' : 'Other Mobile Bank');
    case 'wallet':
      return language === 'bn' ? 'অ্যাকাউন্ট ব্যালেন্স' : 'Account Balance';
    case 'cod':
      return language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery';
    case 'bangla_qr':
      return 'Bangla QR';
    case 'bank':
      return language === 'bn' ? 'ব্যাংক অ্যাকাউন্ট' : 'Bank Account';
    case 'system':
      return language === 'bn' ? 'সিস্টেম / বোনাস' : 'System / Bonus';
    default:
      return method || '—';
  }
};
