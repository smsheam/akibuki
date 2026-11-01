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
    <div className="min-h-[calc(100vh-8.5rem)] flex flex-col justify-between py-4 px-3 sm:px-6 max-w-2xl mx-auto animate-fade-in text-black dark:text-white">
      {/* 1. LOGO */}
      <div className="text-center space-y-2 mb-2">
        <BanglaAkibukiLogo size="hero" showSubtitle={true} />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-3 p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border-2 border-black dark:border-white text-black dark:text-white text-xs font-bold text-center animate-shake">
          {error}
        </div>
      )}

      {/* 2. SCREEN 1: MAIN PAGE (PROFILE + ONLY ONE BUTTON: "চলুন শুরু করি") */}
      {screen === 'landing' && (
        <div className="space-y-6 my-auto animate-fade-in">
          {/* Profile Card */}
          <div className="bg-white dark:bg-black rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-zinc-600 dark:text-zinc-400">
                {language === 'bn' ? 'আপনার ডাকনাম' : 'Your Nickname'}
              </span>
              <button
                type="button"
                onClick={handleRandomName}
                className="flex items-center gap-1 text-xs font-bold text-black dark:text-white hover:underline transition cursor-pointer"
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
              className="w-full px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 text-black dark:text-white font-black text-base focus:outline-none focus:border-black dark:focus:border-white transition shadow-inner text-center"
            />

            {/* Avatar Selector */}
            <div className="space-y-1.5">
              <span className="block text-center text-[11px] font-bold text-zinc-500">
                {language === 'bn' ? 'পছন্দের অবতার বেছে নিন' : 'Choose Avatar'}
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => onSelectAvatar(av.emoji)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all cursor-pointer ${
                      selectedAvatar === av.emoji
                        ? 'bg-black text-white dark:bg-white dark:text-black scale-110 shadow-lg border-2 border-black dark:border-white'
                        : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
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
            className="w-full py-5 rounded-3xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-black text-xl sm:text-2xl shadow-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-2 border-black dark:border-white cursor-pointer"
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
              className="flex items-center gap-1 text-xs font-bold text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'bn' ? 'পেছনে' : 'Back'}</span>
            </button>
            <span className="text-xs font-black text-zinc-400">
              {language === 'bn' ? 'মোড বেছে নিন' : 'Select Mode'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BUTTON 1: হোস্ট হন */}
            <button
              onClick={() => setScreen('host_form')}
              className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 shadow-xl hover:border-black dark:hover:border-white hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex flex-col items-center justify-center space-y-3 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform border border-zinc-700 dark:border-zinc-300">
                <Crown className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white">
                  {language === 'bn' ? 'হোস্ট হন' : 'Host a Room'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {language === 'bn' ? 'নতুন রুম তৈরি করে বন্ধুদের কোড দিন' : 'Create room & invite friends'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-black text-xs border border-black dark:border-white shadow-md">
                <span>হোস্ট করুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            {/* BUTTON 2: কোড লিখুন */}
            <button
              onClick={() => setScreen('join_form')}
              className="group p-6 sm:p-8 rounded-3xl bg-white dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 shadow-xl hover:border-black dark:hover:border-white hover:scale-[1.02] active:scale-[0.98] transition-all text-center flex flex-col items-center justify-center space-y-3 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg group-hover:-rotate-6 transition-transform border border-zinc-700 dark:border-zinc-300">
                <Zap className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white">
                  {language === 'bn' ? 'কোড লিখুন' : 'Enter Code'}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {language === 'bn' ? 'হোস্টের দেওয়া রুম কোড দিয়ে যোগ দিন' : 'Join existing room with code'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-black text-xs border border-black dark:border-white shadow-md">
                <span>যোগ দিন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
          </div>
        </div>
      )}

      {/* 4. HOST CONFIGURATION FORM */}
      {screen === 'host_form' && (
        <div className="bg-white dark:bg-black rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-zinc-200 dark:border-zinc-800 space-y-4 my-auto animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-black dark:text-white" />
              <h3 className="font-black text-base text-black dark:text-white">
                {language === 'bn' ? 'রুম হোস্ট করুন' : 'Host Room'}
              </h3>
            </div>
            <button
              onClick={() => setScreen('actions')}
              className="text-xs font-bold text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white px-3 py-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            {/* Host Nickname check */}
            <div>
              <label className="block font-black text-zinc-700 dark:text-zinc-300 mb-1">
                {language === 'bn' ? 'আপনার ডাকনাম' : 'Your Nickname'}
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => onChangeNickname(e.target.value)}
                placeholder="নাম লিখুন..."
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-bold"
                required
              />
            </div>

            {/* Rounds, Draw time, Players */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-black text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.rounds}
                </label>
                <select
                  value={rounds}
                  onChange={(e) => setRounds(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-bold"
                >
                  {[1, 2, 3, 4, 5, 8, 10].map((n) => (
                    <option key={n} value={n}>{n} রাউন্ড</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-black text-zinc-700 dark:text-zinc-300 mb-1">
                  {t.drawingTime}
                </label>
                <select
                  value={drawTime}
                  onChange={(e) => setDrawTime(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-bold"
                >
                  <option value={30}>৩০ সেকেন্ড</option>
                  <option value={45}>৪৫ সেকেন্ড</option>
                  <option value={60}>৬০ সেকেন্ড</option>
                  <option value={90}>৯০ সেকেন্ড</option>
                  <option value={120}>১২০ সেকেন্ড</option>
                </select>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block font-black text-zinc-700 dark:text-zinc-300 mb-1">
                  সর্বোচ্চ খেলোয়াড়
                </label>
                <select
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-bold"
                >
                  {[3, 4, 5, 6, 8, 10].map((n) => (
                    <option key={n} value={n}>{n} জন</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Word difficulty */}
            <div>
              <label className="block font-black text-zinc-700 dark:text-zinc-300 mb-1">
                {t.difficulty}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'mixed'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-2 rounded-xl font-black text-xs transition border cursor-pointer ${
                      difficulty === diff
                        ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                    }`}
                  >
                    {diff === 'easy' ? 'সহজ' : diff === 'medium' ? 'মাঝারি' : 'মিশ্র'}
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Marking */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div>
                <span className="block font-black text-black dark:text-white">
                  নেগেটিভ মার্কিং (-২ প্রতি ভুল)
                </span>
                <span className="text-[11px] text-zinc-500">
                  ১ম সুযোগ সম্পূর্ণ ফ্রি (পয়েন্ট কাটা হয় না)
                </span>
              </div>
              <input
                type="checkbox"
                checked={negativeMarking}
                onChange={(e) => setNegativeMarking(e.target.checked)}
                className="w-5 h-5 accent-black dark:accent-white cursor-pointer"
              />
            </div>

            {/* Submit create room button */}
            <button
              type="submit"
              disabled={loading || !nickname.trim()}
              className="w-full py-4 rounded-2xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-black text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-2 border-black dark:border-white disabled:opacity-40 cursor-pointer"
            >
              <Crown className="w-5 h-5" />
              <span>{loading ? 'রুম তৈরি হচ্ছে...' : 'রুম তৈরি করুন ও কোড নিন'}</span>
            </button>
          </form>
        </div>
      )}

      {/* 5. JOIN ROOM CODE FORM */}
      {screen === 'join_form' && (
        <div className="bg-white dark:bg-black rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-zinc-200 dark:border-zinc-800 space-y-4 my-auto animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-black dark:text-white" />
              <h3 className="font-black text-base text-black dark:text-white">
                {language === 'bn' ? 'রুমে যোগ দিন' : 'Join Room'}
              </h3>
            </div>
            <button
              onClick={() => setScreen('actions')}
              className="text-xs font-bold text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white px-3 py-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
          </div>

          <form onSubmit={handleJoinSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-black text-zinc-700 dark:text-zinc-300 mb-1">
                {language === 'bn' ? 'আপনার ডাকনাম' : 'Your Nickname'}
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => onChangeNickname(e.target.value)}
                placeholder="নাম লিখুন..."
                className="w-full px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-black text-zinc-700 dark:text-zinc-300 mb-1">
                {language === 'bn' ? '৬ অক্ষরের রুম কোড' : '6-character Room Code'}
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="যেমন: YPXUNZ"
                maxLength={6}
                className="w-full px-4 py-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 font-mono font-black text-xl text-center tracking-widest uppercase focus:outline-none focus:border-black dark:focus:border-white transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || !nickname.trim() || !joinCode.trim()}
              className="w-full py-4 rounded-2xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-black text-base shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-2 border-black dark:border-white disabled:opacity-40 cursor-pointer"
            >
              <Zap className="w-5 h-5" />
              <span>{loading ? 'যোগদান করা হচ্ছে...' : 'খেলায় প্রবেশ করুন'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
