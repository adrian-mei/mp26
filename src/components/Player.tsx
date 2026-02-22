import React, { useState, useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { cn, formatDuration, bufferToBlobUrl } from '../utils';
import { Play, Pause, SkipBack, SkipForward, ChevronDown, Repeat, Shuffle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Player = () => {
  const { currentSong, isPlaying, togglePlay, playNext, playPrev, repeat, shuffle, toggleRepeat, toggleShuffle } = usePlayerStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync with the global audio element (managed in useAudio hook or similar)
  // For this MVP, we'll assume the hook manages the audio instance, but we need to read its time.
  // Actually, to keep it simple, let's just query the audio element from the DOM or share the ref.
  // Since useAudio is a hook, let's make it accessible or just use a simple interval here for UI updates.
  
  useEffect(() => {
    // Find the audio element created by useAudio hook
    // This is a bit hacky, but effective for decoupled components
    const audio = document.querySelector('audio');
    if (!audio) return;

    const updateProgress = () => {
      setProgress(audio.currentTime);
    };

    audio.addEventListener('timeupdate', updateProgress);
    return () => audio.removeEventListener('timeupdate', updateProgress);
  }, [currentSong]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = document.querySelector('audio');
    if (audio) {
      audio.currentTime = Number(e.target.value);
      setProgress(audio.currentTime);
    }
  };

  if (!currentSong) return null;

  const coverUrl = bufferToBlobUrl(currentSong.picture, currentSong.pictureType);

  return (
    <>
      {/* Mini Player */}
      <motion.div 
        layoutId="player-container"
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-white/10 p-2 pb-safe z-50",
          isExpanded ? "hidden" : "flex items-center gap-3"
        )}
        onClick={() => setIsExpanded(true)}
      >
        <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <span className="text-xs">♪</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate text-sm">{currentSong.title}</h4>
          <p className="text-zinc-400 text-xs truncate">{currentSong.artist}</p>
        </div>
        <div className="flex items-center gap-2 mr-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={togglePlay} className="p-2 text-white">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button onClick={playNext} className="p-2 text-zinc-400 hover:text-white">
            <SkipForward className="w-6 h-6" />
          </button>
        </div>
        {/* Progress bar overlay for mini player */}
        <div className="absolute bottom-0 left-0 h-0.5 bg-zinc-800 w-full">
          <div 
            className="h-full bg-white" 
            style={{ width: `${(progress / currentSong.duration) * 100}%` }}
          />
        </div>
      </motion.div>

      {/* Full Screen Player */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-zinc-950 z-[60] flex flex-col pb-safe"
          >
            {/* Header */}
            <div className="flex items-center justify-center relative p-4 mt-8">
              <button 
                onClick={() => setIsExpanded(false)}
                className="absolute left-4 p-2 text-zinc-400 hover:text-white"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
              <span className="text-zinc-400 text-xs uppercase tracking-widest">Now Playing</span>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 gap-8">
              {/* Cover Art */}
              <motion.div 
                layoutId="player-cover"
                className="w-full max-w-sm aspect-square rounded-2xl bg-zinc-800 overflow-hidden shadow-2xl shadow-black/50"
              >
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700">
                    <span className="text-6xl">♪</span>
                  </div>
                )}
              </motion.div>

              {/* Info */}
              <div className="w-full max-w-sm text-left">
                <h2 className="text-2xl font-bold text-white truncate">{currentSong.title}</h2>
                <p className="text-lg text-zinc-400 truncate">{currentSong.artist}</p>
              </div>

              {/* Progress */}
              <div className="w-full max-w-sm space-y-2">
                <input 
                  type="range" 
                  min={0} 
                  max={currentSong.duration || 100} 
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
                <div className="flex justify-between text-xs text-zinc-500 font-mono">
                  <span>{formatDuration(progress)}</span>
                  <span>{formatDuration(currentSong.duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="w-full max-w-sm flex items-center justify-between">
                <button 
                  onClick={toggleShuffle}
                  className={cn("p-2 transition-colors", shuffle ? "text-emerald-400" : "text-zinc-600")}
                >
                  <Shuffle className="w-5 h-5" />
                </button>
                
                <button onClick={playPrev} className="p-4 text-white hover:scale-110 transition-transform">
                  <SkipBack className="w-8 h-8" />
                </button>
                
                <button 
                  onClick={togglePlay}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 text-black fill-current" />
                  ) : (
                    <Play className="w-8 h-8 text-black fill-current ml-1" />
                  )}
                </button>
                
                <button onClick={playNext} className="p-4 text-white hover:scale-110 transition-transform">
                  <SkipForward className="w-8 h-8" />
                </button>
                
                <button 
                  onClick={toggleRepeat}
                  className={cn("p-2 transition-colors", repeat !== 'none' ? "text-emerald-400" : "text-zinc-600")}
                >
                  <Repeat className="w-5 h-5" />
                  {repeat === 'one' && <span className="absolute text-[8px] font-bold ml-2 -mt-2">1</span>}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
