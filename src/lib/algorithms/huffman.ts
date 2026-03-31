import HuffmanAlgorithmModule from "./huffman-algorithm";

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

type HuffmanAlgorithmModuleType = {
  getSnapshots: (text: string) => HuffmanSnapshotsResult;
};

const HuffmanAlgorithm = HuffmanAlgorithmModule as HuffmanAlgorithmModuleType;

export const getSnapshots = (text: string): HuffmanSnapshotsResult =>
  HuffmanAlgorithm.getSnapshots(text);
