import SlidingWindowAlgorithmModule from "./sliding-window-algorithm";

export interface FixedWindowStep {
  left: number;
  right: number;
  sum: number;
  isMax: boolean;
}

export interface UniqueSubstringStep {
  left: number;
  right: number;
  char: string;
  freq: Record<string, number>;
  isLongest: boolean;
  longestStart: number;
  longestLen: number;
}

type SlidingWindowAlgorithmModuleType = {
  MAX_ARRAY_SIZE: number;
  MAX_STRING_LENGTH: number;
  maxSumFixedWindow: (
    arr: number[],
    k: number,
  ) => { maxSum: number; windowStart: number; steps: FixedWindowStep[] };
  longestUniqueSubstring: (s: string) => {
    longest: string;
    start: number;
    length: number;
    steps: UniqueSubstringStep[];
  };
};

const SlidingWindowAlgorithm =
  SlidingWindowAlgorithmModule as SlidingWindowAlgorithmModuleType;

export const MAX_ARRAY_SIZE: number = SlidingWindowAlgorithm.MAX_ARRAY_SIZE;
export const MAX_STRING_LENGTH: number =
  SlidingWindowAlgorithm.MAX_STRING_LENGTH;
export const maxSumFixedWindow: (
  arr: number[],
  k: number,
) => { maxSum: number; windowStart: number; steps: FixedWindowStep[] } =
  SlidingWindowAlgorithm.maxSumFixedWindow;
export const longestUniqueSubstring: (s: string) => {
  longest: string;
  start: number;
  length: number;
  steps: UniqueSubstringStep[];
} = SlidingWindowAlgorithm.longestUniqueSubstring;
