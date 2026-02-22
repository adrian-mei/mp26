import React, { useState, useCallback, useEffect } from 'react';
import { saveSong, getSongs, deleteSong, initDB, Song } from '../db';
import { usePlayerStore } from '../store/usePlayerStore';
import { SongList } from './SongList';
import { Button } from './Button';
import { Upload, Music, Disc, User, Search, Loader2, Trash2 } from 'lucide-react';
import { cn } from '../utils';

export const Library = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<'songs' | 'albums' | 'artists'>('songs');
  const [search, setSearch] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { setQueue, currentSong, isPlaying } = usePlayerStore();

  // Load songs on mount
  useEffect(() => {
    loadSongs();
  }, []);

  const loadSongs = async () => {
    setIsLoading(true);
    const loadedSongs = await getSongs();
    setSongs(loadedSongs);
    setQueue(loadedSongs); // Update queue with all songs initially
    setIsLoading(false);
  };

  const handleClearLibrary = async () => {
    if (!confirm('Are you sure you want to clear your library? This cannot be undone.')) return;
    
    setIsLoading(true);
    const db = await initDB();
    await db.clear('songs');
    setSongs([]);
    setQueue([]);
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsImporting(true);
    const files = Array.from(e.target.files);
    let processed = 0;

    // Create worker
    const worker = new Worker(new URL('../workers/metadata.worker.ts', import.meta.url), { type: 'module' });

    worker.onmessage = async (event) => {
      const { type, payload, error } = event.data;
      
      if (type === 'SUCCESS') {
        // Find the original file to attach (since we can't pass Blob through structured clone easily in all cases, 
        // but here we passed it TO worker, getting it back is tricky. 
        // Actually, we should just save the file from the main thread context using the ID returned).
        // Wait, the worker calculated hash.
        
        // Optimization: We have the file in 'files' array.
        // We need to match it.
        // The worker payload has the ID (hash).
        // But we processed files sequentially or we need to map them.
        // Let's just pass the file index or name to worker to track.
      }
    };

    // We'll process sequentially for simplicity in this MVP to avoid complex async tracking
    // or use a pool.
    
    // Better approach:
    // Loop files, send to worker, await promise.
    
    for (const file of files) {
      try {
        await new Promise<void>((resolve) => {
          const w = new Worker(new URL('../workers/metadata.worker.ts', import.meta.url), { type: 'module' });
          w.onmessage = async (ev) => {
            if (ev.data.type === 'SUCCESS') {
              const songData = ev.data.payload;
              // Attach the file blob (it wasn't passed back)
              songData.file = file; 
              await saveSong(songData);
            }
            w.terminate();
            resolve();
          };
          w.onerror = () => {
            w.terminate();
            resolve();
          };
          w.postMessage({ file });
        });
        processed++;
      } catch (err) {
        console.error("Import failed", err);
      }
    }

    setIsImporting(false);
    loadSongs();
  };

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Header */}
      <div className="p-4 pt-safe space-y-4 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <div className="relative">
            <div className="flex items-center">
              <input 
                type="file" 
                multiple 
                accept="audio/*" 
                className="hidden" 
                id="file-upload"
                onChange={handleFileUpload}
              />
              <Button 
                variant="secondary" 
                size="sm" 
                icon={Upload} 
                type="button" 
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                Import
              </Button>
            </div>
            {songs.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleClearLibrary}
                className="ml-2 text-zinc-500 hover:text-red-400"
                title="Clear Library"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search songs, artists..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border-none rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-white/20"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'songs', label: 'Songs', icon: Music },
            { id: 'artists', label: 'Artists', icon: User },
            { id: 'albums', label: 'Albums', icon: Disc },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                view === tab.id 
                  ? "bg-white text-black" 
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden relative">
        {isLoading || isImporting ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-500">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>{isImporting ? "Importing music..." : "Loading library..."}</p>
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-600 p-8 text-center">
            <Music className="w-16 h-16 opacity-20" />
            <p>No music found. Import some files to get started.</p>
          </div>
        ) : (
          <div className="h-full pb-24 px-2">
            {view === 'songs' && <SongList songs={filteredSongs} />}
            {view !== 'songs' && (
              <div className="flex items-center justify-center h-full text-zinc-500">
                Coming soon in v1.1
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
