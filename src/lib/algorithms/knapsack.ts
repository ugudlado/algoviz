// @ts-ignore
import KnapsackAlgorithmModule from "./knapsack-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const KnapsackAlgorithm: any = KnapsackAlgorithmModule;

export interface KnapsackItem {
  weight: number;
  value: number;
  name?: string;
}

export interface KnapsackStep {
  row: number;
  col: number;
  value: number;
  take: boolean;
  explanation: string;
}

export interface KnapsackTraceback {
  selectedItems: number[];
  totalValue: number;
  totalWeight: number;
  path: Array<{ row: number; col: number }>;
}

export interface KnapsackResult {
  dp: number[][];
  steps: KnapsackStep[];
  traceback: KnapsackTraceback;
}

export function solve(items: KnapsackItem[], capacity: number): KnapsackResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return KnapsackAlgorithm.solve(items, capacity) as KnapsackResult;
}
