// @ts-nocheck
import ScanAlgorithmModule from "./scan-algorithm";
interface ScanStep {
  position: number;
  target: number;
  direction: string;
  action: string;
  distanceSoFar: number;
}

type ScanAlgorithmModuleType = {
  solve: (
    requests: number[],
    startPosition: number,
    direction: "up" | "down",
  ) => {
    order: number[];
    distances: number[];
    totalDistance: number;
    steps: ScanStep[];
  };
};

const ScanAlgorithm = ScanAlgorithmModule as ScanAlgorithmModuleType;

export const solve: (
  requests: number[],
  startPosition: number,
  direction: "up" | "down",
) => {
  order: number[];
  distances: number[];
  totalDistance: number;
  steps: ScanStep[];
} = ScanAlgorithm.solve;
