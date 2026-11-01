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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-black dark:text-white">
      <div className="relative w-full max-w-lg bg-white dark:bg-black rounded-3xl p-6 shadow-2xl border-2 border-zinc-200 dark:border-zinc-800 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-black dark:text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black dark:text-white">
              {t.howToPlay}
            </h2>
            <p className="text-xs text-zinc-500 font-medium">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Rules Breakdown */}
        <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex gap-3">
            <Sparkles className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-black dark:text-white mb-1">
                {language === 'bn' ? '১. একজন আঁকবে, বাকিরা আন্দাজ করবে' : '1. One Draws, Others Guess'}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {language === 'bn'
                  ? 'প্রতিটি পালায় একজন খেলোয়াড় গোপন শব্দ পাবে এবং ডিজিটাল ক্যানভাসে আঁকবে। বাকিরা তা সরাসরি দেখবে।'
                  : 'In each turn, one player gets a secret word and draws it on canvas. Other players watch live.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex gap-3">
            <Flame className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-black dark:text-white mb-1">
                {language === 'bn' ? '২. সব আন্দাজ হবে সরাসরি লাইভ চ্যাটে!' : '2. All Guessing is in Live Chat!'}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {language === 'bn'
                  ? 'কোনো আলাদা উত্তর বক্স নেই! চ্যাটে যা লিখবেন স্বয়ংক্রিয়ভাবে উত্তর হিসেবে যাচাই হবে।'
                  : 'No separate answer box! Everything you send in the live group chat is automatically checked.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex gap-3">
            <ShieldAlert className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-black dark:text-white mb-1">
                {language === 'bn' ? '৩. ৪টি সুযোগ (১ম সুযোগ সম্পূর্ণ ফ্রি!)' : '3. 4 Attempts (1st Guess Free!)'}
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {language === 'bn'
                  ? 'প্রতিটি পালায় প্রতি খেলোয়াড়ের ৪টি সুযোগ থাকে। ১ম সুযোগে ভুল হলে কোনো পয়েন্ট কাটা যাবে না! ৪টি সুযোগ শেষ হলেও স্বাধীনভাবে যেকোনো কথা বা চ্যাট চালিয়ে যাওয়া যাবে।'
                  : 'Each guesser receives 4 attempts per turn. 1st wrong guess has NO mark deduction! After 4 attempts, players can continue chatting freely.'}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex gap-3">
            <CheckCircle className="w-5 h-5 text-black dark:text-white shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-black dark:text-white mb-1">
                {language === 'bn' ? '৪. পয়েন্টের হিসাব' : '4. Points System'}
              </h4>
              <ul className="text-xs space-y-1 mt-1 text-zinc-600 dark:text-zinc-400">
                <li>• <strong>+১০ পয়েন্ট:</strong> {language === 'bn' ? 'প্রথম সঠিক আন্দাজকারী' : 'First correct guesser'}</li>
                <li>• <strong>+৫ পয়েন্ট:</strong> {language === 'bn' ? 'সফল ড্রয়ার (যদি কেউ উত্তর দেয়)' : 'Drawer (if at least one player guesses)'}</li>
                <li>• <strong>১ম সুযোগ:</strong> {language === 'bn' ? 'সম্পূর্ণ ফ্রি (০ পয়েন্ট কর্তন)' : 'Free (0 deduction)'}</li>
                <li>• <strong>-২ পয়েন্ট:</strong> {language === 'bn' ? 'পরবর্তী ভুল আন্দাজে (নেগেটিভ মার্কিং চালু থাকলে)' : 'Subsequent wrong guesses (if negative marking on)'}</li>
                <li>• <strong>-৩ পয়েন্ট:</strong> {language === 'bn' ? 'ড্রয়ার হারাবে যদি সময় শেষে কেউ না পারে' : 'Drawer loses if timer expires with no correct guess'}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-2xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-sm border-2 border-black dark:border-white shadow-md active:scale-[0.98] transition cursor-pointer"
        >
          {language === 'bn' ? 'বুঝেছি, চলো খেলি!' : 'Got it, let’s play!'}
        </button>
      </div>
    </div>
  );
};
