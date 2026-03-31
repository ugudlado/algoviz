import FloydWarshallAlgorithmModule from "./floyd-warshall-algorithm";

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

type FloydWarshallAlgorithmModuleType = {
  createAdjacencyMatrix: (edges: Edge[], numVertices: number) => number[][];
  floydWarshall: (adjacencyMatrix: number[][]) => FloydWarshallResult;
  reconstructPath: (
    pred: (number | null)[][],
    source: number,
    target: number,
  ) => number[] | null;
};

const FloydWarshallAlgorithm =
  FloydWarshallAlgorithmModule as FloydWarshallAlgorithmModuleType;

export const createAdjacencyMatrix = (
  edges: Edge[],
  numVertices: number,
): number[][] =>
  FloydWarshallAlgorithm.createAdjacencyMatrix(edges, numVertices);

export const runFloydWarshall = (
  adjacencyMatrix: number[][],
): FloydWarshallResult => FloydWarshallAlgorithm.floydWarshall(adjacencyMatrix);

export const reconstructPath = (
  pred: (number | null)[][],
  source: number,
  target: number,
): number[] | null =>
  FloydWarshallAlgorithm.reconstructPath(pred, source, target);
