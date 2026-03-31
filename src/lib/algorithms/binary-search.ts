import BinarySearchAlgorithmModule from "./binary-search-algorithm";
import type { SearchAlgorithmModule } from "./module-types";

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

const BinarySearchAlgorithm =
  BinarySearchAlgorithmModule as SearchAlgorithmModule<
    [number[], number],
    BinarySearchResult
  >;

export const search = (arr: number[], target: number): BinarySearchResult => {
  return BinarySearchAlgorithm.search(arr, target);
};
