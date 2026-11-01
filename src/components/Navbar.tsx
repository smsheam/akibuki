import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Trophy,
  Globe,
  Home,
  Maximize,
  Minimize,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';
import { Player } from '../types/game';
import { BanglaAkibukiLogo } from './BanglaAkibukiLogo';

interface NavbarProps {
  language: Language;
  onToggleLanguage: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGoHome: () => void;
  onOpenLeaderboard?: () => void;
  inGame?: boolean;
  currentPlayer?: Player | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onToggleLanguage,
  isDarkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  onGoHome,
  onOpenLeaderboard,
  inGame = false,
  currentPlayer,
}) => {
  const t = TRANSLATIONS[language];
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/95 dark:bg-black/95 border-b border-zinc-200 dark:border-zinc-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo (clickable to go Home) */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 hover:opacity-80 transition active:scale-95 text-left cursor-pointer shrink-0"
          title={language === 'bn' ? 'হোম পেজে যান' : 'Go to Home'}
        >
          <BanglaAkibukiLogo size="sm" showSubtitle={false} />
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Home Button (Always accessible) */}
          <button
            onClick={onGoHome}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-zinc-100 hover:bg-black hover:text-white dark:bg-zinc-900 dark:hover:bg-white dark:hover:text-black text-black dark:text-white border border-zinc-300 dark:border-zinc-700 transition shadow-sm active:scale-95 cursor-pointer"
            title={language === 'bn' ? 'হোম পেজ' : 'Home Page'}
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>{language === 'bn' ? 'হোম' : 'Home'}</span>
          </button>

          {/* Fullscreen Toggle (Specially optimized for Mobile Fullscreen) */}
          <button
            onClick={handleToggleFullscreen}
            aria-label="Toggle Fullscreen"
            className="p-1.5 sm:p-2 rounded-xl text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
            title={isFullscreen ? 'ফুলস্ক্রিন থেকে বের হন' : 'ফুলস্ক্রিন করুন'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-black dark:text-white" />
            ) : (
              <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-black dark:text-white" />
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className="p-1.5 sm:p-2 rounded-xl text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
            title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-black dark:text-white" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-black border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="ভাষা পরিবর্তন"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle Theme"
            className="p-1.5 sm:p-2 rounded-xl text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition cursor-pointer"
            title={isDarkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            )}
          </button>

          {/* Leaderboard Button (Active match) */}
          {inGame && onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-black text-xs sm:text-sm transition border border-zinc-300 dark:border-zinc-700 shadow-sm cursor-pointer"
              title="লিডারবোর্ড"
            >
              <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{t.leaderboard}</span>
            </button>
          )}

          {/* Current Player Profile Badge */}
          {currentPlayer && inGame && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white">
              <span className="text-lg">{currentPlayer.avatar}</span>
              <span className="text-xs font-black max-w-[80px] truncate">
                {currentPlayer.name}
              </span>
              <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white shadow-sm">
                {currentPlayer.totalPoints}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
