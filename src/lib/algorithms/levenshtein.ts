import LevenshteinModule from "./levenshtein-algorithm";
import type { SolveAlgorithmModule } from "./module-types";

export interface LevenshteinResult {
  dp: number[][];
  ops: string[][];
  traceback: Array<{ i: number; j: number }>;
  distance: number;
}

type LevenshteinAlgorithmModuleType = SolveAlgorithmModule<
  [string, string],
  LevenshteinResult
> & {
  levenshteinCompute: (source: string, target: string) => LevenshteinResult;
  tracebackDescription: (
    source: string,
    target: string,
    traceback: Array<{ i: number; j: number }>,
    ops: string[][],
  ) => string;
};

const LevenshteinAlgorithm =
  LevenshteinModule as LevenshteinAlgorithmModuleType;

export const levenshteinCompute = (
  source: string,
  target: string,
): LevenshteinResult => LevenshteinAlgorithm.levenshteinCompute(source, target);

export const tracebackDescription = (
  source: string,
  target: string,
  traceback: Array<{ i: number; j: number }>,
  ops: string[][],
): string =>
  LevenshteinAlgorithm.tracebackDescription(source, target, traceback, ops);
