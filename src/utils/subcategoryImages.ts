import { Product } from '../types';
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

const PARENT_CATEGORY_IMAGES: Record<string, string> = {
  'womens-clothing': catWomensImg,
  'mens-clothing': catMensImg,
  'baby-collection': catBabyImg,
  'couple-combo': catCoupleImg,
  'home-living': catHomeImg,
  'bag-collection': catBagImg,
  'jewelry-accessories': catJewelryImg,
  'electronics-gadgets': catElectronicsImg,
  'winter-collection': catWinterImg,
  'seasonal-products': catSeasonalImg,
  'other-categories': catOtherImg,
};

export const SUBCATEGORY_IMAGE_MAP: Record<string, string> = {
  // ছেলেদের পোশাক (Men's Clothing)
  'katua': catMensImg,
  'কাতুয়া': catMensImg,
  'polo-shirts': catMensImg,
  'পলো শার্ট': catMensImg,
  'basic-tshirt': catMensImg,
  'বেসিক টি-শার্ট': catMensImg,
  'dropshoulder-tshirt': catMensImg,
  'ড্রপসোল্ডার টিশার্ট': catMensImg,
  'embroidery-panjabi': catMensImg,
  'পাঞ্জাবি কালেকশন': catMensImg,
  'printed-shirt': catMensImg,
  'প্রিন্ট শার্ট': catMensImg,
  'jeans-pant': catMensImg,
  'জিন্স প্যান্ট': catMensImg,
  'chino-pant': catMensImg,
  'চিনো প্যান্ট': catMensImg,

  // মেয়েদের পোশাক (Women's Clothing)
  'saree': catWomensImg,
  'শাড়ি কালেকশন': catWomensImg,
  'three-piece': catWomensImg,
  'রেডিমেড থ্রিপিস ও কুর্তি': catWomensImg,
  'girls-tops': catWomensImg,
  'টপস ও টিশার্ট': catWomensImg,
  'borka-abaya': catWomensImg,
  'বোরকা ও আবায়া': catWomensImg,
  'tanter-saree': catWomensImg,
  'তাঁতের শাড়ী': catWomensImg,
  'handprint-saree': catWomensImg,
  'হ্যান্ডপ্রিন্ট শাড়ি': catWomensImg,
  'sunnati-dress': catWomensImg,
  'সুন্নাতি ড্রেস': catWomensImg,
  'inner-nighty': catWomensImg,
  'ইনার ও নাইটি': catWomensImg,
  'girls-clothing': catWomensImg,
  'মেয়েদের ফ্যাশন': catWomensImg,

  // বেবি কালেকশন (Baby & Kids Collection)
  'kids-clothing': catBabyImg,
  'কিডস কালেকশন': catBabyImg,
  'pari-dress': catBabyImg,
  'পরী ড্রেস': catBabyImg,
  'baby-borka': catBabyImg,
  'বেবি বোরখা': catBabyImg,
  'kids-pant': catBabyImg,
  'কিডস প্যান্ট': catBabyImg,
  'girls-tshirt-set': catBabyImg,
  'গার্লস টিশার্ট সেট': catBabyImg,
  'baby': catBabyImg,
  'বেবি ও কিডস কেয়ার': catBabyImg,

  // কাপল এন্ড কম্বো (Couple & Combo)
  'couple-saree': catCoupleImg,
  'কাপল শাড়ী ও পাঞ্জাবি': catCoupleImg,
  'couple-threepiece': catCoupleImg,
  'কাপল থ্রীপিস': catCoupleImg,
  'tshirt-skirt': catCoupleImg,
  'টিশার্ট & স্কার্ট কম্বো': catCoupleImg,

  // গৃহ সামগ্রী (Home & Living)
  'bedsheet': catHomeImg,
  'রেগুলার বেডশীট': catHomeImg,
  'home-decor': catHomeImg,
  'গৃহ সজ্জা ও ডেকর': catHomeImg,
  'waterproof-dining': catHomeImg,
  'ওয়াটারপ্রুফ ডাইনিং': catHomeImg,
  'regular-dining': catHomeImg,
  'রেগুলার ডাইনিং': catHomeImg,
  'ac-katha': catHomeImg,
  'এসি কাথা': catHomeImg,
  'comforter': catHomeImg,
  'কম্ফর্টার': catHomeImg,
  'home': catHomeImg,
  'হোম ও কিচেন অ্যাপ্লায়েন্স': catHomeImg,

  // ব্যাগ কালেকশন (Bag Collection)
  'girls-bag': catBagImg,
  'মেয়েদের ব্যাগ': catBagImg,
  'purse-bag': catBagImg,
  'পার্স ও ওয়ালেট ব্যাগ': catBagImg,

  // জুয়েলারি এন্ড এক্সেসরিজ (Jewelry & Accessories)
  'accessories': catJewelryImg,
  'এক্সেসরিজ কালেকশন': catJewelryImg,

  // ইলেকট্রনিক্স এবং গ্যাজেট (Electronics & Gadgets)
  'smartphones': catElectronicsImg,
  'স্মার্টফোন': catElectronicsImg,
  'electronics': catElectronicsImg,
  'স্মার্ট গ্যাজেট ও অ্যাক্সেসরিজ': catElectronicsImg,

  // শীতের কালেকশন (Winter Collection)
  'hoodie-sweatshirt': catWinterImg,
  'হুডি / সোয়েটশার্ট': catWinterImg,
  'jacket-blazer': catWinterImg,
  'জ্যাকেট / ব্লেজার': catWinterImg,
  'gents-jacket': catWinterImg,
  'জেন্টস জ্যাকেট': catWinterImg,
  'gents-hoodie': catWinterImg,
  'জেন্টস হুডি': catWinterImg,
  'ladies-hoodie': catWinterImg,
  'লেডিস হুডি': catWinterImg,
  'ladies-overcoat': catWinterImg,
  'লেডিস ওভারকোট': catWinterImg,
  'hoodie-set': catWinterImg,
  'হুডি সেট': catWinterImg,

  // সিজোনাল প্রোডাক্ট (Seasonal Products)
  'world-cup': catSeasonalImg,
  'ওয়ার্ল্ড কাপ কালেকশন': catSeasonalImg,

  // অন্যান্য ক্যাটেগরি (Other Categories)
  'grocery': catOtherImg,
  'মুদি ও খাঁটি পণ্য': catOtherImg,
  'beauty': catOtherImg,
  'বিউটি ও রূপচর্চা': catOtherImg,
  'books': catOtherImg,
  'বই ও স্টেশনারি': catOtherImg,
  'sports': catSeasonalImg,
  'স্পোর্টস ও ফিটনেস': catSeasonalImg,
};

