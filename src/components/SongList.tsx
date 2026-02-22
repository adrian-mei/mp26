import { useState, useMemo, useEffect } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { Song } from '../db';
import { usePlayerStore } from '../store/usePlayerStore';
import { formatDuration, bufferToBlobUrl } from '../utils';
import { Play, Pause } from 'lucide-react';
import { cn } from '../utils';

interface SongListProps {
  songs: Song[];
}

export const SongList = ({ songs }: SongListProps) => {
  const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore();
  
  // Memoize the item renderer to avoid re-renders
  const itemContent = (index: number, song: Song) => {
    const isCurrent = currentSong?.id === song.id;
    const coverUrl = bufferToBlobUrl(song.picture, song.pictureType);

    return (
      <div 
        className={cn(
          "flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group",
          isCurrent && "bg-white/10"
        )}
        onClick={() => {
          if (isCurrent) {
            togglePlay();
          } else {
            playSong(song);
          }
        }}
      >
        {/* Cover / Play Icon */}
        <div className="relative w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
          {coverUrl ? (
            <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
              ♪
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className={cn(
            "absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity",
            isCurrent && "opacity-100"
          )}>
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 text-white fill-current" />
            ) : (
              <Play className="w-5 h-5 text-white fill-current" />
            )}
          </div>
        </div>

        {/* Text Info */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-medium truncate",
            isCurrent ? "text-emerald-400" : "text-white"
          )}>
            {song.title}
          </h3>
          <p className="text-sm text-zinc-400 truncate">
            {song.artist} • {song.album}
          </p>
        </div>

        {/* Duration */}
        <div className="text-xs text-zinc-500 font-mono">
          {formatDuration(song.duration)}
        </div>
      </div>
    );
  };

  return (
    <Virtuoso
      style={{ height: '100%' }}
      data={songs}
      itemContent={itemContent}
      className="scrollbar-hide"
    />
  );
};
