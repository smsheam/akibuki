import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  Trash2,
  Eraser,
  PenTool,
  Clock,
  Lock,
} from 'lucide-react';
import { Stroke, WordHint } from '../types/game';
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
  wordHint?: WordHint | null;
  onSendStroke: (stroke: Omit<Stroke, 'id' | 'seq'>) => void;
  onUndoStroke: (strokeId: string) => void;
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
  wordHint,
  onSendStroke,
  onUndoStroke,
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
        ctx.strokeStyle = (s.tool === 'eraser' || s.color === '#ffffff') ? '#ffffff' : s.color;
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

  // Resize canvas keeping internal coordinate resolution at high DPI
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
    const effectiveWidth = tool === 'eraser' ? Math.max(brushSize * 3.5, 24) : brushSize;

    ctx.beginPath();
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : activeColor;
    ctx.lineWidth = (effectiveWidth * width) / 1000;
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
    const effectiveWidth = tool === 'eraser' ? Math.max(brushSize * 3.5, 24) : brushSize;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : activeColor;
    ctx.lineWidth = (effectiveWidth * width) / 1000;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo((pt[0] * width) / 1000, (pt[1] * height) / 1000);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (!isDrawer || !isDrawingRef.current || isTurnLocked) return;
    isDrawingRef.current = false;

    if (currentPointsRef.current.length >= 2) {
      const effectiveWidth = tool === 'eraser' ? Math.max(brushSize * 3.5, 24) : brushSize;
      const strokeData: Omit<Stroke, 'id' | 'seq'> = {
        turnNumber,
        drawerId: drawerName,
        color: tool === 'eraser' ? '#ffffff' : activeColor,
        size: effectiveWidth,
        tool,
        points: [...currentPointsRef.current],
      };
      onSendStroke(strokeData);
    }
    currentPointsRef.current = [];
  };

  // Undo Handler: deletes the last stroke
  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    if (last && last.id) {
      // Local immediate optimistic update
      redrawAllStrokes(strokes.slice(0, -1));
      onUndoStroke(last.id);
    }
  };

  // Clear Canvas Handler: immediately wipes local context and triggers cloud sync
  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    onClearCanvas();
  };

  // Timer visual progress
  const timerPercentage = Math.max(0, Math.min(100, (timeRemaining / (totalTime || 60)) * 100));
  const isTimeRunningOut = timeRemaining <= 10;

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-black rounded-3xl shadow-xl border-2 border-zinc-200 dark:border-zinc-800 overflow-hidden relative">
      {/* 1. Large Top Word Banner for Drawer */}
      {isDrawer && secretWord && (
        <div className="w-full bg-black text-white dark:bg-white dark:text-black px-3.5 sm:px-6 py-2.5 flex items-center justify-between border-b-2 border-black dark:border-white shadow-sm shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-xs uppercase font-black tracking-wider bg-white/20 dark:bg-black/20 px-2 py-0.5 rounded-md">
              {language === 'bn' ? 'আপনার শব্দ:' : 'Your Word:'}
            </span>
            <span className="text-xl sm:text-3xl font-black tracking-tight">
              {secretWord.bn}
            </span>
            <span className="text-sm sm:text-lg font-extrabold opacity-85">
              ({secretWord.en})
            </span>
          </div>
          {secretWord.hint && (
            <span className="hidden md:inline-block text-xs font-bold opacity-90 bg-white/10 dark:bg-black/10 px-3 py-1 rounded-full">
              💡 {secretWord.hint}
            </span>
          )}
        </div>
      )}

      {/* 2. Top Info Bar: Round Info, Guesser Clue (Word Count + Blanks, NO Category), Timer */}
      <div className="px-3 sm:px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
        {/* Left: Round & Drawer info */}
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">{drawerAvatar}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xs sm:text-sm text-black dark:text-white">
                {isDrawer ? (language === 'bn' ? 'আপনি আঁকছেন' : 'You are drawing') : `${drawerName} ${t.isDrawing}`}
              </span>
            </div>
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
              {language === 'bn' ? `রাউন্ড ${currentRound}/${totalRounds}` : `Round ${currentRound}/${totalRounds}`}
            </span>
          </div>
        </div>

        {/* Center: Guesser Hints (Word Count & Dashes, NO CATEGORY) */}
        {!isDrawer && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700">
              {wordHint ? wordHint.labelBn : '১টি শব্দ'}
            </span>
            <span className="font-mono text-xs sm:text-base font-black tracking-[0.25em] text-black dark:text-white bg-white dark:bg-black px-3 py-0.5 rounded-lg border border-zinc-300 dark:border-zinc-700 shadow-inner">
              {wordHint ? wordHint.dashes : '_ _ _ _'}
            </span>
            <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500">
              <span>{t.attemptsLeft}:</span>
              <span className="font-black text-black dark:text-white">{attemptsLeft}/4</span>
            </div>
          </div>
        )}

        {/* Right: Timer Clock */}
        <div className="flex items-center gap-1.5">
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-2xl font-black text-xs sm:text-sm shadow-sm transition border ${
              isTimeRunningOut
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white animate-pulse'
                : 'bg-white dark:bg-zinc-900 text-black dark:text-white border-zinc-300 dark:border-zinc-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{timeRemaining}s</span>
          </div>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 shrink-0">
        <div
          className={`h-full transition-all duration-1000 ${
            isTimeRunningOut ? 'bg-black dark:bg-white animate-pulse' : 'bg-black dark:bg-white'
          }`}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>

      {/* Interactive Drawing Canvas */}
      <div className={`relative flex-1 bg-white touch-none min-h-[220px] sm:min-h-[300px] ${
        tool === 'eraser' ? 'cursor-cell' : 'cursor-crosshair'
      }`}>
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
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <div className="px-4 py-2 rounded-2xl bg-white dark:bg-black shadow-lg border-2 border-black dark:border-white flex items-center gap-2 text-xs font-black text-black dark:text-white">
              <Lock className="w-4 h-4 text-black dark:text-white" />
              <span>{language === 'bn' ? 'পালা সমাপ্ত' : 'Turn Ended'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Drawer Control Toolbar (Visible ONLY to the drawer during their turn) */}
      {isDrawer && !isTurnLocked && (
        <div className="p-2 sm:p-2.5 bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-1.5 shrink-0">
          {/* Colors Palette */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 max-w-[270px] sm:max-w-none">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setActiveColor(c);
                  setTool('pen');
                }}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full transition-all shrink-0 ${
                  c === '#ffffff' ? 'border border-zinc-400' : ''
                } ${
                  activeColor === c && tool === 'pen'
                    ? 'scale-125 ring-2 ring-black dark:ring-white ring-offset-2'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
          </div>

          {/* Tools: Brush Sizes, Eraser, Clear, Undo */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Pen Tool button */}
            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition border ${
                tool === 'pen'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
              title="Pen"
            >
              <PenTool className="w-4 h-4" />
            </button>

            {/* Eraser Toggle */}
            <button
              type="button"
              onClick={() => setTool(tool === 'eraser' ? 'pen' : 'eraser')}
              className={`p-1.5 sm:p-2 rounded-xl text-xs font-bold transition border ${
                tool === 'eraser'
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
              title={t.eraser}
            >
              <Eraser className="w-4 h-4" />
            </button>

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

            {/* Brush sizes */}
            {BRUSH_SIZES.map((b) => (
              <button
                key={b.label}
                type="button"
                onClick={() => setBrushSize(b.size)}
                className={`w-7 h-7 rounded-xl text-xs font-black flex items-center justify-center transition border ${
                  brushSize === b.size
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm'
                    : 'bg-white dark:bg-zinc-800 text-black dark:text-white border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
                title={`Brush ${b.label}`}
              >
                {b.label}
              </button>
            ))}

            <div className="w-px h-5 bg-zinc-300 dark:bg-zinc-700 mx-0.5" />

            {/* Undo */}
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokes.length === 0}
              className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-30 transition font-bold"
              title={t.undo}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Clear Canvas (Delete) */}
            <button
              type="button"
              onClick={handleClearCanvas}
              className="p-1.5 sm:p-2 rounded-xl bg-white dark:bg-zinc-800 text-black dark:text-white border border-zinc-300 dark:border-zinc-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black font-bold transition"
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
