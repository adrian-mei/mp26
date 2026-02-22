import { create } from 'zustand';
import { Song } from '../db';

interface PlayerState {
  queue: Song[];
  currentIndex: number;
  isPlaying: boolean;
  currentSong: Song | null;
  volume: number;
  shuffle: boolean;
  repeat: 'none' | 'all' | 'one';
  
  // Actions
  setQueue: (songs: Song[]) => void;
  playSong: (song: Song) => void;
  playNext: () => void;
  playPrev: () => void;
  togglePlay: () => void;
  setVolume: (val: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  currentSong: null,
  volume: 1,
  shuffle: false,
  repeat: 'none',

  setQueue: (songs) => set({ queue: songs }),

  playSong: (song) => {
    const { queue } = get();
    const index = queue.findIndex((s) => s.id === song.id);
    // If song not in queue, add it to front or replace queue? 
    // For simplicity, if not in queue, we just play it and it becomes the context.
    // But usually we play from a list.
    
    set({ 
      currentSong: song, 
      currentIndex: index !== -1 ? index : 0,
      isPlaying: true 
    });
  },

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  playNext: () => {
    const { queue, currentIndex, repeat, shuffle } = get();
    if (queue.length === 0) return;

    let nextIndex = currentIndex + 1;
    
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false });
        return;
      }
    }

    set({ 
      currentIndex: nextIndex, 
      currentSong: queue[nextIndex],
      isPlaying: true
    });
  },

  playPrev: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0) return;

    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = 0; // Or loop back to end?

    set({ 
      currentIndex: prevIndex, 
      currentSong: queue[prevIndex],
      isPlaying: true
    });
  },

  setVolume: (val) => set({ volume: val }),
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  toggleRepeat: () => set((state) => {
    const modes: ('none' | 'all' | 'one')[] = ['none', 'all', 'one'];
    const next = modes[(modes.indexOf(state.repeat) + 1) % modes.length];
    return { repeat: next };
  }),
}));
