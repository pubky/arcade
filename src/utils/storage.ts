export const storage = {
  get: <T = unknown>(key: string): T | null => {
    const item = localStorage?.getItem(key);
    try {
      return JSON.parse(item ?? '') as T;
    } catch {
      return null;
    }
  },
  set: (key: string, value: unknown): void => {
    const item = JSON.stringify(value);
    localStorage?.setItem(key, item);
  },
  remove: (key: string): void => {
    localStorage?.removeItem(key);
  },
};

export default storage;
