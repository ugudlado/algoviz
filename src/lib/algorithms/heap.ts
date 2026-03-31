// @ts-ignore
import HeapAlgorithmModule from "./heap-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HeapAlgorithm: any = HeapAlgorithmModule;

export interface Heap {
  data: number[];
}

export type HeapStepType =
  | "insert"
  | "sift-up"
  | "sift-down"
  | "swap"
  | "extract"
  | "heapify";

export interface HeapStep {
  type: HeapStepType;
  heap: number[];
  activeIdx: number;
  parentIdx?: number;
  swapped?: boolean;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const MAX_SIZE: number = HeapAlgorithm.MAX_SIZE;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const createHeap: () => Heap = HeapAlgorithm.createHeap;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const insert: (
  heap: Heap,
  value: number,
) => { steps: HeapStep[]; extracted?: number } = HeapAlgorithm.insert;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const extractMin: (heap: Heap) => {
  steps: HeapStep[];
  extracted?: number;
} = HeapAlgorithm.extractMin;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const peek: (heap: Heap) => number | null = HeapAlgorithm.peek;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const buildHeap: (arr: number[]) => { steps: HeapStep[] } =
  HeapAlgorithm.buildHeap;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const size: (heap: Heap) => number = HeapAlgorithm.size;
