import React from 'react';
import { X, Trophy, Medal, Award, Flame } from 'lucide-react';
import { Player } from '../types/game';
import { Language, TRANSLATIONS } from '../data/translations';

interface LeaderboardModalProps {
  language: Language;
  players: Player[];
  currentPlayerId: string;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  language,
  players,
  currentPlayerId,
  onClose,
}) => {
  const t = TRANSLATIONS[language];

  // Sort players descending by total points
  const sorted = [...players].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {t.leaderboard}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {language === 'bn' ? 'বর্তমান পয়েন্ট ও অবস্থান' : 'Live match scores & standings'}
            </p>
          </div>
        </div>

        {/* Players List Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {sorted.map((p, index) => {
            const isMe = p.id === currentPlayerId;
            const rank = index + 1;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-2xl flex items-center justify-between border transition ${
                  isMe
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Rank & Player Info */}
                <div className="flex items-center gap-3">
                  <div className="w-7 text-center font-black text-sm text-slate-400 dark:text-slate-500">
                    {rank === 1 ? (
                      <span className="text-lg">🥇</span>
                    ) : rank === 2 ? (
                      <span className="text-lg">🥈</span>
                    ) : rank === 3 ? (
                      <span className="text-lg">🥉</span>
                    ) : (
                      `#${rank}`
                    )}
                  </div>

                  <span className="text-2xl">{p.avatar}</span>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {p.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                          {t.you}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {p.correctGuesses || 0} {t.correct}
                      </span>
                      <span>•</span>
                      <span className="text-rose-500">
                        {p.incorrectGuesses || 0} {t.wrong}
                      </span>
                      <span>•</span>
                      <span className="text-amber-500">
                        {p.drawingPoints || 0} {t.drawingPts}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="text-lg sm:text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {p.totalPoints || 0}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400">
                    {language === 'bn' ? 'পয়েন্ট' : 'pts'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
