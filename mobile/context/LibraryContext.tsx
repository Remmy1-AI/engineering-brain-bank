import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { mockDownloadsForUser, type DownloadRecord } from '@/data/mockCatalog';
import { useAuth } from '@/context/AuthContext';

const STORAGE_KEY = 'brainbank.library.downloads';

type LibraryContextValue = {
  downloads: DownloadRecord[];
  isDownloaded: (materialId: string) => boolean;
  addDownload: (materialId: string) => Promise<void>;
  removeDownload: (materialId: string) => Promise<void>;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, user } = useAuth();
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSignedIn) {
        setDownloads([]);
        return;
      }
      try {
        const raw = await AsyncStorage.getItem(`${STORAGE_KEY}.${user?.id ?? 'anon'}`);
        if (cancelled) return;
        if (raw) {
          setDownloads(JSON.parse(raw) as DownloadRecord[]);
        } else {
          // Seed mock shelf for signed-in demos
          setDownloads(mockDownloadsForUser);
          await AsyncStorage.setItem(
            `${STORAGE_KEY}.${user?.id}`,
            JSON.stringify(mockDownloadsForUser)
          );
        }
      } catch {
        setDownloads(mockDownloadsForUser);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, user?.id]);

  const persist = useCallback(
    async (next: DownloadRecord[]) => {
      setDownloads(next);
      if (user?.id) {
        await AsyncStorage.setItem(`${STORAGE_KEY}.${user.id}`, JSON.stringify(next));
      }
    },
    [user?.id]
  );

  const isDownloaded = useCallback(
    (materialId: string) => downloads.some((d) => d.materialId === materialId),
    [downloads]
  );

  const addDownload = useCallback(
    async (materialId: string) => {
      if (isDownloaded(materialId)) return;
      const next = [
        { materialId, savedAt: new Date().toISOString() },
        ...downloads,
      ];
      await persist(next);
    },
    [downloads, isDownloaded, persist]
  );

  const removeDownload = useCallback(
    async (materialId: string) => {
      await persist(downloads.filter((d) => d.materialId !== materialId));
    },
    [downloads, persist]
  );

  const value = useMemo(
    () => ({ downloads, isDownloaded, addDownload, removeDownload }),
    [downloads, isDownloaded, addDownload, removeDownload]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
