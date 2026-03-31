// @ts-ignore
import BinarySearchAlgorithmModule from "./binary-search-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BinarySearchAlgorithm: any = BinarySearchAlgorithmModule;

export interface BinarySearchStep {
  arr: number[];
  low: number;
  mid: number;
  high: number;
  target: number;
  comparison: string;
  found: boolean;
  eliminated: string;
  step: number;
  explanation: string;
}

interface BinarySearchResult {
  steps: BinarySearchStep[];
  found: boolean;
  foundIndex: number;
}

export function search(arr: number[], target: number): BinarySearchResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return BinarySearchAlgorithm.search(arr, target) as BinarySearchResult;
}
