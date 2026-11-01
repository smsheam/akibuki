import React, { useEffect, useState } from 'react';
import { BanglaAkibukiLogo } from './BanglaAkibukiLogo';
import { Sparkles } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 3 seconds total duration
    const startTime = Date.now();
    const duration = 3000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (elapsed >= duration) {
        clearInterval(interval);
        onComplete();
      }
    }, 40);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-gradient-to-br from-amber-500/10 via-slate-900 to-indigo-950 text-white select-none overflow-hidden animate-fade-in">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Top Tagline */}
      <div className="pt-8 text-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-black uppercase tracking-widest text-amber-300 border border-white/15">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>অনলাইন মাল্টিপ্লেয়ার ড্রয়িং ও গেসিং গেম</span>
        </span>
      </div>

      {/* Centerpiece Logo Animation */}
      <div className="flex flex-col items-center justify-center space-y-4 my-auto">
        <div className="transform scale-110 sm:scale-125 transition-transform duration-700">
          <BanglaAkibukiLogo size="hero" showSubtitle={true} />
        </div>

        <p className="text-sm sm:text-base font-bold text-slate-300 drop-shadow-md text-center max-w-xs">
          আঁকো • চ্যাটে আন্দাজ করো • বন্ধুদের হারাও!
        </p>
      </div>

      {/* Bottom 3-Second Loading Bar */}
      <div className="w-full max-w-xs space-y-3 pb-6 text-center">
        <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-400 rounded-full transition-all duration-75 ease-linear shadow-lg shadow-rose-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
          <span>প্রস্তুত হচ্ছে...</span>
          <button
            onClick={onComplete}
            className="text-amber-400 hover:text-amber-300 underline font-black"
          >
            সরাসরি যান →
          </button>
        </div>

        <p className="text-[10px] font-black tracking-widest uppercase text-slate-500 pt-2">
          Developed by SMSHEAM
        </p>
      </div>
    </div>
  );
};
