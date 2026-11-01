import React, { useEffect } from 'react';

interface SplashIntroProps {
  onComplete: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  useEffect(() => {
    // Quick, smooth minimalist transition (850ms) instead of 3-second waiting timer
    const timer = setTimeout(() => {
      onComplete();
    }, 850);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white cursor-pointer select-none transition-opacity duration-300"
    >
      {/* Delicate ambient center flare */}
      <div className="absolute w-80 h-80 bg-gradient-to-tr from-amber-500/15 via-rose-500/15 to-indigo-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Minimalist Centered Brand */}
      <div className="relative flex flex-col items-center text-center space-y-3 px-6 animate-fade-in">
        {/* Glowing Painter Dot */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 p-0.5 shadow-lg shadow-rose-500/25 mb-1">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <span className="text-lg">🎨</span>
          </div>
        </div>

        {/* Minimalist Aesthetic Wordmark */}
        <h1
          className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-rose-400 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm"
          style={{ fontFamily: "'Hind Siliguri', 'Kalpurush', system-ui, sans-serif" }}
        >
          আঁকিবুঁকি
        </h1>

        {/* Developer Credit */}
        <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-slate-400">
          Developed by Sheam
        </p>
      </div>
    </div>
  );
};
