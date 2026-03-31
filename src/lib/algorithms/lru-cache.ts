// @ts-ignore
import LRUCacheAlgorithmModule from "./lru-cache-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LRUCacheAlgorithm: any = LRUCacheAlgorithmModule;

export interface LRUNode {
  key: string | number;
  value: number;
  prev: LRUNode | null;
  next: LRUNode | null;
}

export interface LRUCache {
  capacity: number;
  size: number;
  head: LRUNode | null;
  tail: LRUNode | null;
  map: Record<string | number, LRUNode>;
}

export interface LRUMapEntry {
  key: string | number;
  value: number;
}

export interface LRUStep {
  type: "put" | "get";
  key: string | number;
  value: number;
  action: "insert" | "update" | "hit" | "miss" | "evict";
  evicted: string | number | null;
  hit: boolean | null;
  order: Array<{ key: string | number; value: number }>;
  mapSnapshot: LRUMapEntry[];
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const createCache: (capacity: number) => LRUCache =
  LRUCacheAlgorithm.createCache;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const putWithSteps: (
  cache: LRUCache,
  key: string | number,
  value: number,
  steps: LRUStep[],
) => void = LRUCacheAlgorithm.putWithSteps;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const getWithSteps: (
  cache: LRUCache,
  key: string | number,
  steps: LRUStep[],
) => void = LRUCacheAlgorithm.getWithSteps;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const getBrowserCachePreset: () => Array<{
  op: string;
  key: string | number;
  value?: number;
}> = LRUCacheAlgorithm.getBrowserCachePreset;
