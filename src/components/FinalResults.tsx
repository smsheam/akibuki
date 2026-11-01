import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Home,
  Share2,
  Sparkles,
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
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8 animate-fade-in text-black dark:text-white">
      {/* Champion Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black font-black text-sm border-2 border-black dark:border-white shadow-md">
          <Trophy className="w-5 h-5" />
          <span>{t.matchResults}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-black dark:text-white">
          🎉 {winner?.name} {t.matchWinner} 🎉
        </h1>
        <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
          {language === 'bn' ? `মোট ${winner?.totalPoints || 0} পয়েন্ট পেয়ে ১ম স্থান অর্জন করেছেন!` : `Claimed 1st place with ${winner?.totalPoints || 0} total points!`}
        </p>
      </div>

      {/* Podium Presentation (1st, 2nd, 3rd) in High-Contrast Black and White */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 pt-8 pb-4">
        {/* 2nd Place */}
        {second && (
          <div className="flex flex-col items-center flex-1 max-w-[140px] animate-fade-in-up">
            <span className="text-3xl sm:text-4xl mb-1">{second.avatar}</span>
            <span className="font-bold text-xs sm:text-sm text-black dark:text-white truncate w-full text-center">
              {second.name}
            </span>
            <span className="text-xs font-black text-zinc-600 dark:text-zinc-400 mb-2">
              {second.totalPoints} pts
            </span>
            <div className="w-full h-24 sm:h-32 bg-zinc-200 dark:bg-zinc-800 rounded-t-2xl border-t-2 border-x-2 border-zinc-400 dark:border-zinc-700 flex flex-col items-center justify-center text-black dark:text-white shadow-md">
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
            <span className="font-black text-sm sm:text-base text-black dark:text-white truncate w-full text-center mt-1">
              {winner.name}
            </span>
            <span className="text-xs sm:text-sm font-black text-black dark:text-white mb-2">
              {winner.totalPoints} pts
            </span>
            <div className="w-full h-32 sm:h-44 bg-black text-white dark:bg-white dark:text-black rounded-t-2xl border-t-2 border-x-2 border-black dark:border-white flex flex-col items-center justify-center shadow-2xl">
              <span className="text-3xl">🥇</span>
              <span className="text-sm font-black mt-1">{t.podium1st}</span>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {third && (
          <div className="flex flex-col items-center flex-1 max-w-[140px] animate-fade-in-up">
            <span className="text-3xl sm:text-4xl mb-1">{third.avatar}</span>
            <span className="font-bold text-xs sm:text-sm text-black dark:text-white truncate w-full text-center">
              {third.name}
            </span>
            <span className="text-xs font-black text-zinc-600 dark:text-zinc-400 mb-2">
              {third.totalPoints} pts
            </span>
            <div className="w-full h-18 sm:h-24 bg-zinc-100 dark:bg-zinc-900 rounded-t-2xl border-t-2 border-x-2 border-zinc-300 dark:border-zinc-800 flex flex-col items-center justify-center text-black dark:text-white shadow-md">
              <span className="text-2xl">🥉</span>
              <span className="text-xs font-black mt-1">{t.podium3rd}</span>
            </div>
          </div>
        )}
      </div>

      {/* Funny Awards Section */}
      <div className="bg-white dark:bg-black rounded-3xl p-6 shadow-xl border-2 border-zinc-200 dark:border-zinc-800 space-y-4">
        <h3 className="text-base font-black text-black dark:text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-black dark:text-white" />
          <span>{t.funnyAwards}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          {/* Picasso */}
          {bestDrawer && (
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <span className="text-2xl">{bestDrawer.avatar}</span>
              <div>
                <span className="font-bold text-black dark:text-white block">
                  🎨 {t.awardPicasso}
                </span>
                <span className="font-black text-black dark:text-white">{bestDrawer.name}</span>
                <span className="block text-[10px] text-zinc-500">{bestDrawer.drawingPoints} আঁকার পয়েন্ট</span>
              </div>
            </div>
          )}

          {/* Sherlock */}
          {bestGuesser && (
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <span className="text-2xl">{bestGuesser.avatar}</span>
              <div>
                <span className="font-bold text-black dark:text-white block">
                  🕵️ {t.awardSherlock}
                </span>
                <span className="font-black text-black dark:text-white">{bestGuesser.name}</span>
                <span className="block text-[10px] text-zinc-500">{bestGuesser.correctGuesses}টি সঠিক আন্দাজ</span>
              </div>
            </div>
          )}

          {/* Overthinker */}
          {mostWrong && (
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <span className="text-2xl">{mostWrong.avatar}</span>
              <div>
                <span className="font-bold text-black dark:text-white block">
                  🤯 {t.awardOverthinker}
                </span>
                <span className="font-black text-black dark:text-white">{mostWrong.name}</span>
                <span className="block text-[10px] text-zinc-500">{mostWrong.incorrectGuesses}টি ভুল চেষ্টা</span>
              </div>
            </div>
          )}

          {/* Silent Spectator */}
          {fewestGuesses && (
            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <span className="text-2xl">{fewestGuesses.avatar}</span>
              <div>
                <span className="font-bold text-black dark:text-white block">
                  🤫 {t.awardSpectator}
                </span>
                <span className="font-black text-black dark:text-white">{fewestGuesses.name}</span>
                <span className="block text-[10px] text-zinc-500">চুপচাপ খেলা উপভোগকারী</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Complete Final Leaderboard */}
      <div className="bg-white dark:bg-black rounded-3xl p-6 shadow-xl border-2 border-zinc-200 dark:border-zinc-800 space-y-3">
        <h3 className="text-base font-black text-black dark:text-white">
          {language === 'bn' ? 'চূড়ান্ত স্কোরবোর্ড' : 'Final Scoreboard'}
        </h3>

        <div className="space-y-2">
          {sorted.map((p, idx) => (
            <div
              key={p.id}
              className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="font-black text-sm text-zinc-400 w-5">#{idx + 1}</span>
                <span className="text-2xl">{p.avatar}</span>
                <div>
                  <span className="font-bold text-black dark:text-white text-sm">{p.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                    <span>সঠিক: {p.correctGuesses || 0}</span>
                    <span>•</span>
                    <span>ভুল: {p.incorrectGuesses || 0}</span>
                    <span>•</span>
                    <span>আঁকা: {p.drawingPoints || 0}</span>
                  </div>
                </div>
              </div>

              <span className="text-base font-black text-black dark:text-white">
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
            className="w-full sm:flex-1 py-4 rounded-2xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-black text-sm shadow-xl border-2 border-black dark:border-white active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.playAgain}</span>
          </button>
        )}

        <button
          onClick={handleShareResults}
          className="w-full sm:flex-1 py-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>{language === 'bn' ? 'ফলাফল শেয়ার করুন' : 'Share Results'}</span>
        </button>

        <button
          onClick={onReturnHome}
          className="w-full sm:flex-1 py-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>{t.backToHome}</span>
        </button>
      </div>
    </div>
  );
};
