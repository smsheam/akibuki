import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { ChatMessage, Player, RevealedWord, RoomSettings, RoomState, Stroke, WordHint } from '../types/game';
import { WORDS_DATABASE, WordItem } from '../data/words';
import { computeHashes, normalizeText, sha256Hex } from '../utils/crypto';

const DEFAULT_SETTINGS: RoomSettings = {
  maxPlayers: 8,
  rounds: 3,
  drawTime: 60,
  waitTime: 10,
  maxGuesses: 4,
  language: 'mixed',
  difficulty: 'easy',
  negativeMarking: true,
  soundEffects: true,
};

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function pickThreeWords(
  settings: RoomSettings,
  usedWordIds: string[] = []
): WordItem[] {
  let eligible = WORDS_DATABASE.filter((w) => {
    if (usedWordIds.includes(w.id)) return false;
    if (settings.difficulty !== 'mixed' && w.difficulty !== settings.difficulty) return false;
    return true;
  });

  if (eligible.length < 3) {
    eligible = WORDS_DATABASE.filter((w) => {
      if (settings.difficulty !== 'mixed' && w.difficulty !== settings.difficulty) return false;
      return true;
    });
  }

  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  const selected: WordItem[] = [];
  const seenIds = new Set<string>();
  for (const item of shuffled) {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      selected.push(item);
    }
    if (selected.length === 3) break;
  }
  let fallbackIdx = 0;
  while (selected.length < 3 && fallbackIdx < WORDS_DATABASE.length) {
    const candidate = WORDS_DATABASE[fallbackIdx++];
    if (!seenIds.has(candidate.id)) {
      seenIds.add(candidate.id);
      selected.push(candidate);
    }
  }
  return selected;
}

export function generateWordHint(
  word: WordItem,
  language: 'bn' | 'en' | 'mixed'
): WordHint {
  const isEnMode = language === 'en';
  const targetText = isEnMode ? word.en : word.bn;
  const words = targetText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const letterLengths = words.map((w) => {
    const clean = w.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '');
    return Array.from(clean).length || w.length;
  });

  const dashes = words
    .map((w) => {
      const len = Array.from(w.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '')).length || w.length;
      return Array(len).fill('_').join(' ');
    })
    .join('    ');

  const toBnDigit = (n: number) => {
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(n)
      .split('')
      .map((c) => bnNums[Number(c)] || c)
      .join('');
  };

  const labelBn = `${toBnDigit(wordCount)}টি শব্দ (${letterLengths.map(toBnDigit).join(' + ')} অক্ষর)`;
  const labelEn = `${wordCount} word${wordCount > 1 ? 's' : ''} (${letterLengths.join(' + ')} letters)`;

  return {
    wordCount,
    letterLengths,
    dashes,
    labelBn,
    labelEn,
  };
}

export function pickNextWord(
  settings: RoomSettings,
  usedWordIds: string[]
): WordItem {
  let eligible = WORDS_DATABASE.filter((w) => {
    if (usedWordIds.includes(w.id)) return false;
    if (settings.difficulty !== 'mixed' && w.difficulty !== settings.difficulty) return false;
    return true;
  });

  if (eligible.length === 0) {
    eligible = WORDS_DATABASE.filter((w) => {
      if (settings.difficulty !== 'mixed' && w.difficulty !== settings.difficulty) return false;
      return true;
    });
  }

  const randomIndex = Math.floor(Math.random() * eligible.length);
  return eligible[randomIndex] || WORDS_DATABASE[0];
}

export function getAllAcceptedAnswers(word: WordItem): string[] {
  const set = new Set<string>();
  set.add(word.en);
  set.add(word.bn);
  word.alternatives.forEach((alt) => set.add(alt));
  return Array.from(set);
}

