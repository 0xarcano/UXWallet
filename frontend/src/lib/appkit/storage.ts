import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Storage } from '@reown/appkit-react-native';

const APPKIT_PREFIX = '@appkit/';
const WC_PREFIX = 'WALLETCONNECT_';

function isAppKitKey(key: string): boolean {
  return key.startsWith(APPKIT_PREFIX) || key.startsWith(WC_PREFIX);
}

export const appKitStorage: Storage = {
  async getKeys(): Promise<string[]> {
    const allKeys = await AsyncStorage.getAllKeys();
    return allKeys.filter(isAppKitKey);
  },

  async getEntries<T = unknown>(): Promise<[string, T][]> {
    const keys = await this.getKeys();
    const entries: [string, T][] = [];

    for (const key of keys) {
      const value = await this.getItem<T>(key);
      if (value !== undefined) {
        entries.push([key, value]);
      }
    }

    return entries;
  },

  async getItem<T = unknown>(key: string): Promise<T | undefined> {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  },

  async setItem<T = unknown>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};
