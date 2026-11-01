import React from 'react';
import { X, CheckCircle, HelpCircle, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';

interface HowToPlayModalProps {
  language: Language;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ language, onClose }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {t.howToPlay}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Rules Breakdown */}
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-300">
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex gap-3">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                {language === 'bn' ? '১. একজন আঁকবে, বাকিরা আন্দাজ করবে' : '1. One Draws, Others Guess'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === 'bn'
                  ? 'প্রতিটি পালায় একজন খেলোয়াড় গোপন শব্দ পাবে এবং ডিজিটাল ক্যানভাসে আঁকবে। বাকিরা তা সরাসরি দেখবে।'
                  : 'In each turn, one player gets a secret word and draws it on canvas. Other players watch live.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex gap-3">
            <Flame className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                {language === 'bn' ? '২. সব আন্দাজ হবে সরাসরি লাইভ চ্যাটে!' : '2. All Guessing is in Live Chat!'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === 'bn'
                  ? 'কোনো আলাদা উত্তর বক্স নেই! চ্যাটে যা লিখবেন স্বয়ংক্রিয়ভাবে উত্তর হিসেবে যাচাই হবে।'
                  : 'No separate answer box! Everything you send in the live group chat is automatically checked.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                {language === 'bn' ? '৩. প্রত্যেকের ৩টি স্বাধীন সুযোগ' : '3. Exactly 3 Guess Attempts'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {language === 'bn'
                  ? 'প্রতিটি ড্রয়িং পালায় প্রতি খেলোয়াড় ৩ বার আন্দাজ করতে পারবে। ৩টি ভুল হলে সে আর ওই পালায় আন্দাজ করতে পারবে না।'
                  : 'Each guesser receives 3 independent attempts per turn. After 3 wrong guesses, guessing is locked for that turn.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                {language === 'bn' ? '৪. পয়েন্টের হিসাব' : '4. Points System'}
              </h4>
              <ul className="text-xs space-y-1 mt-1 text-slate-600 dark:text-slate-400">
                <li>• <strong>+১০ পয়েন্ট:</strong> {language === 'bn' ? 'প্রথম সঠিক আন্দাজকারী' : 'First correct guesser'}</li>
                <li>• <strong>+৫ পয়েন্ট:</strong> {language === 'bn' ? 'সফল ড্রয়ার (যদি কেউ উত্তর দেয়)' : 'Drawer (if at least one player guesses)'}</li>
                <li>• <strong>-২ পয়েন্ট:</strong> {language === 'bn' ? 'প্রতিটি ভুল আন্দাজে (নেগেটিভ মার্কিং চালু থাকলে)' : 'Each wrong guess (if negative marking on)'}</li>
                <li>• <strong>-৩ পয়েন্ট:</strong> {language === 'bn' ? 'ড্রয়ার হারাবে যদি সময় শেষে কেউ না পারে' : 'Drawer loses if timer expires with no correct guess'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-sm shadow-md shadow-rose-500/20 active:scale-[0.98] transition"
        >
          {language === 'bn' ? 'বুঝেছি, চলো খেলি!' : 'Got it, let’s play!'}
        </button>
      </div>
    </div>
  );
};
