// @ts-ignore
import FloydWarshallAlgorithmModule from "./floyd-warshall-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FloydWarshallAlgorithm: any = FloydWarshallAlgorithmModule;

export interface Edge {
  from: number;
  to: number;
  weight: number;
}

export interface FloydWarshallStep {
  k: number;
  i: number;
  j: number;
  oldDist: number;
  newDist: number;
  updated: boolean;
}

export interface FloydWarshallResult {
  dist: number[][];
  pred: (number | null)[][];
  steps: FloydWarshallStep[];
}

export function createAdjacencyMatrix(
  edges: Edge[],
  numVertices: number,
): number[][] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return FloydWarshallAlgorithm.createAdjacencyMatrix(
    edges,
    numVertices,
  ) as number[][];
}

export function runFloydWarshall(
  adjacencyMatrix: number[][],
): FloydWarshallResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return FloydWarshallAlgorithm.floydWarshall(
    adjacencyMatrix,
  ) as FloydWarshallResult;
}

export function reconstructPath(
  pred: (number | null)[][],
  source: number,
  target: number,
): number[] | null {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return FloydWarshallAlgorithm.reconstructPath(pred, source, target) as
    | number[]
    | null;
}
