import React from 'react';
import { X, Trophy } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-black dark:text-white">
      <div className="relative w-full max-w-lg bg-white dark:bg-black rounded-3xl p-6 shadow-2xl border-2 border-zinc-200 dark:border-zinc-800 max-h-[85vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-black dark:text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black dark:text-white">
              {t.leaderboard}
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
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
                className={`p-3 rounded-2xl flex items-center justify-between border-2 transition ${
                  isMe
                    ? 'bg-zinc-100 dark:bg-zinc-900 border-black dark:border-white'
                    : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {/* Rank & Player Info */}
                <div className="flex items-center gap-3">
                  <div className="w-7 text-center font-black text-sm text-zinc-400 dark:text-zinc-500">
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
                      <span className="font-bold text-black dark:text-white text-sm">
                        {p.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-black text-white dark:bg-white dark:text-black">
                          {t.you}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-semibold mt-0.5">
                      <span>
                        {p.correctGuesses || 0} {t.correct}
                      </span>
                      <span>•</span>
                      <span>
                        {p.incorrectGuesses || 0} {t.wrong}
                      </span>
                      <span>•</span>
                      <span>
                        {p.drawingPoints || 0} {t.drawingPts}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="text-lg sm:text-xl font-black text-black dark:text-white">
                    {p.totalPoints || 0}
                  </span>
                  <span className="block text-[10px] font-bold text-zinc-400">
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
          className="w-full mt-4 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 font-bold text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          {t.close}
        </button>
      </div>
    </div>
  );
};
