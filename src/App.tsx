import { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Layers, Gift, Info, Mail, CheckCircle2, AlertCircle, 
  HelpCircle, ChevronRight, Play, Star, ShieldCheck, Heart, ArrowRight,
  Clock, Download, Sparkles, Smartphone, Check, Loader2, Key, X
} from 'lucide-react';

import { Course, Product, Offer, Order, PublicDB } from './types';
import ReceiptDownloader from './components/ReceiptDownloader';
import PaymentModal from './components/PaymentModal';
import AdminPanel from './components/AdminPanel';
import CourseProgressTracker from './components/CourseProgressTracker';

export default function App() {
  // Public data state loaded from API
  const [publicData, setPublicData] = useState<PublicDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // App UI States
  const [activeTab, setActiveTab] = useState<'home' | 'courses' | 'products' | 'offers' | 'about' | 'contact' | 'checker'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Course | Product | null>(null);
  const [checkoutItem, setCheckoutItem] = useState<Course | Product | Offer | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Checker states
  const [checkerOrderId, setCheckerOrderId] = useState('');
  const [checkerResult, setCheckerResult] = useState<Order | null>(null);
  const [checkerLoading, setCheckerLoading] = useState(false);
  const [checkerError, setCheckerError] = useState('');

  // Payment status feedback
  const [successOrderId, setSuccessOrderId] = useState('');

  // Fetch public website data on mount
  useEffect(() => {
    fetchPublicData();
  }, []);

  // Backdoor Admin Secret URL trigger (?secret=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const secret = params.get('secret');
    if (secret) {
      const attemptBackdoorLogin = async () => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: secret })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            localStorage.setItem('editz_iqra_admin_token', data.token);
            setShowAdmin(true);
            // Securely clean up the secret query from the URL bar instantly
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (e) {
          console.error("Backdoor auth error:", e);
        }
      };
      attemptBackdoorLogin();
    }
  }, []);

  const fetchPublicData = async () => {
    try {
      const res = await fetch('/api/public');
      const data = await res.json();
      setPublicData(data);
    } catch (err) {
      setError('পাবলিক ডাটা লোড করতে ব্যর্থ হয়েছে। অনুগ্রহ করে রিফ্রেশ করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Check order status helper
  const handleCheckOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkerOrderId.trim()) return;
    setCheckerLoading(true);
    setCheckerError('');
    setCheckerResult(null);

    try {
      const res = await fetch(`/api/orders/${checkerOrderId.toUpperCase()}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCheckerResult(data.order);
      } else {
        setCheckerError(data.error || 'অর্ডার আইডিটি সঠিক নয়। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } catch {
      setCheckerError('সার্ভারে যোগাযোগ করা যায়নি। ইন্টারনেট চেক করুন।');
    } finally {
      setCheckerLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030308] text-slate-100 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400 font-mono">Editz Iqra লোড হচ্ছে...</p>
      </div>
    );
  }

  // Safe defaults if API loading fails or returns empty
  const hero = publicData?.hero || {
    heading: "আপনার দক্ষতা বাড়ান, নতুন কিছু শিখুন",
    subtitle: "Editz Iqra-তে স্বাগতম। প্রিমিয়াম ভিডিও এডিটিং কোর্স, ডিজাইন রিসোর্স এবং ওয়ান-ক্লিক প্রিসেট প্যাক।",
    buttonText: "কোর্সগুলো দেখুন",
    buttonLink: "#courses",
    badge: "ডিজিটাল লার্নিং প্ল্যাটফর্ম",
    promoText: "আজই শুরু করুন এবং আপনার ক্যারিয়ার উন্নত করুন",
    image: "/src/assets/images/hero_workspace_1791175318100.jpg"
  };

  const settings = publicData?.settings || {
    promoBar: { text: "📢 আমাদের সব প্রিসেট এবং ভিডিও কোর্সে মেগা ছাড় চলছে! এখনই অর্ডার করুন।", enabled: true },
    payment: {
      bkash: { enabled: true, number: "01789123456", instructions: "বিকাশ অ্যাপের Send Money করুন।" },
      nagad: { enabled: true, number: "01989654321", instructions: "নগদ অ্যাপের Send Money করুন।" }
    }
  };

  const courses = publicData?.courses || [];
  const products = publicData?.products || [];
  const offers = publicData?.offers || [];

  // Filter items by search query
  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#030308] text-slate-100 flex flex-col relative">
      
      {/* 1. TOP PROMOTIONAL BAR */}
      {settings.promoBar.enabled && (
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs py-2 px-4 text-center font-semibold tracking-wide relative z-40 whitespace-nowrap overflow-x-auto">
          {settings.promoBar.text}
        </div>
      )}

      {/* 2. NAVIGATION BAR */}
      <header className="sticky top-0 z-30 bg-[#030308]/80 backdrop-blur-md border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo Zone */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <span className="text-xl font-bold font-serif tracking-tight bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
              Editz Iqra
            </span>
          </div>

          {/* Links Zone */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <button 
              onClick={() => setActiveTab('home')} 
              className={`hover:text-indigo-400 transition-colors ${activeTab === 'home' ? 'text-indigo-400' : ''}`}
            >
              মূলপাতা
            </button>
            <button 
              onClick={() => setActiveTab('courses')} 
              className={`hover:text-indigo-400 transition-colors ${activeTab === 'courses' ? 'text-indigo-400' : ''}`}
            >
              কোর্স সমুহ
            </button>
            <button 
              onClick={() => setActiveTab('products')} 
              className={`hover:text-indigo-400 transition-colors ${activeTab === 'products' ? 'text-indigo-400' : ''}`}
            >
              ডিজিটাল প্রোডাক্টস
            </button>
            <button 
              onClick={() => setActiveTab('offers')} 
              className={`hover:text-indigo-400 transition-colors ${activeTab === 'offers' ? 'text-indigo-400' : ''}`}
            >
              স্পেশাল অফার
            </button>
            <button 
              onClick={() => setActiveTab('about')} 
              className={`hover:text-indigo-400 transition-colors ${activeTab === 'about' ? 'text-indigo-400' : ''}`}
            >
              আমাদের কথা
            </button>
            <button 
              onClick={() => setActiveTab('contact')} 
              className={`hover:text-indigo-400 transition-colors ${activeTab === 'contact' ? 'text-indigo-400' : ''}`}
            >
              যোগাযোগ
            </button>
            <button 
              onClick={() => setActiveTab('checker')} 
              className={`hover:text-indigo-400 transition-colors ${activeTab === 'checker' ? 'text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded' : ''}`}
            >
              রশিদ ডাউনলোড
            </button>
          </nav>

          {/* Search and Icons */}
          <div className="flex items-center gap-4">
            
            {/* Search Input */}
            <div className="relative hidden lg:block w-48">
              <input
                type="text"
                placeholder="সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            </div>

            {/* Admin Trigger Button */}
            <button
              onClick={() => setShowAdmin(true)}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-400 hover:text-indigo-400 transition-colors"
              title="Admin Panel"
            >
              <Key className="w-4 h-4" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 bg-slate-900 rounded text-slate-400"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-6 py-4 bg-[#030308] border-b border-slate-900 space-y-3 flex flex-col text-xs font-semibold uppercase tracking-wider text-slate-400">
            <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-indigo-400">মূলপাতা</button>
            <button onClick={() => { setActiveTab('courses'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-indigo-400">কোর্স সমুহ</button>
            <button onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-indigo-400">ডিজিটাল প্রোডাক্টস</button>
            <button onClick={() => { setActiveTab('offers'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-indigo-400">স্পেশাল অফার</button>
            <button onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-indigo-400">আমাদের কথা</button>
            <button onClick={() => { setActiveTab('contact'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-indigo-400">যোগাযোগ</button>
            <button onClick={() => { setActiveTab('checker'); setMobileMenuOpen(false); }} className="text-left py-1 hover:text-indigo-400">রশিদ ও অর্ডার ট্র্যাক</button>
          </div>
        )}
      </header>

      {/* SEARCH RESULTS IF SEARCH QUERY ENTERED */}
      {searchQuery && (
        <div className="bg-slate-950/60 border-b border-slate-900 py-4 px-6 text-center text-xs text-slate-400 font-mono">
          🔍 &ldquo;{searchQuery}&rdquo; এর জন্য ফলাফল নিচে দেখুন। সার্চ মুছতে ইনপুট খালি করুন।
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1">

        {/* ==================================================
            TAB: HOME VIEW
            ================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-24 pb-24">
            
            {/* 3. HERO SECTION */}
            <section className="relative overflow-hidden pt-12 md:pt-20 px-6 max-w-7xl mx-auto">
              {/* Background ambient glow circles */}
              <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
              <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-violet-500/10 blur-[130px] pointer-events-none" />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Hero Left Content */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-950/30 border border-indigo-500/20 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-300 font-sans">{hero.badge}</span>
                  </div>

                  <h1 className="text-3xl md:text-5xl font-extrabold font-sans text-slate-100 tracking-tight leading-tight md:leading-tight">
                    {hero.heading}
                  </h1>

                  <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-xl">
                    {hero.subtitle}
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                    <button
                      onClick={() => setActiveTab('courses')}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-950/40 transition duration-300 transform active:scale-[0.98] text-center"
                    >
                      {hero.buttonText}
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition duration-300 text-center"
                    >
                      ডিজিটাল প্রিসেট দেখুন
                    </button>
                  </div>

                  {/* Trust Banner */}
                  <div className="pt-4 border-t border-slate-900 flex items-center gap-4 text-xs text-slate-500 font-mono">
                    <span>🔥 {hero.promoText}</span>
                  </div>

                </div>

                {/* Hero Right Visual Column */}
                <div className="lg:col-span-5 relative">
                  
                  {/* Glowing Box Backdrop */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-md pointer-events-none" />

                  {/* Hero Main Image Frame */}
                  <div className="relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden aspect-[16/10] shadow-2xl flex items-center justify-center">
                    {hero.image ? (
                      <img src={hero.image} alt="Editz Iqra premium learning workspace" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-700 text-xs text-center font-mono p-12">Editz Iqra Workspace Visual</div>
                    )}
                    
                    {/* Glassmorphic floating card */}
                    <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xl">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-950/50 rounded-lg text-indigo-400">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">সফল শিক্ষার্থী</div>
                          <div className="text-sm font-bold text-slate-200">১,২০০+ ছাত্র-ছাত্রী</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-0.5 text-amber-500 justify-end">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">৪.৯/৫ রিভিউজ</span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            </section>

            {/* 4. FEATURED COURSES SECTION */}
            <section className="px-6 max-w-7xl mx-auto space-y-10" id="courses">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 mb-1 font-mono">আমাদের সেরা কারিকুলাম</div>
                  <h2 className="text-2xl md:text-3xl font-extrabold font-sans text-slate-100">প্রফেশনাল অনলাইন কোর্স সমুহ</h2>
                </div>
                <button 
                  onClick={() => setActiveTab('courses')}
                  className="group flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
                >
                  <span>সব কোর্স দেখুন</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Grid (Max 3 on home) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.slice(0, 3).map(course => (
                  <div 
                    key={course.id} 
                    className="group bg-slate-950 border border-slate-900 rounded-xl overflow-hidden hover:border-slate-800 transition-all duration-300 flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      {/* Course Image Slot */}
                      <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden flex items-center justify-center">
                        {course.image ? (
                          <img 
                            src={course.image} 
                            alt={course.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <span className="text-slate-700 text-xs font-mono">Editz Iqra Course</span>
                        )}
                        {/* ZERO-PILL DISCIPLINE METADATA IN GHOST BOX OR STATIC DESCRIPTIVE TAGS */}
                        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-900 rounded-md px-2.5 py-1 text-[10px] text-slate-400 tracking-wider uppercase font-mono font-bold">
                          {course.category}
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                          <span>{course.duration || '১০+ ঘণ্টা'} লার্নিং</span>
                          <span>·</span>
                          <span>লাইফটাইম অ্যাক্সেস</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-200 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                          {course.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Buy Module */}
                    <div className="p-5 pt-0 mt-auto space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-indigo-400 font-mono">৳{course.price}</span>
                        {course.prevPrice && (
                          <span className="text-xs text-slate-500 line-through font-mono">৳{course.prevPrice}</span>
                        )}
                        {course.discount && (
                          <span className="text-[10px] text-emerald-500 font-bold">({course.discount}% ছাড়)</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedItem(course)}
                          className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition duration-300 text-center"
                        >
                          বিস্তারিত দেখুন
                        </button>
                        <button
                          onClick={() => setCheckoutItem(course)}
                          className="w-1/2 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs rounded-lg shadow-md hover:shadow-indigo-950/30 transition duration-300 text-center"
                        >
                          কিনুন (Buy Now)
                        </button>
                      </div>
                    </div>

                  </div>
                ))}

                {filteredCourses.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-500 text-xs font-mono">
                    কোনো কোর্স পাওয়া যায়নি।
                  </div>
                )}
              </div>
            </section>

            {/* 5. DIGITAL PRODUCTS SECTION */}
            <section className="px-6 max-w-7xl mx-auto space-y-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 mb-1 font-mono">প্রিমিয়াম ক্রিয়েটিভ ফাইলস</div>
                  <h2 className="text-2xl md:text-3xl font-extrabold font-sans text-slate-100">ডিজিটাল টেমপ্লেটস ও মোশন প্রিসেটস</h2>
                </div>
                <button 
                  onClick={() => setActiveTab('products')}
                  className="group flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors shrink-0"
                >
                  <span>সব প্রোডাক্টস দেখুন</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Grid (Max 3 on home) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.slice(0, 3).map(product => (
                  <div 
                    key={product.id} 
                    className="group bg-slate-950 border border-slate-900 rounded-xl overflow-hidden hover:border-slate-800 transition-all duration-300 flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      {/* Product Visual */}
                      <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden flex items-center justify-center">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <span className="text-slate-700 text-xs font-mono">Editz Iqra Asset</span>
                        )}
                        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-900 rounded-md px-2.5 py-1 text-[10px] text-slate-400 tracking-wider uppercase font-mono font-bold">
                          {product.category}
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                          <span>ইনস্ট্যান্ট ডাউনলোড</span>
                          <span>·</span>
                          <span>লাইফটাইম আপডেট</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-200 line-clamp-1 group-hover:text-indigo-400 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Buy Module */}
                    <div className="p-5 pt-0 mt-auto space-y-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-indigo-400 font-mono">৳{product.price}</span>
                        {product.prevPrice && (
                          <span className="text-xs text-slate-500 line-through font-mono">৳{product.prevPrice}</span>
                        )}
                        {product.discount && (
                          <span className="text-[10px] text-emerald-500 font-bold">({product.discount}% ছাড়)</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedItem(product)}
                          className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold text-xs rounded-lg transition duration-300 text-center"
                        >
                          ফিচার দেখুন
                        </button>
                        <button
                          onClick={() => setCheckoutItem(product)}
                          className="w-1/2 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs rounded-lg shadow-md hover:shadow-indigo-950/30 transition duration-300 text-center"
                        >
                          কিনুন (Buy Now)
                        </button>
                      </div>
                    </div>

                  </div>
                ))}

                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-12 text-center text-slate-500 text-xs font-mono">
                    কোনো প্রোডাক্ট পাওয়া যায়নি।
                  </div>
                )}
              </div>
            </section>

            {/* 6. ACTIVE MEGAPACK/OFFERS SECTION */}
            {offers.length > 0 && (
              <section className="px-6 max-w-7xl mx-auto space-y-10">
                <div className="text-center space-y-2">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono">সীমিত সময়ের অফার (Special Combos)</div>
                  <h2 className="text-2xl md:text-3xl font-extrabold font-sans text-slate-100">মেগা কম্বো এবং স্পেশাল অফার সমূহ</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {offers.map(offer => (
                    <div 
                      key={offer.id} 
                      className="relative rounded-2xl bg-slate-950 border border-slate-900 overflow-hidden shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between"
                    >
                      {/* Background Visual Deco */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

                      {/* Image Thumbnail */}
                      <div className="w-full md:w-2/5 aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                        {offer.image ? (
                          <img src={offer.image} alt={offer.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-slate-700 text-xs font-mono">Combo Banner</span>
                        )}
                      </div>

                      {/* Offer Info */}
                      <div className="flex-1 space-y-4">
                        <div className="space-y-1.5">
                          <span className="px-2.5 py-0.5 text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-500/10 rounded font-bold uppercase font-mono tracking-wider">
                            Combo Offer
                          </span>
                          <h3 className="text-base font-bold text-slate-100 leading-snug">{offer.name}</h3>
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{offer.description}</p>
                        </div>

                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-extrabold text-indigo-400 font-mono">৳{offer.price}</span>
                          {offer.prevPrice && (
                            <span className="text-xs text-slate-500 line-through font-mono">৳{offer.prevPrice}</span>
                          )}
                          {offer.discount && (
                            <span className="text-[10px] font-bold text-emerald-500">({offer.discount}% ছাড়)</span>
                          )}
                        </div>

                        <button
                          onClick={() => setCheckoutItem(offer)}
                          className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs rounded-lg shadow-md transition duration-300 text-center uppercase tracking-wider"
                        >
                          অর্ডার করুন (Claim Offer)
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 7. WHY CHOOSE US */}
            <section className="px-6 max-w-7xl mx-auto space-y-12">
              <div className="text-center space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 font-mono">আমাদের বিশেষত্ব (Why Us)</div>
                <h2 className="text-2xl md:text-3xl font-extrabold font-sans text-slate-100">কেন Editz Iqra আপনার সেরা পছন্দ?</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="p-3 w-12 h-12 bg-indigo-950/50 border border-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">১-টু-১ গাইডলাইন</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      আমরা শুধু কোর্স দেই না! যেকোনো সমস্যায় রয়েছে আমাদের ডেডিকেটেড ফেসবুক সিক্রেট গ্রুপ ও টেলিগ্রাম কাস্টমার সাপোর্ট।
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="p-3 w-12 h-12 bg-indigo-950/50 border border-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">আজীবন অ্যাক্সেস (Lifetime Access)</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      আমাদের সব কোর্স ও টেমপ্লেটের রিসোর্স একবার কিনলে পাবেন আজীবন ব্যবহারের লাইসেন্স ও ফিউচার আপডেট ফ্রীতে!
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="p-3 w-12 h-12 bg-indigo-950/50 border border-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">সুরক্ষিত লেনদেন</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      বিকাশ বা নগদে নিরাপদে টাকা পাঠিয়ে সরাসরি Transaction ID সাবমিট করার সুযোগ এবং ভেরিফাইড অর্ডার রশিদ।
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 8. STATISTICS & CALL TO ACTION */}
            <section className="px-6 max-w-7xl mx-auto">
              <div className="relative rounded-3xl bg-slate-950 border border-slate-900 overflow-hidden p-8 md:p-12 text-center space-y-6">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-purple-500/5 blur-3xl pointer-events-none" />
                
                <h2 className="text-2xl md:text-4xl font-extrabold font-sans text-slate-100 max-w-2xl mx-auto leading-tight">
                  আজই শুরু করুন আপনার পছন্দের ডিজিটাল জার্নি!
                </h2>
                
                <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  আপনার ক্রিয়েটিভ স্কিল বাড়াতে আমাদের প্রিমিয়াম ভিডিও এডিটিং মাস্টারক্লাস অথবা সিনেমাটিক কালার গ্রেডিং LUTs এবং টেমপ্লেট দিয়ে আজই ডিজাইন লেভেল আপ করুন।
                </p>

                <div className="flex justify-center gap-4 pt-2">
                  <button 
                    onClick={() => setActiveTab('courses')}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs rounded-xl transition duration-300 transform active:scale-95"
                  >
                    জয়েন করুন এখনই
                  </button>
                  <button 
                    onClick={() => setActiveTab('checker')}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition duration-300"
                  >
                    পেমেন্ট রশিদ দেখুন
                  </button>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* ==================================================
            TAB: COURSES GRID VIEW
            ================================================== */}
        {activeTab === 'courses' && (
          <div className="py-12 px-6 max-w-7xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100">অনলাইন কোর্স সমুহ (Courses)</h2>
              <p className="text-xs text-slate-400 mt-1">সবগুলি প্রকাশিত প্রফেশনাল লেভেলের ভিডিও এডিটিং ও কন্টেন্ট ক্রিয়েশন কোর্স নিচে দেখুন।</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map(course => (
                <div key={course.id} className="group bg-slate-950 border border-slate-900 rounded-xl overflow-hidden hover:border-slate-800 transition duration-300 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden flex items-center justify-center">
                      {course.image ? (
                        <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <span className="text-slate-700 text-xs font-mono">Editz Iqra Course</span>
                      )}
                      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-900 rounded-md px-2.5 py-1 text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">
                        {course.category}
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <span>{course.duration || '১০+ ঘণ্টা'} লার্নিং</span>
                        <span>·</span>
                        <span>লাইফটাইম অ্যাক্সেস</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-200 line-clamp-1 group-hover:text-indigo-400 transition-colors">{course.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>
                    </div>
                  </div>
                  <div className="p-5 pt-0 mt-auto space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-indigo-400 font-mono">৳{course.price}</span>
                      {course.prevPrice && (
                        <span className="text-xs text-slate-500 line-through font-mono">৳{course.prevPrice}</span>
                      )}
                      {course.discount && (
                        <span className="text-[10px] text-emerald-500 font-bold">({course.discount}% ছাড়)</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedItem(course)}
                        className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs rounded-lg transition text-center"
                      >
                        বিস্তারিত দেখুন
                      </button>
                      <button
                        onClick={() => setCheckoutItem(course)}
                        className="w-1/2 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs rounded-lg shadow-md transition text-center"
                      >
                        কিনুন (Buy Now)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCourses.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 text-xs font-mono">
                  কোনো কোর্স পাওয়া যায়নি।
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: PRODUCTS GRID VIEW
            ================================================== */}
        {activeTab === 'products' && (
          <div className="py-12 px-6 max-w-7xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100">ডিজিটাল প্রোডাক্টস ও এসেটস (Digital Products)</h2>
              <p className="text-xs text-slate-400 mt-1">পিসি ও মোবাইল ভিডিও কালারিং এবং মোশন ডিজাইনের জন্য সিনেমাটিক টেমপ্লেট ও রিসোর্স প্যাকসমূহ।</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <div key={product.id} className="group bg-slate-950 border border-slate-900 rounded-xl overflow-hidden hover:border-slate-800 transition duration-300 flex flex-col justify-between shadow-lg">
                  <div>
                    <div className="relative aspect-[4/3] bg-slate-900 overflow-hidden flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <span className="text-slate-700 text-xs font-mono">Editz Iqra Product</span>
                      )}
                      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm border border-slate-900 rounded-md px-2.5 py-1 text-[10px] text-slate-400 font-bold uppercase font-mono tracking-wider">
                        {product.category}
                      </div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                        <span>ইনস্ট্যান্ট ডাউনলোড</span>
                        <span>·</span>
                        <span>লাইফটাইম আপডেট</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-200 line-clamp-1 group-hover:text-indigo-400 transition-colors">{product.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{product.description}</p>
                    </div>
                  </div>
                  <div className="p-5 pt-0 mt-auto space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-bold text-indigo-400 font-mono">৳{product.price}</span>
                      {product.prevPrice && (
                        <span className="text-xs text-slate-500 line-through font-mono">৳{product.prevPrice}</span>
                      )}
                      {product.discount && (
                        <span className="text-[10px] text-emerald-500 font-bold">({product.discount}% ছাড়)</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedItem(product)}
                        className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs rounded-lg transition text-center"
                      >
                        বিস্তারিত দেখুন
                      </button>
                      <button
                        onClick={() => setCheckoutItem(product)}
                        className="w-1/2 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs rounded-lg shadow-md transition text-center"
                      >
                        কিনুন (Buy Now)
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 text-xs font-mono">
                  কোনো প্রোডাক্ট পাওয়া যায়নি।
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: MEGAPACKS & COMBOS
            ================================================== */}
        {activeTab === 'offers' && (
          <div className="py-12 px-6 max-w-7xl mx-auto space-y-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100">মেগা কম্বো এবং স্পেশাল অফার সমূহ (Mega Offers)</h2>
              <p className="text-xs text-slate-400 mt-1">সবগুলি সক্রিয় কম্বো প্যাক, প্রিসেট বান্ডেল এবং বিশাল ডিসকাউন্ট অফার নীচে দেখুন।</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {offers.map(offer => (
                <div 
                  key={offer.id} 
                  className="relative rounded-2xl bg-slate-950 border border-slate-900 overflow-hidden shadow-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center justify-between"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="w-full md:w-2/5 aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    {offer.image ? (
                      <img src={offer.image} alt={offer.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-700 text-xs font-mono">Combo Banner</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-1.5">
                      <span className="px-2.5 py-0.5 text-[10px] bg-indigo-950 text-indigo-400 border border-indigo-500/10 rounded font-bold uppercase font-mono tracking-wider">
                        Combo Offer
                      </span>
                      <h3 className="text-base font-bold text-slate-100 leading-snug">{offer.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{offer.description}</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-extrabold text-indigo-400 font-mono">৳{offer.price}</span>
                      {offer.prevPrice && (
                        <span className="text-xs text-slate-500 line-through font-mono">৳{offer.prevPrice}</span>
                      )}
                      {offer.discount && (
                        <span className="text-[10px] font-bold text-emerald-500">({offer.discount}% ছাড়)</span>
                      )}
                    </div>
                    <button
                      onClick={() => setCheckoutItem(offer)}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs rounded-lg shadow-md transition text-center uppercase tracking-wider"
                    >
                      অর্ডার করুন (Claim Offer)
                    </button>
                  </div>
                </div>
              ))}
              {offers.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-500 text-xs font-mono">
                  বর্তমানে কোনো সক্রিয় স্পেশাল অফার নেই।
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: ORDER CHECK / RECEIPT DOWNLOADER
            ================================================== */}
        {activeTab === 'checker' && (
          <div className="py-16 px-6 max-w-xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100">রশিদ ও অর্ডার ট্র্যাকিং</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                পেমেন্ট তথ্য সাবমিট করার পর প্রাপ্ত ৫ সংখ্যার অর্ডার আইডি (যেমন: EQ-1002) দিয়ে আপনার রশিদ ও ভেরিফিকেশন স্ট্যাটাস চেক করুন।
              </p>
            </div>

            <form onSubmit={handleCheckOrder} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
              {checkerError && (
                <div className="p-3 text-xs text-red-400 bg-red-950/20 border border-red-900/50 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{checkerError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs text-slate-400 mb-1.5 font-semibold">আপনার ৫ সংখ্যার অর্ডার আইডি দিন *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: EQ-1002"
                  value={checkerOrderId}
                  onChange={(e) => setCheckerOrderId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm font-mono tracking-wider focus:outline-none focus:border-indigo-500 uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={checkerLoading}
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs rounded-lg shadow transition flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                {checkerLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>চেক করা হচ্ছে...</span>
                  </>
                ) : (
                  <span>সার্চ করুন (Track Order)</span>
                )}
              </button>
            </form>

            {/* Checker Results */}
            {checkerResult && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">অর্ডার আইডি</span>
                    <h3 className="text-base font-bold text-slate-200 font-mono tracking-wider">{checkerResult.id}</h3>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block text-right">স্ট্যাটাস</span>
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border mt-1 ${
                      checkerResult.status === 'Completed' ? 'bg-indigo-950 text-indigo-400 border-indigo-500/20' :
                      checkerResult.status === 'Verified' ? 'bg-emerald-950 text-emerald-400 border-emerald-500/20' :
                      checkerResult.status === 'Rejected' ? 'bg-red-950 text-red-400 border-red-500/20' :
                      'bg-pink-950 text-pink-400 border-pink-500/20'
                    }`}>
                      {checkerResult.status}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 text-xs space-y-2 leading-relaxed">
                  <div className="flex justify-between">
                    <span className="text-slate-500">গ্রাহকের নাম:</span>
                    <span className="text-slate-300 font-semibold">{checkerResult.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">মোবাইল নম্বর:</span>
                    <span className="text-slate-300 font-mono">{checkerResult.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">আইটেম/কোর্স:</span>
                    <span className="text-slate-300">{checkerResult.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">পেমেন্ট পদ্ধতি:</span>
                    <span className="text-slate-300">{checkerResult.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction ID:</span>
                    <span className="text-slate-300 font-mono text-indigo-400 uppercase font-bold">{checkerResult.transactionId}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900 pt-2 font-semibold">
                    <span className="text-slate-400">টাকার পরিমাণ:</span>
                    <span className="text-indigo-400 font-mono">৳{checkerResult.amount}</span>
                  </div>
                </div>

                {checkerResult.status === 'Verified' || checkerResult.status === 'Completed' ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-950/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-400 leading-relaxed text-center">
                      ✓ অভিনন্দন! আপনার পেমেন্ট ভেরিফাই হয়েছে। নিচে দেওয়া বাটন দিয়ে অফিসিয়াল রশিদ ডাউনলোড করুন।
                    </div>
                    <ReceiptDownloader order={checkerResult} buttonClassName="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/20 transition duration-300 cursor-pointer" />
                    <CourseProgressTracker order={checkerResult} />
                  </div>
                ) : checkerResult.status === 'Rejected' ? (
                  <div className="p-3 bg-red-950/10 border border-red-500/20 rounded-lg text-xs text-red-400 leading-relaxed text-center">
                    ✗ দুঃখিত! আপনার পেমেন্ট তথ্য অমিল হওয়ায় ভেরিফিকেশন বাতিল হয়েছে। সঠিক বিবরণ দিয়ে পুনরায় চেকআউট করুন।
                  </div>
                ) : (
                  <div className="p-3 bg-pink-950/10 border border-pink-500/20 rounded-lg text-xs text-pink-400 leading-relaxed text-center">
                    ⏳ আপনার পেমেন্টটি বর্তমানে ভেরিফিকেশনের অপেক্ষায় রয়েছে। ৫ থেকে ৩০ মিনিটের মধ্যে অ্যাডমিন ভেরিফাই করে দেবে। অনুগ্রহ করে পরে চেক করুন।
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================================================
            TAB: ABOUT US
            ================================================== */}
        {activeTab === 'about' && (
          <div className="py-16 px-6 max-w-3xl mx-auto space-y-8 leading-relaxed">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100">আমাদের লক্ষ্য ও উদ্দেশ্য</h2>
              <p className="text-xs text-slate-400">Editz Iqra - Elevate Your Digital Skills</p>
            </div>

            <div className="space-y-6 text-xs text-slate-300">
              <p>
                <strong>Editz Iqra</strong> হলো বাংলাদেশের শীর্ষস্থানীয় একটি ডিজিটাল অনলাইন লার্নিং প্ল্যাটফর্ম। আমাদের মূল লক্ষ্য হলো বাংলাদেশের তরুণ এবং ক্রিয়েটিভ ডিজাইনারদের দক্ষতাকে বিশ্বমানের পর্যায়ে নিয়ে যাওয়া। আমরা প্রধানত প্রিমিয়াম ভিডিও এডিটিং কোর্স, মোশন গ্রাফিক্স রিসোর্স, কালার গ্রেডিং LUTs, এবং মোবাইল ক্যাপকাট বা পিসির বিভিন্ন প্রিসেট ফাইল সরবরাহ করে থাকি।
              </p>
              <p>
                ভিডিও এডিটিং বা কন্টেন্ট ক্রিয়েশন ইন্ডাস্ট্রিতে কাজ করার জন্য সঠিক টেমপ্লেট ও রিসোর্সের গুরুত্ব অপরিসীম। আমাদের এই প্ল্যাটফর্ম থেকে শিক্ষার্থীরা শুধু শেখেই না, বরং এক ক্লিকেই ব্যবহারযোগ্য সিনেমাটিক ইফেক্ট এবং টেমপ্লেট সংগ্রহ করতে পারে, যা তাদের মূল্যবান কাজের গতিকে বহুগুণ বাড়িয়ে দেয়।
              </p>
              <h3 className="text-sm font-bold text-slate-200 mt-6">✓ আমাদের মূল সেবাসমূহ:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>অ্যাডোবি প্রিমিয়ার প্রো এবং আফটার ইফেক্টসের প্রফেশনাল লেভেলের অনলাইন কোর্স।</li>
                <li>১ ক্লিকেই কালার কারেকশনের জন্য প্রিমিয়াম সিনেমাটিক LUTs ও মোবাইল প্রিসেটস।</li>
                <li>রেডি-মেড সোশ্যাল মিডিয়া ভিডিও এডিটিং মোশন টেমপ্লেটস ও প্রজেক্ট ফাইল।</li>
                <li>২৪/৭ গ্রুপ সাপোর্ট ও ১-টু-১ গাইডলাইন সিক্রেট কমিউনিটি গ্রুপ ফোরাম।</li>
              </ul>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB: CONTACT VIEW
            ================================================== */}
        {activeTab === 'contact' && (
          <div className="py-16 px-6 max-w-xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-100">যোগাযোগ করুন (Contact Support)</h2>
              <p className="text-xs text-slate-400">Editz Iqra-র যেকোনো প্রয়োজনে সরাসরি আমাদের সাথে যোগাযোগ করুন।</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-900">
                  <div className="p-2.5 bg-emerald-950/50 text-emerald-400 rounded-lg">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.775-1.461L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.736.001-2.599-2.072-5.043-3.898-6.866-1.828-1.824-4.264-2.83-6.832-2.83-5.44 0-9.864 4.37-9.867 9.739-.001 1.737.525 3.326 1.522 4.743L1.382 21.05l4.887-1.772c.11.063.218.125.328.176zm11.378-4.88c-.28-.141-1.657-.818-1.913-.912-.257-.093-.443-.141-.63.14-.187.28-.724.912-.888 1.099-.163.187-.327.21-.607.07-.28-.14-1.18-.435-2.247-1.387-.83-.74-1.39-1.653-1.553-1.934-.163-.28-.017-.43.124-.57.127-.126.28-.327.42-.49.14-.163.187-.28.28-.467.094-.187.047-.35-.023-.49-.07-.14-.63-1.517-.863-2.078-.227-.547-.457-.473-.63-.48l-.536-.01c-.187 0-.49.07-.747.35-.257.28-.98.958-.98 2.336s1.003 2.71 1.143 2.897c.14.187 1.975 3.017 4.784 4.225.668.287 1.19.458 1.597.587.672.213 1.284.183 1.767.11.539-.08 1.657-.677 1.89-1.332.233-.654.233-1.215.163-1.332-.07-.117-.257-.187-.537-.327z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">সরাসরি হোয়াটসঅ্যাপ</span>
                    <a href="https://api.whatsapp.com/send?phone=8801821985354" target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-slate-200 hover:text-emerald-400 transition-colors">
                      +880 1821-985354 (০১৮২১৯৮৫৩৫৪)
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-900">
                  <div className="p-2.5 bg-indigo-950/50 text-indigo-400 rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">অফিসিয়াল ইমেইল</span>
                    <a href="mailto:iqrasahadath590@gmail.com" className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition-colors">
                      iqrasahadath590@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="text-center p-4 bg-indigo-950/10 border border-indigo-500/10 rounded-xl">
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  অর্ডার সংক্রান্ত সাহায্য বা কোর্স সম্পর্কে যেকোনো প্রশ্ন জিজ্ঞেস করতে সরাসরি নিচের বাটনে ক্লিক করে হোয়াটসঅ্যাপে মেসেজ পাঠান।
                </p>
                <a 
                  href="https://api.whatsapp.com/send?phone=8801821985354" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/20 transition-all transform active:scale-95 uppercase tracking-wide cursor-pointer"
                >
                  হোয়াটসঅ্যাপে মেসেজ পাঠান
                </a>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==================================================
          10. FOOTER SECTION
          ================================================== */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3 col-span-1 md:col-span-2">
            <span className="text-lg font-bold font-serif bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Editz Iqra</span>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              বাংলাদেশের অন্যতম প্রিমিয়াম অনলাইন লার্নিং ও ডিজিটাল পণ্য বিক্রয় কেন্দ্র। ভিডিও এডিটিং কোর্স এবং হাই কোয়ালিটি মোশন প্রিসেট দিয়ে আপনার ডিজিটাল দক্ষতা বাড়ান।
            </p>
            <p className="text-[10px] text-slate-600 font-mono">© {new Date().getFullYear()} Editz Iqra. All Rights Reserved.</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">কুইক লিংক</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <button onClick={() => setActiveTab('home')} className="hover:text-slate-300 text-left">মূলপাতা</button>
              <button onClick={() => setActiveTab('courses')} className="hover:text-slate-300 text-left">কোর্স সমুহ</button>
              <button onClick={() => setActiveTab('products')} className="hover:text-slate-300 text-left">ডিজিটাল প্রোডাক্টস</button>
              <button onClick={() => setActiveTab('offers')} className="hover:text-slate-300 text-left">কম্বো অফার</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-sans">হেল্প ও সাপোর্ট</h4>
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <button onClick={() => setActiveTab('checker')} className="hover:text-slate-300 text-left">পেমেন্ট রশিদ ডাউনলোড</button>
              <button onClick={() => setActiveTab('about')} className="hover:text-slate-300 text-left">আমাদের উদ্দেশ্য</button>
              <span className="text-[10px] font-mono text-slate-500">ইমেইল: iqrasahadath590@gmail.com</span>
              <a href="https://api.whatsapp.com/send?phone=8801821985354" target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono text-emerald-400 hover:underline">হোয়াটসঅ্যাপ সাপোর্ট: ০১৮২১৯৮৫৩৫৪</a>
              <span className="text-[10px] font-mono text-indigo-400 block hover:underline cursor-pointer" onClick={() => setShowAdmin(true)}>🔒 অ্যাডমিন এরিয়া</span>
            </div>
          </div>

        </div>
      </footer>

      {/* ==================================================
          POPUP MODAL: PRODUCT DETAILS
          ================================================== */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
            
            {/* Image Preview Slot */}
            <div className="relative aspect-[16/9] bg-slate-900 flex items-center justify-center overflow-hidden">
              {selectedItem.image ? (
                <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-slate-700 text-xs font-mono">Editz Iqra Visual</span>
              )}
              <button 
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-slate-100 rounded-full transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Details */}
            <div className="p-6 md:p-8 space-y-6 max-h-[50vh] overflow-y-auto text-xs leading-relaxed">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">{selectedItem.category}</span>
                <h3 className="text-lg md:text-xl font-bold text-slate-200 leading-snug">{selectedItem.name}</h3>
                <p className="text-slate-400">{selectedItem.description}</p>
              </div>

              {/* What You Will Learn List */}
              {selectedItem.learnings && selectedItem.learnings.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="font-bold text-slate-200 text-sm">✓ যা যা শিখতে পারবেন / প্যাকে যা পাবেন:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-400">
                    {selectedItem.learnings.map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Features */}
              {selectedItem.features && selectedItem.features.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="font-bold text-slate-200 text-sm">💡 এই কোর্সের বিশেষ বৈশিষ্ট্যসমূহ:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-400">
                    {selectedItem.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.duration && (
                <div className="flex items-center gap-2 text-slate-400 border-t border-slate-900 pt-4">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>কোর্স ডিউরেশন: <strong className="text-slate-200 font-mono">{selectedItem.duration}</strong></span>
                </div>
              )}

              {/* Action pricing and buy button */}
              <div className="flex items-center justify-between border-t border-slate-900 pt-5 mt-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-extrabold text-indigo-400 font-mono">৳{selectedItem.price}</span>
                  {selectedItem.prevPrice && (
                    <span className="text-xs text-slate-500 line-through font-mono">৳{selectedItem.prevPrice}</span>
                  )}
                  {selectedItem.discount && (
                    <span className="text-[10px] text-emerald-500 font-bold">({selectedItem.discount}% ছাড়)</span>
                  )}
                </div>
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-lg transition"
                  >
                    বন্ধ করুন
                  </button>
                  <button
                    onClick={() => {
                      setCheckoutItem(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-indigo-950/30 transition transform active:scale-95"
                  >
                    কিনুন (Buy Now)
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          POPUP MODAL: PAYMENT MODAL CONTROLLER
          ================================================== */}
      {checkoutItem && (
        <PaymentModal
          item={checkoutItem}
          paymentSettings={settings.payment}
          onClose={() => setCheckoutItem(null)}
          onSuccess={(orderId) => {
            setSuccessOrderId(orderId);
            setCheckoutItem(null);
            // Auto open checker and set id
            setActiveTab('checker');
            setCheckerOrderId(orderId);
          }}
        />
      )}

      {/* Success Order Overlay Alert */}
      {successOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-3 w-16 h-16 bg-emerald-950/60 border border-emerald-500/20 rounded-full text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">পেমেন্ট সফলভাবে জমা হয়েছে!</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              আপনার পেমেন্ট বিবরণী এডমিনের কাছে পাঠানো হয়েছে। অনুগ্রহ করে যাচাই করার জন্য অপেক্ষা করুন। আপনার অর্ডার আইডি নিচে দেওয়া হলো:
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-base font-extrabold text-indigo-400 tracking-wider">
              {successOrderId}
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
              পেমেন্ট ভেরিফাই হতে সাধারণ ৫-৩০ মিনিট সময় লাগতে পারে। অর্ডার আইডিটি লিখে রাখুন।
            </p>
            <button
              onClick={() => {
                setSuccessOrderId('');
                // Fetch to check the newly submitted order status
                setCheckerOrderId(successOrderId);
                const checkSubmit = async () => {
                  setCheckerLoading(true);
                  try {
                    const res = await fetch(`/api/orders/${successOrderId}`);
                    const data = await res.json();
                    if (res.ok && data.success) {
                      setCheckerResult(data.order);
                    }
                  } catch {}
                  setCheckerLoading(false);
                };
                checkSubmit();
              }}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow transition"
            >
              স্ট্যাটাস চেক করুন
            </button>
          </div>
        </div>
      )}

      {/* ==================================================
          ADMIN PANEL CONTROLLER Overlay
          ================================================== */}
      {showAdmin && (
        <AdminPanel
          onClose={() => {
            setShowAdmin(false);
            // Refresh public website state after closing admin changes
            fetchPublicData();
          }}
        />
      )}

      {/* WhatsApp Floating Icon */}
      <a 
        href="https://api.whatsapp.com/send?phone=8801821985354" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 z-40 p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/20 hover:scale-110 transition duration-300 flex items-center justify-center animate-bounce"
        title="WhatsApp Support"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.775-1.461L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.736.001-2.599-2.072-5.043-3.898-6.866-1.828-1.824-4.264-2.83-6.832-2.83-5.44 0-9.864 4.37-9.867 9.739-.001 1.737.525 3.326 1.522 4.743L1.382 21.05l4.887-1.772c.11.063.218.125.328.176zm11.378-4.88c-.28-.141-1.657-.818-1.913-.912-.257-.093-.443-.141-.63.14-.187.28-.724.912-.888 1.099-.163.187-.327.21-.607.07-.28-.14-1.18-.435-2.247-1.387-.83-.74-1.39-1.653-1.553-1.934-.163-.28-.017-.43.124-.57.127-.126.28-.327.42-.49.14-.163.187-.28.28-.467.094-.187.047-.35-.023-.49-.07-.14-.63-1.517-.863-2.078-.227-.547-.457-.473-.63-.48l-.536-.01c-.187 0-.49.07-.747.35-.257.28-.98.958-.98 2.336s1.003 2.71 1.143 2.897c.14.187 1.975 3.017 4.784 4.225.668.287 1.19.458 1.597.587.672.213 1.284.183 1.767.11.539-.08 1.657-.677 1.89-1.332.233-.654.233-1.215.163-1.332-.07-.117-.257-.187-.537-.327z" />
        </svg>
      </a>

    </div>
  );
}
