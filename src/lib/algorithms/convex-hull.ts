import ConvexHullAlgorithmModule from "./convex-hull-algorithm";

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

interface ConvexHullResult {
  steps: ConvexHullStep[];
  hull: Point[];
  pivot: Point | null;
  pivotIndex: number;
  sortedPoints: Point[];
  sortedIndices: number[];
}

type ConvexHullAlgorithmModuleType = {
  grahamScan: (points: Point[]) => ConvexHullResult;
};

const ConvexHullAlgorithm =
  ConvexHullAlgorithmModule as ConvexHullAlgorithmModuleType;

export const grahamScan = (points: Point[]): ConvexHullResult =>
  ConvexHullAlgorithm.grahamScan(points);
