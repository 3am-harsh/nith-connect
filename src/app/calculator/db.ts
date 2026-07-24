/* eslint-disable */
// Client-side IndexedDB configuration for the Secret Vault

const DB_NAME = 'SecretVaultDB';
const DB_VERSION = 1;

export interface SecretItem {
  id: string;
  label: string;
  value: string;
  timestamp: number;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 Data URL
  timestamp: number;
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB is only available in the browser.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains('secrets')) {
        db.createObjectStore('secrets', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('notes')) {
        db.createObjectStore('notes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' });
      }
    };
  });
}

// SECRETS CRUD
export async function getSecrets(): Promise<SecretItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('secrets', 'readonly');
    const store = transaction.objectStore('secrets');
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result as SecretItem[];
      resolve(items.sort((a, b) => b.timestamp - a.timestamp));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function addSecret(label: string, value: string): Promise<SecretItem> {
  const db = await getDB();
  const newItem: SecretItem = {
    id: crypto.randomUUID(),
    label,
    value,
    timestamp: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('secrets', 'readwrite');
    const store = transaction.objectStore('secrets');
    const request = store.add(newItem);
    request.onsuccess = () => resolve(newItem);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteSecret(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('secrets', 'readwrite');
    const store = transaction.objectStore('secrets');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// NOTES CRUD
export async function getNotes(): Promise<NoteItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('notes', 'readonly');
    const store = transaction.objectStore('notes');
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result as NoteItem[];
      resolve(items.sort((a, b) => b.timestamp - a.timestamp));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function addNote(title: string, content: string): Promise<NoteItem> {
  const db = await getDB();
  const newItem: NoteItem = {
    id: crypto.randomUUID(),
    title: title || 'Untitled Note',
    content,
    timestamp: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('notes', 'readwrite');
    const store = transaction.objectStore('notes');
    const request = store.add(newItem);
    request.onsuccess = () => resolve(newItem);
    request.onerror = () => reject(request.error);
  });
}

export async function updateNote(id: string, title: string, content: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('notes', 'readwrite');
    const store = transaction.objectStore('notes');
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result as NoteItem;
      if (!item) {
        reject(new Error('Note not found'));
        return;
      }
      item.title = title || 'Untitled Note';
      item.content = content;
      item.timestamp = Date.now();
      
      const updateRequest = store.put(item);
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(updateRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

export async function deleteNote(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('notes', 'readwrite');
    const store = transaction.objectStore('notes');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// FILES CRUD
export async function getFiles(): Promise<FileItem[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('files', 'readonly');
    const store = transaction.objectStore('files');
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result as FileItem[];
      resolve(items.sort((a, b) => b.timestamp - a.timestamp));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function addFile(name: string, type: string, size: number, data: string): Promise<FileItem> {
  const db = await getDB();
  const newItem: FileItem = {
    id: crypto.randomUUID(),
    name,
    type,
    size,
    data,
    timestamp: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');
    const request = store.add(newItem);
    request.onsuccess = () => resolve(newItem);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteFile(id: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
