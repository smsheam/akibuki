import React, { useState } from 'react';
import {
  Users,
  Crown,
  Zap,
  ArrowRight,
  Dice5,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { AVATARS, Language, TRANSLATIONS } from '../data/translations';
import { RoomSettings } from '../types/game';
import { BanglaAkibukiLogo } from './BanglaAkibukiLogo';

interface IntroductionPageProps {
  language: Language;
  nickname: string;
  onChangeNickname: (name: string) => void;
  selectedAvatar: string;
  onSelectAvatar: (avatarEmoji: string) => void;
  onCreateRoom: (customSettings?: Partial<RoomSettings>) => void;
  onJoinRoom: (roomCode: string) => void;
  loading: boolean;
  error?: string | null;
}

const FUNNY_NAMES = [
  'পিকাসো ভাই',
  'রকেট মামা',
  'ঝড়ো তুফান',
  'ছোট নবাব',
  'বিড়াল পণ্ডিত',
  'মাস্টার মাইন্ড',
  'পান্ডা বাবু',
  'ডিজিটাল শিল্পী',
];

export const IntroductionPage: React.FC<IntroductionPageProps> = ({
  language,
  nickname,
  onChangeNickname,
  selectedAvatar,
  onSelectAvatar,
  onCreateRoom,
  onJoinRoom,
  loading,
  error,
}) => {
  const t = TRANSLATIONS[language];

  // Screen flow: 'landing' (Main page with only "চলুন শুরু করি") -> 'actions' (Two buttons: "হোস্ট হন" & "কোড লিখুন") -> 'host_form' / 'join_form'
  const [screen, setScreen] = useState<'landing' | 'actions' | 'host_form' | 'join_form'>('landing');
  const [joinCode, setJoinCode] = useState('');

  // Host settings
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [rounds, setRounds] = useState(3);
  const [drawTime, setDrawTime] = useState(60);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'mixed'>('easy');
  const [negativeMarking, setNegativeMarking] = useState(true);

  const handleRandomName = () => {
    const random = FUNNY_NAMES[Math.floor(Math.random() * FUNNY_NAMES.length)];
    onChangeNickname(random);
  };

  const handleMainStartClick = () => {
    if (!nickname.trim()) {
      handleRandomName();
    }
    setScreen('actions');
  };

  const handleCreateSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nickname.trim()) return;
    onCreateRoom({
      maxPlayers,
      rounds,
      drawTime,
      waitTime: 10,
      language: 'mixed',
      difficulty,
      negativeMarking,
      soundEffects: true,
    });
  };

  const handleJoinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nickname.trim() || !joinCode.trim()) return;
    onJoinRoom(joinCode.trim().toUpperCase());
  };

  return (
    <div className="min-h-[calc(100vh-8.5rem)] flex flex-col justify-between py-4 px-3 sm:px-6 max-w-2xl mx-auto animate-fade-in">
      {/* 1. LOGO */}
      <div className="text-center space-y-2 mb-2">
        <BanglaAkibukiLogo size="hero" showSubtitle={true} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold text-center animate-shake">
          {error}
        </div>
      )}

      {/* 2. SCREEN 1: MAIN PAGE (PROFILE + ONLY ONE BUTTON: "চলুন শুরু করি") */}
      {screen === 'landing' && (
        <div className="space-y-6 my-auto animate-fade-in">
          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'আপনার ডাকনাম' : 'Your Nickname'}
              </span>
              <button
                type="button"
                onClick={handleRandomName}
                className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition"
              >
                <Dice5 className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'র‍্যান্ডম নাম' : 'Random Name'}</span>
              </button>
            </div>

            <input
              type="text"
              value={nickname}
              onChange={(e) => onChangeNickname(e.target.value)}
              placeholder={language === 'bn' ? 'নাম লিখুন (যেমন: মিম, রনি...)' : 'Enter nickname...'}
              maxLength={20}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-base focus:outline-none focus:border-amber-500 transition shadow-inner text-center"
            />

            {/* Avatar Selector */}
            <div className="space-y-1.5">
              <span className="block text-center text-[11px] font-bold text-slate-400">
                {language === 'bn' ? 'পছন্দের অবতার বেছে নিন' : 'Choose Avatar'}
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => onSelectAvatar(av.emoji)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all ${
                      selectedAvatar === av.emoji
                        ? 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white scale-110 shadow-lg shadow-rose-500/30 ring-2 ring-amber-300'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title={av.name}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* THE ONLY ONE BUTTON ON MAIN PAGE: চলুন শুরু করি */}
          <button
            onClick={handleMainStartClick}
            className="w-full py-5 rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-xl sm:text-2xl shadow-2xl shadow-rose-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-2 border-amber-300/40 cursor-pointer"
          >
            <Sparkles className="w-6 h-6 animate-spin" style={{ animationDuration: '4s' }} />
            <span>{language === 'bn' ? 'চলুন শুরু করি' : "Let's Begin"}</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* 3. SCREEN 2: TWO BUTTONS ("হোস্ট হন" & "কোড লিখুন") */}
      {screen === 'actions' && (
        <div className="space-y-4 my-auto animate-fade-in">
          <div className="flex items-center justify-between pb-1">
            <button
              onClick={() => setScreen('landing')}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'bn' ? 'পেছনে' : 'Back'}</span>
            </button>
            <span className="text-xs font-black text-slate-400">
              {language === 'bn' ? 'মোড বেছে নিন' : 'Select Mode'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BUTTON 1: হোস্ট হন */}
            <button
              onClick={() => setScreen('host_form')}
              className="group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-rose-500/10 to-transparent bg-white dark:bg-slate-900 border-2 border-amber-400/60 dark:border-amber-500/30 shadow-xl hover:border-amber-500 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/25 group-hover:rotate-6 transition-transform">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? 'হোস্ট হন' : 'Host a Room'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'bn' ? 'নতুন রুম তৈরি করে বন্ধুদের কোড দিন' : 'Create room & invite friends'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md">
                <span>হোস্ট করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            {/* BUTTON 2: কোড লিখুন */}
            <button
              onClick={() => setScreen('join_form')}
              className="group p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-cyan-500/10 to-transparent bg-white dark:bg-slate-900 border-2 border-indigo-400/60 dark:border-indigo-500/30 shadow-xl hover:border-indigo-500 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:-rotate-6 transition-transform">
                <Zap className="w-8 h-8 fill-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? 'কোড লিখুন' : 'Enter Code'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {language === 'bn' ? 'হোস্টের দেওয়া রুম কোড দিয়ে যোগ দিন' : 'Join existing room with code'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-indigo-600 text-white font-black text-xs shadow-md">
                <span>যোগ দিন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 4. HOST CONFIGURATION FORM */}
      {screen === 'host_form' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-amber-300/60 dark:border-slate-800 space-y-4 my-auto animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {language === 'bn' ? 'রুম হোস্ট করুন' : 'Host Room'}
              </h3>
            </div>
            <button
              onClick={() => setScreen('actions')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              ← {language === 'bn' ? 'পেছনে' : 'Back'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">খেলোয়াড়:</span>
              <select
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 font-bold"
              >
                {[3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n} জন</option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">রাউন্ড:</span>
              <select
                value={rounds}
                onChange={(e) => setRounds(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 font-bold"
              >
                {[1, 2, 3, 4, 5, 8, 10].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">সময়:</span>
              <select
                value={drawTime}
                onChange={(e) => setDrawTime(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 font-bold"
              >
                <option value={30}>৩০ সেকেন্ড</option>
                <option value={45}>৪৫ সেকেন্ড</option>
                <option value={60}>৬০ সেকেন্ড</option>
                <option value={90}>৯০ সেকেন্ড</option>
              </select>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">কঠিনতা:</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="px-2 py-1 rounded-lg bg-white dark:bg-slate-700 font-bold"
              >
                <option value="easy">সহজ</option>
                <option value="medium">মাঝারি</option>
                <option value="mixed">মিশ্র</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => handleCreateSubmit()}
            disabled={loading || !nickname.trim()}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-base shadow-xl shadow-rose-500/25 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Crown className="w-5 h-5" />
                <span>{language === 'bn' ? 'রুম শুরু করুন' : 'Start Room'}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 5. JOIN WITH CODE FORM */}
      {screen === 'join_form' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-indigo-300/60 dark:border-slate-800 space-y-4 my-auto animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                {language === 'bn' ? 'কোড লিখুন' : 'Enter Code'}
              </h3>
            </div>
            <button
              onClick={() => setScreen('actions')}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              ← {language === 'bn' ? 'পেছনে' : 'Back'}
            </button>
          </div>

          <div className="space-y-2 text-center max-w-xs mx-auto">
            <span className="block text-xs font-bold text-slate-500">
              {language === 'bn' ? '৬ অক্ষরের রুম কোড:' : '6-digit Room Code:'}
            </span>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="AKIB72"
              maxLength={6}
              className="w-full text-center tracking-widest text-3xl font-mono font-black uppercase px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
            />
          </div>

          <button
            onClick={() => handleJoinSubmit()}
            disabled={loading || !nickname.trim() || joinCode.trim().length !== 6}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-black text-base shadow-xl shadow-indigo-500/25 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>{language === 'bn' ? 'প্রবেশ করুন' : 'Join Now'}</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
