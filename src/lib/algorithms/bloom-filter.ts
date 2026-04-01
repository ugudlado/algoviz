// @ts-nocheck
import BloomFilterAlgorithmModule from "./bloom-filter-algorithm";

export interface BloomFilter {
  bits: number[];
  m: number;
  k: number;
  n: number;
  insertedWords: Record<string, boolean>;
}

type BloomFilterAlgorithmModuleType = {
  createFilter: (m: number, k: number) => BloomFilter;
  insert: (
    filter: BloomFilter,
    word: string,
  ) => { indices: number[]; alreadyPresent: boolean };
  query: (
    filter: BloomFilter,
    word: string,
  ) => {
    indices: number[];
    allBitsSet: boolean;
    isKnownInserted: boolean;
    result: "definite-no" | "probable-yes" | "definite-yes";
  };
  getFalsePositiveRate: (filter: BloomFilter) => number;
  getFillLevel: (filter: BloomFilter) => number;
  getPasswordPreset: () => string[];
};

const BloomFilterAlgorithm =
  BloomFilterAlgorithmModule as BloomFilterAlgorithmModuleType;

export const createFilter: (m: number, k: number) => BloomFilter =
  BloomFilterAlgorithm.createFilter;
export const insert: (
  filter: BloomFilter,
  word: string,
) => { indices: number[]; alreadyPresent: boolean } =
  BloomFilterAlgorithm.insert;
export const query: (
  filter: BloomFilter,
  word: string,
) => {
  indices: number[];
  allBitsSet: boolean;
  isKnownInserted: boolean;
  result: "definite-no" | "probable-yes" | "definite-yes";
} = BloomFilterAlgorithm.query;
export const getFalsePositiveRate: (filter: BloomFilter) => number =
  BloomFilterAlgorithm.getFalsePositiveRate;
export const getFillLevel: (filter: BloomFilter) => number =
  BloomFilterAlgorithm.getFillLevel;
export const getPasswordPreset: () => string[] =
  BloomFilterAlgorithm.getPasswordPreset;
