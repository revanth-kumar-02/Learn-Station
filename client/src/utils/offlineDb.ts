const DB_NAME = 'LearnStationOffline';
const DB_VERSION = 1;

export interface OfflineLesson {
  slug: string;
  title: string;
  trackName: string;
  content: string; // lesson notes / text
  flashcards: string[]; // flashcards
  summary: string;
  practiceQuestions: any[];
  downloadedAt: string;
}

export interface SyncItem {
  id?: number;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data: any;
  timestamp: number;
}

export interface DownloadedFile {
  id: string; // unique ID or name
  title: string;
  type: 'certificate' | 'report' | 'flashcard' | 'notes' | 'cheatsheet';
  size: number; // in bytes
  downloadDate: string;
  content: string; // text, summary, base64 data, or markdown
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = request.result;
      
      // Lessons Store (offline content)
      if (!db.objectStoreNames.contains('lessons')) {
        db.createObjectStore('lessons', { keyPath: 'slug' });
      }

      // Sync Queue Store (staged API calls)
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }

      // Downloads Store (certificates, reports, sheets)
      if (!db.objectStoreNames.contains('downloads')) {
        db.createObjectStore('downloads', { keyPath: 'id' });
      }
    };
  });
}

export const offlineDb = {
  // --- LESSONS METHODS ---
  saveLesson: async (lesson: OfflineLesson): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('lessons', 'readwrite');
      const store = transaction.objectStore('lessons');
      const request = store.put(lesson);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getLesson: async (slug: string): Promise<OfflineLesson | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('lessons', 'readonly');
      const store = transaction.objectStore('lessons');
      const request = store.get(slug);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  getAllLessons: async (): Promise<OfflineLesson[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('lessons', 'readonly');
      const store = transaction.objectStore('lessons');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  deleteLesson: async (slug: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('lessons', 'readwrite');
      const store = transaction.objectStore('lessons');
      const request = store.delete(slug);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // --- SYNC QUEUE METHODS ---
  queueRequest: async (item: SyncItem): Promise<number> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('syncQueue', 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  },

  getQueue: async (): Promise<SyncItem[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('syncQueue', 'readonly');
      const store = transaction.objectStore('syncQueue');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  deleteQueueItem: async (id: number): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('syncQueue', 'readwrite');
      const store = transaction.objectStore('syncQueue');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // --- DOWNLOADS METHODS ---
  saveDownload: async (file: DownloadedFile): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('downloads', 'readwrite');
      const store = transaction.objectStore('downloads');
      const request = store.put(file);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  getDownload: async (id: string): Promise<DownloadedFile | null> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('downloads', 'readonly');
      const store = transaction.objectStore('downloads');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  getAllDownloads: async (): Promise<DownloadedFile[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('downloads', 'readonly');
      const store = transaction.objectStore('downloads');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  deleteDownload: async (id: string): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('downloads', 'readwrite');
      const store = transaction.objectStore('downloads');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // Get total storage usage estimate
  getStorageUsage: async (): Promise<{ usage: number; quota: number }> => {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0
      };
    }
    
    // Fallback manual estimate from indexedDB records sizes
    const lessons = await offlineDb.getAllLessons();
    const downloads = await offlineDb.getAllDownloads();
    let usage = 0;
    
    lessons.forEach(l => {
      usage += JSON.stringify(l).length;
    });
    downloads.forEach(d => {
      usage += JSON.stringify(d).length;
    });
    
    return { usage, quota: 50 * 1024 * 1024 }; // 50MB dummy quota
  }
};
