// @ts-ignore
import ConvexHullAlgorithmModule from "./convex-hull-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ConvexHullAlgorithm: any = ConvexHullAlgorithmModule;

export interface Point {
  x: number;
  y: number;
}

export interface ConvexHullStep {
  type: string;
  stack: number[];
  currentPoint: number;
  discarded: number[];
  explanation: string;
  pointsProcessed: number;
  hullSize: number;
}

export interface ConvexHullResult {
  steps: ConvexHullStep[];
  hull: Point[];
  pivot: Point | null;
  pivotIndex: number;
  sortedPoints: Point[];
  sortedIndices: number[];
}

export function grahamScan(points: Point[]): ConvexHullResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return ConvexHullAlgorithm.grahamScan(points) as ConvexHullResult;
}
