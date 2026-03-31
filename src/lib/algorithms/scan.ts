import ScanAlgorithmModule from "./scan-algorithm";
interface ScanStep {
  current: number;
  next: number;
  distance: number;
  cumulativeDistance: number;
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
