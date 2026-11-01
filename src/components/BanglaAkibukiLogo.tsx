import React from 'react';

interface BanglaAkibukiLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showSubtitle?: boolean;
}

export const BanglaAkibukiLogo: React.FC<BanglaAkibukiLogoProps> = ({
  size = 'hero',
  showSubtitle = true,
}) => {
  const isHero = size === 'hero';
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  return (
    <div className="flex flex-col items-center justify-center select-none text-center relative group">
      {/* Background Decorative Glow Splashes */}
      <div className="absolute -top-6 -left-6 w-20 h-20 bg-amber-400/25 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-20 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Logo Container */}
      <div className="relative inline-flex items-center gap-2 sm:gap-3 px-4 py-2 rounded-3xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border-2 border-amber-300/60 dark:border-amber-500/30 shadow-xl shadow-amber-500/10">
        {/* Artistic Painter Palette & Pencil SVG Icon */}
        <div
          className={`${
            isHero ? 'w-14 h-14 sm:w-16 sm:h-16' : isLg ? 'w-12 h-12' : isSm ? 'w-8 h-8' : 'w-10 h-10'
          } rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/30 transform group-hover:rotate-6 transition-transform duration-300 relative`}
        >
          {/* Animated floating pencil */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3/5 h-3/5 text-white drop-shadow-md"
          >
            <path d="m18 5-3-3L3 14l-1 5 5-1L19 6l-1-1Z" />
            <path d="m14 2 4 4" />
            <path d="M7 21a2 2 0 0 1-2-2" />
          </svg>
          {/* Sparkle badge */}
          <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400 text-[10px] items-center justify-center font-bold text-white shadow">
              ✦
            </span>
          </span>
        </div>

        {/* Custom Bangla Calligraphic Typography */}
        <div className="text-left">
          <div className="flex items-baseline">
            <span
              className={`${
                isHero
                  ? 'text-4xl sm:text-6xl'
                  : isLg
                  ? 'text-3xl sm:text-4xl'
                  : isSm
                  ? 'text-xl'
                  : 'text-2xl'
              } font-black tracking-tight leading-none bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 dark:from-amber-400 dark:via-rose-400 dark:to-indigo-400 bg-clip-text text-transparent drop-shadow-sm`}
              style={{ fontFamily: "'Hind Siliguri', 'Kalpurush', system-ui, sans-serif" }}
            >
              আঁকিবুঁকি
            </span>
            <span className="text-[10px] sm:text-xs font-black tracking-widest uppercase ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-sm shadow-rose-500/25">
              PRO
            </span>
          </div>

          {showSubtitle && (
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 dark:text-slate-400">
                Akibuki • Draw & Guess Online
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
