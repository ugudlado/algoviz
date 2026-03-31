// @ts-ignore
import KMPAlgorithmModule from "./kmp-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KMPAlgorithm: any = KMPAlgorithmModule;

export interface KmpStep {
  textIdx: number;
  patternIdx: number;
  isMatch: boolean;
  isFound: boolean;
  shift: boolean;
  shiftFrom: number;
  shiftTo: number;
  explanation: string;
}

export interface KmpResult {
  matches: number[];
  steps: KmpStep[];
  failureFunction: number[];
  stepCount: number;
}

interface NaiveResult {
  matches: number[];
  stepCount: number;
}

export function kmpSearch(text: string, pattern: string): KmpResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return KMPAlgorithm.kmpSearch(text, pattern) as KmpResult;
}

export function naiveSearch(text: string, pattern: string): NaiveResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return KMPAlgorithm.naiveSearch(text, pattern) as NaiveResult;
}
