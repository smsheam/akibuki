export interface RoomSettings {
  maxPlayers: number; // 3-10
  rounds: number; // 1-10
  drawTime: number; // 30, 45, 60, 90, 120
  waitTime: number; // 5, 10, 15
  maxGuesses: number; // fixed at 3
  language: 'bn' | 'en' | 'mixed';
  difficulty: 'easy' | 'medium' | 'mixed';
  negativeMarking: boolean;
  soundEffects: boolean;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isOnline: boolean;
  totalPoints: number;
  correctGuesses: number;
  incorrectGuesses: number;
  drawingPoints: number;
  successfulDrawings: number;
  failedDrawings: number;
  attemptsLeft: number;
  hasGuessedCorrectly: boolean;
  lastActive: number;
}

export interface Stroke {
  id: string;
  turnNumber: number;
  drawerId: string;
  color: string;
  size: number;
  tool: 'pen' | 'eraser';
  points: number[]; // normalized [x0, y0, x1, y1, ...] 0-1000
  seq: number;
  isDeleted?: boolean;
}

export interface ChatMessage {
  id: string;
  turnNumber: number;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  type: 'chat' | 'guess' | 'correct' | 'wrong' | 'system';
  createdAt: number;
  isQuickReaction?: boolean;
}

export interface RevealedWord {
  en: string;
  bn: string;
  category: string;
  hint: string;
}

export interface RoomState {
  id: string;
  hostId: string;
  hostName: string;
  status: 'lobby' | 'drawing' | 'turn_ended' | 'round_ended' | 'game_ended';
  settings: RoomSettings;
  currentRound: number;
  totalRounds: number;
  drawerOrder: string[];
  currentDrawerIndex: number;
  currentDrawerId: string;
  currentDrawerName: string;
  turnNumber: number;
  turnStartTime: number;
  turnEndTime: number;
  activeWordId: string;
  activeCategory?: string;
  secretWordHashes: string[];
  revealedWord: RevealedWord | null;
  winnerId: string | null;
  winnerName: string | null;
  turnEndReason: 'correct_guess' | 'timeout' | null;
  lastStrokeClearAt: number;
  usedWordIds: string[];
}
