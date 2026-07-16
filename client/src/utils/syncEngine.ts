import { offlineDb, SyncItem } from './offlineDb';
import api from '../services/api';

let isSyncing = false;

export const syncEngine = {
  // Check if browser is online
  isOnline: (): boolean => {
    return navigator.onLine;
  },

  // Queue a progress or XP modification request if offline, otherwise fire directly
  executeOrQueue: async (url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', data: any): Promise<any> => {
    if (!navigator.onLine) {
      console.warn(`📶 [Sync Engine] Client offline. Staging ${method} request to ${url}...`);
      const id = await offlineDb.queueRequest({
        url,
        method,
        data,
        timestamp: Date.now()
      });
      
      // Update local XP / stats temporarily to keep UX responsive and snappy
      if (url.includes('/lessons/') && url.includes('/complete')) {
        // Temporarily increment XP and level-ups locally if available
        const localXp = parseInt(localStorage.getItem('ls_offline_xp') || '0') + 50;
        localStorage.setItem('ls_offline_xp', localXp.toString());
      }
      
      return { offlineStaged: true, queueId: id };
    }

    // Otherwise, execute direct API call
    if (method === 'POST') {
      const response = await api.post(url, data);
      return response.data;
    } else if (method === 'PUT') {
      const response = await api.put(url, data);
      return response.data;
    } else if (method === 'DELETE') {
      const response = await api.delete(url, { data });
      return response.data;
    } else {
      const response = await api.get(url);
      return response.data;
    }
  },

  // Synchronize staged sync queue to server
  synchronizeQueue: async (onStatusChange?: (status: 'syncing' | 'success' | 'error' | 'idle') => void): Promise<boolean> => {
    if (isSyncing) return false;
    if (!navigator.onLine) {
      if (onStatusChange) onStatusChange('idle');
      return false;
    }

    const queue = await offlineDb.getQueue();
    if (queue.length === 0) {
      if (onStatusChange) onStatusChange('idle');
      return true;
    }

    console.log(`📶 [Sync Engine] Syncing ${queue.length} staged requests online...`);
    isSyncing = true;
    if (onStatusChange) onStatusChange('syncing');

    let errorCount = 0;

    for (const item of queue) {
      try {
        console.log(`📶 [Sync Engine] Processing queued item #${item.id}: ${item.method} ${item.url}`);
        
        if (item.method === 'POST') {
          await api.post(item.url, item.data);
        } else if (item.method === 'PUT') {
          await api.put(item.url, item.data);
        } else if (item.method === 'DELETE') {
          await api.delete(item.url, { data: item.data });
        }

        // Delete from IndexedDB queue on success
        if (item.id !== undefined) {
          await offlineDb.deleteQueueItem(item.id);
        }
      } catch (err: any) {
        console.error(`❌ [Sync Engine] Failed to synchronize item #${item.id}:`, err.message);
        
        // Conflict resolution: if the record is duplicate or invalid (e.g. 400 Bad Request or 409 Conflict), discard it
        if (err.response?.status === 400 || err.response?.status === 409) {
          console.warn(`⚠️ [Sync Engine] Conflict detected for item #${item.id}. Dropping from queue.`);
          if (item.id !== undefined) {
            await offlineDb.deleteQueueItem(item.id);
          }
        } else {
          errorCount++;
        }
      }
    }

    isSyncing = false;
    if (errorCount === 0) {
      console.log('📶 [Sync Engine] All queued progress requests synchronized successfully!');
      if (onStatusChange) onStatusChange('success');
      
      // Clear offline temporary local cache increments
      localStorage.removeItem('ls_offline_xp');
      
      // Reload profile to fetch final verified states
      return true;
    } else {
      console.warn(`📶 [Sync Engine] Completed with ${errorCount} synchronization errors.`);
      if (onStatusChange) onStatusChange('error');
      return false;
    }
  },

  // Setup connection state triggers
  registerSyncTriggers: (onSyncComplete: () => void) => {
    window.addEventListener('online', async () => {
      console.log('📶 [Sync Engine] Browser is online. Initiating sync...');
      const success = await syncEngine.synchronizeQueue();
      if (success) {
        onSyncComplete();
      }
    });

    // Also register message event listener from Service Worker
    navigator.serviceWorker?.addEventListener('message', async (event) => {
      if (event.data && event.data.type === 'SYNC_PROGRESS_QUEUE') {
        console.log('📶 [Sync Engine] Service worker requested sync queue flush.');
        const success = await syncEngine.synchronizeQueue();
        if (success) {
          onSyncComplete();
        }
      }
    });
  }
};
