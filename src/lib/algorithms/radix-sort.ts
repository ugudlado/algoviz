// @ts-ignore
import RadixSortAlgorithmModule from "./radix-sort-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RadixSortAlgorithm: any = RadixSortAlgorithmModule;

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

export function generateSteps(arr: number[]): RadixSortResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return RadixSortAlgorithm.sort(arr) as RadixSortResult;
}