// Create Room (with simultaneous multi-room support and code collision verification)
export async function createRoom(
  hostPlayer: { id: string; name: string; avatar: string },
  customSettings?: Partial<RoomSettings>
): Promise<string> {
  let roomId = generateRoomCode();
  let roomRef = doc(db, 'rooms', roomId);
  
  // Guarantee unique room code even with simultaneous creators
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      const snap = await getDoc(roomRef);
      if (!snap.exists()) {
        break;
      }
      roomId = generateRoomCode();
      roomRef = doc(db, 'rooms', roomId);
    } catch {
      break;
    }
  }

  const playerRef = doc(db, 'rooms', roomId, 'players', hostPlayer.id);

  const initialSettings: RoomSettings = {
    ...DEFAULT_SETTINGS,
    ...customSettings,
  };

  const initialRoom: RoomState = {
    id: roomId,
    hostId: hostPlayer.id,
    hostName: hostPlayer.name,
    status: 'lobby',
    settings: initialSettings,
    currentRound: 1,
    totalRounds: initialSettings.rounds,
    drawerOrder: [hostPlayer.id],
    currentDrawerIndex: 0,
    currentDrawerId: hostPlayer.id,
    currentDrawerName: hostPlayer.name,
    turnNumber: 0,
    turnStartTime: 0,
    turnEndTime: 0,
    activeWordId: '',
    secretWordHashes: [],
    revealedWord: null,
    winnerId: null,
    winnerName: null,
    turnEndReason: null,
    lastStrokeClearAt: 0,
    usedWordIds: [],
  };

  const initialPlayerData: Player = {
    id: hostPlayer.id,
    name: hostPlayer.name,
    avatar: hostPlayer.avatar,
    isHost: true,
    isOnline: true,
    totalPoints: 0,
    correctGuesses: 0,
    incorrectGuesses: 0,
    drawingPoints: 0,
    successfulDrawings: 0,
    failedDrawings: 0,
    attemptsLeft: 4, // 4 attempts (1st is free)
    hasGuessedCorrectly: false,
    lastActive: Date.now(),
  };

  try {
    const batch = writeBatch(db);
    batch.set(roomRef, initialRoom);
    batch.set(playerRef, initialPlayerData);
    await batch.commit();

    // Initial system chat message
    const chatRef = doc(collection(db, 'rooms', roomId, 'chat'));
    await setDoc(chatRef, {
      id: chatRef.id,
      turnNumber: 0,
      senderId: 'system',
      senderName: 'System',
      senderAvatar: '🎨',
      text: `রুম তৈরি হয়েছে! কোড: ${roomId}`,
      type: 'system',
      createdAt: Date.now(),
    });

    return roomId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `rooms/${roomId}`);
    throw error;
  }
}

// Join Room
export async function joinRoom(
  roomId: string,
  player: { id: string; name: string; avatar: string }
): Promise<{ success: boolean; error?: string }> {
  const normalizedCode = roomId.toUpperCase().trim();
  const roomRef = doc(db, 'rooms', normalizedCode);

  try {
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) {
      return { success: false, error: 'রুম খুঁজে পাওয়া যায়নি! সঠিক কোড দিন।' };
    }

    const roomData = roomSnap.data() as RoomState;
    const playersRef = collection(db, 'rooms', normalizedCode, 'players');
    const playersSnap = await getDocs(playersRef);
    const existingPlayers = playersSnap.docs.map((d) => d.data() as Player);

    // Check if player is already in room (reconnect)
    const existingSelf = existingPlayers.find((p) => p.id === player.id);
    if (existingSelf) {
      await updateDoc(doc(db, 'rooms', normalizedCode, 'players', player.id), {
        isOnline: true,
        lastActive: Date.now(),
      });
      return { success: true };
    }

    // Check max players
    if (existingPlayers.length >= (roomData.settings.maxPlayers || 8)) {
      return { success: false, error: 'রুমে সর্বোচ্চ খেলোয়াড় পূর্ণ হয়ে গেছে।' };
    }

    // Check duplicate nicknames (case-insensitive)
    const normalizedName = player.name.trim().toLowerCase();
    const hasDuplicate = existingPlayers.some(
      (p) => p.name.trim().toLowerCase() === normalizedName
    );
    if (hasDuplicate) {
      return { success: false, error: 'এই নামের একজন খেলোয়াড় ইতিমধ্যে রুমে আছেন! অন্য নাম বেছে নিন।' };
    }

    const newPlayerData: Player = {
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      isHost: false,
      isOnline: true,
      totalPoints: 0,
      correctGuesses: 0,
      incorrectGuesses: 0,
      drawingPoints: 0,
      successfulDrawings: 0,
      failedDrawings: 0,
      attemptsLeft: 4, // 4 attempts (1st free)
      hasGuessedCorrectly: false,
      lastActive: Date.now(),
    };

    await setDoc(doc(db, 'rooms', normalizedCode, 'players', player.id), newPlayerData);

    // Join notification in chat
    const chatRef = doc(collection(db, 'rooms', normalizedCode, 'chat'));
    await setDoc(chatRef, {
      id: chatRef.id,
      turnNumber: roomData.turnNumber,
      senderId: 'system',
      senderName: 'System',
      senderAvatar: player.avatar,
      text: `${player.name} খেলায় যোগ দিয়েছেন!`,
      type: 'system',
      createdAt: Date.now(),
    });

    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `rooms/${normalizedCode}`);
    return { success: false, error: 'যোগদানে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' };
  }
}

