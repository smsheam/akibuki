import React, { useEffect } from 'react';

interface SplashIntroProps {
  onComplete: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  useEffect(() => {
    // Quick, smooth minimalist transition (850ms)
    const timer = setTimeout(() => {
      onComplete();
    }, 850);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-white cursor-pointer select-none transition-opacity duration-300"
    >
      {/* Minimalist Centered Brand */}
      <div className="relative flex flex-col items-center text-center space-y-3 px-6 animate-fade-in">
        {/* Minimalist Painter Badge */}
        <div className="w-11 h-11 rounded-2xl bg-zinc-900 border border-zinc-700 flex items-center justify-center mb-1 shadow-lg">
          <span className="text-xl">🎨</span>
        </div>

        {/* Minimalist Aesthetic Wordmark in Pure White */}
        <h1
          className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-sm"
          style={{ fontFamily: "'Hind Siliguri', 'Kalpurush', system-ui, sans-serif" }}
        >
          আঁকিবুঁকি
        </h1>

        {/* Developer Credit */}
        <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-zinc-400 font-mono">
          Developed by Sheam
        </p>
      </div>
    </div>
  );
};
