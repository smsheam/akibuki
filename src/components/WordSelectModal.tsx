import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, Paintbrush, Check } from 'lucide-react';
import { Language } from '../data/translations';
import { WordItem } from '../data/words';
import { RoomState } from '../types/game';

interface WordSelectModalProps {
  language: Language;
  isDrawer: boolean;
  drawerName: string;
  drawerAvatar: string;
  wordOptions: WordItem[];
  room: RoomState;
  onSelectWord: (word: WordItem) => void;
}

export const WordSelectModal: React.FC<WordSelectModalProps> = ({
  language,
  isDrawer,
  drawerName,
  drawerAvatar,
  wordOptions,
  room,
  onSelectWord,
}) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [chosenWord, setChosenWord] = useState<WordItem | null>(null);
  const [revealCountdown, setRevealCountdown] = useState(3);

  // Auto pick after 15 seconds if drawer hasn't chosen
  useEffect(() => {
    if (!isDrawer) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto select first word
          if (wordOptions.length > 0 && !chosenWord) {
            handleChoose(wordOptions[0]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDrawer, wordOptions, chosenWord]);

  // Handle word selection and start reveal phase
  const handleChoose = (word: WordItem) => {
    setChosenWord(word);
    setRevealCountdown(3);
  };

  // Pre-draw reveal countdown
  useEffect(() => {
    if (!chosenWord) return;

    const interval = setInterval(() => {
      setRevealCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onSelectWord(chosenWord);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [chosenWord, onSelectWord]);

  // If Drawer just chose a word, show large dramatic pre-draw word reveal
  if (isDrawer && chosenWord) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
        <div className="w-full max-w-lg bg-white dark:bg-black rounded-3xl border-4 border-black dark:border-white p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4" />
            {language === 'bn' ? 'আপনার নির্বাচিত শব্দ' : 'Your Chosen Word'}
          </div>

          <div className="my-6 p-6 sm:p-8 bg-zinc-100 dark:bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-400 dark:border-zinc-600">
            <h1 className="text-4xl sm:text-6xl font-black text-black dark:text-white tracking-tight mb-2">
              {chosenWord.bn}
            </h1>
            <p className="text-xl sm:text-2xl font-extrabold text-zinc-600 dark:text-zinc-400">
              ({chosenWord.en})
            </p>
            {chosenWord.hint && (
              <p className="mt-4 text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 py-1.5 px-3 rounded-xl inline-block border border-zinc-300 dark:border-zinc-700">
                💡 {chosenWord.hint}
              </p>
            )}
          </div>

          <p className="text-xs sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-6">
            {language === 'bn'
              ? `${revealCountdown} সেকেন্ডের মধ্যে ক্যানভাস প্রস্তুত হচ্ছে...`
              : `Canvas ready in ${revealCountdown} seconds...`}
          </p>

          <button
            type="button"
            onClick={() => onSelectWord(chosenWord)}
            className="w-full py-4 rounded-2xl bg-black text-white dark:bg-white dark:text-black font-black text-base sm:text-lg border-2 border-black dark:border-white shadow-xl hover:scale-[1.02] active:scale-[0.98] transition flex items-center justify-center gap-2"
          >
            <Paintbrush className="w-5 h-5" />
            <span>{language === 'bn' ? 'আমি প্রস্তুত, আঁকা শুরু করি!' : "I'm Ready, Start Drawing!"}</span>
          </button>
        </div>
      </div>
    );
  }

  // Drawer Word Selection Interface (Choose 1 of 3)
  if (isDrawer) {
    return (
      <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
        <div className="w-full max-w-xl bg-white dark:bg-black rounded-3xl border-2 sm:border-4 border-black dark:border-white p-5 sm:p-7 shadow-2xl relative">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Paintbrush className="w-5 h-5 text-black dark:text-white" />
                <h2 className="text-xl sm:text-2xl font-black text-black dark:text-white">
                  {language === 'bn' ? 'একটি শব্দ বেছে নিন' : 'Choose a Word'}
                </h2>
              </div>
              <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mt-1">
                {language === 'bn'
                  ? '৩টি শব্দের যেকোনো একটি বেছে নিয়ে আঁকা শুরু করুন'
                  : 'Select one of the 3 words to draw for other players'}
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-black">
              <Clock className="w-4 h-4 text-black dark:text-white" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          {/* 3 Word Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
            {wordOptions.map((word, idx) => (
              <button
                key={word.id || idx}
                type="button"
                onClick={() => handleChoose(word)}
                className="group relative flex flex-col items-center justify-between p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-center shadow-sm hover:shadow-lg active:scale-95"
              >
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  {language === 'bn' ? `বিকল্প ${idx + 1}` : `Option ${idx + 1}`}
                </span>

                <div className="my-2">
                  <div className="text-xl sm:text-2xl font-black text-black dark:text-white group-hover:scale-105 transition">
                    {word.bn}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {word.en}
                  </div>
                </div>

                <div className="mt-3 w-full py-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-black text-xs transition group-hover:shadow flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'বেছে নিন' : 'Choose'}</span>
                </div>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-center font-bold text-zinc-400">
            {language === 'bn'
              ? 'সময় শেষ হলে স্বয়ংক্রিয়ভাবে প্রথম বিকল্পটি নির্বাচিত হবে।'
              : 'The first word will be auto-chosen if timer runs out.'}
          </p>
        </div>
      </div>
    );
  }

  // Guessers View (Waiting for Drawer to Pick)
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-black rounded-3xl border-2 sm:border-4 border-black dark:border-white p-6 sm:p-8 text-center shadow-2xl">
        <div className="text-5xl sm:text-6xl mb-4 animate-bounce select-none">
          {drawerAvatar || '🎨'}
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white mb-2">
          {drawerName} {language === 'bn' ? 'শব্দ বেছে নিচ্ছেন...' : 'is choosing a word...'}
        </h3>

        <p className="text-xs sm:text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-6">
          {language === 'bn'
            ? 'প্রস্তুত হোন! চ্যাটে প্রথম সঠিক আন্দাজ দিলেই ১০ পয়েন্ট পাবেন।'
            : 'Get ready! The first correct guess in live chat scores 10 points.'}
        </p>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-xs font-black text-black dark:text-white">
          <Clock className="w-4 h-4 animate-spin" />
          <span>{language === 'bn' ? 'অপেক্ষা করুন' : 'Waiting...'}</span>
        </div>
      </div>
    </div>
  );
};
