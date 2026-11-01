import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Smile,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Flame,
} from 'lucide-react';
import { ChatMessage, Player } from '../types/game';
import { Language, QUICK_PHRASES, TRANSLATIONS } from '../data/translations';

interface LiveChatProps {
  language: Language;
  messages: ChatMessage[];
  currentPlayer: Player;
  isDrawer: boolean;
  attemptsLeft: number;
  hasGuessedCorrectly: boolean;
  onSendMessage: (text: string, isQuickReaction?: boolean) => void;
  wrongGuessNotice?: string | null;
}

const EMOJIS = ['😂', '🤣', '😎', '👀', '❤️', '💀', '🤔', '😱', '👏', '🔥', '🎉'];

export const LiveChat: React.FC<LiveChatProps> = ({
  language,
  messages,
  currentPlayer,
  isDrawer,
  attemptsLeft,
  hasGuessedCorrectly,
  onSendMessage,
  wrongGuessNotice,
}) => {
  const t = TRANSLATIONS[language];
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPhrasesList = QUICK_PHRASES[language] || QUICK_PHRASES.bn;

  // Auto-scroll chat to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, wrongGuessNotice]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
    setShowEmojiPicker(false);
    setShowQuickPhrases(false);
  };

  const handleSelectEmoji = (emoji: string) => {
    onSendMessage(emoji, true);
    setShowEmojiPicker(false);
  };

  const handleSelectQuickPhrase = (phrase: string) => {
    onSendMessage(phrase, true);
    setShowQuickPhrases(false);
  };

  // Compute placeholder and status
  const getInputPlaceholder = () => {
    if (isDrawer) {
      return language === 'bn'
        ? 'ড্রয়ার হিসেবে লিখুন (আন্দাজ নয়)...'
        : 'Drawer chat (not a guess)...';
    }
    if (hasGuessedCorrectly) {
      return language === 'bn'
        ? 'সঠিক উত্তর দিয়েছেন! বন্ধুদের সাথে চ্যাট করুন...'
        : 'Guessed correctly! Chat with friends...';
    }
    if (attemptsLeft === 0) {
      return language === 'bn'
        ? 'আন্দাজ শেষ! স্বাধীনভাবে চ্যাট করুন...'
        : 'Attempts ended! Chat freely...';
    }
    if (attemptsLeft === 4) {
      return language === 'bn'
        ? '১ম সুযোগ ফ্রি (পয়েন্ট কাটবে না)! আন্দাজ লিখুন...'
        : '1st attempt free (no deduction)! Enter guess...';
    }
    return language === 'bn'
      ? `আন্দাজ লিখুন (${attemptsLeft}টি সুযোগ বাকি)...`
      : `Enter guess (${attemptsLeft} attempts left)...`;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black rounded-3xl shadow-xl border-2 border-zinc-200 dark:border-zinc-800 overflow-hidden text-black dark:text-white transition-colors">
      {/* Header - Crisp Monochrome */}
      <div className="px-4 py-3 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-black dark:text-white" />
          <h3 className="font-black text-sm text-black dark:text-white tracking-wide">
            {language === 'bn' ? 'লাইভ চ্যাট ও আন্দাজ' : 'Live Chat & Guess'}
          </h3>
        </div>

        {/* Guesser Attempts Badge */}
        {!isDrawer && (
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="text-zinc-500 dark:text-zinc-400">
              {t.attemptsLeft}:
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-black text-xs border ${
                hasGuessedCorrectly
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                  : attemptsLeft === 0
                  ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                  : attemptsLeft === 4
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                  : 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black border-zinc-700 dark:border-zinc-300'
              }`}
            >
              {hasGuessedCorrectly
                ? 'বিজয়ী!'
                : attemptsLeft === 0
                ? (language === 'bn' ? '০/৪ (স্বাধীন চ্যাট)' : '0/4 (Free Chat)')
                : attemptsLeft === 4
                ? (language === 'bn' ? '৪/৪ (১ম ফ্রি!)' : '4/4 (1st Free!)')
                : `${attemptsLeft}/4`}
            </span>
          </div>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 text-xs">
        {messages.map((m) => {
          const isMe = m.senderId === currentPlayer.id;

          // System message
          if (m.type === 'system') {
            return (
              <div
                key={m.id}
                className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900/90 text-zinc-600 dark:text-zinc-400 text-center font-bold text-[11px] border border-zinc-200 dark:border-zinc-800"
              >
                <span>{m.senderAvatar} </span>
                <span>{m.text}</span>
              </div>
            );
          }

          // Correct Guess Announcement (Crisp High-Contrast Card)
          if (m.type === 'correct') {
            return (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white text-center font-black shadow-lg"
              >
                <div className="flex items-center justify-center gap-1.5 text-xs mb-0.5 tracking-wider uppercase opacity-90">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{m.senderName} {t.correctGuessNotification}</span>
                </div>
                <div className="text-base font-black tracking-wide">
                  "{m.text}"
                </div>
              </div>
            );
          }

          // Wrong Guess Indicator
          if (m.type === 'wrong') {
            return (
              <div
                key={m.id}
                className={`flex gap-2 items-start ${isMe ? 'flex-row-reverse' : ''}`}
              >
                <span className="text-base shrink-0">{m.senderAvatar}</span>
                <div
                  className={`max-w-[80%] px-3 py-1.5 rounded-2xl border ${
                    isMe
                      ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-400 dark:border-zinc-600 text-black dark:text-white'
                      : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 line-through'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-[10px] text-zinc-500 dark:text-zinc-400">
                    <span>{m.senderName}</span>
                    <span>({t.wrongGuessNotification})</span>
                  </div>
                  <p className="font-semibold text-xs mt-0.5">{m.text}</p>
                </div>
              </div>
            );
          }

          // Regular Chat Message or Reaction
          return (
            <div
              key={m.id}
              className={`flex gap-2 items-start ${isMe ? 'flex-row-reverse' : ''}`}
            >
              <span className="text-base shrink-0">{m.senderAvatar}</span>
              <div
                className={`max-w-[80%] px-3 py-2 rounded-2xl ${
                  isMe
                    ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-none shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-tl-none border border-zinc-200 dark:border-zinc-700'
                }`}
              >
                {!isMe && (
                  <span className="block font-bold text-[10px] text-zinc-500 dark:text-zinc-400 mb-0.5">
                    {m.senderName}
                  </span>
                )}
                <p className="font-medium text-xs break-words">{m.text}</p>
              </div>
            </div>
          );
        })}

        {/* Local Wrong Guess Alert banner */}
        {wrongGuessNotice && (
          <div className="p-2 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-center text-xs shadow-md border border-zinc-400 dark:border-zinc-600 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>{wrongGuessNotice}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis & Quick Phrases Row */}
      <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-1 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {EMOJIS.slice(0, 7).map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSelectEmoji(emoji)}
              className="text-base hover:scale-125 transition active:scale-95 px-1 py-0.5"
            >
              {emoji}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowQuickPhrases(!showQuickPhrases)}
          className="text-[11px] font-black text-black dark:text-white hover:underline px-2 py-0.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 shrink-0 flex items-center gap-1"
        >
          <Flame className="w-3.5 h-3.5 text-black dark:text-white" />
          <span>{t.quickPhrases}</span>
        </button>
      </div>

      {/* Quick Phrases Dropup */}
      {showQuickPhrases && (
        <div className="p-2 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {quickPhrasesList.map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => handleSelectQuickPhrase(phrase)}
              className="px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold text-[11px] transition border border-zinc-200 dark:border-zinc-700"
            >
              {phrase}
            </button>
          ))}
        </div>
      )}

      {/* Input Form (Chat-Only Guessing) - Never disabled when attempts end! */}
      <form
        onSubmit={handleSubmit}
        className="p-2 sm:p-3 bg-white dark:bg-black border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={getInputPlaceholder()}
            className="w-full pl-3 pr-10 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-black dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:border-black dark:focus:border-white transition placeholder:text-zinc-400"
          />

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-black dark:hover:text-white transition"
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-2xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-black shadow-md active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          title={t.send}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Emoji Picker Modal / Popup */}
      {showEmojiPicker && (
        <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-6 gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSelectEmoji(emoji)}
              className="text-xl p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:scale-110 active:scale-95 transition text-center"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
