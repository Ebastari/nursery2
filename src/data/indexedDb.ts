import type { ApiRow } from './api';

const DB_NAME = 'SmartNurseryDB';
const DB_VERSION = 1;
const STORE_ROWS = 'apiRows';
const STORE_META = 'meta';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_ROWS)) {
        db.createObjectStore(STORE_ROWS, { keyPath: 'no' });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveRowsToDB(rows: ApiRow[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction([STORE_ROWS, STORE_META], 'readwrite');
  const store = tx.objectStore(STORE_ROWS);
  const meta = tx.objectStore(STORE_META);

  // Clear old data
  store.clear();

  // Save each row with index as key
  for (let i = 0; i < rows.length; i++) {
    store.put({ ...rows[i], no: i });
  }

  // Save last updated timestamp
  meta.put({ key: 'lastUpdated', value: new Date().toISOString() });

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

export async function getRowsFromDB(): Promise<ApiRow[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_ROWS, 'readonly');
  const store = tx.objectStore(STORE_ROWS);
  const req = store.getAll();

  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      db.close();
      // Remove the 'no' key we added
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const rows = (req.result || []).map(({ no: _no, ...rest }: { no: number } & ApiRow) => rest as ApiRow);
      resolve(rows);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

export async function getLastUpdated(): Promise<string | null> {
  const db = await openDB();
  const tx = db.transaction(STORE_META, 'readonly');
  const store = tx.objectStore(STORE_META);
  const req = store.get('lastUpdated');

  return new Promise((resolve, reject) => {
    req.onsuccess = () => {
      db.close();
      resolve(req.result?.value ?? null);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}
