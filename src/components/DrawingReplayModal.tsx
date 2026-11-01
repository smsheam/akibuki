import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, RotateCcw } from 'lucide-react';
import { Stroke } from '../types/game';
import { Language, TRANSLATIONS } from '../data/translations';

interface DrawingReplayModalProps {
  language: Language;
  strokes: Stroke[];
  drawerName: string;
  drawerAvatar: string;
  wordEn: string;
  wordBn: string;
  onClose: () => void;
}

export const DrawingReplayModal: React.FC<DrawingReplayModalProps> = ({
  language,
  strokes,
  drawerName,
  drawerAvatar,
  wordEn,
  wordBn,
  onClose,
}) => {
  const t = TRANSLATIONS[language];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);

  const drawStrokesUpTo = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    for (let sIdx = 0; sIdx <= index && sIdx < strokes.length; sIdx++) {
      const s = strokes[sIdx];
      if (s.isDeleted || !s.points || s.points.length < 2) continue;

      ctx.beginPath();
      ctx.strokeStyle = s.tool === 'eraser' ? '#ffffff' : s.color;
      ctx.lineWidth = (s.size * width) / 1000;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const p0x = (s.points[0] * width) / 1000;
      const p0y = (s.points[1] * height) / 1000;
      ctx.moveTo(p0x, p0y);

      for (let i = 2; i < s.points.length; i += 2) {
        const px = (s.points[i] * width) / 1000;
        const py = (s.points[i + 1] * height) / 1000;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  };

  // Replay animation loop
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setCurrentStrokeIndex((prev) => {
        if (prev >= strokes.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        const next = prev + 1;
        drawStrokesUpTo(next);
        return next;
      });
    }, 70);

    return () => clearInterval(timer);
  }, [isPlaying, strokes]);

  // Initial canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    drawStrokesUpTo(0);
  }, []);

  const handleRestart = () => {
    setCurrentStrokeIndex(0);
    drawStrokesUpTo(0);
    setIsPlaying(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{drawerAvatar}</span>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base">
              {drawerName} এর আঁকার রিপ্লে
            </h3>
            <p className="text-xs font-bold text-amber-500">
              {wordBn} ({wordEn})
            </p>
          </div>
        </div>

        {/* Replay Canvas */}
        <div className="w-full aspect-video rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white shadow-inner mb-4">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isPlaying ? 'বিরতি' : 'চালান'}</span>
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold transition"
              title="শুরু থেকে দেখুন"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-bold text-slate-400">
            স্ট্রোক: {currentStrokeIndex + 1} / {strokes.length || 1}
          </span>
        </div>
      </div>
    </div>
  );
};
