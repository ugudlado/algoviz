/**
 * Algoviz progress — single localStorage document (v2).
 * Storage key: `ALGOVIZ_PROGRESS_STORAGE_KEY` (see constant below).
 * Export download: `algoviz-progress.json`
 */
import { LEARNING_PATHS, type LearningPath } from "@/data/learningPaths";
import { ALGORITHM_ROUTE_PATH_SET } from "@/data/algorithmRoutes";

export const ALGOVIZ_PROGRESS_STORAGE_KEY = "algoviz-progress";
/** Legacy HL-152 v1 draft key (step IDs per path) — read once to migrate */
const LEGACY_LEARNING_PATH_PROGRESS_KEY = "algoviz-learning-path-progress";

export const ALGOVIZ_PROGRESS_VERSION = 2;
const ALGOVIZ_PROGRESS_IMPORT_MAX_CHARS = 256_000;
const ALGOVIZ_PROGRESS_MAX_ALGORITHM_KEYS = 500;

export interface AlgorithmProgressEntry {
  completedAt: string;
}

export interface PathMetaRecord {
  lastVisited?: string;
}

export interface AlgovizProgressDocument {
  version: number;
  algorithms: Record<string, AlgorithmProgressEntry>;
  pathMeta?: Record<string, PathMetaRecord>;
}

/** v1 shape (step IDs per learning path slug) */
interface LegacyV1PathRecord {
  completedChapters?: string[];
  completedCases?: string[];
  lastVisited?: string;
}

interface LegacyV1Document {
  version: number;
  paths: Record<string, LegacyV1PathRecord>;
}

function pathListKeyForSlug(
  slug: string,
): "completedChapters" | "completedCases" {
  if (slug === "algorithm-detective") return "completedCases";
  return "completedChapters";
}

function findStepAlgorithmPath(
  path: LearningPath,
  stepId: string,
): string | undefined {
  for (const tier of path.tiers) {
    for (const step of tier.steps) {
      if (step.id === stepId) return step.algorithmPath;
    }
  }
  return undefined;
}

function migrateV1ToV2(v1: LegacyV1Document): AlgovizProgressDocument {
  const algorithms: Record<string, AlgorithmProgressEntry> = {};
  const pathMeta: Record<string, PathMetaRecord> = {};
  const now = new Date().toISOString();

  for (const slug of Object.keys(v1.paths)) {
    const rec = v1.paths[slug];
    const known = LEARNING_PATHS.find((p) => p.slug === slug);
    const key = pathListKeyForSlug(slug);
    const ids = rec[key];
    if (Array.isArray(ids) && known) {
      for (const stepId of ids) {
        if (typeof stepId !== "string") continue;
        const route = findStepAlgorithmPath(known, stepId);
        if (route && ALGORITHM_ROUTE_PATH_SET.has(route)) {
          algorithms[route] = { completedAt: now };
        }
      }
    }
    if (typeof rec.lastVisited === "string" && rec.lastVisited.length >= 10) {
      pathMeta[slug] = { lastVisited: rec.lastVisited };
    }
  }

  return {
    version: ALGOVIZ_PROGRESS_VERSION,
    algorithms,
    pathMeta: Object.keys(pathMeta).length > 0 ? pathMeta : undefined,
  };
}

function isIsoLike(s: string): boolean {
  return s.length >= 10 && !Number.isNaN(Date.parse(s));
}

function isAlgorithmEntry(raw: unknown): boolean {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return false;
  }
  const o = raw as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length === 0) return true;
  if (keys.length === 1 && keys[0] === "completedAt") {
    return typeof o.completedAt === "string" && isIsoLike(o.completedAt);
  }
  return false;
}

export type ValidateResult =
  | { ok: true; value: AlgovizProgressDocument }
  | { ok: false; error: string };

