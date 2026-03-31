// @ts-ignore
import SlidingWindowAlgorithmModule from "./sliding-window-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SlidingWindowAlgorithm: any = SlidingWindowAlgorithmModule;

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

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const MAX_ARRAY_SIZE: number = SlidingWindowAlgorithm.MAX_ARRAY_SIZE;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const MAX_STRING_LENGTH: number =
  SlidingWindowAlgorithm.MAX_STRING_LENGTH;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const maxSumFixedWindow: (
  arr: number[],
  k: number,
) => { maxSum: number; windowStart: number; steps: FixedWindowStep[] } =
  SlidingWindowAlgorithm.maxSumFixedWindow;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const longestUniqueSubstring: (s: string) => {
  longest: string;
  start: number;
  length: number;
  steps: UniqueSubstringStep[];
} = SlidingWindowAlgorithm.longestUniqueSubstring;
