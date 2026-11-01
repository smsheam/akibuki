import React from 'react';

interface BanglaAkibukiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
  minimal?: boolean;
}

export const BanglaAkibukiLogo: React.FC<BanglaAkibukiLogoProps> = ({
  size = 'hero',
  showSubtitle = true,
  minimal = false,
}) => {
  const isHero = size === 'hero';
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  if (minimal) {
    return (
      <div className="flex flex-col items-center justify-center select-none text-center">
        <h1
          className="text-4xl sm:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-400 bg-clip-text text-transparent drop-shadow-md"
          style={{ fontFamily: "'Hind Siliguri', 'Kalpurush', system-ui, sans-serif" }}
        >
          আঁকিবুঁকি
        </h1>
        <p className="text-xs sm:text-sm font-semibold tracking-widest text-slate-400 uppercase mt-1">
          Developed by Sheam
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center select-none text-center relative group">
      {/* Soft Ambient Background Glow */}
      <div className="absolute -top-4 -left-4 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute -bottom-4 -right-4 w-28 h-28 bg-rose-500/20 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-16 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Badge */}
      <div className="relative inline-flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-amber-300/40 dark:border-slate-700/60 shadow-xl shadow-amber-500/5 group-hover:border-amber-400/60 transition-all duration-300">
        {/* Artistic Painter Palette & Quill Icon */}
        <div
          className={`${
            isHero ? 'w-12 h-12 sm:w-14 sm:h-14' : isLg ? 'w-11 h-11' : isSm ? 'w-8 h-8' : 'w-10 h-10'
          } rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/25 transform group-hover:rotate-6 transition-transform duration-300 relative shrink-0`}
        >
          {/* Aesthetic Brush Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3/5 h-3/5 text-white drop-shadow-sm"
          >
            <path d="m18 5-3-3L3 14l-1 5 5-1L19 6l-1-1Z" />
            <path d="m14 2 4 4" />
            <path d="M7 21a2 2 0 0 1-2-2" />
          </svg>

          {/* Little Star Sparkle */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 text-[9px] items-center justify-center font-bold text-white shadow">
              ✦
            </span>
          </span>
        </div>

        {/* Custom Bangla Calligraphic Typography */}
        <div className="text-left">
          <div className="flex items-center gap-1.5">
            <span
              className={`${
                isHero
                  ? 'text-3xl sm:text-5xl'
                  : isLg
                  ? 'text-2xl sm:text-3xl'
                  : isSm
                  ? 'text-lg'
                  : 'text-xl sm:text-2xl'
              } font-black tracking-tight leading-none bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 dark:from-amber-400 dark:via-rose-400 dark:to-indigo-300 bg-clip-text text-transparent`}
              style={{ fontFamily: "'Hind Siliguri', 'Kalpurush', system-ui, sans-serif" }}
            >
              আঁকিবুঁকি
            </span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm shadow-rose-500/20">
              Live
            </span>
          </div>

          {showSubtitle && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                অনলাইন মাল্টিপ্লেয়ার ড্রয়িং গেম
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
