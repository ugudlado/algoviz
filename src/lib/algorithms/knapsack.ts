import KnapsackAlgorithmModule from "./knapsack-algorithm";
import type { SolveAlgorithmModule } from "./module-types";

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

type KnapsackAlgorithmModuleType = SolveAlgorithmModule<
  [KnapsackItem[], number],
  KnapsackResult
>;

const KnapsackAlgorithm =
  KnapsackAlgorithmModule as KnapsackAlgorithmModuleType;

export const solve = (
  items: KnapsackItem[],
  capacity: number,
): KnapsackResult => KnapsackAlgorithm.solve(items, capacity);
