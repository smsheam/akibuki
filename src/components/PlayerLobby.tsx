import React, { useState } from 'react';
import {
  Copy,
  Check,
  Share2,
  Crown,
  Play,
  UserX,
  Shield,
  Clock,
  Sparkles,
  Sliders,
  Users,
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
    <div className="max-w-3xl mx-auto py-6 px-3 sm:px-4 space-y-6 animate-fade-in">
      {/* World-Class Room Code Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-2xl shadow-rose-500/20 text-center border-2 border-amber-300/40">
        {/* Glow ambient background */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-900/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'প্রাইভেট রুম কোড' : 'Private Room Code'}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="font-mono text-5xl sm:text-6xl font-black tracking-widest drop-shadow-md select-all bg-white/10 px-4 py-1 rounded-2xl border border-white/20">
              {room.id}
            </span>

            <button
              onClick={handleCopyCode}
              className="p-3.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition active:scale-90 shadow-md flex items-center gap-1.5 font-bold text-xs"
              title={t.copyCode}
            >
              {copied ? <Check className="w-5 h-5 text-emerald-300" /> : <Copy className="w-5 h-5" />}
              <span>{copied ? t.codeCopied : t.copyCode}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-3.5 rounded-2xl bg-white/20 hover:bg-white/30 backdrop-blur-md transition active:scale-90 shadow-md flex items-center gap-1.5 font-bold text-xs"
              title={t.shareInvite}
            >
              <Share2 className="w-5 h-5" />
              <span>{t.shareInvite}</span>
            </button>
          </div>

          {/* Quick Settings Pill Summary */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-bold text-white/90">
            <span className="px-2.5 py-0.5 rounded-full bg-black/20">
              {room.settings.rounds} {t.rounds}
            </span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/20">
              {room.settings.drawTime}s {t.drawingTime}
            </span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/20">
              {room.settings.difficulty === 'easy'
                ? 'সহজ শব্দ'
                : room.settings.difficulty === 'medium'
                ? 'মাঝারি'
                : 'মিশ্র শব্দ'}
            </span>
            <span>•</span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/20">
              {room.settings.negativeMarking ? 'মাইনাস পয়েন্ট চালু (-২)' : 'নেগেটিভ মার্কিং বন্ধ'}
            </span>
          </div>
        </div>
      </div>

      {/* Players in Lobby Card */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {t.playersInLobby}
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              {players.length} / {room.settings.maxPlayers || 8}
            </span>
          </div>

          {isHost && (
            <button
              onClick={() => setShowSettingsEdit(!showSettingsEdit)}
              className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 hover:underline px-2.5 py-1 rounded-xl hover:bg-amber-50 dark:hover:bg-slate-800 transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showSettingsEdit ? (language === 'bn' ? 'লুকান' : 'Hide') : t.roomSettings}</span>
            </button>
          )}
        </div>

        {/* Host Edit Settings inline */}
        {isHost && showSettingsEdit && (
          <div className="mb-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-fade-in">
            <div>
              <label className="block font-black text-slate-700 dark:text-slate-300 mb-1">{t.rounds}</label>
              <select
                value={room.settings.rounds}
                onChange={(e) => onUpdateSettings({ rounds: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold"
              >
                {[1, 2, 3, 4, 5, 8, 10].map((n) => (
                  <option key={n} value={n}>{n} রাউন্ড</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 dark:text-slate-300 mb-1">{t.drawingTime}</label>
              <select
                value={room.settings.drawTime}
                onChange={(e) => onUpdateSettings({ drawTime: Number(e.target.value) })}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold"
              >
                <option value={30}>৩০ সেকেন্ড</option>
                <option value={45}>৪৫ সেকেন্ড</option>
                <option value={60}>৬০ সেকেন্ড</option>
                <option value={90}>৯০ সেকেন্ড</option>
                <option value={120}>১২০ সেকেন্ড</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-slate-700 dark:text-slate-300 mb-1">{t.difficulty}</label>
              <select
                value={room.settings.difficulty}
                onChange={(e) => onUpdateSettings({ difficulty: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 font-bold"
              >
                <option value="easy">{t.easy}</option>
                <option value="medium">{t.medium}</option>
                <option value="mixed">{t.mixed}</option>
              </select>
            </div>
          </div>
        )}

        {/* Players Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {players.map((p) => {
            const isPlayerHost = p.id === room.hostId;
            const isMe = p.id === currentPlayer.id;

            return (
              <div
                key={p.id}
                className={`p-3.5 rounded-2xl flex items-center justify-between border transition-all ${
                  isMe
                    ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 flex items-center justify-center text-2xl shadow-sm border border-slate-200 dark:border-slate-600 shrink-0">
                    {p.avatar}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900 dark:text-white text-sm">
                        {p.name}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300">
                          {t.you}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      {isPlayerHost && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-500">
                          <Crown className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{t.host}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Host Controls for other players */}
                {isHost && !isMe && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTransferHost(p.id, p.name)}
                      className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-slate-700 transition"
                      title={t.makeHost}
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onKickPlayer(p.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700 transition"
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

        {/* Start Match CTA or Waiting Notice */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          {isHost ? (
            <button
              onClick={onStartGame}
              disabled={loading || !canStart}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white font-black text-base shadow-xl shadow-rose-500/25 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-5 h-5 fill-white" />
                  <span>
                    {players.length < 2
                      ? (language === 'bn' ? 'অন্তত ২ জন খেলোয়াড় প্রয়োজন...' : 'Waiting for more players (min 2)...')
                      : t.startMatch}
                  </span>
                </>
              )}
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 flex items-center justify-center gap-3 text-indigo-700 dark:text-indigo-300 font-black text-sm">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              <span>{t.waitingForHost}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
