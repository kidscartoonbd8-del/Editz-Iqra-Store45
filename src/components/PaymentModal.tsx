import { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { Course, Product, Offer, PaymentSettings } from '../types';

interface PaymentModalProps {
  item: Course | Product | Offer | null;
  paymentSettings: PaymentSettings;
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

export default function PaymentModal({ item, paymentSettings, onClose, onSuccess }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad'>('bKash');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !phone.trim() || !transactionId.trim()) {
      setError('দয়া করে নাম, সচল মোবাইল নম্বর এবং ট্রানজেকশন আইডি প্রদান করুন।');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          email,
          productName: item.name,
          amount: item.price,
          paymentMethod,
          transactionId
        }),
      });

      const data = await response.json();
      if (data.success) {
        onSuccess(data.orderId);
      } else {
        setError(data.error || 'অর্ডারটি সম্পন্ন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setError('সার্ভারে যোগাযোগ করা যাচ্ছে না। আপনার ইন্টারনেট সংযোগ পরীক্ষা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const currentProvider = paymentMethod === 'bKash' ? paymentSettings.bkash : paymentSettings.nagad;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-semibold text-slate-100">বাংলাদেশী পেমেন্ট গেটওয়ে</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Order Summary */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-900 mb-6">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-mono">অর্ডার সারসংক্ষেপ (Order Summary)</div>
            <div className="flex justify-between items-start gap-4">
              <div>
                <h4 className="font-semibold text-slate-200 text-sm leading-snug">{item.name}</h4>
                <p className="text-xs text-slate-500 mt-1">ক্যাটাগরি: {('category' in item ? item.category : '') || 'মেগা অফার'}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-lg font-bold text-indigo-400 font-mono">৳{item.price}</span>
                <p className="text-[10px] text-emerald-500 flex items-center gap-1 justify-end mt-1">
                  <ShieldCheck className="w-3 h-3" /> সুরক্ষিত পেমেন্ট
                </p>
              </div>
            </div>
          </div>

          {/* Select Payment Method */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">১. পেমেন্ট পদ্ধতি নির্বাচন করুন</label>
            <div className="grid grid-cols-2 gap-3">
              {paymentSettings.bkash.enabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bKash')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    paymentMethod === 'bKash' 
                      ? 'bg-pink-950/20 border-pink-500/80 text-pink-400 shadow-lg shadow-pink-950/20' 
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold font-mono tracking-wider">bKash (বিকাশ)</span>
                </button>
              )}
              {paymentSettings.nagad.enabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('Nagad')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    paymentMethod === 'Nagad' 
                      ? 'bg-orange-950/20 border-orange-500/80 text-orange-400 shadow-lg shadow-orange-950/20' 
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="text-xs font-bold font-mono tracking-wider">Nagad (নগদ)</span>
                </button>
              )}
            </div>
          </div>

          {/* Payment Instructions */}
          {currentProvider && currentProvider.enabled ? (
            <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-900/60 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">২. নিচের নম্বরে টাকা সেন্ড করুন</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-950/50 border border-indigo-500/20 rounded text-indigo-400">Personal (পার্সোনাল)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-800 mb-3">
                <span className="text-xs text-slate-400">পেমেন্ট নাম্বার:</span>
                <span className="text-base font-bold font-mono text-slate-200 tracking-wider hover:text-indigo-400 transition-colors select-all cursor-pointer">
                  {currentProvider.number}
                </span>
              </div>
              <div className="text-xs text-slate-400 leading-relaxed space-y-1">
                <p className="font-semibold text-slate-300">নির্দেশাবলী:</p>
                <p>{currentProvider.instructions}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/50 text-red-400 text-xs mb-6">
              দুঃখিত, এই পেমেন্ট পদ্ধতিটি বর্তমানে নিষ্ক্রিয় রয়েছে। অনুগ্রহ করে অন্য পদ্ধতি নির্বাচন করুন।
            </div>
          )}

          {/* Payment Submission Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">৩. পেমেন্ট তথ্য প্রদান করুন</h4>
            
            {error && (
              <div className="p-3 text-xs text-red-400 bg-red-950/20 border border-red-900/50 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-400 mb-1">আপনার সম্পূর্ণ নাম <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="যেমন: ইমরান হোসেন"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 text-sm text-slate-200 bg-slate-900/60 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">মোবাইল নম্বর <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  placeholder="যেমন: 017xxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2 text-sm text-slate-200 bg-slate-900/60 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">ইমেইল এড্রেস (ঐচ্ছিক)</label>
                <input
                  type="email"
                  placeholder="যেমন: support@editz-iqra.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 text-sm text-slate-200 bg-slate-900/60 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Transaction ID (ট্রানজেকশন আইডি) <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                placeholder="যেমন: 8XJ092K3"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                className="w-full px-4 py-2 text-sm text-slate-200 bg-slate-900/60 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors font-mono uppercase"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || !currentProvider?.enabled}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-950/40 transition duration-300 transform active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>অর্ডার প্রসেস হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <span>পেমেন্ট নিশ্চিত করুন (৳{item.price})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