export function getSubcategoryImage(
  subcatId: string,
  subcatName?: string,
  fallbackParentImage?: string,
  products?: Product[],
  parentCatId?: string
): string {
  // 1. Dynamic product image check from current live catalog
  if (products && Array.isArray(products) && products.length > 0) {
    const cleanSubId = (subcatId || '').trim().toLowerCase();
    const cleanSubName = (subcatName || '').trim().toLowerCase();
    const cleanParentId = (parentCatId || '').trim().toLowerCase();

    const matchedProduct = products.find((p) => {
      if (!p.images || p.images.length === 0 || !p.images[0]) return false;

      const pSub = (p.subcategory || '').trim().toLowerCase();
      const pCat = (p.category || '').trim().toLowerCase();

      if (cleanParentId && pCat && cleanParentId !== 'all') {
        const catMatch =
          pCat === cleanParentId ||
          pCat.includes(cleanParentId) ||
          cleanParentId.includes(pCat);
        if (!catMatch) return false;
      }

      if (cleanSubId && (pSub === cleanSubId || pSub.includes(cleanSubId))) return true;
      if (cleanSubName && (pSub === cleanSubName || pSub.includes(cleanSubName))) return true;

      if (cleanSubName && p.titleBn && p.titleBn.toLowerCase().includes(cleanSubName)) return true;
      if (cleanSubName && p.titleEn && p.titleEn.toLowerCase().includes(cleanSubName)) return true;

      if (Array.isArray(p.tags)) {
        if (cleanSubId && p.tags.some((t) => t.toLowerCase() === cleanSubId)) return true;
        if (cleanSubName && p.tags.some((t) => t.toLowerCase() === cleanSubName)) return true;
      }

      return false;
    });

    if (matchedProduct && matchedProduct.images && matchedProduct.images[0]) {
      return matchedProduct.images[0];
    }
  }

  // 2. Curated mapping lookup by ID or Bengali name
  if (subcatId && SUBCATEGORY_IMAGE_MAP[subcatId.toLowerCase()]) {
    return SUBCATEGORY_IMAGE_MAP[subcatId.toLowerCase()];
  }
  if (subcatName && SUBCATEGORY_IMAGE_MAP[subcatName.trim()]) {
    return SUBCATEGORY_IMAGE_MAP[subcatName.trim()];
  }
  if (subcatName && SUBCATEGORY_IMAGE_MAP[subcatName.toLowerCase()]) {
    return SUBCATEGORY_IMAGE_MAP[subcatName.toLowerCase()];
  }

  // 3. Parent category image lookup
  if (parentCatId && PARENT_CATEGORY_IMAGES[parentCatId.toLowerCase()]) {
    return PARENT_CATEGORY_IMAGES[parentCatId.toLowerCase()];
  }

  return fallbackParentImage && !fallbackParentImage.includes('images.unsplash.com')
    ? fallbackParentImage
    : catOtherImg;
}
