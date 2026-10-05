import { useState, useEffect } from 'react';
import { Play, CheckCircle, Tv, Award, Circle } from 'lucide-react';
import { Order } from '../types';

interface Lesson {
  id: string;
  title: string;
  duration: string;
}

interface CourseProgressTrackerProps {
  order: Order;
}

export default function CourseProgressTracker({ order }: CourseProgressTrackerProps) {
  const isCourse = order.productName.toLowerCase().includes('কোর্স') || 
                   order.productName.toLowerCase().includes('course') || 
                   order.productName.toLowerCase().includes('মাস্টারক্লাস');

  // Hardcoded premium curriculum structure based on item types
  const lessons: Lesson[] = isCourse ? [
    { id: 'l1', title: '১. অ্যাডোবি প্রিমিয়ার প্রো - ইন্টারফেস এবং প্যানেল পরিচিতি', duration: '১২:৪৫' },
    { id: 'l2', title: '২. সিলেকশন, ক্রপ এবং কাটিং টুলস এর প্রফেশনাল ব্যবহার', duration: '১৮:৩০' },
    { id: 'l3', title: '৩. সাউন্ড এডিটিং এবং নয়েজ দূর করার গোপন ট্রিকস', duration: '১৫:২০' },
    { id: 'l4', title: '৪. কালার কারেকশন বনাম কালার গ্রেডিং অ্যাডভান্সড মেথড', duration: '২২:১০' },
    { id: 'l5', title: '৫. কাস্টম মোশন ট্রানজিশন এবং কি-ফ্রেম অ্যানিমেশন', duration: '২০:১৫' },
    { id: 'l6', title: '৬. স্পিড র‍্যাম্পিং এবং সিনেমাটিক স্লো-মোশন গাইড', duration: '১৪:৪০' },
    { id: 'l7', title: '৭. সোশ্যাল মিডিয়ার জন্য হাই-কোয়ালিটি এক্সপোর্ট সেটিংস', duration: '১০:০৫' },
  ] : [
    { id: 'p1', title: '১. প্রিসেট ফাইল ডাউনলোড এবং আনজিপ করার সঠিক নিয়ম', duration: '০৫:১৫' },
    { id: 'p2', title: '২. অ্যাডোবি প্রিমিয়ার প্রো-তে LUTs ইম্পোর্ট করার পদ্ধতি', duration: '০৭:৪০' },
    { id: 'p3', title: '৩. ক্যাপকাট মোবাইল ও পিসিতে কালার প্রিসেট ব্যবহার', duration: '০৯:২০' },
    { id: 'p4', title: '৪. লাইট ও শ্যাডো অ্যাডজাস্টমেন্ট করে পারফেক্ট লুক দেওয়ার উপায়', duration: '০৮:১০' },
  ];

  // Local Storage Key specific to this Order
  const storageKey = `editz_iqra_progress_${order.id}`;

  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setCompletedLessons(JSON.parse(saved));
      } catch (e) {
        setCompletedLessons([]);
      }
    }
  }, [order.id]);

  // Save to LocalStorage
  const toggleLesson = (lessonId: string) => {
    let updated: string[];
    if (completedLessons.includes(lessonId)) {
      updated = completedLessons.filter(id => id !== lessonId);
    } else {
      updated = [...completedLessons, lessonId];
    }
    setCompletedLessons(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const percentage = Math.round((completedLessons.length / lessons.length) * 100) || 0;

  return (
    <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-5 md:p-6 space-y-6 mt-6">
      
      {/* Header and Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-950/60 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-200 text-sm leading-snug">লার্নিং ড্যাশবোর্ড ও প্রোগ্রেস ট্র্যাকার</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">আপনার প্রতিটি ভিডিও ক্লাসের প্রোগ্রেস ট্র্যাক করুন</p>
          </div>
        </div>
        {percentage === 100 && (
          <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono shrink-0 animate-pulse">
            <Award className="w-3.5 h-3.5" />
            <span>Course Complete</span>
          </div>
        )}
      </div>

      {/* Progress Bar Display */}
      <div className="space-y-2 bg-slate-950/40 border border-slate-900 p-4 rounded-xl">
        <div className="flex justify-between items-baseline text-xs">
          <span className="text-slate-400 font-semibold">আপনার মোট কোর্স প্রোগ্রেস:</span>
          <span className="text-sm font-extrabold text-indigo-400 font-mono tracking-wider">{percentage}% সম্পূর্ণ</span>
        </div>
        
        {/* Progress outer track */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-900 relative">
          {/* Animated fill */}
          <div 
            style={{ width: `${percentage}%` }} 
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 rounded-full transition-all duration-500 ease-out relative"
          >
            {/* Glowing tip */}
            {percentage > 0 && (
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-white blur-sm" />
            )}
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
          <span>০/{lessons.length} লেকচার</span>
          <span>{completedLessons.length}/{lessons.length} ভিডিও ক্লাসেস সম্পন্ন</span>
        </div>
      </div>

      {/* Lesson List */}
      <div className="space-y-2.5">
        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wide">ভিডিও লেকচার সমুহ:</h5>
        
        <div className="divide-y divide-slate-900 max-h-[300px] overflow-y-auto pr-1 space-y-1 scrollbar-thin">
          {lessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            return (
              <div 
                key={lesson.id}
                onClick={() => toggleLesson(lesson.id)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                  isCompleted 
                    ? 'bg-indigo-950/10 border-indigo-500/20 hover:bg-indigo-950/20' 
                    : 'bg-slate-950/20 border-slate-900 hover:border-slate-800 hover:bg-slate-900/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    className="shrink-0 transition-colors"
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4 text-indigo-400 fill-indigo-950" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                    )}
                  </button>
                  <span className={`text-xs leading-snug transition-all ${isCompleted ? 'text-slate-400 line-through decoration-slate-600' : 'text-slate-300 font-medium'}`}>
                    {lesson.title}
                  </span>
                </div>
                
                <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 shrink-0 ml-4">
                  <Play className="w-3 h-3 text-slate-600 shrink-0" />
                  {lesson.duration}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
