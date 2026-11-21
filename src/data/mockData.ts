import { Category, Product, Order, User } from '../types';
import { SHOPBASE_ALL_PRODUCTS } from './shopbaseProducts';

import catWomensImg from '../assets/images/cat_womens_fashion_1794884632485.jpg';
import catMensImg from '../assets/images/cat_mens_fashion_1794884632766.jpg';
import catBabyImg from '../assets/images/cat_baby_collection_1794884633393.jpg';
import catCoupleImg from '../assets/images/cat_couple_combo_1794884634134.jpg';
import catHomeImg from '../assets/images/cat_home_living_1794884634327.jpg';
import catBagImg from '../assets/images/cat_bag_collection_1794884634140.jpg';
import catJewelryImg from '../assets/images/cat_jewelry_accessories_1794884634611.jpg';
import catElectronicsImg from '../assets/images/cat_electronics_gadgets_1794884635649.jpg';
import catWinterImg from '../assets/images/cat_winter_collection_1794884636369.jpg';
import catSeasonalImg from '../assets/images/cat_seasonal_products_1794884636172.jpg';
import catOtherImg from '../assets/images/cat_other_categories_1794884636754.jpg';

export const CATEGORIES: Category[] = [
  {
    id: 'womens-clothing',
    nameBn: 'মেয়েদের পোশাক',
    nameEn: "Women's Clothing",
    slug: 'womens-clothing',
    iconName: 'Sparkles',
    image: catWomensImg,
    itemCount: 3550,
    featured: true,
    subcategories: [
      { id: 'saree', nameBn: 'শাড়ি', nameEn: 'Saree', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1691436424.png' },
      { id: 'tanter-saree', nameBn: 'তাঁতের শাড়ী', nameEn: 'Tanter Saree', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1738399069.png' },
      { id: 'handprint-saree', nameBn: 'হ্যান্ডপ্রিন্ট শাড়ি', nameEn: 'Handprint Saree', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1738402885.png' },
      { id: 'indian-saree', nameBn: 'ইন্ডিয়ান শাড়ী', nameEn: 'Indian Saree', image: catWomensImg },
      { id: 'three-piece', nameBn: 'রেডিমেড থ্রিপিস', nameEn: 'Readymade Three-Piece', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1691436552.png' },
      { id: 'unstitched-threepiece', nameBn: 'আনস্টিজ থ্রিপিস', nameEn: 'Unstitched Three-Piece', image: catWomensImg },
      { id: 'gown-kurti', nameBn: 'গাউন & কুর্তি', nameEn: 'Gown & Kurti', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1696259740.jpg' },
      { id: 'lehenga-party', nameBn: 'লেহেঙ্গা & পার্টি', nameEn: 'Lehenga & Party Wear', image: catWomensImg },
      { id: 'borka-abaya', nameBn: 'বোরকা', nameEn: 'Borka & Abaya', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1696260414.png' },
      { id: 'hijab-niqab', nameBn: 'হিজাব & নিকাব', nameEn: 'Hijab & Niqab', image: catWomensImg },
      { id: 'sunnati-dress', nameBn: 'সুন্নাতি ড্রেস', nameEn: 'Sunnati Dress', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1738404195.png' },
      { id: 'inner-nighty', nameBn: 'ইনার & নাইটি', nameEn: 'Inner & Nighty', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1696256243.png' },
      { id: 'western-dress', nameBn: 'ওয়েস্টার্ন ড্রেস', nameEn: 'Western Dress', image: catWomensImg },
    ]
  },
  {
    id: 'mens-clothing',
    nameBn: 'ছেলেদের পোশাক',
    nameEn: "Men's Clothing",
    slug: 'mens-clothing',
    iconName: 'Shirt',
    image: catMensImg,
    itemCount: 3490,
    featured: true,
    subcategories: [
      { id: 'polo-shirts', nameBn: 'পলো শার্ট', nameEn: 'Polo Shirts', image: 'https://shopbasebd.com/public/uploads/shop/products/1789381529_L_5.jpeg' },
      { id: 'dropshoulder-tshirt', nameBn: 'ড্রপসোল্ডার টিশার্ট', nameEn: 'Drop Shoulder T-Shirts', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1769500397.png' },
      { id: 'basic-tshirt', nameBn: 'বেসিক টিশার্ট', nameEn: 'Basic T-Shirts', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1769500295.png' },
      { id: 'long-sleeve-tshirt', nameBn: 'লং-স্লীভ টিশার্ট', nameEn: 'Long Sleeve T-Shirts', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1769500733.png' },
      { id: 'printed-shirt', nameBn: 'প্রিন্ট শার্ট', nameEn: 'Printed Shirts', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1696174388.png' },
      { id: 'solid-shirt', nameBn: 'সলিড শার্ট', nameEn: 'Solid Shirts', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1769500890.png' },
      { id: 'check-shirt', nameBn: 'চেক শার্ট', nameEn: 'Check Shirts', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1769501420.png' },
      { id: 'shirt-combo', nameBn: 'শার্ট কম্বো', nameEn: 'Shirt Combo', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1738389025.png' },
      { id: 'short-combo', nameBn: 'শর্ট কম্বো', nameEn: 'Short Combo', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1696173751.png' },
      { id: 'half-sleeve-set', nameBn: 'হাফ স্লিভ সেট', nameEn: 'Half Sleeve Set', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1760424071.png' },
      { id: 'long-sleeve-set', nameBn: 'লং স্লিভ সেট', nameEn: 'Long Sleeve Set', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1760424294.png' },
      { id: 'embroidery-panjabi', nameBn: 'এমব্রো. পাঞ্জাবি', nameEn: 'Embroidery Panjabi', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1738393868.png' },
      { id: 'print-panjabi', nameBn: 'প্রিন্ট পাঞ্জাবি', nameEn: 'Print Panjabi', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1738394140.png' },
      { id: 'panjabi-combo', nameBn: 'পাঞ্জাবি কম্বো', nameEn: 'Panjabi Combo', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1709743708.jpeg' },
      { id: 'katua', nameBn: 'কাতুয়া', nameEn: 'Katua', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1789034416.png' },
      { id: 'jeans-pant', nameBn: 'প্যান্ট+ট্রাউজার', nameEn: 'Pants & Trousers', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1760525585.png' },
    ]
  },
  {
    id: 'baby-collection',
    nameBn: 'বেবি কালেকশন',
    nameEn: 'Baby Collection',
    slug: 'baby-collection',
    iconName: 'Smile',
    image: catBabyImg,
    itemCount: 1196,
    featured: true,
    subcategories: [
      { id: 'boys-tshirt-set', nameBn: 'বয়েজ টিশার্ট সেট', nameEn: 'Boys T-Shirt Set', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1769590419.png' },
      { id: 'girls-tshirt-set', nameBn: 'গার্লস টিশার্ট সেট', nameEn: 'Girls T-Shirt Set', image: catBabyImg },
      { id: 'baby-winter-dress', nameBn: 'বেবি উইন্টার ড্রেসসমূহ', nameEn: 'Baby Winter Dresses', image: catBabyImg },
      { id: 'pari-dress', nameBn: 'পরী ড্রেস', nameEn: 'Pari Dress', image: catBabyImg },
      { id: 'baby-toys', nameBn: 'খেলনা & দোলনা', nameEn: 'Toys & Swings', image: catBabyImg },
      { id: 'baby-winter-accessories', nameBn: 'বেবি উইন্টার এক্সেসরিজ', nameEn: 'Baby Winter Accessories', image: catBabyImg },
      { id: 'baby-kameez', nameBn: 'বেবি কামিজ', nameEn: 'Baby Kameez', image: catBabyImg },
      { id: 'baby-borka', nameBn: 'বেবি বোরখা', nameEn: 'Baby Borka', image: catBabyImg },
      { id: 'baby-shirt', nameBn: 'বেবি শার্ট', nameEn: 'Baby Shirt', image: catBabyImg },
      { id: 'kids-pant', nameBn: 'কিডস প্যান্ট', nameEn: 'Kids Pants', image: catBabyImg },
    ]
  },
  {
    id: 'couple-combo',
    nameBn: 'কাপল এন্ড কম্বো',
    nameEn: 'Couple & Combo',
    slug: 'couple-combo',
    iconName: 'Heart',
    image: catCoupleImg,
    itemCount: 898,
    featured: true,
    subcategories: [
      { id: 'couple-saree', nameBn: 'কাপল শাড়ী', nameEn: 'Couple Saree', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1691436695.png' },
      { id: 'couple-threepiece', nameBn: 'কাপল থ্রীপিস', nameEn: 'Couple Three-Piece', image: catCoupleImg },
      { id: 'tshirt-skirt', nameBn: 'টিশার্ট & স্কার্ট', nameEn: 'T-Shirt & Skirt Combo', image: catCoupleImg },
      { id: 'sharee-combo', nameBn: 'শাড়ী কম্বো', nameEn: 'Saree Combo', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1691436695.png' },
    ]
  },
  {
    id: 'home-living',
    nameBn: 'গৃহ সামগ্রী',
    nameEn: 'Home & Living',
    slug: 'home-living',
    iconName: 'Home',
    image: catHomeImg,
    itemCount: 978,
    featured: true,
    subcategories: [
      { id: 'bedsheet', nameBn: 'রেগুলার বেডশীট', nameEn: 'Regular Bedsheets', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1788866862.jpeg' },
      { id: 'waterproof-bedsheet', nameBn: 'ওয়াটারপ্রুফ বেডশিট', nameEn: 'Waterproof Bedsheet', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1788866862.jpeg' },
      { id: 'regular-dining', nameBn: 'রেগুলার ডাইনিং', nameEn: 'Regular Dining', image: catHomeImg },
      { id: 'waterproof-dining', nameBn: 'ওয়াটারপ্রুফ ডাইনিং', nameEn: 'Waterproof Dining', image: catHomeImg },
      { id: 'comforter', nameBn: 'কম্ফর্টার', nameEn: 'Comforter', image: catHomeImg },
      { id: 'ac-katha', nameBn: 'এসি কাথা', nameEn: 'AC Katha', image: catHomeImg },
      { id: 'home-decor', nameBn: 'গৃহ সজ্জা', nameEn: 'Home Decor', image: catHomeImg },
      { id: 'home-care', nameBn: 'হোম কেয়ার', nameEn: 'Home Care', image: catHomeImg },
    ]
  },
  {
    id: 'bag-collection',
    nameBn: 'ব্যাগ কালেকশন',
    nameEn: 'Bag Collection',
    slug: 'bag-collection',
    iconName: 'ShoppingBag',
    image: catBagImg,
    itemCount: 603,
    featured: true,
    subcategories: [
      { id: 'girls-bag', nameBn: 'মেয়েদের ব্যাগ', nameEn: 'Girls Handbag', image: catBagImg },
      { id: 'purse-bag', nameBn: 'পার্স ব্যাগ', nameEn: 'Purse & Wallets', image: catBagImg },
      { id: 'boys-bag', nameBn: 'ছেলেদের ব্যাগ', nameEn: 'Boys Bag', image: catBagImg },
      { id: 'carry-bag', nameBn: 'ক্যারি ব্যাগ', nameEn: 'Carry Bag', image: catBagImg },
    ]
  },
  {
    id: 'jewelry-accessories',
    nameBn: 'জুয়েলারি এন্ড এক্সেসরিজ',
    nameEn: 'Jewelry & Accessories',
    slug: 'jewelry-accessories',
    iconName: 'Gem',
    image: catJewelryImg,
    itemCount: 615,
    featured: true,
    subcategories: [
      { id: 'clip-band', nameBn: 'ক্লিপ & ব্যান্ড', nameEn: 'Clips & Bands', image: catJewelryImg },
      { id: 'accessories', nameBn: 'এক্সেসরিজ', nameEn: 'Accessories', image: catJewelryImg },
      { id: 'beauty-care', nameBn: 'বিউটি কেয়ার', nameEn: 'Beauty Care', image: catJewelryImg },
      { id: 'natural-care', nameBn: 'ন্যাচারাল কেয়ার', nameEn: 'Natural Care', image: catJewelryImg },
      { id: 'personal-care', nameBn: 'পার্সোনাল কেয়ার', nameEn: 'Personal Care', image: catJewelryImg },
      { id: 'gift-item', nameBn: 'গিফট আইটেম', nameEn: 'Gift Items', image: catJewelryImg },
    ]
  },
  {
    id: 'electronics-gadgets',
    nameBn: 'ইলেকট্রনিক্স এবং গ্যাজেট',
    nameEn: 'Electronics & Gadgets',
    slug: 'electronics-gadgets',
    iconName: 'Smartphone',
    image: catElectronicsImg,
    itemCount: 252,
    featured: true,
    subcategories: [
      { id: 'fan', nameBn: 'ফ্যান', nameEn: 'Fans', image: catElectronicsImg },
      { id: 'watch', nameBn: 'ঘড়ি', nameEn: 'Watch & Smartwatches', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1696174050.png' },
      { id: 'gadgets', nameBn: 'গ্যাজেটস', nameEn: 'Gadgets & Tech', image: catElectronicsImg },
      { id: 'speaker', nameBn: 'স্পিকার', nameEn: 'Speakers & Audio', image: catElectronicsImg },
      { id: 'camera', nameBn: 'ক্যামেরা', nameEn: 'Cameras', image: catElectronicsImg },
    ]
  },
  {
    id: 'winter-collection',
    nameBn: 'শীতের কালেকশন',
    nameEn: 'Winter Collection',
    slug: 'winter-collection',
    iconName: 'Snowflake',
    image: catWinterImg,
    itemCount: 2184,
    featured: true,
    subcategories: [
      { id: 'gents-hoodie', nameBn: 'জেন্টস হুডি', nameEn: 'Gents Hoodie', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1698096670.jpeg' },
      { id: 'hoodie-set', nameBn: 'হুডি সেট', nameEn: 'Hoodie Set', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1698096670.jpeg' },
      { id: 'ladies-hoodie', nameBn: 'লেডিস হুডি', nameEn: 'Ladies Hoodie', image: catWinterImg },
      { id: 'gents-jacket', nameBn: 'জেন্টস জ্যাকেট', nameEn: 'Gents Jacket', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1698097125.png' },
      { id: 'ladies-jacket', nameBn: 'লেডিস জ্যাকেট', nameEn: 'Ladies Jacket', image: catWinterImg },
      { id: 'ladies-overcoat', nameBn: 'লেডিস ওভারকোট', nameEn: 'Ladies Overcoat', image: catWinterImg },
      { id: 'sweater', nameBn: 'সুয়েটার', nameEn: 'Sweater', image: catWinterImg },
      { id: 'sweatshirt-set', nameBn: 'সুইটশার্ট সেট', nameEn: 'Sweatshirt Set', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1698096670.jpeg' },
      { id: 'ladies-winter-accessories', nameBn: 'লেডিস উইন্টার এক্সেসরিজ', nameEn: 'Ladies Winter Accessories', image: catWinterImg },
      { id: 'gents-winter-accessories', nameBn: 'জেন্টস উইন্টার এক্সেসরিজ', nameEn: 'Gents Winter Accessories', image: catWinterImg },
    ]
  },
  {
    id: 'seasonal-products',
    nameBn: 'সিজোনাল প্রোডাক্ট',
    nameEn: 'Seasonal Products',
    slug: 'seasonal-products',
    iconName: 'Calendar',
    image: catSeasonalImg,
    itemCount: 175,
    featured: true,
    subcategories: [
      { id: 'world-cup', nameBn: 'ওয়ার্ল্ড কাপ', nameEn: 'World Cup Collection', image: 'https://shopbasebd.com/public/uploads/shop/category/scategory-1779218008.png' },
      { id: 'umbrella', nameBn: 'ছাতা', nameEn: 'Umbrellas', image: catSeasonalImg },
      { id: 'raincoat', nameBn: 'রেইন কোট', nameEn: 'Raincoats', image: catSeasonalImg },
    ]
  },
  {
    id: 'other-categories',
    nameBn: 'অন্যান্য ক্যাটেগরি',
    nameEn: 'Other Categories',
    slug: 'other-categories',
    iconName: 'Grid',
    image: catOtherImg,
    itemCount: 85,
    featured: true,
    subcategories: [
      { id: 'shoes', nameBn: 'জুতা', nameEn: 'Shoes & Footwear', image: catOtherImg },
      { id: 'toys-sports', nameBn: 'টয়স & স্পোর্টস', nameEn: 'Toys & Sports', image: catOtherImg },
      { id: 'grocery', nameBn: 'মুদি ও খাঁটি পণ্য', nameEn: 'Grocery & Pure Foods', image: catOtherImg },
      { id: 'beauty', nameBn: 'বিউটি ও রূপচর্চা', nameEn: 'Beauty & Personal Care', image: catOtherImg },
      { id: 'books', nameBn: 'বই ও স্টেশনারি', nameEn: 'Books & Stationery', image: catOtherImg },
    ]
  }
];

export const PRODUCTS: Product[] = [
  ...SHOPBASE_ALL_PRODUCTS,
];

export const HERO_SLIDES = [
  {
    id: 'slide-1',
    titleBn: 'গ্র্যান্ড ইলেকট্রনিক্স ফেস্ট 2026',
    subtitleBn: 'স্মার্টফোন, ল্যাপটপ ও স্মার্টওয়াচে 50% পর্যন্ত অবিশ্বাস্য মূল্যছাড়!',
    titleEn: 'Grand Electronics Fest 2026',
    subtitleEn: 'Up to 50% discount on Smartphones, Laptops & Smart Gadgets!',
    buttonTextBn: 'অফারগুলো দেখুন',
    buttonTextEn: 'Explore Deals',
    categoryTarget: 'electronics',
    badgeBn: 'মেগা ডিল',
    badgeEn: 'Mega Deal',
    bgGradient: 'from-[#0A2540] via-[#0F365F] to-[#047857]',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'slide-2',
    titleBn: 'এক্সক্লুসিভ উৎসব ফ্যাশন কালেকশন',
    subtitleBn: 'সেরা ব্র্যান্ডের পাঞ্জাবি, শাড়ি, ক্যাজুয়াল ড্রেস ও ফুটওয়্যারে আকর্ষণীয় ছাড়',
    titleEn: 'Exclusive Festive Fashion Collection',
    subtitleEn: 'Stunning Panjabi, Sarees, Dresses & Footwear from top designer brands',
    buttonTextBn: 'কালেকশন দেখুন',
    buttonTextEn: 'Shop Fashion',
    categoryTarget: 'fashion',
    badgeBn: 'নতুন এসেছে',
    badgeEn: 'New Arrival',
    bgGradient: 'from-[#1E1B4B] via-[#312E81] to-[#D97706]',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'slide-3',
    titleBn: 'সুপার গ্রোসারি বাজার - 1 ঘণ্টায় ডেলিভারি',
    subtitleBn: 'খাঁটি চাল, ডাল, তেল, ফলমূল ও নিত্যপ্রয়োজনীয় গ্রোসারি এখন সরাসরি আপনার দরজায়',
    titleEn: 'Super Grocery - 1 Hour Delivery',
    subtitleEn: 'Pure rice, spices, organic staples & fresh groceries delivered to your door',
    buttonTextBn: 'বাজার করুন',
    buttonTextEn: 'Order Grocery',
    categoryTarget: 'grocery',
    badgeBn: 'এক্সপ্রেস ডেলিভারি',
    badgeEn: 'Express Delivery',
    bgGradient: 'from-[#064E3B] via-[#047857] to-[#0F172A]',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&auto=format&fit=crop&q=80',
  },
];

export const BRANDS = [
  { name: 'Samsung', logo: 'SAMSUNG', productsCount: '150+' },
  { name: 'Walton', logo: 'WALTON', productsCount: '320+' },
  { name: 'Xiaomi', logo: 'XIAOMI', productsCount: '210+' },
  { name: 'Apex', logo: 'APEX', productsCount: '180+' },
  { name: 'Aarong', logo: 'AARONG', productsCount: '95+' },
  { name: 'PRAN', logo: 'PRAN', productsCount: '450+' },
  { name: 'Bata', logo: 'BATA', productsCount: '130+' },
  { name: 'Unilever', logo: 'UNILEVER', productsCount: '260+' },
  { name: 'Sony', logo: 'SONY', productsCount: '80+' },
  { name: 'Miyako', logo: 'MIYAKO', productsCount: '110+' },
];

export const BANGLADESH_DIVISIONS = [
  {
    nameBn: 'ঢাকা',
    nameEn: 'Dhaka',
    districts: ['ঢাকা (Dhaka)', 'গাজীপুর (Gazipur)', 'নারায়ণগঞ্জ (Narayanganj)', 'টাঙ্গাইল (Tangail)', 'মানিকগঞ্জ (Manikganj)', 'মুন্সিগঞ্জ (Munshiganj)', 'নরসিংদী (Narsingdi)', 'ফরিদপুর (Faridpur)'],
  },
  {
    nameBn: 'চট্টগ্রাম',
    nameEn: 'Chattogram',
    districts: ['চট্টগ্রাম (Chattogram)', 'কক্সবাজার (Cox\'s Bazar)', 'কুমিল্লা (Cumilla)', 'ফেনী (Feni)', 'ব্রাহ্মণবাড়িয়া (Brahmanbaria)', 'নোয়াখালী (Noakhali)', 'চাঁদপুর (Chandpur)'],
  },
  {
    nameBn: 'রাজশাহী',
    nameEn: 'Rajshahi',
    districts: ['রাজশাহী (Rajshahi)', 'বগুড়া (Bogura)', 'পাবনা (Pabna)', 'সিরাজগঞ্জ (Sirajganj)', 'নওগাঁ (Naogaon)', 'নাটোর (Natore)', 'চাঁপাইনবাবগঞ্জ (Chapai Nawabganj)'],
  },
  {
    nameBn: 'খুলনা',
    nameEn: 'Khulna',
    districts: ['খুলনা (Khulna)', 'যশোর (Jashore)', 'কুষ্টিয়া (Kushtia)', 'সাতক্ষীরা (Satkhira)', 'বাগেরহাট (Bagerhat)', 'ঝিনাইদহ (Jhenaidah)'],
  },
  {
    nameBn: 'বরিশাল',
    nameEn: 'Barishal',
    districts: ['বরিশাল (Barishal)', 'পটুয়াখালী (Patuakhali)', 'ভোলা (Bhola)', 'পিরোজপুর (Pirojpur)', 'বরগুনা (Barguna)', 'ঝালকাঠি (Jhalokati)'],
  },
  {
    nameBn: 'সিলেট',
    nameEn: 'Sylhet',
    districts: ['সিলেট (Sylhet)', 'মৌলভীবাজার (Moulvibazar)', 'হবিগঞ্জ (Habiganj)', 'সুনামগঞ্জ (Sunamganj)'],
  },
  {
    nameBn: 'রংপুর',
    nameEn: 'Rangpur',
    districts: ['রংপুর (Rangpur)', 'দিনাজপুর (Dinajpur)', 'গাইবান্ধা (Gaibandha)', 'কুড়িগ্রাম (Kurigram)', 'নীলফামারী (Nilphamari)'],
  },
  {
    nameBn: 'ময়মনসিংহ',
    nameEn: 'Mymensingh',
    districts: ['ময়মনসিংহ (Mymensingh)', 'জামালপুর (Jamalpur)', 'নেত্রকোণা (Netrokona)', 'শেরপুর (Sherpur)'],
  },
];

export const INITIAL_USER: User = {
  id: 'admin-001',
  name: 'Md. Junayed Alam',
  email: 'mdjunayedalam6@gmail.com',
  phone: '01929637253',
  password: 'B$R@Z#3.0',
  role: 'admin',
  division: 'Dhaka',
  district: 'Dhaka',
  thana: 'Banani',
  village: 'Road 7, Block-C',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=1200&auto=format&fit=crop&q=95',
  balance: 0,
  referralCode: 'BB-637253',
  hasCompletedFirstOrder: false,
  firstOrderBonusUnlocked: false,
  pendingWelcomeBonus: 0,
  referrals: [],
  walletTransactions: [],
  addresses: [
    {
      id: 'addr-1',
      title: 'হোম (Home)',
      address: 'বাড়ি নং 42, রোড নং 7, ব্লক-সি, বনানী',
      district: 'ঢাকা (Dhaka)',
      isDefault: true,
    },
    {
      id: 'addr-2',
      title: 'অফিস (Office)',
      address: 'লেভেল 8, সিলিকন টাওয়ার, গুলশান-1',
      district: 'ঢাকা (Dhaka)',
      isDefault: false,
    },
  ],
};

export const INITIAL_ORDERS: Order[] = [];
