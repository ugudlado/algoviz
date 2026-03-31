import BubbleSortAlgorithmModule from "./bubble-sort-algorithm";
import type { SortAlgorithmModule } from "./module-types";

export interface BubbleSortStep {
  arr: number[];
  comparing: [number, number];
  swapped: boolean;
  sortedBoundary: number;
  comparisons: number;
  swaps: number;
  explanation: string;
  i: number;
  j: number;
  codeLine: number;
}

interface BubbleSortResult {
  steps: BubbleSortStep[];
  sortedArray: number[];
}

const BubbleSortAlgorithm = BubbleSortAlgorithmModule as SortAlgorithmModule<
  [number[]],
  BubbleSortResult
>;

export const generateSteps = (arr: number[]): BubbleSortResult => {
  return BubbleSortAlgorithm.sort(arr);
};
