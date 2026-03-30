// @ts-ignore
import BubbleSortAlgorithmModule from './bubble-sort-algorithm.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BubbleSortAlgorithm: any = BubbleSortAlgorithmModule

export interface BubbleSortStep {
  arr: number[]
  comparing: [number, number]
  swapped: boolean
  sortedBoundary: number
  comparisons: number
  swaps: number
  explanation: string
  i: number
  j: number
  codeLine: number
}

export interface BubbleSortResult {
  steps: BubbleSortStep[]
  sortedArray: number[]
}

export function generateSteps(arr: number[]): BubbleSortResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return BubbleSortAlgorithm.sort(arr) as BubbleSortResult
}
