// Safe storage helper to prevent SecurityError, DOMException, or QuotaExceededError in iframe and private environments
const memoryStore: Record<string, string> = {};
const memorySessionStore: Record<string, string> = {};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (_) {}
    return memoryStore[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    memoryStore[key] = value;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Prevent storing gigantic payloads into 5MB localStorage (IndexedDB handles full catalog)
        if (key === 'oneroof_products' && value.length > 250000) {
          try {
            const arr = JSON.parse(value);
            if (Array.isArray(arr)) {
              window.localStorage.setItem(key, JSON.stringify(arr.slice(0, 40)));
              return;
            }
          } catch (_) {
            return;
          }
        }
        window.localStorage.setItem(key, value);
      }
    } catch (_) {
      // If quota exceeded, purge bulky non-essential keys and retry saving critical key
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem('oneroof_products');
          window.localStorage.removeItem('oneroof_cached_products');
          window.localStorage.removeItem('oneroof_search_history');
          window.localStorage.setItem(key, value);
        }
      } catch (e2) {}
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (_) {}
    delete memoryStore[key];
  },
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return window.sessionStorage.getItem(key);
      }
    } catch (_) {}
    return memorySessionStore[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(key, value);
      }
    } catch (_) {}
    memorySessionStore[key] = value;
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (_) {}
    delete memorySessionStore[key];
  },
};
