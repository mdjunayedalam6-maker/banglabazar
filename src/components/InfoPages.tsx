import React, { useState } from 'react';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Store,
  Send,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AboutPage: React.FC = () => {
  const { language, setCurrentPage } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xs space-y-5">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00873E] bg-emerald-50 px-3 py-1.5 rounded-xl">
          <Store className="w-4 h-4" />
          <span>{language === 'bn' ? 'আমাদের সম্পর্কে' : 'About Us'}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {language === 'bn'
            ? 'বাংলা বাজার — সবার জন্য সহজ অনলাইন শপিং'
            : 'Bangla Bazar — Easy Online Shopping'}
        </h1>

        <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
          {language === 'bn'
            ? 'ফ্যাশন, ইলেকট্রনিক্স ও নিত্যপ্রয়োজনীয় ১২,০০০+ পণ্য সাশ্রয়ী মূল্যে সারা দেশে হোম ডেলিভারি।'
            : 'Over 12,000 curated products across fashion, electronics, and essentials delivered nationwide.'}
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage('shop')}
            className="px-6 py-3 bg-[#00873E] hover:bg-[#007033] text-white font-bold text-sm rounded-xl inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>{language === 'bn' ? 'শপিং শুরু করুন' : 'Start Shopping'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage('contact')}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { language, addToast, siteSettings } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const hotline = siteSettings.hotlineNumber || '01929637253';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      addToast(
        language === 'bn' ? 'অনুগ্রহ করে নাম, মোবাইল ও বার্তা লিখুন' : 'Please fill in all fields',
        'error'
      );
      return;
    }
    setSent(true);
    addToast(
      language === 'bn' ? 'আপনার বার্তা পাঠানো হয়েছে!' : 'Message sent!',
      'success'
    );
    setName('');
    setPhone('');
    setMessage('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
        <div className="md:col-span-5 bg-[#062919] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <h1 className="text-2xl font-black">
              {language === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
            </h1>
            <p className="text-xs text-emerald-100/80 mt-1">
              {language === 'bn'
                ? 'যেকোনো প্রয়োজনে সরাসরি কল বা মেসেজ করুন।'
                : 'Call or message us anytime.'}
            </p>
          </div>

          <div className="space-y-3 text-sm">
            <a
              href={`tel:${hotline}`}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors"
            >
              <PhoneCall className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[11px] text-emerald-200">{language === 'bn' ? 'হটলাইন' : 'Hotline'}</div>
                <div className="font-bold font-mono text-white tabular-nums">{hotline}</div>
              </div>
            </a>

            <a
              href="mailto:mdzunayedali6@gmail.com"
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/15 transition-colors"
            >
              <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[11px] text-emerald-200">{language === 'bn' ? 'ইমেইল' : 'Email'}</div>
                <div className="font-semibold text-white break-all text-xs sm:text-sm">mdzunayedali6@gmail.com</div>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10">
              <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs sm:text-sm font-medium text-white">
                রামপুর, তারাকান্দা, ময়মনসিংহ
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10">
              <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-xs sm:text-sm font-medium text-white">
                {language === 'bn' ? 'সকাল ৯টা – রাত ১০টা' : '9:00 AM – 10:00 PM'}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <h2 className="text-xl font-black text-slate-900 mb-4">
            {language === 'bn' ? 'বার্তা পাঠান' : 'Send Message'}
          </h2>

          {sent ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-[#00873E] mx-auto" />
              <h3 className="font-bold text-slate-900 text-base">
                {language === 'bn' ? 'বার্তা পাঠানো হয়েছে!' : 'Message Received!'}
              </h3>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="px-4 py-2 bg-[#00873E] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                {language === 'bn' ? 'নতুন বার্তা' : 'Send Another'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'bn' ? 'নাম' : 'Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={language === 'bn' ? 'আপনার নাম' : 'Your name'}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'bn' ? 'মোবাইল নম্বর' : 'Mobile'}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'bn' ? 'বার্তা' : 'Message'}
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={language === 'bn' ? 'বিস্তারিত লিখুন...' : 'Write your message...'}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-[#00873E] focus:bg-white transition-colors"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#00873E] hover:bg-[#007033] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{language === 'bn' ? 'পাঠিয়ে দিন' : 'Send'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
