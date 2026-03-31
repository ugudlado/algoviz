import HeapAlgorithmModule from "./heap-algorithm";

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

type HeapAlgorithmModuleType = {
  MAX_SIZE: number;
  createHeap: () => Heap;
  insert: (
    heap: Heap,
    value: number,
  ) => { steps: HeapStep[]; extracted?: number };
  extractMin: (heap: Heap) => { steps: HeapStep[]; extracted?: number };
  peek: (heap: Heap) => number | null;
  buildHeap: (arr: number[]) => { steps: HeapStep[] };
  size: (heap: Heap) => number;
};

const HeapAlgorithm = HeapAlgorithmModule as HeapAlgorithmModuleType;

export const MAX_SIZE: number = HeapAlgorithm.MAX_SIZE;
export const createHeap: () => Heap = HeapAlgorithm.createHeap;
export const insert: (
  heap: Heap,
  value: number,
) => { steps: HeapStep[]; extracted?: number } = HeapAlgorithm.insert;
export const extractMin: (heap: Heap) => {
  steps: HeapStep[];
  extracted?: number;
} = HeapAlgorithm.extractMin;
export const peek: (heap: Heap) => number | null = HeapAlgorithm.peek;
export const buildHeap: (arr: number[]) => { steps: HeapStep[] } =
  HeapAlgorithm.buildHeap;
export const size: (heap: Heap) => number = HeapAlgorithm.size;
