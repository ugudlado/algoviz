// @ts-ignore
import BTreeAlgorithmModule from "./btree-algorithm.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BTreeAlgorithm: any = BTreeAlgorithmModule;

export interface BTreeNode {
  keys: number[];
  children: BTreeNode[];
  leaf: boolean;
}

export interface BTreeStep {
  type: string;
  root: BTreeNode | null;
  message: string;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const keyCount: (root: BTreeNode | null) => number =
  BTreeAlgorithm.keyCount;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const insertKey: (
  root: BTreeNode | null,
  key: number,
  t: number,
  steps?: BTreeStep[],
) => { root: BTreeNode | null; steps: BTreeStep[]; error?: boolean } =
  BTreeAlgorithm.insertKey;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const deleteKey: (
  root: BTreeNode | null,
  key: number,
  t: number,
  steps?: BTreeStep[],
) => { root: BTreeNode | null; steps: BTreeStep[]; error?: boolean } =
  BTreeAlgorithm.deleteKey;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const bulkInsert: (
  keys: number[],
  t: number,
) => { root: BTreeNode | null; steps: BTreeStep[] } = BTreeAlgorithm.bulkInsert;
