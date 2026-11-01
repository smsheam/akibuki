import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { Player, RevealedWord, RoomState, Stroke } from '../types/game';
import { Language, TRANSLATIONS } from '../data/translations';
import { DrawingReplayModal } from './DrawingReplayModal';

interface TurnSummaryModalProps {
  language: Language;
  room: RoomState;
  players: Player[];
  currentPlayer: Player;
  strokes: Stroke[];
  onStartNextTurn: () => void;
}

export const TurnSummaryModal: React.FC<TurnSummaryModalProps> = ({
  language,
  room,
  players,
  currentPlayer,
  strokes,
  onStartNextTurn,
}) => {
  const t = TRANSLATIONS[language];
  const [secondsLeft, setSecondsLeft] = useState(room.settings.waitTime || 10);
  const [showReplay, setShowReplay] = useState(false);

  const isHost = currentPlayer.id === room.hostId;
  const isGuessed = room.turnEndReason === 'correct_guess';
  const winner = players.find((p) => p.id === room.winnerId);
  const drawer = players.find((p) => p.id === room.currentDrawerId);

  // Trigger confetti on correct guess
  useEffect(() => {
    if (isGuessed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isGuessed]);

  // Countdown timer to next turn
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (isHost) {
            onStartNextTurn();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isHost, onStartNextTurn]);

  const revealed: RevealedWord = room.revealedWord || {
    en: 'Secret Word',
    bn: 'গোপন শব্দ',
    category: '',
    hint: '',
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          {/* Status Header Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            {isGuessed ? (
              <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {t.turnEndedCorrect}
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 px-3 py-1 rounded-full flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t.turnEndedTimeout}
              </span>
            )}
          </div>

          {/* Winner Banner or Timeout Alert */}
          {isGuessed && winner ? (
            <div className="space-y-1">
              <div className="text-4xl">{winner.avatar}</div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {winner.name} {language === 'bn' ? 'সঠিক উত্তর দিয়েছেন!' : 'guessed it correctly!'}
              </h3>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +১০ পয়েন্ট অর্জন করেছেন!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="text-4xl">⏰</div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {language === 'bn' ? 'সময় শেষ!' : 'Time Expired!'}
              </h3>
              <p className="text-xs font-bold text-rose-500">
                {language === 'bn'
                  ? 'কেউ সঠিক উত্তর দিতে পারেনি। ড্রয়ার ৩ পয়েন্ট হারিয়েছেন!'
                  : 'Nobody guessed correctly. Drawer lost -3 points!'}
              </p>
            </div>
          )}

          {/* Secret Word Revealed Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-indigo-500/10 border border-amber-300/40 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {t.secretWord}
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {revealed.bn}
            </div>
            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {revealed.en}
            </div>
            {revealed.category && (
              <span className="inline-block mt-1 text-[10px] font-semibold text-slate-500 bg-white/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {revealed.category}
              </span>
            )}
          </div>

          {/* Points Breakdown */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="block text-slate-400 text-[10px] font-bold">ড্রয়ার ({drawer?.name})</span>
              <span className={`font-black text-sm ${isGuessed ? 'text-emerald-600' : 'text-rose-500'}`}>
                {isGuessed ? '+৫ পয়েন্ট' : '-৩ পয়েন্ট'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="block text-slate-400 text-[10px] font-bold">আন্দাজকারী</span>
              <span className="font-black text-sm text-indigo-600 dark:text-indigo-400">
                {isGuessed ? '+১০ পয়েন্ট' : '০ পয়েন্ট'}
              </span>
            </div>
          </div>

          {/* Action: Watch Replay */}
          {strokes.length > 0 && (
            <button
              onClick={() => setShowReplay(true)}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Eye className="w-4 h-4 text-amber-500" />
              <span>{t.watchReplay}</span>
            </button>
          )}

          {/* Countdown & Next Turn Button */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{t.nextTurnIn} {secondsLeft}s</span>
            </div>

            {isHost && (
              <button
                onClick={onStartNextTurn}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-rose-500/20 active:scale-95 transition flex items-center gap-1"
              >
                <span>{language === 'bn' ? 'এখনই শুরু করুন' : 'Start Now'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Drawing Replay Modal */}
      {showReplay && (
        <DrawingReplayModal
          language={language}
          strokes={strokes}
          drawerName={drawer?.name || 'Drawer'}
          drawerAvatar={drawer?.avatar || '🎨'}
          wordEn={revealed.en}
          wordBn={revealed.bn}
          onClose={() => setShowReplay(false)}
        />
      )}
    </>
  );
};
