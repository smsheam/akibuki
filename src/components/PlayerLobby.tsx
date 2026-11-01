import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  Crown,
  Play,
  UserX,
  Shield,
  Sliders,
  Users,
  Sparkles,
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../data/translations';
import { Player, RoomSettings, RoomState } from '../types/game';

interface PlayerLobbyProps {
  language: Language;
  room: RoomState;
  players: Player[];
  currentPlayer: Player;
  onStartGame: () => void;
  onKickPlayer: (playerId: string) => void;
  onTransferHost: (newHostId: string, newHostName: string) => void;
  onUpdateSettings: (settings: Partial<RoomSettings>) => void;
  loading: boolean;
}

export const PlayerLobby: React.FC<PlayerLobbyProps> = ({
  language,
  room,
  players,
  currentPlayer,
  onStartGame,
  onKickPlayer,
  onTransferHost,
  onUpdateSettings,
  loading,
}) => {
  const t = TRANSLATIONS[language];
  const [copied, setCopied] = useState(false);
  const [showSettingsEdit, setShowSettingsEdit] = useState(false);

  const isHost = currentPlayer.id === room.hostId;
  const canStart = isHost && players.length >= 2;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const shareText = `আঁকিবুঁকি খেলুন! রুম কোড: ${room.id}। চলো একসাথে আঁকি ও আন্দাজ করি!`;
    if (navigator.share) {
      navigator.share({
        title: 'আঁকিবুঁকি - Akibuki',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-3 sm:px-4 space-y-6 animate-fade-in text-black dark:text-white">
      {/* High-Contrast Room Code Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-black text-white dark:bg-zinc-950 shadow-2xl text-center border-2 border-zinc-700 dark:border-zinc-800">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-[11px] font-black uppercase tracking-widest text-zinc-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'প্রাইভেট রুম কোড' : 'Private Room Code'}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="font-mono text-5xl sm:text-6xl font-black tracking-widest select-all bg-zinc-900 px-5 py-1.5 rounded-2xl border-2 border-zinc-700 text-white">
              {room.id}
            </span>

            <button
              onClick={handleCopyCode}
              className="p-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-black text-xs transition active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
              title={t.copyCode}
            >
              {copied ? <Check className="w-5 h-5 text-black" /> : <Copy className="w-5 h-5" />}
              <span>{copied ? t.codeCopied : t.copyCode}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 font-black text-xs transition active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
              title={t.shareInvite}
            >
              <Share2 className="w-5 h-5" />
              <span>{t.shareInvite}</span>
            </button>
          </div>

          {/* Quick Settings Pill Summary */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-bold text-zinc-300">
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
              {room.settings.rounds} {t.rounds}
            </span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
              {room.settings.drawTime}s {t.drawingTime}
            </span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
              {room.settings.difficulty === 'easy'
                ? 'সহজ শব্দ'
                : room.settings.difficulty === 'medium'
                ? 'মাঝারি'
                : 'মিশ্র শব্দ'}
            </span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
              {room.settings.negativeMarking ? 'মাইনাস পয়েন্ট চালু (-২)' : 'নেগেটিভ বন্ধ'}
            </span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800">
              ৪টি সুযোগ (১ম ফ্রি)
            </span>
          </div>
        </div>
      </div>

      {/* Players in Lobby Card */}
      <div className="bg-white dark:bg-black rounded-3xl p-6 shadow-xl border-2 border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
              <Users className="w-4 h-4 text-black dark:text-white" />
            </div>
            <h3 className="text-lg font-black text-black dark:text-white">
              {t.playersInLobby}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
              {players.length} / {room.settings.maxPlayers || 8}
            </span>
          </div>

          {isHost && (
            <button
              onClick={() => setShowSettingsEdit(!showSettingsEdit)}
              className="flex items-center gap-1.5 text-xs font-black text-black dark:text-white hover:underline px-2.5 py-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showSettingsEdit ? (language === 'bn' ? 'লুকান' : 'Hide') : t.roomSettings}</span>
            </button>
          )}
        </div>

        {/* Host Edit Settings inline */}
        {isHost && showSettingsEdit && (
          <div className="mb-5 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fade-in">
            <div>
              <label className="block font-black text-zinc-700 dark:text-zinc-300 mb-1">{t.rounds}</label>
              <select
                value={room.settings.rounds}
                onChange={(e) => onUpdateSettings({ rounds: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold"
              >
                {[1, 2, 3, 4, 5, 8, 10].map((n) => (
                  <option key={n} value={n}>{n} রাউন্ড</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-black text-zinc-700 dark:text-zinc-300 mb-1">{t.drawingTime}</label>
              <select
                value={room.settings.drawTime}
                onChange={(e) => onUpdateSettings({ drawTime: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold"
              >
                <option value={30}>৩০ সেকেন্ড</option>
                <option value={45}>৪৫ সেকেন্ড</option>
                <option value={60}>৬০ সেকেন্ড</option>
                <option value={90}>৯০ সেকেন্ড</option>
                <option value={120}>১২০ সেকেন্ড</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-zinc-700 dark:text-zinc-300 mb-1">{t.difficulty}</label>
              <select
                value={room.settings.difficulty}
                onChange={(e) => onUpdateSettings({ difficulty: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold"
              >
                <option value="easy">{t.easy}</option>
                <option value="medium">{t.medium}</option>
                <option value="mixed">{t.mixed}</option>
              </select>
            </div>
          </div>
        )}

        {/* Players List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {players.map((p) => {
            const isMe = p.id === currentPlayer.id;
            const pIsHost = p.id === room.hostId;

            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl flex items-center justify-between border-2 transition ${
                  isMe
                    ? 'bg-zinc-100 dark:bg-zinc-900 border-black dark:border-white shadow-sm'
                    : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.avatar}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm text-black dark:text-white">
                        {p.name}
                      </span>
                      {pIsHost && (
                        <span className="flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded-md bg-black text-white dark:bg-white dark:text-black">
                          <Crown className="w-3 h-3" />
                          <span>হোস্ট</span>
                        </span>
                      )}
                      {isMe && !pIsHost && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white">
                          আপনি
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-semibold text-zinc-500">
                      {p.isOnline ? 'অনলাইন' : 'অফলাইন'}
                    </span>
                  </div>
                </div>

                {/* Host actions on other players */}
                {isHost && !pIsHost && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTransferHost(p.id, p.name)}
                      className="p-1.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs transition cursor-pointer"
                      title={t.makeHost}
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onKickPlayer(p.id)}
                      className="p-1.5 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs transition cursor-pointer"
                      title={t.kickPlayer}
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Start Game Action (Host only) or Waiting Banner (Guests) */}
        {isHost ? (
          <div className="space-y-2">
            <button
              onClick={onStartGame}
              disabled={loading || !canStart}
              className="w-full py-4 rounded-2xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-black text-lg shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-2 border-black dark:border-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>{t.startMatch}</span>
            </button>
            {!canStart && (
              <p className="text-center text-xs font-bold text-zinc-500">
                {language === 'bn' ? 'খেলা শুরু করতে অন্তত ২ জন খেলোয়াড় প্রয়োজন।' : 'At least 2 players are needed to start.'}
              </p>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-center font-bold text-xs text-zinc-600 dark:text-zinc-400 animate-pulse">
            {t.waitingForHost}
          </div>
        )}
      </div>
    </div>
  );
};
