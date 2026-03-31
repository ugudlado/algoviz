import KMPAlgorithmModule from "./kmp-algorithm";

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

type KmpAlgorithmModuleType = {
  kmpSearch: (text: string, pattern: string) => KmpResult;
  naiveSearch: (text: string, pattern: string) => NaiveResult;
};

const KMPAlgorithm = KMPAlgorithmModule as KmpAlgorithmModuleType;

export const kmpSearch = (text: string, pattern: string): KmpResult =>
  KMPAlgorithm.kmpSearch(text, pattern);
export const naiveSearch = (text: string, pattern: string): NaiveResult =>
  KMPAlgorithm.naiveSearch(text, pattern);
