import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Home,
  Share2,
  Sparkles,
  Award,
  Palette,
  Search,
  Zap,
  HelpCircle,
  VolumeX,
} from 'lucide-react';
import { Player, RoomState } from '../types/game';
import { Language, TRANSLATIONS } from '../data/translations';

interface FinalResultsProps {
  language: Language;
  room: RoomState;
  players: Player[];
  currentPlayer: Player;
  onPlayAgain: () => void;
  onReturnHome: () => void;
}

export const FinalResults: React.FC<FinalResultsProps> = ({
  language,
  room,
  players,
  currentPlayer,
  onPlayAgain,
  onReturnHome,
}) => {
  const t = TRANSLATIONS[language];
  const isHost = currentPlayer.id === room.hostId;

  // Sorted players by total points
  const sorted = [...players].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
  const winner = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  // Confetti fanfare
  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });
  }, []);

  // Compute Funny Awards
  const bestDrawer = [...players].sort((a, b) => (b.drawingPoints || 0) - (a.drawingPoints || 0))[0];
  const bestGuesser = [...players].sort((a, b) => (b.correctGuesses || 0) - (a.correctGuesses || 0))[0];
  const mostWrong = [...players].sort((a, b) => (b.incorrectGuesses || 0) - (a.incorrectGuesses || 0))[0];
  const fewestGuesses = [...players].sort(
    (a, b) => ((a.correctGuesses || 0) + (a.incorrectGuesses || 0)) - ((b.correctGuesses || 0) + (b.incorrectGuesses || 0))
  )[0];

  const handleShareResults = () => {
    const text = `আঁকিবুঁকি খেলায় চ্যাম্পিয়ন হয়েছে ${winner?.name}! স্কোর: ${winner?.totalPoints} পয়েন্ট!`;
    if (navigator.share) {
      navigator.share({ title: 'আঁকিবুঁকি ফলাফল', text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('ফলাফল কপি করা হয়েছে!');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-fade-in">
      {/* Champion Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 text-amber-600 dark:text-amber-400 font-black text-sm border border-amber-500/30">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span>{t.matchResults}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
          🎉 {winner?.name} {t.matchWinner} 🎉
        </h1>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
          {language === 'bn' ? `মোট ${winner?.totalPoints || 0} পয়েন্ট পেয়ে ১ম স্থান অর্জন করেছেন!` : `Claimed 1st place with ${winner?.totalPoints || 0} total points!`}
        </p>
      </div>

      {/* Podium Presentation (1st, 2nd, 3rd) */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 pt-8 pb-4">
        {/* 2nd Place */}
        {second && (
          <div className="flex flex-col items-center flex-1 max-w-[140px] animate-fade-in-up">
            <span className="text-3xl sm:text-4xl mb-1">{second.avatar}</span>
            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate w-full text-center">
              {second.name}
            </span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 mb-2">
              {second.totalPoints} pts
            </span>
            <div className="w-full h-24 sm:h-32 bg-slate-200 dark:bg-slate-700 rounded-t-2xl flex flex-col items-center justify-center text-slate-600 dark:text-slate-300 shadow-md">
              <span className="text-2xl">🥈</span>
              <span className="text-xs font-black mt-1">{t.podium2nd}</span>
            </div>
          </div>
        )}

        {/* 1st Place (Center & Highest) */}
        {winner && (
          <div className="flex flex-col items-center flex-1 max-w-[160px] animate-fade-in-up">
            <div className="relative">
              <span className="text-4xl sm:text-5xl">{winner.avatar}</span>
              <div className="absolute -top-3 -right-2 text-xl">👑</div>
            </div>
            <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white truncate w-full text-center mt-1">
              {winner.name}
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-500 mb-2">
              {winner.totalPoints} pts
            </span>
            <div className="w-full h-32 sm:h-44 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-2xl flex flex-col items-center justify-center text-white shadow-xl shadow-amber-500/20">
              <span className="text-3xl">🥇</span>
              <span className="text-sm font-black mt-1">{t.podium1st}</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex flex-col items-center flex-1 max-w-[140px] animate-fade-in-up">
            <span className="text-3xl sm:text-4xl mb-1">{third.avatar}</span>
            <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate w-full text-center">
              {third.name}
            </span>
            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 mb-2">
              {third.totalPoints} pts
            </span>
            <div className="w-full h-18 sm:h-24 bg-amber-700/30 dark:bg-amber-900/40 rounded-t-2xl flex flex-col items-center justify-center text-amber-800 dark:text-amber-200 shadow-md">
              <span className="text-2xl">🥉</span>
              <span className="text-xs font-black mt-1">{t.podium3rd}</span>
            </div>
          </div>
        )}
      </div>

      {/* Funny Awards Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>{t.funnyAwards}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {/* Picasso */}
          {bestDrawer && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center gap-3">
              <span className="text-2xl">{bestDrawer.avatar}</span>
              <div>
                <span className="font-bold text-amber-600 dark:text-amber-400 block">
                  🎨 {t.awardPicasso}
                </span>
                <span className="font-black text-slate-900 dark:text-white">{bestDrawer.name}</span>
                <span className="block text-[10px] text-slate-500">{bestDrawer.drawingPoints} আঁকার পয়েন্ট</span>
              </div>
            </div>
          )}

          {/* Sherlock */}
          {bestGuesser && (
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 flex items-center gap-3">
              <span className="text-2xl">{bestGuesser.avatar}</span>
              <div>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block">
                  🕵️ {t.awardSherlock}
                </span>
                <span className="font-black text-slate-900 dark:text-white">{bestGuesser.name}</span>
                <span className="block text-[10px] text-slate-500">{bestGuesser.correctGuesses}টি সঠিক আন্দাজ</span>
              </div>
            </div>
          )}

          {/* Overthinker */}
          {mostWrong && (
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center gap-3">
              <span className="text-2xl">{mostWrong.avatar}</span>
              <div>
                <span className="font-bold text-rose-600 dark:text-rose-400 block">
                  🤯 {t.awardOverthinker}
                </span>
                <span className="font-black text-slate-900 dark:text-white">{mostWrong.name}</span>
                <span className="block text-[10px] text-slate-500">{mostWrong.incorrectGuesses}টি ভুল চেষ্টা</span>
              </div>
            </div>
          )}

          {/* Silent Spectator */}
          {fewestGuesses && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
              <span className="text-2xl">{fewestGuesses.avatar}</span>
              <div>
                <span className="font-bold text-slate-600 dark:text-slate-400 block">
                  🤫 {t.awardSpectator}
                </span>
                <span className="font-black text-slate-900 dark:text-white">{fewestGuesses.name}</span>
                <span className="block text-[10px] text-slate-500">চুপচাপ খেলা উপভোগকারী</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Final Leaderboard */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-3">
        <h3 className="text-base font-black text-slate-900 dark:text-white">
          {language === 'bn' ? 'চূড়ান্ত স্কোরবোর্ড' : 'Final Scoreboard'}
        </h3>

        <div className="space-y-2">
          {sorted.map((p, idx) => (
            <div
              key={p.id}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="font-black text-sm text-slate-400 w-5">#{idx + 1}</span>
                <span className="text-2xl">{p.avatar}</span>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">{p.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span>সঠিক: {p.correctGuesses || 0}</span>
                    <span>•</span>
                    <span>ভুল: {p.incorrectGuesses || 0}</span>
                    <span>•</span>
                    <span>আঁকা: {p.drawingPoints || 0}</span>
                  </div>
                </div>
              </div>

              <span className="text-base font-black text-indigo-600 dark:text-indigo-400">
                {p.totalPoints || 0} pts
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {isHost && (
          <button
            onClick={onPlayAgain}
            className="w-full sm:flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white font-black text-sm shadow-xl shadow-rose-500/25 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.playAgain}</span>
          </button>
        )}

        <button
          onClick={handleShareResults}
          className="w-full sm:flex-1 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition flex items-center justify-center gap-2"
        >
          <Share2 className="w-4 h-4" />
          <span>{language === 'bn' ? 'ফলাফল শেয়ার করুন' : 'Share Results'}</span>
        </button>

        <button
          onClick={onReturnHome}
          className="w-full sm:flex-1 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-sm transition flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" />
          <span>{t.backToHome}</span>
        </button>
      </div>
    </div>
  );
};
