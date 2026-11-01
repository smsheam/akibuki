import React from 'react';
import {
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Trophy,
  Globe,
  Home,
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

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-b border-amber-200/50 dark:border-slate-800 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        {/* Logo (clickable to go Home) */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2 hover:opacity-90 transition active:scale-95 text-left"
          title={language === 'bn' ? 'হোম পেজে যান' : 'Go to Home'}
        >
          <BanglaAkibukiLogo size="sm" showSubtitle={false} />
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Home Button (Always accessible) */}
          <button
            onClick={onGoHome}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm bg-slate-100 hover:bg-amber-500 hover:text-white dark:bg-slate-800 dark:hover:bg-amber-500 text-slate-700 dark:text-slate-200 transition shadow-sm active:scale-95"
            title={language === 'bn' ? 'হোম পেজ' : 'Home Page'}
          >
            <Home className="w-4 h-4" />
            <span>{language === 'bn' ? 'হোম' : 'Home'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-black border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-amber-400 transition"
            title="ভাষা পরিবর্তন"
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'bn' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={isDarkMode ? 'লাইট মোড' : 'ডার্ক মোড'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500" />
            )}
          </button>

          {/* Leaderboard Button (Active match) */}
          {inGame && onOpenLeaderboard && (
            <button
              onClick={onOpenLeaderboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 font-black text-xs sm:text-sm transition border border-amber-500/30 shadow-sm"
              title="লিডারবোর্ড"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="hidden xs:inline">{t.leaderboard}</span>
            </button>
          )}

          {/* Current Player Profile Badge */}
          {currentPlayer && inGame && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-gradient-to-r from-amber-500/10 to-indigo-500/10 border border-amber-300/50 dark:border-indigo-800">
              <span className="text-lg">{currentPlayer.avatar}</span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 max-w-[80px] truncate">
                {currentPlayer.name}
              </span>
              <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-white shadow-sm">
                {currentPlayer.totalPoints}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
