// ---------------------------------------------------------------------------
// core/storage.js — safe localStorage / sessionStorage wrapper.
// Silently no-ops when storage is unavailable (private tabs, quota issues).
// ---------------------------------------------------------------------------

export const local = {
  get(key, fallback = null) {
    try { return localStorage.getItem(key) ?? fallback; } catch (_) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch (_) {}
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }
};

export const session = {
  get(key, fallback = null) {
    try { return sessionStorage.getItem(key) ?? fallback; } catch (_) { return fallback; }
  },
  set(key, value) {
    try { sessionStorage.setItem(key, value); } catch (_) {}
  },
  remove(key) {
    try { sessionStorage.removeItem(key); } catch (_) {}
  }
};
