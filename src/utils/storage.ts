export const storage = {
    get: <T=unknown>(key: string): T | null => {
      const item = globalThis.localStorage?.getItem(key);
      try {
        return JSON.parse(item ?? '');
      } catch {
        return null;
      }
    },
    set: (key: string, value: unknown): void => {
      const item = typeof value === 'string' ? value : JSON.stringify(value);
      globalThis.localStorage?.setItem(key, item);
    },
    remove: (key: string): void => {
      globalThis.localStorage?.removeItem(key);
    },
  };
  
  export default storage;
  