import RadixSortAlgorithmModule from "./radix-sort-algorithm";
import type { SortAlgorithmModule } from "./module-types";

export interface RadixSortStep {
  phase: string;
  arr: number[];
  buckets: number[][];
  digitPosition: number;
  highlightIdx: number;
  highlightBucket: number;
  explanation: string;
}

interface RadixSortResult {
  steps: RadixSortStep[];
  sortedArray: number[];
  maxDigits: number;
}

const RadixSortAlgorithm = RadixSortAlgorithmModule as SortAlgorithmModule<
  [number[]],
  RadixSortResult
>;

export const generateSteps = (arr: number[]): RadixSortResult => {
  return RadixSortAlgorithm.sort(arr);
};
