// @ts-ignore
import BloomFilterAlgorithmModule from "./bloom-filter-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BloomFilterAlgorithm: any = BloomFilterAlgorithmModule;

export interface BloomFilter {
  bits: number[];
  m: number;
  k: number;
  n: number;
  insertedWords: Record<string, boolean>;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const createFilter: (m: number, k: number) => BloomFilter =
  BloomFilterAlgorithm.createFilter;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const insert: (
  filter: BloomFilter,
  word: string,
) => { indices: number[]; alreadyPresent: boolean } =
  BloomFilterAlgorithm.insert;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const query: (
  filter: BloomFilter,
  word: string,
) => {
  indices: number[];
  allBitsSet: boolean;
  isKnownInserted: boolean;
  result: "definite-no" | "probable-yes" | "definite-yes";
} = BloomFilterAlgorithm.query;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const getFalsePositiveRate: (filter: BloomFilter) => number =
  BloomFilterAlgorithm.getFalsePositiveRate;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const getFillLevel: (filter: BloomFilter) => number =
  BloomFilterAlgorithm.getFillLevel;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const getPasswordPreset: () => string[] =
  BloomFilterAlgorithm.getPasswordPreset;
