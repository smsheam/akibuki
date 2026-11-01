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
          className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-black dark:text-white"
          style={{ fontFamily: "'Hind Siliguri', 'Kalpurush', system-ui, sans-serif" }}
        >
          আঁকিবুঁকি
        </h1>
        <p className="text-xs sm:text-sm font-semibold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase mt-1 font-mono">
          Developed by Sheam
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center select-none text-center relative group">
      {/* Main Glass Badge in Black and White */}
      <div className="relative inline-flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-3xl bg-white dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 shadow-xl group-hover:border-black dark:group-hover:border-white transition-all duration-300">
        {/* Artistic Painter Palette & Quill Icon */}
        <div
          className={`${
            isHero ? 'w-12 h-12 sm:w-14 sm:h-14' : isLg ? 'w-11 h-11' : isSm ? 'w-8 h-8' : 'w-10 h-10'
          } rounded-2xl bg-black text-white dark:bg-white dark:text-black border border-zinc-700 dark:border-zinc-300 flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300 relative shrink-0`}
        >
          {/* Aesthetic Brush Icon */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3/5 h-3/5"
          >
            <path d="m18 5-3-3L3 14l-1 5 5-1L19 6l-1-1Z" />
            <path d="m14 2 4 4" />
            <path d="M7 21a2 2 0 0 1-2-2" />
          </svg>

          {/* Little Star Sparkle */}
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-black text-white dark:bg-white dark:text-black border border-white dark:border-black text-[9px] items-center justify-center font-bold shadow">
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
              } font-black tracking-tight leading-none text-black dark:text-white`}
              style={{ fontFamily: "'Hind Siliguri', 'Kalpurush', system-ui, sans-serif" }}
            >
              আঁকিবুঁকি
            </span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black border border-zinc-300 dark:border-zinc-700 shadow-sm">
              Live
            </span>
          </div>

          {showSubtitle && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] sm:text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                অনলাইন মাল্টিপ্লেয়ার ড্রয়িং গেম
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
