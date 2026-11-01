import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  RotateCw,
  Trash2,
  Eraser,
  PenTool,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Stroke } from '../types/game';
import { Language, TRANSLATIONS } from '../data/translations';

interface DrawingCanvasProps {
  language: Language;
  isDrawer: boolean;
  drawerName: string;
  drawerAvatar: string;
  secretWord?: { en: string; bn: string; category?: string; hint?: string } | null;
  timeRemaining: number;
  totalTime: number;
  currentRound: number;
  totalRounds: number;
  turnNumber: number;
  attemptsLeft: number;
  categoryClue?: string;
  onSendStroke: (stroke: Omit<Stroke, 'id' | 'seq'>) => void;
  onClearCanvas: () => void;
  strokes: Stroke[];
  lastStrokeClearAt: number;
  isTurnLocked: boolean;
}

const COLORS = [
  '#000000', // Black
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#78350f', // Brown
  '#64748b', // Slate
  '#ffffff', // White
];

const BRUSH_SIZES = [
  { label: 'S', size: 3 },
  { label: 'M', size: 6 },
  { label: 'L', size: 12 },
  { label: 'XL', size: 24 },
];

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  language,
  isDrawer,
  drawerName,
  drawerAvatar,
  secretWord,
  timeRemaining,
  totalTime,
  currentRound,
  totalRounds,
  turnNumber,
  attemptsLeft,
  categoryClue,
  onSendStroke,
  onClearCanvas,
  strokes,
  lastStrokeClearAt,
  isTurnLocked,
}) => {
  const t = TRANSLATIONS[language];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const currentPointsRef = useRef<number[]>([]);

  // Drawer tool state
  const [activeColor, setActiveColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(6);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

  // Local stroke history for undo/redo
  const [undoStack, setUndoStack] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);

  // Redraw canvas from strokes array
  const redrawAllStrokes = useCallback(
    (strokesToDraw: Stroke[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Clear with clean background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Render strokes
      strokesToDraw.forEach((s) => {
        if (s.isDeleted || !s.points || s.points.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = s.tool === 'eraser' ? '#ffffff' : s.color;
        ctx.lineWidth = (s.size * width) / 1000;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const p0x = (s.points[0] * width) / 1000;
        const p0y = (s.points[1] * height) / 1000;
        ctx.moveTo(p0x, p0y);

        if (s.points.length === 2) {
          ctx.lineTo(p0x + 0.5, p0y + 0.5);
        } else {
          for (let i = 2; i < s.points.length; i += 2) {
            const px = (s.points[i] * width) / 1000;
            const py = (s.points[i + 1] * height) / 1000;
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      });
    },
    []
  );

  // Resize canvas keeping internal coordinate resolution at 1000x800 for high DPI
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      redrawAllStrokes(strokes);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [redrawAllStrokes, strokes]);

  // Sync canvas with incoming strokes & clear events
  useEffect(() => {
    redrawAllStrokes(strokes);
  }, [strokes, lastStrokeClearAt, redrawAllStrokes]);

  // Helper to extract normalized 0-1000 point
  const getCanvasPoint = (e: React.MouseEvent | React.TouchEvent): [number, number] | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const normX = Math.round(((clientX - rect.left) / rect.width) * 1000);
    const normY = Math.round(((clientY - rect.top) / rect.height) * 1000);

    return [
      Math.max(0, Math.min(1000, normX)),
      Math.max(0, Math.min(1000, normY)),
    ];
  };

  // Drawing event handlers (Drawer only)
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawer || isTurnLocked) return;
    if ('touches' in e) {
      e.stopPropagation();
    }

    const pt = getCanvasPoint(e);
    if (!pt) return;

    isDrawingRef.current = true;
    currentPointsRef.current = [pt[0], pt[1]];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : activeColor;
    ctx.lineWidth = (brushSize * width) / 1000;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo((pt[0] * width) / 1000, (pt[1] * height) / 1000);
    ctx.lineTo((pt[0] * width) / 1000 + 0.1, (pt[1] * height) / 1000 + 0.1);
    ctx.stroke();
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawer || !isDrawingRef.current || isTurnLocked) return;
    if ('touches' in e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const pt = getCanvasPoint(e);
    if (!pt) return;

    currentPointsRef.current.push(pt[0], pt[1]);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.lineTo((pt[0] * width) / 1000, (pt[1] * height) / 1000);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (!isDrawer || !isDrawingRef.current || isTurnLocked) return;
    isDrawingRef.current = false;

    if (currentPointsRef.current.length >= 2) {
      const strokeData: Omit<Stroke, 'id' | 'seq'> = {
        turnNumber,
        drawerId: drawerName,
        color: activeColor,
        size: brushSize,
        tool,
        points: [...currentPointsRef.current],
      };
      onSendStroke(strokeData);
    }
    currentPointsRef.current = [];
  };

  // Undo / Redo handlers
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setRedoStack((prev) => [...prev, last]);
    // Filter local display and clear
    onClearCanvas();
    const remaining = strokes.slice(0, -1);
    remaining.forEach((s) => onSendStroke(s));
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    onSendStroke(next);
  };

  // Timer visual progress
  const timerPercentage = Math.max(0, Math.min(100, (timeRemaining / (totalTime || 60)) * 100));
  const isTimeRunningOut = timeRemaining <= 10;

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
      {/* Top Banner: Round Info, Secret Word (Drawer) or Drawing Status (Guesser), Timer */}
      <div className="px-3 sm:px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 shrink-0">
        {/* Left: Round & Drawer info */}
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">{drawerAvatar}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                {isDrawer ? (language === 'bn' ? 'আপনি আঁকছেন' : 'You are drawing') : `${drawerName} ${t.isDrawing}`}
              </span>
            </div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
              {language === 'bn' ? `রাউন্ড ${currentRound}/${totalRounds}` : `Round ${currentRound}/${totalRounds}`}
            </span>
          </div>
        </div>

        {/* Center: Secret Word (Drawer ONLY!) or Guess Attempts Badge (Guessers) */}
        <div className="text-center">
          {isDrawer ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <Sparkles className="w-4 h-4" />
              <div>
                <span className="font-black text-xs sm:text-sm">
                  {secretWord ? `${secretWord.bn} (${secretWord.en})` : '...'}
                </span>
                {secretWord?.hint && (
                  <span className="text-[10px] opacity-90 hidden sm:inline ml-1 font-medium">
                    • {secretWord.hint}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              {categoryClue && (
                <span className="text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-lg">
                  {categoryClue}
                </span>
              )}
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {t.attemptsLeft}:
              </span>
              <span
                className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                  attemptsLeft === 0
                    ? 'bg-rose-500 text-white'
                    : attemptsLeft === 1
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {attemptsLeft}/3
              </span>
            </div>
          )}
        </div>

        {/* Right: Timer Clock */}
        <div className="flex items-center gap-1.5">
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-2xl font-black text-xs sm:text-sm shadow-sm transition ${
              isTimeRunningOut
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{timeRemaining}s</span>
          </div>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 shrink-0">
        <div
          className={`h-full transition-all duration-1000 ${
            isTimeRunningOut ? 'bg-rose-500' : 'bg-gradient-to-r from-amber-500 to-indigo-500'
          }`}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>

      {/* Interactive Drawing Canvas */}
      <div className="relative flex-1 bg-white touch-none cursor-crosshair min-h-[220px] sm:min-h-[340px]">
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="w-full h-full block bg-white"
        />

        {/* Lock Overlay if turn is locked */}
        {isTurnLocked && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-200">
              <Lock className="w-4 h-4 text-amber-500" />
              <span>{language === 'bn' ? 'পালা সমাপ্ত' : 'Turn Ended'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Control Toolbar (Visible ONLY to the drawer during their turn) */}
      {isDrawer && !isTurnLocked && (
        <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 shrink-0">
          {/* Colors Palette */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 max-w-[280px] sm:max-w-none">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setActiveColor(c);
                  setTool('pen');
                }}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all shrink-0 ${
                  c === '#ffffff' ? 'border border-slate-300' : ''
                } ${
                  activeColor === c && tool === 'pen'
                    ? 'scale-125 ring-2 ring-amber-400 ring-offset-2'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>

          {/* Tools: Brush Sizes, Eraser, Clear, Undo, Redo */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Brush sizes */}
            {BRUSH_SIZES.map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => setBrushSize(b.size)}
                className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition ${
                  brushSize === b.size
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                }`}
                title={`Brush ${b.label}`}
              >
                {b.label}
              </button>
            ))}

            <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-0.5" />

            {/* Eraser Toggle */}
            <button
              type="button"
              onClick={() => setTool(tool === 'eraser' ? 'pen' : 'eraser')}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition ${
                tool === 'eraser'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
              }`}
              title={t.eraser}
            >
              <Eraser className="w-4 h-4" />
            </button>

            {/* Undo */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 disabled:opacity-40 transition"
              title={t.undo}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Clear Canvas */}
            <button
              type="button"
              onClick={onClearCanvas}
              className="p-1.5 sm:p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 font-bold transition"
              title={t.clearCanvas}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
