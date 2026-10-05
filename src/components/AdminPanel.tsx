import React, { useState, useEffect } from 'react';
import { 
  Lock, LayoutDashboard, BookOpen, Download, Percent, Settings, 
  TrendingUp, Users, AlertCircle, Trash2, Edit, Plus, Check, X,
  LogOut, Upload, CheckCircle, Smartphone, Sliders, Menu, XCircle
} from 'lucide-react';
import { Course, Product, Offer, Order, HeroSettings, AppSettings } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'products' | 'offers' | 'hero' | 'settings' | 'orders'>('dashboard');
  
  // Data State
  const [statistics, setStatistics] = useState({
    totalCourses: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingPayments: 0,
    verifiedPayments: 0,
    revenue: 0
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  // Form/Modal states
  const [courseModal, setCourseModal] = useState<{ open: boolean; data: Partial<Course> | null }>({ open: false, data: null });
  const [productModal, setProductModal] = useState<{ open: boolean; data: Partial<Product> | null }>({ open: false, data: null });
  const [offerModal, setOfferModal] = useState<{ open: boolean; data: Partial<Offer> | null }>({ open: false, data: null });
  
  // Mobile UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('editz_iqra_admin_token');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch('/api/admin/verify', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setIsAuthenticated(true);
        loadAdminData(token);
      } else {
        localStorage.removeItem('editz_iqra_admin_token');
      }
    } catch {
      localStorage.removeItem('editz_iqra_admin_token');
    }
  };

  const loadAdminData = async (token = localStorage.getItem('editz_iqra_admin_token')) => {
    try {
      const res = await fetch('/api/admin/data', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStatistics({
          totalCourses: data.statistics.totalCourses,
          totalProducts: data.statistics.totalProducts,
          totalOrders: data.statistics.totalOrders,
          pendingPayments: data.statistics.pendingOrders,
          verifiedPayments: data.statistics.verifiedOrders,
          revenue: data.statistics.revenue
        });
        setCourses(data.courses);
        setProducts(data.products);
        setOffers(data.offers);
        setOrders(data.orders);
        setHero(data.hero);
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error loading admin data', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('editz_iqra_admin_token', data.token);
        setIsAuthenticated(true);
        loadAdminData(data.token);
      } else {
        setLoginError(data.error || 'ভুল পাসওয়ার্ড!');
      }
    } catch {
      setLoginError('সার্ভারে যোগাযোগ করা যায়নি।');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('editz_iqra_admin_token');
    setIsAuthenticated(false);
  };

  // Helper to handle image uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const token = localStorage.getItem('editz_iqra_admin_token');
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseModal.data) return;
    const token = localStorage.getItem('editz_iqra_admin_token');
    
    // Automatically calculate discount if prevPrice is set
    const price = Number(courseModal.data.price || 0);
    const prevPrice = Number(courseModal.data.prevPrice || 0);
    let discount = undefined;
    if (prevPrice > price) {
      discount = Math.round(((prevPrice - price) / prevPrice) * 100);
    }

    const payload = { ...courseModal.data, price, prevPrice, discount };

    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setCourseModal({ open: false, data: null });
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    const token = localStorage.getItem('editz_iqra_admin_token');
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productModal.data) return;
    const token = localStorage.getItem('editz_iqra_admin_token');
    
    const price = Number(productModal.data.price || 0);
    const prevPrice = Number(productModal.data.prevPrice || 0);
    let discount = undefined;
    if (prevPrice > price) {
      discount = Math.round(((prevPrice - price) / prevPrice) * 100);
    }

    const payload = { ...productModal.data, price, prevPrice, discount };

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setProductModal({ open: false, data: null });
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const token = localStorage.getItem('editz_iqra_admin_token');
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerModal.data) return;
    const token = localStorage.getItem('editz_iqra_admin_token');
    
    const price = Number(offerModal.data.price || 0);
    const prevPrice = Number(offerModal.data.prevPrice || 0);
    let discount = undefined;
    if (prevPrice > price) {
      discount = Math.round(((prevPrice - price) / prevPrice) * 100);
    }

    const payload = { ...offerModal.data, price, prevPrice, discount };

    try {
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setOfferModal({ open: false, data: null });
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    const token = localStorage.getItem('editz_iqra_admin_token');
    try {
      const res = await fetch(`/api/admin/offers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    const token = localStorage.getItem('editz_iqra_admin_token');
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hero) return;
    const token = localStorage.getItem('editz_iqra_admin_token');
    try {
      const res = await fetch('/api/admin/hero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(hero)
      });
      if (res.ok) {
        alert('হিরো সেকশন পরিবর্তনগুলো সফলভাবে আপডেট করা হয়েছে!');
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    const token = localStorage.getItem('editz_iqra_admin_token');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert('পেমেন্ট ও প্রচার সেটিংস সফলভাবে সেভ করা হয়েছে!');
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3 bg-indigo-950/60 border border-indigo-500/20 rounded-xl mb-3 text-indigo-400">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">অ্যাডমিন লগইন</h3>
            <p className="text-xs text-slate-400 mt-1">সুরক্ষিত এডমিন প্যানেল প্রবেশ করুন</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 text-xs text-red-400 bg-red-950/20 border border-red-900/40 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider">পাসওয়ার্ড প্রদান করুন</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 text-xs text-slate-400 border border-slate-800 rounded-lg hover:bg-slate-950 transition"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                className="w-1/2 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow shadow-indigo-950/30 transition"
              >
                প্রবেশ করুন
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="md:hidden p-1.5 bg-slate-800 rounded text-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Editz Iqra Admin</span>
          <span className="hidden md:inline px-2 py-0.5 text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/20 rounded font-mono font-bold uppercase">Online Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-red-950 hover:text-red-300 border border-slate-700 hover:border-red-900 text-slate-300 rounded-lg text-xs transition font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>লগআউট</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded bg-slate-800/50 hover:bg-slate-800 border border-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Navigation Sidebar */}
        <aside className={`
          absolute md:relative inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-10 transition-transform duration-300 shrink-0 flex flex-col justify-between
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <nav className="p-4 space-y-1.5 overflow-y-auto">
            <button
              onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>ড্যাশবোর্ড (Dashboard)</span>
            </button>
            <button
              onClick={() => { setActiveTab('orders'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'orders' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <Download className="w-4 h-4" />
              <span>অর্ডার ও পেমেন্ট ({orders.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('courses'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'courses' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>কোর্স সমুহ ({courses.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'products' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <Smartphone className="w-4 h-4" />
              <span>ডিজিটাল প্রোডাক্টস ({products.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('offers'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'offers' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <Percent className="w-4 h-4" />
              <span>মেগা অফার্স ({offers.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab('hero'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'hero' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <Sliders className="w-4 h-4" />
              <span>হিরো সেকশন পরিবর্তন</span>
            </button>
            <button
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-semibold transition ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <Settings className="w-4 h-4" />
              <span>পেমেন্ট ও সাইট সেটিংস</span>
            </button>
          </nav>
          <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-center text-[10px] text-slate-500 font-mono">
            Editz Iqra Engine v1.0.0
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-950">
          
          {/* TAB: Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                <span>মেইন ড্যাশবোর্ড ওভারভিউ (Dashboard)</span>
              </h2>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">মোট কোর্স</div>
                  <div className="text-2xl font-bold font-mono text-slate-100">{statistics.totalCourses} টি</div>
                </div>
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">মোট ডিজিটাল পণ্য</div>
                  <div className="text-2xl font-bold font-mono text-slate-100">{statistics.totalProducts} টি</div>
                </div>
                <div className="p-5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400 mb-1">মোট অর্ডার সমুহ</div>
                  <div className="text-2xl font-bold font-mono text-slate-100">{statistics.totalOrders} টি</div>
                </div>
                <div className="p-5 rounded-xl bg-pink-950/10 border border-pink-900/30">
                  <div className="text-xs text-pink-400 mb-1">অপেক্ষমান পেমেন্ট (Pending)</div>
                  <div className="text-2xl font-bold font-mono text-pink-400">{statistics.pendingPayments} টি</div>
                </div>
                <div className="p-5 rounded-xl bg-emerald-950/10 border border-emerald-900/30">
                  <div className="text-xs text-emerald-400 mb-1">যাচাইকৃত অর্ডার (Verified)</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">{statistics.verifiedPayments} টি</div>
                </div>
                <div className="p-5 rounded-xl bg-violet-950/10 border border-violet-900/30">
                  <div className="text-xs text-violet-400 mb-1 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> মোট অর্জিত রেভিনিউ
                  </div>
                  <div className="text-2xl font-bold font-mono text-violet-400">৳ {statistics.revenue.toLocaleString()}</div>
                </div>
              </div>

              {/* Recent Pending Orders */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-6">
                <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-sm text-slate-200">অপেক্ষমান পেমেন্ট তালিকা (Pending Verification)</h3>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    সব অর্ডার দেখুন →
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                        <th className="px-5 py-3">অর্ডার আইডি</th>
                        <th className="px-5 py-3">গ্রাহক</th>
                        <th className="px-5 py-3">মোবাইল</th>
                        <th className="px-5 py-3">পণ্য / কোর্স</th>
                        <th className="px-5 py-3">টাকার পরিমাণ</th>
                        <th className="px-5 py-3">পদ্ধতি & TRX ID</th>
                        <th className="px-5 py-3 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {orders.filter(o => o.status === 'Pending').length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-8 text-center text-slate-500">
                            কোনো অপেক্ষমান পেমেন্ট পাওয়া যায়নি।
                          </td>
                        </tr>
                      ) : (
                        orders.filter(o => o.status === 'Pending').map(order => (
                          <tr key={order.id} className="hover:bg-slate-950/50 transition">
                            <td className="px-5 py-4 font-mono font-semibold text-slate-200">{order.id}</td>
                            <td className="px-5 py-4 font-medium text-slate-300">{order.customerName}</td>
                            <td className="px-5 py-4 font-mono text-slate-400">{order.phone}</td>
                            <td className="px-5 py-4 text-slate-300">{order.productName}</td>
                            <td className="px-5 py-4 font-bold font-mono text-indigo-400">৳{order.amount}</td>
                            <td className="px-5 py-4">
                              <span className="font-semibold text-slate-200">{order.paymentMethod}</span>
                              <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{order.transactionId}</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'Verified')}
                                  className="p-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 rounded transition"
                                  title="Verify Payment"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'Rejected')}
                                  className="p-1 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 rounded transition"
                                  title="Reject Order"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-1 bg-red-950/20 hover:bg-red-950 border border-red-900/30 text-red-400 rounded transition"
                                  title="Delete Order Record"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Orders/Payments */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-indigo-400" />
                  <span>অর্ডার ও পেমেন্ট ট্র্যাকিং (Orders/Payments)</span>
                </span>
              </h2>

              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto font-sans">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase">
                        <th className="px-5 py-3">অর্ডার আইডি</th>
                        <th className="px-5 py-3">গ্রাহক</th>
                        <th className="px-5 py-3">মোবাইল</th>
                        <th className="px-5 py-3">পণ্য / কোর্স</th>
                        <th className="px-5 py-3">পরিমাণ</th>
                        <th className="px-5 py-3">পদ্ধতি ও TRX</th>
                        <th className="px-5 py-3">তারিখ</th>
                        <th className="px-5 py-3 text-center">স্ট্যাটাস</th>
                        <th className="px-5 py-3 text-center">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {orders.map(order => (
                        <tr key={order.id} className="hover:bg-slate-950/50 transition">
                          <td className="px-5 py-4 font-mono font-semibold text-slate-200">{order.id}</td>
                          <td className="px-5 py-4 text-slate-300 font-semibold">{order.customerName}</td>
                          <td className="px-5 py-4 font-mono text-slate-400">{order.phone}</td>
                          <td className="px-5 py-4 text-slate-300">{order.productName}</td>
                          <td className="px-5 py-4 font-bold font-mono text-slate-200">৳{order.amount}</td>
                          <td className="px-5 py-4">
                            <span className="font-semibold text-slate-300">{order.paymentMethod}</span>
                            <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{order.transactionId}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-400 font-mono">{new Date(order.date).toLocaleDateString('bn-BD')}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                              order.status === 'Completed' ? 'bg-indigo-950/50 text-indigo-400 border-indigo-500/20' :
                              order.status === 'Verified' ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/20' :
                              order.status === 'Rejected' ? 'bg-red-950/50 text-red-400 border-red-500/20' :
                              'bg-pink-950/50 text-pink-400 border-pink-500/20'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-center gap-2">
                              {order.status === 'Pending' && (
                                <>
                                  <button 
                                    onClick={() => updateOrderStatus(order.id, 'Verified')}
                                    className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-400 rounded text-[10px] font-semibold transition"
                                  >
                                    Verify
                                  </button>
                                  <button 
                                    onClick={() => updateOrderStatus(order.id, 'Rejected')}
                                    className="px-2 py-1 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 rounded text-[10px] font-semibold transition"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {order.status === 'Verified' && (
                                <>
                                  <button 
                                    onClick={() => updateOrderStatus(order.id, 'Completed')}
                                    className="px-2 py-1 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500/30 text-indigo-400 rounded text-[10px] font-semibold transition"
                                  >
                                    Complete
                                  </button>
                                  <button 
                                    onClick={() => updateOrderStatus(order.id, 'Rejected')}
                                    className="px-2 py-1 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 rounded text-[10px] font-semibold transition"
                                  >
                                    Cancel
                                  </button>
                                </>
                              )}
                              {order.status === 'Completed' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'Rejected')}
                                  className="px-2 py-1 bg-red-950 hover:bg-red-900 border border-red-500/30 text-red-400 rounded text-[10px] font-semibold transition"
                                >
                                  Cancel
                                </button>
                              )}
                              {order.status === 'Rejected' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'Pending')}
                                  className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px] font-semibold transition"
                                >
                                  Re-open
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteOrder(order.id)}
                                className="p-1 bg-red-950/20 hover:bg-red-950 border border-red-900/30 text-red-400 rounded transition shrink-0"
                                title="Delete Order Record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Courses */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <span>অনলাইন কোর্স সমুহ (Courses)</span>
                </h2>
                <button
                  onClick={() => setCourseModal({ open: true, data: { features: [], learnings: [] } })}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-indigo-950/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন কোর্স যোগ করুন</span>
                </button>
              </div>

              {/* Course list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition">
                    <div className="h-40 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                      {course.image ? (
                        <img src={course.image} alt={course.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-600 text-xs">নো ইমেজ থাম্বনেইল</span>
                      )}
                      <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-slate-900/80 border border-slate-700 text-slate-300 rounded uppercase">
                        {course.status}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide">{course.category}</span>
                      <h4 className="font-bold text-slate-100 text-sm line-clamp-1">{course.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{course.description}</p>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-bold text-slate-100">৳{course.price}</span>
                        {course.prevPrice && (
                          <span className="text-xs text-slate-500 line-through">৳{course.prevPrice}</span>
                        )}
                        {course.discount && (
                          <span className="text-[10px] text-indigo-400 font-bold">({course.discount}% ছাড়)</span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => setCourseModal({ open: true, data: course })}
                          className="w-1/2 flex items-center justify-center gap-1 py-1.5 border border-slate-800 hover:bg-slate-800 rounded text-xs font-semibold text-slate-300 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>এডিট করুন</span>
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="w-1/2 flex items-center justify-center gap-1 py-1.5 border border-red-950 hover:bg-red-950/40 text-red-400 rounded text-xs font-semibold transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ডিলেট করুন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Products */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  <span>ডিজিটাল প্রোডাক্টস (Digital Products)</span>
                </h2>
                <button
                  onClick={() => setProductModal({ open: true, data: { features: [], learnings: [] } })}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-indigo-950/40"
                >
                  <Plus className="w-4 h-4" />
                  <span>প্রোডাক্ট যোগ করুন</span>
                </button>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition">
                    <div className="h-40 bg-slate-950 relative overflow-hidden flex items-center justify-center">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-600 text-xs">নো ইমেজ থাম্বনেইল</span>
                      )}
                      <div className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold bg-slate-900/80 border border-slate-700 text-slate-300 rounded uppercase">
                        {product.status}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide">{product.category}</span>
                      <h4 className="font-bold text-slate-100 text-sm line-clamp-1">{product.name}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{product.description}</p>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-bold text-slate-100">৳{product.price}</span>
                        {product.prevPrice && (
                          <span className="text-xs text-slate-500 line-through">৳{product.prevPrice}</span>
                        )}
                        {product.discount && (
                          <span className="text-[10px] text-indigo-400 font-bold">({product.discount}% ছাড়)</span>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => setProductModal({ open: true, data: product })}
                          className="w-1/2 flex items-center justify-center gap-1 py-1.5 border border-slate-800 hover:bg-slate-800 rounded text-xs font-semibold text-slate-300 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>এডিট করুন</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="w-1/2 flex items-center justify-center gap-1 py-1.5 border border-red-950 hover:bg-red-950/40 text-red-400 rounded text-xs font-semibold transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>ডিলেট করুন</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Offers */}
          {activeTab === 'offers' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-indigo-400" />
                  <span>মেগা অফার্স (Megapack/Combos)</span>
                </h2>
                <button
                  onClick={() => setOfferModal({ open: true, data: { active: true } })}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>নতুন অফার যোগ করুন</span>
                </button>
              </div>

              {/* Offers list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {offers.map(offer => (
                  <div key={offer.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition flex flex-col md:flex-row">
                    <div className="md:w-1/3 bg-slate-950 relative min-h-[140px] flex items-center justify-center">
                      {offer.image ? (
                        <img src={offer.image} alt={offer.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-600 text-xs">নো ইমেজ</span>
                      )}
                      <div className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${offer.active ? 'bg-emerald-950/80 border border-emerald-500/20 text-emerald-400' : 'bg-red-950/80 border border-red-500/20 text-red-400'}`}>
                        {offer.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div className="md:w-2/3 p-4 flex flex-col justify-between space-y-2">
                      <div>
                        <h4 className="font-bold text-slate-100 text-sm leading-snug">{offer.name}</h4>
                        <p className="text-[10px] font-medium text-indigo-400 mt-1 uppercase font-mono">আইটেম: {offer.productOrCourse}</p>
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{offer.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-bold text-slate-100">৳{offer.price}</span>
                          {offer.prevPrice && (
                            <span className="text-xs text-slate-500 line-through">৳{offer.prevPrice}</span>
                          )}
                          {offer.discount && (
                            <span className="text-[10px] text-indigo-400 font-bold">({offer.discount}%)</span>
                          )}
                        </div>
                        <div className="flex gap-1.5 shrink-0">
                          <button
                            onClick={() => setOfferModal({ open: true, data: offer })}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-slate-300 transition"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="p-1.5 bg-red-950/20 hover:bg-red-950 border border-red-900/30 rounded text-red-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Hero */}
          {activeTab === 'hero' && hero && (
            <div className="max-w-3xl space-y-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-400" />
                <span>হিরো সেকশন পরিবর্তন (Hero Layout Management)</span>
              </h2>

              <form onSubmit={handleSaveHero} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">হিরো ব্যাজ টেক্সট</label>
                    <input
                      type="text"
                      value={hero.badge}
                      onChange={(e) => setHero({ ...hero, badge: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">ছোট প্রমোশনাল মেসেজ</label>
                    <input
                      type="text"
                      value={hero.promoText}
                      onChange={(e) => setHero({ ...hero, promoText: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">মূল শিরোনাম (Hero Title) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={hero.heading}
                    onChange={(e) => setHero({ ...hero, heading: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">উপশিরোনাম (Hero Description) <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    rows={3}
                    value={hero.subtitle}
                    onChange={(e) => setHero({ ...hero, subtitle: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">বাটন টেক্সট</label>
                    <input
                      type="text"
                      value={hero.buttonText}
                      onChange={(e) => setHero({ ...hero, buttonText: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">বাটন লিংক / আইডি</label>
                    <input
                      type="text"
                      value={hero.buttonLink}
                      onChange={(e) => setHero({ ...hero, buttonLink: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2">হিরো ব্যানার ইমেজ (Upload directly from Android/Desktop)</label>
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    {hero.image && (
                      <img src={hero.image} alt="Hero preview" className="w-32 h-20 rounded-lg object-cover border border-slate-800 bg-slate-950 shrink-0" />
                    )}
                    <label className="flex flex-col items-center justify-center p-4 w-full md:w-auto h-20 bg-slate-950 border border-dashed border-slate-800 rounded-lg hover:border-indigo-500 transition cursor-pointer shrink-0">
                      <div className="flex flex-col items-center justify-center text-[10px] text-slate-400">
                        <Upload className="w-4 h-4 mb-1 text-slate-400" />
                        <span>গ্যালারি থেকে ফটো বেছে নিন</span>
                      </div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, (base64) => setHero({ ...hero, image: base64 }))} 
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-md shadow-indigo-950/20 transition"
                  >
                    হিরো আপডেট সেভ করুন
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: Settings */}
          {activeTab === 'settings' && settings && (
            <div className="max-w-3xl space-y-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-400" />
                <span>পেমেন্ট গেটওয়ে এবং সাধারণ সাইট সেটিংস</span>
              </h2>

              <form onSubmit={handleSaveSettings} className="space-y-6">
                
                {/* Promo Bar Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">১. টপ প্রমোশনাল বার (Promo Announcement Bar)</h3>
                  <div className="flex items-center gap-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.promoBar.enabled} 
                        onChange={(e) => setSettings({
                          ...settings,
                          promoBar: { ...settings.promoBar, enabled: e.target.checked }
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-950 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white"></div>
                      <span className="ml-3 text-xs font-semibold text-slate-400">বার সচল রাখুন (Enable Promo Bar)</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">প্রচার টেক্সট (Bengali/English Announcement Text)</label>
                    <input
                      type="text"
                      required
                      value={settings.promoBar.text}
                      onChange={(e) => setSettings({
                        ...settings,
                        promoBar: { ...settings.promoBar, text: e.target.value }
                      })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Bkash Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-slate-200">২. বিকাশ পেমেন্ট বিবরণী (bKash Wallet)</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.payment.bkash.enabled} 
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            bkash: { ...settings.payment.bkash, enabled: e.target.checked }
                          }
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-950 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">বিকাশ পার্সোনাল নম্বর</label>
                      <input
                        type="text"
                        value={settings.payment.bkash.number}
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            bkash: { ...settings.payment.bkash, number: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-pink-500 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">পেমেন্ট নির্দেশাবলী (Payment Guidelines)</label>
                    <textarea
                      rows={2}
                      value={settings.payment.bkash.instructions}
                      onChange={(e) => setSettings({
                        ...settings,
                        payment: {
                          ...settings.payment,
                          bkash: { ...settings.payment.bkash, instructions: e.target.value }
                        }
                      })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-pink-500 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Nagad Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h3 className="text-sm font-bold text-slate-200">৩. নগদ পেমেন্ট বিবরণী (Nagad Wallet)</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.payment.nagad.enabled} 
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            nagad: { ...settings.payment.nagad, enabled: e.target.checked }
                          }
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-slate-950 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">নগদ পার্সোনাল নম্বর</label>
                      <input
                        type="text"
                        value={settings.payment.nagad.number}
                        onChange={(e) => setSettings({
                          ...settings,
                          payment: {
                            ...settings.payment,
                            nagad: { ...settings.payment.nagad, number: e.target.value }
                          }
                        })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-orange-500 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">পেমেন্ট নির্দেশাবলী (Payment Guidelines)</label>
                    <textarea
                      rows={2}
                      value={settings.payment.nagad.instructions}
                      onChange={(e) => setSettings({
                        ...settings,
                        payment: {
                          ...settings.payment,
                          nagad: { ...settings.payment.nagad, instructions: e.target.value }
                        }
                      })}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-orange-500 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Password Protection */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">৪. এডমিন পাসওয়ার্ড সিকিউরিটি</h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">নতুন পাসওয়ার্ড দিন</label>
                    <input
                      type="password"
                      placeholder="পাসওয়ার্ড পরিবর্তন করতে নতুন টেক্সট লিখুন"
                      onChange={(e) => {
                        if (e.target.value.trim() !== '') {
                          setSettings({ ...settings, adminPassword: e.target.value });
                        }
                      }}
                      className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow transition"
                  >
                    সাইট ও পেমেন্ট সেটিংস সেভ করুন
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

      {/* --- MODAL: Add/Edit Course --- */}
      {courseModal.open && courseModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">
                {courseModal.data.id ? 'কোর্স পরিবর্তন করুন (Edit Course)' : 'নতুন কোর্স তৈরি করুন (Add Course)'}
              </h3>
              <button 
                onClick={() => setCourseModal({ open: false, data: null })}
                className="text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCourse} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">কোর্সের নাম *</label>
                  <input
                    type="text"
                    required
                    value={courseModal.data.name || ''}
                    onChange={(e) => setCourseModal({ ...courseModal, data: { ...courseModal.data, name: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">ক্যাটাগরি *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Video Editing, Design"
                    value={courseModal.data.category || ''}
                    onChange={(e) => setCourseModal({ ...courseModal, data: { ...courseModal.data, category: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">কোর্সের সংক্ষিপ্ত বিবরণ *</label>
                <textarea
                  required
                  rows={2}
                  value={courseModal.data.description || ''}
                  onChange={(e) => setCourseModal({ ...courseModal, data: { ...courseModal.data, description: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">কোর্স ফি (বর্তমান দাম) *</label>
                  <input
                    type="number"
                    required
                    value={courseModal.data.price || 0}
                    onChange={(e) => setCourseModal({ ...courseModal, data: { ...courseModal.data, price: Number(e.target.value) } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">পূর্ববর্তী কোর্স ফি (ঐচ্ছিক দাম)</label>
                  <input
                    type="number"
                    value={courseModal.data.prevPrice || ''}
                    onChange={(e) => setCourseModal({ ...courseModal, data: { ...courseModal.data, prevPrice: Number(e.target.value) } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">কোর্স সময়সীমা (যেমন: ১০ ঘণ্টা)</label>
                  <input
                    type="text"
                    value={courseModal.data.duration || ''}
                    onChange={(e) => setCourseModal({ ...courseModal, data: { ...courseModal.data, duration: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">পাবলিশ স্ট্যাটাস</label>
                  <select
                    value={courseModal.data.status || 'published'}
                    onChange={(e) => setCourseModal({ ...courseModal, data: { ...courseModal.data, status: e.target.value as any } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">কোর্স ফিচারসমূহ (কমা দিয়ে আলাদা লিখুন)</label>
                  <input
                    type="text"
                    placeholder="যেমন: ৪০+ ভিডিও ক্লাস, লাইফটাইম অ্যাক্সেস"
                    value={courseModal.data.features?.join(', ') || ''}
                    onChange={(e) => setCourseModal({ ...courseModal, data: { ...courseModal.data, features: e.target.value.split(',').map(s => s.trim()) } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">যা যা শিখতে পারবে (কমা দিয়ে আলাদা লিখুন)</label>
                <input
                  type="text"
                  placeholder="যেমন: Premiere Pro basics, Color grading, Transitions"
                  value={courseModal.data.learnings?.join(', ') || ''}
                  onChange={(e) => setCourseModal({ ...courseModal, data: { ...courseModal.data, learnings: e.target.value.split(',').map(s => s.trim()) } })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-2 font-semibold">থাম্বনেইল ইমেজ আপলোড</label>
                <div className="flex items-center gap-4">
                  {courseModal.data.image && (
                    <img src={courseModal.data.image} alt="Preview" className="w-16 h-12 rounded object-cover border border-slate-800" />
                  )}
                  <label className="flex items-center justify-center gap-2 p-2 px-4 bg-slate-950 border border-dashed border-slate-800 rounded hover:border-indigo-500 transition cursor-pointer">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] text-slate-300">ফাইল নির্বাচন করুন</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, (base64) => setCourseModal({ ...courseModal, data: { ...courseModal.data, image: base64 } }))} 
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCourseModal({ open: false, data: null })}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 rounded text-slate-300 hover:bg-slate-900 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded shadow-md transition"
                >
                  সংরক্ষণ করুন (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Add/Edit Product --- */}
      {productModal.open && productModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">
                {productModal.data.id ? 'প্রোডাক্ট পরিবর্তন করুন (Edit Product)' : 'নতুন প্রোডাক্ট তৈরি করুন (Add Product)'}
              </h3>
              <button 
                onClick={() => setProductModal({ open: false, data: null })}
                className="text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">প্রোডাক্টের নাম *</label>
                  <input
                    type="text"
                    required
                    value={productModal.data.name || ''}
                    onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, name: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">ক্যাটাগরি *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: Presets, Templates, E-books"
                    value={productModal.data.category || ''}
                    onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, category: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">প্রোডাক্টের সংক্ষিপ্ত বিবরণ *</label>
                <textarea
                  required
                  rows={2}
                  value={productModal.data.description || ''}
                  onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, description: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">প্রোডাক্টের বর্তমান মূল্য *</label>
                  <input
                    type="number"
                    required
                    value={productModal.data.price || 0}
                    onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, price: Number(e.target.value) } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">পূর্ববর্তী মূল্য (ঐচ্ছিক)</label>
                  <input
                    type="number"
                    value={productModal.data.prevPrice || ''}
                    onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, prevPrice: Number(e.target.value) } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">পাবলিশ স্ট্যাটাস</label>
                  <select
                    value={productModal.data.status || 'published'}
                    onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, status: e.target.value as any } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">প্রোডাক্ট ফিচারসমূহ (কমা দিয়ে আলাদা লিখুন)</label>
                  <input
                    type="text"
                    placeholder="যেমন: ৫০+ LUTs, ১ ক্লিকেই কালারিং"
                    value={productModal.data.features?.join(', ') || ''}
                    onChange={(e) => setProductModal({ ...productModal, data: { ...productModal.data, features: e.target.value.split(',').map(s => s.trim()) } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded focus:outline-none focus:border-indigo-500 text-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-2 font-semibold">প্রোডাক্ট ইমেজ আপলোড</label>
                <div className="flex items-center gap-4">
                  {productModal.data.image && (
                    <img src={productModal.data.image} alt="Preview" className="w-16 h-12 rounded object-cover border border-slate-800" />
                  )}
                  <label className="flex items-center justify-center gap-2 p-2 px-4 bg-slate-950 border border-dashed border-slate-800 rounded hover:border-indigo-500 transition cursor-pointer">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] text-slate-300">ফাইল নির্বাচন করুন</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, (base64) => setProductModal({ ...productModal, data: { ...productModal.data, image: base64 } }))} 
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModal({ open: false, data: null })}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 rounded text-slate-300 hover:bg-slate-900 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded shadow transition"
                >
                  সংরক্ষণ করুন (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Add/Edit Offer --- */}
      {offerModal.open && offerModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-200">
                {offerModal.data.id ? 'অফার পরিবর্তন করুন' : 'নতুন অফার সংযুক্ত করুন'}
              </h3>
              <button 
                onClick={() => setOfferModal({ open: false, data: null })}
                className="text-slate-400 hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveOffer} className="p-6 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">অফারের নাম *</label>
                  <input
                    type="text"
                    required
                    value={offerModal.data.name || ''}
                    onChange={(e) => setOfferModal({ ...offerModal, data: { ...offerModal.data, name: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">অফারের আওতাভুক্ত প্রোডাক্ট / কোর্স সমুহ *</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমন: ভিডিও এডিটিং মাস্টারক্লাস + সিনেমাটিক প্রিসেট"
                    value={offerModal.data.productOrCourse || ''}
                    onChange={(e) => setOfferModal({ ...offerModal, data: { ...offerModal.data, productOrCourse: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">অফারের বিবরণ *</label>
                <textarea
                  required
                  rows={2}
                  value={offerModal.data.description || ''}
                  onChange={(e) => setOfferModal({ ...offerModal, data: { ...offerModal.data, description: e.target.value } })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">অফার মূল্য (Current Offer Price) *</label>
                  <input
                    type="number"
                    required
                    value={offerModal.data.price || 0}
                    onChange={(e) => setOfferModal({ ...offerModal, data: { ...offerModal.data, price: Number(e.target.value) } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">পূর্ববর্তী মূল্য (Regular Price)</label>
                  <input
                    type="number"
                    value={offerModal.data.prevPrice || ''}
                    onChange={(e) => setOfferModal({ ...offerModal, data: { ...offerModal.data, prevPrice: Number(e.target.value) } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">শুরুর তারিখ</label>
                  <input
                    type="date"
                    value={offerModal.data.startDate || ''}
                    onChange={(e) => setOfferModal({ ...offerModal, data: { ...offerModal.data, startDate: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">শেষের তারিখ</label>
                  <input
                    type="date"
                    value={offerModal.data.endDate || ''}
                    onChange={(e) => setOfferModal({ ...offerModal, data: { ...offerModal.data, endDate: e.target.value } })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded text-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="offer_active"
                  checked={offerModal.data.active || false}
                  onChange={(e) => setOfferModal({ ...offerModal, data: { ...offerModal.data, active: e.target.checked } })}
                  className="w-4 h-4 bg-slate-950 border-slate-800 text-indigo-600 rounded"
                />
                <label htmlFor="offer_active" className="text-slate-300 font-semibold cursor-pointer">অফারটি সচল করুন (Active / Visible on public site)</label>
              </div>

              <div>
                <label className="block text-slate-400 mb-2 font-semibold">অফার ব্যানার ইমেজ আপলোড</label>
                <div className="flex items-center gap-4">
                  {offerModal.data.image && (
                    <img src={offerModal.data.image} alt="Preview" className="w-16 h-12 rounded object-cover border border-slate-800" />
                  )}
                  <label className="flex items-center justify-center gap-2 p-2 px-4 bg-slate-950 border border-dashed border-slate-800 rounded hover:border-indigo-500 transition cursor-pointer">
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span className="text-[10px] text-slate-300">ব্যানার বেছে নিন</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, (base64) => setOfferModal({ ...offerModal, data: { ...offerModal.data, image: base64 } }))} 
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOfferModal({ open: false, data: null })}
                  className="px-4 py-2 bg-slate-950 border border-slate-800 rounded text-slate-300 hover:bg-slate-900 transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded shadow transition"
                >
                  অফার সেভ করুন (Save Offer)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
