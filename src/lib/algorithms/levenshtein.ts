// @ts-ignore
import LevenshteinModule from "./levenshtein-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LevenshteinAlgorithm: any = LevenshteinModule;

export interface LevenshteinResult {
  dp: number[][];
  ops: string[][];
  traceback: Array<{ i: number; j: number }>;
  distance: number;
}

export function levenshteinCompute(
  source: string,
  target: string,
): LevenshteinResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return LevenshteinAlgorithm.levenshteinCompute(
    source,
    target,
  ) as LevenshteinResult;
}

export function tracebackDescription(
  source: string,
  target: string,
  traceback: Array<{ i: number; j: number }>,
  ops: string[][],
): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return LevenshteinAlgorithm.tracebackDescription(
    source,
    target,
    traceback,
    ops,
  ) as string;
}
