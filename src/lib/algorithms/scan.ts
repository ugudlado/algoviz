// @ts-ignore
import ScanAlgorithmModule from "./scan-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ScanAlgorithm: any = ScanAlgorithmModule;

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const solve: (
  requests: number[],
  startPosition: number,
  direction: "up" | "down",
) => {
  order: number[];
  distances: number[];
  totalDistance: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  steps: any[];
} = ScanAlgorithm.solve;
