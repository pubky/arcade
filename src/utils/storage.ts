export const storage = {
  get: (key: string): string | null => {
    const item = localStorage?.getItem(key);
    try {
      return JSON.parse(item ?? '') as string;
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
