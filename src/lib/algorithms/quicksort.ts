// @ts-ignore
import QuickSortAlgorithmModule from './quicksort-algorithm.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const QuickSortAlgorithm: any = QuickSortAlgorithmModule

export interface QuickSortStep {
  type: 'partition' | 'compare' | 'swap' | 'pivot' | 'complete'
  array: number[]
  low: number
  high: number
  pivotIndex: number
  i?: number
  j?: number
  comparisons: number
  swaps: number
  explanation: string
}

export interface QuickSortResult {
  sortedArray: number[]
  steps: QuickSortStep[]
}

export function generateSteps(
  arr: number[],
  partitionScheme: string = 'lomuto',
  pivotStrategy: string = 'last'
): QuickSortResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return QuickSortAlgorithm.quickSort(
    arr,
    partitionScheme,
    pivotStrategy
  ) as QuickSortResult
}