function normalizeAlgorithmEntry(raw: unknown): AlgorithmProgressEntry {
  if (
    raw !== null &&
    typeof raw === "object" &&
    !Array.isArray(raw) &&
    typeof (raw as { completedAt?: unknown }).completedAt === "string" &&
    isIsoLike((raw as { completedAt: string }).completedAt)
  ) {
    return { completedAt: (raw as AlgorithmProgressEntry).completedAt };
  }
  return { completedAt: new Date().toISOString() };
}

/**
 * Validates v2 documents. Every `algorithms` key must be a known app route
 * (see `algorithmRoutes.ts`). Unknown slugs in `pathMeta` are allowed.
 */
export function validateAlgovizProgressDocument(raw: unknown): ValidateResult {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Root must be an object" };
  }
  const root = raw as Record<string, unknown>;
  if (root.version !== ALGOVIZ_PROGRESS_VERSION) {
    return {
      ok: false,
      error: `version must be ${ALGOVIZ_PROGRESS_VERSION}`,
    };
  }
  if (
    root.algorithms === null ||
    typeof root.algorithms !== "object" ||
    Array.isArray(root.algorithms)
  ) {
    return { ok: false, error: "algorithms must be an object" };
  }
  const algRaw = root.algorithms as Record<string, unknown>;
  const keys = Object.keys(algRaw);
  if (keys.length > ALGOVIZ_PROGRESS_MAX_ALGORITHM_KEYS) {
    return { ok: false, error: "Too many algorithm entries" };
  }

  const algorithms: Record<string, AlgorithmProgressEntry> = {};
  for (const route of keys) {
    if (!ALGORITHM_ROUTE_PATH_SET.has(route)) {
      return { ok: false, error: `Unknown algorithm route: ${route}` };
    }
    if (!isAlgorithmEntry(algRaw[route])) {
      return {
        ok: false,
        error: `Invalid entry for ${route} (expected completedAt ISO string)`,
      };
    }
    algorithms[route] = normalizeAlgorithmEntry(algRaw[route]);
  }

  let pathMeta: Record<string, PathMetaRecord> | undefined;
  if (root.pathMeta !== undefined) {
    if (
      root.pathMeta === null ||
      typeof root.pathMeta !== "object" ||
      Array.isArray(root.pathMeta)
    ) {
      return { ok: false, error: "pathMeta must be an object" };
    }
    pathMeta = {};
    const pm = root.pathMeta as Record<string, unknown>;
    for (const slug of Object.keys(pm)) {
      const v = pm[slug];
      if (v === null || typeof v !== "object" || Array.isArray(v)) {
        return { ok: false, error: `pathMeta["${slug}"] must be an object` };
      }
      const o = v as Record<string, unknown>;
      const rec: PathMetaRecord = {};
      if (o.lastVisited !== undefined) {
        if (typeof o.lastVisited !== "string" || !isIsoLike(o.lastVisited)) {
          return {
            ok: false,
            error: `pathMeta["${slug}"].lastVisited must be an ISO date string`,
          };
        }
        rec.lastVisited = o.lastVisited;
      }
      pathMeta[slug] = rec;
    }
    if (Object.keys(pathMeta).length === 0) pathMeta = undefined;
  }

  return {
    ok: true,
    value: {
      version: ALGOVIZ_PROGRESS_VERSION,
      algorithms,
      pathMeta,
    },
  };
}

export function tryMigrateLegacyV1(
  raw: unknown,
): AlgovizProgressDocument | null {
  const v1 = tryParseLegacyV1(raw);
  return v1 ? migrateV1ToV2(v1) : null;
}

function tryParseLegacyV1(raw: unknown): LegacyV1Document | null {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const root = raw as Record<string, unknown>;
  if (root.version !== 1) return null;
  if (
    root.paths === null ||
    typeof root.paths !== "object" ||
    Array.isArray(root.paths)
  ) {
    return null;
  }
  return root as unknown as LegacyV1Document;
}

