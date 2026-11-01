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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-black dark:text-white">
      <div className="relative w-full max-w-lg bg-white dark:bg-black rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-zinc-200 dark:border-zinc-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{drawerAvatar}</span>
          <div>
            <h3 className="font-black text-black dark:text-white text-base">
              {drawerName} এর আঁকার রিপ্লে
            </h3>
            <p className="text-xs font-bold text-zinc-500">
              {wordBn} ({wordEn})
            </p>
          </div>
        </div>

        {/* Replay Canvas */}
        <div className="w-full aspect-video rounded-2xl border-2 border-zinc-300 dark:border-zinc-700 overflow-hidden bg-white shadow-inner mb-4">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black hover:bg-zinc-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-bold text-xs border border-black dark:border-white shadow-md active:scale-95 transition cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'বিরতি' : 'চালান'}</span>
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 font-bold border border-zinc-300 dark:border-zinc-700 transition cursor-pointer"
              title="শুরু থেকে দেখুন"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-bold text-zinc-400">
            স্ট্রোক: {currentStrokeIndex + 1} / {strokes.length || 1}
          </span>
        </div>
      </div>
    </div>
  );
};
