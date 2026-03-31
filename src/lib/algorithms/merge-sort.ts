// @ts-ignore
import MergeSortAlgorithmModule from "./merge-sort-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MergeSortAlgorithm: any = MergeSortAlgorithmModule;

interface MergeSortStep {
  type: "split" | "merge" | "complete";
  array: number[];
  left?: number[];
  right?: number[];
  merged?: number[];
  depth?: number;
  comparisons: number;
  mergeOps: number;
  explanation: string;
}

interface MergeSortResult {
  steps: MergeSortStep[];
  sortedArray: number[];
}

export function generateSteps(arr: number[]): MergeSortResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return MergeSortAlgorithm.sort(arr) as MergeSortResult;
}
