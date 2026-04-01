import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getTotalSteps, type LearningPath } from "@/data/learningPaths";
import {
  ALGOVIZ_PROGRESS_STORAGE_KEY,
  clearPathMetaOnly,
  countCompletedStepsOnPath,
  createEmptyDocument,
  documentToJsonBlob,
  isAlgorithmCompleted,
  loadFromLocalStorage,
  parseImportedProgress,
  saveToLocalStorage,
  setAlgorithmCompletion,
  touchPathMeta,
  validateAlgovizProgressDocument,
  type AlgovizProgressDocument,
} from "@/lib/algovizProgress";

export interface PathProgressStats {
  completed: number;
  total: number;
  pct: number;
}

interface AlgovizProgressContextValue {
  document: AlgovizProgressDocument;
  isAlgorithmComplete: (algorithmPath: string) => boolean;
  toggleAlgorithmComplete: (algorithmPath: string) => void;
  getPathStats: (path: LearningPath) => PathProgressStats;
  recordPathVisit: (pathSlug: string) => void;
  clearPathMetaForSlug: (pathSlug: string) => void;
  clearAllProgress: () => void;
  exportProgressJson: () => void;
  importProgressJson: (
    text: string,
  ) => { ok: true } | { ok: false; error: string };
  importError: string | null;
  setImportError: (msg: string | null) => void;
}

const AlgovizProgressContext =
  createContext<AlgovizProgressContextValue | null>(null);

export function AlgovizProgressProvider({ children }: { children: ReactNode }) {
  const [document, setDocument] = useState(loadFromLocalStorage);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    saveToLocalStorage(document);
  }, [document]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== ALGOVIZ_PROGRESS_STORAGE_KEY || e.newValue == null) {
        return;
      }
      try {
        const parsed: unknown = JSON.parse(e.newValue);
        const v = validateAlgovizProgressDocument(parsed);
        if (v.ok) setDocument(v.value);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const isAlgorithmComplete = useCallback(
    (algorithmPath: string) => isAlgorithmCompleted(document, algorithmPath),
    [document],
  );

  const toggleAlgorithmComplete = useCallback((algorithmPath: string) => {
    setDocument((d) => {
      const done = isAlgorithmCompleted(d, algorithmPath);
      return setAlgorithmCompletion(d, algorithmPath, !done);
    });
  }, []);

  const getPathStats = useCallback(
    (path: LearningPath): PathProgressStats => {
      const total = getTotalSteps(path);
      const completed = countCompletedStepsOnPath(document, path);
      const pct =
        total === 0 ? 0 : Math.min(100, Math.round((completed / total) * 100));
      return { completed, total, pct };
    },
    [document],
  );

  const recordPathVisit = useCallback((pathSlug: string) => {
    setDocument((d) => touchPathMeta(d, pathSlug));
  }, []);

  const clearPathMetaForSlug = useCallback((pathSlug: string) => {
    setDocument((d) => clearPathMetaOnly(d, pathSlug));
  }, []);

  const clearAllProgress = useCallback(() => {
    setDocument(createEmptyDocument());
  }, []);

  const exportProgressJson = useCallback(() => {
    const blob = documentToJsonBlob(document);
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = "algoviz-progress.json";
    a.rel = "noopener";
    a.click();
    URL.revokeObjectURL(url);
  }, [document]);

  const importProgressJson = useCallback(
    (text: string): { ok: true } | { ok: false; error: string } => {
      const r = parseImportedProgress(text);
      if (!r.ok) return r;
      setDocument(r.value);
      setImportError(null);
      return { ok: true };
    },
    [],
  );

  const value = useMemo(
    () => ({
      document,
      isAlgorithmComplete,
      toggleAlgorithmComplete,
      getPathStats,
      recordPathVisit,
      clearPathMetaForSlug,
      clearAllProgress,
      exportProgressJson,
      importProgressJson,
      importError,
      setImportError,
    }),
    [
      document,
      isAlgorithmComplete,
      toggleAlgorithmComplete,
      getPathStats,
      recordPathVisit,
      clearPathMetaForSlug,
      clearAllProgress,
      exportProgressJson,
      importProgressJson,
      importError,
    ],
  );

  return (
    <AlgovizProgressContext.Provider value={value}>
      {children}
    </AlgovizProgressContext.Provider>
  );
}

export function useAlgovizProgress(): AlgovizProgressContextValue {
  const ctx = useContext(AlgovizProgressContext);
  if (!ctx) {
    throw new Error(
      "useAlgovizProgress must be used within AlgovizProgressProvider",
    );
  }
  return ctx;
}
