import { SiteSettings, AdminBannerSlide, CustomerRuleNotice } from '../types';
import fashionBannerImg from '../assets/images/banner_festive_fashion_1794884629707.jpg';
import techBannerImg from '../assets/images/banner_smart_tech_1794884631007.jpg';
import homeBannerImg from '../assets/images/banner_home_living_1794884630792.jpg';
import bagsJewelryBannerImg from '../assets/images/banner_bags_jewelry_1794884631748.jpg';
import winterBannerImg from '../assets/images/banner_winter_flash_1794884632066.jpg';

export const DEFAULT_CUSTOMER_NOTICES: CustomerRuleNotice[] = [
  {
    id: 'notice-affiliate-2-percent',
    category: 'rule',
    isPinned: true,
    titleBn: 'প্রোডাক্ট শেয়ার করে ২% কমিশন আয়ের নিয়মাবলী',
    titleEn: '2% Product Share Commission Rules',
    contentBn:
      '১. প্রথমে আপনার অ্যাকাউন্টে লগইন করে যেকোনো পণ্যের পেজ বা প্রোফাইলের "শেয়ার ও রেফার আয়" অংশ থেকে আপনার ইউনিক শেয়ার লিংক (?product=...&aff=...) কপি করুন।\n' +
      '২. সেই লিংক ফেসবুক, হোয়াটসঅ্যাপ, মেসেঞ্জার বা যেকোনো মাধ্যমে বন্ধু বা ক্রেতাদের সাথে শেয়ার করুন।\n' +
      '৩. আপনার একটি লিংক থেকে যতজন মানুষ পণ্য অর্ডার করবে (যেমন ৫ জন বা তার বেশি), প্রত্যেকের পণ্যের মূল্যের ২% করে আলাদা কমিশন আপনার হিসাবের খাতায় যুক্ত হবে।\n' +
      '৪. কাস্টমার পণ্য হাতে পেয়ে অর্ডার সম্পূর্ণ (Delivered) হলে কমিশনের টাকা অটোমেটিক আপনার ওয়ালেট ব্যালেন্সে যোগ হয়ে যাবে।',
    createdAt: '2026-11-23T06:00:00.000Z',
  },
  {
    id: 'condition-cancel-self-order',
    category: 'condition',
    isPinned: true,
    titleBn: 'কমিশন বাতিল, কর্তন ও সেলফ-অর্ডার সংক্রান্ত শর্তাবলী',
    titleEn: 'Commission Reversal & Self-Order Conditions',
    contentBn:
      '• অর্ডার দেওয়ার পর কাস্টমার অর্ডার বাতিল (Cancel) করলে বা রিটার্ন করলে উক্ত অর্ডারের ২% কমিশন আপনার অ্যাকাউন্ট/ওয়ালেট থেকে অটোমেটিক কেটে নেওয়া হবে।\n' +
      '• ডেলিভারি চার্জের ওপর কোনো কমিশন প্রযোজ্য নয় — শুধুমাত্র প্রোডাক্টের দামের (Product Subtotal) ওপর ২% কমিশন হিসাব করা হবে।\n' +
      '• নিজের শেয়ার করা লিংক ব্যবহার করে নিজে অর্ডার করলে (Self-Order) কমিশন যুক্ত হবে না। শুধুমাত্র অন্য ক্রেতার সম্পন্ন করা অর্ডারেই কমিশন কার্যকর হবে।',
    createdAt: '2026-11-23T05:30:00.000Z',
  },
  {
    id: 'rule-referral-welcome-bonus',
    category: 'rule',
    isPinned: false,
    titleBn: 'বন্ধু রেফার (৳৩০) ও ওয়েলকাম বোনাস (৳৫০) নিয়ম',
    titleEn: 'Friend Referral & Welcome Bonus Rules',
    contentBn:
      '• নতুন গ্রাহক হিসেবে রেজিস্ট্রেশন করলে আপনার অ্যাকাউন্টে ৳৫০ ওয়েলকাম বোনাস আনলক করার সুযোগ থাকে (১ম অর্ডার সম্পন্ন হওয়ার পর ২য় অর্ডারে ব্যবহারযোগ্য)।\n' +
      '• আপনার প্রোফাইলের BB-XXXXXX রেফার কোড বা লিংক দিয়ে কোনো বন্ধু অ্যাকাউন্ট খুলে তার ১ম অর্ডার সম্পন্ন করলে আপনি প্রতি বন্ধুর জন্য ৳৩০ রেফার বোনাস পাবেন।',
    createdAt: '2026-11-23T05:00:00.000Z',
  },
  {
    id: 'notice-wallet-withdraw-payment',
    category: 'notice',
    isPinned: false,
    titleBn: 'পেমেন্ট, ওয়ালেট রিচার্জ ও টাকা উত্তোলনের জরুরি নোটিশ',
    titleEn: 'Payment, Wallet Top-Up & Withdrawal Notice',
    contentBn:
      '• অর্ডার করার সময় আপনি ক্যাশ অন ডেলিভারি অথবা ওয়ালেট ব্যালেন্স দিয়ে সরাসরি পেমেন্ট করতে পারবেন।\n' +
      '• ওয়ালেটে পর্যাপ্ত টাকা না থাকলে বিকাশ, নগদ বা উপায় থেকে 01929637253 (পার্সোনাল) নম্বরে Send Money করে TrxID সাবমিট করে টাকা অ্যাড করতে পারবেন।\n' +
      '• প্রোডাক্ট শেয়ার ও রেফার থেকে আয় করা টাকা দিয়ে কেনাকাটা করতে পারবেন অথবা ওয়ালেট থেকে সর্বনিম্ন ৳৫০ হলে বিকাশ, নগদ, উপায় বা রকেটে ক্যাশআউট/উত্তোলন রিকোয়েস্ট পাঠাতে পারবেন।',
    createdAt: '2026-11-23T04:30:00.000Z',
  },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  primaryColor: '#00873E',
  accentColor: '#DC2626',
  themePreset: 'classic',
  showAnnouncementBar: false,
  announcementTextBn: '',
  announcementTextEn: '',
  hotlineNumber: '01929637253',
  freeShippingThreshold: 2000,
  shippingFeeInsideDhaka: 60,
  shippingFeeOutsideDhaka: 120,
  shippingFeeExpress: 150,
  enableFreeShipping: true,
  deliveryNoteBn: 'ঢাকার ভেতরে 60 টাকা, ঢাকার বাইরে 120 টাকা (৳2000 এর বেশি অর্ডারে ফ্রি ডেলিভারি)',
  taglineBn: 'সেরা অনলাইন মার্কেটপ্লেস',
  taglineEn: 'Your Trusted Online Marketplace',
  adminPin: '123456',
  layoutStyle: 'modern',
  whatsappLink: 'https://wa.me/1234567890',
  facebookLink: 'https://facebook.com',
  instagramLink: 'https://instagram.com',
  messengerLink: 'https://m.me/yourpage',
  imoLink: 'https://imo.im',
  youtubeLink: 'https://youtube.com',
  tiktokLink: 'https://tiktok.com',
  appDownloadUrl: '',
  appNameBn: 'বাংলা বাজার মোবাইল অ্যাপ',
  appSubtitleBn: 'সহজ ও দ্রুত কেনাকাটায় সরাসরি ডাউনলোড ও ইনস্টল করুন',
  globalProfitMargin: 5,
  shopbaseConfig: {
    connected: true,
    accountNumber: '01929637253',
    password: 'junaid$#',
    profitMargin: 5,
    autoSync: true,
    autoForwardOrders: true,
    lastSyncTime: 'আজকের লাইভ সিঙ্ক সফল (১৩,৭১৬টি পণ্য যুক্ত)',
    totalSyncedProducts: 13716,
  },
  customerNotices: DEFAULT_CUSTOMER_NOTICES,
};

