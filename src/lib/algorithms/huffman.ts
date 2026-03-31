// @ts-ignore
import HuffmanAlgorithmModule from "./huffman-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HuffmanAlgorithm: any = HuffmanAlgorithmModule;

export interface HuffmanNode {
  char: string | null;
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
  id: number;
}

export interface HuffmanMerged {
  left: HuffmanNode;
  right: HuffmanNode;
  parent: HuffmanNode;
}

export interface HuffmanSnapshot {
  step: number;
  phase: string;
  queue: HuffmanNode[];
  tree: HuffmanNode | null;
  merged: HuffmanMerged | null;
  action: string;
  detail: string;
}

export interface HuffmanSnapshotsResult {
  snapshots: HuffmanSnapshot[];
  tree: HuffmanNode | null;
  freqTable: Record<string, number>;
  encodingTable: Record<string, string>;
  encoded: string;
  decoded: string;
}

export function getSnapshots(text: string): HuffmanSnapshotsResult {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return HuffmanAlgorithm.getSnapshots(text) as HuffmanSnapshotsResult;
}
