/**
 * MMKV 기반 스토리지 래퍼
 * 네이티브 모듈 로드 실패 시 인메모리 폴백 (개발 환경용)
 */

interface StorageAdapter {
  getString(key: string): string | undefined;
  set(key: string, value: string): void;
  delete(key: string): void;
}

// 인메모리 폴백 (타입체크/웹 환경용)
class InMemoryStorage implements StorageAdapter {
  private data = new Map<string, string>();
  getString(key: string) {
    return this.data.get(key);
  }
  set(key: string, value: string) {
    this.data.set(key, value);
  }
  delete(key: string) {
    this.data.delete(key);
  }
}

function createStorage(id: string): StorageAdapter {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MMKV } = require('react-native-mmkv') as {
      MMKV: new (opts: { id: string }) => StorageAdapter;
    };
    return new MMKV({ id });
  } catch {
    console.warn(`[Storage] MMKV 로드 실패 (id: ${id}), 인메모리 폴백 사용`);
    return new InMemoryStorage();
  }
}

export const appStorage = createStorage('app-storage');
export const cardStorage = createStorage('flashcards');
export const authStorage = createStorage('supabase-storage');

// Supabase auth용 어댑터
export const supabaseStorageAdapter = {
  getItem: (key: string) => authStorage.getString(key) ?? null,
  setItem: (key: string, value: string) => authStorage.set(key, value),
  removeItem: (key: string) => authStorage.delete(key),
};
