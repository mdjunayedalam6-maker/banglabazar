import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { BannerSlider } from './components/BannerSlider';
import { CategoryGrid } from './components/CategoryGrid';
import { FeaturedSections } from './components/FeaturedSections';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage, CartDrawer } from './pages/CartPage';
import { CheckoutPage, OrderSuccessView } from './pages/CheckoutPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AuthModal } from './components/AuthModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { TrackOrderModal } from './components/TrackOrderModal';
import { ToastContainer } from './components/Toast';
import { Footer } from './components/Footer';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InitialLoadingScreen } from './components/InitialLoadingScreen';
import { AppInstallModal } from './components/AppInstallModal';
import { ArrowUp, ShieldAlert, Lock } from 'lucide-react';

const MainAppContent: React.FC = () => {
  console.log("MainAppContent rendered");
  const { 
    currentPage, 
    setCurrentPage, 
    isAdminAuthenticated, 
    currentUser, 
    isUserAdmin, 
    setIsAdminModalOpen 
  } = useApp();

  // Scroll to top on page change
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (_) {}
  }, [currentPage]);

  const scrollToTop = () => {
    try {
      if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (_) {}
  };

  // If viewing the admin panel, verify strict authentication and role
  if (currentPage === 'admin') {
    if (!isAdminAuthenticated || !currentUser || !isUserAdmin(currentUser)) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-3xl p-8 text-center shadow-2xl space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-rose-500/20 text-rose-300 text-xs font-bold rounded-full uppercase tracking-wider">
                সিক্রেট এডমিন কন্ট্রোল
              </span>
              <h2 className="text-2xl font-black text-white">অ্যাক্সেস ডিনাইড</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                শুধুমাত্র অনুমোদিত Gmail অথবা ফোন এবং সিক্রেট পাসওয়ার্ড দিয়েই অ্যাডমিন প্যানেলে প্রবেশ করা যাবে। অন্য যে কেউ চাইলেই প্রবেশ করতে পারবে না।
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setCurrentPage('home')}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition-all"
              >
                হোমপেজে যান
              </button>
              <button
                onClick={() => setIsAdminModalOpen(true)}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                <span>সিক্রেট ভেরিফাই</span>
              </button>
            </div>
          </div>
          <AdminLoginModal />
          <ToastContainer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
        <AdminPage />
        <ToastContainer />
        <AdminLoginModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 text-slate-800 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Top Main Header */}
      <Header />

      {/* Desktop Navigation & Category Mega Bar */}
      <Navbar />

      {/* Dynamic Page Views */}
      <main className="flex-1 pb-16 md:pb-0">
        {currentPage === 'home' && (
          <div className="space-y-2">
            <BannerSlider />
            <CategoryGrid />
            <FeaturedSections />
          </div>
        )}

        {currentPage === 'shop' && <ShopPage />}

        {currentPage === 'product-detail' && <ProductDetailPage />}

        {currentPage === 'cart' && <CartPage />}

        {currentPage === 'checkout' && <CheckoutPage />}

        {currentPage === 'order-success' && <OrderSuccessView />}

        {currentPage === 'profile' && <ProfilePage />}
      </main>

      {/* Main Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />

      {/* Slide-over Cart Drawer */}
      <CartDrawer />

      {/* Authentication Modal */}
      <AuthModal />

      {/* Secret Admin Login PIN Modal */}
      <AdminLoginModal />

      {/* Live Order Tracking Modal */}
      <TrackOrderModal />

      {/* Notification Toast Container */}
      <ToastContainer />

      {/* PWA App Install Banner & Offline Status */}
      <PWAInstallBanner />
      <OfflineIndicator />
      <InitialLoadingScreen />
      <AppInstallModal />

      {/* Floating Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-20 md:bottom-6 right-4 z-40 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-slate-700 border border-slate-200 shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Scroll to Top"
        aria-label="Scroll to Top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