export const DEFAULT_BANNER_SLIDES: AdminBannerSlide[] = [
  {
    id: 'slide-fashion-2026',
    badgeBn: 'নতুন কালেকশন',
    badgeEn: 'New Collection',
    titleBn: 'উৎসবের সেরা শাড়ি ও পাঞ্জাবি কালেকশন',
    titleEn: 'Signature Silk Saree & Panjabi Collection',
    subtitleBn: 'আভিজাত্য ও আরামের নিখুঁত সমন্বয়ে হাতে বাছাই করা এক্সক্লুসিভ পোশাক',
    subtitleEn: 'Handpicked ethnic wear crafted for comfort and timeless elegance.',
    discountTextBn: 'বিশেষ ছাড়',
    discountTextEn: 'Special Offer',
    btnTextBn: 'কালেকশন দেখুন',
    btnTextEn: 'Explore Collection',
    categoryTarget: 'womens-clothing',
    image: fashionBannerImg,
    accentColor: 'from-emerald-600 to-emerald-700',
    showTextOverlay: true,
  },
  {
    id: 'slide-tech-2026',
    badgeBn: 'স্মার্ট টেক গ্যালারি',
    badgeEn: 'Smart Tech Gallery',
    titleBn: 'স্মার্ট গ্যাজেট ও প্রিমিয়াম অডিও গিয়ার',
    titleEn: 'Flagship Gadgets & Studio Audio',
    subtitleBn: 'অরিজিনাল স্মার্টওয়াচ, ওয়্যারলেস হেডফোন ও দৈনন্দিন টেক অ্যাক্সেসরিজ',
    subtitleEn: 'Precision smartwatches, wireless audio and everyday tech essentials.',
    discountTextBn: '১০০% অরিজিনাল',
    discountTextEn: '100% Authentic',
    btnTextBn: 'গ্যাজেট দেখুন',
    btnTextEn: 'Shop Electronics',
    categoryTarget: 'electronics-gadgets',
    image: techBannerImg,
    accentColor: 'from-slate-700 to-slate-900',
    showTextOverlay: true,
  },
  {
    id: 'slide-home-2026',
    badgeBn: 'হোম অ্যান্ড লিভিং',
    badgeEn: 'Home & Living',
    titleBn: 'আপনার ঘরের জন্য আরামদায়ক হোম টেক্সটাইল',
    titleEn: 'Calm & Modern Home Essentials',
    subtitleBn: 'প্রিমিয়াম কটন বেডশীট, কম্ফর্টার ও আধুনিক গৃহসজ্জার সমাহার',
    subtitleEn: 'Breathable cotton bedding, comforters and curated home decor.',
    discountTextBn: 'ফ্রি ডেলিভারি সুবিধা',
    discountTextEn: 'Fast Delivery',
    btnTextBn: 'হোম কালেকশন দেখুন',
    btnTextEn: 'Shop Home Living',
    categoryTarget: 'home-living',
    image: homeBannerImg,
    accentColor: 'from-emerald-600 to-teal-700',
    showTextOverlay: true,
  },
  {
    id: 'slide-bags-2026',
    badgeBn: 'স্টাইল অ্যাক্সেসরিজ',
    badgeEn: 'Style & Accessories',
    titleBn: 'আধুনিক ব্যাগ, জুয়েলারি ও বিউটি কেয়ার',
    titleEn: 'Curated Handbags, Jewelry & Beauty',
    subtitleBn: 'প্রতিদিনের ব্যবহার ও বিশেষ অনুষ্ঠানের জন্য নান্দনিক সব সংগ্রহ',
    subtitleEn: 'Minimalist leather totes, statement jewelry and daily essentials.',
    discountTextBn: 'সেরা মানের নিশ্চয়তা',
    discountTextEn: 'Curated Quality',
    btnTextBn: 'অ্যাক্সেসরিজ দেখুন',
    btnTextEn: 'Explore Accessories',
    categoryTarget: 'bag-collection',
    image: bagsJewelryBannerImg,
    accentColor: 'from-amber-600 to-amber-700',
    showTextOverlay: true,
  },
  {
    id: 'slide-winter-2026',
    badgeBn: 'উইন্টার স্পেশাল',
    badgeEn: 'Winter Essentials',
    titleBn: 'প্রিমিয়াম হুডি, জ্যাকেট ও সোয়েটার কালেকশন',
    titleEn: 'Heavyweight Hoodies, Jackets & Knitwear',
    subtitleBn: 'সারা দেশে ক্যাশ অন ডেলিভারিতে স্টাইলিশ উইন্টার ওয়্যার',
    subtitleEn: 'Warm, structured winter layers delivered across Bangladesh.',
    discountTextBn: 'নতুন অ্যারাইভাল',
    discountTextEn: 'New Arrivals',
    btnTextBn: 'উইন্টার কালেকশন দেখুন',
    btnTextEn: 'Shop Winterwear',
    categoryTarget: 'winter-collection',
    image: winterBannerImg,
    accentColor: 'from-emerald-700 to-slate-900',
    showTextOverlay: true,
  },
];
