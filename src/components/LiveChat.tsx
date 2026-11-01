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

const EMOJIS = ['😂', '🤣', '😭', '😎', '🔥', '👀', '❤️', '💀', '🤔', '😱', '🎉'];

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

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          <h3 className="font-black text-sm text-slate-800 dark:text-slate-100">
            {language === 'bn' ? 'লাইভ চ্যাট ও আন্দাজ' : 'Live Chat & Guess'}
          </h3>
        </div>

        {/* Guesser Attempts Badge */}
        {!isDrawer && (
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="text-slate-500 dark:text-slate-400">
              {t.attemptsLeft}:
            </span>
            <span
              className={`px-2 py-0.5 rounded-md font-black text-white ${
                hasGuessedCorrectly
                  ? 'bg-emerald-500'
                  : attemptsLeft === 0
                  ? 'bg-rose-500'
                  : attemptsLeft === 1
                  ? 'bg-amber-500'
                  : 'bg-indigo-600'
              }`}
            >
              {hasGuessedCorrectly ? 'বিজয়ী!' : `${attemptsLeft}/3`}
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
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-center font-bold text-[11px] border border-slate-200/60 dark:border-slate-700/60"
              >
                <span>{m.senderAvatar} </span>
                <span>{m.text}</span>
              </div>
            );
          }

          // Correct Guess Announcement (Highlighted golden card)
          if (m.type === 'correct') {
            return (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-200 text-center font-black shadow-md animate-bounce"
              >
                <div className="flex items-center justify-center gap-1.5 text-sm mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  <span>{m.senderName} {t.correctGuessNotification}</span>
                </div>
                <div className="text-base text-emerald-900 dark:text-emerald-100 font-extrabold">
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
                      ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 line-through'
                  }`}
                >
                  <div className="flex items-center gap-1 font-bold text-[10px] opacity-75">
                    <span>{m.senderName}</span>
                    <span className="text-rose-500">({t.wrongGuessNotification})</span>
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
                    ? 'bg-gradient-to-r from-indigo-600 to-rose-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                }`}
              >
                {!isMe && (
                  <span className="block font-bold text-[10px] text-indigo-500 dark:text-indigo-400 mb-0.5">
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
          <div className="p-2 rounded-xl bg-rose-500 text-white font-bold text-center text-xs shadow-md animate-shake flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            <span>{wrongGuessNotice}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emojis & Quick Phrases Row */}
      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-1 shrink-0">
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
          className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-1.5 py-0.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-700 shrink-0 flex items-center gap-1"
        >
          <Flame className="w-3 h-3 text-amber-500" />
          <span>{t.quickPhrases}</span>
        </button>
      </div>

      {/* Quick Phrases Dropup */}
      {showQuickPhrases && (
        <div className="p-2 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
          {quickPhrasesList.map((phrase) => (
            <button
              key={phrase}
              type="button"
              onClick={() => handleSelectQuickPhrase(phrase)}
              className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-amber-500 hover:text-white font-bold text-[11px] transition"
            >
              {phrase}
            </button>
          ))}
        </div>
      )}

      {/* Input Form (Chat-Only Guessing) */}
      <form
        onSubmit={handleSubmit}
        className="p-2 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
      >
        <div className="relative flex-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isDrawer
                ? (language === 'bn' ? 'ড্রয়ার চ্যাট করতে পারেন (আন্দাজ নয়)...' : 'You are drawing (chat only)...')
                : attemptsLeft === 0
                ? t.attemptsExhausted
                : t.chatPlaceholder
            }
            disabled={!isDrawer && attemptsLeft === 0 && hasGuessedCorrectly}
            className="w-full pl-3 pr-10 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition disabled:opacity-50"
          />

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <Smile className="w-4 h-4" />
          </button>
        </div>

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-bold shadow-md shadow-indigo-500/20 active:scale-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          title={t.send}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Emoji Picker Modal / Popup */}
      {showEmojiPicker && (
        <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 grid grid-cols-6 gap-2">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleSelectEmoji(emoji)}
              className="text-2xl p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-125 transition"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
