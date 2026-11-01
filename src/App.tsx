import React, { useState, useEffect, useRef } from 'react';
import { testConnection } from './firebase';
import {
  clearCanvas,
  createRoom,
  handleTurnTimeout,
  joinRoom,
  kickPlayer,
  listenToChat,
  listenToPlayers,
  listenToRoom,
  listenToSecretTurn,
  listenToStrokes,
  sendStroke,
  startGame,
  startNextTurn,
  submitChatMessage,
  transferHost,
  updateRoomSettings,
} from './services/gameService';
import { ChatMessage, Player, RoomSettings, RoomState, Stroke } from './types/game';
import { Language, TRANSLATIONS } from './data/translations';
import { Navbar } from './components/Navbar';
import { SplashIntro } from './components/SplashIntro';
import { IntroductionPage } from './components/IntroductionPage';
import { PlayerLobby } from './components/PlayerLobby';
import { DrawingCanvas } from './components/DrawingCanvas';
import { LiveChat } from './components/LiveChat';
import { TurnSummaryModal } from './components/TurnSummaryModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { FinalResults } from './components/FinalResults';
import {
  playCorrectSound,
  playTickSound,
  playWinFanfare,
  playWrongSound,
} from './utils/sound';

export default function App() {
  // App settings & Theme
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('akibuki_lang') as Language) || 'bn';
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('akibuki_theme') === 'dark';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('akibuki_sound') !== 'false';
  });

  // 3-second Intro Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Player Guest Identity (Zero friction, no Google Sign In)
  const [playerId] = useState<string>(() => {
    let id = localStorage.getItem('akibuki_player_id');
    if (!id) {
      id = 'p_' + Math.random().toString(36).substring(2, 8) + Date.now().toString(36).slice(-4);
      localStorage.setItem('akibuki_player_id', id);
    }
    return id;
  });

  const [nickname, setNickname] = useState<string>(() => {
    return localStorage.getItem('akibuki_nickname') || '';
  });
  const [avatar, setAvatar] = useState<string>(() => {
    return localStorage.getItem('akibuki_avatar') || '🐯';
  });

  // Navigation & Room state
  const [activeRoomId, setActiveRoomId] = useState<string | null>(() => {
    return localStorage.getItem('akibuki_room_id') || null;
  });
  const [room, setRoom] = useState<RoomState | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [secretTurn, setSecretTurn] = useState<any>(null);

  // Modals & UI state
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [wrongNotice, setWrongNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Drawing timer remaining
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const lastTickSecondRef = useRef<number>(-1);
  const isHandlingTimeoutRef = useRef<boolean>(false);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('akibuki_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('akibuki_theme', 'light');
    }
  }, [isDarkMode]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('akibuki_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('akibuki_sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    if (nickname) localStorage.setItem('akibuki_nickname', nickname);
    if (avatar) localStorage.setItem('akibuki_avatar', avatar);
  }, [nickname, avatar]);

  // Test Firebase connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  // Room listener
  useEffect(() => {
    if (!activeRoomId) {
      setRoom(null);
      setPlayers([]);
      setStrokes([]);
      setChatMessages([]);
      setSecretTurn(null);
      return;
    }

    const unsubRoom = listenToRoom(activeRoomId, (r) => {
      if (!r) {
        setActiveRoomId(null);
        localStorage.removeItem('akibuki_room_id');
        setErrorNotice('রুমটি পাওয়া যায়নি বা হোস্ট কর্তৃক বন্ধ করা হয়েছে।');
      } else {
        setRoom(r);
      }
    });

    const unsubPlayers = listenToPlayers(activeRoomId, (plist) => {
      setPlayers(plist);
    });

    const unsubChat = listenToChat(activeRoomId, (msgs) => {
      setChatMessages(msgs);
    });

    return () => {
      unsubRoom();
      unsubPlayers();
      unsubChat();
    };
  }, [activeRoomId]);

  // Strokes & Secret Turn listeners
  useEffect(() => {
    if (!activeRoomId || !room) return;

    const unsubStrokes = listenToStrokes(activeRoomId, room.turnNumber, (sList) => {
      setStrokes(sList);
    });

    const unsubSecret = listenToSecretTurn(activeRoomId, (sec) => {
      setSecretTurn(sec);
    });

    return () => {
      unsubStrokes();
      unsubSecret();
    };
  }, [activeRoomId, room?.turnNumber]);

  // Current Player Object
  const currentPlayer: Player = players.find((p) => p.id === playerId) || {
    id: playerId,
    name: nickname || 'Player',
    avatar: avatar || '🐯',
    isHost: room?.hostId === playerId,
    isOnline: true,
    totalPoints: 0,
    correctGuesses: 0,
    incorrectGuesses: 0,
    drawingPoints: 0,
    successfulDrawings: 0,
    failedDrawings: 0,
    attemptsLeft: 3,
    hasGuessedCorrectly: false,
    lastActive: Date.now(),
  };

  const isCurrentDrawer = room?.currentDrawerId === currentPlayer.id;
  const isHost = room?.hostId === currentPlayer.id;

  // Drawing Timer Tick & Timeout handling
  useEffect(() => {
    if (!room || room.status !== 'drawing') {
      isHandlingTimeoutRef.current = false;
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((room.turnEndTime - now) / 1000));
      setTimeRemaining(left);

      // Play tick sound on last 5 seconds
      if (left <= 5 && left > 0 && lastTickSecondRef.current !== left) {
        lastTickSecondRef.current = left;
        playTickSound(soundEnabled);
      }

      // If time expired, trigger timeout transition (idempotent, safe for any client)
      if (left <= 0 && room.status === 'drawing' && !isHandlingTimeoutRef.current) {
        isHandlingTimeoutRef.current = true;
        playWrongSound(soundEnabled);
        handleTurnTimeout(room.id, room);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [room, soundEnabled]);

  // Sound effects on turn complete
  useEffect(() => {
    if (room?.status === 'turn_ended') {
      if (room.turnEndReason === 'correct_guess') {
        playCorrectSound(soundEnabled);
        playWinFanfare(soundEnabled);
      } else {
        playWrongSound(soundEnabled);
      }
    }
  }, [room?.status, room?.turnEndReason, soundEnabled]);

  // Create Room Handler
  const handleCreateRoom = async (customSettings?: Partial<RoomSettings>) => {
    if (!nickname.trim()) {
      setErrorNotice('অনুগ্রহ করে আপনার ডাকনাম লিখুন!');
      return;
    }

    try {
      setLoading(true);
      setErrorNotice(null);

      const roomId = await createRoom(
        { id: playerId, name: nickname.trim(), avatar },
        customSettings
      );

      setActiveRoomId(roomId);
      localStorage.setItem('akibuki_room_id', roomId);
    } catch (err: any) {
      console.error('Error creating room:', err);
      setErrorNotice('রুম তৈরি করা সম্ভব হয়নি। পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  // Join Room Handler
  const handleJoinRoom = async (code: string) => {
    if (!nickname.trim()) {
      setErrorNotice('অনুগ্রহ করে আপনার ডাকনাম লিখুন!');
      return;
    }

    try {
      setLoading(true);
      setErrorNotice(null);

      const res = await joinRoom(code, {
        id: playerId,
        name: nickname.trim(),
        avatar,
      });

      if (!res.success) {
        setErrorNotice(res.error || 'রুমে যোগ দেওয়া সম্ভব হয়নি!');
        return;
      }

      setActiveRoomId(code);
      localStorage.setItem('akibuki_room_id', code);
    } catch (err: any) {
      console.error('Error joining room:', err);
      setErrorNotice('রুমে যোগ দেওয়া সম্ভব হয়নি।');
    } finally {
      setLoading(false);
    }
  };

  // Canvas Handlers
  const handleSendStroke = (stroke: Omit<Stroke, 'id' | 'seq'>) => {
    if (!activeRoomId) return;
    sendStroke(activeRoomId, stroke);
  };

  const handleClearCanvas = () => {
    if (!activeRoomId) return;
    clearCanvas(activeRoomId);
  };

  // Chat Guess Submission
  const handleSendMessage = async (text: string, isQuickReaction = false) => {
    if (!activeRoomId || !room) return;

    setWrongNotice(null);
    const res = await submitChatMessage(
      activeRoomId,
      currentPlayer,
      text,
      room,
      isQuickReaction
    );

    if (res.isGuess) {
      if (res.isCorrect) {
        playCorrectSound(soundEnabled);
      } else {
        playWrongSound(soundEnabled);
        const rem = res.remainingAttempts ?? 0;
        if (rem === 0) {
          setWrongNotice('ভুল উত্তর! আপনার ৩টি সুযোগ শেষ।');
        } else {
          setWrongNotice(`ভুল উত্তর! বাকি সুযোগ: ${rem}/3`);
        }
        setTimeout(() => setWrongNotice(null), 3500);
      }
    }
  };

  const handleNextTurn = () => {
    if (!activeRoomId || !room) return;
    startNextTurn(activeRoomId, room, players);
  };

  // Home Navigation Handler (Returns straight to main page)
  const handleGoHome = () => {
    if (activeRoomId && room && room.status === 'drawing') {
      if (window.confirm(TRANSLATIONS[language].confirmLeave)) {
        setActiveRoomId(null);
        localStorage.removeItem('akibuki_room_id');
        setRoom(null);
      }
    } else {
      setActiveRoomId(null);
      localStorage.removeItem('akibuki_room_id');
      setRoom(null);
    }
  };

  // Render 3-second animated Splash Intro on first load
  if (showSplash) {
    return <SplashIntro onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-500/5 via-slate-50 to-indigo-500/5 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navbar with Home button */}
      <Navbar
        language={language}
        onToggleLanguage={() => setLanguage((prev) => (prev === 'bn' ? 'en' : 'bn'))}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled((prev) => !prev)}
        onGoHome={handleGoHome}
        inGame={!!activeRoomId && !!room}
        onOpenLeaderboard={() => setShowLeaderboard(true)}
        currentPlayer={room ? currentPlayer : null}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4 py-3 flex flex-col">
        {!activeRoomId || !room ? (
          // 1. Home / Intro Page with "চলুন শুরু করি" -> "হোস্ট হন" / "কোড লিখুন"
          <IntroductionPage
            language={language}
            nickname={nickname}
            onChangeNickname={setNickname}
            selectedAvatar={avatar}
            onSelectAvatar={setAvatar}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            loading={loading}
            error={errorNotice}
          />
        ) : room.status === 'lobby' ? (
          // 2. Player Lobby with Host Settings and Room Code Sharing
          <PlayerLobby
            language={language}
            room={room}
            players={players}
            currentPlayer={currentPlayer}
            onStartGame={() => startGame(room.id, room, players)}
            onKickPlayer={(pId) => kickPlayer(room.id, pId)}
            onTransferHost={(newHostId, newHostName) =>
              transferHost(room.id, newHostId, newHostName, currentPlayer.id)
            }
            onUpdateSettings={(settings) => updateRoomSettings(room.id, settings)}
            loading={loading}
          />
        ) : room.status === 'game_ended' ? (
          // 3. Final Match Results & Podium Awards
          <FinalResults
            language={language}
            room={room}
            players={players}
            currentPlayer={currentPlayer}
            onPlayAgain={() => startGame(room.id, room, players)}
            onReturnHome={handleGoHome}
          />
        ) : (
          // 4. Active Draw & Guess Match Arena
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[560px] h-[calc(100vh-6rem)]">
            {/* Drawing Canvas */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-[52vh] sm:h-[60vh] lg:h-full">
              <DrawingCanvas
                language={language}
                isDrawer={isCurrentDrawer}
                drawerName={room.currentDrawerName}
                drawerAvatar={
                  players.find((p) => p.id === room.currentDrawerId)?.avatar || '🎨'
                }
                secretWord={
                  isCurrentDrawer
                    ? secretTurn
                      ? {
                          en: secretTurn.wordEn,
                          bn: secretTurn.wordBn,
                          category: secretTurn.category,
                          hint: secretTurn.hint,
                        }
                      : null
                    : null
                }
                timeRemaining={timeRemaining}
                totalTime={room.settings.drawTime || 60}
                currentRound={room.currentRound}
                totalRounds={room.totalRounds}
                turnNumber={room.turnNumber}
                attemptsLeft={currentPlayer.attemptsLeft}
                categoryClue={room.activeCategory}
                onSendStroke={handleSendStroke}
                onClearCanvas={handleClearCanvas}
                strokes={strokes}
                lastStrokeClearAt={room.lastStrokeClearAt}
                isTurnLocked={room.status !== 'drawing'}
              />
            </div>

            {/* Live Chat-Only Guessing Stream */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col h-[42vh] sm:h-[35vh] lg:h-full">
              <LiveChat
                language={language}
                messages={chatMessages}
                currentPlayer={currentPlayer}
                isDrawer={isCurrentDrawer}
                attemptsLeft={currentPlayer.attemptsLeft}
                hasGuessedCorrectly={currentPlayer.hasGuessedCorrectly}
                onSendMessage={handleSendMessage}
                wrongGuessNotice={wrongNotice}
              />
            </div>
          </div>
        )}
      </main>

      {/* Persistent Bottom Footer: Developed by SMSHEAM */}
      <footer className="w-full py-2.5 text-center shrink-0 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm select-none">
        <p className="text-[11px] font-black tracking-widest uppercase bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 bg-clip-text text-transparent">
          Developed by SMSHEAM
        </p>
      </footer>

      {/* Turn Summary Modal */}
      {room && room.status === 'turn_ended' && (
        <TurnSummaryModal
          language={language}
          room={room}
          players={players}
          currentPlayer={currentPlayer}
          strokes={strokes}
          onStartNextTurn={handleNextTurn}
        />
      )}

      {/* Floating Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          language={language}
          players={players.length > 0 ? players : [currentPlayer]}
          currentPlayerId={currentPlayer.id}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
}
