import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { currentSong, isPlaying, volume, playNext, playPrev } = usePlayerStore();

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
      
      // Event listeners
      audioRef.current.onended = () => {
        playNext();
      };
    }
  }, [playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;

    if (currentSong) {
      // Create object URL for the blob
      // Note: In a real app, we need to revoke these URLs to avoid memory leaks
      const url = URL.createObjectURL(currentSong.file);
      
      // Only change src if it's different to avoid reloading
      // But here currentSong changing implies a new song
      if (audio.src !== url) {
        audio.src = url;
        if (isPlaying) {
          audio.play().catch(e => console.error("Playback failed", e));
        }
      } else {
        // Same song, just toggle play state
        if (isPlaying) {
          audio.play().catch(e => console.error("Playback failed", e));
        } else {
          audio.pause();
        }
      }

      // Media Session API
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentSong.title,
          artist: currentSong.artist,
          album: currentSong.album,
          artwork: currentSong.picture 
            ? [{ src: URL.createObjectURL(new Blob([currentSong.picture], { type: currentSong.pictureType || 'image/jpeg' })), sizes: '512x512', type: currentSong.pictureType || 'image/jpeg' }]
            : []
        });

        navigator.mediaSession.setActionHandler('play', () => usePlayerStore.getState().togglePlay());
        navigator.mediaSession.setActionHandler('pause', () => usePlayerStore.getState().togglePlay());
        navigator.mediaSession.setActionHandler('previoustrack', () => playPrev());
        navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
      }
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      audio.pause();
      audio.src = '';
    }
  }, [currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  return audioRef;
};
