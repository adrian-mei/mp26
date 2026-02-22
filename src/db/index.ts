import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface Song {
  id: string; // hash of the file content
  title: string;
  artist: string;
  album: string;
  duration: number;
  picture?: ArrayBuffer; // Cover art buffer
  pictureType?: string; // Mime type of cover art
  file: Blob; // The actual file
  addedAt: number;
}

interface MuseDB extends DBSchema {
  songs: {
    key: string;
    value: Song;
    indexes: { 'by-artist': string; 'by-album': string; 'by-added': number };
  };
}

let dbPromise: Promise<IDBPDatabase<MuseDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<MuseDB>('muse-db', 1, {
      upgrade(db) {
        const songStore = db.createObjectStore('songs', { keyPath: 'id' });
        songStore.createIndex('by-artist', 'artist');
        songStore.createIndex('by-album', 'album');
        songStore.createIndex('by-added', 'addedAt');
      },
    });
  }
  return dbPromise;
};

export const saveSong = async (song: Song) => {
  const db = await initDB();
  return db.put('songs', song);
};

export const getSongs = async () => {
  const db = await initDB();
  return db.getAllFromIndex('songs', 'by-added');
};

export const getSong = async (id: string) => {
  const db = await initDB();
  return db.get('songs', id);
};

export const deleteSong = async (id: string) => {
  const db = await initDB();
  return db.delete('songs', id);
};
