import * as mm from 'music-metadata-browser';
import { Buffer } from 'buffer';

// Polyfill buffer for the browser environment if needed by the library
if (typeof self !== 'undefined') {
  (self as any).Buffer = Buffer;
}

self.onmessage = async (e: MessageEvent) => {
  const { file } = e.data;

  try {
    // 1. Calculate Hash (Simple SHA-256 for deduplication)
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // 2. Parse Metadata
    // We use the blob directly with music-metadata-browser
    const metadata = await mm.parseBlob(file, {
      duration: true,
      skipCovers: false,
    });

    const { common, format } = metadata;

    const picture = common.picture?.[0];
    
    const result = {
      id: hashHex,
      title: common.title || file.name.replace(/\.[^/.]+$/, ""),
      artist: common.artist || 'Unknown Artist',
      album: common.album || 'Unknown Album',
      duration: format.duration || 0,
      picture: picture?.data ? picture.data : undefined,
      pictureType: picture?.format,
      addedAt: Date.now(),
    };

    self.postMessage({ type: 'SUCCESS', payload: result });
  } catch (error) {
    console.error('Worker Error:', error);
    self.postMessage({ type: 'ERROR', error: (error as Error).message, fileName: file.name });
  }
};
