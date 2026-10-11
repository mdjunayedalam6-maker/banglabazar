import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Package, 
  Heart, 
  MapPin, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShoppingBag, 
  Trash2, 
  ChevronRight,
  ShieldCheck,
  Plus,
  ArrowRight,
  Settings,
  Globe,
  Check,
  Bell,
  Key,
  Smartphone,
  Mail,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { OrderStatus } from '../types';

export const ProfilePage: React.FC = () => {
  const {
    currentUser,
    orders,
    userOrders,
    wishlist,
    products,
    language,
    setLanguage,
    t,
    formatPrice,
    logoutUser,
    setCurrentPage,
    toggleWishlist,
    addToCart,
    viewProductDetails,
    profileActiveTab,
    setProfileActiveTab,
    addToast,
    setIsAuthModalOpen,
    openTrackOrder,
    isUserAdmin,
    loginAdmin,
  } = useApp();

  const activeTab = profileActiveTab;
  const setActiveTab = setProfileActiveTab;
  const [selectedOrderTracking, setSelectedOrderTracking] = useState<string | null>(userOrders[0]?.id || null);
  const [smsNotification, setSmsNotification] = useState(true);
  const [promoNotification, setPromoNotification] = useState(true);
  const [securityNotification, setSecurityNotification] = useState(true);

  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const { updateUserProfile } = useApp();
  const [editForm, setEditForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    division: currentUser?.division || '',
    district: currentUser?.district || '',
    thana: currentUser?.thana || '',
    village: currentUser?.village || '',
    avatar: currentUser?.avatar || ''
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(editForm);
    setIsEditingProfile(false);
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          {language === 'bn' ? 'প্রোফাইল দেখতে প্রথমে লগইন করুন' : 'Please login to view profile'}
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm"
          >
            {t.login}
          </button>
          <button
            onClick={() => openTrackOrder()}
            className="w-full sm:w-auto px-6 py-2.5 bg-orange-50 hover:bg-orange-100 text-[#FF6B00] border border-orange-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>{language === 'bn' ? 'অর্ডার ট্র্যাক করুন' : 'Track Order'}</span>
          </button>
        </div>
      </div>
    );
  }

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  // Step helper for tracking status
  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case 'placed': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'out_for_delivery': return 4;
      case 'delivered': return 5;
      default: return 1;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* User Greeting Card */}
      <div className="bg-gradient-to-r from-[#062919] via-[#0A3D24] to-[#046A31] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md border border-emerald-800/30">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-emerald-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">{currentUser.name}</h1>
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                VIP Member
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {[currentUser.email, currentUser.phone].filter(Boolean).join(' | ') || (language === 'bn' ? 'কাস্টমার প্রোফাইল' : 'Customer Profile')}
            </p>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{language === 'bn' ? 'যাচাইকৃত গ্রাহক অ্যাকাউন্ট' : 'Verified Customer Account'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isUserAdmin(currentUser) && (
            <button
              onClick={() => {
                loginAdmin();
                setCurrentPage('admin');
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>{language === 'bn' ? 'এডমিন ড্যাশবোর্ড' : 'Admin Panel'}</span>
            </button>
          )}

          <button
            onClick={logoutUser}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Profile Layout: Left Navigation, Right Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Nav (3 cols) */}
        <div className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4 text-emerald-600" />
              <span className="flex-1 text-left">{t.myOrders}</span>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                {userOrders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'wishlist'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span className="flex-1 text-left">{t.wishlist}</span>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {wishlist.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'addresses'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-amber-500" />
              <span className="flex-1 text-left">{language === 'bn' ? 'ঠিকানা তালিকা' : 'Address Book'}</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'settings'
                  ? 'bg-emerald-50 text-emerald-800'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4 text-emerald-600" />
              <span className="flex-1 text-left">{language === 'bn' ? 'সেটিংস' : 'Settings'}</span>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full uppercase">
                {language === 'bn' ? 'বাংলা' : 'ENG'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Content (9 cols) */}
        <div className="lg:col-span-9 space-y-6">
          {/* Tab 1: Orders History & Live Tracking */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {t.myOrders} ({userOrders.length})
                </h2>
              </div>

              {/* Admin Note if admin is logged in */}
              {isUserAdmin(currentUser) && orders.length > 0 && userOrders.length === 0 && (
                <div className="p-4 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-blue-900">
                  <span>
                    {language === 'bn'
                      ? `এডমিন নোটিশ: দোকানে গ্রাহকদের মোট ${orders.length}টি অর্ডার জমা আছে। সকল অর্ডার দেখতে এডমিন প্যানেলে যান।`
                      : `Admin Note: Store has ${orders.length} total customer orders. Visit the Admin Panel to manage all.`}
                  </span>
                  <button
                    onClick={() => setCurrentPage('admin')}
                    className="px-3.5 py-1.5 bg-[#00873E] hover:bg-[#007033] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition-colors"
                  >
                    {language === 'bn' ? 'এডমিন ড্যাশবোর্ড' : 'Admin Dashboard'}
                  </button>
                </div>
              )}

              {userOrders.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-3 shadow-xs">
                  <Package className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-base font-bold text-slate-800">
                    {language === 'bn' ? 'আপনার কোনো পূর্ববর্তী অর্ডার নেই' : 'You have no orders yet'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    {language === 'bn' 
                      ? 'নতুন একাউন্ট খোলায় এখানে স্বয়ংক্রিয়ভাবে কোনো পণ্য বা অর্ডার নেই। আপনি যখন কোনো পণ্য অর্ডার করবেন, শুধুমাত্র তখন সেই অর্ডারটি বিস্তারিত বিবরণ সহ এখানে যুক্ত হবে।' 
                      : 'No automatic orders exist for your account. Once you place an order, your purchased products will appear here.'}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setCurrentPage('shop')}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      {t.startShopping}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {userOrders.map((order) => {
                    const isExpanded = selectedOrderTracking === order.id;
                    const currentStep = getStatusStep(order.status);

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs"
                      >
                        {/* Order Header */}
                        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              {language === 'bn' ? 'অর্ডার নম্বর' : 'Order ID'}
                            </span>
                            <span className="text-sm font-black text-slate-900">{order.id}</span>
                            <span className="text-xs text-slate-500 ml-2">({order.date})</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-800">
                              {formatPrice(order.total)}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                              order.status === 'delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {order.status === 'delivered'
                                ? t.statusDelivered
                                : order.status === 'shipped'
                                ? t.statusShipped
                                : t.statusProcessing}
                            </span>
                            <button
                              onClick={() => openTrackOrder(order.trackingNumber || order.id)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="ফুলস্ক্রিন ট্র্যাকিং ডায়ালগ খুলুন"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'ট্র্যাক করুন' : 'Track'}</span>
                            </button>
                            <button
                              onClick={() => setSelectedOrderTracking(isExpanded ? null : order.id)}
                              className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                            >
                              {isExpanded 
                                ? (language === 'bn' ? 'সংক্ষেপ করুন' : 'Hide') 
                                : (language === 'bn' ? 'টাইমলাইন' : 'Timeline')}
                            </button>
                          </div>
                        </div>

                        {/* Live Tracking Progress Timeline (If Expanded) */}
                        {isExpanded && (
                          <div className="p-6 bg-slate-900 text-white space-y-4">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                                <Clock className="w-4 h-4" />
                                {language === 'bn' ? 'ট্র্যাকিং নম্বর: ' : 'Tracking #: '} {order.trackingNumber}
                              </span>
                              <span className="text-slate-400">
                                {language === 'bn' ? 'ডেলিভারি পার্টনার: রেডএক্স / সুন্দরবন কুরিয়ার' : 'Courier: RedX / Sundarban Express'}
                              </span>
                            </div>

                            {/* Steps Indicator */}
                            <div className="grid grid-cols-5 gap-2 pt-2">
                              {[
                                { step: 1, labelBn: 'অর্ডার প্লেসড', labelEn: 'Placed' },
                                { step: 2, labelBn: 'প্যাকেজিং', labelEn: 'Packing' },
                                { step: 3, labelBn: 'কুরিয়ারে পাঠানো', labelEn: 'Shipped' },
                                { step: 4, labelBn: 'ডেলিভারিতে বের হয়েছে', labelEn: 'Out for Delivery' },
                                { step: 5, labelBn: 'ডেলিভার্ড', labelEn: 'Delivered' },
                              ].map((s) => {
                                const isPassed = currentStep >= s.step;
                                return (
                                  <div key={s.step} className="text-center space-y-1.5">
                                    <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                                      isPassed ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-500'
                                    }`}>
                                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                                    </div>
                                    <p className={`text-[10px] sm:text-xs font-semibold ${isPassed ? 'text-white' : 'text-slate-500'}`}>
                                      {language === 'bn' ? s.labelBn : s.labelEn}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Items List in this order */}
                        <div className="p-4 sm:p-5 divide-y divide-slate-100">
                          {order.items.map((item) => (
                            <div key={item.productId} className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-slate-800 truncate">{item.title}</h4>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  {item.selectedSize && (
                                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                                      সাইজ: {item.selectedSize}
                                    </span>
                                  )}
                                  {item.selectedColor && (
                                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-100">
                                      কালার: {item.selectedColor}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  {language === 'bn' ? 'পরিমাণ:' : 'Qty:'} {item.quantity} | {formatPrice(item.price)}
                                </p>
                              </div>
                              <span className="text-xs font-bold text-slate-900">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">
                {t.wishlist} ({wishlistProducts.length})
              </h2>

              {wishlistProducts.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-3">
                  <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-sm text-slate-500">
                    {language === 'bn' ? 'উইশলিস্টে কোনো পণ্য সংরক্ষণ করা নেই' : 'Your wishlist is empty'}
                  </p>
                  <button
                    onClick={() => setCurrentPage('shop')}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    {t.startShopping}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map((prod) => {
                    const title = language === 'bn' ? prod.titleBn : prod.titleEn;
                    return (
                      <div
                        key={prod.id}
                        className="bg-white rounded-2xl p-4 border border-slate-200/80 flex items-center gap-4 hover:shadow-md transition-shadow"
                      >
                        <img
                          src={
                            prod.images[0]?.includes('_L_') && prod.images[0].endsWith('.jpg')
                              ? prod.images[0].replace(/\.jpg$/i, '.jpeg')
                              : prod.images[0] || ''
                          }
                          alt={title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src.includes('_L_')) {
                              target.src = target.src.replace('_L_', '_S_').replace(/\.jpeg$/i, '.jpg');
                            } else {
                              target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80';
                            }
                          }}
                          className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 
                            onClick={() => viewProductDetails(prod)}
                            className="text-xs font-bold text-slate-800 truncate hover:text-emerald-700 cursor-pointer"
                          >
                            {title}
                          </h4>
                          <div className="text-xs font-black text-slate-900 mt-1">
                            {formatPrice(prod.price)}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => addToCart(prod, 1)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>{t.addToCart}</span>
                            </button>
                            <button
                              onClick={() => toggleWishlist(prod.id)}
                              className="p-1 text-slate-400 hover:text-rose-600"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Address Book */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  {language === 'bn' ? 'সংরক্ষিত ঠিকানা' : 'Saved Addresses'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentUser.addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        {addr.title}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          ডিফল্ট ঠিকানা
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{addr.address}</p>
                    <p className="text-xs text-slate-500 font-medium">{addr.district}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Customer Settings & Language Options */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-emerald-600" />
                    {language === 'bn' ? 'অ্যাকাউন্ট সেটিংস ও পছন্দসমূহ' : 'Account Settings & Preferences'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'bn' 
                      ? 'ওয়েবসাইটের ভাষা পরিবর্তন, প্রোফাইল তথ্য এবং নোটিফিকেশন নিয়ন্ত্রণ করুন' 
                      : 'Manage website language, profile information, and notification preferences'}
                  </p>
                </div>
              </div>

              {/* 1. Language Preference Section (Prominent) */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {language === 'bn' ? 'ওয়েবসাইটের ভাষা (Language)' : 'Website Language (ভাষা)'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {language === 'bn'
                          ? 'আপনার পছন্দের ভাষা নির্বাচন করুন। পুরো ইন্টারফেস সাথে সাথে পরিবর্তন হবে।'
                          : 'Choose your preferred language. The entire interface will update instantly.'}
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {language === 'bn' ? 'বর্তমান ভাষা: বাংলা' : 'Current: English'}
                  </span>
                </div>

                {/* Interactive Language Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Option 1: বাংলা */}
                  <button
                    type="button"
                    onClick={() => {
                      if (language !== 'bn') {
                        setLanguage('bn');
                        addToast('ওয়েবসাইটের ভাষা সফলভাবে বাংলায় পরিবর্তন করা হয়েছে।', 'success');
                      }
                    }}
                    className={`relative p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                      language === 'bn'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100/80 flex items-center justify-center text-lg shrink-0">
                        🇧🇩
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">বাংলা (Bangla)</span>
                          {language === 'bn' && (
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                              সক্রিয়
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          ওয়েবসাইটের সকল অফার, পণ্যের নাম, দাম ও বর্ণনা বাংলায় দেখুন।
                        </p>
                      </div>
                    </div>
                    {language === 'bn' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>

                  {/* Option 2: English */}
                  <button
                    type="button"
                    onClick={() => {
                      if (language !== 'en') {
                        setLanguage('en');
                        addToast('Website language successfully switched to English.', 'success');
                      }
                    }}
                    className={`relative p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                      language === 'en'
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100/80 flex items-center justify-center text-lg shrink-0">
                        🇬🇧
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">English</span>
                          {language === 'en' && (
                            <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          View product specifications, order updates, and support in English.
                        </p>
                      </div>
                    </div>
                    {language === 'en' && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* 2. Customer Profile Details */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {language === 'bn' ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {language === 'bn' ? 'আপনার অ্যাকাউন্টের যোগাযোগের বিবরণ' : 'Your account contact and identity details'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="px-3 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                  >
                    {isEditingProfile ? (language === 'bn' ? 'বাতিল করুন' : 'Cancel') : (language === 'bn' ? 'এডিট করুন' : 'Edit Profile')}
                  </button>
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{language === 'bn' ? 'গ্রাহকের নাম' : 'Full Name'}</label>
                        <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}</label>
                        <input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500" required />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}</label>
                        <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{language === 'bn' ? 'বিভাগ' : 'Division'}</label>
                        <input type="text" value={editForm.division} onChange={e => setEditForm({...editForm, division: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{language === 'bn' ? 'জেলা' : 'District'}</label>
                        <input type="text" value={editForm.district} onChange={e => setEditForm({...editForm, district: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{language === 'bn' ? 'থানা' : 'Thana'}</label>
                        <input type="text" value={editForm.thana} onChange={e => setEditForm({...editForm, thana: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{language === 'bn' ? 'গ্রাম' : 'Village'}</label>
                        <input type="text" value={editForm.village} onChange={e => setEditForm({...editForm, village: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">{language === 'bn' ? 'প্রোফাইল ছবির লিংক' : 'Avatar URL'}</label>
                        <input type="url" value={editForm.avatar} onChange={e => setEditForm({...editForm, avatar: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:border-emerald-500" />
                      </div>
                    </div>
                    <div className="flex justify-end pt-2">
                      <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">
                        {language === 'bn' ? 'সেভ করুন' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'গ্রাহকের নাম' : 'Full Name'}</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">{currentUser.name}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">{currentUser.phone || 'N/A'}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'ইমেইল অ্যাড্রেস' : 'Email Address'}</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">{currentUser.email || 'N/A'}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'বিভাগ' : 'Division'}</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">{currentUser.division || 'N/A'}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'জেলা' : 'District'}</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">{currentUser.district || 'N/A'}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'থানা' : 'Thana'}</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">{currentUser.thana || 'N/A'}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'গ্রাম' : 'Village'}</span>
                    <span className="text-xs font-bold text-slate-800 mt-0.5 block">{currentUser.village || 'N/A'}</span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 lg:col-span-3">
                    <span className="text-[11px] text-slate-500 block">{language === 'bn' ? 'গ্রাহক স্ট্যাটাস' : 'Customer Status'}</span>
                    <span className="text-xs font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      VIP Verified Member
                    </span>
                  </div>
                </div>
                )}
              </div>

              {/* 3. Notification & Preferences */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {language === 'bn' ? 'বিজ্ঞপ্তি ও অ্যালার্ট' : 'Notifications & Alerts'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'bn' ? 'অর্ডার ও ছাড়ের বার্তা পাওয়ার পছন্দ' : 'Customize SMS and message alerts'}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 pt-1">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {language === 'bn' ? 'অর্ডার স্ট্যাটাস এসএমএস আপডেট' : 'Order Status SMS Updates'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {language === 'bn' ? 'অর্ডার গ্রহণ, প্যাকেজিং ও ডেলিভারির সময় এসএমএস পাঠানো হবে' : 'Receive instant SMS when order is packed and dispatched'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSmsNotification(!smsNotification)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        smsNotification ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        smsNotification ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {language === 'bn' ? 'বিশেষ ছাড় ও কুপন কোড অ্যালার্ট' : 'Special Offers & Voucher Alerts'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {language === 'bn' ? 'সাপ্তাহিক ফ্ল্যাশ ডিল এবং এক্সক্লুসিভ অফারের তথ্য' : 'Get notified about mega flash sales and special promo codes'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPromoNotification(!promoNotification)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        promoNotification ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        promoNotification ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {language === 'bn' ? 'নিরাপত্তা ও সাইন-ইন নোটিফিকেশন' : 'Security & Login Notifications'}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {language === 'bn' ? 'নতুন ডিভাইস থেকে লগইন হলে সতর্কতা প্রদান' : 'Alert me when login occurs from an unrecognized device'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSecurityNotification(!securityNotification)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                        securityNotification ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        securityNotification ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