export function isAlgorithmCompleted(
  doc: AlgovizProgressDocument,
  algorithmPath: string,
): boolean {
  return algorithmPath in doc.algorithms;
}

export function countCompletedStepsOnPath(
  doc: AlgovizProgressDocument,
  path: LearningPath,
): number {
  let n = 0;
  for (const tier of path.tiers) {
    for (const step of tier.steps) {
      if (isAlgorithmCompleted(doc, step.algorithmPath)) n += 1;
    }
  }
  return n;
}

export function setAlgorithmCompletion(
  doc: AlgovizProgressDocument,
  algorithmPath: string,
  completed: boolean,
): AlgovizProgressDocument {
  if (!ALGORITHM_ROUTE_PATH_SET.has(algorithmPath)) return doc;
  const nextAlg = { ...doc.algorithms };
  if (completed) {
    nextAlg[algorithmPath] = {
      completedAt:
        nextAlg[algorithmPath]?.completedAt ?? new Date().toISOString(),
    };
  } else {
    delete nextAlg[algorithmPath];
  }
  return { ...doc, algorithms: nextAlg };
}

export function touchPathMeta(
  doc: AlgovizProgressDocument,
  pathSlug: string,
): AlgovizProgressDocument {
  const pathMeta = { ...doc.pathMeta };
  pathMeta[pathSlug] = {
    ...pathMeta[pathSlug],
    lastVisited: new Date().toISOString(),
  };
  return { ...doc, pathMeta };
}

/** Spec option A: clear only path metadata, not global algorithm completion */
export function clearPathMetaOnly(
  doc: AlgovizProgressDocument,
  pathSlug: string,
): AlgovizProgressDocument {
  if (!doc.pathMeta?.[pathSlug]) return doc;
  const pathMeta = { ...doc.pathMeta };
  delete pathMeta[pathSlug];
  return {
    ...doc,
    pathMeta: Object.keys(pathMeta).length > 0 ? pathMeta : undefined,
  };
}

export function createEmptyDocument(): AlgovizProgressDocument {
  return {
    version: ALGOVIZ_PROGRESS_VERSION,
    algorithms: {},
  };
}

export function documentToJsonBlob(doc: AlgovizProgressDocument): Blob {
  return new Blob([JSON.stringify(doc, null, 2)], {
    type: "application/json",
  });
}

function parseAndNormalizeStored(json: string): AlgovizProgressDocument {
  const parsed: unknown = JSON.parse(json);
  const v2 = validateAlgovizProgressDocument(parsed);
  if (v2.ok) return v2.value;

  const migrated = tryMigrateLegacyV1(parsed);
  if (migrated) return migrated;

  return createEmptyDocument();
}

export function loadFromLocalStorage(): AlgovizProgressDocument {
  if (typeof localStorage === "undefined") return createEmptyDocument();
  try {
    const primary = localStorage.getItem(ALGOVIZ_PROGRESS_STORAGE_KEY);
    if (primary) {
      return parseAndNormalizeStored(primary);
    }
    const legacy = localStorage.getItem(LEGACY_LEARNING_PATH_PROGRESS_KEY);
    if (legacy) {
      const doc = parseAndNormalizeStored(legacy);
      saveToLocalStorage(doc);
      localStorage.removeItem(LEGACY_LEARNING_PATH_PROGRESS_KEY);
      return doc;
    }
  } catch {
    return createEmptyDocument();
  }
  return createEmptyDocument();
}

export function saveToLocalStorage(doc: AlgovizProgressDocument): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(ALGOVIZ_PROGRESS_STORAGE_KEY, JSON.stringify(doc));
}

export function parseImportedProgress(jsonText: string): ValidateResult {
  if (jsonText.length > ALGOVIZ_PROGRESS_IMPORT_MAX_CHARS) {
    return { ok: false, error: "File is too large" };
  }
  try {
    const parsed: unknown = JSON.parse(jsonText);
    return validateAlgovizProgressDocument(parsed);
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }
}
