import { LocalStorage } from "@raycast/api";

type CachedList<T> = {
  items: T[];
  updatedAt: string;
};

export const cacheKey = (administrationId: string, key: "contacts" | "projects") =>
  `moneybird.${key}.${administrationId}`;

export const loadCachedList = async <T,>(key: string) => {
  const cached = await LocalStorage.getItem<string>(key);
  if (!cached) return null;
  try {
    const parsed = JSON.parse(cached) as CachedList<T>;
    return Array.isArray(parsed.items) ? parsed.items : null;
  } catch (error) {
    console.error("Failed to parse cache", error);
    return null;
  }
};

export const saveCachedList = async <T,>(key: string, items: T[]) => {
  const payload: CachedList<T> = { items, updatedAt: new Date().toISOString() };
  await LocalStorage.setItem(key, JSON.stringify(payload));
};