// Update Room Settings (Host only)
export async function updateRoomSettings(
  roomId: string,
  settings: Partial<RoomSettings>
): Promise<void> {
  const roomRef = doc(db, 'rooms', roomId);
  try {
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;
    const current = snap.data() as RoomState;
    const updated = {
      ...current.settings,
      ...settings,
    };
    await updateDoc(roomRef, {
      settings: updated,
      totalRounds: updated.rounds,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    throw error;
  }
}

// Kick Player
export async function kickPlayer(roomId: string, playerId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'rooms', roomId, 'players', playerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `rooms/${roomId}/players/${playerId}`);
    throw error;
  }
}

// Transfer Host
export async function transferHost(
  roomId: string,
  newHostId: string,
  newHostName: string,
  currentHostId: string
): Promise<void> {
  try {
    const batch = writeBatch(db);
    batch.update(doc(db, 'rooms', roomId), {
      hostId: newHostId,
      hostName: newHostName,
    });
    batch.update(doc(db, 'rooms', roomId, 'players', currentHostId), {
      isHost: false,
    });
    batch.update(doc(db, 'rooms', roomId, 'players', newHostId), {
      isHost: true,
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    throw error;
  }
}

// Start Game
export async function startGame(
  roomId: string,
  room: RoomState,
  players: Player[]
): Promise<void> {
  if (players.length < 1) {
    throw new Error('খেলার জন্য অন্তত ১ জন খেলোয়াড় প্রয়োজন!');
  }

  // Shuffle players to randomize drawing order
  const shuffledIds = [...players.map((p) => p.id)].sort(() => Math.random() - 0.5);
  const firstDrawerId = shuffledIds[0];
  const firstDrawer = players.find((p) => p.id === firstDrawerId) || players[0];

  const wordOptions = pickThreeWords(room.settings, []);
  const now = Date.now();

  try {
    const batch = writeBatch(db);

    // Save candidate options in private secrets collection
    const secretRef = doc(db, 'rooms', roomId, 'secrets', 'currentTurn');
    batch.set(secretRef, {
      turnNumber: 1,
      drawerId: firstDrawer.id,
      wordOptions,
      revealed: false,
      createdAt: now,
    });

    // Update room document to 'selecting_word' status
    const roomRef = doc(db, 'rooms', roomId);
    batch.update(roomRef, {
      status: 'selecting_word',
      currentRound: 1,
      totalRounds: room.settings.rounds || 3,
      drawerOrder: shuffledIds,
      currentDrawerIndex: 0,
      currentDrawerId: firstDrawer.id,
      currentDrawerName: firstDrawer.name,
      turnNumber: 1,
      turnStartTime: now,
      turnEndTime: 0,
      activeWordId: '',
      activeCategory: '',
      secretWordHashes: [],
      wordHint: null,
      wordOptions,
      revealedWord: null,
      winnerId: null,
      winnerName: null,
      turnEndReason: null,
      lastStrokeClearAt: now,
      usedWordIds: [],
    });

    // Reset all players' attempts and scores for new match
    players.forEach((p) => {
      const pRef = doc(db, 'rooms', roomId, 'players', p.id);
      batch.update(pRef, {
        totalPoints: 0,
        correctGuesses: 0,
        incorrectGuesses: 0,
        drawingPoints: 0,
        successfulDrawings: 0,
        failedDrawings: 0,
        attemptsLeft: 4, // 4 attempts (1st free)
        hasGuessedCorrectly: false,
      });
    });

    // Clean up previous strokes if any
    const strokesSnap = await getDocs(collection(db, 'rooms', roomId, 'strokes'));
    strokesSnap.forEach((d) => {
      batch.delete(d.ref);
    });

    await batch.commit();

    // System announce
    const chatRef = doc(collection(db, 'rooms', roomId, 'chat'));
    await setDoc(chatRef, {
      id: chatRef.id,
      turnNumber: 1,
      senderId: 'system',
      senderName: 'System',
      senderAvatar: '🎨',
      text: `খেলা শুরু হয়েছে! রাউন্ড ১: ${firstDrawer.name} আঁকার জন্য শব্দ বেছে নিচ্ছেন...`,
      type: 'system',
      createdAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    throw error;
  }
}

// Drawer chooses one word out of the 3 candidate words
export async function chooseWord(
  roomId: string,
  chosenWord: WordItem,
  room: RoomState,
  players: Player[]
): Promise<void> {
  const acceptedAnswers = getAllAcceptedAnswers(chosenWord);
  const hashes = await computeHashes(acceptedAnswers);
  const drawTimeMs = (room.settings.drawTime || 60) * 1000;
  const now = Date.now();
  const wordHint = generateWordHint(chosenWord, room.settings.language);

  try {
    const batch = writeBatch(db);

    const secretRef = doc(db, 'rooms', roomId, 'secrets', 'currentTurn');
    batch.set(secretRef, {
      turnNumber: room.turnNumber,
      wordId: chosenWord.id,
      wordEn: chosenWord.en,
      wordBn: chosenWord.bn,
      category: chosenWord.category,
      hint: chosenWord.hint,
      acceptedAlternatives: acceptedAnswers,
      revealed: false,
      createdAt: now,
    });

    const roomRef = doc(db, 'rooms', roomId);
    batch.update(roomRef, {
      status: 'drawing',
      turnStartTime: now,
      turnEndTime: now + drawTimeMs,
      activeWordId: chosenWord.id,
      activeCategory: chosenWord.category,
      secretWordHashes: hashes,
      wordHint,
      revealedWord: null,
      winnerId: null,
      winnerName: null,
      turnEndReason: null,
      lastStrokeClearAt: now,
      usedWordIds: [...(room.usedWordIds || []), chosenWord.id],
      wordOptions: [],
      preDrawRevealEnd: now + 3500, // Drawer gets 3.5s pre-draw big reveal
    });

    // Reset guess attempts to 4 for all players (1st free)
    players.forEach((p) => {
      const pRef = doc(db, 'rooms', roomId, 'players', p.id);
      batch.update(pRef, {
        attemptsLeft: 4,
        hasGuessedCorrectly: false,
      });
    });

    // Delete existing stroke documents
    const strokesSnap = await getDocs(collection(db, 'rooms', roomId, 'strokes'));
    strokesSnap.forEach((d) => {
      batch.delete(d.ref);
    });

    await batch.commit();

    const chatRef = doc(collection(db, 'rooms', roomId, 'chat'));
    await setDoc(chatRef, {
      id: chatRef.id,
      turnNumber: room.turnNumber,
      senderId: 'system',
      senderName: 'System',
      senderAvatar: '🎨',
      text: `রাউন্ড ${room.currentRound} - পালা ${room.turnNumber}: ${room.currentDrawerName} আঁকা শুরু করেছেন! চ্যাটে আন্দাজ করুন।`,
      type: 'system',
      createdAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    throw error;
  }
}

// Next Turn
export async function startNextTurn(
  roomId: string,
  room: RoomState,
  players: Player[]
): Promise<void> {
  const nextDrawerIndex = room.currentDrawerIndex + 1;
  let nextRound = room.currentRound;
  let isGameOver = false;
  let finalDrawerIndex = nextDrawerIndex;

  if (nextDrawerIndex >= room.drawerOrder.length) {
    // Finished all drawers in this round
    if (room.currentRound >= room.totalRounds) {
      isGameOver = true;
    } else {
      nextRound = room.currentRound + 1;
      finalDrawerIndex = 0;
    }
  }

  if (isGameOver) {
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        status: 'game_ended',
      });
      const chatRef = doc(collection(db, 'rooms', roomId, 'chat'));
      await setDoc(chatRef, {
        id: chatRef.id,
        turnNumber: room.turnNumber,
        senderId: 'system',
        senderName: 'System',
        senderAvatar: '🏆',
        text: 'ম্যাচ সমাপ্ত! ফলাফল দেখতে লিডারবোর্ড দেখুন।',
        type: 'system',
        createdAt: Date.now(),
      });
      return;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
      return;
    }
  }

  const nextDrawerId = room.drawerOrder[finalDrawerIndex];
  const nextDrawer = players.find((p) => p.id === nextDrawerId) || players[0];
  const wordOptions = pickThreeWords(room.settings, room.usedWordIds || []);
  const now = Date.now();
  const nextTurnNumber = room.turnNumber + 1;

  try {
    const batch = writeBatch(db);

    const secretRef = doc(db, 'rooms', roomId, 'secrets', 'currentTurn');
    batch.set(secretRef, {
      turnNumber: nextTurnNumber,
      drawerId: nextDrawer.id,
      wordOptions,
      revealed: false,
      createdAt: now,
    });

    const roomRef = doc(db, 'rooms', roomId);
    batch.update(roomRef, {
      status: 'selecting_word',
      currentRound: nextRound,
      currentDrawerIndex: finalDrawerIndex,
      currentDrawerId: nextDrawer.id,
      currentDrawerName: nextDrawer.name,
      turnNumber: nextTurnNumber,
      turnStartTime: now,
      turnEndTime: 0,
      activeWordId: '',
      activeCategory: '',
      secretWordHashes: [],
      wordHint: null,
      wordOptions,
      revealedWord: null,
      winnerId: null,
      winnerName: null,
      turnEndReason: null,
      lastStrokeClearAt: now,
    });

    // Reset guess attempts for all players for the new turn (4 attempts, 1st free)
    players.forEach((p) => {
      const pRef = doc(db, 'rooms', roomId, 'players', p.id);
      batch.update(pRef, {
        attemptsLeft: 4,
        hasGuessedCorrectly: false,
      });
    });

    // Clean up previous strokes
    const strokesSnap = await getDocs(collection(db, 'rooms', roomId, 'strokes'));
    strokesSnap.forEach((d) => {
      batch.delete(d.ref);
    });

    await batch.commit();

    // Announce next drawer selection
    const chatRef = doc(collection(db, 'rooms', roomId, 'chat'));
    await setDoc(chatRef, {
      id: chatRef.id,
      turnNumber: nextTurnNumber,
      senderId: 'system',
      senderName: 'System',
      senderAvatar: '🎨',
      text: `রাউন্ড ${nextRound} - পালা ${nextTurnNumber}: ${nextDrawer.name} শব্দ বেছে নিচ্ছেন...`,
      type: 'system',
      createdAt: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
    throw error;
  }
}

// Chat & Guess Submission (Core Engine)
export async function submitChatMessage(
  roomId: string,
  player: Player,
  rawText: string,
  room: RoomState,
  isQuickReaction: boolean = false
): Promise<{ isGuess: boolean; isCorrect: boolean; remainingAttempts?: number }> {
  const text = rawText.trim();
  if (!text) return { isGuess: false, isCorrect: false };

  const isDrawingTurn = room.status === 'drawing';
  const isDrawer = player.id === room.currentDrawerId;
  const isEmojiOnly = /^[\p{Emoji}\s]+$/u.test(text);
  const isSoloTest = (room.drawerOrder?.length || 0) <= 1;

  // If not drawing, or quick reaction, or emoji only, or player has no attempts left:
  // Note: if solo testing, drawer is allowed to test guesses as well
  const cannotGuess =
    !isDrawingTurn ||
    (isDrawer && !isSoloTest) ||
    isQuickReaction ||
    isEmojiOnly ||
    player.attemptsLeft <= 0 ||
    player.hasGuessedCorrectly;

  if (cannotGuess) {
    // Post as normal chat message
    try {
      const chatRef = doc(collection(db, 'rooms', roomId, 'chat'));
      await setDoc(chatRef, {
        id: chatRef.id,
        turnNumber: room.turnNumber,
        senderId: player.id,
        senderName: player.name,
        senderAvatar: player.avatar,
        text,
        type: 'chat',
        createdAt: Date.now(),
        isQuickReaction,
      });
    } catch (err) {
      console.error('Error posting normal chat message:', err);
    }
    return { isGuess: false, isCorrect: false };
  }

  // Check guess:
  // 1. Check SHA-256 hash match against room.secretWordHashes
  const normInput = normalizeText(text);
  const guessHash = await sha256Hex(text);
  let isCorrect = (room.secretWordHashes || []).includes(guessHash);

  // 2. Direct comparison with active word in WORDS_DATABASE (100% reliable)
  if (!isCorrect && room.activeWordId) {
    const wordItem = WORDS_DATABASE.find((w) => w.id === room.activeWordId);
    if (wordItem) {
      const accepted = getAllAcceptedAnswers(wordItem).map((a) => normalizeText(a));
      if (
        accepted.includes(normInput) ||
        normalizeText(wordItem.en) === normInput ||
        normalizeText(wordItem.bn) === normInput
      ) {
        isCorrect = true;
      }
    }
  }

  // 3. Fallback: check against secrets document if needed
  if (!isCorrect) {
    try {
      const secretSnap = await getDoc(doc(db, 'rooms', roomId, 'secrets', 'currentTurn'));
      if (secretSnap.exists()) {
        const sec = secretSnap.data();
        const accepted = (sec.acceptedAlternatives || []).map((a: string) => normalizeText(a));
        if (
          accepted.includes(normInput) ||
          normalizeText(sec.wordEn) === normInput ||
          normalizeText(sec.wordBn) === normInput
        ) {
          isCorrect = true;
        }
      }
    } catch {
      // Continue
    }
  }

  if (isCorrect) {
    // Correct Guess Handling
    // Get revealed word details from database
    const wordObj = WORDS_DATABASE.find((w) => w.id === room.activeWordId);
    const revealed: RevealedWord = {
      en: wordObj ? wordObj.en : 'Secret Word',
      bn: wordObj ? wordObj.bn : 'গোপন শব্দ',
      category: wordObj ? wordObj.category : (room.activeCategory || ''),
      hint: wordObj ? wordObj.hint : '',
    };

    const isSamePlayer = player.id === room.currentDrawerId;

    try {
      await runTransaction(db, async (transaction) => {
        // ALL READS FIRST
        const roomRef = doc(db, 'rooms', roomId);
        const roomDoc = await transaction.get(roomRef);
        if (!roomDoc.exists()) return;
        const currentRoom = roomDoc.data() as RoomState;
        if (currentRoom.status !== 'drawing') return;

        const guesserRef = doc(db, 'rooms', roomId, 'players', player.id);
        const guesserSnap = await transaction.get(guesserRef);

        let drawerSnap = null;
        const drawerRef = doc(db, 'rooms', roomId, 'players', currentRoom.currentDrawerId);
        if (!isSamePlayer) {
          drawerSnap = await transaction.get(drawerRef);
        }

        // ALL WRITES AFTER READS
        transaction.update(roomRef, {
          status: 'turn_ended',
          winnerId: player.id,
          winnerName: player.name,
          turnEndReason: 'correct_guess',
          revealedWord: revealed,
        });

        if (isSamePlayer) {
          // Solo testing: player is both drawer and guesser
          if (guesserSnap.exists()) {
            const pData = guesserSnap.data() as Player;
            transaction.update(guesserRef, {
              totalPoints: (pData.totalPoints || 0) + 10,
              correctGuesses: (pData.correctGuesses || 0) + 1,
              successfulDrawings: (pData.successfulDrawings || 0) + 1,
              hasGuessedCorrectly: true,
            });
          }
        } else {
          // Normal multiplayer: different players
          if (guesserSnap.exists()) {
            const gData = guesserSnap.data() as Player;
            transaction.update(guesserRef, {
              totalPoints: (gData.totalPoints || 0) + 10,
              correctGuesses: (gData.correctGuesses || 0) + 1,
              hasGuessedCorrectly: true,
            });
          }
          if (drawerSnap && drawerSnap.exists()) {
            const dData = drawerSnap.data() as Player;
            transaction.update(drawerRef, {
              totalPoints: (dData.totalPoints || 0) + 5,
              drawingPoints: (dData.drawingPoints || 0) + 5,
              successfulDrawings: (dData.successfulDrawings || 0) + 1,
            });
          }
        }

        const chatRef = doc(collection(db, 'rooms', roomId, 'chat'));
        transaction.set(chatRef, {
          id: chatRef.id,
          turnNumber: currentRoom.turnNumber,
          senderId: player.id,
          senderName: player.name,
          senderAvatar: player.avatar,
          text,
          type: 'correct',
          createdAt: Date.now(),
        });
      });

      return { isGuess: true, isCorrect: true };
    } catch (txError) {
      console.warn('Transaction error in correct guess, using fallback writes:', txError);
      // Fallback direct writes to ensure UI transitions smoothly
      try {
        await updateDoc(doc(db, 'rooms', roomId), {
          status: 'turn_ended',
          winnerId: player.id,
          winnerName: player.name,
          turnEndReason: 'correct_guess',
          revealedWord: revealed,
        });

        await updateDoc(doc(db, 'rooms', roomId, 'players', player.id), {
          totalPoints: (player.totalPoints || 0) + 10,
          correctGuesses: (player.correctGuesses || 0) + 1,
          hasGuessedCorrectly: true,
        });

        const chatRef = doc(collection(db, 'rooms', roomId, 'chat'));
        await setDoc(chatRef, {
          id: chatRef.id,
          turnNumber: room.turnNumber,
          senderId: player.id,
          senderName: player.name,
          senderAvatar: player.avatar,
          text,
          type: 'correct',
          createdAt: Date.now(),
        });
      } catch (fbErr) {
        console.error('Fallback update failed:', fbErr);
      }
      return { isGuess: true, isCorrect: true };
    }
  } else {
    // INCORRECT GUESS: Total 4 attempts.
    // 1st attempt is completely FREE (no mark deduction).
    // Attempts 2, 3, 4 apply penalty if negative marking is enabled.
    const isFirstAttempt = (player.attemptsLeft || 0) >= 4;
    const remainingAttempts = Math.max(0, (player.attemptsLeft || 0) - 1);
    const penalty = isFirstAttempt ? 0 : room.settings.negativeMarking ? 2 : 0;

    try {
      await updateDoc(doc(db, 'rooms', roomId, 'players', player.id), {
        attemptsLeft: remainingAttempts,
        incorrectGuesses: (player.incorrectGuesses || 0) + 1,
        totalPoints: Math.max(0, (player.totalPoints || 0) - penalty),
      });

      const chatRef = doc(collection(db, 'rooms', roomId, 'chat'));
      await setDoc(chatRef, {
        id: chatRef.id,
        turnNumber: room.turnNumber,
        senderId: player.id,
        senderName: player.name,
        senderAvatar: player.avatar,
        text,
        type: 'wrong',
        createdAt: Date.now(),
      });

      return { isGuess: true, isCorrect: false, remainingAttempts };
    } catch (error) {
      console.error('Error posting wrong guess:', error);
      handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}/players/${player.id}`);
      return { isGuess: true, isCorrect: false, remainingAttempts };
    }
  }
}

// Timeout Handler (When drawing timer expires without a correct guess)
export async function handleTurnTimeout(roomId: string, room: RoomState): Promise<void> {
  if (room.status !== 'drawing') return;

  const wordObj = WORDS_DATABASE.find((w) => w.id === room.activeWordId);
  const revealed: RevealedWord = {
    en: wordObj ? wordObj.en : 'Secret Word',
    bn: wordObj ? wordObj.bn : 'গোপন শব্দ',
    category: wordObj ? wordObj.category : (room.activeCategory || ''),
    hint: wordObj ? wordObj.hint : '',
  };

  try {
    await runTransaction(db, async (transaction) => {
      // ALL READS FIRST
      const roomRef = doc(db, 'rooms', roomId);
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists()) return;
      const currentRoom = roomDoc.data() as RoomState;
      if (currentRoom.status !== 'drawing') return;

      const drawerRef = doc(db, 'rooms', roomId, 'players', currentRoom.currentDrawerId);
      const drawerSnap = await transaction.get(drawerRef);

      // ALL WRITES AFTER READS
      if (drawerSnap.exists()) {
        const dData = drawerSnap.data() as Player;
        transaction.update(drawerRef, {
          totalPoints: Math.max(0, (dData.totalPoints || 0) - 3),
          failedDrawings: (dData.failedDrawings || 0) + 1,
        });
      }

      transaction.update(roomRef, {
        status: 'turn_ended',
        winnerId: null,
        winnerName: null,
        turnEndReason: 'timeout',
        revealedWord: revealed,
      });

      const chatRef = doc(collection(db, 'rooms', roomId, 'chat'));
      transaction.set(chatRef, {
        id: chatRef.id,
        turnNumber: currentRoom.turnNumber,
        senderId: 'system',
        senderName: 'System',
        senderAvatar: '⏰',
        text: `সময় শেষ! সঠিক শব্দ ছিল: ${revealed.bn} (${revealed.en})`,
        type: 'system',
        createdAt: Date.now(),
      });
    });
  } catch (error) {
    console.warn('Transaction error in handleTurnTimeout, using fallback:', error);
    try {
      await updateDoc(doc(db, 'rooms', roomId), {
        status: 'turn_ended',
        winnerId: null,
        winnerName: null,
        turnEndReason: 'timeout',
        revealedWord: revealed,
      });

      const chatRef = doc(collection(db, 'rooms', roomId, 'chat'));
      await setDoc(chatRef, {
        id: chatRef.id,
        turnNumber: room.turnNumber,
        senderId: 'system',
        senderName: 'System',
        senderAvatar: '⏰',
        text: `সময় শেষ! সঠিক শব্দ ছিল: ${revealed.bn} (${revealed.en})`,
        type: 'system',
        createdAt: Date.now(),
      });
    } catch (fbErr) {
      console.error('Fallback timeout update failed:', fbErr);
    }
  }
}

// Drawing Strokes
export async function sendStroke(
  roomId: string,
  stroke: Omit<Stroke, 'id' | 'seq'>
): Promise<void> {
  try {
    const strokeRef = doc(collection(db, 'rooms', roomId, 'strokes'));
    await setDoc(strokeRef, {
      ...stroke,
      id: strokeRef.id,
      seq: Date.now(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `rooms/${roomId}/strokes`);
  }
}

export async function deleteStroke(
  roomId: string,
  strokeId: string
): Promise<void> {
  try {
    await deleteDoc(doc(db, 'rooms', roomId, 'strokes', strokeId));
  } catch (error) {
    console.error('Error deleting stroke:', error);
    handleFirestoreError(error, OperationType.DELETE, `rooms/${roomId}/strokes/${strokeId}`);
  }
}

export async function clearCanvas(roomId: string): Promise<void> {
  const now = Date.now();
  try {
    await updateDoc(doc(db, 'rooms', roomId), {
      lastStrokeClearAt: now,
    });
    // Also delete stroke docs to permanently free space and synchronize
    const strokesSnap = await getDocs(collection(db, 'rooms', roomId, 'strokes'));
    if (!strokesSnap.empty) {
      const batch = writeBatch(db);
      strokesSnap.forEach((d) => {
        batch.delete(d.ref);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `rooms/${roomId}`);
  }
}

// Real-Time Listeners
export function listenToRoom(
  roomId: string,
  callback: (room: RoomState | null) => void
) {
  const roomRef = doc(db, 'rooms', roomId);
  return onSnapshot(
    roomRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as RoomState);
      } else {
        callback(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `rooms/${roomId}`);
    }
  );
}

export function listenToPlayers(
  roomId: string,
  callback: (players: Player[]) => void
) {
  const playersRef = collection(db, 'rooms', roomId, 'players');
  return onSnapshot(
    playersRef,
    (snap) => {
      const list = snap.docs.map((d) => d.data() as Player);
      callback(list);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomId}/players`);
    }
  );
}

export function listenToStrokes(
  roomId: string,
  turnNumber: number,
  callback: (strokes: Stroke[]) => void,
  lastClearTime: number = 0
) {
  const strokesRef = collection(db, 'rooms', roomId, 'strokes');
  return onSnapshot(
    strokesRef,
    (snap) => {
      const allStrokes = snap.docs.map((d) => d.data() as Stroke);
      allStrokes.sort((a, b) => (a.seq || 0) - (b.seq || 0));
      const turnStrokes = allStrokes.filter(
        (s) => s.turnNumber === turnNumber && (!s.isDeleted) && (s.seq || 0) >= (lastClearTime || 0)
      );
      callback(turnStrokes);
    },
    (error) => {
      console.error('Error listening to strokes:', error);
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomId}/strokes`);
    }
  );
}

export function listenToChat(
  roomId: string,
  callback: (messages: ChatMessage[]) => void
) {
  const chatRef = collection(db, 'rooms', roomId, 'chat');
  return onSnapshot(
    chatRef,
    (snap) => {
      const msgs = snap.docs.map((d) => d.data() as ChatMessage);
      msgs.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
      callback(msgs);
    },
    (error) => {
      console.error('Error listening to chat:', error);
      handleFirestoreError(error, OperationType.LIST, `rooms/${roomId}/chat`);
    }
  );
}

export function listenToSecretTurn(
  roomId: string,
  callback: (secret: any) => void
) {
  const secretRef = doc(db, 'rooms', roomId, 'secrets', 'currentTurn');
  return onSnapshot(
    secretRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data());
      } else {
        callback(null);
      }
    },
    () => {
      // Non-drawers will get permission-denied while word is secret - this is expected and secure!
    }
  );
}
