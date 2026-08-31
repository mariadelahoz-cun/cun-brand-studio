/**
 * Almacén mínimo sobre IndexedDB para la biblioteca de assets.
 *
 * localStorage se queda sin espacio (~5 MB) apenas se suben unas pocas
 * imágenes en base64; IndexedDB aguanta cientos de MB.
 */

const DB_NAME = "cun-creativo";
const DB_VERSION = 1;
const STORE = "assets";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB no disponible"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("No se pudo abrir IndexedDB"));
  });
  return dbPromise;
}

function tx(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return openDb().then((db) => db.transaction(STORE, mode).objectStore(STORE));
}

function wrap<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Error de IndexedDB"));
  });
}

export async function idbGetAll<T>(): Promise<T[]> {
  const store = await tx("readonly");
  return wrap<T[]>(store.getAll() as IDBRequest<T[]>);
}

export async function idbPut<T>(value: T): Promise<void> {
  const store = await tx("readwrite");
  await wrap(store.put(value));
}

export async function idbDelete(id: string): Promise<void> {
  const store = await tx("readwrite");
  await wrap(store.delete(id));
}
