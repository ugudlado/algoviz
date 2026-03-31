import QuickSortAlgorithmModule from "./quicksort-algorithm";
import type { QuickSortAlgorithmModule as QuickSortModuleType } from "./module-types";

interface QuickSortStep {
  type: "partition" | "compare" | "swap" | "pivot" | "complete";
  array: number[];
  low: number;
  high: number;
  pivotIndex: number;
  i?: number;
  j?: number;
  comparisons: number;
  swaps: number;
  explanation: string;
}

interface QuickSortResult {
  sortedArray: number[];
  steps: QuickSortStep[];
}

const QuickSortAlgorithm =
  QuickSortAlgorithmModule as QuickSortModuleType<QuickSortResult>;

export const generateSteps = (
  arr: number[],
  partitionScheme: string = "lomuto",
  pivotStrategy: string = "last",
): QuickSortResult => {
  return QuickSortAlgorithm.quickSort(arr, partitionScheme, pivotStrategy);
};
